import * as pc from 'playcanvas';

/**
 * Advanced LOD Script
 * Combines mesh switching and shader-based displacement reduction at distance.
 */
export class SimpleLOD {
    static register(_app: pc.AppBase) {
        const LOD = pc.createScript('simpleLOD') as any;

        LOD.attributes.add('lowPolyModel', { type: 'entity', title: 'Low Poly Entity' });
        LOD.attributes.add('threshold', { type: 'number', default: 15 });
        LOD.attributes.add('useShaderLOD', { type: 'boolean', default: true });

        LOD.prototype.initialize = function () {
            this.highPoly = this.entity.render || this.entity.model;
            if (this.useShaderLOD && this.highPoly) {
                this.setupShaderLOD();
            }
        };

        LOD.prototype.setupShaderLOD = function () {
            const meshInstances = this.highPoly.meshInstances;
            meshInstances.forEach((mi: pc.MeshInstance) => {
                const mat = mi.material as any;
                // Add custom vertex displacement chunk
                mat.chunks.transformVS = `
                    uniform float uDist;
                    uniform float uTime;
                    
                    mat4 getModelMatrix() {
    return matrix_model;
}
                    
                    vec4 getPosition() {
                        vec3 pos = vertex_position;
                        // Reduce displacement based on distance
                        float disp = sin(pos.x * 5.0 + uTime) * cos(pos.z * 5.0 + uTime) * 0.1;
                        float factor = clamp(1.0 - (uDist / 20.0), 0.0, 1.0);
    pos.y += disp * factor;
    return matrix_model * vec4(pos, 1.0);
}

void main(void) {
    gl_Position = matrix_viewProjection * getPosition();
}
`;
                mat.update();
            });
        };

        LOD.prototype.update = function (_dt: number) {
            const cam = this.app.root.findByName('EditorCamera') || this.app.root.findComponent('camera')?.entity;
            if (!cam) return;

            const myPos = this.entity.getPosition();
            const camPos = cam.getPosition();
            const dist = myPos.distance(camPos);

            // 1. Mesh Switching LOD
            if (this.lowPolyModel) {
                if (dist > this.threshold) {
                    if (this.highPoly.entity.enabled) {
                        this.highPoly.entity.enabled = false;
                        this.lowPolyModel.enabled = true;
                    }
                } else {
                    if (!this.highPoly.entity.enabled) {
                        this.highPoly.entity.enabled = true;
                        this.lowPolyModel.enabled = false;
                    }
                }
            }

            // 2. Shader Parameter LOD
            if (this.useShaderLOD && this.highPoly) {
                this.highPoly.meshInstances.forEach((mi: pc.MeshInstance) => {
                    mi.material.setParameter('uDist', dist);
                    mi.material.setParameter('uTime', performance.now() / 1000);
                });
            }
        };
    }
}
