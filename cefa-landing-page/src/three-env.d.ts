declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  export * from 'three/addons/loaders/GLTFLoader.js';
}

declare module 'three/addons/loaders/GLTFLoader.js' {
  import { Loader, LoadingManager, Group, AnimationClip, Camera } from 'three';

  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(
      data: ArrayBuffer | string,
      path: string,
      onLoad: (gltf: GLTF) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }

  export interface GLTF {
    animations: AnimationClip[];
    scene: Group;
    scenes: Group[];
    cameras: Camera[];
    asset: object;
  }
}
