# ZGL: Zwiss Army knife for WebGL2

**[DEMO](http://zgl.vercel.app)** | **[API](docs/API.md)**

ZGL is a minimalistic wrapper on top of WebGL2 JS API. It's designed to reduce the amount of boilerplate code required to manage GLSL shaders, textures and framebuffers when making GPGPU-style procedural visualizations or simulations. See the [demos](src/routes/demo/) for examples of using ZGL. As of now the library consists of a standalone ~700 loc .js file.

**Disclaimer** This is not an officially supported Google product. ZGL is an early stage experiment, incomplete and unstable. It's an invitation to discuss compact and expressive graphics library design, which I hope is relevant in light of the upcoming arrival of WebGPU.

## Quickstart

As of now, the library API consists of a single function object that does everything (like a Swiss Army knife). Here is a tiny example of using it to draw an animated gradient quad:

```HTML
<canvas id="c" width="400" height="300"></canvas>
<script>
    import zgl from '@pluvial/zgl'

    const canvas = document.getElementById('c');
    // create WebGL2 context and ZGL
    const z = zgl(canvas);
    requestAnimationFrame(function render(t) {
        t /= 1000; // ms to sec
        z({t, // pass uniform 't' to GLSL
            Mesh:[10, 10],  // draw a 10x10 tessellated plane mesh
            // Vertex shader expression returns vec4 vertex position in
            // WebGL clip space. 'XY' and 'UV' are vec2 input vertex
            // coordinates in [-1,1] and [0,1] ranges.
            VP:`XY*0.8+sin(t+XY.yx*2.0)*0.2,0,1`,
            // Fragment shader returns 'RGBA'
            FP:`UV,0.5,1`});
        requestAnimationFrame(render);
    });
</script>
```

![ZGL quad gradient](static/images/quad.png)

`z` function has the following signature:

```js
z(params, target);
```

All it can do is to draw instanced, tessellated plane primitives into the specified (may be created in-place) target buffer using the provided vertex and fragment shaders. This may sound unimpressive, but we'll see that it's possible to do some pretty complex things with such a simple tool! Please refer to the [API reference](docs/API.md) for the detailed explanation `z` arguments. Let's now have a look at the more elaborate example of using ZGL to implement a particle simulation.

## Particle Life

Inspired by the [beautiful video](https://youtu.be/p4YirERTVF0?t=481) by Tom Mohr, let's try reproduce the "snake" pattern shown there. Particle Life is made of particles of a few different types. All particles repel when they are closer than some distance $r$, but at around $2r$ the resulting (potentially non-symmetric) force is described by the special force matrix $F_{i,j}$, where $i,j$ are types of two particles. Positive $F$ corresponds to attraction and negative to repulsion. Let's create a texture that stores such a matrix. We can create an array on the JS side and pass it to ZGL, but it's even easier to populate matrix values right on the GPU:

```js
const K = 6; // number of particle types
const F = z(
	{ K, FP: `float(I.x==I.y) + 0.1*float(I.x==(I.y+1)%int(K))` },
	{ size: [K, K], format: 'r16f', tag: 'F' }
);
```

This creates a single channel float16 texture of size `[width,height]==[6,6]` and populates its values by evaluating the `FP` expression in a newly created fragment shader. `I` is a special variable of type `ivec2` that contains coordinates of the pixel being evaluated. The second (`target`) object must contain the `tag` parameter that is used to store the newly created render target in the `z` object for later use.

We can easily visualize the resulting texture to make sure everything is ok:

```js
z({ F, FP: `F(I/20).x*3.0` });
```

![](static/images/F.png)

Uniform textures can be accessed with usual GLSL functions, or with a helper macro that has the same name as the texture uniform. Passing `ivec2` as parameter makes it call `texelFetch()` to get a texel using the integer coordinates, passing `vec2` uses `texture()`, with filtering and wrapping.

The next step is to create a list of textures that is going to contain particle positions. Each pixel will contain a single particle position and type.

```js
const points = z({}, { size: [30, 10], story: 3, format: 'rgba32f', tag: 'points' });
```

We are going to simulate 30\*10=300 particles. Textures will have 4 channels (RGBA) of type float32. The `story:3` argument says that we need to create a cyclic buffer of three textures of the same format, so that we can read two consecutive states of the particle system (for momentum) to produce the third. We don't provide any shader code in the first argument here, but we can initialize these textures later by passing the returned object as a `target`:

```js
for (let i = 0; i < 2; ++i) {
	z(
		{
			K,
			seed: 123,
			FP: `
        vec2 pos = (hash(ivec3(I, seed)).xy-0.5)*10.0;
        float color = floor(UV.x*K);
        FOut = vec4(pos, 0.0, color);`
		},
		points
	);
}
```

The shader code above uses "multiline" shader `code` format instead of a single expression. The output must be written to a global variable `FOut`. Variable `UV` has type `vec2` and provides `[0,1]`-range normalized coordinates of the current pixel. It is used to assign one of `K` "colors" to each particle. For convenience ZGL provides a [simple hash](https://github.com/pluvial/zgl/blob/main/src/lib/zgl.ts#L277) function `vec3 hash(ivec3)` that can be used as a deterministic random number generator.

Note that we are writing the same particle positions two times, which means that particles have zero velocity at initialization. Now `points[0]` and `points[1]` contain the same values, and `points[2]` is uninitialized and is going to be overwritten at the first simulation step.

Before we start modeling the particle dynamics it's a good idea to implement visualization. So far we've already seen "expression" and "multiline" shortcut `code` formats. Now we are going to write a `full` vertex-fragment shader pair:

```js
z({
	K,
	worldExtent, // uniforms
	// reading the last state of 'points' texture
	points: points[0],
	// render a quad instance for every 'points' texel
	Grid: points[0].size,
	// preserve the scale of xy-axes by fitting
	// [-1..1]x[-1..1] box into the view
	Aspect: 'fit',
	// blend primitives using alpha transparency
	Blend: 'd*(1-sa)+s*sa',
	// vertex shader that defines where to draw
	// the quad primitives
	VP: `
    // fetch the current particle data
    vec4 d = points(ID.xy);
    // populate color varying to use in fragment shader
    varying vec3 color = cos((d.w/K+vec3(0,0.33,0.66))*TAU)*0.5+0.5;
    // set the clip-space vertex position, 'vec2 XY' contains
    // coordinates of the quad vertex in -1..1 range
    VPos.xy = 2.0*(d.xy+XY/8.0)/worldExtent;`,
	// Set the the fragment color and transparency
	// depending on the distance from the quad center.
	// Interpolated XY values are also available
	// in the fragment shader.
	FP: `color, smoothstep(1.0, 0.6, length(XY))`
});
// 'target' argument is omitted, so rendering to canvas
```

Running this code in the drawing loop produces the following image:

![Initial particles](static/images/init_particles.png)

The vertex shader computes WebGL [Clip Space](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection#clip_space) coordinates for each corner of each particle quad. We map particle positions from `[-worldExtent/2, worldExtent/2]` range to `[-1,1]` box. This shader also computes particle color using [cosine palettes trick](https://iquilezles.org/articles/palettes/) and passes it to the fragment shader along with the corner offset vector. The fragment shader calculates pixel opacity using the distance form the particle center. This way we can use low-level GLSL as an expressive, flexible and performant tool to render large numbers of primitives.

Now we can set particles in motion by writing the update shader that computes new particle positions each frame.

```js
z(
	{
		F,
		worldExtent,
		repulsion,
		inertia,
		dt, // uniforms
		// The current state of the system is implicitly
		// available to the shader as 'Src' uniform if
		// the target has history (is an array of textures).
		// Here we explicitly pass the state one step at the past
		past: points[1],
		FP: `
// this function wraps positions and velocities to
// [-worldExtent/2, worldExtent/2] range
vec3 wrap(vec3 p) {
    return (fract(p/worldExtent+0.5)-0.5)*worldExtent;
}
void fragment() {
    // read the current particle state
    FOut = Src(I);
    vec3 force=vec3(0); // force accumulator
    // iterate over particles
    for (int y=0; y<ViewSize.y; ++y)
    for (int x=0; x<ViewSize.x; ++x) {
        // reading the state of another particle
        vec4 data1 = Src(ivec2(x,y));
        vec3 dpos = wrap(data1.xyz-FOut.xyz);
        // calculate distance
        float r = length(dpos);
        if (r>3.0) continue;
        dpos /= r+1e-8;
        // calculate repulsion and interaction forces
        float rep = max(1.0-r, 0.0)*repulsion;
        float f = F(ivec2(FOut.w, data1.w)).x;
        float inter = f*max(1.0-abs(r-2.0), 0.0);
        force += dpos*(inter-rep);
    }
    // fetch the past state to compute velocity
    vec3 vel = wrap(FOut.xyz-past(I).xyz)*pow(inertia, dt);
    // update particle position
    FOut.xyz = wrap(FOut.xyz+vel+0.5*force*(dt*dt));
}
`
	},
	points
); // using 'points' as the target
```

Soon randomly scattered particles self-assemble into a nice colorful snake! The simulation is happening on the GPU and is quite fast for the quadratic complexity algorithm (that iterates all particle pairs). Even mobile phones can run hundreds of steps per second. Thanks to ZGL, orchestrating this computation, managing shaders and framebuffers takes minimal amount of boilerplate code.

![Particle Snake](static/images/particle_snake.png)

## Links

Sources of wisdom:

- [Inigo Quilez](https://iquilezles.org/)
- [Steven Wittens](https://acko.net/)
- [WebGL](https://webglfundamentals.org/) / [WebGL2](https://webgl2fundamentals.org/) fundamentals

Playgrounds:

- [ShaderToy](https://www.shadertoy.com/)
- [twigl](https://twigl.app/)
- [vertexshaderart](https://www.vertexshaderart.com/)

Libraries

- [three.js](https://threejs.org/)
- [Use.GPU](https://usegpu.live/)
- [MathBox](https://github.com/unconed/mathbox)
- [twgljs](https://twgljs.org/)
- [regl](https://github.com/regl-project/regl)
- [gpu-io](https://github.com/amandaghassaei/gpu-io)
- [luma.gl](https://luma.gl/)
- [CindyJS](https://cindyjs.org/)
- [PicoGL.js](https://github.com/tsherif/picogl.js)
- [pex-context](https://github.com/pex-gl/pex-context)

## create-svelte

Everything you need to build a Svelte library, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

Read more about creating a library [in the docs](https://kit.svelte.dev/docs/packaging).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
pnpm create svelte@latest

# create a new project in my-app
pnpm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build your library:

```bash
pnpm package
```

To create a production version of your showcase app:

```bash
pnpm build
```

You can preview the production build with `pnpm preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Publishing

Go into the `package.json` and give your package the desired name through the `"name"` option. Also consider adding a `"license"` field and point it to a `LICENSE` file which you can create from a template (one popular option is the [MIT license](https://opensource.org/license/mit/)).

To publish your library to [npm](https://www.npmjs.com):

```bash
pnpm publish
```
