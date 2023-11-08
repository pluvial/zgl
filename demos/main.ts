import { GUI } from 'lil-gui';
import z, { adjustCanvas, gl, reset, Params, Target } from '../src/zgl.js';
import demos from './index.js';
import glsl_include from './include.glsl';
import 'lil-gui/dist/lil-gui.css';

const setDisplay = (el, val) => (el.style.display = val);

let defaultDemo = 'ParticleLife3d';
const keys = Object.keys(demos);
let singleMode = keys.length == 1;
if (singleMode) {
  defaultDemo = demos[0].name;
}

type Demos = typeof demos;
type DemoNames = keyof Demos;
type Demo = Demos[DemoNames];

let demo: Demo | null = null;
let gui: GUI | null = null;

const xrDemos = Object.values(demos).filter(f => (f as any).Tags?.includes('3d'));
let xrSession: XRSession | null = null;
let xrRefSpace: XRReferenceSpace | null = null;
let xrPose: XRViewerPose | null = null;
let lookUpStartTime = 0;
let haveVR,
  haveAR = false;
if (navigator.xr) {
  navigator.xr.isSessionSupported('immersive-vr').then(supported => {
    haveVR = supported;
    updateVRButtons();
  });
  navigator.xr.isSessionSupported('immersive-ar').then(supported => {
    haveAR = supported;
    updateVRButtons();
  });
}

const viewParams = {
  canvasSize: new Float32Array(2),
  pointer: new Float32Array(3),
  cameraYPD: new Float32Array(3),
  xrRay: new Float32Array(16 * 2),
  xrRayInv: new Float32Array(16 * 2),
  xrButton: new Float32Array(4 * 2),
};
resetCamera();

function withCamera(params: Params, target?: Target) {
  params = { ...params, Inc: glsl_include + (params.Inc || '') };
  if (target || !params.xrMode) {
    return z(params, target);
  }
  delete params.Aspect;
  const glLayer = xrSession!.renderState.baseLayer!;
  target = {
    bindTarget: gl => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
      return [glLayer.framebufferWidth, glLayer.framebufferHeight];
    },
  };
  for (const view of xrPose!.views) {
    const vp = glLayer.getViewport(view)!;
    params.View = [vp.x, vp.y, vp.width, vp.height];
    params.xrProjectionMatrix = view.projectionMatrix;
    params.xrViewMatrix = view.transform.inverse.matrix;
    const { x, y, z } = view.transform.position;
    params.xrPosition = [x, y, z];
    z(params, target);
  }
}

const setPointer = (e, buttons) => {
  const [w, h] = viewParams.canvasSize;
  const [x, y] = [e.offsetX - w / 2, h / 2 - e.offsetY];
  viewParams.pointer.set([x, y, buttons]);
  return [x, y];
};
c.addEventListener('pointerdown', e => {
  if (!e.isPrimary) return;
  setPointer(e, e.buttons);
});
c.addEventListener('pointerout', e => setPointer(e, 0));
c.addEventListener('pointerup', e => setPointer(e, 0));
c.addEventListener('pointermove', e => {
  const [px, py, _] = viewParams.pointer;
  const [x, y] = setPointer(e, e.buttons);
  if (!e.isPrimary || e.buttons != 1) return;
  let [yaw, pitch, dist] = viewParams.cameraYPD;
  yaw -= (x - px) * 0.01;
  pitch += (y - py) * 0.01;
  pitch = Math.min(Math.max(pitch, 0), Math.PI);
  viewParams.cameraYPD.set([yaw, pitch, dist]);
});

let name = location.hash.slice(1);
if (!(name in demos)) {
  name = defaultDemo;
}
runDemo(name);
populatePreviews();

requestAnimationFrame(frame);

function resetCamera() {
  viewParams.cameraYPD.set([(Math.PI * 3) / 4, Math.PI / 4, 1.8]);
}

function frame(t) {
  requestAnimationFrame(frame);
  if (xrSession) return; // skip canvas frames when XR is running
  adjustCanvas(1); // fix devicePixelRatio to 1
  viewParams.canvasSize.set([c.clientWidth, c.clientHeight]);

  (demo as any).frame(withCamera, {
    time: t / 1000.0,
    xrMode: false,
    ...viewParams,
  });
}

function xrFrameRequestCallback(t, xrFrame: XRFrame) {
  xrSession!.requestAnimationFrame(xrFrameRequestCallback);
  xrPose = xrFrame.getViewerPose(xrRefSpace!)!;
  if (!xrPose) return;
  viewParams.xrRay.fill(0.0);
  viewParams.xrRayInv.fill(0.0);
  viewParams.xrButton.fill(0.0);
  const params = { time: t / 1000.0, xrMode: true, ...viewParams };
  for (let i = 0; i < 2; ++i) {
    const inputSource = xrSession!.inputSources[i];
    if (inputSource && inputSource.gamepad && inputSource.gamepad.buttons) {
      inputSource.gamepad.buttons.forEach((btn, btnIdx) => {
        if (btnIdx < 4) viewParams.xrButton[i * 4 + btnIdx] = btn.value || btn.pressed ? 1 : 0;
      });
    }
    if (!inputSource || !inputSource.targetRaySpace) continue;
    const pose = xrFrame.getPose(inputSource.targetRaySpace, xrRefSpace!);
    if (!pose) continue;
    viewParams.xrRay.set(pose.transform.matrix, i * 16);
    viewParams.xrRayInv.set(pose.transform.inverse.matrix, i * 16);
  }

  (demo as any).frame(withCamera, params);
  withCamera({
    ...params,
    Mesh: [20, 20],
    Grid: [2],
    DepthTest: 1,
    VP: `
            varying vec3 p = uv2sphere(UV);
            varying vec4 buttons = xrButton[ID.x];
            VPos = wld2proj(xrRay[ID.x]*vec4(p*vec3(0.02, 0.02, 0.1),1));`,
    FP: `
            vec3 c = p*0.5+0.5;
            FOut = vec4(c*0.5,1);
            float b = c.z*4.0;
            if (b<4.0 && buttons[int(b)]>fract(b)) FOut += 0.5;`,
  });

  const lookUpCoef = -xrPose.transform.matrix[10];
  if (!singleMode && lookUpCoef > 0.5) {
    const dt = (t - lookUpStartTime) / 1000;
    if (dt > 1) {
      lookUpStartTime = t;
      let i = xrDemos.indexOf(demo!.constructor as Demo);
      i = (i + 1) % xrDemos.length;
      runDemo(xrDemos[i].name);
    } else {
      withCamera({
        ...params,
        Mesh: [20, 20],
        dt,
        DepthTest: 1,
        VP: `
                vec3 p = uv2sphere(UV)*0.6*clamp(1.0-dt, 0.0, 0.8) + vec3(-2.0, 0.0, 3.0);
                VPos = wld2proj(vec4(p,1));`,
        FP: `UV,0.5,1`,
      });
    }
  } else {
    lookUpStartTime = t;
  }
}

function toggleXR(xr) {
  if (!xrSession) {
    navigator.xr!.requestSession(`immersive-${xr}` as XRSessionMode).then(session => {
      xrSession = session;
      session.addEventListener('end', () => {
        xrSession = null;
      });
      session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, gl),
      });
      session.requestReferenceSpace('local').then(refSpace => {
        xrRefSpace = refSpace.getOffsetReferenceSpace(
          new XRRigidTransform(
            { x: 0, y: -0.25, z: -1.0, w: 1 }, // position offset
            { x: 0.5, y: 0.5, z: 0.5, w: -0.5 },
          ), // rotate z up
        );
        session.requestAnimationFrame(xrFrameRequestCallback);
      });
    });
  } else {
    xrSession.end();
  }
}

function runDemo(name) {
  if (demo) {
    if (gui) gui.destroy();
    (demo as any).free?.();
    reset();
    demo = gui = null;
  }
  if (!singleMode) location.hash = name;
  gui = new GUI({ container: lil });
  gui.domElement.id = 'gui';
  gui.hide();
  demo = new demos[name](withCamera, gui);
  if (gui && gui.controllers.length == 0) {
    gui.destroy();
    gui = null;
  }
  setDisplay(settingButton, gui ? 'block' : 'none');
  if (sourceLink) sourceLink.href = `https://github.com/pluvial/zgl/blob/main/demos/${name}.js`;
  updateVRButtons();
  resetCamera();
}

function updateVRButtons() {
  setDisplay(vrButton, 'none');
  setDisplay(arButton, 'none');
  const tags = demo && (demo.constructor as any).Tags;
  if (tags && tags.includes('3d')) {
    if (haveVR) setDisplay(vrButton, 'block');
    if (haveAR) setDisplay(arButton, 'block');
  }
}

function populatePreviews() {
  const panel = cards;
  if (!panel) return;
  Object.keys(demos).forEach(name => {
    const el = document.createElement('div');
    el.classList.add('card');
    el.innerHTML = `<img src="preview/${name}.jpg">${name}`;
    el.addEventListener('click', () => runDemo(name));
    panel.appendChild(el);
  });
}

Object.assign(window, {
  fullscreen() {
    // const f = c.requestFullscreen || c.webkitRequestFullscreen;
    const f = c.requestFullscreen;
    f?.apply(c);
  },
  toggleGui() {
    if (!gui) return;
    const style = gui.domElement.style;
    style.display = style.display == 'none' ? '' : 'none';
  },
  toggleVR() {
    toggleXR('vr');
  },
  toggleAR() {
    toggleXR('ar');
  },
  showAbout() {
    about.style.display = 'block';
  },
  hideAbout() {
    about.style.display = 'none';
  },
});

d.addEventListener('pointerdown', () => {
  hideAbout();
  if (window.innerWidth < 500) {
    // close menu on small screens
    p.removeAttribute('open');
  }
});
p.addEventListener('click', hideAbout);
