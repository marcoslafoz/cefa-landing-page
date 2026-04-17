declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  export * from 'three/addons/loaders/GLTFLoader.js';
}

declare module 'three/addons/loaders/GLTFLoader.js' {
  import { Loader, LoadingManager, Group, AnimationClip, Camera } from 'three';
  import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);
    setDRACOLoader(dracoLoader: DRACOLoader): this;
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

declare module 'three/addons/loaders/DRACOLoader.js' {
  import { Loader, LoadingManager, BufferGeometry } from 'three';

  export class DRACOLoader extends Loader {
    constructor(manager?: LoadingManager);
    setDecoderPath(path: string): this;
    setDecoderConfig(config: object): this;
    preload(): this;
    dispose(): void;
    load(
      url: string,
      onLoad: (geometry: BufferGeometry) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}
