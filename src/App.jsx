import React, { useState } from 'react';
import Preloader from './Preloader';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showPreloader && (
          <Preloader 
            key="preloader" 
            onComplete={() => setShowPreloader(false)} 
          />
        )}
      </AnimatePresence>

      {/* The main dashboard content */}
      {!showPreloader && (
        <motion.div 
          className="dashboard-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        >
          <div className="dashboard-content">
            <h1 className="text-gradient title">Our Journey</h1>
            <p className="subtitle">Welcome to our romantic dashboard.</p>
            
            <div className="glass-panel blank-slate">
              <p>Content will appear here later.</p>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default App;
