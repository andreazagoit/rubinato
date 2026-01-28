import { FloorShaderMaterial } from './FloorShader';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            floorShaderMaterial: import('@react-three/fiber').Object3DNode<FloorShaderMaterial, typeof FloorShaderMaterial>;
        }
    }
}
