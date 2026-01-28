import { Object3DNode } from '@react-three/fiber';
import { FloorShaderMaterial } from '../components/FloorShader';

declare module '@react-three/fiber' {
    interface ThreeElements {
        floorShaderMaterial: Object3DNode<FloorShaderMaterial, typeof FloorShaderMaterial>;
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            floorShaderMaterial: Object3DNode<FloorShaderMaterial, typeof FloorShaderMaterial>;
        }
    }
}
