import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, Trash2 } from 'lucide-react';
import { processAIQuery } from '../../utils/aiEngine';
import './Assistant.css';

export default function AIAssistant({ cases, sessions }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'أهلاً بك! أنا المساعد الذكي لأجندة قضايا الدولة 🤖\n\nيمكنني مساعدتك في:\n📅 استعراض جلسات اليوم والأيام القادمة\n📋 تلخيص القضايا ومعرفة تفاصيلها\n📊 عرض إحصائيات القضايا\n💡 تقديم توصيات لتنظيم جدولك\n\nكيف يمكنني مساعدتك؟',
      timestamp: new Date().toISOString(),
      type: 'greeting',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = processAIQuery(currentInput, cases, sessions);
      const assistantMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        text: response.text,
        timestamp: response.timestamp,
        type: response.type,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      text: 'تم مسح المحادثة. كيف يمكنني مساعدتك؟ 🤖',
      timestamp: new Date().toISOString(),
      type: 'greeting',
    }]);
  };

  const quickActions = [
    { label: 'جلسات اليوم', query: 'جلسات اليوم' },
    { label: 'جلسات غداً', query: 'جلسات غداً' },
    { label: 'إحصائيات', query: 'إحصائيات' },
    { label: 'توصيات', query: 'توصيات' },
    { label: 'جلسات الأسبوع', query: 'جلسات الأسبوع' },
  ];

  return (
    <div className="assistant-page">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              <Bot className="icon" size={28} />
              المساعد الذكي
            </h1>
            <p className="page-subtitle">مساعدك الذكي لإدارة القضايا والجلسات</p>
          </div>
          <button className="btn btn-ghost" onClick={clearChat}>
            <Trash2 size={16} />
            مسح المحادثة
          </button>
        </div>
      </div>

      <div className="glass-card chat-container">
        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? (
                  <div className="avatar-ai">
                    <Sparkles size={18} />
                  </div>
                ) : (
                  <div className="avatar-user">
                    <User size={18} />
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>
                      {line.startsWith('**') && line.endsWith('**')
                        ? <strong>{line.slice(2, -2)}</strong>
                        : line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message assistant">
              <div className="message-avatar">
                <div className="avatar-ai">
                  <Sparkles size={18} />
                </div>
              </div>
              <div className="message-content">
                <div className="message-bubble typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          {quickActions.map(action => (
            <button
              key={action.query}
              className="quick-action-btn"
              onClick={() => {
                if (isTyping) return;
                const userMessage = {
                  id: `msg-${Date.now()}`,
                  role: 'user',
                  text: action.query,
                  timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, userMessage]);
                setIsTyping(true);
                setTimeout(() => {
                  const response = processAIQuery(action.query, cases, sessions);
                  setMessages(prev => [...prev, {
                    id: `msg-${Date.now()}-ai`,
                    role: 'assistant',
                    text: response.text,
                    timestamp: response.timestamp,
                    type: response.type,
                  }]);
                  setIsTyping(false);
                }, 800 + Math.random() * 700);
              }}
              disabled={isTyping}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="اكتب سؤالك هنا... مثال: جلسات اليوم"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button
            className="btn btn-primary send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
