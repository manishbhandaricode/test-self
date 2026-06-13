import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Fireworks } from '@fireworks-js/react';
import GroundRocket from './GroundRocket';
import Scenery from './Scenery';
import CinematicBurst from './CinematicBurst';
import './NightSky.css'; 
import moonTextureImg from './assets/moon_texture.jpg';

// The 3D Moon Component — still, natural, no movement
const Moon = () => {
  const moonTexture = useTexture(moonTextureImg);
  const moonRef = useRef();

  // Very subtle rotation only — no position changes
  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group ref={moonRef} position={[0, 18, -60]}>
      {/* Moon Light Source — subtle, natural */}
      <pointLight intensity={0.8} color="#b8d4f0" distance={150} decay={1.5} />
      
      {/* Moon Sphere — smaller, more natural size */}
      <mesh>
        <sphereGeometry args={[8, 64, 64]} />
        <meshStandardMaterial 
          map={moonTexture}
          emissive={new THREE.Color('#d0e4ff')}
          emissiveIntensity={0.15}
          emissiveMap={moonTexture}
        />
      </mesh>
      
      {/* Subtle Outer Glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#d0e4ff" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

// The Main Composite Scene
const NightSky3D = ({ isActive }) => {
  const fireworksRef = useRef(null);
  const [bursts, setBursts] = useState([]);

  if (!isActive) return null;

  const handleRocketLaunch = (color) => {
    const newBurst = { id: Date.now() + Math.random(), color };
    setBursts(prev => [...prev, newBurst]);
  };

  const removeBurst = (id) => {
    setBursts(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="night-sky-container">
      {/* Layer 1: WebGL 3D Canvas — Moon & Stars only */}
      <div className="layer" style={{ zIndex: 1 }}>
        <Canvas 
          camera={{ position: [0, 2, 10], fov: 60 }}
          gl={{ alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.05} />
          <Suspense fallback={null}>
            <Moon />
          </Suspense>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
        </Canvas>
      </div>

      {/* Layer 2: Continuous Background Fireworks */}
      <div className="layer" style={{ zIndex: 2 }}>
        <Fireworks
          ref={fireworksRef}
          options={{
            rocketsPoint: { min: 30, max: 70 },
            hue: { min: 0, max: 360 },
            delay: { min: 20, max: 50 }, 
            speed: 2,
            acceleration: 1.05,
            friction: 0.95,
            gravity: 1.5,
            particles: 120,
            traceLength: 3,
            traceSpeed: 10,
            explosion: 5,
            intensity: 25,
            flickering: 50,
            lineStyle: 'round',
            lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
            brightness: { min: 50, max: 80 },
            decay: { min: 0.015, max: 0.03 },
            mouse: { click: false, move: false, max: 1 },
            boundaries: { x: 50, y: 50, width: window.innerWidth - 100, height: window.innerHeight * 0.55 }
          }}
          style={{ width: '100%', height: '100%', mixBlendMode: 'screen' }}
        />
      </div>

      {/* Layer 3: Mountains & River Scenery */}
      <div className="layer" style={{ zIndex: 3 }}>
        <Scenery />
      </div>

      {/* Layer 4: Cinematic Burst Explosions */}
      <div className="layer" style={{ zIndex: 4 }}>
        {bursts.map(burst => (
          <CinematicBurst 
            key={burst.id} 
            color={burst.color} 
            onComplete={() => removeBurst(burst.id)} 
          />
        ))}
      </div>

      {/* Layer 5: Interactive Ground Rockets */}
      <div className="layer rocket-layer" style={{ zIndex: 5 }}>
        <GroundRocket positionClass="rocket-pos-1" color="#00e5ff" onLaunch={() => handleRocketLaunch('#00e5ff')} />
        <GroundRocket positionClass="rocket-pos-2" color="#ffaa00" onLaunch={() => handleRocketLaunch('#ffaa00')} />
        <GroundRocket positionClass="rocket-pos-3" color="#ff00ff" onLaunch={() => handleRocketLaunch('#ff00ff')} />
      </div>
    </div>
  );
};

export default NightSky3D;
