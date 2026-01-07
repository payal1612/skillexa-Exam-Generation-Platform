import { z } from 'zod';
import { openai } from '../utils/openaiClient.js';
import { logger } from '../utils/logger.js';

const requestSchema = z
  .object({
    subject: z.string().trim().min(2),
    topics: z.array(z.string().trim().min(2)).min(1),
    difficulty: z.enum(['easy', 'medium', 'hard', 'novice', 'intermediate', 'expert', 'master']),
    totalQuestions: z.number().int().min(1).max(50),
    mcqCount: z.number().int().min(0),
    msqCount: z.number().int().min(0),
    durationMinutes: z.number().int().min(1).max(300),
    negativeMarking: z.boolean(),
  })
  .refine(
    (data) => data.mcqCount + data.msqCount === data.totalQuestions,
    {
      path: ['mcqCount'],
      message: 'mcqCount + msqCount must equal totalQuestions',
    }
  );

const questionSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(['MCQ', 'MSQ']),
  question: z.string().trim().min(5),
  options: z.array(z.string().trim().min(1)).length(4),
  correctAnswers: z.array(z.string().trim().min(1)),
  marks: z.number().int().min(1),
});

const responseSchema = z.object({
  examMeta: z.object({
    subject: z.string().trim().min(1),
    difficulty: z.string().trim().min(1),
    durationMinutes: z.number().int().min(1),
    totalQuestions: z.number().int().min(1),
    mcqCount: z.number().int().min(0),
    msqCount: z.number().int().min(0),
  }),
  questions: z.array(questionSchema).min(1),
});

const systemPrompt = `You are a professional exam paper generator.
Generate high-quality MCQ and MSQ questions only.
Follow educational standards.
Return VALID JSON ONLY matching this exact structure:
{
  "examMeta": {
    "subject": "string",
    "difficulty": "string",
    "durationMinutes": number,
    "totalQuestions": number,
    "mcqCount": number,
    "msqCount": number
  },
  "questions": [
    {
      "id": number (sequential starting at 1),
      "type": "MCQ" or "MSQ",
      "question": "string",
      "options": ["A", "B", "C", "D"] (exactly 4 options),
      "correctAnswers": ["A"] (single for MCQ, multiple for MSQ),
      "marks": number
    }
  ]
}
Do NOT include explanations, hints, or markdown.`;

const buildUserPrompt = (body) =>
  `Generate an exam with the following configuration:
Subject: ${body.subject}
Topics: ${body.topics.join(', ')}
Difficulty: ${body.difficulty}
Duration: ${body.durationMinutes} minutes
Negative Marking: ${body.negativeMarking}

IMPORTANT: Generate EXACTLY ${body.totalQuestions} questions total.
- MCQ (single correct answer): ${body.mcqCount} questions
- MSQ (multiple correct answers): ${body.msqCount} questions

Each question must have exactly 4 options labeled as full text answers (not A, B, C, D).
For MCQ: correctAnswers should have exactly 1 answer matching one of the options.
For MSQ: correctAnswers should have 2 or more answers matching options.
Question IDs must be sequential starting from 1.`;

const validateQuestions = (parsed, config) => {
  const { questions, examMeta } = parsed;

  // Accept if AI returns at least the requested number, trim excess
  if (questions.length < config.totalQuestions) {
    throw new Error(`Question count mismatch: got ${questions.length}, expected ${config.totalQuestions}`);
  }
  
  // Trim to exact count if AI generated more
  const trimmedQuestions = questions.slice(0, config.totalQuestions);

  // Re-number IDs sequentially
  trimmedQuestions.forEach((q, idx) => {
    q.id = idx + 1;
  });

  // Count MCQ / MSQ
  let mcq = 0;
  let msq = 0;

  trimmedQuestions.forEach((q) => {
    if (q.type === 'MCQ') {
      mcq += 1;
      // Fix: ensure MCQ has exactly one correct answer
      if (q.correctAnswers.length > 1) {
        q.correctAnswers = [q.correctAnswers[0]];
      }
    }

    if (q.type === 'MSQ') {
      msq += 1;
      // MSQ should have at least 2 correct answers
      if (q.correctAnswers.length < 2) {
        // Convert to MCQ if only 1 answer
        q.type = 'MCQ';
        mcq += 1;
        msq -= 1;
      }
    }
  });

  // Update parsed with trimmed questions
  parsed.questions = trimmedQuestions;

  // Mirror meta back to request
  parsed.examMeta.totalQuestions = config.totalQuestions;
  parsed.examMeta.mcqCount = mcq;
  parsed.examMeta.msqCount = msq;
  parsed.examMeta.difficulty = config.difficulty;
  parsed.examMeta.subject = config.subject;
  parsed.examMeta.durationMinutes = config.durationMinutes;

  return parsed;
};

export const generateExamAi = async (req, res) => {
  const parseResult = requestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parseResult.error.flatten(),
    });
  }

  const payload = parseResult.data;
  const userPrompt = buildUserPrompt(payload);

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const raw = completion?.choices?.[0]?.message?.content;
      if (!raw) {
        throw new Error('Empty response from OpenAI');
      }

      let parsed;
      try {
        parsed = responseSchema.parse(JSON.parse(raw));
      } catch (err) {
        throw new Error(`Invalid JSON shape: ${err.message}`);
      }

      try {
        const validated = validateQuestions(parsed, payload);
        return res.status(200).json({ success: true, exam: validated });
      } catch (err) {
        logger.warn(`Validation attempt ${attempts} failed: ${err.message}`);
        if (attempts >= maxAttempts) {
          throw err;
        }
      }
    } catch (error) {
      const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded';
      const isTimeout = error?.code === 'ETIMEDOUT';

      logger.error(`OpenAI generation failed (attempt ${attempts}): ${error.message}`);

      if (attempts >= maxAttempts) {
        const status = error?.status === 400 ? 400 : 500;
        return res.status(status).json({
          success: false,
          message: isRateLimit
            ? 'Upstream rate limit reached, please retry shortly.'
            : isTimeout
            ? 'OpenAI timeout, please retry.'
            : 'Failed to generate exam.',
        });
      }
    }
  }

  return res.status(500).json({ success: false, message: 'Failed to generate exam.' });
};
