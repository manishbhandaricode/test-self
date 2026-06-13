import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './AirplaneSwitch.css';

const AirplaneSwitch = ({ onToggle }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    if (isOn) return; // Only allow turning it on
    setIsOn(true);
    // Wait for the mechanical flip animation before triggering the next stage
    setTimeout(() => {
      if (onToggle) onToggle();
    }, 500); 
  };

  return (
    <div className="switch-container" onClick={handleToggle}>
      <motion.div 
        className={`switch-plate ${isOn ? 'backlit' : ''}`}
        animate={{
          boxShadow: isOn 
            ? '0 15px 35px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -2px 5px rgba(0,0,0,0.9), 0 0 40px rgba(0, 255, 100, 0.2)' 
            : '0 15px 35px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -2px 5px rgba(0,0,0,0.9)'
        }}
      >
        <div className="screw top-left"></div>
        <div className="screw top-right"></div>
        <div className="screw bottom-left"></div>
        <div className="screw bottom-right"></div>
        
        {/* Tiny LED Indicator */}
        <motion.div 
          className="indicator-led"
          animate={{
            backgroundColor: isOn ? '#00ff66' : '#222',
            boxShadow: isOn ? '0 0 10px #00ff66, inset 0 1px 2px rgba(255,255,255,0.5)' : 'inset 0 2px 4px rgba(0,0,0,0.8)'
          }}
        />

        <div className="switch-track">
          <motion.div 
            className="switch-lever"
            initial={false}
            animate={{ 
              rotateX: isOn ? 45 : -45 // Flips up when ON, down when OFF
            }}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 25,
              mass: 0.5
            }}
          >
            <div className="lever-head"></div>
            <div className="lever-body"></div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AirplaneSwitch;
