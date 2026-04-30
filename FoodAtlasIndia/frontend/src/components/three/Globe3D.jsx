import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function GlobeMesh() {
  const meshRef = useRef()
  const pointsRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002
    }
  })

  // Create dots on sphere surface
  const dotGeometry = useMemo(() => {
    const positions = []
    const count = 2000
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count)
      const theta = Math.sqrt(count * Math.PI) * phi
      const x = 2.05 * Math.cos(theta) * Math.sin(phi)
      const y = 2.05 * Math.sin(theta) * Math.sin(phi)
      const z = 2.05 * Math.cos(phi)
      positions.push(x, y, z)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [])

  // City markers
  const markers = useMemo(() => {
    const cities = [
      { lat: 19.07, lon: 72.87, name: 'Mumbai' },
      { lat: 28.61, lon: 77.23, name: 'Delhi' },
      { lat: 26.92, lon: 75.78, name: 'Jaipur' },
      { lat: 15.49, lon: 73.82, name: 'Goa' },
      { lat: 25.32, lon: 83.01, name: 'Varanasi' },
      { lat: 27.17, lon: 78.04, name: 'Agra' },
      { lat: 9.93, lon: 76.26, name: 'Kerala' },
      { lat: 32.24, lon: 77.19, name: 'Manali' },
      { lat: 30.08, lon: 78.27, name: 'Rishikesh' },
      { lat: 24.58, lon: 73.68, name: 'Udaipur' },
    ]

    return cities.map((city) => {
      const phi = (90 - city.lat) * (Math.PI / 180)
      const theta = (city.lon + 180) * (Math.PI / 180)
      const x = -(2.1) * Math.sin(phi) * Math.cos(theta)
      const y = (2.1) * Math.cos(phi)
      const z = (2.1) * Math.sin(phi) * Math.sin(theta)
      return { ...city, position: [x, y, z] }
    })
  }, [])

  return (
    <group>
      {/* Main globe */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#0a1628"
          transparent
          opacity={0.85}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[2.01, 32, 32]}>
        <meshBasicMaterial
          color="#0d9488"
          wireframe
          transparent
          opacity={0.06}
        />
      </Sphere>

      {/* Dots */}
      <points ref={pointsRef} geometry={dotGeometry}>
        <pointsMaterial
          color="#14b8a6"
          size={0.015}
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>

      {/* City markers */}
      {markers.map((marker, i) => (
        <group key={i} position={marker.position}>
          <mesh>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          {/* Glow */}
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
          </mesh>
        </group>
      ))}

      {/* Atmosphere glow */}
      <Sphere args={[2.3, 64, 64]}>
        <meshBasicMaterial
          color="#0d9488"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  )
}

function FloatingParticles() {
  const particlesRef = useRef()

  const particles = useMemo(() => {
    const positions = []
    const count = 200
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
      )
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.02
      particlesRef.current.rotation.x = state.clock.getElapsedTime() * 0.01
    }
  })

  return (
    <points ref={particlesRef} geometry={particles}>
      <pointsMaterial
        color="#a855f7"
        size={0.02}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

export default function Globe3D() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#0d9488" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#a855f7" />
        <GlobeMesh />
        <FloatingParticles />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
        />
      </Canvas>
    </div>
  )
}
