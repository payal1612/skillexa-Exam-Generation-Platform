📘 Skillexa – AI Skill Forage & Exam Generator Platform

A modern, AI-powered learning and assessment platform built using React, Tailwind CSS, and a modular component architecture.
SkillForge allows learners to explore AI skills, generate personalized exams, track progress, and earn certificates.
It also includes Admin Panel, Instructor Panel, Analytics, Leaderboard, and Achievements modules.

🚀 Features Overview
🎓 For Learners

Explore AI Skill Library (ML, DL, NLP, CV, Data Science, etc.)

Interactive dashboards with personalized insights

AI-driven exam generation

Detailed exam interface with scoring and performance metrics

View certificates and progress history

Leaderboard ranking system

Achievements and learning badges

🧑‍🏫 For Instructors

Create custom exams

Track student engagement

Manage exam modules

🛡️ For Admin

Manage users with full CRUD

Manage exams, skills, certificates

System alerts & uptime monitoring

Dedicated Admin Panel with analytics and controls

📌 Key Highlights

Fully responsive UI built with Tailwind CSS

Dynamic component navigation (no external routing)

Role-based login system (Admin / Instructor / User)

State persistence using localStorage

Reusable functional components

Smooth UI transitions and modern styling

Mock backend simulation for user roles & authentication

🧠 Tech Stack
Frontend

React (Vite)

Tailwind CSS

Lucide Icons

Context & State Management with Hooks                                                                                                                                                                                    # SkillForge Backend API

## Project Structure

```
server/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── models/          # MongoDB schemas
├── routes/          # API routes
├── utils/           # Utility functions
└── server.js        # Main application file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillforge
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/public/:userId` - Get public profile

### Skills
- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get skill details
- `POST /api/skills` - Create skill (instructor/admin)
- `PUT /api/skills/:id` - Update skill (instructor/admin)
- `DELETE /api/skills/:id` - Delete skill (instructor/admin)

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams` - Create exam (instructor/admin)
- `POST /api/exams/:examId/submit` - Submit exam answers
- `GET /api/exams/:examId/results` - Get exam results
- `GET /api/exams/user/results` - Get all user results

### Certificates
- `GET /api/certificates` - Get user certificates
- `GET /api/certificates/all` - Get all certificates
- `GET /api/certificates/:id` - Get certificate details
- `POST /api/certificates` - Create certificate (instructor/admin)
- `GET /api/certificates/verify/:credentialId` - Verify certificate

### Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user achievements
- `GET /api/achievements/:id` - Get achievement details
- `POST /api/achievements` - Create achievement (admin)
- `POST /api/achievements/:achievementId/unlock` - Unlock achievement
- `PUT /api/achievements/:achievementId/progress` - Update progress

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/rank/:userId` - Get user rank
- `GET /api/leaderboard/skill/:skillId` - Get skill-specific leaderboard
- `GET /api/leaderboard/top-achievers` - Get top achievers

### Analytics
- `GET /api/analytics/user` - Get user analytics
- `GET /api/analytics/progress` - Get progress chart data
- `GET /api/analytics/platform` - Get platform statistics (admin)

## Database Models

- **User** - User accounts with profiles and statistics
- **Skill** - Learning skills and courses
- **Exam** - Exams with questions
- **ExamResult** - User exam submissions and scores
- **Certificate** - User certificates
- **Achievement** - Available achievements
- **UserAchievement** - User achievement progress tracking

## Security Features

- JWT authentication
- Password hashing with bcryptjs
- Role-based authorization
- CORS protection
- Helmet.js for security headers
- Input validation

