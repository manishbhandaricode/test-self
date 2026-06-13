import React, { useRef, useEffect, useMemo } from 'react';

/**
 * FireworkCanvas — Hardware-accelerated Canvas2D particle engine.
 * 
 * Replaces the laggy framer-motion DOM-based CinematicBurst with a single
 * <canvas> element that draws hundreds of particles at native 60fps using
 * requestAnimationFrame. Zero DOM overhead per particle.
 * 
 * Each burst creates a Japanese chrysanthemum shell explosion:
 * - White-hot core flash (large radial gradient, fades fast)
 * - Inner ring of bright white sparks (tight, fast)
 * - Outer ring of colored sparks with gravity droop (willow effect)
 * - Glitter layer that lingers and twinkles
 */

// Parse hex color to {r, g, b}
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 255, g: 170, b: 0 };
}

// Create a single burst's particle array
function createBurst(x, y, color) {
  const rgb = hexToRgb(color);
  const particles = [];
  const now = performance.now();

  // Outer shell — 100 colored sparks
  for (let i = 0; i < 100; i++) {
    const angle = (Math.PI * 2 * i) / 100 + (Math.random() - 0.5) * 0.15;
    const speed = 3.0 + Math.random() * 2.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.015 + Math.random() * 0.01,
      friction: 0.985,
      size: 1.5 + Math.random() * 1.5,
      life: 1.0,
      decay: 0.005 + Math.random() * 0.004,
      r: rgb.r, g: rgb.g, b: rgb.b,
      layer: 'outer',
      born: now,
    });
  }

  // Inner core — 40 white sparks
  for (let i = 0; i < 40; i++) {
    const angle = (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.3;
    const speed = 1.5 + Math.random() * 1.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.01,
      friction: 0.98,
      size: 1.5 + Math.random() * 1,
      life: 1.0,
      decay: 0.012 + Math.random() * 0.005,
      r: 255, g: 255, b: 255,
      layer: 'inner',
      born: now,
    });
  }

  // Glitter — 30 tiny lingering twinklers
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.0 + Math.random() * 2.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.008,
      friction: 0.992,
      size: 0.8 + Math.random() * 1,
      life: 1.0,
      decay: 0.003 + Math.random() * 0.002,
      r: 255, g: 255, b: 200,
      layer: 'glitter',
      born: now,
    });
  }

  return particles;
}

const FireworkCanvas = ({ bursts, onBurstComplete }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const flashesRef = useRef([]); // core flash effects

  // When new bursts arrive, spawn particles
  useEffect(() => {
    if (!bursts || bursts.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    bursts.forEach(burst => {
      // Random position in the upper sky
      const x = canvas.width * (0.15 + Math.random() * 0.7);
      const y = canvas.height * (0.08 + Math.random() * 0.30);
      
      const newParticles = createBurst(x, y, burst.color);
      particlesRef.current.push(...newParticles);

      // Add a core flash
      flashesRef.current.push({
        x, y,
        radius: 0,
        maxRadius: 60 + Math.random() * 40,
        opacity: 1.0,
        color: burst.color,
        born: performance.now(),
      });

      // Schedule cleanup
      setTimeout(() => {
        if (onBurstComplete) onBurstComplete(burst.id);
      }, 100);
    });
  }, [bursts, onBurstComplete]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Draw core flashes
      for (let i = flashesRef.current.length - 1; i >= 0; i--) {
        const f = flashesRef.current[i];
        f.radius += (f.maxRadius - f.radius) * 0.15;
        f.opacity *= 0.92;

        if (f.opacity < 0.01) {
          flashesRef.current.splice(i, 1);
          continue;
        }

        const rgb = hexToRgb(f.color);
        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${f.opacity})`);
        gradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${f.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        // Physics
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity; // Gravity pulls down
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        // Glitter twinkle
        let alpha = p.life;
        if (p.layer === 'glitter') {
          alpha *= 0.5 + 0.5 * Math.sin(performance.now() * 0.01 + i);
        }

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
        ctx.fill();

        // Glow effect for outer particles
        if (p.layer === 'outer' && p.life > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha * 0.15})`;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};

export default FireworkCanvas;
