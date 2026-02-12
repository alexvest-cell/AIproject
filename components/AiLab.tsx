import React, { useState, useRef, useEffect } from 'react';
import { Section, ChatMessage } from '../types';
import { generateEcoAnalysis } from '../services/geminiService';
import { Send, Bot, Sparkles } from 'lucide-react';

const AiLab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello. I am the GreenShift Analyst. You can ask me to summarize recent climate reports, explain complex environmental phenomena, or verify sustainability claims." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await generateEcoAnalysis(input);
    
    const aiMsg: ChatMessage = { role: 'model', text: responseText };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id={Section.AI_ASSISTANT} className="py-24 bg-news-bg">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto">
          
          {/* Sidebar / Info */}
          <div className="md:w-1/3">
             <div className="inline-flex items-center gap-2 text-news-accent font-bold uppercase tracking-wider text-xs mb-4 bg-news-accent/10 px-3 py-1 rounded-full border border-news-accent/20">
               <Sparkles size={14} />
               Powered by Gemini
             </div>
             <h2 className="text-3xl font-serif font-bold text-news-text mb-6">Environmental Intelligence Engine</h2>
             <p className="text-news-muted mb-8 leading-relaxed">
               Navigate the complexity of climate science with our AI research assistant. Ask questions about data, policy, or scientific concepts to get instant, verified breakdowns.
             </p>
             <div className="space-y-3">
               <p className="text-xs font-bold text-news-muted uppercase tracking-wide">Suggested Queries:</p>
               {["Explain Carbon Capture", "Summary of COP28 Agreements", "Impact of ocean acidification"].map(query => (
                 <button 
                  key={query}
                  onClick={() => setInput(query)}
                  className="block w-full text-left text-sm p-3 rounded bg-news-paper hover:bg-news-border text-news-text transition-colors border border-news-border"
                 >
                   "{query}"
                 </button>
               ))}
             </div>
          </div>

          {/* Chat Interface */}
          <div className="md:w-2/3 bg-news-paper rounded-xl border border-news-border overflow-hidden flex flex-col h-[600px] shadow-2xl">
            
            {/* Chat History */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6" ref={scrollRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'model' ? 'bg-news-accent text-news-bg' : 'bg-news-border text-white'}`}>
                    {msg.role === 'model' ? <Bot size={18} /> : <div className="text-xs font-bold">You</div>}
                  </div>
                  <div className={`max-w-[80%] rounded-lg p-4 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-news-border text-white' 
                      : 'bg-news-bg text-news-text border border-news-border shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                   <div className="w-8 h-8 rounded-full bg-news-accent text-news-bg flex items-center justify-center">
                     <Bot size={18} />
                   </div>
                   <div className="bg-news-bg border border-news-border p-4 rounded-lg text-sm text-news-muted">
                     Analyzing environmental data...
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-news-paper border-t border-news-border">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about the environment..."
                  className="w-full bg-news-bg border border-news-border rounded-lg py-3 pl-4 pr-12 text-news-text placeholder:text-news-muted focus:outline-none focus:ring-1 focus:ring-news-accent focus:border-transparent transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-news-muted hover:text-news-accent p-2 transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-[10px] text-center text-news-muted mt-2">
                GreenShift AI can make mistakes. Please verify important data.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default AiLab;