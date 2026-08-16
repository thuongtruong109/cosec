import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, FileCode, Bot, User, ArrowUpRight } from 'lucide-react';
import { Project, ChatMessage } from '../types';
import { requestCodebaseChat } from '../services/aiService';

interface ChatViewProps {
  project: Project | null;
  onNavigateFile?: (filePath: string, line?: number) => void;
}

export default function ChatView({ project, onNavigateFile }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello! I am your **CodeLens AI Assistant**. I have fully indexed the codebase for **${
        project?.name || 'your repository'
      }**.\n\nYou can ask me specific questions about authentication implementation, database queries, security vulnerabilities, or refactoring strategies.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    'Where is authentication implemented?',
    'Explain the payment processing flow.',
    'Where can SQL injection happen in this project?',
    'Show me all places where JWT is used.',
    'Which files should I modify to add 2FA?',
    'How would you refactor the database layer?',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const filesPayload = project?.files.map((f) => ({ path: f.path, content: f.content }));
      const replyText = await requestCodebaseChat(textToSend, filesPayload);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue analyzing the codebase for this question. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-zinc-950 text-zinc-200 select-none overflow-hidden">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">AI Codebase Chat Assistant</h1>
              <p className="text-xs text-zinc-400 font-mono">
                Context-aware QA for repository: <span className="text-indigo-400">{project?.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2 font-sans text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl space-y-2 shadow-lg leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none font-mono'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className="text-[10px] text-zinc-400 text-right opacity-70">{msg.timestamp}</div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center shrink-0 mt-1 text-[11px]">
                  DEV
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono py-2">
              <Sparkles size={16} className="animate-spin" />
              <span>Scanning repository AST and generating context response...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-2 flex flex-wrap gap-2 text-xs font-mono">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>{q}</span>
              <ArrowUpRight size={12} className="text-zinc-500" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-zinc-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a question about this codebase..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <span>Send</span>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
