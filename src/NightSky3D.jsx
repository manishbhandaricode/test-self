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

// The 3D Moon Component
const Moon = () => {
  const moonTexture = useTexture(moonTextureImg);
  const moonRef = useRef();

  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.0005; // Slow cinematic rotation
      moonRef.current.position.y = Math.min(20, moonRef.current.position.y + 0.02);
    }
  });

  return (
    <group ref={moonRef} position={[0, -10, -50]}>
      {/* Moon Light Source */}
      <pointLight intensity={1.5} color="#e6f2ff" distance={200} decay={1.5} />
      
      {/* Moon Sphere */}
      <mesh>
        <sphereGeometry args={[15, 64, 64]} />
        <meshStandardMaterial 
          map={moonTexture}
          emissive={new THREE.Color('#e6f2ff')}
          emissiveIntensity={0.2}
          emissiveMap={moonTexture}
        />
      </mesh>
      
      {/* Outer Glow */}
      <mesh scale={1.05}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#e6f2ff" transparent opacity={0.1} side={THREE.BackSide} />
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
      {/* Layer 1: True WebGL 3D Canvas (Moon and Stars) */}
      <div className="canvas-layer" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
          <color attach="background" args={['transparent']} />
          <ambientLight intensity={0.1} />
          <Suspense fallback={null}>
            <Moon />
          </Suspense>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>

      {/* Layer 2: Continuous Background Fireworks */}
      <div className="fireworks-layer" style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        <Fireworks
          ref={fireworksRef}
          options={{
            rocketsPoint: { min: 40, max: 60 },
            hue: { min: 200, max: 360 },
            delay: { min: 15, max: 40 }, 
            speed: 2,
            acceleration: 1.05,
            friction: 0.95,
            gravity: 1.5,
            particles: 150,
            traceLength: 3,
            traceSpeed: 10,
            explosion: 6,
            intensity: 30, // Continuous fire show
            flickering: 60,
            lineStyle: 'round',
            lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
            brightness: { min: 50, max: 80 },
            decay: { min: 0.015, max: 0.03 },
            mouse: { click: false, move: false, max: 1 }
          }}
          style={{ width: '100%', height: '100%', mixBlendMode: 'screen' }}
        />
      </div>

      {/* Layer 3: Pure SVG Animated Mountain & River Scenery */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
        <Scenery />
      </div>

      {/* Layer 4: Epic Japanese Cinematic Bursts */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}>
        {bursts.map(burst => (
          <CinematicBurst 
            key={burst.id} 
            color={burst.color} 
            onComplete={() => removeBurst(burst.id)} 
          />
        ))}
      </div>

      {/* Layer 5: Interactive Ground Rockets */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
        <GroundRocket positionClass="rocket-pos-1" color="#00e5ff" onLaunch={() => handleRocketLaunch('#00e5ff')} />
        <GroundRocket positionClass="rocket-pos-2" color="#ffaa00" onLaunch={() => handleRocketLaunch('#ffaa00')} />
        <GroundRocket positionClass="rocket-pos-3" color="#ff00ff" onLaunch={() => handleRocketLaunch('#ff00ff')} />
      </div>
    </div>
  );
};

export default NightSky3D;
