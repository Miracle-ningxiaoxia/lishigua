declare module 'three/examples/jsm/renderers/CSS2DRenderer' {
  import type { Camera, Object3D, Scene } from 'three';

  export class CSS2DRenderer {
    domElement: HTMLElement;
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: Camera): void;
  }

  export class CSS2DObject extends Object3D {
    element: HTMLElement;
    constructor(element: HTMLElement);
  }
}
