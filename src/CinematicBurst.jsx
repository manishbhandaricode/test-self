import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './CinematicBurst.css';

const CinematicBurst = ({ color = '#ffaa00', onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate 150 high-quality explosion particles for a Japanese Chrysanthemum shell effect
    const newParticles = Array.from({ length: 150 }).map((_, i) => {
      // Create two layers: inner core and outer shell
      const isInner = i % 3 === 0;
      const angle = (Math.PI * 2 * i) / 150;
      
      // Outer shell travels further, inner core stays tighter
      const baseVelocity = isInner ? 100 : 250;
      const velocity = baseVelocity + Math.random() * 50; 
      
      return {
        id: i,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        size: isInner ? 3 : 2 + Math.random() * 3,
        delay: Math.random() * 0.05, 
        duration: isInner ? 1.5 : 2.5 + Math.random(),
        color: isInner ? '#ffffff' : color // White hot center
      };
    });
    setParticles(newParticles);

    // Clean up component after explosion finishes
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000); // Extended duration for massive fireworks
    
    return () => clearTimeout(timer);
  }, [onComplete, color]);

  return (
    <div className="burst-container">
      {/* Massive Core Flash */}
      <motion.div
        className="core-flash"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 8, 0], opacity: [1, 1, 0] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Spherical Spark Explosion */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="burst-spark"
          style={{ 
            width: p.size, 
            height: p.size, 
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}, 0 0 ${p.size * 8}px ${p.color}`
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ 
            x: p.x, 
            y: p.y + 200, // Heavy gravity pull down at the end for the "willow" effect
            opacity: [1, 1, 0], 
            scale: [1, 0.5, 0] 
          }}
          transition={{ 
            duration: p.duration, 
            ease: [0.15, 1, 0.3, 1], // Aggressive pop then slow drift
            delay: p.delay,
            times: [0, 0.8, 1] // Keeps them bright until the very end, then fade
          }}
        />
      ))}
    </div>
  );
};

export default CinematicBurst;
