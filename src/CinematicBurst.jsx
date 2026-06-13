import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import './CinematicBurst.css';

/**
 * CinematicBurst — Japanese "Chrysanthemum" (菊) firework shell.
 * 
 * Creates a massive, multi-layered spherical explosion with:
 * - White-hot core flash
 * - Inner ring of bright white sparks
 * - Outer ring of colored sparks with gravity droop (willow effect)
 * - Glittering secondary particles that linger
 * - Randomized burst position in the upper sky
 */
const CinematicBurst = ({ color = '#ffaa00', onComplete }) => {
  // Randomize burst position in the upper portion of the sky
  const burstPosition = useMemo(() => ({
    top: 10 + Math.random() * 25, // 10%-35% from top
    left: 15 + Math.random() * 70, // 15%-85% from left
  }), []);

  // Generate particles once on mount
  const particles = useMemo(() => {
    const sparks = [];
    const totalOuter = 120;
    const totalInner = 40;
    const totalGlitter = 30;

    // Outer shell — long-reaching colored sparks
    for (let i = 0; i < totalOuter; i++) {
      const angle = (Math.PI * 2 * i) / totalOuter + (Math.random() - 0.5) * 0.1;
      const velocity = 200 + Math.random() * 120;
      sparks.push({
        id: `o-${i}`,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        gravityY: 150 + Math.random() * 80,
        size: 2 + Math.random() * 2.5,
        duration: 2.2 + Math.random() * 1.0,
        delay: Math.random() * 0.04,
        color: color,
        layer: 'outer',
      });
    }

    // Inner core — tight, white-hot sparks
    for (let i = 0; i < totalInner; i++) {
      const angle = (Math.PI * 2 * i) / totalInner + (Math.random() - 0.5) * 0.2;
      const velocity = 60 + Math.random() * 60;
      sparks.push({
        id: `i-${i}`,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        gravityY: 40 + Math.random() * 30,
        size: 2 + Math.random() * 2,
        duration: 1.0 + Math.random() * 0.5,
        delay: 0,
        color: '#ffffff',
        layer: 'inner',
      });
    }

    // Glitter — tiny sparkling dots that linger
    for (let i = 0; i < totalGlitter; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 80 + Math.random() * 150;
      sparks.push({
        id: `g-${i}`,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        gravityY: 60 + Math.random() * 40,
        size: 1 + Math.random() * 1.5,
        duration: 3.0 + Math.random() * 1.0,
        delay: 0.3 + Math.random() * 0.3,
        color: '#ffffcc',
        layer: 'glitter',
      });
    }

    return sparks;
  }, [color]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="burst-container"
      style={{ top: `${burstPosition.top}%`, left: `${burstPosition.left}%` }}
    >
      {/* Massive Core Flash — illuminates the whole sky momentarily */}
      <motion.div
        className="core-flash"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 12, 0], opacity: [1, 0.9, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Secondary ring glow */}
      <motion.div
        className="ring-glow"
        style={{ boxShadow: `0 0 80px 40px ${color}` }}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: [0, 6, 8], opacity: [0.8, 0.4, 0] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* All sparks */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`burst-spark ${p.layer}`}
          style={{ 
            width: p.size, 
            height: p.size, 
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 6}px ${p.color}40`
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ 
            x: p.x, 
            y: p.y + p.gravityY,
            opacity: [1, 1, 0.6, 0], 
            scale: [0, 1, 0.6, 0] 
          }}
          transition={{ 
            duration: p.duration, 
            ease: [0.1, 0.8, 0.3, 1],
            delay: p.delay,
            times: [0, 0.15, 0.7, 1]
          }}
        />
      ))}
    </div>
  );
};

export default CinematicBurst;
