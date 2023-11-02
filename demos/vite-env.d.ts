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

declare var panel: HTMLDetailsElement;

declare var cards: HTMLDivElement;

declare var demo: HTMLDivElement;

declare var buttons: HTMLDivElement;

declare var vrButton: HTMLButtonElement;

declare var arButton: HTMLButtonElement;

declare var settingButton: HTMLButtonElement;

declare var sourceLink: HTMLAnchorElement;

declare var aboutButton: HTMLButtonElement;

declare var about: HTMLDivElement;

declare var fullscreen: () => void;

declare var toggleGui: () => void;

declare var toggleVR: () => void;

declare var toggleAR: () => void;

declare var showAbout: () => void;

declare var hideAbout: () => void;
