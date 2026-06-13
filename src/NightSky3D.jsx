import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, MeshReflectorMaterial, Stars, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import GroundRocket from './GroundRocket';
import './NightSky.css'; // Keep standard CSS for the DOM elements

// The 3D Moon Component
const Moon = () => {
  const moonTexture = useTexture('/moon_texture.jpg');
  const moonRef = useRef();

  useFrame((state) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.0005; // Slow cinematic rotation
      // Float up slightly over time
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

// Photorealistic Reflective Lake
const ReflectiveLake = () => {
  return (
    <mesh position={[0, -5, -30]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <MeshReflectorMaterial
        blur={[500, 100]} // Blur ground reflections (width, heigt), 0 skips blur
        resolution={1024} // Off-buffer resolution
        mixBlur={1} // How much blur mixes with surface roughness (default = 1)
        mixStrength={40} // Strength of the reflections
        roughness={0.8}
        depthScale={1.2} // Scale the depth factor (0 = no depth, default = 0)
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#010204"
        metalness={0.9}
      />
    </mesh>
  );
};

// Cinematic 3D Firework Burst
const FireworkBurst3D = ({ position, color, onComplete }) => {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false);
      if (onComplete) onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!active) return null;

  return (
    <group position={position}>
      {/* Core Flash */}
      <mesh>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      {/* Exploding Particles */}
      <Sparkles count={100} scale={20} size={15} speed={0.4} color={color} opacity={1} />
      <pointLight intensity={5} color={color} distance={50} decay={2} />
    </group>
  );
};

// The Main Scene
const NightSky3D = ({ isActive }) => {
  const [bursts, setBursts] = useState([]);

  if (!isActive) return null;

  const handleRocketLaunch = (color) => {
    // Determine random high position for 3D explosion
    const x = (Math.random() - 0.5) * 40;
    const y = 15 + Math.random() * 10;
    const z = -20 - Math.random() * 10;
    
    const newBurst = { id: Date.now(), color, position: [x, y, z] };
    setBursts(prev => [...prev, newBurst]);
  };

  const removeBurst = (id) => {
    setBursts(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="night-sky-container">
      {/* True WebGL 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }} shadows>
        <color attach="background" args={['#010204']} />
        <ambientLight intensity={0.1} />
        
        <Suspense fallback={null}>
          <Moon />
          <ReflectiveLake />
        </Suspense>

        {/* 3D Stars background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Render 3D Fireworks */}
        {bursts.map(burst => (
          <FireworkBurst3D 
            key={burst.id} 
            position={burst.position} 
            color={burst.color} 
            onComplete={() => removeBurst(burst.id)} 
          />
        ))}
      </Canvas>

      {/* 2D DOM Overlay Elements */}
      <GroundRocket positionClass="rocket-pos-1" color="#00e5ff" onLaunch={() => handleRocketLaunch('#00e5ff')} />
      <GroundRocket positionClass="rocket-pos-2" color="#ffaa00" onLaunch={() => handleRocketLaunch('#ffaa00')} />
      <GroundRocket positionClass="rocket-pos-3" color="#ff00ff" onLaunch={() => handleRocketLaunch('#ff00ff')} />
    </div>
  );
};

export default NightSky3D;
