import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Preloader.css';

const Preloader = ({ onComplete }) => {
  const [isExpanding, setIsExpanding] = useState(false);

  const handleClick = () => {
    if (isExpanding) return;
    setIsExpanding(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="preloader-container"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }} // Give time for the heart to expand before fading out container
      >
        <motion.div
          className="heart-wrapper"
          onClick={handleClick}
          animate={isExpanding ? "expanding" : "beating"}
          variants={{
            beating: {
              scale: [1, 1.1, 1],
              transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            },
            expanding: {
              scale: 150, // Massive scale to cover the screen
              transition: {
                duration: 1.5,
                ease: [0.64, 0, 0.78, 0] // Ease in for an accelerating explosion effect
              }
            }
          }}
          onAnimationComplete={(definition) => {
            if (definition === "expanding") {
              // Wait a tiny bit then trigger completion to fade in dashboard
              setTimeout(() => {
                if(onComplete) onComplete();
              }, 300);
            }
          }}
        >
          <div className="heart-glow"></div>
          <svg 
            className="heart-svg"
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </motion.div>

        {!isExpanding && (
          <motion.div 
            className="instruction-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            Click to enter
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;
