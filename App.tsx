
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LEARNING_UNITS, SHOP_ITEMS, PROGRESS_LEVELS, GEOMETRY_DEFINITIONS } from './constants';
import { LearningUnit, User, Task, ShopItem, ChatMessage, CategoryGroup, ToastMessage, ToastType } from './types';
import { AuthService, DataService, SocialService } from './services/apiService';
import { QuestService } from './services/questService';
import { TaskFactory } from './services/taskFactory';
import {
  Button, GlassCard, SectionHeading, CardTitle, Badge, DifficultyStars,
  ToastContainer, ModalOverlay, CoinFlightAnimation,
  CalculatorWidget
} from './ui-components';

const GROUP_THEME: Record<CategoryGroup, { color: string; bg: string; text: string; border: string; darkBg: string }> = {
  'A': { color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', darkBg: 'bg-indigo-600' },
  'B': { color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', darkBg: 'bg-emerald-600' },
  'C': { color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', darkBg: 'bg-amber-600' }
};

// --- Visual Effect Components ---
const MatrixRain: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const fontSize = 16;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);
        const speeds: number[] = new Array(columns).fill(0).map(() => 0.5 + Math.random() * 1.5);
        const chars = "0123456789+-×÷=√πΣΔΩ∞∫∂λαβγδ";
        const glowChars: {x: number, y: number, char: string, life: number, hue: number}[] = [];

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 8, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < drops.length; i++) {
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                const char = chars[Math.floor(Math.random() * chars.length)];
                if (y > 0 && y < canvas.height) {
                    ctx.save();
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#00ff88';
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
                    ctx.fillText(char, x, y);
                    ctx.restore();
                    if (Math.random() < 0.02) {
                        glowChars.push({x, y, char, life: 1, hue: 120 + Math.random() * 40});
                    }
                }
                for (let j = 1; j < 25; j++) {
                    const trailY = y - j * fontSize;
                    if (trailY > 0 && trailY < canvas.height) {
                        const alpha = Math.max(0, 1 - j / 25);
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
        const interval = setInterval(draw, 33); return () => clearInterval(interval);
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[5]" />;
};

const ElectricStorm: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        interface Bolt { path: {x: number, y: number}[]; life: number; width: number; hue: number; }
        const bolts: Bolt[] = [];
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        let lastMouse = { ...mouse };
        let globalEnergy = 0;

        const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const handleMouseDown = (e: MouseEvent) => {
            for (let i = 0; i < 12; i++) createBolt(e.clientX, e.clientY, 80 + Math.random() * 120);
            globalEnergy = Math.min(globalEnergy + 50, 100);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);

        function createBolt(x: number, y: number, length: number) {
            const path = [{x, y}];
            const baseAngle = Math.random() * Math.PI * 2;
            let currX = x, currY = y;
            const segments = Math.floor(length / 4);
            for(let i=0; i<segments; i++) {
                const jitter = 15 + (globalEnergy * 0.2);
                currX += Math.cos(baseAngle) * 4 + (Math.random() - 0.5) * jitter;
                currY += Math.sin(baseAngle) * 4 + (Math.random() - 0.5) * jitter;
                path.push({x: currX, y: currY});
            }
            bolts.push({ path, life: 1.0, width: 2 + Math.random() * 2, hue: 180 + Math.random() * 60 });
        }

        const draw = () => {
            globalEnergy *= 0.98;
            ctx.fillStyle = `rgba(5, 10, 25, ${0.15 - globalEnergy * 0.001})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const dx = mouse.x - lastMouse.x, dy = mouse.y - lastMouse.y;
            const speed = Math.sqrt(dx*dx + dy*dy);
            globalEnergy = Math.min(globalEnergy + speed * 0.1, 100);
            if (speed > 3 || Math.random() < 0.03) {
                const count = Math.min(Math.floor(speed / 8) + 1, 4);
                for (let k = 0; k < count; k++) createBolt(mouse.x, mouse.y, 40 + Math.random() * 60 + globalEnergy);
            }
            lastMouse.x = mouse.x; lastMouse.y = mouse.y;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            for (let i = bolts.length - 1; i >= 0; i--) {
                const b = bolts[i];
                ctx.beginPath();
                if (b.path.length > 0) {
                    ctx.moveTo(b.path[0].x, b.path[0].y);
                    for (let j = 1; j < b.path.length; j++) ctx.lineTo(b.path[j].x, b.path[j].y);
                }
                ctx.strokeStyle = `hsla(${b.hue}, 100%, 90%, ${b.life})`;
                ctx.lineWidth = b.width * b.life;
                ctx.shadowBlur = 25 * b.life;
                ctx.shadowColor = `hsla(${b.hue}, 100%, 70%, 1)`;
                ctx.stroke();
                b.life -= 0.06;
                if (b.life <= 0) bolts.splice(i, 1);
            }
            ctx.shadowBlur = 0;
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleMouseDown); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
};

const VoidProtocol: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        let time = 0;
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        interface Void { x: number; y: number; r: number; life: number; }
        interface Particle { x: number; y: number; vx: number; vy: number; size: number; hue: number; life: number; }
        const voids: Void[] = [];
        const particles: Particle[] = [];
        for (let i = 0; i < 60; i++) {
            particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, size: 0.5 + Math.random() * 2, hue: 240 + Math.random() * 40, life: 0.3 + Math.random() * 0.7 });
        }
        const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const handleMouseDown = () => { voids.push({ x: mouse.x, y: mouse.y, r: 10, life: 1 }); };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);

        const draw = () => {
            time += 0.003;
            const breathe = Math.sin(time * 0.5) * 0.5 + 0.5;
            ctx.fillStyle = '#020208';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * (0.5 + breathe * 0.2));
            grad.addColorStop(0, 'rgba(15, 10, 30, 0.9)');
            grad.addColorStop(1, 'rgba(0, 0, 5, 1)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
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
            particles.forEach(p => {
                voids.forEach(v => {
                    const pdx = v.x - p.x, pdy = v.y - p.y;
                    const dist = Math.sqrt(pdx * pdx + pdy * pdy);
                    if (dist < 200 && dist > v.r) {
                        const force = (200 - dist) / 200 * 0.05 * v.life;
                        p.vx += (pdx / dist) * force;
                        p.vy += (pdy / dist) * force;
                    }
                });
                p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.vy *= 0.99;
                if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${p.life * 0.4})`; ctx.fill();
            });
            for (let i = voids.length - 1; i >= 0; i--) {
                const v = voids[i];
                const vGrad = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, v.r * 3);
                vGrad.addColorStop(0, `rgba(0, 0, 0, ${v.life})`);
                vGrad.addColorStop(0.3, `rgba(40, 20, 80, ${v.life * 0.3})`);
                vGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = vGrad; ctx.beginPath(); ctx.arc(v.x, v.y, v.r * 3, 0, Math.PI * 2); ctx.fill();
                v.r += 1; v.life -= 0.015;
                if (v.life <= 0) voids.splice(i, 1);
            }
            const auraGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100);
            auraGrad.addColorStop(0, 'rgba(60, 20, 100, 0.2)');
            auraGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = auraGrad; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2); ctx.fill();
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleMouseDown); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[0]" />;
};

const UnicornMagic: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        interface Particle { x: number; y: number; vx: number; vy: number; size: number; hue: number; life: number; type: string; rotation: number; }
        const particles: Particle[] = [];
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        let lastMouse = { ...mouse };
        let tick = 0;
        const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const handleMouseDown = () => {
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                const speed = 3 + Math.random() * 5;
                const types = ['heart', 'star', 'sparkle'];
                particles.push({ x: mouse.x, y: mouse.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 8 + Math.random() * 12, hue: Math.random() * 360, life: 1, type: types[Math.floor(Math.random() * 3)], rotation: Math.random() * Math.PI * 2 });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        const drawStar = (x: number, y: number, size: number, rotation: number) => {
            ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.beginPath();
            for (let i = 0; i < 5; i++) { const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2; if (i === 0) ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size); else ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size); }
            ctx.closePath(); ctx.fill(); ctx.restore();
        };
        const drawHeart = (x: number, y: number, size: number, rotation: number) => {
            ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.beginPath();
            ctx.moveTo(0, size * 0.3); ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.5); ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.3);
            ctx.fill(); ctx.restore();
        };
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); tick++;
            const dx = mouse.x - lastMouse.x, dy = mouse.y - lastMouse.y;
            const speed = Math.sqrt(dx*dx + dy*dy);
            const baseHue = (tick * 2) % 360;
            if (speed > 2) {
                const count = Math.min(Math.floor(speed / 2), 8);
                for(let i = 0; i < count; i++) {
                    particles.push({ x: mouse.x + (Math.random() - 0.5) * 30, y: mouse.y + (Math.random() - 0.5) * 30, vx: -dx * 0.1 + (Math.random() - 0.5) * 2, vy: -dy * 0.1 + (Math.random() - 0.5) * 2 - 0.5, size: 4 + Math.random() * 6, hue: baseHue + (Math.random() * 60 - 30), life: 1, type: 'trail', rotation: Math.random() * Math.PI * 2 });
                }
            }
            if (Math.random() < 0.08) {
                const types = ['sparkle', 'star', 'heart'];
                particles.push({ x: Math.random() * canvas.width, y: canvas.height + 20, vx: (Math.random() - 0.5) * 1, vy: -1 - Math.random() * 2, size: 8 + Math.random() * 12, hue: Math.random() * 360, life: 1, type: types[Math.floor(Math.random() * 3)], rotation: 0 });
            }
            lastMouse = { ...mouse };
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx + Math.sin(tick * 0.03 + p.y * 0.01) * 0.8;
                p.y += p.vy; p.vy += 0.02; p.rotation += 0.02; p.life -= 0.012;
                if (p.life <= 0 || p.y < -50) { particles.splice(i, 1); continue; }
                const alpha = p.life * 0.9;
                const size = p.size * (0.5 + Math.sin(p.life * Math.PI) * 0.5);
                ctx.fillStyle = `hsla(${p.hue}, 85%, 75%, ${alpha})`;
                ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
                ctx.shadowBlur = 20;
                if (p.type === 'star') drawStar(p.x, p.y, size, p.rotation);
                else if (p.type === 'heart') drawHeart(p.x, p.y, size, p.rotation);
                else { ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2); ctx.fill(); }
                ctx.shadowBlur = 0;
            }
            const cursorGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
            cursorGrad.addColorStop(0, `hsla(${baseHue}, 100%, 80%, 0.3)`);
            cursorGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = cursorGrad; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2); ctx.fill();
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleMouseDown); };
    }, []);
    return <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" /><canvas ref={canvasRef} /></div>;
};

const NeonDreams: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        let time = 0;
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        let targetMouse = { ...mouse };
        let interactionEnergy = 0;
        interface NeonLine { x1: number; y1: number; x2: number; y2: number; hue: number; life: number; width: number; }
        const neonLines: NeonLine[] = [];
        const handleMouseMove = (e: MouseEvent) => { targetMouse.x = e.clientX; targetMouse.y = e.clientY; interactionEnergy = Math.min(interactionEnergy + 8, 100); };
        const handleMouseDown = () => {
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const length = 100 + Math.random() * 150;
                neonLines.push({ x1: mouse.x, y1: mouse.y, x2: mouse.x + Math.cos(angle) * length, y2: mouse.y + Math.sin(angle) * length, hue: (time * 50 + i * 30) % 360, life: 1, width: 3 + Math.random() * 3 });
            }
            interactionEnergy = 100;
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        const draw = () => {
            interactionEnergy *= 0.96;
            mouse.x += (targetMouse.x - mouse.x) * 0.08;
            mouse.y += (targetMouse.y - mouse.y) * 0.08;
            time += 0.003 + (interactionEnergy * 0.0008);
            ctx.fillStyle = 'rgba(10, 5, 20, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const gridSpacing = 80;
            ctx.strokeStyle = `hsla(${(time * 40) % 360}, 100%, 70%, ${0.05 + interactionEnergy * 0.002})`;
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += gridSpacing) {
                const wave = Math.sin(time + x * 0.01) * 10;
                ctx.beginPath(); ctx.moveTo(x + wave, 0); ctx.lineTo(x - wave, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSpacing) {
                const wave = Math.cos(time + y * 0.01) * 10;
                ctx.beginPath(); ctx.moveTo(0, y + wave); ctx.lineTo(canvas.width, y - wave); ctx.stroke();
            }
            for (let i = neonLines.length - 1; i >= 0; i--) {
                const l = neonLines[i];
                ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2);
                ctx.strokeStyle = `hsla(${l.hue}, 100%, 90%, ${l.life})`;
                ctx.lineWidth = l.width; ctx.shadowBlur = 30; ctx.shadowColor = `hsla(${l.hue}, 100%, 60%, ${l.life})`; ctx.stroke();
                l.life -= 0.02;
                if (l.life <= 0) neonLines.splice(i, 1);
            }
            ctx.shadowBlur = 0;
            const radius = 120 + (Math.sin(time * 4) * 30) + (interactionEnergy * 2.5);
            const bloomHue = (time * 50) % 360;
            const bloomGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
            bloomGrad.addColorStop(0, `hsla(${bloomHue}, 100%, 80%, ${0.15 + interactionEnergy / 400})`);
            bloomGrad.addColorStop(1, 'transparent');
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = bloomGrad; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2); ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleMouseDown); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[5]" />;
};

const GalaxyMode: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        interface Star { x: number; y: number; z: number; size: number; hue: number; alpha: number; twinkleSpeed: number; originalX: number; originalY: number; }
        interface Nebula { x: number; y: number; radius: number; hue: number; vx: number; vy: number; }
        interface ShootingStar { x: number; y: number; vx: number; vy: number; length: number; life: number; }
        const stars: Star[] = [];
        const nebulae: Nebula[] = [];
        const shootingStars: ShootingStar[] = [];
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        for (let i = 0; i < 500; i++) {
            const z = Math.random();
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            stars.push({ x, y, originalX: x, originalY: y, z: 0.1 + z * 0.9, size: 0.5 + z * 2.5, hue: Math.random() < 0.8 ? 0 : (180 + Math.random() * 60), alpha: 0.3 + Math.random() * 0.7, twinkleSpeed: 0.5 + Math.random() * 2 });
        }
        for(let i = 0; i < 5; i++) {
            nebulae.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 150 + Math.random() * 350, hue: 220 + Math.random() * 100, vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15 });
        }
        const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        window.addEventListener('mousemove', handleMouseMove);
        let time = 0;
        const draw = () => {
            time += 0.002;
            const spaceGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.8);
            spaceGrad.addColorStop(0, '#0a0a1a'); spaceGrad.addColorStop(0.5, '#050510'); spaceGrad.addColorStop(1, '#000005');
            ctx.fillStyle = spaceGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);
            nebulae.forEach(n => {
                n.x += n.vx; n.y += n.vy;
                if (n.x < -n.radius) n.x = canvas.width + n.radius; if (n.x > canvas.width + n.radius) n.x = -n.radius;
                if (n.y < -n.radius) n.y = canvas.height + n.radius; if (n.y > canvas.height + n.radius) n.y = -n.radius;
                const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
                g.addColorStop(0, `hsla(${n.hue}, 40%, 30%, 0.3)`); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2); ctx.fill();
            });
            stars.forEach(s => {
                const parallaxFactor = s.z * 0.03;
                s.x = s.originalX + (mouse.x - canvas.width / 2) * parallaxFactor;
                s.y = s.originalY + (mouse.y - canvas.height / 2) * parallaxFactor;
                if (s.x < 0) s.x += canvas.width; if (s.x > canvas.width) s.x -= canvas.width;
                if (s.y < 0) s.y += canvas.height; if (s.y > canvas.height) s.y -= canvas.height;
                const twinkle = 0.5 + Math.sin(time * s.twinkleSpeed * 3 + s.x) * 0.5;
                ctx.fillStyle = s.hue === 0 ? `rgba(255,255,255,${s.alpha * twinkle})` : `hsla(${s.hue}, 80%, 80%, ${s.alpha * twinkle})`;
                ctx.beginPath(); ctx.arc(s.x, s.y, s.size * twinkle, 0, Math.PI * 2); ctx.fill();
            });
            if (Math.random() < 0.008) {
                const angle = Math.PI * 0.75 + (Math.random() - 0.5) * 0.5;
                const speed = 8 + Math.random() * 12;
                shootingStars.push({ x: Math.random() * canvas.width, y: -20, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, length: 80 + Math.random() * 120, life: 1 });
            }
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const ss = shootingStars[i];
                ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(ss.x - ss.vx * (ss.length / 15), ss.y - ss.vy * (ss.length / 15));
                const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * (ss.length / 15), ss.y - ss.vy * (ss.length / 15));
                grad.addColorStop(0, `rgba(255,255,255,${ss.life})`); grad.addColorStop(1, 'transparent');
                ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.shadowBlur = 15; ctx.shadowColor = '#ffffff'; ctx.stroke(); ctx.shadowBlur = 0;
                ss.x += ss.vx; ss.y += ss.vy; ss.life -= 0.015;
                if (ss.life <= 0 || ss.y > canvas.height + 50) shootingStars.splice(i, 1);
            }
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[0]" />;
};

const FireBlaze: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        interface Ember { x: number; y: number; vx: number; vy: number; size: number; life: number; hue: number; turbulence: number; }
        interface Flame { x: number; baseY: number; height: number; width: number; hue: number; phase: number; }
        const embers: Ember[] = [];
        const flames: Flame[] = [];
        let mouse = { x: canvas.width / 2, y: canvas.height };
        let lastMouse = { ...mouse };
        let intensity = 0;
        let time = 0;
        const flameCount = Math.floor(canvas.width / 100);
        for (let i = 0; i < flameCount; i++) {
            flames.push({ x: (i + 0.5) * (canvas.width / flameCount), baseY: canvas.height, height: 150 + Math.random() * 100, width: 60 + Math.random() * 40, hue: 10 + Math.random() * 25, phase: Math.random() * Math.PI * 2 });
        }
        const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const handleMouseDown = () => {
            intensity = 100;
            for (let i = 0; i < 40; i++) {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
                const speed = 5 + Math.random() * 10;
                embers.push({ x: mouse.x, y: mouse.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 3 + Math.random() * 8, life: 1, hue: 15 + Math.random() * 35, turbulence: Math.random() * 2 });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        const draw = () => {
            time += 0.016; intensity *= 0.97;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flames.forEach(f => {
                const wave = Math.sin(time * 3 + f.phase) * 20;
                const flicker = 0.8 + Math.sin(time * 8 + f.x) * 0.2;
                const height = f.height * flicker * (1 + intensity * 0.01);
                for (let layer = 3; layer >= 0; layer--) {
                    const layerHeight = height * (1 - layer * 0.2);
                    const layerWidth = f.width * (1 - layer * 0.15);
                    const layerHue = f.hue + layer * 10;
                    ctx.beginPath();
                    ctx.moveTo(f.x - layerWidth / 2, f.baseY);
                    ctx.bezierCurveTo(f.x - layerWidth / 2 + wave * 0.3, f.baseY - layerHeight * 0.4, f.x - layerWidth / 4 + wave * 0.5, f.baseY - layerHeight * 0.7, f.x + wave, f.baseY - layerHeight);
                    ctx.bezierCurveTo(f.x + layerWidth / 4 + wave * 0.5, f.baseY - layerHeight * 0.7, f.x + layerWidth / 2 + wave * 0.3, f.baseY - layerHeight * 0.4, f.x + layerWidth / 2, f.baseY);
                    const flameGrad = ctx.createLinearGradient(f.x, f.baseY, f.x, f.baseY - layerHeight);
                    flameGrad.addColorStop(0, `hsla(${layerHue}, 100%, 50%, ${0.4 - layer * 0.08})`);
                    flameGrad.addColorStop(1, 'transparent');
                    ctx.fillStyle = flameGrad;
                    if (layer === 0) { ctx.shadowBlur = 30; ctx.shadowColor = `hsl(${layerHue}, 100%, 50%)`; }
                    ctx.fill();
                }
            });
            ctx.shadowBlur = 0;
            const dx = mouse.x - lastMouse.x, dy = mouse.y - lastMouse.y;
            const speed = Math.sqrt(dx * dx + dy * dy);
            intensity = Math.min(intensity + speed * 0.5, 100);
            if (speed > 3) {
                const count = Math.min(Math.floor(speed / 4), 5);
                for (let i = 0; i < count; i++) {
                    embers.push({ x: mouse.x + (Math.random() - 0.5) * 30, y: mouse.y + (Math.random() - 0.5) * 30, vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 4, size: 2 + Math.random() * 5, life: 1, hue: 15 + Math.random() * 30, turbulence: Math.random() * 1.5 });
                }
            }
            if (Math.random() < 0.15 + intensity * 0.005) {
                embers.push({ x: Math.random() * canvas.width, y: canvas.height + 10, vx: (Math.random() - 0.5) * 0.5, vy: -1.5 - Math.random() * 3, size: 2 + Math.random() * 6, life: 1, hue: 10 + Math.random() * 35, turbulence: 0.5 + Math.random() });
            }
            lastMouse = { ...mouse };
            for (let i = embers.length - 1; i >= 0; i--) {
                const e = embers[i];
                e.x += e.vx + Math.sin(time * 5 + e.y * 0.02) * e.turbulence;
                e.y += e.vy; e.vy *= 0.99; e.vy -= 0.02; e.life -= 0.008;
                if (e.life <= 0 || e.y < -50) { embers.splice(i, 1); continue; }
                const size = e.size * (0.3 + e.life * 0.7);
                ctx.beginPath(); ctx.arc(e.x, e.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${e.hue + (1 - e.life) * 20}, 100%, ${50 + e.life * 50}%, ${e.life})`;
                ctx.shadowBlur = 15 * e.life; ctx.shadowColor = `hsl(${e.hue}, 100%, 60%)`; ctx.fill();
            }
            ctx.shadowBlur = 0;
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleMouseDown); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[5] overflow-hidden" />;
};

const ChromaAura: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        let time = 0;
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        let energy = 0;
        interface Wave { angle: number; speed: number; amplitude: number; hue: number; }
        interface Ring { x: number; y: number; radius: number; hue: number; life: number; }
        const waves: Wave[] = [];
        const rings: Ring[] = [];
        for (let i = 0; i < 6; i++) {
            waves.push({ angle: (i / 6) * Math.PI * 2, speed: 0.5 + Math.random() * 0.5, amplitude: 50 + Math.random() * 100, hue: (i / 6) * 360 });
        }
        const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; energy = Math.min(energy + 3, 100); };
        const handleMouseDown = () => {
            for (let i = 0; i < 7; i++) rings.push({ x: mouse.x, y: mouse.y, radius: 10, hue: i * 51, life: 1 });
            energy = 100;
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        const draw = () => {
            time += 0.008; energy *= 0.97;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 3;
            waves.forEach(w => {
                ctx.beginPath();
                for (let x = 0; x <= canvas.width; x += 5) {
                    const y = canvas.height / 2 + Math.sin(x * 0.01 + time * w.speed + w.angle) * (w.amplitude + energy * 0.5);
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                const waveHue = (w.hue + time * 20) % 360;
                ctx.strokeStyle = `hsla(${waveHue}, 80%, 60%, 0.4)`;
                ctx.shadowBlur = 15; ctx.shadowColor = `hsl(${waveHue}, 100%, 50%)`; ctx.stroke();
            });
            ctx.shadowBlur = 0;
            for (let i = rings.length - 1; i >= 0; i--) {
                const r = rings[i];
                ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(${r.hue}, 90%, 60%, ${r.life * 0.6})`;
                ctx.lineWidth = 4 * r.life; ctx.shadowBlur = 20; ctx.shadowColor = `hsl(${r.hue}, 100%, 50%)`; ctx.stroke();
                r.radius += 6; r.life -= 0.015;
                if (r.life <= 0) rings.splice(i, 1);
            }
            ctx.shadowBlur = 0;
            const auraSize = 100 + energy * 1.5 + Math.sin(time * 3) * 20;
            for (let i = 0; i < 7; i++) {
                const hue = ((time * 50) + i * 51) % 360;
                ctx.beginPath(); ctx.arc(mouse.x, mouse.y, auraSize * (0.4 + i * 0.1), 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.3 - i * 0.03})`; ctx.lineWidth = 3; ctx.stroke();
            }
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleMouseDown); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[5]" />;
};

const SingularityEngine: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        let time = 0;
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        let singularityPower = 50;
        interface Particle { x: number; y: number; vx: number; vy: number; size: number; hue: number; life: number; }
        const particles: Particle[] = [];
        for (let i = 0; i < 200; i++) {
            const radius = 100 + Math.random() * 300;
            const angle = Math.random() * Math.PI * 2;
            particles.push({ x: canvas.width / 2 + Math.cos(angle) * radius, y: canvas.height / 2 + Math.sin(angle) * radius, vx: 0, vy: 0, size: 1 + Math.random() * 3, hue: 260 + Math.random() * 60, life: 0.5 + Math.random() * 0.5 });
        }
        const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const handleMouseDown = () => { singularityPower = 200; };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        const draw = () => {
            time += 0.01; singularityPower = Math.max(50, singularityPower * 0.98);
            ctx.fillStyle = '#030308'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            const lensGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, singularityPower * 3);
            lensGrad.addColorStop(0, 'rgba(0, 0, 0, 1)'); lensGrad.addColorStop(0.3, 'rgba(20, 10, 40, 0.8)'); lensGrad.addColorStop(0.6, 'rgba(60, 20, 100, 0.3)'); lensGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = lensGrad; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, singularityPower * 3, 0, Math.PI * 2); ctx.fill();
            for (let ring = 0; ring < 8; ring++) {
                const wobble = Math.sin(time * 3 + ring) * 5;
                const scaledRadius = ((50 + ring * 40) + wobble) * (singularityPower / 50);
                ctx.beginPath(); ctx.arc(mouse.x, mouse.y, scaledRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(${280 + ring * 10}, 80%, ${40 + ring * 5}%, ${0.3 - ring * 0.03})`; ctx.lineWidth = 2; ctx.stroke();
            }
            particles.forEach(p => {
                const dx = mouse.x - p.x, dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < singularityPower * 0.5) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 300 + Math.random() * 200;
                    p.x = mouse.x + Math.cos(angle) * radius;
                    p.y = mouse.y + Math.sin(angle) * radius;
                } else {
                    const gravityStrength = (singularityPower * 2) / (dist * dist) * 50;
                    p.vx += (dx / dist) * gravityStrength + (-dy / dist) * 0.5;
                    p.vy += (dy / dist) * gravityStrength + (dx / dist) * 0.5;
                    p.vx *= 0.98; p.vy *= 0.98;
                    p.x += p.vx; p.y += p.vy;
                }
                const alpha = Math.min(1, dist / 100) * p.life;
                const stretch = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (stretch > 2) {
                    ctx.beginPath(); ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3); ctx.lineTo(p.x, p.y);
                    ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`; ctx.lineWidth = p.size; ctx.stroke();
                } else {
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`; ctx.fill();
                }
            });
            const horizonGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, singularityPower * 0.6);
            horizonGrad.addColorStop(0, 'rgba(0, 0, 0, 1)'); horizonGrad.addColorStop(0.7, 'rgba(80, 0, 160, 0.5)'); horizonGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = horizonGrad; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, singularityPower * 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(mouse.x, mouse.y, singularityPower * 0.15, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill();
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleMouseDown); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[5]" />;
};

const EventHorizonUI: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        let time = 0;
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        let warpIntensity = 0;
        interface GridPoint { x: number; y: number; baseX: number; baseY: number; }
        interface Ripple { x: number; y: number; radius: number; life: number; }
        const gridPoints: GridPoint[] = [];
        const ripples: Ripple[] = [];
        const gridSpacing = 40;
        for (let x = 0; x <= canvas.width + gridSpacing; x += gridSpacing) {
            for (let y = 0; y <= canvas.height + gridSpacing; y += gridSpacing) {
                gridPoints.push({ x, y, baseX: x, baseY: y });
            }
        }
        const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; warpIntensity = Math.min(warpIntensity + 2, 100); };
        const handleMouseDown = () => { ripples.push({ x: mouse.x, y: mouse.y, radius: 10, life: 1 }); warpIntensity = 100; };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        const cols = Math.ceil(canvas.width / gridSpacing) + 1;
        const rows = Math.ceil(canvas.height / gridSpacing) + 1;
        const draw = () => {
            time += 0.01; warpIntensity *= 0.97;
            ctx.fillStyle = 'rgba(5, 5, 15, 0.15)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            gridPoints.forEach(p => {
                const dx = mouse.x - p.baseX, dy = mouse.y - p.baseY;
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
                ripples.forEach(r => {
                    const rdx = p.x - r.x, rdy = p.y - r.y;
                    const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
                    if (Math.abs(rdist - r.radius) < 30) {
                        const rippleEffect = Math.sin((rdist - r.radius) * 0.2) * 10 * r.life;
                        p.x += (rdx / rdist) * rippleEffect;
                        p.y += (rdy / rdist) * rippleEffect;
                    }
                });
            });
            ctx.strokeStyle = `hsla(220, 80%, 50%, ${0.2 + warpIntensity * 0.003})`; ctx.lineWidth = 1;
            for (let row = 0; row < rows; row++) {
                ctx.beginPath();
                for (let col = 0; col < cols; col++) {
                    const idx = col * rows + row;
                    const p = gridPoints[idx];
                    if (p) { if (col === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
                }
                ctx.stroke();
            }
            for (let col = 0; col < cols; col++) {
                ctx.beginPath();
                for (let row = 0; row < rows; row++) {
                    const idx = col * rows + row;
                    const p = gridPoints[idx];
                    if (p) { if (row === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
                }
                ctx.stroke();
            }
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(260, 100%, 70%, ${r.life * 0.5})`; ctx.lineWidth = 3 * r.life;
                ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(150, 100, 255, 0.5)'; ctx.stroke();
                r.radius += 8; r.life -= 0.015;
                if (r.life <= 0) ripples.splice(i, 1);
            }
            ctx.shadowBlur = 0;
            const centerGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100);
            centerGrad.addColorStop(0, `hsla(260, 100%, 70%, ${0.3 + warpIntensity * 0.005})`);
            centerGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = centerGrad; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2); ctx.fill();
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleMouseDown); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[3]" />;
};

const QuantumAfterimage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        let time = 0;
        const mouseHistory: {x: number, y: number, time: number}[] = [];
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        interface QuantumParticle { x: number; y: number; targetX: number; targetY: number; size: number; hue: number; phase: number; }
        interface Superposition { x: number; y: number; copies: {dx: number, dy: number, alpha: number}[]; life: number; }
        const particles: QuantumParticle[] = [];
        const superpositions: Superposition[] = [];
        for (let i = 0; i < 50; i++) {
            particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, targetX: Math.random() * canvas.width, targetY: Math.random() * canvas.height, size: 2 + Math.random() * 4, hue: 180 + Math.random() * 60, phase: Math.random() * Math.PI * 2 });
        }
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX; mouse.y = e.clientY;
            mouseHistory.push({ x: e.clientX, y: e.clientY, time: Date.now() });
            while (mouseHistory.length > 30) mouseHistory.shift();
        };
        const handleMouseDown = () => {
            superpositions.push({ x: mouse.x, y: mouse.y, copies: Array.from({length: 5}, (_, i) => ({ dx: (Math.random() - 0.5) * 100, dy: (Math.random() - 0.5) * 100, alpha: 0.8 - i * 0.15 })), life: 1 });
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        const draw = () => {
            time += 0.01;
            ctx.fillStyle = 'rgba(5, 10, 20, 0.08)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (mouseHistory.length > 2) {
                const now = Date.now();
                for (let i = 1; i < mouseHistory.length; i++) {
                    const p1 = mouseHistory[i - 1], p2 = mouseHistory[i];
                    const age = (now - p2.time) / 500;
                    if (age < 1) {
                        const alpha = (1 - age) * 0.6;
                        const hue = (180 + (1 - age) * 40) % 360;
                        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
                        ctx.lineWidth = 3 * (1 - age); ctx.shadowBlur = 15; ctx.shadowColor = `hsl(${hue}, 100%, 50%)`; ctx.stroke();
                        for (let c = 0; c < 3; c++) {
                            const offset = (c + 1) * 8 * age;
                            ctx.beginPath();
                            ctx.moveTo(p1.x + (Math.random() - 0.5) * offset, p1.y + (Math.random() - 0.5) * offset);
                            ctx.lineTo(p2.x + (Math.random() - 0.5) * offset, p2.y + (Math.random() - 0.5) * offset);
                            ctx.strokeStyle = `hsla(${hue + 20 * c}, 60%, 50%, ${alpha * 0.3})`; ctx.lineWidth = 1; ctx.stroke();
                        }
                    }
                }
                ctx.shadowBlur = 0;
            }
            particles.forEach(p => {
                const dx = p.targetX - p.x, dy = p.targetY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 5 || Math.random() < 0.02) {
                    p.targetX = mouse.x + (Math.random() - 0.5) * 300;
                    p.targetY = mouse.y + (Math.random() - 0.5) * 300;
                }
                p.phase += 0.1;
                const wave = Math.sin(p.phase) * 3;
                p.x += dx * 0.02 + wave * (dy / (dist || 1)) * 0.1;
                p.y += dy * 0.02 - wave * (dx / (dist || 1)) * 0.1;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.8)`; ctx.shadowBlur = 10; ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`; ctx.fill();
                ctx.shadowBlur = 0;
            });
            for (let i = superpositions.length - 1; i >= 0; i--) {
                const s = superpositions[i];
                s.copies.forEach(c => {
                    ctx.beginPath(); ctx.arc(s.x + c.dx * (1 - s.life), s.y + c.dy * (1 - s.life), 8 * s.life, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(200, 80%, 60%, ${c.alpha * s.life})`; ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(100, 200, 255, 0.5)'; ctx.fill();
                });
                s.life -= 0.02;
                if (s.life <= 0) superpositions.splice(i, 1);
            }
            ctx.shadowBlur = 0;
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(anim); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleMouseDown); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[5]" />;
};

// Shop Constants
const PREVIEW_COST = 5;
const SHOP_CATEGORIES = { all: { label: 'Alles', icon: '🏪' }, avatar: { label: 'Avatare', icon: '👤' }, effect: { label: 'Effekte', icon: '✨' }, calculator: { label: 'Skins', icon: '🧮' }, voucher: { label: 'Gutscheine', icon: '🎁' }, prize: { label: 'Preise', icon: '🏆' } } as const;
const RARITY_CONFIG = { common: { label: 'Common', color: 'slate' }, rare: { label: 'Rare', color: 'blue' }, epic: { label: 'Epic', color: 'purple' }, legendary: { label: 'Legendary', color: 'amber' } } as const;

// --- Shop View Component ---
const ShopView: React.FC<{ user: User; onBuy: (item: ShopItem) => void; onPreview: (item: ShopItem, cost: number) => void; previewEffect: string | null; isDarkMode: boolean }> = ({ user, onBuy, onPreview, previewEffect, isDarkMode }) => {
  const [filter, setFilter] = useState<keyof typeof SHOP_CATEGORIES>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rarity'>('default');

  const filteredItems = useMemo(() => {
    let items = SHOP_ITEMS.filter(i => filter === 'all' || i.type === filter);
    if (rarityFilter !== 'all') items = items.filter(i => i.rarity === rarityFilter);
    switch (sortBy) {
      case 'price-asc': return [...items].sort((a, b) => a.cost - b.cost);
      case 'price-desc': return [...items].sort((a, b) => b.cost - a.cost);
      case 'rarity': const order = { common: 0, rare: 1, epic: 2, legendary: 3 }; return [...items].sort((a, b) => (order[b.rarity as keyof typeof order] || 0) - (order[a.rarity as keyof typeof order] || 0));
      default: return items;
    }
  }, [filter, rarityFilter, sortBy]);

  const groupedByRarity = useMemo(() => {
    if (filter !== 'effect') return null;
    const groups: Record<string, typeof SHOP_ITEMS> = { legendary: [], epic: [], rare: [], common: [] };
    filteredItems.forEach(item => { if (item.rarity && groups[item.rarity]) groups[item.rarity].push(item); });
    return groups;
  }, [filter, filteredItems]);

  const renderItem = (item: ShopItem) => {
    const owned = user.unlockedItems.includes(item.id) && item.type !== 'feature' && item.type !== 'voucher';
    const canAfford = user.coins >= item.cost;
    const isPreviewActive = previewEffect === item.value;
    const canAffordPreview = user.coins >= PREVIEW_COST;
    const rarityConfig = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common;

    return (
      <GlassCard key={item.id} className={`!p-4 flex flex-col items-center text-center gap-3 relative overflow-hidden transition-all duration-300 ${owned ? 'opacity-50 grayscale' : ''} ${isPreviewActive ? 'ring-2 ring-indigo-500 ring-offset-2' : ''} ${isDarkMode ? '' : item.rarity === 'legendary' ? 'bg-gradient-to-br from-amber-50 to-orange-50' : item.rarity === 'epic' ? 'bg-purple-50' : item.rarity === 'rare' ? 'bg-blue-50' : 'bg-slate-50'}`}>
        <div className={`absolute top-0 left-0 right-0 h-1 ${item.rarity === 'legendary' ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 animate-pulse' : item.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : item.rarity === 'rare' ? 'bg-blue-500' : 'bg-slate-300'}`} />
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${item.rarity === 'legendary' ? 'bg-amber-100 text-amber-700 border border-amber-300' : item.rarity === 'epic' ? 'bg-purple-100 text-purple-700 border border-purple-300' : item.rarity === 'rare' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{rarityConfig.label}</div>
        <div className={`text-4xl drop-shadow-md transition-all duration-300 mt-2 ${isPreviewActive ? 'scale-125 animate-pulse' : 'hover:scale-110'} ${item.rarity === 'legendary' ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}`}>{item.icon || item.value}</div>
        <div className="flex-1"><h4 className={`font-bold text-sm leading-tight mb-1 ${item.rarity === 'legendary' ? 'text-amber-600' : ''}`}>{item.name}</h4><p className={`text-[10px] font-medium h-8 overflow-hidden leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</p></div>
        <div className="mt-auto w-full flex flex-col gap-2">
          <div className={`font-black text-sm ${item.rarity === 'legendary' ? 'text-amber-500' : 'text-amber-600'}`}>{item.cost === 0 ? <span className="text-emerald-500">✓ FREE</span> : <span className="flex items-center justify-center gap-1">{item.cost.toLocaleString()} <span className="text-base">🪙</span></span>}</div>
          {item.type === 'effect' && !owned && <Button size="sm" variant={isPreviewActive ? 'primary' : 'secondary'} onClick={() => onPreview(item, isPreviewActive ? 0 : PREVIEW_COST)} disabled={!isPreviewActive && !canAffordPreview} className={`w-full text-[10px] ${isPreviewActive ? 'animate-pulse' : ''}`}>{isPreviewActive ? <span>▶ Live Vorschau</span> : <span className="flex items-center justify-center gap-1">👁 Vorschau <span className="text-amber-500">{PREVIEW_COST}🪙</span></span>}</Button>}
          <Button size="sm" variant={owned ? 'secondary' : canAfford ? 'primary' : 'secondary'} disabled={owned || !canAfford} onClick={() => onBuy(item)} className={`w-full ${item.rarity === 'legendary' && !owned && canAfford ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : ''}`}>{owned ? '✓ Besitz' : canAfford ? 'Kaufen' : '🔒 Nicht genug'}</Button>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="space-y-6">
      {previewEffect && (
        <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-between ${isDarkMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-indigo-50 border-indigo-300'}`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-bounce">👁</div>
            <div><div className={`font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Vorschau aktiv</div><div className={`text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>Effekt wird angezeigt solange du im Shop bist</div></div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => onPreview({ value: previewEffect } as ShopItem, 0)}>Vorschau beenden</Button>
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.entries(SHOP_CATEGORIES) as [keyof typeof SHOP_CATEGORIES, typeof SHOP_CATEGORIES[keyof typeof SHOP_CATEGORIES]][]).map(([key, cat]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${filter === key ? (isDarkMode ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-900 text-white shadow-lg scale-105') : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200')}`}><span>{cat.icon}</span><span>{cat.label}</span></button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {(['all', 'legendary', 'epic', 'rare', 'common'] as const).map(r => (
            <button key={r} onClick={() => setRarityFilter(r)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${rarityFilter === r ? (r === 'legendary' ? 'bg-amber-500 text-white' : r === 'epic' ? 'bg-purple-500 text-white' : r === 'rare' ? 'bg-blue-500 text-white' : r === 'common' ? 'bg-slate-500 text-white' : 'bg-slate-800 text-white') : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}`}>{r === 'all' ? 'Alle' : RARITY_CONFIG[r]?.label || r}</button>
          ))}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-600 border border-slate-200'}`}>
          <option value="default">Standard</option><option value="price-asc">Preis ↑</option><option value="price-desc">Preis ↓</option><option value="rarity">Seltenheit</option>
        </select>
        <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{filteredItems.length} Items</div>
      </div>
      {filter === 'effect' && groupedByRarity && sortBy === 'default' ? (
        <div className="space-y-8">
          {(['legendary', 'epic', 'rare', 'common'] as const).map(rarity => {
            const items = groupedByRarity[rarity];
            if (!items || items.length === 0) return null;
            return (
              <div key={rarity}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-0.5 flex-1 ${rarity === 'legendary' ? 'bg-gradient-to-r from-transparent via-amber-400 to-transparent' : rarity === 'epic' ? 'bg-gradient-to-r from-transparent via-purple-400 to-transparent' : rarity === 'rare' ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-300 to-transparent'}`} />
                  <h3 className={`font-black uppercase tracking-widest text-sm flex items-center gap-2 ${rarity === 'legendary' ? 'text-amber-500' : rarity === 'epic' ? 'text-purple-500' : rarity === 'rare' ? 'text-blue-500' : 'text-slate-400'}`}>{rarity === 'legendary' && '👑'}{rarity === 'epic' && '💎'}{rarity === 'rare' && '⭐'}{RARITY_CONFIG[rarity].label}<span className="text-xs font-normal opacity-60">({items.length})</span></h3>
                  <div className={`h-0.5 flex-1 ${rarity === 'legendary' ? 'bg-gradient-to-r from-amber-400 via-transparent to-transparent' : rarity === 'epic' ? 'bg-gradient-to-r from-purple-400 via-transparent to-transparent' : rarity === 'rare' ? 'bg-gradient-to-r from-blue-400 via-transparent to-transparent' : 'bg-gradient-to-r from-slate-300 via-transparent to-transparent'}`} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{items.map(renderItem)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{filteredItems.map(renderItem)}</div>
      )}
      {filteredItems.length === 0 && <div className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}><div className="text-4xl mb-4">🔍</div><p className="font-bold">Keine Items gefunden</p><p className="text-sm">Versuche andere Filter</p></div>}
    </div>
  );
};

// --- Game Logic Components ---

const ShapeBandit: React.FC<{ task: Task; onComplete: (success: boolean) => void; onBonus: (coins: number) => void }> = ({ task, onComplete, onBonus }) => {
    const { symbols } = task.interactiveData;
    const [spinning, setSpinning] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [phase, setPhase] = useState<'idle' | 'spinning' | 'check'>('idle');
    const [selected, setSelected] = useState<string[]>([]);
    const [jackpot, setJackpot] = useState(false);

    const spin = () => {
        setSpinning(true); setPhase('spinning'); setJackpot(false); setSelected([]);
        setTimeout(() => {
            const r1 = symbols[Math.floor(Math.random() * symbols.length)];
            const r2 = symbols[Math.floor(Math.random() * symbols.length)];
            const r3 = symbols[Math.floor(Math.random() * symbols.length)];
            setResults([r1, r2, r3]); setSpinning(false); setPhase('check');
            if (r1.id === r2.id && r2.id === r3.id) { setJackpot(true); onBonus(15); }
        }, 1500);
    };

    const toggleSelection = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const verify = () => {
        const targetIds = Array.from(new Set(results.map(r => r.id)));
        const correct = targetIds.every(id => selected.includes(id)) && selected.length === targetIds.length;
        if (correct) onComplete(true);
        else { alert("Nicht ganz! Schau dir die Formen nochmal genau an."); setSelected([]); }
    };

    return (
        <div className="bg-amber-900 text-amber-50 p-6 sm:p-8 rounded-[3rem] border-8 border-amber-600 shadow-2xl flex flex-col h-full overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-4 bg-amber-500 opacity-20 animate-pulse" />
            <SectionHeading className="text-amber-400 text-center mb-6 !text-3xl italic tracking-tighter uppercase">SHAPE BANDIT 🎰</SectionHeading>

            <div className="grid grid-cols-3 gap-4 mb-8 h-40">
                {[0, 1, 2].map(i => (
                    <div key={i} className="bg-black/40 rounded-3xl border-4 border-amber-700 flex items-center justify-center relative overflow-hidden">
                        {spinning ? <div className="text-4xl animate-bounce">🎰</div> : results[i] && (
                            <svg viewBox="0 0 200 200" className="w-full h-full p-4 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                                <path d={results[i].path} fill="none" stroke="#fbbf24" strokeWidth="8" className="animate-in zoom-in duration-300" />
                            </svg>
                        )}
                    </div>
                ))}
            </div>

            {jackpot && <div className="text-center font-black text-amber-400 animate-bounce mb-4 text-sm uppercase">✨ JACKPOT! +15 COINS ✨</div>}

            <div className="flex-1 flex flex-col items-center">
                {phase === 'idle' && <Button onClick={spin} size="lg" className="bg-amber-500 hover:bg-amber-400 border-amber-700 w-full !py-6 text-xl">HEBEL ZIEHEN 🕹️</Button>}
                {phase === 'spinning' && <div className="text-lg font-black animate-pulse text-amber-400 uppercase tracking-widest py-4">Drehe Walzen...</div>}
                {phase === 'check' && (
                    <div className="w-full space-y-4 animate-in slide-in-from-bottom duration-500">
                        <p className="text-center font-bold text-[10px] uppercase tracking-widest text-amber-200">Welche Formen waren zu sehen?</p>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                            {symbols.map((s:any) => (
                                <button key={s.id} onClick={() => toggleSelection(s.id)} className={`p-2 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${selected.includes(s.id) ? 'bg-amber-400 text-amber-950 border-amber-200' : 'bg-black/20 border-amber-900 text-amber-600'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <Button onClick={verify} className="w-full bg-emerald-600 border-emerald-800 shadow-xl">Korrekt! 🎯</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const BottleToss: React.FC<{ task: Task; onComplete: (success: boolean) => void }> = ({ task, onComplete }) => {
    const [phase, setPhase] = useState<'aim' | 'toss' | 'impact'>('aim');
    const [targetAngle, setTargetAngle] = useState(Math.floor(Math.random() * 60) + 30);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const toss = () => {
        setPhase('toss');
        setTimeout(() => setPhase('impact'), 1000);
    };

    const checkAngle = () => {
        if (parseInt(userInput) === targetAngle) {
            setFeedback('correct');
            setTimeout(() => onComplete(true), 1500);
        } else {
            setFeedback('wrong');
            setTimeout(() => { setFeedback(null); setUserInput(''); setPhase('aim'); setTargetAngle(Math.floor(Math.random() * 60) + 30); }, 1500);
        }
    };

    return (
        <div className="bg-slate-800 text-white p-6 sm:p-8 rounded-[3rem] border-8 border-slate-700 shadow-2xl flex flex-col h-full overflow-hidden relative">
            <h3 className="text-xl font-black text-sky-400 uppercase tracking-widest mb-2 italic">BOTTLE TOSS 🧴</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-8 tracking-widest">Triff den Eimer oder miss den Abprallwinkel!</p>

            <div className="flex-1 bg-slate-900 rounded-[2rem] border-4 border-slate-700 relative overflow-hidden mb-6">
                <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-500" />
                <div className="absolute bottom-4 right-10 text-4xl">🗑️</div>

                {phase === 'aim' && <div className="absolute bottom-4 left-10 text-4xl animate-bounce">🧴</div>}
                {phase === 'toss' && <div className="absolute bottom-4 left-10 text-4xl animate-[ping_1s_ease-in-out_infinite]">🧴</div>}

                {phase === 'impact' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
                        <div className="text-center animate-in zoom-in duration-300">
                             <div className="relative w-40 h-40 mx-auto mb-4">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    <line x1="0" y1="100" x2="100" y2="100" stroke="white" strokeWidth="2" />
                                    <line x1="0" y1="100" x2={100 * Math.cos((targetAngle * Math.PI) / 180)} y2={100 - 100 * Math.sin((targetAngle * Math.PI) / 180)} stroke="#38bdf8" strokeWidth="4" />
                                    <path d={`M 20,100 A 20,20 0 0,0 ${20 * Math.cos((targetAngle * Math.PI) / 180)},${100 - 20 * Math.sin((targetAngle * Math.PI) / 180)}`} fill="none" stroke="#fbbf24" strokeWidth="2" />
                                </svg>
                             </div>
                             <p className="font-black text-sm uppercase text-sky-400 mb-4">Aufprallwinkel α?</p>
                             <input value={userInput} onChange={e => setUserInput(e.target.value)} type="number" placeholder="Grad..." className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-600 text-center font-black text-2xl outline-none focus:border-sky-500" />
                             <Button onClick={checkAngle} className="w-full mt-4 bg-sky-600 border-sky-800">Kalibrieren</Button>
                        </div>
                    </div>
                )}
                {feedback === 'correct' && <div className="absolute inset-0 bg-emerald-500/90 flex items-center justify-center font-black text-3xl animate-in fade-in">VOLLTREFFER! 🎯</div>}
                {feedback === 'wrong' && <div className="absolute inset-0 bg-rose-500/90 flex items-center justify-center font-black text-3xl animate-in fade-in">DANEBEN! ⚠️</div>}
            </div>
            {phase === 'aim' && <Button onClick={toss} className="w-full !py-6 bg-sky-600 border-sky-800 text-lg">WURF STARTEN 🚀</Button>}
        </div>
    );
};

// --- Auth System ---

const AuthScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const user = await AuthService.login(name);
    onLogin(user);
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl w-full max-w-md text-center border-4 border-slate-100">
        <h1 className="text-4xl font-black italic uppercase mb-2 text-indigo-600 tracking-tighter">MathMaster</h1>
        <p className="text-slate-400 mb-8 font-bold uppercase text-[10px] tracking-widest">Level Up Your Geometry</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dein Name..." className="w-full p-5 bg-slate-100 rounded-2xl mb-4 font-black text-center outline-none focus:ring-4 focus:ring-indigo-200 transition-all" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
        <Button onClick={handleLogin} isLoading={loading} className="w-full !py-5">Start Quest 🚀</Button>
      </div>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'learn' | 'community' | 'shop'>('learn');
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [currentQuest, setCurrentQuest] = useState<{unit: LearningUnit, type: 'pre' | 'standard' | 'bounty'} | null>(null);
  const [isQuestActive, setIsQuestActive] = useState(false);
  const [isCoinPulsing, setIsCoinPulsing] = useState(false);
  const [isFlyingCoinActive, setIsFlyingCoinActive] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString(); setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const tasksForCurrentQuest = useMemo(() => {
    if (!currentQuest) return []; return TaskFactory.getTasksForUnit(currentQuest.unit.id, currentQuest.type);
  }, [currentQuest]);

  if (!user) return <AuthScreen onLogin={setUser} />;

  const activeEffect = (name: string) => user?.activeEffects.includes(name) || previewEffect === name;
  const isDarkMode = activeEffect('dark');
  const triggerCoinAnimation = () => { setIsFlyingCoinActive(true); setTimeout(() => { setIsCoinPulsing(true); setTimeout(() => setIsCoinPulsing(false), 500); }, 900); };

  const handleQuestComplete = async (isPerfectRun: boolean) => {
    if (!currentQuest) return; let u = user;
    if (isPerfectRun) {
        if (currentQuest.type === 'standard') { const alreadyDone = user.completedUnits?.includes(currentQuest.unit.id) ?? false; u = await QuestService.completeStandardQuest(user, currentQuest.unit.id); if (!alreadyDone) { u.coins += currentQuest.unit.coinsReward; addToast(`Quest geschafft! +${currentQuest.unit.coinsReward} Coins`, 'success'); triggerCoinAnimation(); } }
        else if (currentQuest.type === 'bounty') { const mastered = (user.masteredUnits?.includes(currentQuest.unit.id) ?? false); u = await QuestService.completeBountyQuest(user, currentQuest.unit.id); if (!mastered) { u.coins += currentQuest.unit.bounty; addToast(`BOUNTY KASSIERT! +${currentQuest.unit.bounty} Coins`, 'success'); triggerCoinAnimation(); } }
        else { u = await QuestService.completePreQuest(user, currentQuest.unit.id); addToast("Training beendet!", "success"); }
    }
    setUser(u); setIsQuestActive(false); setCurrentQuest(null);
  };

  const handlePreview = async (item: ShopItem, cost: number) => {
    if (previewEffect === item.value) { setPreviewEffect(null); return; }
    if (cost > 0 && user.coins >= cost) {
      const u = {...user, coins: user.coins - cost};
      setUser(u); await DataService.updateUser(u);
      addToast(`${cost} Coins für Vorschau`, 'info');
    } else if (cost > 0) { addToast('Nicht genug Coins für Vorschau!', 'error'); return; }
    setPreviewEffect(item.value);
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <ToastContainer toasts={toasts} />
      <CoinFlightAnimation isActive={isFlyingCoinActive} onComplete={() => setIsFlyingCoinActive(false)} />
      {isCalculatorOpen && <CalculatorWidget skin={user.calculatorSkin} onClose={() => setIsCalculatorOpen(false)} />}

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
      {activeEffect('eventHorizon') && <EventHorizonUI />}
      {activeEffect('quantum') && <QuantumAfterimage />}

      {!isQuestActive && (
         <>
          <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] backdrop-blur-2xl border-2 p-2 rounded-full shadow-2xl flex items-center gap-1 ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
             {(['learn', 'community', 'shop'] as const).map(tab => (<button key={tab} onClick={() => { setActiveTab(tab); if (tab !== 'shop' && previewEffect) setPreviewEffect(null); }} className={`px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-950 text-white scale-105 shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>{tab === 'learn' ? 'Learn' : tab === 'community' ? 'Class' : 'Shop'}</button>))}
          </nav>
          <header className={`sticky top-0 z-50 backdrop-blur-xl border-b-2 px-6 py-4 flex items-center justify-between ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
             <div onClick={() => setIsInventoryOpen(true)} className="flex items-center gap-4 cursor-pointer group hover:opacity-70 transition-all">
                <div className="text-3xl bg-slate-100 rounded-full w-14 h-14 flex items-center justify-center border-4 border-white shadow-xl transition-transform group-hover:scale-110">{user.avatar}</div>
                <div><span className="font-black italic uppercase block text-xs tracking-tight">{user.username}</span><span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Lv. {Math.floor(user.xp / 100) + 1}</span></div>
            </div>
            <div className="flex gap-3 items-center">
                <button onClick={() => setIsCalculatorOpen(true)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">🧮</button>
                <div className={`px-6 py-3 bg-slate-950 text-white rounded-2xl font-black text-xs transition-all shadow-xl ${isCoinPulsing ? 'scale-110 bg-amber-500' : ''}`}>🪙 {user.coins}</div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-6 py-12 pb-36 relative z-10">
            {activeTab === 'learn' && (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">{LEARNING_UNITS.map(unit => (<GlassCard key={unit.id} onClick={() => setSelectedUnit(unit)} isInteractive={true} className={`overflow-hidden border-b-8 ${(user.masteredUnits?.includes(unit.id) ?? false) ? 'border-emerald-500 shadow-emerald-500/20' : (user.completedUnits?.includes(unit.id) ?? false) ? 'border-amber-500 shadow-amber-500/20' : `!border-b-${GROUP_THEME[unit.group].color}-500`} ${isDarkMode ? 'bg-slate-900/50' : 'bg-white shadow-xl'}`}><div className="flex justify-between items-start mb-6"><Badge color={GROUP_THEME[unit.group].color as any}>{unit.category}</Badge><DifficultyStars difficulty={unit.difficulty} /></div><CardTitle className="mb-3">{unit.title}</CardTitle><p className="text-[11px] text-slate-400 font-bold italic mb-6 leading-relaxed h-12 overflow-hidden">{unit.description}</p><div className="flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50 pt-4"><span>Reward: {unit.coinsReward}</span><span>Bounty: {unit.bounty}</span></div></GlassCard>))}</div>)}
            {activeTab === 'community' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[70vh]"><ChatView currentUser={user} /><LeaderboardView currentUser={user} onChallenge={() => {}} /></div>}
            {activeTab === 'shop' && <ShopView user={user} onBuy={async (item) => { if (user.coins >= item.cost) { const u = {...user, coins: user.coins - item.cost, unlockedItems: [...new Set([...user.unlockedItems, item.id])]}; if (item.type === 'calculator') u.calculatorSkin = item.value; setUser(u); await DataService.updateUser(u); addToast(`${item.name} gekauft!`, 'success'); } else { addToast('Nicht genug Coins!', 'error'); }}} onPreview={handlePreview} previewEffect={previewEffect} isDarkMode={isDarkMode} />}
          </main>
        </>
      )}

      {selectedUnit && <UnitView unit={selectedUnit} user={user} onClose={() => setSelectedUnit(null)} onStartQuest={(unit, type) => { setCurrentQuest({unit, type}); setIsQuestActive(true); setSelectedUnit(null); }} />}
      {isInventoryOpen && <InventoryModal user={user} onClose={() => setIsInventoryOpen(false)} onToggleEffect={async e => { const u = {...user, activeEffects: user.activeEffects.includes(e) ? user.activeEffects.filter(x => x !== e) : [...user.activeEffects, e]}; setUser(u); await DataService.updateUser(u); }} onAvatarChange={async v => { const u = {...user, avatar: v}; setUser(u); await DataService.updateUser(u); }} onSkinChange={async s => { const u = {...user, calculatorSkin: s}; setUser(u); await DataService.updateUser(u); }} />}

      {isQuestActive && currentQuest && (
          <div className="fixed inset-0 z-[120] bg-slate-50 flex flex-col">
              {currentQuest.type === 'pre' ? (
                  <div className="flex-1 flex flex-col p-4 sm:p-10 max-w-4xl mx-auto w-full">
                      <div className="flex justify-between items-center mb-8 shrink-0">
                          <Button variant="ghost" onClick={() => setIsQuestActive(false)}>✕ Beenden</Button>
                          <Badge color="amber">Training-Modus</Badge>
                      </div>
                      <div className="flex-1 min-h-0">
                          {currentQuest.unit.id === 'u1' && <ShapeBandit task={tasksForCurrentQuest[0]} onComplete={() => handleQuestComplete(true)} onBonus={async (c) => { const u = {...user, coins: user.coins + c}; setUser(u); await DataService.updateUser(u); triggerCoinAnimation(); addToast(`JACKPOT! +${c} Coins`, 'success'); }} />}
                          {currentQuest.unit.id === 'u2' && <BottleToss task={tasksForCurrentQuest[0]} onComplete={() => handleQuestComplete(true)} />}
                      </div>
                  </div>
              ) : (
                  <QuestExecutionView unit={currentQuest.unit} tasks={tasksForCurrentQuest} isBountyMode={currentQuest.type === 'bounty'} onTaskCorrect={async (t, w) => { const { updatedUser } = await QuestService.awardCoinsForQuestion(user, t.id, 10 + w); setUser(updatedUser); triggerCoinAnimation(); }} onComplete={handleQuestComplete} onCancel={() => setIsQuestActive(false)} />
              )}
          </div>
      )}
    </div>
  );
}

const UnitView: React.FC<{ unit: LearningUnit; user: User; onClose: () => void; onStartQuest: (unit: LearningUnit, type: 'pre' | 'standard' | 'bounty') => void; }> = ({ unit, user, onClose, onStartQuest }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'pre' | 'standard' | 'bounty'>('info');
    const definition = GEOMETRY_DEFINITIONS.find(d => d.id === unit.definitionId);
    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white rounded-[3rem] p-10 max-w-3xl w-full mx-auto relative shadow-2xl border-8 border-slate-50 animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">✕</button>
                <div className="flex items-center gap-3 mb-4"><Badge color={GROUP_THEME[unit.group].color as any}>{unit.category}</Badge><DifficultyStars difficulty={unit.difficulty} /></div>
                <SectionHeading className="mb-4 text-slate-950 !text-4xl uppercase">{unit.title}</SectionHeading>
                <div className="border-b border-slate-100 mb-8 flex gap-8 overflow-x-auto scrollbar-hide">
                    {(['info', 'pre', 'standard', 'bounty'] as const).map(id => (
                       <button key={id} onClick={() => setActiveTab(id)} disabled={id === 'pre'} className={`whitespace-nowrap pb-4 px-1 border-b-4 font-black text-xs uppercase tracking-widest transition-all ${id === 'pre' ? 'opacity-40 cursor-not-allowed text-slate-300' : activeTab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-600'}`}>
                          {id === 'info' ? 'Spickzettel' : id === 'pre' ? 'Training (Coming Soon)' : id === 'standard' ? 'Quest' : 'Bounty'}
                       </button>
                    ))}
                </div>
                <div className="min-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                    {activeTab === 'info' && (
                       <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
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
                    {activeTab === 'pre' && <div className="text-center py-16 space-y-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"><div className="text-7xl animate-bounce">🕹️</div><h4 className="text-2xl font-black italic text-slate-900">Training Session</h4><p className="font-bold text-slate-400 text-sm max-w-sm mx-auto uppercase tracking-tighter italic">Lerne die Mechaniken spielerisch kennen.</p><Button onClick={() => onStartQuest(unit, 'pre')} className="w-full max-w-xs mx-auto !py-5 shadow-xl">Start Training</Button></div>}
                    {activeTab === 'standard' && <div className="text-center py-16 space-y-8 bg-indigo-50/50 rounded-[3rem] border-2 border-indigo-100"><div className="text-7xl">🎯</div><h4 className="text-2xl font-black italic text-indigo-900">Quest Modus</h4><p className="font-bold text-slate-400 text-sm max-w-sm mx-auto">Standard-Fragen zum Thema. Belohnung: <span className="text-amber-500 font-black">{unit.coinsReward} Coins</span>.</p><Button onClick={() => onStartQuest(unit, 'standard')} className="w-full max-w-xs mx-auto !py-5">Quiz starten</Button></div>}
                    {activeTab === 'bounty' && <div className="text-center py-16 space-y-8 bg-slate-900 rounded-[3rem] border-4 border-amber-500/30 text-white"><div className="text-7xl">🏴‍☠️</div><h4 className="text-2xl font-black italic text-amber-400">Bounty Hunt</h4><p className="font-bold text-slate-500 text-sm max-w-sm mx-auto uppercase italic">Zeitlimit & Extra-Schwer.<br/>Extra Reward: <span className="text-amber-400 font-black">+{unit.bounty} Coins</span>!</p><Button variant="danger" onClick={() => onStartQuest(unit, 'bounty')} className="w-full max-w-xs mx-auto !py-5 shadow-2xl">Accept Bounty ⚔️</Button></div>}
                </div>
            </div>
        </ModalOverlay>
    );
};

const QuestExecutionView: React.FC<{ unit: LearningUnit; tasks: Task[]; isBountyMode: boolean; onTaskCorrect: (task: Task, wager: number) => void; onComplete: (isPerfect: boolean) => void; onCancel: () => void; }> = ({ unit, tasks, isBountyMode, onTaskCorrect, onComplete, onCancel }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [textInput, setTextInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [wager, setWager] = useState<number>(0);
    const [classification, setClassification] = useState<Record<string, string>>({});
    const [angleInput, setAngleInput] = useState('');
    const [sliderValue, setSliderValue] = useState<number>(1);
    const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isBountyMode && !feedback && tasks.length > 0) {
            const timer = setInterval(() => { setTimeLeft(prev => { if (prev <= 1) { setFeedback('wrong'); setMistakes(m => m + 1); return 0; } return prev - 1; }); }, 1000);
            return () => clearInterval(timer);
        }
    }, [isBountyMode, feedback, currentIdx, tasks.length]);

    const handleVerify = () => {
        const task = tasks[currentIdx];
        let isCorrect = false;

        if (task.type === 'dragDrop' && task.dragDropData) {
            const answerMap = JSON.parse(String(task.correctAnswer));
            const allSelected = Object.keys(answerMap).every(key => classification[key]);
            if (!allSelected) {
                return; // Require user to classify all shapes first
            }
            isCorrect = Object.keys(answerMap).every(key => classification[key] === answerMap[key]);
        } else if (task.type === 'choice' || task.type === 'wager' || task.type === 'boolean') {
            isCorrect = selectedOption === task.correctAnswer || (task.type === 'boolean' && (selectedOption === 0 && task.correctAnswer === 'wahr' || selectedOption === 1 && task.correctAnswer === 'falsch'));
        } else if (task.type === 'input' || task.type === 'shorttext') {
            const clean = (s: string) => s.replace(/\s+/g, '').toLowerCase();
            const userAns = clean(textInput);
            if (userAns === '') {
                isCorrect = false;
            } else {
                const correctAnswers = String(task.correctAnswer).split(',').map(s => clean(s.trim()));
                isCorrect = correctAnswers.some(ans => userAns.includes(ans));
            }
        } else if (task.type === 'visualChoice') {
            isCorrect = selectedOption === task.correctAnswer;
        } else if (task.type === 'angleMeasure' && task.angleData) {
            const userAngle = parseInt(angleInput) || 0;
            const correctAngle = task.angleData.correctAngle;
            isCorrect = Math.abs(userAngle - correctAngle) <= 5; // ±5° tolerance
        } else if (task.type === 'sliderTransform' && task.sliderData) {
            const correctK = task.sliderData.correctK;
            isCorrect = Math.abs(sliderValue - correctK) <= 0.1; // ±0.1 tolerance
        } else if (task.type === 'areaDecomposition' && task.decompositionData) {
            const allPartsSelected = task.decompositionData.parts?.every((part: any) => selectedParts.has(part.label)) || false;
            if (allPartsSelected) {
                const totalArea = task.decompositionData.parts?.reduce((sum: number, part: any) => sum + (part.area || 0), 0) || 0;
                const userAnswer = parseInt(textInput) || 0;
                isCorrect = Math.abs(userAnswer - totalArea) <= 1; // ±1 tolerance
            }
        }

        if (isCorrect) {
            setFeedback('correct');
            onTaskCorrect(task, task.type === 'wager' ? wager : 0);
        } else {
            setFeedback('wrong');
            setMistakes(m => m + 1);
        }
    };

    const handleNext = () => {
        if (currentIdx < tasks.length - 1) {
            setCurrentIdx(p => p + 1);
            setFeedback(null);
            setSelectedOption(null);
            setTextInput('');
            setWager(0);
            setClassification({});
            setAngleInput('');
            setSliderValue(1);
            setSelectedParts(new Set());
            setTimeLeft(60);
        } else {
            onComplete(mistakes === 0);
        }
    };

    const task = tasks[currentIdx]; if (!task) return null;

    return (
        <div className={`fixed inset-0 z-[120] flex flex-col ${isBountyMode ? 'bounty-mode' : 'bg-slate-50'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isBountyMode ? 'bounty-header' : 'bg-white'}`}>
                <Button variant="ghost" onClick={onCancel}>✕</Button>
                <div className="text-center"><span className="text-[10px] font-black uppercase opacity-40">{unit.title}</span><div className="flex gap-1 mt-1">{tasks.map((_, i) => <div key={i} className={`h-1.5 w-6 rounded-full ${i < currentIdx ? 'bg-emerald-400' : i === currentIdx ? (isBountyMode ? 'bg-amber-400' : 'bg-indigo-500') : 'bg-slate-200'}`} />)}</div></div>
                <div className="font-mono font-bold w-12 text-right">{isBountyMode ? `${timeLeft}s` : '∞'}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
                <h2 className={`text-3xl font-black italic text-center mb-10 leading-tight ${isBountyMode ? 'text-amber-100' : 'text-slate-900'}`}>{task.question}</h2>
                <div className="w-full space-y-4">
                    {(task.type === 'choice' || task.type === 'wager' || task.type === 'boolean') && (
                        <div className="grid grid-cols-1 gap-3">
                            {task.options?.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => !feedback && setSelectedOption(i)}
                                    className={`p-6 rounded-[2rem] border-2 text-left font-black transition-all ${selectedOption === i ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
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
                            {task.visualData && task.visualData.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {task.visualData.map((item: any, i: number) => (
                                        <button
                                            key={item.id || i}
                                            onClick={() => !feedback && setSelectedOption(item.id)}
                                            className={`relative p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${selectedOption === item.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                                        >
                                            <svg viewBox="0 0 200 150" className="w-24 h-24">
                                                <path d={item.path} fill="none" stroke="currentColor" strokeWidth="3" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl text-center">
                                    <p className="text-red-600 font-bold">⚠️ FEHLER: visualData fehlt oder ist leer!</p>
                                    <p className="text-xs text-red-500 mt-2">Task ID: {task.id} | Type: {task.type}</p>
                                </div>
                            )}
                        </>
                    )}
                    {task.type === 'dragDrop' && task.dragDropData && (
                        <div className="grid grid-cols-1 gap-4">
                            <p className="text-sm font-bold text-slate-600 mb-2">Ordne jede Figur der passenden Kategorie zu:</p>
                            <div className="space-y-6">
                                {task.dragDropData.shapes?.map((shape: any) => (
                                    <div key={shape.id} className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center gap-4">
                                        <svg viewBox="0 0 200 150" className="w-24 h-16 shrink-0">
                                            <path d={shape.path} fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                        <select
                                            value={classification[shape.id] || ''}
                                            onChange={(e) => setClassification({ ...classification, [shape.id]: e.target.value })}
                                            className="flex-1 p-3 rounded-xl border-2 bg-white text-sm font-black"
                                            disabled={!!feedback}
                                        >
                                            <option value="" disabled>– Kategorie wählen –</option>
                                            {task.dragDropData.categories.map((cat: any) => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {task.type === 'angleMeasure' && task.angleData && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-full max-w-xs aspect-square bg-slate-50 rounded-2xl border-4 border-slate-200 flex items-center justify-center">
                                <svg viewBox="0 0 300 300" className="w-full h-full">
                                    <path d={task.angleData.path} fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
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
                                        className={`w-full p-3 rounded-xl border-2 text-left font-bold transition-all ${selectedParts.has(part.label) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'}`}
                                    >
                                        {part.label}
                                    </button>
                                ))}
                                <div className="mt-4">
                                    <p className="text-sm font-bold text-slate-600 mb-2">Gesamtfläche:</p>
                                    <input
                                        type="number"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Fläche eingeben"
                                        disabled={!!feedback}
                                        className="w-full p-4 text-xl font-black rounded-2xl border-4 border-slate-100 focus:border-indigo-500 bg-slate-50 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {(task.type === 'input' || task.type === 'shorttext') && (
                        <div className="relative z-10">
                            <input
                                type="text"
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                disabled={!!feedback}
                                placeholder="Antwort..."
                                autoFocus
                                readOnly={!!feedback}
                                className={`w-full p-8 text-3xl font-black rounded-[2.5rem] border-4 outline-none text-center bg-white border-slate-100 focus:border-indigo-500 shadow-inner focus:ring-4 focus:ring-indigo-200 transition-all ${isBountyMode ? 'bounty-input' : ''} ${feedback ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
                                style={{ pointerEvents: feedback ? 'none' : 'auto', WebkitUserSelect: 'text', userSelect: 'text' }}
                            />
                        </div>
                    )}
                </div>
                {!feedback ? (
                    <Button
                        size="lg"
                        className="w-full mt-10 shadow-2xl"
                        onClick={handleVerify}
                        disabled={
                            ((task.type === 'choice' || task.type === 'wager' || task.type === 'boolean') && selectedOption === null) ||
                            ((task.type === 'input' || task.type === 'shorttext') && textInput === '') ||
                            (task.type === 'visualChoice' && selectedOption === null) ||
                            (task.type === 'angleMeasure' && angleInput === '') ||
                            (task.type === 'areaDecomposition' && (selectedParts.size === 0 || textInput === '')) ||
                            (task.type === 'dragDrop' && task.dragDropData && task.dragDropData.shapes && task.dragDropData.shapes.some((shape: any) => !classification[shape.id]))
                        }
                    >
                        Überprüfen 🎯
                    </Button>
                ) : (
                    <div className={`mt-10 p-10 rounded-[3rem] border-4 animate-in zoom-in-95 duration-200 w-full ${feedback === 'correct' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                        <h4 className="text-3xl font-black italic mb-4 uppercase">{feedback === 'correct' ? 'Richtig! 🎯' : 'Knapp daneben...'}</h4>
                        <p className="text-sm font-bold mb-8 opacity-70 leading-relaxed italic">{task.explanation}</p>
                        <Button variant={feedback === 'correct' ? 'success' : 'secondary'} className="w-full !py-5" onClick={handleNext}>Weiter</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const loadChat = async () => { setChat(await SocialService.getChatMessages()); };
  useEffect(() => { loadChat(); const interval = setInterval(loadChat, 5000); return () => clearInterval(interval); }, []);
  const send = async () => { if (!msg.trim()) return; await SocialService.sendMessage(currentUser, msg); setMsg(''); loadChat(); };
  return (
    <GlassCard className="h-full flex flex-col !p-0 overflow-hidden col-span-2 relative z-10">
      <div className="p-4 border-b bg-slate-50/50 backdrop-blur-md font-bold uppercase text-xs tracking-widest text-slate-500">Klassen-Chat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col-reverse">
        {[...chat].reverse().map(c => (
          <div key={c.id} className={`flex gap-3 ${c.userId === currentUser.id ? 'flex-row-reverse' : ''}`}>
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-lg shrink-0 border border-white">{c.avatar}</div>
             <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${c.userId === currentUser.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                {c.type !== 'system' && <div className={`text-[10px] font-black uppercase mb-1 opacity-50 ${c.userId === currentUser.id ? 'text-indigo-200' : 'text-slate-400'}`}>{c.username}</div>}
                {c.text}
             </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t flex gap-2"><input className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nachricht..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} /><Button size="sm" onClick={send}>→</Button></div>
    </GlassCard>
  );
};

const LeaderboardView: React.FC<{ currentUser: User; onChallenge: (u: User) => void }> = ({ currentUser, onChallenge }) => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { SocialService.getLeaderboard().then(setUsers); }, []);
  return (
    <GlassCard className="h-full flex flex-col !p-0 overflow-hidden relative z-10">
      <div className="p-4 border-b bg-slate-50/50 backdrop-blur-md font-bold uppercase text-xs tracking-widest text-slate-500">Top Schüler</div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {users.map((u, i) => (
          <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl border ${u.id === currentUser.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-400 text-amber-900' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-300 text-orange-800' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
            <div className="text-xl shrink-0">{u.avatar}</div>
            <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{u.username}</div><div className="text-[10px] text-slate-400 font-bold uppercase">{u.xp} XP</div></div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

const InventoryModal: React.FC<{ user: User; onClose: () => void; onToggleEffect: (id: string) => void; onAvatarChange: (val: string) => void; onSkinChange: (val: string) => void }> = ({ user, onClose, onToggleEffect, onAvatarChange, onSkinChange }) => {
  const ownedAvatars = SHOP_ITEMS.filter(i => i.type === 'avatar' && (i.cost === 0 || user.unlockedItems.includes(i.id)));
  const ownedEffects = SHOP_ITEMS.filter(i => i.type === 'effect' && user.unlockedItems.includes(i.id));
  const ownedSkins = SHOP_ITEMS.filter(i => i.type === 'calculator' && (i.cost === 0 || user.unlockedItems.includes(i.id)));
  return (
    <ModalOverlay onClose={onClose}>
       <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full mx-auto shadow-2xl border-8 border-slate-50">
          <div className="flex justify-between items-center mb-10"><SectionHeading className="mb-0 !text-3xl">Inventar</SectionHeading><button onClick={onClose} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black">✕</button></div>
          <div className="space-y-10">
            <section><h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Skins & Avatare</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {ownedAvatars.map(av => (<button key={av.id} onClick={() => onAvatarChange(av.value)} className={`w-16 h-16 shrink-0 rounded-[1.5rem] text-2xl flex items-center justify-center border-4 transition-all ${user.avatar === av.value ? 'bg-indigo-50 border-indigo-500 scale-110 shadow-lg' : 'bg-white border-slate-100 hover:border-indigo-100'}`}>{av.icon || av.value}</button>))}
              </div>
            </section>
            <section><h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Rechner Designs</h3>
                <div className="grid grid-cols-2 gap-4">
                  {ownedSkins.map(sk => (<button key={sk.id} onClick={() => onSkinChange(sk.value)} className={`p-5 rounded-[1.5rem] border-4 flex justify-between items-center transition-all ${user.calculatorSkin === sk.value ? 'bg-indigo-600 border-indigo-800 text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-400'}`}><span className="text-xs font-black uppercase">{sk.name}</span><span className="text-xl">{sk.icon}</span></button>))}
                </div>
            </section>
            <section><h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Aktive Auren</h3>{ownedEffects.length === 0 ? <p className="text-xs text-slate-300 italic">Noch keine Auren im Shop gekauft.</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ownedEffects.map(ef => (<button key={ef.id} onClick={() => onToggleEffect(ef.value)} className={`p-5 rounded-[1.5rem] border-4 flex justify-between items-center transition-all ${user.activeEffects.includes(ef.value) ? 'bg-emerald-50 border-emerald-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}><span className="flex items-center gap-3 text-xs font-black uppercase">{ef.icon} {ef.name}</span><span className="text-[10px] font-black">{user.activeEffects.includes(ef.value) ? 'AKTIV' : 'AUS'}</span></button>))}
                </div>)}
            </section>
          </div>
       </div>
    </ModalOverlay>
  );
};
