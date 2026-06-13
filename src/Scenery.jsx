import React from 'react';
import { motion } from 'framer-motion';
import './Scenery.css';

const Scenery = () => {
  return (
    <motion.div 
      className="scenery-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, delay: 1 }}
    >
      {/* SVG Mountains Layer */}
      <div className="mountains">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="mountain-layer back-mountain">
          <path fill="#080b15" d="M0,224L60,197.3C120,171,240,117,360,112C480,107,600,149,720,160C840,171,960,149,1080,138.7C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="mountain-layer mid-mountain">
          <path fill="#05080e" d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,160C672,139,768,117,864,122.7C960,128,1056,160,1152,176C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="mountain-layer front-mountain">
          <path fill="#020407" d="M0,192L80,202.7C160,213,320,235,480,213.3C640,192,800,128,960,117.3C1120,107,1280,149,1360,170.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>

      {/* The Pure SVG Flowing River */}
      <div className="river-container">
        <svg width="100%" height="100%" className="river-svg">
          <defs>
            <linearGradient id="moonlight-reflection" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(180, 220, 255, 0.4)" />
              <stop offset="40%" stopColor="rgba(100, 180, 255, 0.15)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </linearGradient>

            {/* SVG Displacement Map for flowing water effect */}
            <filter id="water-ripple" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.05" numOctaves="3" result="noise" seed="1">
                <animate attributeName="baseFrequency" values="0.015 0.05; 0.01 0.04; 0.015 0.05" dur="10s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* Dark Base River */}
          <rect width="100%" height="100%" fill="#010204" />
          
          {/* Flowing Ripples reflecting moonlight */}
          <rect width="100%" height="100%" fill="url(#moonlight-reflection)" filter="url(#water-ripple)" />
        </svg>
      </div>

    </motion.div>
  );
};

export default Scenery;
