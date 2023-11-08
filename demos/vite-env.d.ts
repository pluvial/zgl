/// <reference types="vite/client" />

// adapted from vite-plugin-glsl/ext

/**
 * @const
 * @readonly
 * @kind module
 * @description Generic shaders */
declare module '*.glsl' {
  const shader: string;
  export default shader;
}

/**
 * @const
 * @readonly
 * @kind module
 * @description Vertex shaders */
declare module '*.vert' {
  const shader: string;
  export default shader;
}

/**
 * @const
 * @readonly
 * @kind module
 * @description Fragment shaders */
declare module '*.frag' {
  const shader: string;
  export default shader;
}

declare var c: HTMLCanvasElement;

declare var p: HTMLDetailsElement;

declare var cards: HTMLDivElement;

declare var d: HTMLDivElement;

declare var buttons: HTMLDivElement;

declare var vrButton: HTMLButtonElement;

declare var arButton: HTMLButtonElement;

declare var settingButton: HTMLButtonElement;

declare var sourceLink: HTMLAnchorElement;

declare var aboutButton: HTMLButtonElement;

declare var about: HTMLDivElement;

declare var lil: HTMLDivElement;

declare var fullscreen: () => void;

declare var toggleGui: () => void;

declare var toggleVR: () => void;

declare var toggleAR: () => void;

declare var showAbout: () => void;

declare var hideAbout: () => void;
