
import React, { useEffect, useState, useRef, useMemo } from 'react';

// --- Typography & Layout ---

export const SectionHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter mb-6 ${className}`}>
    {children}
  </h2>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg sm:text-xl lg:text-2xl font-black uppercase italic leading-tight ${className}`}>
    {children}
  </h3>
);

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; isInteractive?: boolean }> = ({ 
  children, className = '', onClick, isInteractive = false 
}) => (
  <div 
    onClick={onClick}
    className={`
      relative p-6 sm:p-8 rounded-[2.5rem] border-2 backdrop-blur-xl transition-all duration-300
      ${isInteractive ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98]' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

// --- Interactive Elements ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', disabled, ...props 
}) => {
  const baseStyles = "relative font-black uppercase tracking-widest rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 outline-none shadow-md";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 border-b-4 border-indigo-800",
    secondary: "bg-slate-100 text-slate-900 border-2 border-slate-200",
    danger: "bg-rose-500 text-white border-b-4 border-rose-800",
    success: "bg-emerald-500 text-white border-b-4 border-emerald-800",
    ghost: "bg-transparent text-slate-500 hover:bg-indigo-50"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs min-h-[44px]",
    lg: "px-8 py-4 text-sm min-h-[56px]"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || isLoading} {...props}>
      {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate'; className?: string }> = ({ 
  children, color = 'slate', className = '' 
}) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-500"
  };
  return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colors[color]} ${className}`}>{children}</span>;
};

export const DifficultyStars: React.FC<{ difficulty: 'Einfach' | 'Mittel' | 'Schwer' }> = ({ difficulty }) => {
  const count = difficulty === 'Einfach' ? 1 : difficulty === 'Mittel' ? 2 : 3;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <span key={i} className={`text-xs ${i <= count ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
      ))}
    </div>
  );
};

// --- Calculator Logic Fixed ---

export const CalculatorWidget: React.FC<{ onClose: () => void; skin?: string }> = ({ onClose, skin = 'default' }) => {
  const [display, setDisplay] = useState('');
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const [size, setSize] = useState({ w: 280, h: 420 });
  const [isInteracting, setIsInteracting] = useState<'none' | 'drag' | 'resize'>('none');
  const startRef = useRef({ mx: 0, my: 0, px: 0, py: 0, sw: 0, sh: 0 });

  const onInteractionStart = (e: React.MouseEvent | React.TouchEvent, type: 'drag' | 'resize') => {
    const point = 'touches' in e ? e.touches[0] : e;
    startRef.current = {
      mx: point.clientX,
      my: point.clientY,
      px: position.x,
      py: position.y,
      sw: size.w,
      sh: size.h
    };
    setIsInteracting(type);
  };

  useEffect(() => {
    if (isInteracting === 'none') return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const point = 'touches' in e ? e.touches[0] : e;
      const dx = point.clientX - startRef.current.mx;
      const dy = point.clientY - startRef.current.my;
      if (isInteracting === 'drag') {
        setPosition({ x: startRef.current.px + dx, y: startRef.current.py + dy });
      } else {
        setSize({ w: Math.max(200, startRef.current.sw + dx), h: Math.max(300, startRef.current.sh + dy) });
      }
    };
    const onEnd = () => setIsInteracting('none');
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isInteracting]);

  const calculate = () => {
    try {
      let expr = display.replace(/×/g, '*').replace(/÷/g, '/');
      setDisplay(eval(expr).toString());
    } catch { setDisplay('Error'); }
  };

  return (
    <div 
      style={{ left: position.x, top: position.y, width: size.w, height: size.h }}
      className="fixed z-[180] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col touch-none select-none"
    >
      <div 
        onMouseDown={e => onInteractionStart(e, 'drag')}
        onTouchStart={e => onInteractionStart(e, 'drag')}
        className="p-4 bg-slate-100 flex justify-between items-center cursor-grab active:cursor-grabbing shrink-0"
      >
        <span className="text-[10px] font-black opacity-30 tracking-widest">CALCULATOR</span>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full hover:bg-rose-500 hover:text-white transition-colors">✕</button>
      </div>
      <div className="p-6 bg-slate-50 text-right border-b shrink-0 min-h-[5rem] flex items-end justify-end">
        <div className="text-2xl font-black italic break-all leading-none">{display || '0'}</div>
      </div>
      <div className="p-3 grid grid-cols-4 gap-2 flex-1 min-h-0">
        {['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+'].map(l => (
          <button 
            key={l} 
            onClick={() => l === '=' ? calculate() : setDisplay(display + l)} 
            className={`rounded-2xl border-2 font-black text-sm flex items-center justify-center transition-all active:scale-90 ${l === '=' ? 'bg-indigo-600 text-white border-indigo-800' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div 
        onMouseDown={e => { e.stopPropagation(); onInteractionStart(e, 'resize'); }}
        onTouchStart={e => { e.stopPropagation(); onInteractionStart(e, 'resize'); }}
        className="absolute bottom-1 right-1 w-8 h-8 cursor-nwse-resize flex items-end justify-end p-1 opacity-20 hover:opacity-100"
      >
        <div className="w-4 h-4 border-r-4 border-b-4 border-slate-300 rounded-br-lg" />
      </div>
    </div>
  );
};

// --- Feedback & Overlays ---

export const ToastContainer: React.FC<{ toasts: { id: string; type: 'success' | 'error' | 'info'; message: string }[] }> = ({ toasts }) => (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
    {toasts.map(t => (
      <div key={t.id} className="pointer-events-auto p-4 rounded-2xl shadow-2xl bg-white border-l-4 border-indigo-500 animate-in slide-in-from-bottom flex items-center gap-3">
        <span className="font-bold text-xs">{t.message}</span>
      </div>
    ))}
  </div>
);

export const CoinFlightAnimation: React.FC<{ isActive: boolean; onComplete: () => void }> = ({ isActive, onComplete }) => {
  useEffect(() => { if (isActive) { const timer = setTimeout(onComplete, 1200); return () => clearTimeout(timer); } }, [isActive, onComplete]);
  if (!isActive) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[300] flex items-center justify-center">
      <div className="text-5xl animate-bounce">🪙</div>
    </div>
  );
};

export const ModalOverlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar outline-none">
      {children}
    </div>
  </div>
);
