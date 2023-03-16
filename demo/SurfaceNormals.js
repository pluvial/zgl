/** @license 
  * Copyright 2023 Google LLC.
  * SPDX-License-Identifier: Apache-2.0 
  */

class SurfaceNormals {
    static Tags = ['3d'];
    
    frame(glsl, params) {
        glsl({...params, Mesh:[64,128], Grid:[5,5],
              Aspect:'fit', DepthTest:1}, `
        varying vec3 normal;
        //VERT
        vec3 surface_f(vec2 p) {
            vec2 c = sin(time+p*vec2(ID)*TAU);
            vec3 pos = torus(p, 1.0, 0.4 + 0.1*c.x + 0.15*c.y)/8.0;
            pos.xy += (vec2(ID)-vec2(Grid-1)*0.5)*0.4;
            return pos;
        }
        vec4 vertex() {
            vec4 pos = vec4(SURF(surface_f, UV, normal, 1e-3), 1.0);
            return wld2proj(pos);
        }
        //FRAG
        void fragment() {
            out0 = vec4(normal*0.6, 1);
            vec2 m = UV*vec2(Mesh)/4.0;
            out0.rgb += (isoline(m.x)+isoline(m.y))*0.2;
            // useful for debugging incorrect face ordering
            // out0.r += float(!gl_FrontFacing);
        }`);
    }
}
