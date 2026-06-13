import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fireworks } from '@fireworks-js/react';
import Scenery from './Scenery';
import GroundRocket from './GroundRocket';
import CinematicBurst from './CinematicBurst';
import './NightSky.css';

const NightSky = ({ isActive }) => {
  const fireworksRef = useRef(null);
  const [bursts, setBursts] = useState([]);

  if (!isActive) return null;

  const handleRocketLaunch = (color) => {
    // Render a massive 60fps framer-motion spherical burst
    const newBurst = { id: Date.now() + Math.random(), color };
    setBursts(prev => [...prev, newBurst]);
  };

  const removeBurst = (id) => {
    setBursts(prev => prev.filter(b => b.id !== id));
  };

  return (
    <motion.div 
      className="night-sky-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      <div className="moon-container">
        <motion.div 
          className="cinematic-moon"
          initial={{ y: 300, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 5, ease: "easeOut", delay: 0.5 }}
        >
          <div className="moon-texture"></div>
        </motion.div>
      </div>

      <motion.div
        className="fireworks-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 2.5 }}
      >
        <Fireworks
          ref={fireworksRef}
          options={{
            rocketsPoint: { min: 40, max: 60 },
            hue: { min: 200, max: 360 }, // Magical blues, purples, and pinks
            delay: { min: 15, max: 40 }, 
            speed: 2,
            acceleration: 1.05,
            friction: 0.95,
            gravity: 1.5,
            particles: 150, // Back to normal, clean background fireworks
            traceLength: 3,
            traceSpeed: 10,
            explosion: 6,
            intensity: 30, // Normal background intensity
            flickering: 60,
            lineStyle: 'round',
            lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
            brightness: { min: 50, max: 80 },
            decay: { min: 0.015, max: 0.03 },
            mouse: { click: false, move: false, max: 1 }
          }}
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
            zIndex: 1,
            mixBlendMode: 'screen'
          }}
        />
      </motion.div>

      {/* Render Cinematic Bursts */}
      {bursts.map(burst => (
        <CinematicBurst 
          key={burst.id} 
          color={burst.color} 
          onComplete={() => removeBurst(burst.id)} 
        />
      ))}

      {/* Pure SVG Animated Mountain & River Scenery */}
      <Scenery />

      {/* Interactive Ground Rockets */}
      <GroundRocket positionClass="rocket-pos-1" color="#00e5ff" onLaunch={() => handleRocketLaunch('#00e5ff')} />
      <GroundRocket positionClass="rocket-pos-2" color="#ffaa00" onLaunch={() => handleRocketLaunch('#ffaa00')} />
      <GroundRocket positionClass="rocket-pos-3" color="#ff00ff" onLaunch={() => handleRocketLaunch('#ff00ff')} />

    </motion.div>
  );
};

export default NightSky;
