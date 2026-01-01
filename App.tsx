
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LEARNING_UNITS, SHOP_ITEMS, PROGRESS_LEVELS, GEOMETRY_DEFINITIONS } from './constants.tsx';
import {
  LearningUnit,
  User,
  Task,
  ShopItem,
  ChatMessage,
  CategoryGroup,
  BattleRequest,
  ToastMessage,
  ToastType,
  getTileStatus,
  BattleScenario,
  BattleRecord,
  BattleSummaryPayload,
} from './types.ts';
import { AuthService, DataService, SocialService, bootstrapServerUser } from './services/apiService.ts';

// Helper to get API headers with anon ID (for bounty evaluation)
function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'mm_anon_id' && value) {
        headers['x-anon-id'] = value;
        break;
      }
    }
    if (!headers['x-anon-id']) {
      const stored = localStorage.getItem('mm_anon_id');
      if (stored) headers['x-anon-id'] = stored;
    }
  } catch (e) {
    console.warn('[getApiHeaders] Error reading anon ID:', e);
  }
  return headers;
}
import { sanitizeMathInput } from './utils/inputSanitizer.ts';
import { getRealtimeClient } from './services/realtimeClient.ts';
import { QuestService } from './services/questService.ts';
import { BattleService } from './services/battleService.ts';
import { BATTLE_SCENARIOS, generateBattleTaskBundle, getBattleScenarioById } from './services/mathBattles.ts';
import { getQuestCap, getQuestCoinsEarned, getQuestCapRemaining, isQuestCapReached, computeEntryFee } from './services/economyService.ts';
import { sendAIMessage } from './services/geminiService.ts';
import { TaskFactory } from './services/taskFactory.ts';
import {
  Button, GlassCard, SectionHeading, CardTitle, Badge, DifficultyStars,
  ToastContainer, ModalOverlay, CoinFlightAnimation,
  CalculatorWidget, FormelsammlungWidget
} from './ui-components.tsx';
import { subscribeVirtualPointer } from '@/src/utils/virtualPointer';
import BattlePanel from './components/BattlePanel.tsx';
import { MultiFieldInput } from './components/MultiFieldInput.tsx';
import { DragDropTask } from './components/DragDropTask.tsx';
import { validateAnswer } from './utils/answerValidators.ts';
import { FormelsammlungView } from './components/FormelsammlungView.tsx';
import AIHelperChat from './components/AIHelperChat.tsx';
import { CurrentTaskProvider, useCurrentTask } from '@/src/contexts/CurrentTaskContext';
import { AIMessage } from '@/src/types';
import { FormelRechner } from './components/FormelRechner.tsx';
import { SchrittLoeser } from './components/SchrittLoeser.tsx';
import { ScheitelCoach } from './components/ScheitelCoach.tsx';
import { SpickerTrainer } from './components/SpickerTrainer.tsx';
import { HeaderBar } from './components/HeaderBar.tsx';

// --- Theme Helpers ---
const GROUP_THEME: Record<CategoryGroup, { color: string; bg: string; text: string; border: string; darkBg: string }> = {
  'A': { color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', darkBg: 'bg-indigo-600' },
  'B': { color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', darkBg: 'bg-emerald-600' },
  'C': { color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', darkBg: 'bg-amber-600' }
};

// --- Avatar Rarity Helper ---
function getAvatarRarity(avatarValue: string): 'common' | 'rare' | 'epic' | 'legendary' {
  const item = SHOP_ITEMS.find(item => item.type === 'avatar' && item.value === avatarValue);
  return item?.rarity || 'common';
}

const GROUP_LABELS: Record<CategoryGroup, string> = {
  'A': 'Raum & Form',
  'B': 'Messen & Berechnen',
  'C': 'Funktionen & Kontext'
};

const getQuestStats = (user: User, unitId: string) => {
  const cap = getQuestCap(user, unitId);
  const earned = getQuestCoinsEarned(user, unitId);
  const percent = Number.isFinite(cap) && cap > 0 ? Math.min(100, Math.round((earned / cap) * 100)) : 0;
  const capReached = isQuestCapReached(user, unitId);
  const remaining = getQuestCapRemaining(user, unitId);
  return { cap, earned, percent, capReached, remaining };
};

// --- Custom Hooks ---
const useContainerSize = (ref: React.RefObject<HTMLDivElement | null>) => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        }
      }
    });
    observer.observe(ref.current);
    if (ref.current.clientWidth > 0) {
        setSize({ width: ref.current.clientWidth, height: ref.current.clientHeight });
    }
    return () => observer.disconnect();
  }, [ref]);
  return size;
};

// --- Visual Effect Components ---
const MatrixRain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    // Reduce complexity on mobile for better performance
    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 20 : 16; // Larger font = fewer columns on mobile
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);
    const speeds: number[] = new Array(columns).fill(0).map(() => 0.5 + Math.random() * 1.5);
    const chars = "0123456789+-×÷=√πΣΔΩ∞∫∂λαβγδ∈∀∃≠≈≤≥";
    const glowChars: {x: number, y: number, char: string, life: number, hue: number}[] = [];

    const draw = () => {
      // Fade with depth
      ctx.fillStyle = 'rgba(0, 8, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Leading character - bright white/green glow
        if (y > 0 && y < canvas.height) {
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#00ff88';
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
          ctx.fillText(char, x, y);
          ctx.restore();

          // Random bright flashes
          if (Math.random() < 0.02) {
            glowChars.push({x, y, char, life: 1, hue: 120 + Math.random() * 40});
          }
        }

        // Trail characters - gradient fade (reduced on mobile)
        const trailLength = isMobile ? 15 : 25;
        for (let j = 1; j < trailLength; j++) {
          const trailY = y - j * fontSize;
          if (trailY > 0 && trailY < canvas.height) {
            const alpha = Math.max(0, 1 - j / trailLength);
            const green = Math.floor(255 * alpha);
            ctx.fillStyle = `rgba(0, ${green}, ${Math.floor(green * 0.4)}, ${alpha * 0.8})`;
            ctx.font = `${fontSize}px 'Courier New', monospace`;
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, trailY);
          }
        }

        drops[i] += speeds[i];
        if (drops[i] * fontSize > canvas.height + 400) {
          drops[i] = Math.random() * -20;
          speeds[i] = 0.5 + Math.random() * 1.5;
        }
      }

      // Render glow effects
      for (let i = glowChars.length - 1; i >= 0; i--) {
        const g = glowChars[i];
        ctx.save();
        ctx.shadowBlur = 30 * g.life;
        ctx.shadowColor = `hsl(${g.hue}, 100%, 70%)`;
        ctx.fillStyle = `hsla(${g.hue}, 100%, 80%, ${g.life})`;
        ctx.font = `bold ${fontSize * 1.5}px 'Courier New', monospace`;
        ctx.fillText(g.char, g.x - fontSize * 0.25, g.y);
        ctx.restore();
        g.life -= 0.03;
        if (g.life <= 0) glowChars.splice(i, 1);
      }
    };

    // Throttle animation on mobile for better performance
    const interval = setInterval(draw, isMobile ? 50 : 33);
    return () => clearInterval(interval);
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5]">
      <canvas ref={canvasRef} />
    </div>
  );
};

const ElectricStorm: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    interface Bolt {
      path: {x: number, y: number}[];
      life: number;
      width: number;
      hue: number;
      branches: {x: number, y: number, angle: number, length: number}[];
    }

    interface Orb {
      x: number; y: number; radius: number; life: number; hue: number;
    }

    interface Spark {
      x: number; y: number; vx: number; vy: number; life: number; size: number;
    }

    const bolts: Bolt[] = [];
    const orbs: Orb[] = [];
    const sparks: Spark[] = [];
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let lastMouse = { ...mouse };
    let globalEnergy = 0;

    // Subscribe to a normalized virtual pointer (mouse / touch / pointer)
    let lastDown = false;
    const unsubscribe = subscribeVirtualPointer((p) => {
      // Clamp to canvas bounds
      mouse.x = Math.max(0, Math.min(canvas.width, Math.round(p.x)));
      mouse.y = Math.max(0, Math.min(canvas.height, Math.round(p.y)));

      // Trigger the click/tap burst on down-edge
      if (p.down && !lastDown) {
        const px = mouse.x;
        const py = mouse.y;
        orbs.push({ x: px, y: py, radius: 5, life: 1.0, hue: 200 });
        for (let i = 0; i < 12; i++) {
            createBolt(px, py, 80 + Math.random() * 120, true);
        }
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 15;
            sparks.push({
              x: px, y: py,
              vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
              life: 1, size: 2 + Math.random() * 3
            });
        }
        globalEnergy = Math.min(globalEnergy + 50, 100);
      }
      lastDown = p.down;
    });

    function createBolt(x: number, y: number, length: number, withBranches = false) {
        const path = [{x, y}];
        const baseAngle = Math.random() * Math.PI * 2;
        let currX = x;
        let currY = y;
        const segments = Math.floor(length / 4);
        const branches: {x: number, y: number, angle: number, length: number}[] = [];

        for(let i=0; i<segments; i++) {
            const jitter = 15 + (globalEnergy * 0.2);
            currX += Math.cos(baseAngle) * 4 + (Math.random() - 0.5) * jitter;
            currY += Math.sin(baseAngle) * 4 + (Math.random() - 0.5) * jitter;
            path.push({x: currX, y: currY});

            // Create branches
            if (withBranches && i > 2 && i % 3 === 0 && Math.random() < 0.4) {
              branches.push({
                x: currX, y: currY,
                angle: baseAngle + (Math.random() - 0.5) * 1.5,
                length: 20 + Math.random() * 30
              });
            }
        }

        bolts.push({
            path,
            life: 1.0,
            width: 2 + Math.random() * 2 + (globalEnergy * 0.03),
            hue: 180 + Math.random() * 60,
            branches
        });
    }

    const draw = () => {
      globalEnergy *= 0.98;

      // Dark fade with electric tint
      ctx.fillStyle = `rgba(5, 10, 25, ${0.15 - globalEnergy * 0.001})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const speed = Math.sqrt(dx*dx + dy*dy);
      globalEnergy = Math.min(globalEnergy + speed * 0.1, 100);

      if (speed > 3 || Math.random() < 0.03 + globalEnergy * 0.002) {
          const count = Math.min(Math.floor(speed / 8) + 1, 4);
          for (let k = 0; k < count; k++) {
              createBolt(mouse.x, mouse.y, 40 + Math.random() * 60 + globalEnergy, speed > 10);
          }
          // Sparks from movement
          if (speed > 5) {
            for (let i = 0; i < Math.min(speed / 5, 5); i++) {
              sparks.push({
                x: mouse.x, y: mouse.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 0.8, size: 1.5 + Math.random() * 2
              });
            }
          }
      }

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw bolts
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];

        // Main bolt
        ctx.beginPath();
        if (b.path.length > 0) {
            ctx.moveTo(b.path[0].x, b.path[0].y);
            for (let j = 1; j < b.path.length; j++) {
                ctx.lineTo(b.path[j].x, b.path[j].y);
            }
        }

        // Core glow
        ctx.strokeStyle = `hsla(${b.hue}, 100%, 90%, ${b.life})`;
        ctx.lineWidth = b.width * b.life;
        ctx.shadowBlur = 25 * b.life;
        ctx.shadowColor = `hsla(${b.hue}, 100%, 70%, 1)`;
        ctx.stroke();

        // Outer glow
        ctx.strokeStyle = `hsla(${b.hue}, 80%, 60%, ${b.life * 0.5})`;
        ctx.lineWidth = b.width * b.life * 3;
        ctx.shadowBlur = 40 * b.life;
        ctx.stroke();

        // Draw branches
        for (const branch of b.branches) {
          ctx.beginPath();
          ctx.moveTo(branch.x, branch.y);
          let bx = branch.x, by = branch.y;
          for (let j = 0; j < branch.length / 3; j++) {
            bx += Math.cos(branch.angle) * 3 + (Math.random() - 0.5) * 6;
            by += Math.sin(branch.angle) * 3 + (Math.random() - 0.5) * 6;
            ctx.lineTo(bx, by);
          }
          ctx.strokeStyle = `hsla(${b.hue + 20}, 100%, 80%, ${b.life * 0.7})`;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 10;
          ctx.stroke();
        }

        b.life -= 0.06;
        if (b.life <= 0) bolts.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // Draw orbs
      for (let i = orbs.length - 1; i >= 0; i--) {
          const o = orbs[i];
          const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.radius);
          grad.addColorStop(0, `hsla(${o.hue}, 100%, 90%, ${o.life})`);
          grad.addColorStop(0.5, `hsla(${o.hue}, 100%, 60%, ${o.life * 0.5})`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
          ctx.fill();

          o.radius += 12;
          o.life -= 0.03;
          if (o.life <= 0) orbs.splice(i, 1);
      }

      // Draw sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(200, 100%, 80%, ${s.life})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#60a5fa';
        ctx.fill();

        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.life -= 0.025;
        if (s.life <= 0) sparks.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
        cancelAnimationFrame(anim);
        unsubscribe();
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[100]">
      <canvas ref={canvasRef} />
    </div>
  );
};

const VoidProtocol: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let lastMouse = { ...mouse };
    let time = 0;

    interface Void { x: number; y: number; r: number; pull: number; life: number; }
    interface Particle { x: number; y: number; vx: number; vy: number; size: number; hue: number; life: number; }
    interface Glitch { y: number; height: number; offset: number; life: number; }

    const voids: Void[] = [];
    const particles: Particle[] = [];
    const glitches: Glitch[] = [];

    // Ambient particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 0.5 + Math.random() * 2,
        hue: 240 + Math.random() * 40,
        life: 0.3 + Math.random() * 0.7
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseDown = () => {
      voids.push({ x: mouse.x, y: mouse.y, r: 10, pull: 200, life: 1 });
      if (Math.random() < 0.5) {
        glitches.push({ y: mouse.y, height: 20 + Math.random() * 60, offset: (Math.random() - 0.5) * 20, life: 0.5 });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchmove', handleTouchMove);

    const draw = () => {
      time += 0.003;

      // Deep void background with breathing effect
      const breathe = Math.sin(time * 0.5) * 0.5 + 0.5;
      ctx.fillStyle = '#020208';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated void gradient
      const grad = ctx.createRadialGradient(
          canvas.width / 2 + Math.sin(time) * 50,
          canvas.height / 2 + Math.cos(time * 0.7) * 30,
          0,
          canvas.width / 2, canvas.height / 2,
          canvas.width * (0.5 + breathe * 0.2)
      );
      grad.addColorStop(0, 'rgba(15, 10, 30, 0.9)');
      grad.addColorStop(0.5, 'rgba(5, 5, 20, 0.95)');
      grad.addColorStop(1, 'rgba(0, 0, 5, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw hexagonal grid overlay
      ctx.strokeStyle = 'rgba(80, 60, 120, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let y = 0; y < canvas.height + gridSize; y += gridSize * 0.866) {
        const row = Math.floor(y / (gridSize * 0.866));
        for (let x = (row % 2) * gridSize * 0.5; x < canvas.width + gridSize; x += gridSize) {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = x + Math.cos(angle) * gridSize * 0.4;
            const hy = y + Math.sin(angle) * gridSize * 0.4;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Mouse interaction - create ripple voids
      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const speed = Math.sqrt(dx*dx + dy*dy);

      if (speed > 2) {
        voids.push({
          x: mouse.x,
          y: mouse.y,
          r: 5 + speed * 0.5,
          pull: 50 + speed * 2,
          life: 0.8
        });

        // Random glitch lines
        if (Math.random() < 0.1) {
          glitches.push({
            y: Math.random() * canvas.height,
            height: 2 + Math.random() * 8,
            offset: (Math.random() - 0.5) * 30,
            life: 0.3
          });
        }
      }
      lastMouse = { ...mouse };

      // Update and draw particles - pulled toward voids
      particles.forEach(p => {
        voids.forEach(v => {
          const pdx = v.x - p.x;
          const pdy = v.y - p.y;
          const dist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (dist < v.pull && dist > v.r) {
            const force = (v.pull - dist) / v.pull * 0.05 * v.life;
            p.vx += (pdx / dist) * force;
            p.vy += (pdy / dist) * force;
          }
        });

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${p.life * 0.4})`;
        ctx.fill();
      });

      // Draw voids with dark center
      for (let i = voids.length - 1; i >= 0; i--) {
        const v = voids[i];

        // Outer glow
        const vGrad = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, v.r * 3);
        vGrad.addColorStop(0, `rgba(0, 0, 0, ${v.life})`);
        vGrad.addColorStop(0.3, `rgba(40, 20, 80, ${v.life * 0.3})`);
        vGrad.addColorStop(0.7, `rgba(80, 40, 160, ${v.life * 0.1})`);
        vGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r * 3, 0, Math.PI * 2);
        ctx.fill();

        // Warping ring
        ctx.strokeStyle = `rgba(120, 80, 200, ${v.life * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r * (1 + Math.sin(time * 5) * 0.1), 0, Math.PI * 2);
        ctx.stroke();

        v.r += 1;
        v.life -= 0.015;
        if (v.life <= 0) voids.splice(i, 1);
      }

      // Glitch effects
      for (let i = glitches.length - 1; i >= 0; i--) {
        const g = glitches[i];
        ctx.fillStyle = `rgba(100, 50, 180, ${g.life * 0.3})`;
        ctx.fillRect(g.offset, g.y, canvas.width, g.height);
        g.life -= 0.05;
        if (g.life <= 0) glitches.splice(i, 1);
      }

      // Cursor void aura
      const auraGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100);
      auraGrad.addColorStop(0, 'rgba(60, 20, 100, 0.2)');
      auraGrad.addColorStop(0.5, 'rgba(30, 10, 60, 0.1)');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[0]">
      <canvas ref={canvasRef} />
    </div>
  );
};

const UnicornMagic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; hue: number; life: number; maxLife: number;
      type: 'trail' | 'sparkle' | 'heart' | 'star' | 'rainbow';
      rotation: number; rotationSpeed: number;
    }

    interface Rainbow {
      x: number; startY: number; width: number; life: number;
    }

    const particles: Particle[] = [];
    const rainbows: Rainbow[] = [];

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let lastMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let tick = 0;
    let magicPower = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseDown = () => {
      magicPower = 100;
      // Burst of magical particles
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        const types: ('heart' | 'star' | 'sparkle')[] = ['heart', 'star', 'sparkle'];
        particles.push({
          x: mouse.x, y: mouse.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 8 + Math.random() * 12,
          hue: Math.random() * 360,
          life: 1, maxLife: 1,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
      // Rainbow trail
      rainbows.push({ x: mouse.x, startY: mouse.y, width: 80, life: 1 });
    };

    const handleTouchMove = (e: TouchEvent) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchmove', handleTouchMove);

    const drawStar = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i === 0 ? size : size;
        if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawHeart = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.5);
      ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.3);
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;
      magicPower *= 0.97;

      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const speed = Math.sqrt(dx*dx + dy*dy);

      const baseHue = (tick * 2) % 360;

      // Trail particles on mouse move
      if (speed > 2) {
        const count = Math.min(Math.floor(speed / 2), 8);
        for(let i = 0; i < count; i++) {
          const types: Particle['type'][] = ['trail', 'sparkle', 'star'];
          const type = Math.random() < 0.2 ? types[Math.floor(Math.random() * 3)] : 'trail';
          particles.push({
            x: mouse.x + (Math.random() - 0.5) * 30,
            y: mouse.y + (Math.random() - 0.5) * 30,
            vx: -dx * 0.1 + (Math.random() - 0.5) * 2,
            vy: -dy * 0.1 + (Math.random() - 0.5) * 2 - 0.5,
            size: type === 'trail' ? 4 + Math.random() * 6 : 6 + Math.random() * 10,
            hue: baseHue + (Math.random() * 60 - 30),
            life: 1, maxLife: 1,
            type,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
          });
        }
      }

      // Ambient floating sparkles
      if (Math.random() < 0.08) {
        const types: Particle['type'][] = ['sparkle', 'star', 'heart'];
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 20,
          vx: (Math.random() - 0.5) * 1,
          vy: -1 - Math.random() * 2,
          size: 8 + Math.random() * 12,
          hue: Math.random() * 360,
          life: 1, maxLife: 1,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.05
        });
      }

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      // Draw rainbow trails
      for (let i = rainbows.length - 1; i >= 0; i--) {
        const r = rainbows[i];
        const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f06595'];
        const stripHeight = 8;

        ctx.globalAlpha = r.life * 0.6;
        colors.forEach((color, ci) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(r.x, r.startY + ci * stripHeight, r.width * r.life, Math.PI, 0);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        r.life -= 0.015;
        if (r.life <= 0) rainbows.splice(i, 1);
      }

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(tick * 0.03 + p.y * 0.01) * 0.8;
        p.y += p.vy;
        p.vy += 0.02; // Slight gravity
        p.rotation += p.rotationSpeed;
        p.life -= 0.012;

        if (p.life <= 0 || p.y < -50) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = p.life * 0.9;
        const sizeMultiplier = 0.5 + Math.sin(p.life * Math.PI) * 0.5;
        const size = p.size * sizeMultiplier;

        ctx.fillStyle = `hsla(${p.hue}, 85%, 75%, ${alpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
        ctx.shadowBlur = 20;

        switch(p.type) {
          case 'star':
            drawStar(p.x, p.y, size, p.rotation);
            break;
          case 'heart':
            drawHeart(p.x, p.y, size, p.rotation);
            break;
          case 'sparkle':
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - size);
            ctx.lineTo(p.x + size * 0.3, p.y);
            ctx.lineTo(p.x, p.y + size);
            ctx.lineTo(p.x - size * 0.3, p.y);
            ctx.fill();
            // Cross sparkle
            ctx.beginPath();
            ctx.moveTo(p.x - size * 0.8, p.y);
            ctx.lineTo(p.x + size * 0.8, p.y);
            ctx.strokeStyle = `hsla(${p.hue}, 100%, 90%, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
          default:
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // Cursor glow
      const cursorGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80 + magicPower);
      cursorGrad.addColorStop(0, `hsla(${baseHue}, 100%, 80%, ${0.3 + magicPower * 0.005})`);
      cursorGrad.addColorStop(0.5, `hsla(${baseHue + 60}, 100%, 70%, 0.15)`);
      cursorGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = cursorGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 80 + magicPower, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" />
      <canvas ref={canvasRef} />
    </div>
  );
};

const NeonDreams: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let time = 0;
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let targetMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let interactionEnergy = 0;

    interface NeonLine {
      x1: number; y1: number; x2: number; y2: number;
      hue: number; life: number; width: number;
    }

    interface Pulse {
      x: number; y: number; radius: number; hue: number; life: number;
    }

    const neonLines: NeonLine[] = [];
    const pulses: Pulse[] = [];

    const handleMouseMove = (e: MouseEvent) => {
        targetMouse.x = e.clientX;
        targetMouse.y = e.clientY;
        interactionEnergy = Math.min(interactionEnergy + 8, 100);
    };

    const handleMouseDown = () => {
      pulses.push({
        x: mouse.x, y: mouse.y,
        radius: 10, hue: (time * 50) % 360, life: 1
      });
      // Radial neon lines
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const length = 100 + Math.random() * 150;
        neonLines.push({
          x1: mouse.x, y1: mouse.y,
          x2: mouse.x + Math.cos(angle) * length,
          y2: mouse.y + Math.sin(angle) * length,
          hue: (time * 50 + i * 30) % 360,
          life: 1, width: 3 + Math.random() * 3
        });
      }
      interactionEnergy = 100;
    };

    // Use normalized virtual pointer for mouse/touch
    let lastDownLocal = false;
    const unsubscribePointer = subscribeVirtualPointer((p) => {
      targetMouse.x = p.x;
      targetMouse.y = p.y;
      interactionEnergy = Math.min(interactionEnergy + 8, 100);

      if (p.down && !lastDownLocal) {
        pulses.push({
          x: targetMouse.x, y: targetMouse.y,
          radius: 10, hue: (time * 50) % 360, life: 1
        });
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const length = 100 + Math.random() * 150;
          neonLines.push({
            x1: targetMouse.x, y1: targetMouse.y,
            x2: targetMouse.x + Math.cos(angle) * length,
            y2: targetMouse.y + Math.sin(angle) * length,
            hue: (time * 50 + i * 30) % 360,
            life: 1, width: 3 + Math.random() * 3
          });
        }
        interactionEnergy = 100;
      }
      lastDownLocal = p.down;
    });

    const draw = () => {
      interactionEnergy *= 0.96;
      mouse.x += (targetMouse.x - mouse.x) * 0.08;
      mouse.y += (targetMouse.y - mouse.y) * 0.08;
      time += 0.003 + (interactionEnergy * 0.0008);

      // Fade with neon afterglow
      ctx.fillStyle = 'rgba(10, 5, 20, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dynamic flowing gradient background
      const x1 = (Math.sin(time * 0.3) * 0.5 + 0.5) * canvas.width;
      const y1 = (Math.cos(time * 0.2) * 0.5 + 0.5) * canvas.height;
      const x2 = (Math.sin(time * 0.25 + Math.PI) * 0.5 + 0.5) * canvas.width;
      const y2 = (Math.cos(time * 0.35 + Math.PI) * 0.5 + 0.5) * canvas.height;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      const hue1 = (time * 30) % 360;
      gradient.addColorStop(0, `hsla(${hue1}, 80%, 50%, 0.08)`);
      gradient.addColorStop(0.5, `hsla(${(hue1 + 120) % 360}, 80%, 50%, 0.08)`);
      gradient.addColorStop(1, `hsla(${(hue1 + 240) % 360}, 80%, 50%, 0.08)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pulsing neon grid
      const gridSpacing = 80;
      const gridPulse = Math.sin(time * 2) * 0.5 + 0.5;
      ctx.strokeStyle = `hsla(${(time * 40) % 360}, 100%, 70%, ${0.05 + gridPulse * 0.05 + interactionEnergy * 0.002})`;
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += gridSpacing) {
        const wave = Math.sin(time + x * 0.01) * 10;
        ctx.beginPath();
        ctx.moveTo(x + wave, 0);
        ctx.lineTo(x - wave, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSpacing) {
        const wave = Math.cos(time + y * 0.01) * 10;
        ctx.beginPath();
        ctx.moveTo(0, y + wave);
        ctx.lineTo(canvas.width, y - wave);
        ctx.stroke();
      }

      // Draw neon lines
      for (let i = neonLines.length - 1; i >= 0; i--) {
        const l = neonLines[i];
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);

        // Glow layers
        ctx.strokeStyle = `hsla(${l.hue}, 100%, 70%, ${l.life * 0.3})`;
        ctx.lineWidth = l.width * 4;
        ctx.shadowBlur = 30;
        ctx.shadowColor = `hsla(${l.hue}, 100%, 60%, ${l.life})`;
        ctx.stroke();

        ctx.strokeStyle = `hsla(${l.hue}, 100%, 90%, ${l.life})`;
        ctx.lineWidth = l.width;
        ctx.stroke();

        l.life -= 0.02;
        if (l.life <= 0) neonLines.splice(i, 1);
      }

      // Draw pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${p.hue}, 100%, 70%, ${p.life * 0.5})`;
        ctx.lineWidth = 3 * p.life;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${p.life})`;
        ctx.stroke();

        p.radius += 8;
        p.life -= 0.02;
        if (p.life <= 0) pulses.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // Cursor neon bloom
      const radius = 120 + (Math.sin(time * 4) * 30) + (interactionEnergy * 2.5);
      const bloomHue = (time * 50) % 360;

      // Multiple glow layers
      for (let layer = 3; layer >= 0; layer--) {
        const layerRadius = radius * (1 + layer * 0.3);
        const bloomGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, layerRadius);

        const layerAlpha = (0.15 - layer * 0.03) + interactionEnergy / 400;
        bloomGrad.addColorStop(0, `hsla(${bloomHue}, 100%, 80%, ${layerAlpha})`);
        bloomGrad.addColorStop(0.3, `hsla(${(bloomHue + 40) % 360}, 100%, 70%, ${layerAlpha * 0.6})`);
        bloomGrad.addColorStop(1, 'transparent');

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = bloomGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Trailing sparkle from movement
      if (interactionEnergy > 10 && Math.random() < 0.3) {
        const sparkX = mouse.x + (Math.random() - 0.5) * 60;
        const sparkY = mouse.y + (Math.random() - 0.5) * 60;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${bloomHue}, 100%, 90%, 0.8)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${bloomHue}, 100%, 70%, 1)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
        cancelAnimationFrame(anim);
        unsubscribePointer();
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5]">
      <canvas ref={canvasRef} />
    </div>
  );
};

const GalaxyMode: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    const STAR_COUNT = 500;
    const NEBULA_COUNT = 5;
    let time = 0;
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    interface Star {
      x: number; y: number; z: number; size: number;
      hue: number; alpha: number; twinkleSpeed: number;
      originalX: number; originalY: number;
    }
    interface Nebula {
      x: number; y: number; radius: number;
      hue: number; saturation: number;
      vx: number; vy: number; pulseOffset: number;
    }
    interface ShootingStar {
      x: number; y: number; vx: number; vy: number;
      length: number; life: number; hue: number;
    }
    interface CosmicDust {
      x: number; y: number; size: number; hue: number; alpha: number;
    }

    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    const cosmicDust: CosmicDust[] = [];

    for (let i = 0; i < STAR_COUNT; i++) {
        const z = Math.random();
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        stars.push({
            x, y, originalX: x, originalY: y,
            z: 0.1 + z * 0.9,
            size: 0.5 + z * 2.5,
            hue: Math.random() < 0.8 ? 0 : (180 + Math.random() * 60), // White or blue-ish
            alpha: 0.3 + Math.random() * 0.7,
            twinkleSpeed: 0.5 + Math.random() * 2
        });
    }

    // Cosmic dust layer
    for (let i = 0; i < 100; i++) {
      cosmicDust.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 30 + Math.random() * 80,
        hue: 200 + Math.random() * 100,
        alpha: 0.02 + Math.random() * 0.04
      });
    }

    const nebulae: Nebula[] = [];
    for(let i = 0; i < NEBULA_COUNT; i++) {
        nebulae.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 150 + Math.random() * 350,
            hue: 220 + Math.random() * 100,
            saturation: 40 + Math.random() * 40,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            pulseOffset: Math.random() * Math.PI * 2
        });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
        time += 0.002;

        // Deep space gradient
        const spaceGrad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.8
        );
        spaceGrad.addColorStop(0, '#0a0a1a');
        spaceGrad.addColorStop(0.5, '#050510');
        spaceGrad.addColorStop(1, '#000005');
        ctx.fillStyle = spaceGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cosmic dust (very subtle)
        cosmicDust.forEach(d => {
          const dustGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size);
          dustGrad.addColorStop(0, `hsla(${d.hue}, 40%, 30%, ${d.alpha})`);
          dustGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = dustGrad;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Nebulae with pulsing
        nebulae.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < -n.radius) n.x = canvas.width + n.radius;
            if (n.x > canvas.width + n.radius) n.x = -n.radius;
            if (n.y < -n.radius) n.y = canvas.height + n.radius;
            if (n.y > canvas.height + n.radius) n.y = -n.radius;

            const pulse = Math.sin(time * 0.5 + n.pulseOffset) * 0.2 + 1;
            const r = n.radius * pulse;

            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
            g.addColorStop(0, `hsla(${n.hue}, ${n.saturation}%, 30%, 0.3)`);
            g.addColorStop(0.4, `hsla(${n.hue + 20}, ${n.saturation}%, 25%, 0.15)`);
            g.addColorStop(0.7, `hsla(${n.hue + 40}, ${n.saturation - 10}%, 20%, 0.05)`);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Stars with parallax based on mouse
        stars.forEach(s => {
            const parallaxFactor = s.z * 0.03;
            const offsetX = (mouse.x - canvas.width / 2) * parallaxFactor;
            const offsetY = (mouse.y - canvas.height / 2) * parallaxFactor;
            s.x = s.originalX + offsetX;
            s.y = s.originalY + offsetY;

            // Wrap around
            if (s.x < 0) s.x += canvas.width;
            if (s.x > canvas.width) s.x -= canvas.width;
            if (s.y < 0) s.y += canvas.height;
            if (s.y > canvas.height) s.y -= canvas.height;

            const twinkle = 0.5 + Math.sin(time * s.twinkleSpeed * 3 + s.x) * 0.5;
            const alpha = s.alpha * twinkle;

            if (s.hue === 0) {
              // White/warm stars
              const warmth = Math.random() < 0.3 ? 30 : 0;
              ctx.fillStyle = `hsla(${warmth}, ${warmth > 0 ? 50 : 0}%, ${90 + Math.random() * 10}%, ${alpha})`;
            } else {
              ctx.fillStyle = `hsla(${s.hue}, 80%, 80%, ${alpha})`;
            }

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * twinkle, 0, Math.PI * 2);
            ctx.fill();

            // Occasional star glow
            if (s.size > 2 && twinkle > 0.8) {
              ctx.shadowBlur = 10;
              ctx.shadowColor = s.hue === 0 ? '#ffffff' : `hsl(${s.hue}, 80%, 70%)`;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
        });

        // Shooting stars
        if (Math.random() < 0.008) {
          const angle = Math.PI * 0.75 + (Math.random() - 0.5) * 0.5;
          const speed = 8 + Math.random() * 12;
          shootingStars.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length: 80 + Math.random() * 120,
            life: 1,
            hue: Math.random() < 0.7 ? 0 : (180 + Math.random() * 60)
          });
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const ss = shootingStars[i];

          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(ss.x - ss.vx * (ss.length / 15), ss.y - ss.vy * (ss.length / 15));

          const grad = ctx.createLinearGradient(
            ss.x, ss.y,
            ss.x - ss.vx * (ss.length / 15), ss.y - ss.vy * (ss.length / 15)
          );

          const color = ss.hue === 0 ? '255, 255, 255' : `${ss.hue}, 80%, 80%`;
          grad.addColorStop(0, ss.hue === 0
            ? `rgba(${color}, ${ss.life})`
            : `hsla(${color}, ${ss.life})`);
          grad.addColorStop(1, 'transparent');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 15;
          ctx.shadowColor = ss.hue === 0 ? '#ffffff' : `hsl(${ss.hue}, 80%, 70%)`;
          ctx.stroke();
          ctx.shadowBlur = 0;

          ss.x += ss.vx;
          ss.y += ss.vy;
          ss.life -= 0.015;

          if (ss.life <= 0 || ss.y > canvas.height + 50) {
            shootingStars.splice(i, 1);
          }
        }

        requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[0]">
      <canvas ref={canvasRef} />
    </div>
  );
};

const FireBlaze: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    interface Ember {
      x: number; y: number; vx: number; vy: number;
      size: number; life: number; maxLife: number;
      hue: number; turbulence: number;
    }

    interface Flame {
      x: number; baseY: number; height: number;
      width: number; hue: number; phase: number;
    }

    const embers: Ember[] = [];
    const flames: Flame[] = [];
    let mouse = { x: canvas.width / 2, y: canvas.height };
    let lastMouse = { ...mouse };
    let intensity = 0;
    let time = 0;

    // Create flame sources at bottom
    const flameCount = Math.floor(canvas.width / 100);
    for (let i = 0; i < flameCount; i++) {
      flames.push({
        x: (i + 0.5) * (canvas.width / flameCount),
        baseY: canvas.height,
        height: 150 + Math.random() * 100,
        width: 60 + Math.random() * 40,
        hue: 10 + Math.random() * 25,
        phase: Math.random() * Math.PI * 2
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseDown = () => {
      intensity = 100;
      // Burst of embers
      for (let i = 0; i < 40; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const speed = 5 + Math.random() * 10;
        embers.push({
          x: mouse.x, y: mouse.y,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 8,
          life: 1, maxLife: 1,
          hue: 15 + Math.random() * 35,
          turbulence: Math.random() * 2
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const draw = () => {
      time += 0.016;
      intensity *= 0.97;

      // Fade with heat distortion effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw flames at bottom
      flames.forEach(f => {
        const wave = Math.sin(time * 3 + f.phase) * 20;
        const flicker = 0.8 + Math.sin(time * 8 + f.x) * 0.2;
        const height = f.height * flicker * (1 + intensity * 0.01);

        // Multiple flame layers
        for (let layer = 3; layer >= 0; layer--) {
          const layerHeight = height * (1 - layer * 0.2);
          const layerWidth = f.width * (1 - layer * 0.15);
          const layerHue = f.hue + layer * 10;
          const alpha = 0.4 - layer * 0.08;

          ctx.beginPath();
          ctx.moveTo(f.x - layerWidth / 2, f.baseY);

          // Curved flame shape
          ctx.bezierCurveTo(
            f.x - layerWidth / 2 + wave * 0.3, f.baseY - layerHeight * 0.4,
            f.x - layerWidth / 4 + wave * 0.5, f.baseY - layerHeight * 0.7,
            f.x + wave, f.baseY - layerHeight
          );
          ctx.bezierCurveTo(
            f.x + layerWidth / 4 + wave * 0.5, f.baseY - layerHeight * 0.7,
            f.x + layerWidth / 2 + wave * 0.3, f.baseY - layerHeight * 0.4,
            f.x + layerWidth / 2, f.baseY
          );

          const flameGrad = ctx.createLinearGradient(f.x, f.baseY, f.x, f.baseY - layerHeight);
          flameGrad.addColorStop(0, `hsla(${layerHue}, 100%, 50%, ${alpha})`);
          flameGrad.addColorStop(0.3, `hsla(${layerHue + 15}, 100%, 60%, ${alpha * 0.8})`);
          flameGrad.addColorStop(0.6, `hsla(${layerHue + 30}, 90%, 55%, ${alpha * 0.4})`);
          flameGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = flameGrad;
          ctx.shadowBlur = layer === 0 ? 30 : 0;
          ctx.shadowColor = `hsl(${layerHue}, 100%, 50%)`;
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;

      // Mouse movement creates embers
      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      intensity = Math.min(intensity + speed * 0.5, 100);

      if (speed > 3) {
        const count = Math.min(Math.floor(speed / 4), 5);
        for (let i = 0; i < count; i++) {
          embers.push({
            x: mouse.x + (Math.random() - 0.5) * 30,
            y: mouse.y + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 4,
            size: 2 + Math.random() * 5,
            life: 1, maxLife: 1,
            hue: 15 + Math.random() * 30,
            turbulence: Math.random() * 1.5
          });
        }
      }

      // Ambient rising embers
      if (Math.random() < 0.15 + intensity * 0.005) {
        embers.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -1.5 - Math.random() * 3,
          size: 2 + Math.random() * 6,
          life: 1, maxLife: 1,
          hue: 10 + Math.random() * 35,
          turbulence: 0.5 + Math.random()
        });
      }

      lastMouse = { ...mouse };

      // Draw embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];

        // Turbulent movement
        e.x += e.vx + Math.sin(time * 5 + e.y * 0.02) * e.turbulence;
        e.y += e.vy;
        e.vy *= 0.99; // Slow down
        e.vy -= 0.02; // Rise faster
        e.life -= 0.008;

        if (e.life <= 0 || e.y < -50) {
          embers.splice(i, 1);
          continue;
        }

        const lifeRatio = e.life / e.maxLife;
        const size = e.size * (0.3 + lifeRatio * 0.7);
        const brightness = 50 + lifeRatio * 50;

        // Core
        ctx.beginPath();
        ctx.arc(e.x, e.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue + (1 - lifeRatio) * 20}, 100%, ${brightness}%, ${e.life})`;
        ctx.shadowBlur = 15 * e.life;
        ctx.shadowColor = `hsl(${e.hue}, 100%, 60%)`;
        ctx.fill();

        // Outer glow
        ctx.beginPath();
        ctx.arc(e.x, e.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue}, 100%, 50%, ${e.life * 0.2})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Heat distortion overlay around mouse
      if (intensity > 20) {
        const heatGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
        heatGrad.addColorStop(0, `rgba(255, 100, 0, ${intensity * 0.002})`);
        heatGrad.addColorStop(0.5, `rgba(255, 50, 0, ${intensity * 0.001})`);
        heatGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};

// Chroma Aura - Rainbow pulsing effect
const ChromaAura: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let time = 0;
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let energy = 0;

    interface Wave { angle: number; speed: number; amplitude: number; hue: number; }
    interface Ring { x: number; y: number; radius: number; hue: number; life: number; }

    const waves: Wave[] = [];
    const rings: Ring[] = [];

    for (let i = 0; i < 6; i++) {
      waves.push({
        angle: (i / 6) * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
        amplitude: 50 + Math.random() * 100,
        hue: (i / 6) * 360
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      energy = Math.min(energy + 3, 100);
    };

    const handleMouseDown = () => {
      for (let i = 0; i < 7; i++) {
        rings.push({
          x: mouse.x, y: mouse.y,
          radius: 10,
          hue: i * 51,
          life: 1
        });
      }
      energy = 100;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const draw = () => {
      time += 0.008;
      energy *= 0.97;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background gradient that shifts through spectrum
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      );
      const baseHue = (time * 30) % 360;
      bgGrad.addColorStop(0, `hsla(${baseHue}, 60%, 15%, 0.05)`);
      bgGrad.addColorStop(0.5, `hsla(${(baseHue + 120) % 360}, 60%, 10%, 0.03)`);
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw prismatic waves
      ctx.lineWidth = 3;
      waves.forEach((w, idx) => {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 5) {
          const y = canvas.height / 2 +
            Math.sin(x * 0.01 + time * w.speed + w.angle) * (w.amplitude + energy * 0.5) +
            Math.sin(x * 0.005 + time * 0.3) * 30;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const waveHue = (w.hue + time * 20) % 360;
        ctx.strokeStyle = `hsla(${waveHue}, 80%, 60%, 0.4)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${waveHue}, 100%, 50%)`;
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      // Draw expanding rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${r.hue}, 90%, 60%, ${r.life * 0.6})`;
        ctx.lineWidth = 4 * r.life;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsl(${r.hue}, 100%, 50%)`;
        ctx.stroke();

        r.radius += 6;
        r.life -= 0.015;
        if (r.life <= 0) rings.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // Cursor aura with rainbow gradient
      const auraSize = 100 + energy * 1.5 + Math.sin(time * 3) * 20;
      for (let i = 0; i < 7; i++) {
        const hue = ((time * 50) + i * 51) % 360;
        const ringRadius = auraSize * (0.4 + i * 0.1);

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.3 - i * 0.03})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5]">
      <canvas ref={canvasRef} />
    </div>
  );
};

// Singularity Engine - Black hole gravity effect
const SingularityEngine: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let time = 0;
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let singularityPower = 50;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; hue: number; life: number;
      orbitRadius: number; orbitAngle: number; orbitSpeed: number;
    }

    interface DistortionRing {
      radius: number; thickness: number; speed: number;
    }

    const particles: Particle[] = [];
    const distortionRings: DistortionRing[] = [];

    // Create orbiting particles
    for (let i = 0; i < 200; i++) {
      const radius = 100 + Math.random() * 300;
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        vx: 0, vy: 0,
        size: 1 + Math.random() * 3,
        hue: 260 + Math.random() * 60,
        life: 0.5 + Math.random() * 0.5,
        orbitRadius: radius,
        orbitAngle: angle,
        orbitSpeed: (0.5 + Math.random() * 1) / Math.sqrt(radius) * 0.3
      });
    }

    // Distortion rings
    for (let i = 0; i < 8; i++) {
      distortionRings.push({
        radius: 50 + i * 40,
        thickness: 2 + Math.random() * 3,
        speed: 0.3 + Math.random() * 0.4
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseDown = () => {
      singularityPower = 200;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const draw = () => {
      time += 0.01;
      singularityPower = Math.max(50, singularityPower * 0.98);

      // Deep void background
      ctx.fillStyle = '#030308';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gravitational lensing effect
      const lensGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, singularityPower * 3);
      lensGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      lensGrad.addColorStop(0.3, 'rgba(20, 10, 40, 0.8)');
      lensGrad.addColorStop(0.6, 'rgba(60, 20, 100, 0.3)');
      lensGrad.addColorStop(0.8, 'rgba(100, 50, 150, 0.1)');
      lensGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, singularityPower * 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw distortion rings
      distortionRings.forEach((ring, i) => {
        const wobble = Math.sin(time * ring.speed * 3 + i) * 5;
        const scaledRadius = (ring.radius + wobble) * (singularityPower / 50);

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, scaledRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${280 + i * 10}, 80%, ${40 + i * 5}%, ${0.3 - i * 0.03})`;
        ctx.lineWidth = ring.thickness;
        ctx.stroke();
      });

      // Update and draw particles
      particles.forEach(p => {
        // Calculate distance to singularity
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < singularityPower * 0.5) {
          // Respawn at edge
          const angle = Math.random() * Math.PI * 2;
          const radius = 300 + Math.random() * 200;
          p.x = mouse.x + Math.cos(angle) * radius;
          p.y = mouse.y + Math.sin(angle) * radius;
          p.orbitAngle = angle;
          p.orbitRadius = radius;
        } else {
          // Spiral inward
          const gravityStrength = (singularityPower * 2) / (dist * dist) * 50;
          p.vx += (dx / dist) * gravityStrength;
          p.vy += (dy / dist) * gravityStrength;

          // Add tangential velocity for spiral
          p.vx += (-dy / dist) * 0.5;
          p.vy += (dx / dist) * 0.5;

          p.vx *= 0.98;
          p.vy *= 0.98;

          p.x += p.vx;
          p.y += p.vy;
        }

        // Draw particle with trail
        const alpha = Math.min(1, dist / 100) * p.life;
        const stretch = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        ctx.beginPath();
        if (stretch > 2) {
          // Stretched particle
          ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
          ctx.lineWidth = p.size;
          ctx.stroke();
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
          ctx.fill();
        }
      });

      // Event horizon glow
      const horizonGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, singularityPower * 0.6
      );
      horizonGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      horizonGrad.addColorStop(0.7, 'rgba(80, 0, 160, 0.5)');
      horizonGrad.addColorStop(1, 'rgba(150, 50, 255, 0)');
      ctx.fillStyle = horizonGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, singularityPower * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Central void
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, singularityPower * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5]">
      <canvas ref={canvasRef} />
    </div>
  );
};

// Event Horizon UI - Warped space-time UI effect
const EventHorizonUI: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let time = 0;
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let warpIntensity = 0;

    interface GridPoint { x: number; y: number; baseX: number; baseY: number; }
    interface Ripple { x: number; y: number; radius: number; life: number; }

    const gridPoints: GridPoint[] = [];
    const ripples: Ripple[] = [];
    const gridSpacing = 40;

    // Create grid
    for (let x = 0; x <= canvas.width + gridSpacing; x += gridSpacing) {
      for (let y = 0; y <= canvas.height + gridSpacing; y += gridSpacing) {
        gridPoints.push({ x, y, baseX: x, baseY: y });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      warpIntensity = Math.min(warpIntensity + 2, 100);
    };

    const handleMouseDown = () => {
      ripples.push({ x: mouse.x, y: mouse.y, radius: 10, life: 1 });
      warpIntensity = 100;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const draw = () => {
      time += 0.01;
      warpIntensity *= 0.97;

      ctx.fillStyle = 'rgba(5, 5, 15, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update grid points with gravitational warping
      gridPoints.forEach(p => {
        const dx = mouse.x - p.baseX;
        const dy = mouse.y - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const warpRadius = 200 + warpIntensity * 2;
        if (dist < warpRadius) {
          const warpStrength = (1 - dist / warpRadius) * (30 + warpIntensity * 0.5);
          p.x = p.baseX + (dx / dist) * warpStrength;
          p.y = p.baseY + (dy / dist) * warpStrength;
        } else {
          p.x = p.baseX + Math.sin(time + p.baseX * 0.01) * 2;
          p.y = p.baseY + Math.cos(time + p.baseY * 0.01) * 2;
        }

        // Apply ripple distortion
        ripples.forEach(r => {
          const rdx = p.x - r.x;
          const rdy = p.y - r.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);

          if (Math.abs(rdist - r.radius) < 30) {
            const rippleEffect = Math.sin((rdist - r.radius) * 0.2) * 10 * r.life;
            p.x += (rdx / rdist) * rippleEffect;
            p.y += (rdy / rdist) * rippleEffect;
          }
        });
      });

      // Draw grid lines
      ctx.strokeStyle = `hsla(220, 80%, 50%, ${0.2 + warpIntensity * 0.003})`;
      ctx.lineWidth = 1;

      const cols = Math.ceil(canvas.width / gridSpacing) + 1;
      const rows = Math.ceil(canvas.height / gridSpacing) + 1;

      // Horizontal lines
      for (let row = 0; row < rows; row++) {
        ctx.beginPath();
        for (let col = 0; col < cols; col++) {
          const idx = col * rows + row;
          const p = gridPoints[idx];
          if (p) {
            if (col === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      // Vertical lines
      for (let col = 0; col < cols; col++) {
        ctx.beginPath();
        for (let row = 0; row < rows; row++) {
          const idx = col * rows + row;
          const p = gridPoints[idx];
          if (p) {
            if (row === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      // Draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(260, 100%, 70%, ${r.life * 0.5})`;
        ctx.lineWidth = 3 * r.life;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(150, 100, 255, 0.5)';
        ctx.stroke();

        r.radius += 8;
        r.life -= 0.015;
        if (r.life <= 0) ripples.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // Center point glow
      const centerGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100);
      centerGrad.addColorStop(0, `hsla(260, 100%, 70%, ${0.3 + warpIntensity * 0.005})`);
      centerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[3]">
      <canvas ref={canvasRef} />
    </div>
  );
};

// Quantum Afterimage - Motion blur trail effect
const QuantumAfterimage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let time = 0;
    const mouseHistory: {x: number, y: number, time: number}[] = [];
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let quantumState = 0;

    interface QuantumParticle {
      x: number; y: number; targetX: number; targetY: number;
      size: number; hue: number; phase: number; entangled: boolean;
    }

    interface Superposition {
      x: number; y: number; copies: {dx: number, dy: number, alpha: number}[];
      life: number;
    }

    const particles: QuantumParticle[] = [];
    const superpositions: Superposition[] = [];

    // Create quantum particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        size: 2 + Math.random() * 4,
        hue: 180 + Math.random() * 60,
        phase: Math.random() * Math.PI * 2,
        entangled: Math.random() < 0.3
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseHistory.push({ x: e.clientX, y: e.clientY, time: Date.now() });

      // Keep only recent history
      while (mouseHistory.length > 30) mouseHistory.shift();

      quantumState = Math.min(quantumState + 5, 100);
    };

    const handleMouseDown = () => {
      // Create superposition effect
      superpositions.push({
        x: mouse.x, y: mouse.y,
        copies: Array.from({length: 5}, (_, i) => ({
          dx: (Math.random() - 0.5) * 100,
          dy: (Math.random() - 0.5) * 100,
          alpha: 0.8 - i * 0.15
        })),
        life: 1
      });
      quantumState = 100;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const draw = () => {
      time += 0.01;
      quantumState *= 0.97;

      ctx.fillStyle = 'rgba(5, 10, 20, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw mouse trail with quantum blur
      if (mouseHistory.length > 2) {
        const now = Date.now();

        for (let i = 1; i < mouseHistory.length; i++) {
          const p1 = mouseHistory[i - 1];
          const p2 = mouseHistory[i];
          const age = (now - p2.time) / 500;

          if (age < 1) {
            const alpha = (1 - age) * 0.6;
            const hue = (180 + (1 - age) * 40) % 360;

            // Main trail
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
            ctx.lineWidth = 3 * (1 - age);
            ctx.shadowBlur = 15;
            ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            ctx.stroke();

            // Quantum copies (slightly offset)
            for (let c = 0; c < 3; c++) {
              const offset = (c + 1) * 8 * age;
              ctx.beginPath();
              ctx.moveTo(p1.x + (Math.random() - 0.5) * offset, p1.y + (Math.random() - 0.5) * offset);
              ctx.lineTo(p2.x + (Math.random() - 0.5) * offset, p2.y + (Math.random() - 0.5) * offset);
              ctx.strokeStyle = `hsla(${hue + 20 * c}, 60%, 50%, ${alpha * 0.3})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
        ctx.shadowBlur = 0;
      }

      // Update and draw quantum particles
      particles.forEach(p => {
        // Quantum tunneling to target
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5 || Math.random() < 0.02) {
          // Quantum jump to new target
          p.targetX = mouse.x + (Math.random() - 0.5) * 300;
          p.targetY = mouse.y + (Math.random() - 0.5) * 300;
        }

        // Probability wave movement
        p.phase += 0.1;
        const wave = Math.sin(p.phase) * 3;
        p.x += dx * 0.02 + wave * (dy / (dist || 1)) * 0.1;
        p.y += dy * 0.02 - wave * (dx / (dist || 1)) * 0.1;

        // Draw with uncertainty blur
        const uncertainty = 3 + Math.sin(time * 5 + p.phase) * 2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.8)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
        ctx.fill();

        // Uncertainty cloud
        for (let u = 0; u < 3; u++) {
          ctx.beginPath();
          ctx.arc(
            p.x + (Math.random() - 0.5) * uncertainty * 2,
            p.y + (Math.random() - 0.5) * uncertainty * 2,
            p.size * 0.5,
            0, Math.PI * 2
          );
          ctx.fillStyle = `hsla(${p.hue}, 60%, 50%, 0.2)`;
          ctx.fill();
        }

        // Entanglement lines
        if (p.entangled) {
          const partner = particles.find(p2 => p2 !== p && p2.entangled);
          if (partner) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(partner.x, partner.y);
            ctx.strokeStyle = `hsla(${p.hue}, 50%, 50%, ${0.1 + Math.sin(time * 3) * 0.05})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      ctx.shadowBlur = 0;

      // Draw superpositions
      for (let i = superpositions.length - 1; i >= 0; i--) {
        const s = superpositions[i];

        s.copies.forEach(c => {
          ctx.beginPath();
          ctx.arc(s.x + c.dx * (1 - s.life), s.y + c.dy * (1 - s.life), 8 * s.life, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(200, 80%, 60%, ${c.alpha * s.life})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(100, 200, 255, 0.5)';
          ctx.fill();
        });

        s.life -= 0.02;
        if (s.life <= 0) superpositions.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5]">
      <canvas ref={canvasRef} />
    </div>
  );
};


// --- Sub-Components ---

const AuthScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [needsRegistration, setNeedsRegistration] = useState(true);

  // Registration fields
  const [displayName, setDisplayName] = useState('');
  const [loginName, setLoginName] = useState('');

  // Login field
  const [loginNameInput, setLoginNameInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user already has login_name
  useEffect(() => {
    (async () => {
      try {
        const res = await bootstrapServerUser();
        if (res && res.user) {
          // Check if user has login_name (already registered)
          const hasLoginName = res.user.login_name || (res.user as any).loginName;
          setNeedsRegistration(!hasLoginName);
        }
      } catch (e) {
        console.warn('[AuthScreen] bootstrapServerUser failed', e);
        // Assume needs registration on error
        setNeedsRegistration(true);
      } finally {
        setIsChecking(false);
      }
    })();
  }, []);

  const handleRegister = async () => {
    if (!displayName.trim()) {
      setError('Bitte gib einen Display-Namen ein');
      return;
    }
    if (displayName.trim().length < 2) {
      setError('Display-Name muss mindestens 2 Zeichen lang sein');
      return;
    }
    if (displayName.trim().length > 30) {
      setError('Display-Name darf maximal 30 Zeichen lang sein');
      return;
    }
    if (!loginName.trim()) {
      setError('Bitte gib einen Login-Namen ein');
      return;
    }
    if (loginName.trim().length < 4) {
      setError('Login-Name muss mindestens 4 Zeichen lang sein');
      return;
    }
    if (loginName.trim().length > 30) {
      setError('Login-Name darf maximal 30 Zeichen lang sein');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await AuthService.register(displayName.trim(), loginName.trim());
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginNameInput.trim()) {
      setError('Bitte gib deinen Login-Namen ein');
      return;
    }
    if (loginNameInput.trim().length < 4) {
      setError('Login-Name muss mindestens 4 Zeichen lang sein');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await AuthService.login(loginNameInput.trim());
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
          <h1 className="text-4xl font-black italic uppercase mb-2 text-indigo-600">MathMaster</h1>
          <p className="text-slate-400 mb-4">Lade...</p>
        </div>
      </div>
    );
  }

  if (needsRegistration) {
    // Registration screen
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
          <h1 className="text-4xl font-black italic uppercase mb-2 text-indigo-600">MathMaster</h1>
          <p className="text-slate-400 mb-2 font-medium">Registriere dich für Battles</p>
          <p className="text-xs text-slate-400 mb-6">Wähle einen Display-Namen und einen Login-Namen</p>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-600 mb-1 text-left">Display-Name</label>
            <input
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError(null);
              }}
              placeholder="Dein Anzeigename (kann später geändert werden)"
              className="w-full p-4 bg-slate-100 rounded-xl mb-2 font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              maxLength={30}
            />
            <p className="text-xs text-slate-400 text-left">2-30 Zeichen</p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-600 mb-1 text-left">Login-Name</label>
            <input
              value={loginName}
              onChange={(e) => {
                setLoginName(e.target.value);
                setError(null);
              }}
              placeholder="Dein Login-Name (einzigartig, zum Einloggen)"
              className="w-full p-4 bg-slate-100 rounded-xl mb-2 font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              maxLength={30}
            />
            <p className="text-xs text-slate-400 text-left">Mindestens 4 Zeichen, muss einzigartig sein</p>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}
          <Button onClick={handleRegister} isLoading={loading} className="w-full">
            Registrieren & Starten 🚀
          </Button>
        </div>
      </div>
    );
  }

  // Login screen
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-black italic uppercase mb-2 text-indigo-600">MathMaster</h1>
        <p className="text-slate-400 mb-2 font-medium">Willkommen zurück!</p>
        <p className="text-xs text-slate-400 mb-6">Gib deinen Login-Namen ein</p>
        <input
          value={loginNameInput}
          onChange={(e) => {
            setLoginNameInput(e.target.value);
            setError(null);
          }}
          placeholder="Login-Name eingeben..."
          className="w-full p-4 bg-slate-100 rounded-xl mb-2 font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          maxLength={30}
        />
        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}
        <Button onClick={handleLogin} isLoading={loading} className="w-full">
          Einloggen 🚀
        </Button>
      </div>
    </div>
  );
};

const ChatView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const channelId = 'class:global';
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isRealtimeReady, setIsRealtimeReady] = useState(false);
  const lastTimestampRef = useRef<number | undefined>(undefined);

  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    setChat(prev => {
      const seen = new Set(prev.map(m => m.id));
      const next = [...prev];
      incoming.forEach(m => {
        if (!seen.has(m.id)) {
          next.push(m);
          seen.add(m.id);
        }
      });
      return next.slice(-200);
    });
    const newest = incoming[incoming.length - 1];
    if (newest?.timestamp) {
      lastTimestampRef.current = Math.max(lastTimestampRef.current || 0, newest.timestamp);
    }
  }, []);

  const mapRecordToMessage = useCallback(
    (record: any): ChatMessage => ({
      id: record.id || `local-${Date.now()}`,
      userId: record.sender_id || record.userId || 'unknown',
      username: record.username || 'Anonym',
      text: record.text,
      timestamp: record.created_at ? new Date(record.created_at).valueOf() : Date.now(),
      avatar: record.avatar || '👤',
    }),
    []
  );

  const loadChat = useCallback(async () => {
    const msgs = await SocialService.getChatMessages(channelId, lastTimestampRef.current);
    mergeMessages(msgs);
  }, [channelId, mergeMessages]);

  useEffect(() => {
    loadChat();
    const interval = setInterval(loadChat, 8000);
    return () => clearInterval(interval);
  }, [loadChat]);

  useEffect(() => {
    const client = getRealtimeClient();
    if (!client) return;
    const channel = client.channel(`messages:${channelId}`);
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        payload => {
          if (payload.new) {
            mergeMessages([mapRecordToMessage(payload.new)]);
          }
        }
      )
      .subscribe(status => {
        setIsRealtimeReady(status === 'SUBSCRIBED');
      });
    return () => {
      client.removeChannel(channel);
      setIsRealtimeReady(false);
    };
  }, [channelId, mapRecordToMessage, mergeMessages]);

  const send = async () => {
    if (!msg.trim()) return;
    const text = msg.trim();
    setMsg('');
    await SocialService.sendMessage(currentUser, text, channelId);
    await loadChat();
  };

  return (
    <GlassCard className="h-full flex flex-col !p-0 overflow-hidden col-span-2" style={{
      background: 'linear-gradient(135deg, #1a3a1a 0%, #0d1f0d 100%)',
      border: '4px solid #2d4a2d',
      borderRadius: '20px',
      boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 100, 0, 0.3)',
    }}>
      <div className="p-3 border-b-2 border-green-800 bg-green-900/50 flex items-center justify-between" style={{
        borderStyle: 'solid',
        borderWidth: '2px 0',
      }}>
        <CardTitle className="text-green-300" style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          letterSpacing: '2px',
          textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
        }}>BLOOD DOME CHAT</CardTitle>
        <span className={`text-[8px] font-black uppercase tracking-widest ${isRealtimeReady ? 'text-green-400' : 'text-green-700'}`} style={{
          fontFamily: 'monospace',
          textShadow: isRealtimeReady ? '0 0 3px rgba(0, 255, 0, 0.8)' : 'none',
        }}>
          {isRealtimeReady ? '● LIVE' : '○ OFFLINE'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar flex flex-col-reverse" style={{
        background: '#0a1a0a',
        fontFamily: 'monospace',
      }}>
        {[...chat].reverse().map(c => (
          <div key={c.id} className={`flex gap-2 ${c.userId === currentUser.id ? 'flex-row-reverse' : ''}`}>
            <div className="w-6 h-6 rounded-sm bg-green-900 flex items-center justify-center text-xs border border-green-700" style={{
              fontFamily: 'monospace',
              boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.5)',
            }}>
              {c.avatar}
            </div>
            <div
              className={`max-w-[80%] p-2 rounded-sm text-xs leading-tight ${
                c.type === 'system'
                  ? 'bg-yellow-900 text-yellow-300 border border-yellow-700 w-full text-center'
                  : c.userId === currentUser.id
                  ? 'bg-green-800 text-green-100 border border-green-600'
                  : 'bg-green-900 text-green-200 border border-green-700'
              }`}
              style={{
                fontFamily: 'monospace',
                boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.5)',
                textShadow: '0 0 2px rgba(0, 0, 0, 0.8)',
              }}
            >
              {c.type !== 'system' && (
                <div
                  className={`text-[8px] font-black uppercase mb-1 ${
                    c.userId === currentUser.id ? 'text-green-300' : 'text-green-400'
                  }`}
                  style={{ fontFamily: 'monospace' }}
                >
                  {c.username}
                </div>
              )}
              <div style={{ fontFamily: 'monospace', lineHeight: '1.4' }}>{c.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-green-900 border-t-2 border-green-800 flex gap-2" style={{
        borderStyle: 'solid',
      }}>
        <input
          className="flex-1 bg-green-950 border-2 border-green-700 rounded-sm px-3 py-2 text-xs font-bold outline-none text-green-200 placeholder-green-600"
          placeholder="Type message..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          style={{
            fontFamily: 'monospace',
            boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.5)',
          }}
        />
        <button
          onClick={send}
          className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 border-2 border-green-600 rounded-sm font-black uppercase text-xs"
          style={{
            fontFamily: 'monospace',
            boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          SEND
        </button>
      </div>
    </GlassCard>
  );
};

// Mini Matrix Rain Effect for player cards
const MiniMatrixRain: React.FC<{ containerRef: React.RefObject<HTMLDivElement> }> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -50);
    const speeds: number[] = new Array(columns).fill(0).map(() => 0.3 + Math.random() * 0.7);
    const chars = "0123456789+-×÷=√π";

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 8, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const char = chars[Math.floor(Math.random() * chars.length)];

        if (y > 0 && y < canvas.height) {
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00ff88';
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
          ctx.fillText(char, x, y);
          ctx.restore();
        }

        const trailLength = 8;
        for (let j = 1; j < trailLength; j++) {
          const trailY = y - j * fontSize;
          if (trailY > 0 && trailY < canvas.height) {
            const alpha = Math.max(0, 1 - j / trailLength);
            const green = Math.floor(255 * alpha);
            ctx.fillStyle = `rgba(0, ${green}, ${Math.floor(green * 0.4)}, ${alpha * 0.6})`;
            ctx.font = `${fontSize}px 'Courier New', monospace`;
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, trailY);
          }
        }

        drops[i] += speeds[i];
        if (drops[i] * fontSize > canvas.height + 100) {
          drops[i] = Math.random() * -10;
          speeds[i] = 0.3 + Math.random() * 0.7;
        }
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, [size, containerRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />;
};

// Mini Electric Storm Effect for player cards
const MiniElectricStorm: React.FC<{ containerRef: React.RefObject<HTMLDivElement> }> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    interface Bolt {
      path: {x: number, y: number}[];
      life: number;
      width: number;
      hue: number;
    }

    const bolts: Bolt[] = [];
    let globalEnergy = 50;

    function createBolt(x: number, y: number, length: number) {
      const path = [{x, y}];
      const baseAngle = Math.random() * Math.PI * 2;
      let currX = x;
      let currY = y;
      const segments = Math.floor(length / 3);

      for(let i=0; i<segments; i++) {
        const jitter = 8;
        currX += Math.cos(baseAngle) * 3 + (Math.random() - 0.5) * jitter;
        currY += Math.sin(baseAngle) * 3 + (Math.random() - 0.5) * jitter;
        path.push({x: currX, y: currY});
      }

      bolts.push({
        path,
        life: 1.0,
        width: 1 + Math.random(),
        hue: 180 + Math.random() * 60,
      });
    }

    const draw = () => {
      globalEnergy *= 0.95;
      ctx.fillStyle = `rgba(5, 10, 25, 0.1)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.05 + globalEnergy * 0.001) {
        createBolt(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          30 + Math.random() * 40
        );
        globalEnergy = Math.min(globalEnergy + 10, 100);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        if (b.path.length < 2) {
          bolts.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(b.path[0].x, b.path[0].y);
        for (let j = 1; j < b.path.length; j++) {
          ctx.lineTo(b.path[j].x, b.path[j].y);
        }

        ctx.strokeStyle = `hsla(${b.hue}, 100%, 70%, ${b.life * 0.6})`;
        ctx.lineWidth = b.width * b.life;
        ctx.shadowBlur = 8 * b.life;
        ctx.shadowColor = `hsl(${b.hue}, 100%, 60%)`;
        ctx.stroke();

        b.life -= 0.05;
        if (b.life <= 0) bolts.splice(i, 1);
      }

      ctx.shadowBlur = 0;
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, [size, containerRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-50" />;
};

// Blood Dome User Modal - Enhanced with visual effects and progress system
const BloodDomeUserModal: React.FC<{
  user: User & { battleStats?: { total: number; wins: number; win_rate: number } };
  currentUserId: string;
  onChallenge: (u: User) => void;
  isDarkMode?: boolean;
  currentUser?: User;
  isLoading?: boolean;
}> = ({ user, currentUserId, onChallenge, isDarkMode = false, currentUser, isLoading = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rarity = getAvatarRarity(user.avatar);
  const battleStats = user.battleStats || { total: 0, wins: 0, win_rate: 0 };
  const perfectBounties = (user as any).perfectBountyUnits?.length || 0;
  const isCurrentUser = user.id === currentUserId;

  // Check if current user can challenge (registered and has enough coins)
  const canChallenge = currentUser &&
    currentUser.username &&
    currentUser.username.trim().length >= 2 &&
    currentUser.username !== 'User' &&
    Number.isFinite(currentUser.coins) &&
    currentUser.coins >= 25; // Minimum stake for battles

  // Coin-based styling (more coins = more golden/saturated)
  const coins = user.coins || 0;
  const coinTier = coins < 500 ? 'bronze' : coins < 2000 ? 'silver' : coins < 5000 ? 'gold' : coins < 10000 ? 'platinum' : 'diamond';
  const coinStyles: Record<string, { bg: string; text: string; icon: string; size: string; glow?: string }> = {
    bronze: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', icon: 'text-lg', size: 'text-base' },
    silver: { bg: 'bg-slate-100 dark:bg-slate-700/30', text: 'text-slate-700 dark:text-slate-300', icon: 'text-xl', size: 'text-lg' },
    gold: { bg: 'bg-amber-200 dark:bg-amber-800/40', text: 'text-amber-800 dark:text-amber-200', icon: 'text-2xl', size: 'text-xl font-extrabold' },
    platinum: { bg: 'bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-800/50 dark:to-amber-700/50', text: 'text-amber-900 dark:text-amber-100', icon: 'text-2xl', size: 'text-xl font-black' },
    diamond: { bg: 'bg-gradient-to-r from-cyan-200 via-amber-200 to-cyan-200 dark:from-cyan-800/60 dark:via-amber-800/60 dark:to-cyan-800/60', text: 'text-amber-950 dark:text-amber-50', icon: 'text-3xl', size: 'text-2xl font-black', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]' },
  };
  const coinStyle = coinStyles[coinTier];

  // Progress-based border (belt system: light blue → chrom)
  const beltLevel = Math.min(Math.floor(perfectBounties / 3), 8); // 0-8 levels
  const beltColors = [
    { border: 'border-blue-200', glow: 'shadow-blue-200/30' }, // Level 0-1: Light Blue
    { border: 'border-blue-300', glow: 'shadow-blue-300/40' },
    { border: 'border-blue-400', glow: 'shadow-blue-400/50' }, // Level 2-3: Blue
    { border: 'border-indigo-400', glow: 'shadow-indigo-400/50' },
    { border: 'border-purple-400', glow: 'shadow-purple-400/60' }, // Level 4-5: Purple
    { border: 'border-purple-500', glow: 'shadow-purple-500/70' },
    { border: 'border-amber-400', glow: 'shadow-amber-400/70' }, // Level 6-7: Gold
    { border: 'border-amber-500', glow: 'shadow-amber-500/80' },
    { border: 'border-cyan-300', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.8)]' }, // Level 8: Chrom
  ];
  const beltStyle = beltColors[Math.min(beltLevel, beltColors.length - 1)];

  // Active effects
  const activeEffects = user.activeEffects || [];
  const hasRain = activeEffects.includes('rain');
  const hasStorm = activeEffects.includes('storm');

  // Unlocked tools/features for icon bar
  const unlockedTools = user.unlockedTools || [];
  const hasFormelRechner = unlockedTools.includes('formel_rechner');
  const hasSchrittLoeser = unlockedTools.includes('schritt_loeser');
  const hasSpickerTrainer = unlockedTools.includes('spicker_trainer');
  const hasScheitelCoach = unlockedTools.includes('scheitel_coach');
  const hasFormelsammlung = user.formelsammlungSkin && user.formelsammlungSkin !== 'base';
  const hasPersona = user.aiPersona && user.aiPersona !== 'insight';

  return (
    <div
      ref={containerRef}
      className={`
        relative p-5 sm:p-6 rounded-lg backdrop-blur-md transition-all hover:scale-[1.02] overflow-visible
        ${isDarkMode ? 'bg-slate-900/60' : 'bg-white/90'}
        border-4 ${beltStyle.border} ${beltStyle.glow}
        shadow-xl hover:shadow-2xl
        ${isCurrentUser ? 'ring-4 ring-indigo-500 ring-opacity-60' : ''}
        min-h-[420px] flex flex-col
      `}
      style={{
        clipPath: 'polygon(10% 0%, 90% 0%, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 85%, 0% 15%)',
      }}
    >
      {/* Visual Effects Overlay */}
      {hasRain && <MiniMatrixRain containerRef={containerRef} />}
      {hasStorm && <MiniElectricStorm containerRef={containerRef} />}

      {/* Content (relative z-index to appear above effects) */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Avatar - Prominently displayed */}
        <div className="flex justify-center mb-4 mt-2">
          <div className={`text-5xl sm:text-6xl bg-slate-100 dark:bg-slate-800 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center border-4 ${isDarkMode ? 'border-slate-700' : 'border-white'} shadow-xl`}>
            {user.avatar}
          </div>
        </div>

        {/* Username */}
        <div className="text-center mb-3 px-2">
          <h3 className="font-black italic uppercase text-base sm:text-lg tracking-wider text-slate-900 dark:text-white break-words">
            {user.username}
          </h3>
        </div>

        {/* Coins - Scaled by amount */}
        <div className="text-center mb-4 px-2">
          <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 ${coinStyle.bg} rounded-full ${coinStyle.glow || ''} shadow-md`}>
            <span className={coinStyle.icon}>🪙</span>
            <span className={`font-black ${coinStyle.text} ${coinStyle.size} whitespace-nowrap`}>{coins.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4 text-xs sm:text-sm px-2 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] sm:text-xs">Battles</span>
            <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">{battleStats.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] sm:text-xs">Win Rate</span>
            <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">{battleStats.win_rate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] sm:text-xs">Perfect Bounties</span>
            <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">{perfectBounties}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] sm:text-xs">XP</span>
            <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">{user.xp || 0}</span>
          </div>
        </div>

        {/* VS Button */}
        {!isCurrentUser && (
          <div className="mt-auto mb-3 px-2">
            <Button
              onClick={() => onChallenge(user)}
              disabled={isLoading || !canChallenge}
              className="w-full font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm py-2"
              size="sm"
              title={!canChallenge ? (currentUser && (!currentUser.username || currentUser.username === 'User' || currentUser.username.trim().length < 2) ? 'Registrierung erforderlich' : 'Nicht genug Coins (min. 25)') : undefined}
            >
              {isLoading ? 'Wird erstellt...' : '⚔️ VS'}
            </Button>
          </div>
        )}

        {/* Icon Bar - Tools & Features */}
        {(hasFormelRechner || hasSchrittLoeser || hasSpickerTrainer || hasScheitelCoach || hasFormelsammlung || hasPersona) && (
          <div className="flex flex-wrap justify-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 px-2">
            {hasFormelRechner && <span className="text-base sm:text-lg" title="Formel-Rechner">🧮</span>}
            {hasSchrittLoeser && <span className="text-base sm:text-lg" title="Schritt-für-Schritt-Loeser">📝</span>}
            {hasSpickerTrainer && <span className="text-base sm:text-lg" title="Spicker-Coach">🧠</span>}
            {hasScheitelCoach && <span className="text-base sm:text-lg" title="Scheitel-Coach">📈</span>}
            {hasFormelsammlung && <span className="text-base sm:text-lg" title="Formelsammlung">📚</span>}
            {hasPersona && <span className="text-base sm:text-lg" title="KI-Persona">🤖</span>}
          </div>
        )}
      </div>

      {/* Rarity glow effect */}
      <div
        className={`absolute inset-0 rounded-lg pointer-events-none opacity-20 blur-xl ${
          rarity === 'common' ? 'bg-slate-400' :
          rarity === 'rare' ? 'bg-blue-500' :
          rarity === 'epic' ? 'bg-purple-500' :
          'bg-amber-500'
        }`}
        style={{
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 85%, 0% 15%)',
        }}
      />
    </div>
  );
};

const BloodDomeLeaderboard: React.FC<{ currentUser: User; onChallenge: (u: User) => void; isDarkMode?: boolean; isLoading?: boolean }> = ({ currentUser, onChallenge, isDarkMode = false, isLoading = false }) => {
  const [users, setUsers] = useState<(User & { battleStats?: { total: number; wins: number; win_rate: number } })[]>([]);
  const [sortBy, setSortBy] = useState<'coins' | 'xp' | 'battles' | 'winrate'>('coins');
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await SocialService.getAllUsers();
        // Filter out invalid users and ensure they have required fields
        const validUsers = allUsers.filter(u =>
          u &&
          u.id &&
          u.username &&
          u.username.trim().length > 0 &&
          u.username !== 'Anonym' &&
          u.username !== 'User'
        );
        console.log('[BloodDomeLeaderboard] Loaded users:', validUsers.length, 'out of', allUsers.length);
        setUsers(validUsers);
      } catch (err) {
        console.error('[BloodDomeLeaderboard] Failed to load users:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const sortedUsers = useMemo(() => {
    // Filter out users without valid usernames
    const validUsers = users.filter(u => u && u.id && u.username && u.username.trim().length > 0);
    const sorted = [...validUsers];
    sorted.sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortBy) {
        case 'coins':
          aVal = a.coins || 0;
          bVal = b.coins || 0;
          break;
        case 'xp':
          aVal = a.xp || 0;
          bVal = b.xp || 0;
          break;
        case 'battles':
          aVal = a.battleStats?.total || 0;
          bVal = b.battleStats?.total || 0;
          break;
        case 'winrate':
          aVal = a.battleStats?.win_rate || 0;
          bVal = b.battleStats?.win_rate || 0;
          break;
        default:
          return 0;
      }

      const diff = bVal - aVal;
      return sortAsc ? -diff : diff;
    });
    return sorted;
  }, [users, sortBy, sortAsc]);

  return (
    <GlassCard className="h-full flex flex-col !p-0 overflow-hidden">
      <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-red-900/30 via-slate-50/50 to-red-900/30 dark:from-red-900/50 dark:via-slate-800/50 dark:to-red-900/50 backdrop-blur-md">
        <CardTitle className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mb-2">⚔️ BLOOD DOME</CardTitle>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">Herausforderung & Rangliste</p>

        {/* Sorting Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 dark:text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-sm"
          >
            <option value="coins">Coins</option>
            <option value="xp">XP</option>
            <option value="battles">Battles</option>
            <option value="winrate">Win Rate</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="text-xs sm:text-sm font-black px-2 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded shadow-sm transition-colors"
          >
            {sortAsc ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        {loading || isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : sortedUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm font-bold mb-2">Keine User gefunden</p>
            <p className="text-xs text-slate-500">Registriere dich, um in der Rangliste zu erscheinen!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 max-w-7xl mx-auto">
            {sortedUsers.map((u) => (
              <BloodDomeUserModal
                key={u.id}
                user={u}
                currentUserId={currentUser.id}
                onChallenge={onChallenge}
                isDarkMode={isDarkMode}
                currentUser={currentUser}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

const BattleLobby: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(LEARNING_UNITS[0]?.id || 'u1');
  const [signals, setSignals] = useState<
    Array<{ id: string; username: string; unitTitle: string; tasks: string[]; timestamp: number; avatar: string }>
  >([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [channelReady, setChannelReady] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const client = getRealtimeClient();
    if (!client) return;
    const channel = client.channel('mathbattle:lobby', { config: { broadcast: { self: true } } });
    channelRef.current = channel;
    channel
      .on('broadcast', { event: 'BATTLE_SIGNAL' }, payload => {
        if (payload?.payload) {
          setSignals(prev => {
            const next = [payload.payload as any, ...prev];
            return next.slice(0, 10);
          });
        }
      })
      .subscribe(status => {
        setChannelReady(status === 'SUBSCRIBED');
        if (status !== 'SUBSCRIBED') {
          channelRef.current = null;
        }
      });
    return () => {
      client.removeChannel(channel);
      channelRef.current = null;
      setChannelReady(false);
    };
  }, []);

  const broadcastChallenge = async () => {
    const client = getRealtimeClient();
    const channel = channelRef.current;
    const unit = LEARNING_UNITS.find(u => u.id === selectedUnit);
    if (!client || !channel || !unit) {
      setSignals(prev => [
        {
          id: `local-${Date.now()}`,
          username: currentUser.username,
          unitTitle: unit?.title || 'Unbekannt',
          tasks: [],
          timestamp: Date.now(),
          avatar: currentUser.avatar,
        },
        ...prev,
      ]);
      return;
    }
    setBroadcasting(true);
    try {
      const tasks = TaskFactory.getBattleTasksForUnit(selectedUnit, 3).map(t => t.id);
      const payload = {
        id: `${Date.now()}`,
        username: currentUser.username,
        avatar: currentUser.avatar,
        unitTitle: unit.title,
        tasks,
        timestamp: Date.now(),
      };
      await channel.send({ type: 'broadcast', event: 'BATTLE_SIGNAL', payload });
      setSignals(prev => [payload, ...prev].slice(0, 10));
    } catch (error) {
      console.warn('[BattleLobby] broadcast failed', error);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <GlassCard className="h-full flex flex-col !p-0 overflow-hidden">
      <div className="p-4 border-b bg-slate-50/50 backdrop-blur-md flex items-center justify-between">
        <CardTitle>Math Battle Lobby</CardTitle>
        <span className={`text-[10px] font-black uppercase tracking-widest ${channelReady ? 'text-emerald-500' : 'text-slate-400'}`}>
          {channelReady ? 'Realtime' : 'Offline'}
        </span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedUnit}
            onChange={e => setSelectedUnit(e.target.value)}
            className="flex-1 bg-slate-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {LEARNING_UNITS.map(u => (
              <option key={u.id} value={u.id}>{u.title}</option>
            ))}
          </select>
          <Button onClick={broadcastChallenge} disabled={broadcasting} className="w-full sm:w-auto">
            {broadcasting ? 'Sendet...' : 'Battle-Signal ⚡️'}
          </Button>
        </div>
        <div className="text-[11px] font-black uppercase text-slate-400">
          Vorschau: {TaskFactory.getBattleTasksForUnit(selectedUnit, 3).map(t => t.type).join(', ')}
        </div>
        <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
          {signals.length === 0 && (
            <p className="text-xs text-slate-400 font-bold text-center">Noch kein Signal – be first!</p>
          )}
          {signals.map(signal => (
            <div key={signal.id} className="p-3 rounded-2xl border border-slate-100 bg-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">{signal.avatar || '👤'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-slate-700 truncate">{signal.username}</div>
                <div className="text-[10px] uppercase text-slate-400">{signal.unitTitle}</div>
                <div className="text-[10px] text-slate-500">
                  Tasks: {signal.tasks.join(', ') || 'wird synchronisiert...'}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-bold">
                {new Date(signal.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

const PREVIEW_COST = 5;

const SHOP_CATEGORIES = {
  all: { label: 'Alles', icon: '🏪' },
  avatar: { label: 'Avatare', icon: '👤' },
  effect: { label: 'Effekte', icon: '✨' },
  calculator: { label: 'Skins', icon: '🧮' },
  tool: { label: 'Tools', icon: '🧰' },
  calc_gadget: { label: 'Gadgets', icon: '⚙️' },
  formelsammlung: { label: 'Formelsammlungen', icon: '📚' },
  ki: { label: 'KI', icon: '🤖' },
  voucher: { label: 'Gutscheine', icon: '🎁' }
} as const;

const RARITY_CONFIG = {
  common: { label: 'Common', color: 'slate', border: 'border-slate-300', bg: 'bg-slate-50' },
  rare: { label: 'Rare', color: 'blue', border: 'border-blue-400', bg: 'bg-blue-50' },
  epic: { label: 'Epic', color: 'purple', border: 'border-purple-500', bg: 'bg-purple-50' },
  legendary: { label: 'Legendary', color: 'amber', border: 'border-amber-500', bg: 'bg-gradient-to-br from-amber-50 to-orange-50' }
} as const;

const ShopView: React.FC<{
  user: User;
  onBuy: (item: ShopItem) => void;
  onPreview: (item: ShopItem, cost: number) => void;
  previewEffect: string | null;
  isDarkMode: boolean
}> = ({ user, onBuy, onPreview, previewEffect, isDarkMode }) => {
  const [filter, setFilter] = useState<keyof typeof SHOP_CATEGORIES>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rarity'>('default');

  const filteredItems = useMemo(() => {
    let items = filter === 'all'
      ? SHOP_ITEMS
      : filter === 'ki'
      ? SHOP_ITEMS.filter(i => i.type === 'persona' || i.type === 'skin')
      : SHOP_ITEMS.filter(i => i.type === filter);

    if (rarityFilter !== 'all') {
      items = items.filter(i => i.rarity === rarityFilter);
    }

    switch (sortBy) {
      case 'price-asc':
        return [...items].sort((a, b) => a.cost - b.cost);
      case 'price-desc':
        return [...items].sort((a, b) => b.cost - a.cost);
      case 'rarity':
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
        return [...items].sort((a, b) => (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0));
      default:
        return items;
    }
  }, [filter, rarityFilter, sortBy]);

  // Group items by rarity for effect category
  const groupedByRarity = useMemo(() => {
    if (filter !== 'effect') return null;
    const groups: Record<string, typeof SHOP_ITEMS> = { legendary: [], epic: [], rare: [], common: [] };
    filteredItems.forEach(item => {
      if (item.rarity && groups[item.rarity]) {
        groups[item.rarity].push(item);
      }
    });
    return groups;
  }, [filter, filteredItems]);

  const renderItem = (item: ShopItem) => {
    const owned = user.unlockedItems?.includes(item.id) && item.type !== 'feature' && item.type !== 'voucher';
    const userCoins = Number.isFinite(user.coins) ? user.coins : 0;
    const canAfford = userCoins >= item.cost;
    const isPreviewActive = previewEffect === item.value;
    const canAffordPreview = userCoins >= PREVIEW_COST;
    const rarityConfig = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common;

    return (
      <GlassCard
        key={item.id}
        className={`!p-4 flex flex-col items-center text-center gap-3 relative overflow-hidden transition-all duration-300
          ${owned ? 'opacity-50 grayscale' : ''}
          ${isPreviewActive ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
          ${isDarkMode ? '' : rarityConfig.bg}
        `}
      >
        {/* Rarity indicator */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          item.rarity === 'legendary' ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 animate-pulse' :
          item.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
          item.rarity === 'rare' ? 'bg-blue-500' : 'bg-slate-300'
        }`} />

        {/* Rarity badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider
          ${item.rarity === 'legendary' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
            item.rarity === 'epic' ? 'bg-purple-100 text-purple-700 border border-purple-300' :
            item.rarity === 'rare' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
            'bg-slate-100 text-slate-500 border border-slate-200'
          }
        `}>
          {rarityConfig.label}
        </div>

        <div className={`text-4xl drop-shadow-md transition-all duration-300 mt-2
          ${isPreviewActive ? 'scale-125 animate-pulse' : 'hover:scale-110'}
          ${item.rarity === 'legendary' ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}
        `}>
          {item.icon || item.value}
        </div>

        <div className="flex-1">
          <h4 className={`font-bold text-sm leading-tight mb-1 ${item.rarity === 'legendary' ? 'text-amber-600' : ''}`}>
            {item.name}
          </h4>
          <p className={`text-[10px] font-medium h-8 overflow-hidden leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {item.description}
          </p>
        </div>

        <div className="mt-auto w-full flex flex-col gap-2">
          <div className={`font-black text-sm ${item.rarity === 'legendary' ? 'text-amber-500' : 'text-amber-600'}`}>
            {item.cost === 0 ? (
              <span className="text-emerald-500">✓ FREE</span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                {item.cost.toLocaleString()} <span className="text-base">🪙</span>
              </span>
            )}
          </div>

          {item.type === 'effect' && !owned && (
            <Button
              size="sm"
              variant={isPreviewActive ? 'primary' : 'secondary'}
              onClick={() => onPreview(item, isPreviewActive ? 0 : PREVIEW_COST)}
              disabled={!isPreviewActive && !canAffordPreview}
              className={`w-full text-[10px] ${isPreviewActive ? 'animate-pulse' : ''}`}
            >
              {isPreviewActive ? (
                <span>▶ Live Vorschau</span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  👁 Vorschau <span className="text-amber-500">{PREVIEW_COST}🪙</span>
                </span>
              )}
            </Button>
          )}

          <Button
            size="sm"
            variant={owned ? 'secondary' : canAfford ? 'primary' : 'secondary'}
            disabled={owned || !canAfford}
            onClick={() => onBuy(item)}
            className={`w-full ${item.rarity === 'legendary' && !owned && canAfford ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : ''}`}
          >
            {owned ? '✓ Besitz' : canAfford ? 'Kaufen' : '🔒 Nicht genug'}
          </Button>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="space-y-6">
      {/* Preview Banner */}
      {previewEffect && (
        <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-between
          ${isDarkMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-indigo-50 border-indigo-300'}
        `}>
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-bounce">👁</div>
            <div>
              <div className={`font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                Vorschau aktiv
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                Effekt wird angezeigt solange du im Shop bist
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPreview({ value: previewEffect } as ShopItem, 0)}
          >
            Vorschau beenden
          </Button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.entries(SHOP_CATEGORIES) as [keyof typeof SHOP_CATEGORIES, typeof SHOP_CATEGORIES[keyof typeof SHOP_CATEGORIES]][]).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2
              ${filter === key
                ? (isDarkMode ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-900 text-white shadow-lg scale-105')
                : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200')
              }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Filters & Sort Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Rarity Filter */}
        <div className="flex gap-1">
          {(['all', 'legendary', 'epic', 'rare', 'common'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all
                ${rarityFilter === r
                  ? (r === 'legendary' ? 'bg-amber-500 text-white' :
                     r === 'epic' ? 'bg-purple-500 text-white' :
                     r === 'rare' ? 'bg-blue-500 text-white' :
                     r === 'common' ? 'bg-slate-500 text-white' :
                     'bg-slate-800 text-white')
                  : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
                }`}
            >
              {r === 'all' ? 'Alle' : RARITY_CONFIG[r]?.label || r}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer
            ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-600 border border-slate-200'}
          `}
        >
          <option value="default">Standard</option>
          <option value="price-asc">Preis ↑</option>
          <option value="price-desc">Preis ↓</option>
          <option value="rarity">Seltenheit</option>
        </select>

        {/* Item count */}
        <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {filteredItems.length} Items
        </div>
      </div>

      {/* Effect Category with Grouped Display */}
      {filter === 'effect' && groupedByRarity && sortBy === 'default' ? (
        <div className="space-y-8">
          {(['legendary', 'epic', 'rare', 'common'] as const).map(rarity => {
            const items = groupedByRarity[rarity];
            if (!items || items.length === 0) return null;

            return (
              <div key={rarity}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-0.5 flex-1 ${
                    rarity === 'legendary' ? 'bg-gradient-to-r from-transparent via-amber-400 to-transparent' :
                    rarity === 'epic' ? 'bg-gradient-to-r from-transparent via-purple-400 to-transparent' :
                    rarity === 'rare' ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent' :
                    'bg-gradient-to-r from-transparent via-slate-300 to-transparent'
                  }`} />
                  <h3 className={`font-black uppercase tracking-widest text-sm flex items-center gap-2
                    ${rarity === 'legendary' ? 'text-amber-500' :
                      rarity === 'epic' ? 'text-purple-500' :
                      rarity === 'rare' ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  >
                    {rarity === 'legendary' && '👑'}
                    {rarity === 'epic' && '💎'}
                    {rarity === 'rare' && '⭐'}
                    {RARITY_CONFIG[rarity].label}
                    <span className="text-xs font-normal opacity-60">({items.length})</span>
                  </h3>
                  <div className={`h-0.5 flex-1 ${
                    rarity === 'legendary' ? 'bg-gradient-to-r from-amber-400 via-transparent to-transparent' :
                    rarity === 'epic' ? 'bg-gradient-to-r from-purple-400 via-transparent to-transparent' :
                    rarity === 'rare' ? 'bg-gradient-to-r from-blue-400 via-transparent to-transparent' :
                    'bg-gradient-to-r from-slate-300 via-transparent to-transparent'
                  }`} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map(renderItem)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(renderItem)}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <div className="text-4xl mb-4">🔍</div>
          <p className="font-bold">Keine Items gefunden</p>
          <p className="text-sm">Versuche andere Filter</p>
        </div>
      )}
    </div>
  );
};

const InventoryModal: React.FC<{
  user: User;
  onClose: () => void;
  onToggleEffect: (id: string) => void;
  onAvatarChange: (val: string) => void;
  onSkinChange: (val: string) => void;
  onFormelsammlungSkinChange: (val: string) => void;
  onPersonaChange?: (val: string) => void;
  onAISkinChange?: (val: string) => void;
}> = ({ user, onClose, onToggleEffect, onAvatarChange, onSkinChange, onFormelsammlungSkinChange, onPersonaChange, onAISkinChange }) => {
  const ownedAvatars = SHOP_ITEMS.filter(i => i.type === 'avatar' && (i.cost === 0 || user.unlockedItems?.includes(i.id)));
  const ownedEffects = SHOP_ITEMS.filter(i => i.type === 'effect' && user.unlockedItems?.includes(i.id));
  const ownedSkins = SHOP_ITEMS.filter(i => i.type === 'calculator' && (i.cost === 0 || user.unlockedItems?.includes(i.id)));
  const ownedFormulaSkins = SHOP_ITEMS.filter(i => i.type === 'formelsammlung' && (i.cost === 0 || user.unlockedItems?.includes(i.id)));
  const ownedPersonas = SHOP_ITEMS.filter(i => i.type === 'persona' && (i.cost === 0 || user.unlockedItems?.includes(i.id)));
  const ownedAISkins = SHOP_ITEMS.filter(i => i.type === 'skin' && (i.cost === 0 || user.unlockedItems?.includes(i.id)));

  return (
    <ModalOverlay onClose={onClose}>
       <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full mx-auto">
          <div className="flex justify-between items-center mb-8">
             <SectionHeading className="mb-0">Dein Inventar</SectionHeading>
             <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold">✕</button>
          </div>

          <h3 className="font-bold text-slate-400 uppercase tracking-widest mb-4">Avatare</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-8">
             {ownedAvatars.map(av => (
                <button
                  key={av.id}
                  onClick={() => onAvatarChange(av.value)}
                  className={`aspect-square rounded-2xl text-2xl flex items-center justify-center border-2 transition-all ${user.avatar === av.value ? 'bg-indigo-50 border-indigo-500 scale-110 shadow-lg' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                >
                   {av.icon || av.value}
                </button>
             ))}
          </div>

          <h3 className="font-bold text-slate-400 uppercase tracking-widest mb-4">Taschenrechner Skins</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
             {ownedSkins.map(sk => (
                <button
                  key={sk.id}
                  onClick={() => onSkinChange(sk.value)}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${user.calculatorSkin === sk.value ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                >
                   <span className="text-2xl">{sk.icon}</span>
                   <span className="text-[10px] font-bold uppercase">{sk.name}</span>
                </button>
             ))}
          </div>

          <h3 className="font-bold text-slate-400 uppercase tracking-widest mb-4">Formelsammlung Skins</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {ownedFormulaSkins.map(fs => (
              <button
                key={fs.id}
                onClick={() => onFormelsammlungSkinChange(fs.value)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${user.formelsammlungSkin === fs.value ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
              >
                <span className="text-2xl">{fs.icon}</span>
                <span className="text-[10px] font-bold uppercase text-center">{fs.name}</span>
              </button>
            ))}
          </div>

          {onPersonaChange && (
            <>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest mb-4">KI-Persönlichkeiten</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {ownedPersonas.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onPersonaChange(p.value)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${user.aiPersona === p.value ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-[10px] font-bold uppercase text-center">{p.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {onAISkinChange && (
            <>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest mb-4">KI-Chat Designs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {ownedAISkins.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onAISkinChange(s.value)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${user.aiSkin === s.value ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-[10px] font-bold uppercase text-center">{s.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <h3 className="font-bold text-slate-400 uppercase tracking-widest mb-4">Effekte</h3>
          {ownedEffects.length === 0 ? <p className="text-slate-400 italic mb-8">Noch keine Effekte gekauft.</p> : (
            <div className="grid grid-cols-2 gap-4 mb-8">
               {ownedEffects.map(ef => {
                  const isActive = user.activeEffects?.includes(ef.value) || false;
                  return (
                    <button
                       key={ef.id}
                       onClick={() => onToggleEffect(ef.value)}
                       className={`p-4 rounded-xl border-2 flex justify-between items-center font-bold ${isActive ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-500'}`}
                    >
                       <span className="flex items-center gap-2"><span>{ef.icon}</span> <span>{ef.name}</span></span>
                       <span className="text-lg">{isActive ? 'ON' : 'OFF'}</span>
                    </button>
                  );
               })}
            </div>
          )}
       </div>
    </ModalOverlay>
  );
};

// --- INTERAKTIVE KOMPONENTE ---
const AlienScannerTask: React.FC<{ task: Task; onComplete: (success: boolean) => void; }> = ({ task, onComplete }) => {
    if (!task.interactiveData) return null;
    const { initialShape, steps, options } = task.interactiveData;
    const [currentStep, setCurrentStep] = useState(0);
    const [eliminated, setEliminated] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect' | 'missed'>>({});
    const [isStepChecked, setIsStepChecked] = useState(false);

    const revealedProperties = steps.slice(0, currentStep + 1).map((s: any) => s.property);

    const toggleElimination = (id: string) => {
        if (isStepChecked) return;
        setEliminated(prev => (prev || []).includes(id) ? (prev || []).filter(pId => pId !== id) : [...(prev || []), id]);
    };

    const checkStep = () => {
        const { toExclude = [] } = steps[currentStep] || {};
        const newFeedback: Record<string, 'correct' | 'incorrect' | 'missed'> = {};
        let allCorrect = true;

        options.forEach((opt: any) => {
            const shouldBeExcluded = toExclude.includes(opt.id);
            const wasExcluded = (eliminated || []).includes(opt.id);

            if (shouldBeExcluded && wasExcluded) newFeedback[opt.id] = 'correct';
            else if (shouldBeExcluded && !wasExcluded) {
                newFeedback[opt.id] = 'missed';
                allCorrect = false;
            } else if (!shouldBeExcluded && wasExcluded) {
                newFeedback[opt.id] = 'incorrect';
                allCorrect = false;
            }
        });

        setFeedback(newFeedback);
        setIsStepChecked(true);

        if (allCorrect) {
            setTimeout(() => {
                goToNextStep();
            }, 1200);
        }
    };

    const goToNextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(s => s + 1);
            setIsStepChecked(false);
            setFeedback({});
            const correctEliminations = Object.entries(feedback)
                .filter(([, val]) => val === 'correct')
                .map(([key]) => key);
            setEliminated(prev => [...new Set([...prev, ...correctEliminations])]);
        } else {
            onComplete(true);
        }
    };

    return (
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl flex flex-col h-full border border-cyan-500/30">
        <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-widest mb-2">👽 Alien-Scanner</h3>
        <p className="text-sm text-slate-300 mb-6">{task.question}</p>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
            <div className="flex flex-col gap-4 bg-black/30 p-4 rounded-lg">
                <div className="flex-1 flex items-center justify-center bg-slate-800/20 rounded">
                     <svg viewBox="0 0 200 100" className="w-48 h-48 drop-shadow-[0_0_10px_#22d3ee]">
                        <path d={initialShape} fill="none" stroke="#22d3ee" strokeWidth="2" />
                    </svg>
                </div>
                 <div className="border-t border-cyan-500/20 pt-4">
                    <h4 className="text-xs font-bold uppercase text-cyan-400 mb-2">Eigenschaften-Log:</h4>
                    <ul className="space-y-2">
                        {revealedProperties.map((prop, i) => (
                           <li key={i} className="text-sm font-semibold text-slate-200 animate-in fade-in duration-500">
                                <span className="text-cyan-400 mr-2">&gt;</span>{prop}
                           </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    {options.map((opt: any) => {
                       const isEliminated = (eliminated || []).includes(opt.id);
                       const fs = feedback[opt.id];
                       let btnCls = 'bg-slate-800 border-slate-700 hover:border-cyan-400';
                       if (isEliminated && !fs) btnCls = 'bg-rose-900/40 border-rose-700 text-slate-400 line-through';
                       if (fs === 'correct') btnCls = 'bg-emerald-600 border-emerald-400 text-white';
                       if (fs === 'incorrect') btnCls = 'bg-rose-600 border-rose-400 text-white animate-shake';
                       if (fs === 'missed') btnCls = 'bg-amber-600 border-amber-400 text-white';

                       return (
                           <button key={opt.id} onClick={() => toggleElimination(opt.id)} className={`p-3 rounded-lg border-2 text-center font-bold text-xs sm:text-sm transition-all duration-300 ${btnCls}`}>
                             {opt.label}
                           </button>
                       );
                    })}
                </div>
                {!isStepChecked ? (
                  <Button onClick={checkStep} className="mt-auto w-full bg-cyan-600 border-cyan-800">Scan bestätigen</Button>
                ) : (
                  <Button onClick={goToNextStep} className="mt-auto w-full">
                    {currentStep < steps.length - 1 ? "Nächste Eigenschaft" : "Abschließen"}
                  </Button>
                )}
            </div>
        </div>
      </div>
    );
};

// --- Multi-Angle Throw Training Component ---
const MultiAngleThrowTraining: React.FC<{
  task: Task;
  user?: User;
  onCoinsChange?: (delta: number) => Promise<void>;
  onComplete: (success: boolean, hitsCount: number) => void;
}> = ({ task, user, onCoinsChange, onComplete }) => {
  const data = task.multiAngleThrowData;
  if (!data) return null;

  const [angles, setAngles] = useState<number[]>([]);
  const [angleInput, setAngleInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentThrowIdx, setCurrentThrowIdx] = useState(-1);
  const [results, setResults] = useState<Array<{ angle: number; hit: boolean }>>([]);
  const [coinsDeducted, setCoinsDeducted] = useState(false);

  const addAngle = () => {
    const val = parseFloat(angleInput);
    if (!isNaN(val) && val >= 0 && val <= 180 && angles.length < data.maxAngles) {
      setAngles([...angles, val]);
      setAngleInput('');
    }
  };

  const removeAngle = (idx: number) => {
    setAngles(angles.filter((_, i) => i !== idx));
  };

  const startThrows = async () => {
    if (angles.length === 0 || coinsDeducted) return;

    // Check if user has enough coins
    const userCoins = user && Number.isFinite(user.coins) ? user.coins : 0;
    if (userCoins < data.startCost) {
      // Could show toast here if we had access to it
      console.warn('Insufficient coins for multiAngleThrow');
      return;
    }

    // Deduct coins
    if (onCoinsChange && data.startCost > 0) {
      try {
        await onCoinsChange(-data.startCost);
      } catch (err) {
        console.error('Failed to deduct coins:', err);
        return;
      }
    }

    setIsRunning(true);
    setCoinsDeducted(true);
    setCurrentThrowIdx(0);
    setResults([]);
  };

  const calculateTrajectory = (angle: number, progress: number) => {
    const radians = (angle * Math.PI) / 180;
    const maxDist = 250;
    const maxHeight = 120;
    const x = progress * maxDist;
    const parabola = Math.sin(radians) * (maxDist - x) * (x / maxDist);
    const y = Math.max(0, parabola * (maxHeight / 120));
    return { x, y };
  };

  // Simulate throw animation
  useEffect(() => {
    if (!isRunning || currentThrowIdx < 0 || currentThrowIdx >= angles.length) return;

    let frameCount = 0;
    const interval = setInterval(() => {
      frameCount++;
      if (frameCount > 60) {
        // Throw finished - check if hit
        const angle = angles[currentThrowIdx];
        const tolerance = data.tolerance || 5;
        const isHit = Math.abs(angle - data.targetAngle) <= tolerance;

        setResults(prevResults => {
          const newResults = [...prevResults, { angle, hit: isHit }];

          if (currentThrowIdx >= angles.length - 1) {
            // All throws done
            setIsRunning(false);
            const hits = newResults.filter(r => r.hit).length;

            // Award coins for hits
            if (onCoinsChange && hits > 0 && data.hitReward > 0) {
              const totalReward = hits * data.hitReward;
              onCoinsChange(totalReward).catch(err => {
                console.error('Failed to award coins:', err);
              });
            }

            setTimeout(() => onComplete(true, hits), 1500);
          } else {
            setCurrentThrowIdx(currentThrowIdx + 1);
          }

          return newResults;
        });

        frameCount = 0;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isRunning, currentThrowIdx, angles, data, onComplete, onCoinsChange]);

  const currentAngle = currentThrowIdx >= 0 && currentThrowIdx < angles.length ? angles[currentThrowIdx] : null;
  const animProgress = Math.min(1, (Date.now() % 3000) / 3000);
  const throwPos = currentAngle !== null ? calculateTrajectory(currentAngle, animProgress) : { x: 0, y: 0 };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-cyan-50 rounded-2xl">
      <h2 className="text-2xl font-black mb-4 text-center">🎯 Winkel-Wurf-Training</h2>
      <p className="text-sm text-slate-600 mb-6 text-center">
        Ziel: <span className="font-bold text-indigo-600">{data.targetAngle}°</span> |
        Toleranz: <span className="font-bold">±{data.tolerance || 5}°</span>
      </p>

      {!isRunning ? (
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={angleInput}
                onChange={(e) => setAngleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAngle()}
                placeholder="Winkel eingeben (0-180°)"
                disabled={angles.length >= data.maxAngles}
                className="flex-1 px-4 py-3 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 text-center font-bold"
              />
              <Button onClick={addAngle} variant="primary" disabled={angles.length >= data.maxAngles}>
                Hinzu
              </Button>
            </div>

            {angles.length > 0 && (
              <div className="bg-white rounded-lg border-2 border-indigo-100 p-4">
                <div className="text-xs font-black text-slate-400 mb-2">EINGEGEBEN: {angles.length}/{data.maxAngles}</div>
                <div className="flex flex-wrap gap-2">
                  {angles.map((angle, idx) => (
                    <div
                      key={idx}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"
                    >
                      {angle}°
                      <button
                        onClick={() => removeAngle(idx)}
                        className="ml-1 font-bold hover:text-rose-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 text-xs font-bold text-yellow-800">
            💰 Kosten: {data.startCost} Coins | 💵 Gewinn pro Treffer: {data.hitReward} Coins
          </div>

          <Button
            onClick={startThrows}
            disabled={angles.length === 0 || coinsDeducted || (user && Number.isFinite(user.coins) && user.coins < data.startCost)}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Starte Würfe
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
          {/* SVG Animation Area */}
          <svg viewBox="0 0 300 200" className="w-full border-2 border-indigo-300 rounded-lg bg-white">
            {/* Target */}
            <circle cx="270" cy="80" r="15" fill="none" stroke="#ef4444" strokeWidth="2" />
            <text x="270" y="110" textAnchor="middle" className="text-xs font-bold fill-red-600">
              🎯 {data.targetAngle}°
            </text>

            {/* Throw bottle trajectory */}
            {currentAngle !== null && (
              <>
                {/* Trajectory arc */}
                <path
                  d={`M 20,150 Q 150,${150 - Math.sin((currentAngle * Math.PI) / 180) * 80} 260,80`}
                  stroke="#6366f1"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
                {/* Bottle */}
                <circle cx={throwPos.x + 20} cy={150 - throwPos.y} r="8" fill="#10b981" />
              </>
            )}

            {/* Ground */}
            <line x1="0" y1="160" x2="300" y2="160" stroke="#cbd5e1" strokeWidth="2" />
          </svg>

          <div className="text-center">
            <p className="text-sm font-bold text-slate-600">
              Wurf {currentThrowIdx + 1}/{angles.length}
            </p>
            <p className="text-lg font-black text-indigo-600">
              {currentAngle !== null ? `${currentAngle}°` : '---'}
            </p>
          </div>

          {/* Results so far */}
          {results.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
              {results.map((r, idx) => (
                <div key={idx} className={`text-xs font-bold p-2 rounded flex justify-between ${r.hit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  <span>Wurf {idx + 1}:</span>
                  <span>
                    {r.angle}° {r.hit ? '✓ TREFFER' : '✗ Verfehlt'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type QuestRunSummary = {
  correctCount: number;
  totalTasks: number;
  mistakes: number;
  hintsUsed: number;
  elapsedMs: number;
};

type BattleSession = {
  battle: BattleRecord;
  tasks: Task[];
  scenario?: BattleScenario;
  unit: LearningUnit | null;
};

const QuestExecutionView: React.FC<{
  unit: LearningUnit;
  tasks: Task[];
  isBountyMode: boolean;
  timeLimit?: number;
  noCheatSheet?: boolean;
  user?: User;
  onTaskCorrect: (task: Task, wager: number) => void;
  onComplete: (isPerfect: boolean, percentage?: number, summary?: QuestRunSummary) => void;
  onCancel: () => void;
  onOpenTool?: (toolId: 'formel_rechner' | 'schritt_loeser' | 'spicker_trainer' | 'scheitel_coach') => void;
}> = ({ unit, tasks, isBountyMode, timeLimit, noCheatSheet = false, user, onTaskCorrect, onComplete, onCancel, onOpenTool }) => {
    const { setCurrentTask } = useCurrentTask();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [textInput, setTextInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(timeLimit && timeLimit > 0 ? timeLimit : Infinity);
    const [wager, setWager] = useState<number>(0);
    const [classification, setClassification] = useState<Record<string, string>>({});
    const [angleInput, setAngleInput] = useState('');
    const [sliderValue, setSliderValue] = useState<number>(1);
    const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
    const [multiFieldValues, setMultiFieldValues] = useState<Record<string, string>>({});
    const [adaptiveHint, setAdaptiveHint] = useState<string | null>(null);
    const [isAutoHintLoading, setIsAutoHintLoading] = useState(false);
    const [hoverAngle, setHoverAngle] = useState<number | null>(null);
    const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
    const [evaluationResult, setEvaluationResult] = useState<{
        isFullyCorrect: boolean;
        correctSubTasks: number[];
        incorrectSubTasks: Array<{ subTaskNumber: number; reason: string; correctAnswer: string }>;
        overallFeedback: string;
    } | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const runStartRef = useRef(Date.now());

    useEffect(() => {
        runStartRef.current = Date.now();
    }, [tasks]);

    useEffect(() => {
        // Zeitlimit nur wenn explizit gesetzt (nicht mehr automatisch im Bounty-Modus)
        if (!feedback && tasks.length > 0 && timeLimit && timeLimit > 0) {
            setTimeLeft(timeLimit);
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setFeedback('wrong');
                        setMistakes(m => m + 1);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        } else if (!timeLimit || timeLimit <= 0) {
            // Kein Zeitlimit - setze auf unendlich
            setTimeLeft(Infinity);
        }
    }, [feedback, currentIdx, tasks.length, timeLimit]);

    useEffect(() => {
        // Reset hint when task changes
        setAdaptiveHint(null);
        setIsAutoHintLoading(false);
    }, [currentIdx]);

    const handleVerify = async () => {
        const task = tasks[currentIdx];
        let isCorrect = false;

        // For Bounty mode with input tasks, use OpenAI evaluation
        if (isBountyMode && (task.type === 'input' || task.type === 'shorttext')) {
            setIsEvaluating(true);
            setEvaluationResult(null);

            try {
                const userAnswer = task.multiInputFields && task.multiInputFields.length > 0
                    ? Object.entries(multiFieldValues)
                        .map(([id, value]) => {
                            const field = task.multiInputFields!.find(f => f.id === id);
                            return field ? `${field.label}: ${value}` : '';
                        })
                        .filter(Boolean)
                        .join('\n')
                    : textInput;

                if (!userAnswer.trim()) {
                    setIsEvaluating(false);
                    return;
                }

                const headers = getApiHeaders();
                const response = await fetch('/.netlify/functions/bountyEvaluate', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        question: task.question,
                        userAnswer: userAnswer,
                        correctAnswer: task.correctAnswer,
                        explanation: task.explanation || '',
                        multiInputFields: task.multiInputFields || [],
                    }),
                });

                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        errorData = { error: 'UNKNOWN_ERROR', message: `HTTP ${response.status}` };
                    }
                    console.error('[bountyEvaluate] Error:', errorData);
                    setIsEvaluating(false);
                    // For Bounty mode, show error message but allow user to continue
                    setFeedback('wrong');
                    setMistakes(m => m + 1);
                    setEvaluationResult({
                        isFullyCorrect: false,
                        correctSubTasks: [],
                        incorrectSubTasks: [],
                        overallFeedback: errorData.message || 'Die Evaluierung ist fehlgeschlagen. Bitte versuche es erneut.',
                    });
                    return;
                }

                let evalData;
                try {
                    evalData = await response.json();
                } catch (parseError) {
                    console.error('[bountyEvaluate] JSON parse error:', parseError);
                    setIsEvaluating(false);
                    setFeedback('wrong');
                    setMistakes(m => m + 1);
                    setEvaluationResult({
                        isFullyCorrect: false,
                        correctSubTasks: [],
                        incorrectSubTasks: [],
                        overallFeedback: 'Fehler beim Verarbeiten der Evaluierung. Bitte versuche es erneut.',
                    });
                    return;
                }

                // Validate response structure
                if (!evalData || typeof evalData.isFullyCorrect !== 'boolean') {
                    console.error('[bountyEvaluate] Invalid response structure:', evalData);
                    setIsEvaluating(false);
                    setFeedback('wrong');
                    setMistakes(m => m + 1);
                    setEvaluationResult({
                        isFullyCorrect: false,
                        correctSubTasks: [],
                        incorrectSubTasks: [],
                        overallFeedback: 'Ungültige Antwort von der Evaluierung. Bitte versuche es erneut.',
                    });
                    return;
                }

                setEvaluationResult(evalData);
                isCorrect = evalData.isFullyCorrect || false;
                setIsEvaluating(false);

                if (isCorrect) {
                    setFeedback('correct');
                    setCorrectAnswers(c => c + 1);
                    onTaskCorrect(task, 0);
                } else {
                    setFeedback('wrong');
                    setMistakes(m => m + 1);
                    requestAdaptiveHint(task, userAnswer);
                }
                return;
            } catch (error) {
                console.error('[bountyEvaluate] Exception:', error);
                setIsEvaluating(false);
                // Show error feedback to user
                setFeedback('wrong');
                setMistakes(m => m + 1);
                setEvaluationResult({
                    isFullyCorrect: false,
                    correctSubTasks: [],
                    incorrectSubTasks: [],
                    overallFeedback: `Fehler bei der Evaluierung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}. Bitte versuche es erneut.`,
                });
                return;
            }
        }

        // Standard validation (for non-bounty tasks or fallback)

        // Evaluate dragDrop classification
        if (task.type === 'dragDrop' && task.dragDropData) {
            const answerMap = JSON.parse(String(task.correctAnswer));
            const allSelected = Object.keys(answerMap).every(key => classification[key]);
            if (!allSelected) {
                // Require user to classify all shapes first
                // Toast removed - user will see error feedback through UI
                return;
            }
            isCorrect = Object.keys(answerMap).every(key => classification[key] === answerMap[key]);
        } else if (task.type === 'choice' || task.type === 'wager' || task.type === 'boolean') {
            isCorrect = selectedOption === task.correctAnswer || (task.type === 'boolean' && (selectedOption === 0 && task.correctAnswer === 'wahr' || selectedOption === 1 && task.correctAnswer === 'falsch'));
        } else if (task.type === 'input' || task.type === 'shorttext') {
            // Check if task has multiInputFields
            if (task.multiInputFields && task.multiInputFields.length > 0) {
                // Validate each field
                let allFieldsValid = true;
                let parsedCorrectAnswer: Record<string, any> = {};

                try {
                    parsedCorrectAnswer = JSON.parse(String(task.correctAnswer));
                } catch {
                    // Fallback: treat as string
                    parsedCorrectAnswer = {};
                }

                for (const field of task.multiInputFields) {
                    const userValue = multiFieldValues[field.id] || '';
                    const expectedValue = parsedCorrectAnswer[field.id];

                    if (!userValue.trim()) {
                        allFieldsValid = false;
                        break;
                    }

                    // Use validator if available
                    if (field.validator) {
                        // Sanitize input before validation (convert comma to dot for numeric inputs)
                        const sanitizedValue = field.validator.type === 'coordinatePair'
                            ? userValue
                            : sanitizeMathInput(userValue);
                        const fieldValid = validateAnswer(sanitizedValue, field.validator);
                        if (!fieldValid) {
                            // Also check against expected value if validator fails
                            if (expectedValue) {
                                const clean = (s: string) => s.replace(/\s+/g, '').toLowerCase();
                                const userClean = clean(sanitizedValue);
                                const expectedClean = clean(String(expectedValue));
                                if (!userClean.includes(expectedClean) && !expectedClean.includes(userClean)) {
                                    allFieldsValid = false;
                                    break;
                                }
                            } else {
                                allFieldsValid = false;
                                break;
                            }
                        }
                    } else if (expectedValue) {
                        // Fallback: simple text comparison
                        const clean = (s: string) => s.replace(/\s+/g, '').toLowerCase();
                        const userClean = clean(userValue);
                        const expectedClean = clean(String(expectedValue));
                        if (!userClean.includes(expectedClean) && !expectedClean.includes(userClean)) {
                            allFieldsValid = false;
                            break;
                        }
                    }
                }

                isCorrect = allFieldsValid;
            } else {
                // For coordinate pairs, use raw input; otherwise sanitize
                const inputToValidate = task.validator?.type === 'coordinatePair' ? textInput : sanitizeMathInput(textInput);
                if (task.validator) {
                    isCorrect = validateAnswer(inputToValidate, task.validator);
                } else {
                    const clean = (s: string) => s.replace(/\s+/g, '').toLowerCase();
                    const userAns = clean(inputToValidate);

                    if (userAns === '') {
                        isCorrect = false;
                    } else {
                        const correctAnswers = String(task.correctAnswer).split(',').map(s => clean(s.trim()));
                        isCorrect = correctAnswers.some(ans => userAns.includes(ans));
                    }
                }
            }
        } else if (task.type === 'visualChoice') {
            isCorrect = selectedOption === task.correctAnswer;
        } else if (task.type === 'angleMeasure' && task.angleData) {
            const userAngle = parseInt(angleInput) || 0;
            const correctAngle = task.angleData.correctAngle;
            // Allow ±5° tolerance
            isCorrect = Math.abs(userAngle - correctAngle) <= 5;
        } else if (task.type === 'sliderTransform' && task.sliderData) {
            const correctK = task.sliderData.correctK;
            // Allow ±0.1 tolerance
            isCorrect = Math.abs(sliderValue - correctK) <= 0.1;
        } else if (task.type === 'areaDecomposition' && task.decompositionData) {
            // For area decomposition, check if all parts are selected and sum matches
            const allPartsSelected = task.decompositionData.parts?.every((part: any) => selectedParts.has(part.label)) || false;
            if (allPartsSelected) {
                const totalArea = task.decompositionData.parts?.reduce((sum: number, part: any) => sum + (part.area || 0), 0) || 0;
                const userAnswer = parseInt(textInput) || 0;
                isCorrect = Math.abs(userAnswer - totalArea) <= 1; // Allow ±1 tolerance
            }
        } else if (task.type === 'multiAngleThrow') {
            // MultiAngleThrow is validated via onComplete callback, mark as correct if callback succeeded
            // This case is mostly for consistency; actual validation happens in the component
            isCorrect = false; // Will be set via onComplete callback
        }

        if (isCorrect) {
            setFeedback('correct');
            setCorrectAnswers(c => c + 1);
            onTaskCorrect(task, task.type === 'wager' ? wager : 0);
        } else {
            setFeedback('wrong');
            setMistakes(m => m + 1);
            requestAdaptiveHint(task, getUserAnswerPreview());
        }
    };

    const handleNext = () => {
        if (currentIdx < tasks.length - 1) {
            setCurrentIdx(p => p + 1);
            setFeedback(null);
            setSelectedOption(null);
            setTextInput('');
            setWager(0);
            setTimeLeft(timeLimit && timeLimit > 0 ? timeLimit : Infinity);
            setClassification({});
            setAngleInput('');
            setSliderValue(1);
            setSelectedParts(new Set());
            setMultiFieldValues({});
            setAdaptiveHint(null);
            setIsAutoHintLoading(false);
            setEvaluationResult(null);
            setIsEvaluating(false);
            // Don't reset correctAnswers - we want to track total across all tasks
        } else {
            // Calculate percentage of correct answers
            const totalTasks = tasks.length;
            const correctCount = correctAnswers;
            const percentage = totalTasks > 0 ? Math.round((correctCount / totalTasks) * 100) : 0;
            // Perfect run means no mistakes
            const isPerfect = mistakes === 0;
            const summary: QuestRunSummary = {
              correctCount,
              totalTasks,
              mistakes,
              hintsUsed: 0,
              elapsedMs: Date.now() - runStartRef.current,
            };
            onComplete(isPerfect, percentage, summary);
        }
    };


    const handleInteractiveComplete = (success: boolean) => {
        if(success) {
            onTaskCorrect(tasks[currentIdx], 0);
            handleNext();
        } else {
            setMistakes(m => m + 1);
            handleNext();
        }
    };

    useEffect(() => {
        // Update CurrentTaskContext when task changes
        const task = tasks[currentIdx];
        if (task) {
            setCurrentTask(unit.title, task.question);
        } else {
            setCurrentTask(null, null);
        }
    }, [currentIdx, tasks, unit.title, setCurrentTask]);

    if (!tasks || tasks.length === 0) {
      console.warn('[QuestExecutionView] No tasks provided. Unit:', unit.id, 'Tasks:', tasks);
      return (
        <div className="p-10 text-center">
          <div className="text-slate-500">Lade Mission...</div>
          <div className="text-xs text-slate-400 mt-2">Keine Aufgaben gefunden für {unit.title}</div>
        </div>
      );
    }
    const task = tasks[currentIdx];
    if (!task) {
      console.error('[QuestExecutionView] Task not found at index', currentIdx, 'Tasks:', tasks);
      return <div className="p-10 text-center text-red-500">Fehler: Aufgabe nicht gefunden</div>;
    }

    // DEBUG
    console.log('Current Task:', task);

    const renderSupportVisual = (visual: Task['supportVisual']) => {
        if (!visual) return null;
        return (
            <div className="mt-4 flex flex-col items-center gap-3">
                <svg viewBox={visual.viewBox || '0 0 220 170'} className="w-full max-w-sm text-current">
                    {visual.elements.map((element: any, idx: number) => {
                        if (element.type === 'line') {
                            return (
                                <line
                                    key={`line-${idx}`}
                                    x1={element.x1}
                                    y1={element.y1}
                                    x2={element.x2}
                                    y2={element.y2}
                                    stroke={element.stroke || (isBountyMode ? '#fcd34d' : '#0f172a')}
                                    strokeWidth={element.strokeWidth || 3}
                                    strokeDasharray={element.dashed ? '6 4' : undefined}
                                    strokeLinecap="round"
                                />
                            );
                        }
                        if (element.type === 'path') {
                            return (
                                <path
                                    key={`path-${idx}`}
                                    d={element.d}
                                    fill={element.fill || 'none'}
                                    opacity={element.opacity}
                                    stroke={element.stroke || (isBountyMode ? '#f59e0b' : '#0f172a')}
                                    strokeWidth={element.strokeWidth || 3}
                                    strokeDasharray={element.strokeDasharray}
                                />
                            );
                        }
                        if (element.type === 'text') {
                            return (
                                <text
                                    key={`text-${idx}`}
                                    x={element.x}
                                    y={element.y}
                                    fill={element.color || (isBountyMode ? '#fde68a' : '#475569')}
                                    fontSize={element.fontSize || 12}
                                    textAnchor={element.anchor || 'middle'}
                                    fontFamily="'Inter', sans-serif"
                                >
                                    {element.text}
                                </text>
                            );
                        }
                        return null;
                    })}
                </svg>
                {visual.caption && (
                    <p className={`text-xs font-bold text-center ${isBountyMode ? 'text-amber-200' : 'text-slate-500'}`}>{visual.caption}</p>
                )}
            </div>
        );
    };

    const buildFallbackHint = (targetTask: Task) => {
        const blob = `${targetTask.question} ${targetTask.instructions || ''} ${targetTask.context || ''}`.toLowerCase();
        if (blob.includes('pythag')) {
            return 'Denk an den Satz des Pythagoras: a² + b² = c².';
        }
        if (blob.includes('maßstab') || blob.includes('scale') || blob.includes('streck')) {
            return 'Rechne alle Längen zuerst in dieselbe Einheit um, bevor du multiplizierst oder teilst.';
        }
        if (blob.includes('scheitel')) {
            return 'Der Scheitelpunkt ist der Schnittpunkt der Geraden – gegenüberliegende Winkel sind dort gleich groß.';
        }
        if (blob.includes('winkel')) {
            return 'Nebenwinkel ergänzen sich zu 180°. Prüfe, ob du den passenden Partnerwinkel gewählt hast.';
        }
        return 'Überprüfe Einheiten und lies die Fragestellung langsam Schritt für Schritt.';
    };

    const requestAdaptiveHint = (targetTask: Task, userValue: string) => {
        if (noCheatSheet || adaptiveHint || isAutoHintLoading) return;
        setIsAutoHintLoading(true);
        // Adaptive hints removed - use AI button in header instead
        setAdaptiveHint(buildFallbackHint(targetTask));
        setIsAutoHintLoading(false);
    };

    const getUserAnswerPreview = () => {
        if (task.type === 'input' || task.type === 'shorttext') return textInput;
        if (task.type === 'angleMeasure') return angleInput;
        if (task.type === 'sliderTransform') return sliderValue.toString();
        if ((task.type === 'choice' || task.type === 'wager' || task.type === 'boolean') && task.options && selectedOption !== null) {
            return task.options[selectedOption] || '';
        }
        return '';
    };

    const isInteractive = task.type.startsWith('interactive_') || task.type === 'multiAngleThrow';

    const handleMultiAngleThrowComplete = (success: boolean, hitsCount: number) => {
        if(success) {
            onTaskCorrect(tasks[currentIdx], 0);
            // Coins are handled by MultiAngleThrowTraining component
        }
        handleNext();
    };

    const handleCoinsChange = async (delta: number) => {
        if (!user) return;
        try {
            const { adjustCoins } = await import('./services/serverSync');
            const newCoins = await adjustCoins(delta, 'multi_angle_throw', 'task', tasks[currentIdx]?.id);
            if (newCoins !== null && user) {
                // User state will be refreshed by adjustCoins via refreshUserFromServer
            }
        } catch (err) {
            console.error('Failed to adjust coins:', err);
            throw err;
        }
    };

    return (
        <div className={`fixed inset-0 z-[40] flex flex-col pt-[73px] ${isBountyMode ? 'bounty-mode' : 'bg-white'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isBountyMode ? 'bounty-header' : 'bg-slate-50'}`}>
                <Button variant="ghost" onClick={onCancel} className={isBountyMode ? 'text-amber-200' : ''}>Abbrechen</Button>
                <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isBountyMode ? 'text-amber-400' : 'text-slate-400'}`}>{unit.title}</span>
                    <div className="flex gap-1 mt-1">
                        {Array.from({ length: tasks.length }).map((_, i) => (
                            <div key={i} className={`h-1.5 w-6 rounded-full ${i < currentIdx ? 'bg-emerald-400' : i === currentIdx ? (isBountyMode ? 'bg-amber-400' : 'bg-indigo-500') : 'bg-slate-200'}`} />
                        ))}
                    </div>
                </div>
                <div className={`font-mono font-bold w-16 text-right ${isBountyMode ? 'text-amber-400' : 'text-slate-400'}`}>
                    {timeLimit && timeLimit > 0 ? `${timeLeft}s` : '∞'}
                </div>
            </div>

            {/* Tools available during quest */}
            {user && onOpenTool && (
                <div className="px-4 py-2 border-b bg-slate-50 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {user.unlockedTools?.includes('formel_rechner') && (
                        <button
                            onClick={() => onOpenTool('formel_rechner')}
                            className="px-3 py-1.5 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors text-xs font-bold shrink-0"
                            title="Formel-Rechner"
                        >
                            🧮 Formel-Rechner
                        </button>
                    )}
                    {user.unlockedTools?.includes('schritt_loeser') && (
                        <button
                            onClick={() => onOpenTool('schritt_loeser')}
                            className="px-3 py-1.5 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors text-xs font-bold shrink-0"
                            title="Schritt-für-Schritt-Loeser"
                        >
                            📝 Schritt-Loeser
                        </button>
                    )}
                    {user.unlockedTools?.includes('spicker_trainer') && (
                        <button
                            onClick={() => onOpenTool('spicker_trainer')}
                            className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-xs font-bold shrink-0"
                            title="Spicker-Coach"
                        >
                            🧠 Spicker-Coach
                        </button>
                    )}
                    {user.unlockedTools?.includes('scheitel_coach') && (
                        <button
                            onClick={() => onOpenTool('scheitel_coach')}
                            className="px-3 py-1.5 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors text-xs font-bold shrink-0"
                            title="Scheitel-Coach"
                        >
                            📈 Scheitel-Coach
                        </button>
                    )}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full flex flex-col">
                {isBountyMode && (
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-amber-400 uppercase tracking-widest drop-shadow-lg">🏆 Bounty {currentIdx + 1}/{tasks.length} 🏆</h2>
                    </div>
                )}

                {isInteractive ? (
                    <div className="flex-1 flex py-4">
                      {task.type === 'interactive_alien_scanner' && <AlienScannerTask task={task} onComplete={handleInteractiveComplete} />}
                      {task.type === 'multiAngleThrow' && <MultiAngleThrowTraining task={task} user={user} onCoinsChange={handleCoinsChange} onComplete={handleMultiAngleThrowComplete} />}
                    </div>
                ) : (
                    <>
                        <div className="mb-10">
                            <div className="text-center mb-6">
                                <h3 className={`text-xl sm:text-3xl font-black italic leading-tight mb-4 ${isBountyMode ? 'text-amber-100' : 'text-slate-900'}`}>{task.question}</h3>
                            </div>

                            {/* Context, Given, Asked, Instructions */}
                            {(task.context || task.given || task.asked || task.instructions) && (
                                <div className={`p-6 rounded-2xl border-2 mb-6 text-left ${isBountyMode ? 'bg-amber-900/20 border-amber-500/30' : 'bg-slate-50 border-slate-200'}`}>
                                    {task.context && (
                                        <div className="mb-4">
                                            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isBountyMode ? 'text-amber-400' : 'text-slate-500'}`}>Kontext</p>
                                            <p className={`text-sm font-medium ${isBountyMode ? 'text-slate-200' : 'text-slate-700'}`}>{task.context}</p>
                                        </div>
                                    )}
                                    {task.given && task.given.length > 0 && (
                                        <div className="mb-4">
                                            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isBountyMode ? 'text-amber-400' : 'text-slate-500'}`}>Gegeben</p>
                                            <ul className={`list-disc list-inside space-y-1 text-sm ${isBountyMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                                {task.given.map((item, i) => (
                                                    <li key={i} className="font-medium">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {task.asked && task.asked.length > 0 && (
                                        <div className="mb-4">
                                            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isBountyMode ? 'text-amber-400' : 'text-slate-500'}`}>Gesucht</p>
                                            <ul className={`list-disc list-inside space-y-1 text-sm ${isBountyMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                                {task.asked.map((item, i) => (
                                                    <li key={i} className="font-medium">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {task.instructions && (
                                        <div>
                                            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isBountyMode ? 'text-amber-400' : 'text-slate-500'}`}>Hinweis</p>
                                            <p className={`text-sm font-medium italic ${isBountyMode ? 'text-amber-300' : 'text-indigo-700'}`}>{task.instructions}</p>
                                        </div>
                                    )}
                                    {task.supportVisual && renderSupportVisual(task.supportVisual)}
                                </div>
                            )}

                        </div>

                        {/* DEBUG: Log task data */}
                        {console.log('[QuestExecution] Task Type:', task.type, 'visualData:', task.visualData, 'Full Task:', task)}

                        <div className="space-y-4 mb-10">
                           {(task.type === 'choice' || task.type === 'wager' || task.type === 'boolean') && (
                                <div className="grid grid-cols-1 gap-3">
                                    {task.options?.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => !feedback && setSelectedOption(i)}
                                            className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${isBountyMode ? (selectedOption === i ? 'bounty-option-selected' : 'bounty-option') : (selectedOption === i ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-100')}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {task.type === 'wager' && task.wagerOptions && (
                                <div className="mt-6 p-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
                                    <p className="text-xs font-black uppercase text-amber-700 mb-3 tracking-widest">💰 Wette Coins:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {task.wagerOptions.map((amount, i) => (
                                            <button
                                                key={i}
                                                onClick={() => !feedback && setWager(amount)}
                                                className={`p-3 rounded-xl border-2 font-black text-sm transition-all ${wager === amount ? 'border-amber-600 bg-amber-600 text-white' : 'border-amber-300 bg-white text-amber-700 hover:bg-amber-100'}`}
                                            >
                                                {amount}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {task.type === 'visualChoice' && (
                                <>
                                    {console.log('[visualChoice] visualData exists:', !!task.visualData, 'visualData:', task.visualData)}
                                    {task.visualData && task.visualData.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {task.visualData.map((item: any, i: number) => (
                                                <button
                                                    key={item.id || i}
                                                    onClick={() => !feedback && setSelectedOption(item.id)}
                                                    className={`relative p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${selectedOption === item.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                                                >
                                                    <svg viewBox="0 0 200 150" className="w-24 h-24 mb-3">
                                                        <path d={item.path} fill="none" stroke="currentColor" strokeWidth="3" />
                                                    </svg>
                                                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl text-center">
                                            <p className="text-red-600 font-bold">⚠️ FEHLER: visualData fehlt oder ist leer!</p>
                                            <p className="text-xs text-red-500 mt-2">Task ID: {task.id} | Type: {task.type}</p>
                                            <p className="text-xs text-red-400 mt-1">Task Object: {JSON.stringify(task, null, 2)}</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {task.type === 'dragDrop' && task.dragDropData && (
                                <DragDropTask
                                    task={task}
                                    classification={classification}
                                    onClassificationChange={setClassification}
                                    disabled={!!feedback}
                                />
                            )}
                            {task.type === 'angleMeasure' && task.angleData && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-full max-w-xs aspect-square bg-slate-50 rounded-2xl border-4 border-slate-200 flex items-center justify-center relative">
                                        <svg
                                            viewBox="0 0 300 300"
                                            className="w-full h-full"
                                            style={{ color: '#475569' }}
                                            onMouseMove={(e) => {
                                                if (feedback) return;
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const svgX = ((e.clientX - rect.left) / rect.width) * 300;
                                                const svgY = ((e.clientY - rect.top) / rect.height) * 300;
                                                setHoverPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                                                // Show correct angle when hovering (simplified - could calculate actual angle from geometry)
                                                setHoverAngle(task.angleData.correctAngle);
                                            }}
                                            onMouseLeave={() => {
                                                setHoverAngle(null);
                                                setHoverPosition(null);
                                            }}
                                            onClick={(e) => {
                                                if (feedback) return;
                                                // Set the angle input to the correct angle when clicking
                                                setAngleInput(task.angleData.correctAngle.toString());
                                            }}
                                        >
                                            {task.angleData.baseLine && (
                                                <line
                                                    x1={task.angleData.baseLine.x1}
                                                    y1={task.angleData.baseLine.y1}
                                                    x2={task.angleData.baseLine.x2}
                                                    y2={task.angleData.baseLine.y2}
                                                    stroke={task.angleData.baseLine.stroke || '#94a3b8'}
                                                    strokeWidth={task.angleData.baseLine.strokeWidth || 5}
                                                    strokeDasharray={task.angleData.baseLine.dashed ? '6 4' : undefined}
                                                />
                                            )}
                                            {task.angleData.wallLine && (
                                                <line
                                                    x1={task.angleData.wallLine.x1}
                                                    y1={task.angleData.wallLine.y1}
                                                    x2={task.angleData.wallLine.x2}
                                                    y2={task.angleData.wallLine.y2}
                                                    stroke={task.angleData.wallLine.stroke || '#475569'}
                                                    strokeWidth={task.angleData.wallLine.strokeWidth || 5}
                                                    strokeDasharray={task.angleData.wallLine.dashed ? '6 4' : undefined}
                                                />
                                            )}
                                            {task.angleData.helperLines?.map((line, idx) => (
                                                <line
                                                    key={`helper-${idx}`}
                                                    x1={line.x1}
                                                    y1={line.y1}
                                                    x2={line.x2}
                                                    y2={line.y2}
                                                    stroke={line.stroke || '#2563eb'}
                                                    strokeWidth={line.strokeWidth || 4}
                                                    strokeDasharray={line.dashed ? '6 4' : undefined}
                                                    strokeLinecap="round"
                                                />
                                            ))}
                                            {(task.angleData.angleArcs ?? []).map((arc, idx) => (
                                                <path
                                                    key={`arc-${idx}`}
                                                    d={arc.path}
                                                    fill={arc.fill || 'rgba(99,102,241,0.25)'}
                                                    opacity={arc.opacity}
                                                    stroke={arc.stroke}
                                                    strokeWidth={arc.strokeWidth || 2}
                                                    strokeDasharray={arc.strokeDasharray}
                                                />
                                            ))}
                                            {task.angleData.path && (
                                                <path d={task.angleData.path} fill="none" stroke="currentColor" strokeWidth="3" />
                                            )}
                                        </svg>
                                        {hoverAngle !== null && hoverPosition && !feedback && (
                                            <div
                                                className="absolute pointer-events-none bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-black shadow-lg z-10"
                                                style={{
                                                    left: `${hoverPosition.x + 10}px`,
                                                    top: `${hoverPosition.y - 10}px`,
                                                    transform: 'translateY(-100%)'
                                                }}
                                            >
                                                {hoverAngle}°
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full max-w-xs">
                                        <p className="text-sm font-bold text-slate-600 mb-2">Messe den Winkel:</p>
                                        <input
                                            type="number"
                                            value={angleInput}
                                            onChange={(e) => setAngleInput(e.target.value)}
                                            placeholder="Winkel in Grad"
                                            disabled={!!feedback}
                                            className="w-full p-4 text-xl font-black rounded-2xl border-4 border-slate-100 focus:border-indigo-500 bg-slate-50 outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                            {task.type === 'sliderTransform' && task.sliderData && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-full max-w-xs aspect-square bg-slate-50 rounded-2xl border-4 border-slate-200 flex items-center justify-center">
                                        <svg viewBox="0 0 300 300" className="w-full h-full" style={{ transform: `scale(${sliderValue})` }}>
                                            <path d={task.sliderData.basePath} fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                    </div>
                                    <div className="w-full max-w-xs">
                                        <p className="text-xs font-bold text-slate-600 mb-2">Transformier-Schieber (k = {sliderValue.toFixed(1)}):</p>
                                        <input
                                            type="range"
                                            min={task.sliderData.minK}
                                            max={task.sliderData.maxK}
                                            step="0.1"
                                            value={sliderValue}
                                            onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                                            disabled={!!feedback}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            )}
                            {task.type === 'areaDecomposition' && task.decompositionData && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-full max-w-xs aspect-square bg-slate-50 rounded-2xl border-4 border-slate-200 flex items-center justify-center">
                                        <svg viewBox="0 0 300 300" className="w-full h-full">
                                            <path d={task.decompositionData.complexPath} fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                    </div>
                                    <div className="space-y-2 w-full max-w-xs">
                                        <p className="text-sm font-bold text-slate-600 mb-2">Klicke auf alle Teilflächen:</p>
                                        {task.decompositionData.parts?.map((part: any) => (
                                            <button
                                                key={part.label}
                                                onClick={() => {
                                                    if (feedback) return;
                                                    const newSet = new Set(selectedParts);
                                                    if (newSet.has(part.label)) {
                                                        newSet.delete(part.label);
                                                    } else {
                                                        newSet.add(part.label);
                                                    }
                                                    setSelectedParts(newSet);
                                                }}
                                                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                                                    selectedParts.has(part.label)
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
                                                }`}
                                            >
                                                {part.label} ({part.area} cm²)
                                            </button>
                                        ))}
                                        <div className="mt-4">
                                            <p className="text-sm font-bold text-slate-600 mb-2">Gesamtfläche:</p>
                                            <input
                                                type="number"
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                placeholder="Gesamtfläche in cm²"
                                                disabled={!!feedback}
                                                className="w-full p-4 text-xl font-black rounded-2xl border-4 border-slate-100 focus:border-indigo-500 bg-slate-50 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {(task.type === 'input' || task.type === 'shorttext') && (
                                <div className="relative z-10">
                                    {isBountyMode ? (
                                        // Bounty mode: Always use textarea for free-text answers
                                        <textarea
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder={task.placeholder || "Gib hier deine vollständige Antwort ein. Erkläre deine Lösung Schritt für Schritt..."}
                                            disabled={!!feedback || isEvaluating}
                                            readOnly={!!feedback}
                                            rows={8}
                                            autoFocus
                                            className={`w-full p-6 text-lg font-medium rounded-2xl border-4 outline-none transition-all resize-y bounty-input ${feedback ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
                                            style={{ pointerEvents: feedback ? 'none' : 'auto', WebkitUserSelect: 'text', userSelect: 'text' }}
                                        />
                                    ) : task.multiInputFields && task.multiInputFields.length > 0 ? (
                                        <MultiFieldInput
                                            fields={task.multiInputFields}
                                            values={multiFieldValues}
                                            onChange={setMultiFieldValues}
                                            disabled={!!feedback}
                                            isBountyMode={isBountyMode}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            inputMode={task.validator?.type === 'coordinatePair' ? 'text' : 'numeric'}
                                            value={textInput}
                                            onChange={(e) => {
                                                // For coordinate pairs, allow pipe character
                                                if (task.validator?.type === 'coordinatePair') {
                                                    setTextInput(e.target.value);
                                                } else {
                                                    const sanitized = sanitizeMathInput(e.target.value);
                                                    setTextInput(sanitized);
                                                }
                                            }}
                                            placeholder={task.placeholder || "Deine Antwort hier..."}
                                            disabled={!!feedback}
                                            readOnly={!!feedback}
                                            autoFocus
                                            className={`w-full p-6 text-xl font-black rounded-2xl border-4 outline-none transition-all ${isBountyMode ? 'bounty-input' : 'border-slate-100 focus:border-indigo-500 bg-slate-50'} ${feedback ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
                                            style={{ pointerEvents: feedback ? 'none' : 'auto', WebkitUserSelect: 'text', userSelect: 'text' }}
                                        />
                                    )}
                                    {isBountyMode && <div className="absolute -top-3 left-6 px-2 bg-slate-900 text-amber-500 text-[10px] font-black uppercase tracking-widest">Freitext-Antwort erforderlich</div>}
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 pb-4 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
                            {!feedback && !isEvaluating ? (
                                <Button onClick={handleVerify} size="lg" className={`w-full ${isBountyMode ? 'bounty-button' : ''}`}>
                                    Überprüfen
                                </Button>
                            ) : isEvaluating ? (
                                <div className={`p-8 rounded-[2rem] border-2 ${isBountyMode ? 'bg-amber-900/40 border-amber-500' : 'bg-indigo-50 border-indigo-100'}`}>
                                    <div className={`text-xl font-black mb-3 ${isBountyMode ? 'text-amber-400' : 'text-indigo-600'}`}>
                                        Antwort wird evaluiert...
                                    </div>
                                    <p className={`text-sm font-medium ${isBountyMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                        Bitte warte, während deine Antwort von der KI bewertet wird.
                                    </p>
                                </div>
                            ) : (
                                <div className={`p-8 rounded-[2rem] border-2 animate-in zoom-in-95 duration-200 ${feedback === 'correct' ? (isBountyMode ? 'bg-emerald-900/40 border-emerald-500' : 'bg-emerald-50 border-emerald-100') : (isBountyMode ? 'bg-rose-900/40 border-rose-500' : 'bg-rose-50 border-rose-100')}`}>
                                    <div className={`text-2xl font-black italic mb-3 uppercase tracking-tighter ${feedback === 'correct' ? (isBountyMode ? 'text-emerald-400' : 'text-emerald-600') : (isBountyMode ? 'text-rose-400' : 'text-rose-600')}`}>
                                        {feedback === 'correct' ? 'Richtig! 🎉' : 'Leider falsch... 💀'}
                                    </div>

                                    {/* Bounty mode: Show structured evaluation feedback */}
                                    {isBountyMode && evaluationResult && (
                                        <div className="mb-4 space-y-3">
                                            {evaluationResult.overallFeedback && (
                                                <p className={`text-sm font-bold leading-relaxed ${isBountyMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {evaluationResult.overallFeedback}
                                                </p>
                                            )}

                                            {evaluationResult.correctSubTasks && evaluationResult.correctSubTasks.length > 0 && (
                                                <div className={`p-3 rounded-xl ${isBountyMode ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-100'}`}>
                                                    <div className={`text-xs font-black uppercase mb-1 ${isBountyMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                        ✅ Korrekte Teilaufgaben:
                                                    </div>
                                                    <p className={`text-sm font-semibold ${isBountyMode ? 'text-emerald-200' : 'text-emerald-700'}`}>
                                                        {evaluationResult.correctSubTasks.map(num => {
                                                            const field = task.multiInputFields?.[num - 1];
                                                            return field ? field.label : `Teilaufgabe ${num}`;
                                                        }).join(', ')}
                                                    </p>
                                                </div>
                                            )}

                                            {evaluationResult.incorrectSubTasks && evaluationResult.incorrectSubTasks.length > 0 && (
                                                <div className={`p-3 rounded-xl ${isBountyMode ? 'bg-rose-900/30 border border-rose-500/30' : 'bg-rose-50 border border-rose-100'}`}>
                                                    <div className={`text-xs font-black uppercase mb-2 ${isBountyMode ? 'text-rose-400' : 'text-rose-600'}`}>
                                                        ❌ Falsche Teilaufgaben:
                                                    </div>
                                                    <div className="space-y-2">
                                                        {evaluationResult.incorrectSubTasks.map((item, idx) => {
                                                            const field = task.multiInputFields?.[item.subTaskNumber - 1];
                                                            return (
                                                                <div key={idx} className={`text-sm ${isBountyMode ? 'text-rose-200' : 'text-rose-700'}`}>
                                                                    <div className="font-bold">
                                                                        {field ? field.label : `Teilaufgabe ${item.subTaskNumber}`}:
                                                                    </div>
                                                                    <div className="text-xs mt-1 opacity-90">
                                                                        <strong>Warum falsch:</strong> {item.reason}
                                                                    </div>
                                                                    <div className="text-xs mt-1 opacity-90">
                                                                        <strong>Richtig wäre:</strong> {item.correctAnswer}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Standard mode: Show explanation */}
                                    {!isBountyMode && (
                                        <p className={`text-sm font-bold leading-relaxed mb-4 ${isBountyMode ? 'text-slate-300' : 'text-slate-600'}`}>{task.explanation}</p>
                                    )}

                                    {feedback === 'wrong' && isAutoHintLoading && !adaptiveHint && (
                                        <p className={`text-xs font-medium mb-2 ${isBountyMode ? 'text-amber-200' : 'text-slate-500'}`}>Tipp wird geladen...</p>
                                    )}
                                    {feedback === 'wrong' && adaptiveHint && (
                                        <div className={`mb-4 p-3 rounded-2xl text-sm font-semibold ${isBountyMode ? 'bg-slate-900/40 text-amber-200 border border-amber-500/30' : 'bg-indigo-50 text-indigo-800 border border-indigo-100'}`}>
                                            💡 {adaptiveHint}
                                        </div>
                                    )}
                                    {feedback === 'wrong' && !isBountyMode && (
                                        <p className={`text-xs font-medium mb-4 ${isBountyMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            💡 Tipp: Lies die Frage nochmal genau durch. Überlege, welche Formel oder welches Konzept hier angewendet werden muss.
                                        </p>
                                    )}
                                    <Button onClick={handleNext} variant={feedback === 'correct' ? 'success' : 'secondary'} className="w-full">
                                        {currentIdx < tasks.length - 1 ? 'Weiter zur nächsten Frage' : 'Quest abschließen'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main App (wrapped with CurrentTaskProvider) ---
const AppContent = () => {
  const { unitTitle, taskQuestion, setCurrentTask } = useCurrentTask();
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'learn' | 'community' | 'shop'>('learn');
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [openBattles, setOpenBattles] = useState<BattleRecord[]>([]);
  const [myBattles, setMyBattles] = useState<BattleRecord[]>([]);
  const [isBattleSyncLoading, setIsBattleSyncLoading] = useState(false);
  const battleSyncErrorShown = useRef(false); // Throttle battle sync error toasts
  const [battleSession, setBattleSession] = useState<BattleSession | null>(null);

  const [currentQuest, setCurrentQuest] = useState<{unit: LearningUnit, type: 'pre' | 'standard' | 'bounty', options?: { timeLimit?: number; noCheatSheet?: boolean }} | null>(null);
  const [isQuestActive, setIsQuestActive] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await bootstrapServerUser();
        // Only update if we got real server data (not dev fallback)
        if (mounted && res && res.user && (!res.note || !res.note.includes('dev-fallback'))) {
          setUser(res.user);
        }
        // If bootstrap returned null or dev fallback, keep existing user
      } catch (e) {
        console.warn('bootstrapServerUser failed', e);
        // On error, keep existing user
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Blockiere Copy & Paste um AI-Antworten zu verhindern
  useEffect(() => {
    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Blockiere Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A (Windows/Linux)
      // Blockiere Cmd+C, Cmd+V, Cmd+X, Cmd+A (Mac)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Event-Listener hinzufügen
    document.addEventListener('copy', preventCopyPaste, true);
    document.addEventListener('paste', preventCopyPaste, true);
    document.addEventListener('cut', preventCopyPaste, true);
    document.addEventListener('keydown', preventKeyboardShortcuts, true);
    document.addEventListener('contextmenu', preventContextMenu, true);

    // Cleanup beim Unmount
    return () => {
      document.removeEventListener('copy', preventCopyPaste, true);
      document.removeEventListener('paste', preventCopyPaste, true);
      document.removeEventListener('cut', preventCopyPaste, true);
      document.removeEventListener('keydown', preventKeyboardShortcuts, true);
      document.removeEventListener('contextmenu', preventContextMenu, true);
    };
  }, []);

  const [isCoinPulsing, setIsCoinPulsing] = useState(false);
  const [isFlyingCoinActive, setIsFlyingCoinActive] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isFormelsammlungOpen, setIsFormelsammlungOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatInitialQuestion, setAiChatInitialQuestion] = useState<string | undefined>();
  const [aiChatInitialTopic, setAiChatInitialTopic] = useState<string | undefined>();
  const [isFormelRechnerOpen, setIsFormelRechnerOpen] = useState(false);
  const [isSchrittLoeserOpen, setIsSchrittLoeserOpen] = useState(false);
  const [isSpickerTrainerOpen, setIsSpickerTrainerOpen] = useState(false);
  const [isScheitelCoachOpen, setIsScheitelCoachOpen] = useState(false);

  // Check if user has unlocked tools
  const hasFormelRechner = user?.unlockedTools?.includes('formel_rechner') ?? false;
  const hasSchrittLoeser = user?.unlockedTools?.includes('schritt_loeser') ?? false;
  const hasSpickerTrainer = user?.unlockedTools?.includes('spicker_trainer') ?? false;
  const hasScheitelCoach = user?.unlockedTools?.includes('scheitel_coach') ?? false;

  const overlayOpeners = {
    formelsammlung: () => setIsFormelsammlungOpen(true),
    formel_rechner: () => setIsFormelRechnerOpen(true),
    schritt_loeser: () => setIsSchrittLoeserOpen(true),
    spicker_trainer: () => setIsSpickerTrainerOpen(true),
    scheitel_coach: () => setIsScheitelCoachOpen(true),
  };

  // Moved memo hook before any potential early return
  const tasksForCurrentQuest = useMemo(() => {
    if (!currentQuest) return [];
    try {
      const tasks = TaskFactory.getTasksForUnit(currentQuest.unit.id, currentQuest.type);
      console.log(`[Quest] Generated ${tasks.length} tasks for unit ${currentQuest.unit.id}, type: ${currentQuest.type}`, tasks);
      if (tasks.length === 0 && currentQuest.type === 'pre') {
        console.warn(`[Quest] No PreTasks found for unit ${currentQuest.unit.id}. Check if preTasks are registered in taskFactory.ts`);
      }
      return tasks;
    } catch (error) {
      console.error('[Quest] Error generating tasks:', error);
      return [];
    }
  }, [currentQuest]);

  const activeEffect = (name: string) => user?.activeEffects?.includes(name) || previewEffect === name;
  const isDarkMode = activeEffect('dark');

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const refreshBattles = useCallback(async () => {
    if (!user) return;
    setIsBattleSyncLoading(true);
    try {
      const [mine, open] = await Promise.all([
        BattleService.list('mine'),
        BattleService.list('open'),
      ]);
      setMyBattles(mine);
      setOpenBattles(open);
      battleSyncErrorShown.current = false; // Reset on success
    } catch (err) {
      console.error('[refreshBattles]', err);
      // Throttle error toast - only show once per session until success
      if (!battleSyncErrorShown.current) {
        battleSyncErrorShown.current = true;
        addToast('Battle-Sync fehlgeschlagen - Server nicht erreichbar', 'error');
      }
    } finally {
      setIsBattleSyncLoading(false);
    }
  }, [user, addToast]);

  // Refresh battles when community tab is active - use ref to avoid re-triggering on refreshBattles recreation
  const refreshBattlesRef = useRef(refreshBattles);
  refreshBattlesRef.current = refreshBattles;

  useEffect(() => {
    if (!user || activeTab !== 'community') return;
    refreshBattlesRef.current();
  }, [user, activeTab]);


  const triggerCoinAnimation = () => {
    setIsFlyingCoinActive(true);
    setTimeout(() => {
        setIsCoinPulsing(true);
        setTimeout(() => setIsCoinPulsing(false), 500);
    }, 900);
  };

  const handleTaskCorrect = async (task: Task, wager: number) => {
    if(!user || !currentQuest) return;
    const baseCoins = task.type === 'wager' ? 10 + wager : 10;
    // Map 'pre' to 'standard' for QuestService (which only accepts 'standard' | 'bounty')
    const questType = currentQuest.type === 'pre' ? 'standard' : currentQuest.type;
    const { updatedUser, coinsAwarded } = await QuestService.awardCoinsForQuestion(user, currentQuest.unit.id, task.id, baseCoins, questType);
    setUser(updatedUser);
    if(coinsAwarded > 0) triggerCoinAnimation();
  };

  const handleQuestComplete = async (isPerfectRun: boolean, percentage: number = 100, summary?: QuestRunSummary) => {
    if (!currentQuest || !user) return;

    let u = user;
    if (currentQuest.type === 'standard') {
        // Calculate partial reward based on percentage
        const baseReward = currentQuest.unit.coinsReward;
        const partialReward = percentage >= 80 ? baseReward : Math.round((percentage / 100) * baseReward);

        // QuestService now handles coin rewards and server persistence
        const result = await QuestService.completeStandardQuest(
          user,
          currentQuest.unit.id,
          partialReward,
          isPerfectRun,
          percentage
        );
        u = result.updatedUser;
        if (result.coinsAwarded > 0) {
            if (percentage === 100) {
                addToast(`Quiz perfekt! +${result.coinsAwarded} Coins`, 'success');
            } else if (percentage >= 80) {
                addToast(`Gut gemacht! ${percentage}% richtig - +${result.coinsAwarded} Coins`, 'success');
            } else {
                addToast(`${percentage}% richtig - +${result.coinsAwarded} Coins`, 'info');
            }
            triggerCoinAnimation();
        } else {
            addToast("Wiederholt! (Keine neuen Coins)", "info");
        }
    } else if (currentQuest.type === 'bounty') {
        // QuestService now handles bounty rewards and server persistence
        const result = await QuestService.completeBountyQuest(
          user,
          currentQuest.unit.id,
          currentQuest.unit.bounty,
          isPerfectRun
        );
        u = result.updatedUser;
        if (result.coinsAwarded > 0) {
            addToast(`BOUNTY gemeistert! +${result.coinsAwarded} Coins`, 'success');
            triggerCoinAnimation();
        } else {
            addToast("Bounty bereits kassiert!", "info");
        }
    } else if (currentQuest.type === 'pre') {
      const { updatedUser, coinsAwarded } = await QuestService.completePreQuest(
        user,
        currentQuest.unit.id,
        currentQuest.unit.coinsReward || 0
      );
      u = updatedUser;
      if (coinsAwarded > 0) {
        addToast(`Übung abgeschlossen! +${coinsAwarded} Coins`, 'success');
        triggerCoinAnimation();
      } else {
        addToast("Übung abgeschlossen!", "success");
      }
    }
    setUser(u);
    setIsQuestActive(false);
    setCurrentQuest(null);

    // Refresh user from server to ensure we have latest state
    await bootstrapServerUser();
  };

  const handleBattleCreate = useCallback(async (scenario: BattleScenario) => {
    if (!user) return;

    // Check if user is registered (has a proper username)
    const isRegistered = user.username && user.username.trim().length >= 2 && user.username !== 'User';
    if (!isRegistered) {
      addToast('Bitte registriere dich zuerst mit einem Benutzernamen', 'error');
      // Optionally redirect to registration
      return;
    }

    try {
      setIsBattleSyncLoading(true);
      const tasks = generateBattleTaskBundle(scenario.id, scenario.rounds);
      if (!tasks || tasks.length === 0) {
        addToast('Keine Aufgaben für dieses Battle gefunden', 'error');
        return;
      }
      const result = await BattleService.create({
        scenarioId: scenario.id,
        unitId: scenario.unitId,
        unitTitle: scenario.unitTitle,
        stake: scenario.stake,
        rounds: scenario.rounds,
        taskIds: tasks.map(t => t.id),
        taskBundle: tasks,
        metadata: {
          scenarioTitle: scenario.title,
          scenarioTagline: scenario.tagline,
          challengerName: user.username,
          challengerAvatar: user.avatar,
        },
      });
      if (typeof result.coins === 'number') {
        const updatedUser = { ...user, coins: result.coins };
        setUser(updatedUser);
        await DataService.updateUser(updatedUser);
      }
      addToast('Battle erstellt – warte auf Gegner!', 'success');
      await refreshBattles();
    } catch (err: any) {
      console.error('[handleBattleCreate]', err);
      const errorMsg = err?.message || err?.responseData?.message || err?.responseData?.error || 'Battle konnte nicht erstellt werden';
      if (errorMsg.includes('USER_NOT_REGISTERED') || errorMsg.includes('register') || errorMsg.includes('registrier')) {
        addToast('Bitte registriere dich zuerst mit einem Benutzernamen', 'error');
      } else {
        addToast(errorMsg.length > 100 ? 'Battle konnte nicht erstellt werden' : errorMsg, 'error');
      }
    } finally {
      setIsBattleSyncLoading(false);
    }
  }, [user, addToast, refreshBattles]);

  const handleChallengeUser = useCallback(async (opponent: User) => {
    if (!user) return;

    // Check if user is registered (has a proper username)
    const isRegistered = user.username && user.username.trim().length >= 2 && user.username !== 'User';
    if (!isRegistered) {
      addToast('Bitte registriere dich zuerst mit einem Benutzernamen', 'error');
      return;
    }

    // Validate opponent
    if (!opponent || !opponent.id) {
      addToast('Ungültiger Gegner ausgewählt', 'error');
      return;
    }

    // Prevent challenging yourself
    if (opponent.id === user.id) {
      addToast('Du kannst nicht gegen dich selbst kämpfen', 'error');
      return;
    }

    try {
      // Use the first available battle scenario as default
      const defaultScenario = BATTLE_SCENARIOS[0];
      if (!defaultScenario) {
        addToast('Kein Battle-Szenario verfügbar', 'error');
        return;
      }

      // Check if user has enough coins
      const userCoins = Number.isFinite(user.coins) ? user.coins : 0;
      if (userCoins < defaultScenario.stake) {
        addToast(`Nicht genug Coins! Du brauchst ${defaultScenario.stake} Coins für dieses Battle.`, 'error');
        return;
      }

      setIsBattleSyncLoading(true);
      const tasks = generateBattleTaskBundle(defaultScenario.id, defaultScenario.rounds);
      if (!tasks || tasks.length === 0) {
        addToast('Keine Aufgaben für dieses Battle gefunden', 'error');
        setIsBattleSyncLoading(false);
        return;
      }

      const result = await BattleService.create({
        scenarioId: defaultScenario.id,
        unitId: defaultScenario.unitId,
        unitTitle: defaultScenario.unitTitle,
        stake: defaultScenario.stake,
        rounds: defaultScenario.rounds,
        taskIds: tasks.map(t => t.id),
        taskBundle: tasks,
        opponentId: opponent.id,
        metadata: {
          scenarioTitle: defaultScenario.title,
          scenarioTagline: defaultScenario.tagline,
          challengerName: user.username,
          challengerAvatar: user.avatar,
          opponentName: opponent.username,
          opponentAvatar: opponent.avatar,
        },
      });

      if (typeof result.coins === 'number') {
        const updatedUser = { ...user, coins: result.coins };
        setUser(updatedUser);
        await DataService.updateUser(updatedUser);
      }
      addToast(`Battle gegen ${opponent.username} erstellt!`, 'success');
      await refreshBattles();
    } catch (err: any) {
      console.error('[handleChallengeUser]', err);

      // Extract specific error message from response
      let errorMessage = 'Battle konnte nicht erstellt werden';
      if (err?.responseData?.error) {
        const errorCode = err.responseData.error;
        if (errorCode === 'INVALID_UNIT_ID') {
          errorMessage = 'Ungültige Lerneinheit';
        } else if (errorCode === 'INVALID_ROUND_COUNT') {
          errorMessage = 'Ungültige Anzahl Runden';
        } else if (errorCode === 'TASK_BUNDLE_REQUIRED') {
          errorMessage = 'Aufgabenpaket fehlt';
        } else if (errorCode === 'INSUFFICIENT_COINS') {
          errorMessage = 'Nicht genug Coins für diesen Einsatz';
        } else if (errorCode === 'BATTLE_CREATE_FAILED') {
          errorMessage = `Fehler beim Erstellen: ${err.responseData.details || 'Unbekannter Fehler'}`;
        } else {
          errorMessage = err.responseData.message || errorCode;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      addToast(errorMessage, 'error');
    } finally {
      setIsBattleSyncLoading(false);
    }
  }, [user, addToast, refreshBattles]);

  const handleBattleAccept = useCallback(async (battle: BattleRecord) => {
    if (!user) return;
    try {
      setIsBattleSyncLoading(true);
      const result = await BattleService.accept(battle.id);
      if (typeof result.coins === 'number') {
        const updatedUser = { ...user, coins: result.coins };
        setUser(updatedUser);
        await DataService.updateUser(updatedUser);
      }
      addToast('Battle angenommen – viel Erfolg!', 'success');
      await refreshBattles();
    } catch (err: any) {
      console.error('[handleBattleAccept]', err);
      const errorMsg = err?.message || err?.responseData?.message || err?.responseData?.error || 'Battle konnte nicht angenommen werden';
      if (errorMsg.includes('USER_NOT_REGISTERED') || errorMsg.includes('register') || errorMsg.includes('registrier')) {
        addToast('Bitte registriere dich zuerst mit einem Benutzernamen', 'error');
      } else {
        addToast(errorMsg.length > 100 ? 'Battle konnte nicht angenommen werden' : errorMsg, 'error');
      }
    } finally {
      setIsBattleSyncLoading(false);
    }
  }, [user, addToast, refreshBattles]);

  const handleBattleLaunch = useCallback((battle: BattleRecord) => {
    const tasks = battle.taskBundle;
    if (!tasks || tasks.length === 0) {
      addToast('Battle-Aufgaben noch nicht synchronisiert', 'error');
      return;
    }
    const unit = LEARNING_UNITS.find(u => u.id === battle.unitId) || null;
    const scenario = battle.scenarioId ? getBattleScenarioById(battle.scenarioId) : undefined;
    setBattleSession({
      battle,
      tasks,
      scenario,
      unit,
    });
  }, [addToast]);

  const handleBattleRunSubmit = useCallback(async (session: BattleSession, payload: BattleSummaryPayload) => {
    try {
      const result = await BattleService.submit(session.battle.id, payload);
      if (result?.completed) {
        if (result.winnerId) {
          if (result.winnerId === user?.id) {
            addToast('Battle gewonnen! Coins wurden gutgeschrieben.', 'success');
          } else {
            addToast('Battle abgeschlossen – Ergebnis gespeichert.', 'info');
          }
        } else {
          addToast('Battle abgeschlossen – Unentschieden!', 'info');
        }
      } else {
        addToast('Battle-Lauf gespeichert. Warte auf deinen Gegner.', 'success');
      }
      setBattleSession(null);
      await refreshBattles();
    } catch (err) {
      console.error('[handleBattleRunSubmit]', err);
      addToast('Battle-Ergebnis konnte nicht gespeichert werden', 'error');
      throw err;
    }
  }, [user?.id, addToast, refreshBattles]);

  // Show auth screen if no user OR if user has default name "User" (not properly registered)
  // IMPORTANT: This must be AFTER all hooks to avoid React Error #300
  // Check if user needs registration: must have login_name (for login) AND display_name/username (for display)
  // Note: login_name is required for login, display_name/username is required for display
  const hasLoginName = user?.login_name && user.login_name.trim().length >= 4;
  const hasValidDisplayName = user?.username && user.username.trim().length >= 2 && user.username !== 'User';
  const needsRegistration = !user || !hasLoginName || !hasValidDisplayName;
  if (needsRegistration) return <AuthScreen onLogin={setUser} />;

  const startQuest = (unit: LearningUnit, type: 'pre' | 'standard' | 'bounty', options?: { timeLimit?: number; noCheatSheet?: boolean }) => {
    setCurrentQuest({unit, type, options: options || {}});
    setIsQuestActive(true);
    setSelectedUnit(null);
  }

  const handleSendAIMessage = async (
    message: string,
    topic?: string,
    existingMessages: AIMessage[] = []
  ): Promise<{ content: string; coinsCharged: number }> => {
    const persona = user.aiPersona || 'insight';
    const isQuestContext = isQuestActive && unitTitle && taskQuestion;
    const result = await sendAIMessage(message, topic, existingMessages, persona, isQuestContext);

    // Refresh user coins after charge
    if (result.coinsCharged > 0) {
      // Refresh user data from server
      try {
        const res = await bootstrapServerUser();
        if (res && res.user) {
          setUser(res.user);
          setIsCoinPulsing(true);
          setTimeout(() => setIsCoinPulsing(false), 500);
        }
      } catch (err) {
        console.error('Failed to refresh user after AI charge:', err);
      }
    }

    return result;
  };

  const handleOpenAIChat = () => {
    // Wenn im Quest: Automatisch mit Quest-Kontext aus CurrentTaskContext öffnen
    if (isQuestActive && unitTitle && taskQuestion) {
      setAiChatInitialQuestion(taskQuestion);
      setAiChatInitialTopic(unitTitle);
    } else {
      // Außerhalb: Leeren Chat öffnen
      setAiChatInitialQuestion(undefined);
      setAiChatInitialTopic(undefined);
    }
    setIsAIChatOpen(true);
  };

  const handleBuy = async (item: ShopItem) => {
    if (!user) return;
    const userCoins = Number.isFinite(user.coins) ? user.coins : 0;
    if (userCoins < item.cost) {
      addToast("Nicht genug Coins!", 'error');
      return;
    }

    // Call server shopBuy endpoint which handles coins AND unlocked items atomically
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      // Add anon ID header
      try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'mm_anon_id' && value) {
            headers['x-anon-id'] = value;
            break;
          }
        }
        if (!headers['x-anon-id']) {
          const stored = localStorage.getItem('mm_anon_id');
          if (stored) headers['x-anon-id'] = stored;
        }
      } catch (e) {
        // ignore
      }

      const resp = await fetch('/.netlify/functions/shopBuy', {
        method: 'POST',
        headers,
        body: JSON.stringify({ itemId: item.id, itemCost: item.cost }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('[handleBuy] Server error:', resp.status, text);
        addToast("Kauf fehlgeschlagen - bitte erneut versuchen", 'error');
        return;
      }

      const json = await resp.json();

      if (json.note && json.note.includes('dev-fallback')) {
        console.warn('[handleBuy] Dev fallback - purchase not persisted');
        // Optimistic local update for dev mode
        const updatedUser = {
          ...user,
          coins: userCoins - item.cost,
          unlockedItems: [...new Set([...user.unlockedItems, item.id])]
        };
      if (item.type === 'calculator') updatedUser.calculatorSkin = item.value;
      if (item.type === 'formelsammlung') updatedUser.formelsammlungSkin = item.value;
      if (item.type === 'persona') updatedUser.aiPersona = item.value;
      if (item.type === 'skin' && item.id.startsWith('ai_chat_skin_')) updatedUser.aiSkin = item.value;
      if (item.type === 'tool') {
          updatedUser.unlockedTools = [...new Set([...(user.unlockedTools || []), item.value])];
        }
        if (item.type === 'calc_gadget') {
          // Calculator upgrade enables advanced features: Scheitelpunkt, Wurzeln, Potenzen
          updatedUser.calculatorUpgrades = [...new Set([...(user.calculatorUpgrades || []), item.value])];
        }
        setUser(updatedUser);
        await DataService.updateUser(updatedUser);
        addToast(`"${item.name}" gekauft! (Dev Mode)`, 'success');
        return;
      }

      if (!json.ok) {
        console.error('[handleBuy] Purchase failed:', json.error);
        if (json.error === 'INSUFFICIENT_COINS') {
          addToast("Nicht genug Coins!", 'error');
        } else if (json.error === 'ITEM_ALREADY_OWNED') {
          addToast("Item bereits gekauft!", 'info');
        } else {
          addToast("Kauf fehlgeschlagen", 'error');
        }
        return;
      }

      // Update local user state from server response
      const updatedUser = {
        ...user,
        coins: json.coins,
        unlockedItems: json.unlockedItems || [...new Set([...user.unlockedItems, item.id])],
        unlockedTools: json.unlockedTools || user.unlockedTools || [],
        calculatorUpgrades: json.calculatorUpgrades || user.calculatorUpgrades || []
      };
      if (item.type === 'calculator') updatedUser.calculatorSkin = item.value;
      if (item.type === 'formelsammlung') updatedUser.formelsammlungSkin = item.value;
      if (item.type === 'persona') updatedUser.aiPersona = item.value;
      if (item.type === 'skin' && item.id.startsWith('ai_chat_skin_')) updatedUser.aiSkin = item.value;
      if (item.type === 'tool') {
        // Ensure tool is added if not already in server response
        updatedUser.unlockedTools = json.unlockedTools || [...new Set([...(user.unlockedTools || []), item.value])];
      }
      if (item.type === 'calc_gadget') {
        // Ensure calculator upgrade is added if not already in server response
        // Calculator upgrades enable advanced features: Scheitelpunkt, Wurzeln, Potenzen
        updatedUser.calculatorUpgrades = json.calculatorUpgrades || [...new Set([...(user.calculatorUpgrades || []), item.value])];
      }

      // Refresh from server to ensure consistency (this will update user with all fields)
      try {
        const res = await bootstrapServerUser();
        if (res && res.user) {
          setUser(res.user);
        } else {
          // Fallback to local update if server refresh fails
          setUser(updatedUser);
          await DataService.updateUser(updatedUser);
        }
      } catch (err) {
        console.warn('[handleBuy] Failed to refresh from server, using local update:', err);
        setUser(updatedUser);
        await DataService.updateUser(updatedUser);
      }

      addToast(`"${item.name}" gekauft!`, 'success');
    } catch (err) {
      console.error('[handleBuy] Exception:', err);
      addToast("Kauf fehlgeschlagen - Netzwerkfehler", 'error');
    }
  };

  const handleToggleEffect = async (effect: string) => {
    if (!user) return;
    const currentEffects = user.activeEffects || [];
    const newEffects = currentEffects.includes(effect)
        ? currentEffects.filter(e => e !== effect)
        : [...currentEffects, effect];
    const u = {...user, activeEffects: newEffects};
    setUser(u);
    await DataService.updateUser(u);
  };

  return (
    <div className={`min-h-screen transition-all ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <ToastContainer toasts={toasts} />
      <CoinFlightAnimation isActive={isFlyingCoinActive} onComplete={() => setIsFlyingCoinActive(false)} />
      {isCalculatorOpen && <CalculatorWidget skin={user.calculatorSkin} gadgets={user.calculatorUpgrades || []} onClose={() => setIsCalculatorOpen(false)} />}
      {isFormelsammlungOpen && (
        <ModalOverlay onClose={() => setIsFormelsammlungOpen(false)}>
          <FormelsammlungView onClose={() => setIsFormelsammlungOpen(false)} skin={user.formelsammlungSkin as any} />
        </ModalOverlay>
      )}

      {isAIChatOpen && (
        <AIHelperChat
          user={user}
          onClose={() => {
            setIsAIChatOpen(false);
            setAiChatInitialQuestion(undefined);
            setAiChatInitialTopic(undefined);
          }}
          onSendMessage={handleSendAIMessage}
          initialQuestion={aiChatInitialQuestion}
          initialTopic={aiChatInitialTopic}
        />
      )}
      {isFormelRechnerOpen && hasFormelRechner && (
        <ModalOverlay onClose={() => setIsFormelRechnerOpen(false)}>
          <FormelRechner onClose={() => setIsFormelRechnerOpen(false)} />
        </ModalOverlay>
      )}
      {isSchrittLoeserOpen && hasSchrittLoeser && (
        <ModalOverlay onClose={() => setIsSchrittLoeserOpen(false)}>
          <SchrittLoeser onClose={() => setIsSchrittLoeserOpen(false)} />
        </ModalOverlay>
      )}
      {isSpickerTrainerOpen && hasSpickerTrainer && (
        <ModalOverlay onClose={() => setIsSpickerTrainerOpen(false)}>
          <SpickerTrainer onClose={() => setIsSpickerTrainerOpen(false)} />
        </ModalOverlay>
      )}
      {isScheitelCoachOpen && hasScheitelCoach && (
        <ModalOverlay onClose={() => setIsScheitelCoachOpen(false)}>
          <ScheitelCoach onClose={() => setIsScheitelCoachOpen(false)} />
        </ModalOverlay>
      )}
      {isScheitelCoachOpen && user.unlockedTools?.includes('scheitel_coach') && (
        <ModalOverlay onClose={() => setIsScheitelCoachOpen(false)}>
          <ScheitelCoach onClose={() => setIsScheitelCoachOpen(false)} />
        </ModalOverlay>
      )}

       {/* Visual Effects */}
      {activeEffect('rain') && <MatrixRain />}
      {activeEffect('storm') && <ElectricStorm />}
      {activeEffect('dark') && <VoidProtocol />}
      {activeEffect('unicorn') && <UnicornMagic />}
      {activeEffect('neon') && <NeonDreams />}
      {activeEffect('galaxy') && <GalaxyMode />}
      {activeEffect('fire') && <FireBlaze />}
      {activeEffect('rainbow') && <ChromaAura />}
      {activeEffect('singularity') && <SingularityEngine />}
      {activeEffect('horizon') && <EventHorizonUI />}
      {activeEffect('quantum') && <QuantumAfterimage />}

      {/* Header - visible during quests but hidden when modals are open */}
      {!selectedUnit && !isInventoryOpen && !isFormelsammlungOpen && !isCalculatorOpen && !isAIChatOpen && (
        <HeaderBar
          user={user}
          isDarkMode={isDarkMode}
          isCoinPulsing={isCoinPulsing}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenAIChat={handleOpenAIChat}
          onOpenFormelsammlung={() => setIsFormelsammlungOpen(true)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenFormelRechner={hasFormelRechner ? () => setIsFormelRechnerOpen(true) : undefined}
          onOpenSchrittLoeser={hasSchrittLoeser ? () => setIsSchrittLoeserOpen(true) : undefined}
          onOpenSpickerTrainer={hasSpickerTrainer ? () => setIsSpickerTrainerOpen(true) : undefined}
          onOpenScheitelCoach={hasScheitelCoach ? () => setIsScheitelCoachOpen(true) : undefined}
        />
      )}

      {/* Show bottom nav only when not in quest AND not inside modal */}
      {!isQuestActive && !selectedUnit && (
         <>
          <nav className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] backdrop-blur-2xl border p-1.5 sm:p-2 rounded-full shadow-2xl flex items-center gap-0.5 sm:gap-1 ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'} safe-area-bottom`} style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
             {(['learn', 'community', 'shop'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // Stop preview when leaving shop
                  if (tab !== 'shop' && previewEffect) {
                    setPreviewEffect(null);
                  }
                }}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all min-h-[44px] touch-manipulation ${activeTab === tab ? 'bg-slate-900 text-white scale-105 shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {tab === 'learn' ? '📖 Quests' : tab === 'community' ? '⚔️ Blood Dome' : '🛒 Shop'}
              </button>
            ))}
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-24 sm:pb-32 relative z-10">
            {activeTab === 'learn' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(LEARNING_UNITS || []).map(unit => {
                    const questStats = getQuestStats(user, unit.id);
                    const tileStatus = getTileStatus(unit.id, user);
                    const bountyLabel = tileStatus === 'bounty_cleared' ? 'Bounty erledigt' : tileStatus === 'gold_unlocked' ? 'Bounty bereit' : 'Bounty gesperrt';
                    const bountyClass = tileStatus === 'bounty_cleared' ? 'text-emerald-500' : tileStatus === 'gold_unlocked' ? 'text-indigo-500' : 'text-slate-400';

                    return (
                      <GlassCard
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit)}
                        isInteractive={true}
                        className={`overflow-hidden border-b-8 ${(user.masteredUnits?.includes(unit.id) ?? false) ? 'border-emerald-500 shadow-emerald-500/20' : (user.completedUnits?.includes(unit.id) ?? false) ? 'border-amber-500 shadow-amber-500/20' : `!border-b-${GROUP_THEME[unit.group].color}-500`} ${isDarkMode ? 'bg-slate-900/50' : 'bg-white shadow-xl'}`}
                      >
                         <div className="flex justify-between items-start mb-6">
                            <Badge color={GROUP_THEME[unit.group].color as any}>{unit.category}</Badge>
                            <DifficultyStars difficulty={unit.difficulty} />
                         </div>
                         <CardTitle className="mb-3">{unit.title}</CardTitle>
                         <p className="text-[11px] text-slate-400 font-bold italic mb-4 leading-relaxed h-12 overflow-hidden">{unit.description}</p>
                         <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                              <span>Quest-Fortschritt</span>
                              <span>{questStats.percent}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full ${questStats.capReached ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${questStats.percent}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase">
                              <span>Coins</span>
                              <span>{questStats.earned} / {Number.isFinite(questStats.cap) ? questStats.cap : '∞'}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                              <span>Bounty</span>
                              <span className={bountyClass}>{bountyLabel}</span>
                            </div>
                            {questStats.capReached && (
                              <div className="text-[10px] font-black uppercase text-amber-500">Cap erreicht – nur noch Training</div>
                            )}
                         </div>
                         <div className="flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50 pt-4">
                            <span>Reward: {unit.coinsReward}</span>
                            <span>Bounty: {unit.bounty}</span>
                         </div>
                      </GlassCard>
                    );
                })}
              </div>
            )}
          {activeTab === 'community' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
                <ChatView currentUser={user} />
                <div className="lg:col-span-2">
                  <BloodDomeLeaderboard currentUser={user} onChallenge={handleChallengeUser} isDarkMode={isDarkMode} isLoading={isBattleSyncLoading} />
                </div>
              </div>
              <BattleLobby currentUser={user} />
            <BattlePanel
              user={user}
              scenarios={BATTLE_SCENARIOS}
              openBattles={openBattles}
              myBattles={myBattles}
              isLoading={isBattleSyncLoading}
              onCreateBattle={handleBattleCreate}
              onAcceptBattle={handleBattleAccept}
              onLaunchBattle={handleBattleLaunch}
              onRefresh={refreshBattles}
            />
            </div>
          )}
            {activeTab === 'shop' && <ShopView user={user} onBuy={handleBuy} onPreview={async (item: ShopItem, cost: number) => {
              // Toggle off
              if (previewEffect === item.value) {
                setPreviewEffect(null);
                return;
              }
              // Check if can afford preview
              const userCoins = Number.isFinite(user.coins) ? user.coins : 0;
              if (cost > 0 && userCoins >= cost) {
                const u = {...user, coins: userCoins - cost};
                setUser(u);
                await DataService.updateUser(u);
                addToast(`${cost} Coins für Vorschau`, 'info');
              } else if (cost > 0) {
                addToast('Nicht genug Coins für Vorschau!', 'error');
                return;
              }
              setPreviewEffect(item.value);
            }} previewEffect={previewEffect} isDarkMode={isDarkMode} />}
          </main>
        </>
      )}

      {selectedUnit && (
        <UnitView
          unit={selectedUnit}
          user={user}
          bountyCompleted={Boolean(user.bountyPayoutClaimed?.[selectedUnit.id])}
          onClose={() => setSelectedUnit(null)}
          onStartQuest={startQuest}
          overlayOpeners={overlayOpeners}
        />
      )}

      {isInventoryOpen && (
        <InventoryModal
          user={user}
          onClose={() => setIsInventoryOpen(false)}
          onToggleEffect={handleToggleEffect}
          onAvatarChange={async (v) => { const u = {...user, avatar: v}; setUser(u); await DataService.updateUser(u); }}
          onSkinChange={async (v) => { const u = {...user, calculatorSkin: v}; setUser(u); await DataService.updateUser(u); }}
          onFormelsammlungSkinChange={async (v) => { const u = {...user, formelsammlungSkin: v}; setUser(u); await DataService.updateUser(u); }}
          onPersonaChange={async (v) => { const u = {...user, aiPersona: v}; setUser(u); await DataService.updateUser(u); }}
          onAISkinChange={async (v) => { const u = {...user, aiSkin: v}; setUser(u); await DataService.updateUser(u); }}
        />
      )}

      {battleSession && (
        <BattleRunModal
          session={battleSession}
          user={user}
          onClose={() => setBattleSession(null)}
          onSubmit={handleBattleRunSubmit}
        />
      )}

      {isQuestActive && currentQuest && (
          <QuestExecutionView
              unit={currentQuest.unit}
              tasks={tasksForCurrentQuest}
              isBountyMode={currentQuest.type === 'bounty'}
              timeLimit={currentQuest.options?.timeLimit}
              noCheatSheet={currentQuest.options?.noCheatSheet}
              user={user}
              onTaskCorrect={handleTaskCorrect}
              onComplete={handleQuestComplete}
              onCancel={() => {
                setIsQuestActive(false);
                setCurrentTask(null, null);
              }}
              onOpenTool={(toolId) => {
                if (toolId === 'formel_rechner') setIsFormelRechnerOpen(true);
                else if (toolId === 'schritt_loeser') setIsSchrittLoeserOpen(true);
                else if (toolId === 'spicker_trainer') setIsSpickerTrainerOpen(true);
                else if (toolId === 'scheitel_coach') setIsScheitelCoachOpen(true);
              }}
          />
      )}
    </div>
  );
}

const BattleRunModal: React.FC<{
  session: BattleSession;
  user: User;
  onClose: () => void;
  onSubmit: (session: BattleSession, payload: BattleSummaryPayload) => Promise<void> | void;
}> = ({ session, user, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleBattleComplete = async (isPerfect: boolean, percentage: number = 0, summary?: QuestRunSummary) => {
    if (isSubmitting) return;
    const payload: BattleSummaryPayload = {
      correctCount: summary?.correctCount ?? Math.round((percentage / 100) * session.tasks.length),
      totalTasks: summary?.totalTasks ?? session.tasks.length,
      percentage,
      solveTimeMs: summary?.elapsedMs ?? 0,
      isPerfectRun: isPerfect,
      detail: summary,
    };
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      await onSubmit(session, payload);
    } catch (err: any) {
      setSubmissionError(err?.message || 'Unbekannter Fehler');
      setIsSubmitting(false);
    }
  };

  if (!session.unit) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="bg-white rounded-[2rem] p-8 max-w-2xl mx-auto text-center">
          <CardTitle>Battle nicht verfügbar</CardTitle>
          <p className="text-sm text-slate-500">Die verknüpfte Lerneinheit wurde nicht gefunden.</p>
          <div className="mt-6">
            <Button onClick={onClose}>Schließen</Button>
          </div>
        </div>
      </ModalOverlay>
    );
  }

  const lockHints = session.scenario?.modifiers?.some(mod => mod.toLowerCase().includes('hint')) || false;
  const timerModifier = session.scenario?.modifiers?.find(mod => /\d+\s?s/i.test(mod));
  const timeLimit = timerModifier ? parseInt(timerModifier.match(/(\d+)/)?.[1] || '', 10) || undefined : undefined;

  return (
    <ModalOverlay onClose={() => { if (!isSubmitting) onClose(); }}>
      <div className="bg-white rounded-[3rem] p-10 max-w-4xl w-full mx-auto relative shadow-2xl border-8 border-slate-50 animate-in zoom-in-95 duration-300">
        <button
          onClick={() => !isSubmitting && onClose()}
          className={`absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center font-black transition-all shadow-sm ${isSubmitting ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white'}`}
          disabled={isSubmitting}
        >
          ✕
        </button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Badge color="indigo">Battle</Badge>
            <CardTitle className="mt-2 mb-1">{session.scenario?.title || session.unit.title}</CardTitle>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              {session.scenario?.tagline || session.unit.description}
            </p>
          </div>
          <div className="text-right text-xs font-black uppercase text-slate-400">
            <div>Einsatz: {session.battle.stake} Coins</div>
            <div>Runden: {session.battle.roundCount}</div>
          </div>
        </div>
        <QuestExecutionView
          unit={session.unit}
          tasks={session.tasks}
          isBountyMode={false}
          timeLimit={timeLimit}
          noCheatSheet={lockHints}
          user={user}
          onTaskCorrect={() => {}}
          onComplete={handleBattleComplete}
          onCancel={() => !isSubmitting && onClose()}
        />
        {isSubmitting && (
          <p className="text-center text-xs font-black text-emerald-600 mt-4">Ergebnis wird gespeichert...</p>
        )}
        {submissionError && (
          <p className="text-center text-xs font-black text-rose-500 mt-4">{submissionError}</p>
        )}
      </div>
    </ModalOverlay>
  );
};

// Kompaktes Quest-Modal im RealMath-Stil
const UnitView: React.FC<{
  unit: LearningUnit;
  user: User;
  bountyCompleted: boolean;
  onClose: () => void;
  onStartQuest: (unit: LearningUnit, type: 'pre' | 'standard' | 'bounty', options?: { timeLimit?: number; noCheatSheet?: boolean }) => Promise<void> | void;
  overlayOpeners: Partial<Record<'formelsammlung' | 'formel_rechner' | 'schritt_loeser' | 'spicker_trainer' | 'scheitel_coach', () => void>>;
}> = ({ unit, user, bountyCompleted, onClose, onStartQuest, overlayOpeners }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'pre' | 'standard' | 'bounty'>('info');
    const [isStartingBounty, setIsStartingBounty] = useState(false);
    const definition = GEOMETRY_DEFINITIONS.find(d => d.id === unit.definitionId);
    const entryFee = computeEntryFee(unit.bounty);
    const userCoins = Number.isFinite(user.coins) ? user.coins : 0;
    const insufficientCoins = userCoins < entryFee;
    const questStats = getQuestStats(user, unit.id);
    const tileStatus = getTileStatus(unit.id, user);
    const bountyUnlocked = tileStatus !== 'locked';
    const bountyCleared = bountyCompleted || tileStatus === 'bounty_cleared';

    const handleBountyStart = async () => {
        if (isStartingBounty) return;
        setIsStartingBounty(true);
        try {
            // Small delay to ensure state updates
            await new Promise(resolve => setTimeout(resolve, 100));
            await onStartQuest(unit, 'bounty', {});
            // Reset after transition
            setTimeout(() => setIsStartingBounty(false), 500);
        } catch (error) {
            console.error('Error starting bounty:', error);
            setIsStartingBounty(false);
        }
    };
    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white rounded-[3rem] p-10 max-w-3xl w-full mx-auto relative shadow-2xl border-8 border-slate-50 animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">✕</button>
                <div className="flex items-center gap-3 mb-4"><Badge color={GROUP_THEME[unit.group].color as any}>{unit.category}</Badge><DifficultyStars difficulty={unit.difficulty} /></div>
                <SectionHeading className="mb-4 text-slate-950 !text-4xl uppercase">{unit.title}</SectionHeading>
                <div className="border-b border-slate-100 mb-8 flex flex-wrap md:flex-nowrap gap-3 md:gap-8 overflow-hidden md:overflow-x-auto scrollbar-hide">
                    {(['info', 'pre', 'standard', 'bounty'] as const).map(id => (
                       <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          disabled={id === 'pre'}
                          className={`pb-4 px-1 border-b-4 font-black text-[11px] leading-tight uppercase tracking-widest transition-all text-center md:text-left whitespace-normal md:whitespace-nowrap ${id === 'pre' ? 'opacity-40 cursor-not-allowed text-slate-300' : activeTab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-600'}`}
                       >
                          {id === 'info' ? 'Spickzettel' : id === 'pre' ? 'Training (Coming Soon)' : id === 'standard' ? 'Quest' : 'Bounty'}
                       </button>
                    ))}
                </div>
                <div className="min-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                    {activeTab === 'info' && (
                       <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {user.unlockedTools?.includes('formel_rechner') && (
                              <button
                                onClick={() => overlayOpeners.formel_rechner?.()}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold flex items-center gap-2"
                              >
                                🧮 Formel-Rechner
                              </button>
                            )}
                            {user.unlockedTools?.includes('schritt_loeser') && (
                              <button
                                onClick={() => overlayOpeners.schritt_loeser?.()}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center gap-2"
                              >
                                📝 Schritt-Loeser
                              </button>
                            )}
                            {user.unlockedTools?.includes('spicker_trainer') && (unit.definitionId === 'potenzen' || unit.definitionId === 'quadratisch') && (
                              <button
                                onClick={() => overlayOpeners.spicker_trainer?.()}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold flex items-center gap-2"
                              >
                                🧠 Spicker-Coach
                              </button>
                            )}
                            {user.unlockedTools?.includes('scheitel_coach') && unit.definitionId === 'quadratisch' && (
                              <button
                                onClick={() => overlayOpeners.scheitel_coach?.()}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 font-semibold flex items-center gap-2"
                              >
                                📈 Scheitel-Coach
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 font-bold italic leading-relaxed bg-slate-50 p-6 rounded-3xl">{unit.detailedInfo}</p>
                          {definition && (
                             <div className="space-y-6">
                                <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                                    <h5 className="text-[10px] font-black uppercase text-indigo-200 mb-2 tracking-widest">Master-Formel:</h5>
                                    <div className="text-3xl font-black italic tracking-tighter drop-shadow-md">{definition.formula}</div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   {definition.terms.map((t, i) => (
                                      <div key={i} className="p-6 rounded-[2rem] border-2 border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col gap-4">
                                         {t.visual && (<div className="w-full h-24 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><svg viewBox="0 0 200 100" className="w-16 h-16 text-indigo-500"><path d={t.visual} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /></svg></div>)}
                                         <div><h6 className="font-black text-xs uppercase mb-1 text-slate-900 tracking-wide">{t.term}</h6><p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">{t.definition}</p></div>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          )}
                       </div>
                    )}
                    {activeTab === 'pre' && <div className="text-center py-16 space-y-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"><div className="text-7xl animate-bounce">🎮</div><h4 className="text-2xl font-black italic text-slate-900">Training Session</h4><p className="font-bold text-slate-400 text-sm max-w-sm mx-auto uppercase tracking-tighter italic">Lerne die Mechaniken spielerisch kennen.</p><Button onClick={() => onStartQuest(unit, 'pre')} className="w-full max-w-xs mx-auto !py-5 shadow-xl">Start Training</Button></div>}
                    {activeTab === 'standard' && (
                      <div className="text-center py-12 space-y-6 bg-indigo-50/50 rounded-[3rem] border-2 border-indigo-100">
                        <div className="text-7xl">🎯</div>
                        <h4 className="text-2xl font-black italic text-indigo-900">Quest Modus</h4>
                        <p className="font-bold text-slate-400 text-sm max-w-sm mx-auto">
                          Standard-Fragen zum Thema. Belohnung:
                          <span className="text-amber-500 font-black"> {unit.coinsReward} Coins</span>.
                        </p>
                        <div className="space-y-2 text-left">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                            <span>Coins</span>
                            <span>{questStats.earned} / {Number.isFinite(questStats.cap) ? questStats.cap : '∞'}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white overflow-hidden">
                            <div className={`${questStats.capReached ? 'bg-emerald-500' : 'bg-indigo-500'} h-full`} style={{ width: `${questStats.percent}%` }} />
                          </div>
                          {questStats.capReached && (
                            <div className="text-[11px] font-black uppercase text-amber-500">
                              Kein weiterer Coin-Gewinn möglich – weiter trainieren!
                            </div>
                          )}
                        </div>
                        <Button onClick={() => onStartQuest(unit, 'standard')} className="w-full max-w-xs mx-auto !py-5">
                          Quiz starten
                        </Button>
                      </div>
                    )}
                    {activeTab === 'bounty' && (
                      <div className="text-center py-16 space-y-6 bg-slate-900 rounded-[3rem] border-4 border-amber-500/30 text-white">
                        <div className="text-7xl">🏴‍☠️</div>
                        <h4 className="text-2xl font-black italic text-amber-400">Bounty Hunt</h4>
                        <p className="font-bold text-slate-400 text-sm max-w-sm mx-auto uppercase italic">
                          Extra-Schwer.<br />
                          Extra Reward: <span className="text-amber-400 font-black">+{unit.bounty} Coins</span> (einmalig).
                        </p>
                        <p className="text-xs font-black tracking-widest text-slate-300">
                          Entry Fee: <span className="text-amber-300">-{entryFee} Coins</span> • Reward bei Erfolg: <span className="text-emerald-300">+{unit.bounty} Coins</span>
                        </p>
                        <p className="text-[11px] font-black uppercase text-amber-300">
                          Status: {bountyCleared ? 'Bounty erledigt' : bountyUnlocked ? 'Freigeschaltet' : 'Gesperrt'}
                        </p>
                        {!bountyUnlocked && (
                          <p className="text-[11px] font-black uppercase text-amber-200 max-w-sm mx-auto">
                            Erst Quest perfekt abschließen, um die Bounty zu aktivieren.
                          </p>
                        )}
                        {bountyCompleted && (
                          <p className="text-[11px] font-black uppercase text-amber-300 max-w-sm mx-auto">
                            Bounty bereits abgeschlossen – keine weitere Auszahlung. Snooze runs kosten weiterhin Entry Fee.
                          </p>
                        )}
                        <Button
                          variant="danger"
                          onClick={handleBountyStart}
                          disabled={!bountyUnlocked || isStartingBounty || bountyCompleted || insufficientCoins}
                          className="w-full max-w-xs mx-auto !py-5 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bountyCompleted
                            ? 'Bounty gemeistert'
                            : !bountyUnlocked
                            ? 'Gesperrt'
                            : insufficientCoins
                            ? `💰 ${userCoins}/${entryFee}`
                            : isStartingBounty
                            ? 'Starte...'
                            : `Accept Bounty ⚔️ (-${entryFee})`}
                        </Button>
                      </div>
                    )}
                </div>
            </div>
        </ModalOverlay>
    );
};

export default function App() {
  return (
    <CurrentTaskProvider>
      <AppContent />
    </CurrentTaskProvider>
  );
}
