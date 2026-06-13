import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './AirplaneSwitch.css';

/**
 * AirplaneSwitch — Premium military-grade toggle switch.
 * 
 * A realistic toggle lever that flips UP when activated.
 * Features: metallic plate, machined screws, LED indicator,
 * a physical lever that rotates on a pivot point.
 */
const AirplaneSwitch = ({ onToggle }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    if (isOn) return;
    setIsOn(true);
    setTimeout(() => {
      if (onToggle) onToggle();
    }, 600); 
  };

  return (
    <div className="switch-outer-container">
      {/* Subtle ambient label */}
      <motion.p 
        className="switch-label"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        LAUNCH SYSTEM
      </motion.p>

      <motion.div 
        className="switch-container" 
        onClick={handleToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div 
          className="switch-plate"
          animate={{
            boxShadow: isOn 
              ? '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(0, 255, 100, 0.15), inset 0 1px 1px rgba(255,255,255,0.15)' 
              : '0 20px 60px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15)'
          }}
        >
          {/* Corner Screws */}
          <div className="screw top-left"><div className="screw-slot"></div></div>
          <div className="screw top-right"><div className="screw-slot"></div></div>
          <div className="screw bottom-left"><div className="screw-slot"></div></div>
          <div className="screw bottom-right"><div className="screw-slot"></div></div>
          
          {/* LED Indicator */}
          <motion.div 
            className="indicator-led"
            animate={{
              backgroundColor: isOn ? '#00ff66' : '#1a1a1a',
              boxShadow: isOn 
                ? '0 0 8px rgba(0, 255, 100, 0.8), 0 0 20px rgba(0, 255, 100, 0.4), inset 0 1px 2px rgba(255,255,255,0.4)' 
                : 'inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.05)'
            }}
            transition={{ duration: 0.3 }}
          />

          {/* The Switch Track / Channel */}
          <div className="switch-track">
            {/* The Toggle Lever — pivots from the center base */}
            <motion.div 
              className="switch-lever"
              initial={false}
              animate={{ 
                rotateX: isOn ? -50 : 50,
              }}
              transition={{
                type: "spring",
                stiffness: 600,
                damping: 22,
                mass: 0.6,
              }}
            >
              <div className="lever-head"></div>
              <div className="lever-neck"></div>
            </motion.div>
          </div>

          {/* Status text */}
          <motion.span 
            className="status-text"
            animate={{ color: isOn ? 'rgba(0,255,100,0.5)' : 'rgba(255,255,255,0.15)' }}
          >
            {isOn ? 'ON' : 'OFF'}
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AirplaneSwitch;
