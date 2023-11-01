/// <reference types="vite/client" />

declare module '*.glsl' {
  const src: string;
  export default src;
}

declare module '*.vert' {
  const src: string;
  export default src;
}

declare module '*.frag' {
  const src: string;
  export default src;
}

declare var c: HTMLCanvasElement;

declare var fullscreen: () => void;

declare var toggleGui: () => void;

declare var toggleVR: () => void;

declare var toggleAR: () => void;

declare var showAbout: () => void;

declare var hideAbout: () => void;
