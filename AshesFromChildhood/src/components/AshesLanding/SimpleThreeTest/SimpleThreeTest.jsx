import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'

const RotatingCube = () => {
  const meshRef = useRef()

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

const SimpleThreeTest = () => {
  return (
    <div style={{ height: '400px', background: '#1a1a2e' }}>
      <h2 style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
        Three.js Test
      </h2>
      <Canvas style={{ height: '300px' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <RotatingCube />
      </Canvas>
    </div>
  )
}

export default SimpleThreeTest