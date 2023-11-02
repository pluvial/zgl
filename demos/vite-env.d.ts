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
