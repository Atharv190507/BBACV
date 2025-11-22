import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your AI Verification Assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare history for API
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await geminiService.chat(history, userMsg.text);

    const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window - using CSS transitions for smooth open/close */}
      <div 
        className={`
            w-80 md:w-96 h-[500px] glass-card rounded-2xl flex flex-col shadow-2xl border border-purple-500/20 mb-4 
            origin-bottom-right transition-all duration-300 ease-in-out pointer-events-auto overflow-hidden
            ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8 pointer-events-none'}
        `}
      >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                        <Bot size={18} className="text-white" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">AI Assistant</h4>
                        <span className="flex items-center gap-1 text-[10px] text-purple-200">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> Online
                        </span>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors hover:rotate-90 duration-300">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-slate-700 text-slate-200 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start animate-in fade-in zoom-in duration-300">
                        <div className="bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-slate-800 border-t border-white/5">
                <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2 border border-slate-700 focus-within:border-purple-500 transition-colors">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about verification..."
                        className="flex-1 bg-transparent text-sm text-white outline-none"
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={!input.trim()}
                        className="text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-transform active:scale-90"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(129,140,248,0.5)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_0_30px_rgba(129,140,248,0.8)] active:scale-90 transition-all duration-300 group"
      >
        {isOpen ? <X size={24} className="animate-in rotate-180 duration-300" /> : (
            <>
                <MessageSquare size={24} className="group-hover:hidden transition-transform" />
                <Sparkles size={24} className="hidden group-hover:block animate-pulse" />
            </>
        )}
      </button>
    </div>
  );
};

export default AIChat;