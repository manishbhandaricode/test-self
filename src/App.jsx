import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AirplaneSwitch from './AirplaneSwitch';
import NightSky from './NightSky';
import Scenery from './Scenery'; 
import GroundRocket from './GroundRocket'; 
import './App.css';

function App() {
  const [stage, setStage] = useState('switch'); // 'switch', 'night'

  const handleSwitchToggle = () => {
    setStage('night');
  };

  return (
    <div className="app-container dark-mode">
      
      {/* Night Sky acts as the deep background */}
      <NightSky isActive={stage === 'night'} />
      
      {/* The centered premium switch, which hides after flipping */}
      <AnimatePresence>
        {stage === 'switch' && (
          <motion.div 
            className="switch-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <AirplaneSwitch onToggle={handleSwitchToggle} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
