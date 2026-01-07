import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I\'m SkillForge AI. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputValue(transcript);
        
        // Auto-send when speech ends with final result
        if (event.results[0].isFinal) {
          setTimeout(() => {
            setIsListening(false);
          }, 500);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      synthesisRef.current?.cancel();
    };
  }, []);

  // Speak text using Text-to-Speech
  const speakText = (text) => {
    if (!voiceEnabled || !synthesisRef.current) return;
    
    // Cancel any ongoing speech
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a natural voice
    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')
    ) || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current.speak(utterance);
  };

  // Toggle voice input
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputValue('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    synthesisRef.current?.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: data.data.message,
        };
        setMessages(prev => [...prev, botResponse]);
        // Speak the bot response
        speakText(data.data.message);
      } else {
        const errorResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Sorry, I encountered an error. Please try again.',
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Sorry, I\'m having trouble connecting. Please make sure the server is running.',
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
  onClick={() => setIsOpen(!isOpen)}
  className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
    isOpen
      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
      : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white hover:shadow-xl'
  }`}
>
  {isOpen ? (
    <X className="w-6 h-6 mx-auto" />
  ) : (
    <MessageSquare className="w-6 h-6 mx-auto" />
  )}
</button>


      {/* Chat Window */}
                {isOpen && (
  <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-purple-200">
    {/* Header */}
    <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Skillexa AI</h3>
          <p className="text-xs text-purple-100">Always here to help</p>
        </div>
      </div>
    </div>
  

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-blue-50/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg group relative ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-blue-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {/* Speak button for bot messages */}
                  {message.type === 'bot' && (
                    <button
                      onClick={() => speakText(message.text)}
                      className="absolute -right-2 -bottom-2 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3 text-blue-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-blue-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-blue-200 p-4 bg-white">
            {/* Voice Controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Voice Input Status */}
                {isListening && (
                  <div className="flex items-center gap-2 text-red-500 text-xs animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Listening...
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-blue-500 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Speaking...
                    <button 
                      onClick={stopSpeaking}
                      className="text-xs text-gray-500 hover:text-red-500 underline"
                    >
                      Stop
                    </button>
                  </div>
                )}
              </div>
              
              {/* Voice Toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-lg transition-colors ${
                  voiceEnabled 
                    ? 'text-blue-600 hover:bg-blue-50' 
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
                title={voiceEnabled ? 'Voice output enabled' : 'Voice output disabled'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex gap-2">
              {/* Mic Button */}
              <button
                onClick={toggleListening}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening... speak now" : "Ask me anything..."}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                  isListening ? 'border-red-300 bg-red-50' : 'border-blue-200'
                }`}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
