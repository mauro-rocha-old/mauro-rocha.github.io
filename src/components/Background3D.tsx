import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Icosahedron, Box, Octahedron, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

type PointerRef = React.MutableRefObject<{ x: number; y: number }>;

// Fix for missing JSX.IntrinsicElements
// Augmenting both global JSX and React.JSX to ensure compatibility across different React/TS configurations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      meshStandardMaterial: any;
      color: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      meshStandardMaterial: any;
      color: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}

const ParticleField = () => {
  const ref = useRef<THREE.Points>(null);
  
  const count = 1200;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 30;
      const x = (Math.random() - 0.5) * r * 2;
      const y = (Math.random() - 0.5) * r * 2;
      const z = (Math.random() - 0.5) * r * 2;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
      ref.current.rotation.x -= delta * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#3b82f6"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const CyberCore = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      // Constant organic pulses
      coreRef.current.rotation.z = t * 0.2;
    }
    if (shellRef.current) {
      // Tech shell rotation
      shellRef.current.rotation.y = t * 0.3;
      shellRef.current.rotation.x = t * 0.1;
    }
  });

  return (
    <group>
        {/* Inner Liquid Core */}
        <Float speed={4} rotationIntensity={0.5} floatIntensity={1}>
            <Icosahedron args={[1, 4]} ref={coreRef} scale={1.8}>
                <MeshDistortMaterial
                    color="#2563eb" 
                    attach="material"
                    distort={0.6}
                    speed={4}
                    roughness={0.2}
                    metalness={0.8}
                    emissive="#1d4ed8" 
                    emissiveIntensity={0.8}
                />
            </Icosahedron>
        </Float>
        
        {/* Outer Tech Wireframe Shell */}
        <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
            <Icosahedron args={[1.2, 1]} ref={shellRef} scale={2.5}>
                <meshStandardMaterial 
                    color="#60a5fa" 
                    wireframe 
                    transparent 
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </Icosahedron>
        </Float>
    </group>
  );
};

const InteractiveCore = ({ pointerRef }: { pointerRef: PointerRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      // Global mouse position normalized from -1 to 1.
      const x = pointerRef.current.x;
      const y = pointerRef.current.y;
      
      // --- ROTATION INTERACTION ---
      // Rotate the entire group to face/follow the mouse
      const targetRotX = -y * 0.8; // Tilt up/down (inverted y for natural feel)
      const targetRotY = x * 0.8;  // Turn left/right
      
      // Smooth interpolation for rotation
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.08;
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.08;

      // --- POSITION INTERACTION ---
      // Move slightly towards the mouse (magnetic effect)
      // Base X is 3. We want it to move closer when mouse is on the right (x > 0)
      const targetPosX = 3 + (x * 0.5); 
      const targetPosY = y * 0.5;

      // Smooth interpolation for position
      groupRef.current.position.x += (targetPosX - groupRef.current.position.x) * 0.08;
      groupRef.current.position.y += (targetPosY - groupRef.current.position.y) * 0.08;
      
      // --- SCALE ON HOVER (Proximity) ---
      // Check if mouse is near the object (right side of screen)
      const isNear = x > 0;
      const targetScale = isNear ? 1.1 : 1.0;
      
      // Apply scale to group
      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.05);
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  return (
    <group ref={groupRef} position={[3, 0, 0]}>
       <CyberCore />
    </group>
  )
}

const TechDebris = ({ pointerRef }: { pointerRef: PointerRef }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    // Generate random tech bits floating around
    const bits = useMemo(() => {
        return new Array(15).fill(0).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 6
            ] as [number, number, number],
            scale: Math.random() * 0.4 + 0.1,
            type: Math.random() > 0.6 ? 'box' : 'oct',
            speed: Math.random() * 0.5 + 0.2
        }))
    }, []);

    useFrame((_, delta) => {
        if(groupRef.current) {
            groupRef.current.rotation.y += delta * 0.05;
            
            // Subtle mouse influence on debris too
            groupRef.current.rotation.x = pointerRef.current.y * 0.1;
            groupRef.current.rotation.z = pointerRef.current.x * 0.1;
        }
    })

    return (
        <group ref={groupRef}>
            {bits.map((bit, i) => (
                <Float key={i} speed={bit.speed * 2} rotationIntensity={2} floatIntensity={2} position={bit.position}>
                    {bit.type === 'box' ? (
                        <Box args={[1,1,1]} scale={bit.scale}>
                            <meshStandardMaterial color="#93c5fd" wireframe transparent opacity={0.4} />
                        </Box>
                    ) : (
                        <Octahedron args={[1]} scale={bit.scale}>
                             <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.3} />
                        </Octahedron>
                    )}
                </Float>
            ))}
        </group>
    )
}

const Rig = ({ pointerRef }: { pointerRef: PointerRef }) => {
    useFrame((state) => {
        // Reduced camera movement intensity to let the object interaction take focus
        const x = pointerRef.current.x * 0.1;
        const y = pointerRef.current.y * 0.1;
        state.camera.position.x += (x - state.camera.position.x) * 0.05;
        state.camera.position.y += (y - state.camera.position.y) * 0.05;
        state.camera.lookAt(0, 0, 0);
    });
    return null;
}

export const Background3D: React.FC = () => {
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePointer = (clientX: number, clientY: number) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;

      pointerRef.current.x = (clientX / width) * 2 - 1;
      pointerRef.current.y = -(clientY / height) * 2 + 1;
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      updatePointer(touch.clientX, touch.clientY);
    };

    const resetPointer = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('blur', resetPointer);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('blur', resetPointer);
    };
  }, []);

  return (
    <div id="webgl-container">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ alpha: true, antialias: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]} 
      >
        <color attach="background" args={['transparent']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={2} color="#2563eb" />
        <pointLight position={[0, 0, 2]} intensity={1} color="#60a5fa" distance={10} />
        
        <Rig pointerRef={pointerRef} />
        <ParticleField />
        
        {/* Main Interactive Element */}
        <InteractiveCore pointerRef={pointerRef} />

        {/* Floating Debris Everywhere */}
        <TechDebris pointerRef={pointerRef} />

      </Canvas>
    </div>
  );
};
