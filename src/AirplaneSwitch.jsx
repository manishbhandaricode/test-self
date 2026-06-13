import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './AirplaneSwitch.css';

const AirplaneSwitch = ({ onToggle }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    if (isOn) return;
    setIsOn(true);
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
        
        {/* LED Indicator */}
        <motion.div 
          className="indicator-led"
          animate={{
            backgroundColor: isOn ? '#00ff66' : '#222',
            boxShadow: isOn ? '0 0 10px #00ff66, inset 0 1px 2px rgba(255,255,255,0.5)' : 'inset 0 2px 4px rgba(0,0,0,0.8)'
          }}
        />

        {/* The Premium Push Button */}
        <div className="button-socket">
          <motion.div 
            className="push-button"
            initial={false}
            animate={{ 
              y: isOn ? 12 : 0, // physically presses DOWN into the socket
              scale: isOn ? 0.98 : 1
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 20
            }}
          >
            <div className="button-surface"></div>
            <div className="button-base"></div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AirplaneSwitch;
