import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './GroundRocket.css';

const GroundRocket = ({ onLaunch, positionClass, color = '#ff1f5a' }) => {
  const [ignited, setIgnited] = useState(false);
  const [launched, setLaunched] = useState(false);

  const handleIgnite = () => {
    if (ignited || launched) return;
    setIgnited(true);
    
    // Fuse burns for 2 seconds, then launch
    setTimeout(() => {
      setLaunched(true);
      // Wait for launch animation to reach sky, then trigger explosion
      setTimeout(() => {
        if(onLaunch) onLaunch();
      }, 800); // Time it takes to fly up
    }, 2000);
  };

  return (
    <motion.div 
      className={`ground-rocket-container ${positionClass}`}
      animate={launched ? { y: -800, opacity: 0 } : { y: 0, opacity: 1 }}
      transition={launched ? { duration: 0.8, ease: "easeIn" } : {}}
    >
      {/* The Rocket Body */}
      <svg width="40" height="100" viewBox="0 0 40 100" className="rocket-svg">
        <defs>
          <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b3002d" />
            <stop offset="50%" stopColor="#ff1f5a" />
            <stop offset="100%" stopColor="#800020" />
          </linearGradient>
        </defs>
        {/* Nose Cone */}
        <path d="M20 0 L35 30 L5 30 Z" fill="#ccc" />
        {/* Body */}
        <rect x="10" y="30" width="20" height="50" fill="url(#rocketBody)" rx="2" />
        {/* Fins */}
        <path d="M10 60 L0 80 L10 80 Z" fill="#999" />
        <path d="M30 60 L40 80 L30 80 Z" fill="#999" />
        {/* Engine Nozzle */}
        <rect x="15" y="80" width="10" height="10" fill="#333" />
      </svg>

      {/* The Fuse */}
      {!launched && (
        <svg width="60" height="60" viewBox="0 0 60 60" className="fuse-svg">
          <path 
            className={`fuse-path ${ignited ? 'burning' : ''}`}
            d="M 20 90 Q 40 80 50 60 T 30 20" 
            fill="transparent" 
            stroke="#aaa" 
            strokeWidth="2" 
          />
          {ignited && (
            <motion.circle 
              r="3" 
              fill="#ffaa00"
              filter="drop-shadow(0 0 5px #ff5500)"
              animate={{ opacity: [1, 0.5, 1], scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.1 }}
            >
              <animateMotion 
                dur="2s" 
                fill="freeze" 
                path="M 20 90 Q 40 80 50 60 T 30 20" 
              />
            </motion.circle>
          )}
        </svg>
      )}

      {/* Launch Engine Fire */}
      {launched && (
        <motion.div 
          className="rocket-fire"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 0.1 }}
        />
      )}

      {/* Ignite Button */}
      {!ignited && (
        <button className="ignite-button" onClick={handleIgnite}>
          IGNITE
        </button>
      )}
    </motion.div>
  );
};

export default GroundRocket;
