import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './CinematicBurst.css';

const CinematicBurst = ({ color = '#ffaa00', onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate 60 high-quality explosion particles
    const newParticles = Array.from({ length: 60 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 60; // Spread evenly in a circle
      const velocity = 150 + Math.random() * 100; // Randomize outward speed
      return {
        id: i,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 0.1, // Slight stagger for organic feel
      };
    });
    setParticles(newParticles);

    // Clean up component after explosion finishes
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="burst-container">
      {/* Intense Core Flash */}
      <motion.div
        className="core-flash"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 5, 0], opacity: [1, 1, 0] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Spherical Spark Explosion */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="burst-spark"
          style={{ 
            width: p.size, 
            height: p.size, 
            backgroundColor: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ 
            x: p.x, 
            y: p.y + 100, // +100 simulates gravity pulling them down at the end
            opacity: 0, 
            scale: 0 
          }}
          transition={{ 
            duration: 1.5 + Math.random() * 0.5, 
            ease: [0.25, 1, 0.5, 1], // Custom cinematic decelerating explosion curve
            delay: p.delay 
          }}
        />
      ))}
    </div>
  );
};

export default CinematicBurst;
