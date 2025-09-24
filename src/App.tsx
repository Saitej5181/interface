import React, { useState, useRef, useEffect } from "react";
// @ts-ignore
// @ts-ignore
import { ChevronLeft, Check, MessageCircle, Mic, MicOff, Send, GraduationCap, DollarSign, Calendar, FileText, Users, BookOpen, Clock } from "lucide-react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

type Message = {
  id: number;
  type: 'bot' | 'user';
  content: string;
  timestamp: string;
};

type SpeechRecognitionType = typeof window extends { webkitSpeechRecognition: infer T } ? T : any;

export default function App() {
  // Language options
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'Telugu' },
    { code: 'hi', label: 'Hindi' },
    { code: 'raj', label: 'Rajasthani' },
  ];
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: 'Hi there! 👋 Welcome to CampusHelp, your personal student assistant.',
      timestamp: '20:37'
    },
    {
      id: 2,
      type: 'bot',
      content: 'I can help you with fees, attendance, grades, course schedules, and much more. How can I assist you today?',
      timestamp: '20:37'
    }
  ]);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis as SpeechSynthesis;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      if (recognitionRef.current && typeof recognitionRef.current.stop === 'function') {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current && typeof recognitionRef.current.start === 'function') {
        recognitionRef.current.start();
      }
      setIsListening(true);
    }
  };

  const speakMessage = (text: string) => {
    if (!synthesisRef.current) return;

    // Cancel any ongoing speech
    if (synthesisRef.current && typeof synthesisRef.current.cancel === 'function') {
      synthesisRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    if (synthesisRef.current && typeof synthesisRef.current.speak === 'function') {
      synthesisRef.current.speak(utterance);
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };

  setMessages((prev: any) => [...prev, userMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      };
  setMessages((prev: any) => [...prev, botMessage]);
      
      // Speak the bot response
      speakMessage(botResponse);
    }, 1000);

    setInputValue('');
  };

  const getBotResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('fee') || lowerInput.includes('payment')) {
      return 'Your current semester fee is $2,500. The due date is January 31st. You can pay online through the student portal or at the finance office.';
    } else if (lowerInput.includes('attendance')) {
      return 'Your current attendance is 85%. You need at least 75% to be eligible for exams. You have 3 unexcused absences this semester.';
    } else if (lowerInput.includes('grade') || lowerInput.includes('result')) {
      return 'Your current GPA is 3.7. Last semester results: Mathematics A-, Physics B+, Chemistry A, English B+. Results for pending assignments will be available next week.';
    } else if (lowerInput.includes('schedule') || lowerInput.includes('timetable')) {
      return 'Tomorrow you have: 9:00 AM - Mathematics (Room 101), 11:00 AM - Physics Lab (Lab 2), 2:00 PM - Chemistry (Room 205). No classes on Friday.';
    } else if (lowerInput.includes('exam')) {
      return 'Upcoming exams: Mathematics - March 15th, Physics - March 18th, Chemistry - March 22nd. Exam hall assignments will be posted next week.';
    } else if (lowerInput.includes('library')) {
      return 'Library hours: Monday-Friday 8:00 AM - 10:00 PM, Saturday 9:00 AM - 6:00 PM. You have 2 books due next week. No outstanding fines.';
    } else {
      return 'I can help you with fees, attendance, grades, schedules, exams, and library information. Could you please be more specific about what you need help with?';
    }
  };

  const quickActions = [
    { icon: DollarSign, text: 'Check Fees 💰', query: 'What are my current fees?' },
    { icon: Calendar, text: 'Attendance 📊', query: 'Show my attendance record' },
    { icon: FileText, text: 'Grades & Results 📋', query: 'Check my grades and results' },
    { icon: Clock, text: 'Class Schedule 🕒', query: 'Show my class timetable' },
    { icon: BookOpen, text: 'Exam Dates 📚', query: 'When are my upcoming exams?' },
    { icon: Users, text: 'Library Info 📖', query: 'Check library status' }
  ];

  const handleQuickAction = (query: string) => {
    setInputValue(query);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">CampusHelp</h1>
                <p className="text-sm text-gray-500">AI Student Assistant</p>
              </div>
            </div>
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="language-select" className="text-sm text-gray-700 font-medium mr-2">Language:</label>
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.query)}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <action.icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">CampusHelp Assistant</h3>
                    <p className="text-sm text-gray-500">
                      {isSpeaking ? '🔊 Speaking...' : 'Ready to help with your queries'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.type === 'bot' && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                          <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-md px-4 py-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p>{message.content}</p>
                        <div className="text-xs opacity-70 mt-2">{message.timestamp}</div>
                      </div>
                    </div>
                  ))}
                  
                  {isSpeaking && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                        <GraduationCap className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-3">
                        <p>🔊 Speaking...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={isListening ? 'Listening...' : 'Ask about fees, attendance, grades, schedules...'}
                      className="w-full bg-gray-50 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:bg-white"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputValue.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={toggleListening}
                    className={`h-10 w-10 rounded-lg ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    size="sm"
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isListening ? 'Listening... Click mic to stop' : 'Click mic for voice input • Responses include audio'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}