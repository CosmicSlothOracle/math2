// Lightweight virtual pointer that normalizes mouse / pointer / touch into a single stream.
// Consumers can subscribe to receive { x, y, down } updates.
type PointerState = { x: number; y: number; down: boolean };

const listeners = new Set<(s: PointerState) => void>();
let state: PointerState = { x: 0, y: 0, down: false };
let _prevDown = false;

const notify = () => {
  const snapshot = { ...state };
  listeners.forEach(cb => {
    try { cb(snapshot); } catch (err) { /* ignore subscriber errors */ }
  });
  // Dispatch legacy mouse events so existing code listening to window mouse events works on touch too.
  try {
    if (typeof window !== 'undefined' && typeof MouseEvent !== 'undefined') {
      const mv = new MouseEvent('mousemove', { clientX: snapshot.x, clientY: snapshot.y, bubbles: true });
      window.dispatchEvent(mv);
      if (snapshot.down && !_prevDown) {
        const md = new MouseEvent('mousedown', { clientX: snapshot.x, clientY: snapshot.y, bubbles: true });
        window.dispatchEvent(md);
      } else if (!snapshot.down && _prevDown) {
        const mu = new MouseEvent('mouseup', { clientX: snapshot.x, clientY: snapshot.y, bubbles: true });
        window.dispatchEvent(mu);
      }
      _prevDown = snapshot.down;
    }
  } catch (err) { /* ignore dispatch errors */ }
};

function handleMouseMove(e: MouseEvent) {
  state.x = e.clientX;
  state.y = e.clientY;
  notify();
}
function handleMouseDown(e: MouseEvent) {
  state.x = e.clientX;
  state.y = e.clientY;
  state.down = true;
  notify();
}
function handleMouseUp(e: MouseEvent) {
  state.x = e.clientX;
  state.y = e.clientY;
  state.down = false;
  notify();
}

function handleTouch(e: TouchEvent, isDown: boolean | null = null) {
  if (!e.touches || e.touches.length === 0) {
    // On touchend there may be no touches; keep coords as-is but update down state.
    if (isDown === false) {
      state.down = false;
      notify();
    }
    return;
  }
  const t = e.touches[0];
  state.x = t.clientX;
  state.y = t.clientY;
  if (isDown !== null) state.down = isDown;
  notify();
}

// Install listeners once
if (typeof window !== 'undefined') {
  if ((window as any).PointerEvent) {
    window.addEventListener('pointermove', (e: PointerEvent) => {
      state.x = e.clientX;
      state.y = e.clientY;
      notify();
    }, { passive: true });
    window.addEventListener('pointerdown', (e: PointerEvent) => {
      state.x = e.clientX;
      state.y = e.clientY;
      state.down = true;
      notify();
      _prevDown = true;
    }, { passive: true });
    window.addEventListener('pointerup', (e: PointerEvent) => {
      state.x = e.clientX;
      state.y = e.clientY;
      state.down = false;
      notify();
      _prevDown = false;
    }, { passive: true });
  } else {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('touchmove', (e: TouchEvent) => handleTouch(e, null), { passive: true });
    window.addEventListener('touchstart', (e: TouchEvent) => handleTouch(e, true), { passive: true });
    window.addEventListener('touchend', (e: TouchEvent) => handleTouch(e, false), { passive: true });
  }
}

export function subscribeVirtualPointer(cb: (s: PointerState) => void) {
  listeners.add(cb);
  // Emit current state immediately
  try { cb({ ...state }); } catch (err) { /* ignore */ }
  return () => listeners.delete(cb);
}

export function getVirtualPointer() {
  return { ...state };
}


