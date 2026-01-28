import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

const FloorShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#050505'),
        uPulseColor: new THREE.Color('#1a0000'),
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uPulseColor;
    varying vec2 vUv;

    // Simple pseudo-noise
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      
      // Moving organic pattern
      float n = noise(uv * 10.0 + uTime * 0.1);
      float dist = distance(uv, vec2(0.5));
      
      // Pulsating waves
      float pulse = sin(uTime * 0.5 - dist * 10.0) * 0.5 + 0.5;
      pulse *= 0.1; // Keep it subtle
      
      vec3 finalColor = mix(uColor, uPulseColor, pulse + n * 0.02);
      
      // Vignette effect
      float vignette = 1.0 - smoothstep(0.4, 0.7, dist);
      finalColor *= vignette;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ FloorShaderMaterial });

export { FloorShaderMaterial };
