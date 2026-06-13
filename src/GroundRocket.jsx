import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GroundRocket.css';

/* ─── small helpers ─── */
const rand = (min, max) => Math.random() * (max - min) + min;

const SMOKE_COUNT = 8;
const SPARK_COUNT = 6;

const GroundRocket = ({ onLaunch, positionClass, color = '#ff1f5a' }) => {
  const [phase, setPhase] = useState('idle'); // idle | fuse | launch | cooldown

  /* pre-compute random offsets for smoke & sparks so they don't re-roll */
  const smokeParticles = useMemo(
    () =>
      Array.from({ length: SMOKE_COUNT }, (_, i) => ({
        id: i,
        x: rand(-18, 18),
        delay: rand(0, 0.35),
        size: rand(6, 14),
        dur: rand(0.9, 1.6),
      })),
    [],
  );

  const trailSparks = useMemo(
    () =>
      Array.from({ length: SPARK_COUNT }, (_, i) => ({
        id: i,
        x: rand(-8, 8),
        delay: rand(0, 0.15),
        size: rand(2, 4),
      })),
    [],
  );

  /* ─── ignition sequence ─── */
  const handleIgnite = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('fuse');

    // Fuse burns for 1.2 s, then rocket launches
    setTimeout(() => {
      setPhase('launch');

      // 0.8 s into flight → trigger explosion callback
      setTimeout(() => {
        if (onLaunch) onLaunch();
      }, 800);

      // After flight, enter cooldown then reset
      setTimeout(() => {
        setPhase('cooldown');
        setTimeout(() => setPhase('idle'), 3000);
      }, 1200);
    }, 1200);
  }, [phase, onLaunch]);

  const isIdle = phase === 'idle';
  const isFuse = phase === 'fuse';
  const isLaunch = phase === 'launch';

  return (
    <div className={`gr-container ${positionClass}`}>
      {/* ════════════════════ MORTAR TUBE ════════════════════ */}
      <div className="gr-tube-wrapper">
        {/* Tube SVG — dark metallic cylinder */}
        <svg
          className="gr-tube-svg"
          width="34"
          height="64"
          viewBox="0 0 34 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* metallic body gradient */}
            <linearGradient id={`tube-body-${positionClass}`} x1="0" y1="0" x2="34" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="18%" stopColor="#3a3a3a" />
              <stop offset="35%" stopColor="#4d4d4d" />
              <stop offset="50%" stopColor="#555" />
              <stop offset="65%" stopColor="#4d4d4d" />
              <stop offset="82%" stopColor="#3a3a3a" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>
            {/* rim highlight */}
            <linearGradient id={`tube-rim-${positionClass}`} x1="0" y1="0" x2="34" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#555" />
              <stop offset="30%" stopColor="#888" />
              <stop offset="50%" stopColor="#aaa" />
              <stop offset="70%" stopColor="#888" />
              <stop offset="100%" stopColor="#555" />
            </linearGradient>
            {/* inner shadow */}
            <radialGradient id={`tube-inner-${positionClass}`} cx="50%" cy="0%" r="60%">
              <stop offset="0%" stopColor="#222" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
          </defs>

          {/* main cylinder body */}
          <rect x="2" y="6" width="30" height="56" rx="2" fill={`url(#tube-body-${positionClass})`} />

          {/* subtle vertical highlight streak */}
          <rect x="14" y="6" width="6" height="56" rx="1" fill="rgba(255,255,255,0.04)" />

          {/* top rim — ellipse for 3D perspective */}
          <ellipse cx="17" cy="6" rx="15" ry="4" fill={`url(#tube-rim-${positionClass})`} />

          {/* inner dark opening */}
          <ellipse cx="17" cy="6" rx="11" ry="2.8" fill={`url(#tube-inner-${positionClass})`} />

          {/* bottom base plate */}
          <rect x="0" y="58" width="34" height="6" rx="1.5" fill="#2a2a2a" />
          <rect x="0" y="58" width="34" height="1.5" rx="0.5" fill="rgba(255,255,255,0.08)" />

          {/* rivets / bolts for detail */}
          <circle cx="6" cy="52" r="1.2" fill="#333" stroke="#555" strokeWidth="0.4" />
          <circle cx="28" cy="52" r="1.2" fill="#333" stroke="#555" strokeWidth="0.4" />
          <circle cx="6" cy="16" r="1.2" fill="#333" stroke="#555" strokeWidth="0.4" />
          <circle cx="28" cy="16" r="1.2" fill="#333" stroke="#555" strokeWidth="0.4" />
        </svg>

        {/* ─── Muzzle flash on launch ─── */}
        <AnimatePresence>
          {isLaunch && (
            <motion.div
              className="gr-muzzle-flash"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [1, 0.6, 1, 0.4], scale: [1, 1.4, 0.9, 1.2] }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ background: `radial-gradient(circle, ${color}88 0%, transparent 70%)` }}
            />
          )}
        </AnimatePresence>

        {/* ─── Fuse line + spark ─── */}
        <AnimatePresence>
          {(isIdle || isFuse) && (
            <motion.svg
              className="gr-fuse-svg"
              width="40"
              height="30"
              viewBox="0 0 40 30"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* the fuse wire */}
              <path
                className={`gr-fuse-wire ${isFuse ? 'gr-fuse-burning' : ''}`}
                d="M 20 2 Q 28 8 30 16 T 26 28"
                fill="none"
                stroke="#777"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* travelling spark */}
              {isFuse && (
                <motion.circle
                  r="2.5"
                  fill="#ffc400"
                  filter="url(#sparkGlow)"
                >
                  <animateMotion
                    dur="1.2s"
                    fill="freeze"
                    path="M 20 2 Q 28 8 30 16 T 26 28"
                  />
                </motion.circle>
              )}
              <defs>
                <filter id="sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════ ROCKET PROJECTILE ════════════════════ */}
      <AnimatePresence>
        {isLaunch && (
          <motion.div
            className="gr-rocket-projectile"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -700, opacity: [1, 1, 1, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: [0.2, 0, 0.8, 1] }}
          >
            {/* bright core */}
            <div className="gr-rocket-core" style={{ background: color, boxShadow: `0 0 12px 4px ${color}aa, 0 0 30px 8px ${color}44` }} />

            {/* trailing sparks */}
            {trailSparks.map((s) => (
              <motion.div
                key={s.id}
                className="gr-trail-spark"
                style={{ width: s.size, height: s.size, left: `calc(50% + ${s.x}px)` }}
                animate={{ opacity: [0, 1, 0], y: [0, rand(10, 30)] }}
                transition={{ duration: 0.25, repeat: Infinity, delay: s.delay }}
              />
            ))}

            {/* engine flame trail */}
            <motion.div
              className="gr-trail-flame"
              animate={{ scaleY: [1, 1.6, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 0.08, repeat: Infinity }}
              style={{
                background: `linear-gradient(to bottom, #fff, ${color}, #ff6a00, transparent)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════ SMOKE PARTICLES ════════════════════ */}
      <AnimatePresence>
        {isLaunch && smokeParticles.map((p) => (
          <motion.div
            key={p.id}
            className="gr-smoke"
            style={{ width: p.size, height: p.size }}
            initial={{ opacity: 0.6, y: -10, x: p.x, scale: 0.5 }}
            animate={{ opacity: 0, y: -60 - p.size * 3, x: p.x * 2.5, scale: 2.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.dur, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* ════════════════════ IGNITE BUTTON ════════════════════ */}
      <AnimatePresence>
        {isIdle && (
          <motion.button
            className="gr-ignite-btn"
            onClick={handleIgnite}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
          >
            <span className="gr-ignite-ember" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroundRocket;
