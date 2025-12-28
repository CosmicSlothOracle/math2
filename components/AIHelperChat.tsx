import React, { useState, useRef, useEffect } from 'react';
import { User, AIMessage } from '../src/types';
import { Button, GlassCard, CardTitle, ModalOverlay } from '../src/ui-components';

interface Props {
  user: User;
  onClose: () => void;
  onSendMessage: (message: string, topic?: string, existingMessages?: AIMessage[]) => Promise<{ content: string; coinsCharged: number }>;
  initialQuestion?: string;
  initialTopic?: string;
}

const MAX_INPUT_LENGTH = 200; // max chars
const MAX_INPUT_WORDS = 50; // approx limit
const COINS_PER_MESSAGE = 5;

const AIHelperChat: React.FC<Props> = ({ user, onClose, onSendMessage, initialQuestion, initialTopic }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState(initialTopic || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [pendingTopic, setPendingTopic] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send initial question if provided
  // If initialQuestion provided, prompt user to confirm sending (treat as paid)
  useEffect(() => {
    if (initialQuestion) {
      setPendingMessage(initialQuestion);
      setPendingTopic(initialTopic || '');
      setShowConfirmDialog(true);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (messageText: string, topicText?: string, isInitial = false) => {
    if (!messageText.trim() || messageText.length > MAX_INPUT_LENGTH) return;

    setIsLoading(true);

    try {
      const result = await onSendMessage(messageText.trim(), topicText, messages);

      const userMsg: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText.trim(),
        timestamp: Date.now(),
        costCoins: isInitial ? 0 : COINS_PER_MESSAGE,
      };

      const assistantMsg: AIMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setInput('');
      if (topicText) setTopic(topicText);
    } catch (err) {
      console.error('Chat Error:', err);
      const errorMsg: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Fehler beim Senden der Nachricht. Bitte versuche es erneut.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || input.length > MAX_INPUT_LENGTH || isLoading) return;

    // Check if user has enough coins
    const userCoins = Number.isFinite(user.coins) ? user.coins : 0;
    if (userCoins < COINS_PER_MESSAGE) {
      setShowConfirmDialog(true);
      return;
    }

    // Show confirmation dialog before charging
    setPendingMessage(input.trim());
    setPendingTopic(topic.trim() || undefined);
    setShowConfirmDialog(true);
  };

  const handleConfirmSend = () => {
    if (pendingMessage) {
      handleSendMessage(pendingMessage, pendingTopic);
    }
  };

  const remainingChars = MAX_INPUT_LENGTH - input.length;
  const remainingWords = Math.max(0, MAX_INPUT_WORDS - input.trim().split(/\s+/).filter(Boolean).length);
  const userCoins = Number.isFinite(user.coins) ? user.coins : 0;
  const canAfford = userCoins >= COINS_PER_MESSAGE;
  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = input.trim().length > 0 && input.length <= MAX_INPUT_LENGTH && wordCount <= MAX_INPUT_WORDS && !isLoading && canAfford;

  return (
    <ModalOverlay onClose={onClose}>
      <div className={`bg-white rounded-[2rem] p-6 sm:p-8 max-w-3xl w-full mx-auto relative flex flex-col ${user.aiSkin === 'neon' ? 'bg-black text-green-300' : user.aiSkin === 'minimal' ? 'bg-white' : user.aiSkin === 'klassik' ? 'bg-amber-50' : ''}`} style={{ maxHeight: '90vh' }}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors z-10"
          aria-label="Schließen"
        >
          ✕
        </button>

        <div className="flex items-center justify-between mb-6 pr-12">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h2 className="text-2xl font-black uppercase italic">KI-Chat</h2>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                {COINS_PER_MESSAGE} Coins pro Nachricht
              </p>
            </div>
          </div>
          <div className="text-sm font-black text-slate-600">
            🪙 {userCoins} Coins
          </div>
        </div>

        <GlassCard className="!p-4 mb-4 bg-indigo-50 border-indigo-200">
          <p className="text-xs text-indigo-900 font-medium">
            💡 <strong>Erinnerung:</strong> Die KI liefert <strong>keine Lösungen</strong>, sondern Hinweise und Fragen, damit du selbst auf die Lösung kommst.
          </p>
        </GlassCard>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar pr-2" style={{ minHeight: '200px', maxHeight: '400px' }}>
          {messages.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm font-bold uppercase">Starte das Gespräch</p>
              <p className="text-xs mt-2">Stelle eine Frage und erhalte hilfreiche Hinweise</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : msg.role === 'system'
                    ? 'bg-rose-50 text-rose-700 border-2 border-rose-200'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {msg.role === 'user' && msg.costCoins !== undefined && msg.costCoins > 0 && (
                  <div className="text-[10px] font-black uppercase text-indigo-200 mb-1">
                    -{msg.costCoins} Coins
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <div className={`text-[10px] mt-2 font-black uppercase ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}>
                  {msg.role === 'user' ? 'Du' : msg.role === 'assistant' ? 'KI' : 'System'}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 border-t-2 border-slate-200 pt-4">
          <div>
            <label htmlFor="chat-topic" className="block text-xs font-black uppercase text-slate-500 mb-2">
              Thema (optional)
            </label>
            <input
              id="chat-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="z.B. Quadratische Funktionen..."
              className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <textarea
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= MAX_INPUT_LENGTH) {
                  setInput(e.target.value);
                }
              }}
              placeholder="Deine Nachricht... (max. 400 Zeichen)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {remainingChars} Zeichen · {remainingWords} Wörter übrig
              </span>
              {!canAfford && (
                <span className="text-[10px] text-rose-500 font-bold uppercase">
                  Nicht genug Coins ({COINS_PER_MESSAGE} benötigt)
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            isLoading={isLoading}
            className="w-full"
          >
            {isLoading ? 'Wird gesendet...' : `Senden (${COINS_PER_MESSAGE} Coins)`}
          </Button>
        </form>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-[2rem] z-20">
            <GlassCard className="!p-6 max-w-md w-full mx-4 bg-white border-2 border-indigo-300">
              <h3 className="text-xl font-black uppercase mb-4">Nachricht senden?</h3>
              <p className="text-sm text-slate-600 mb-2">
                Diese Nachricht kostet <strong>{COINS_PER_MESSAGE} Coins</strong>.
              </p>
              <p className="text-sm text-slate-600 mb-6">
                Dein Kontostand: <strong>{userCoins} Coins</strong>
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setPendingMessage('');
                    setPendingTopic('');
                  }}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleConfirmSend}
                  disabled={userCoins < COINS_PER_MESSAGE}
                  className="flex-1"
                >
                  Bestätigen ({COINS_PER_MESSAGE} Coins)
                </Button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
};

export default AIHelperChat;

