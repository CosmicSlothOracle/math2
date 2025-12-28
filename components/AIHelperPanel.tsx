import React, { useState } from 'react';
import { User } from '../src/types';
import { Button, GlassCard, CardTitle, ModalOverlay } from '../src/ui-components';

interface Props {
  user: User;
  onClose: () => void;
  onOpenChat: (initialQuestion?: string, initialTopic?: string) => void;
}

const MAX_INPUT_LENGTH = 400;

const AIHelperPanel: React.FC<Props> = ({ user, onClose, onOpenChat, onGetFirstHint }) => {
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || question.length > MAX_INPUT_LENGTH) return;

    // Open the chat with the submitted question as initial message.
    onOpenChat(question.trim(), topic.trim() || undefined);
    onClose();
  };

  const remainingChars = MAX_INPUT_LENGTH - question.length;
  const canSubmit = question.trim().length > 0 && question.length <= MAX_INPUT_LENGTH && !isLoading;

  return (
    <ModalOverlay onClose={onClose}>
      <div className={`bg-white rounded-[2rem] p-6 sm:p-8 max-w-2xl w-full mx-auto relative ${user.aiSkin === 'neon' ? 'bg-black text-green-300' : user.aiSkin === 'minimal' ? 'bg-white' : user.aiSkin === 'klassik' ? 'bg-amber-50' : ''}`}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors"
          aria-label="Schließen"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🤖</span>
          <div>
            <h2 className="text-2xl font-black uppercase italic">KI-Hilfe</h2>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Erster Tipp kostenlos</p>
          </div>
        </div>

        {!hint ? (
          <>
            <GlassCard className="!p-4 mb-6 bg-indigo-50 border-indigo-200">
              <p className="text-sm text-indigo-900 font-medium">
                💡 <strong>Wichtig:</strong> Die KI liefert <strong>keine Lösungen</strong>, sondern hilft dir mit Hinweisen, Fragen und Denkanstößen, selbst auf die Lösung zu kommen.
              </p>
            </GlassCard>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Thema (optional)
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="z.B. Quadratische Funktionen, Sinus, Potenzen..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="question" className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Deine Frage *
                </label>
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_INPUT_LENGTH) {
                      setQuestion(e.target.value);
                    }
                  }}
                  placeholder="Stelle deine Frage hier... (max. 400 Zeichen)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {remainingChars} Zeichen übrig
                  </span>
                  {question.length > MAX_INPUT_LENGTH && (
                    <span className="text-[10px] text-rose-500 font-bold uppercase">
                      Zu lang! Bitte kürzen.
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl">
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!canSubmit}
                isLoading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Tipp wird geladen...' : 'Kostenlosen Tipp erhalten'}
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <GlassCard className="!p-6 bg-indigo-50 border-indigo-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <CardTitle className="!text-base text-indigo-900 mb-2">Dein Tipp</CardTitle>
                  <p className="text-sm text-indigo-800 whitespace-pre-wrap leading-relaxed">
                    {hint}
                  </p>
                </div>
              </div>
            </GlassCard>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setHint(null);
                  setQuestion('');
                  setTopic('');
                  setError(null);
                }}
                className="flex-1"
              >
                Neue Frage
              </Button>
              <Button
                onClick={() => {
                  // Pass current question/topic to chat as initial context
                  onOpenChat(question.trim() || undefined, topic.trim() || undefined);
                  onClose();
                }}
                className="flex-1"
              >
                Mehr fragen (5 Coins)
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
};

export default AIHelperPanel;

