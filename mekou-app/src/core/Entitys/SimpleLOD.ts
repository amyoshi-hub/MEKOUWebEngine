
import * as pc from 'playcanvas';

export class SimpleLOD {
    static register(_app: pc.AppBase) {
        const LOD = pc.createScript('simpleLOD') as any;

        LOD.attributes.add('lowPolyModel', { type: 'entity', title: 'Low Poly Version' });
        LOD.attributes.add('threshold', { type: 'number', default: 20 });

        LOD.prototype.initialize = function () {
            this.highPoly = this.entity.render || this.entity.model;
        };

        LOD.prototype.update = function (_dt: number) {
            const cam = this.app.root.findComponent('camera') as pc.CameraComponent;
            if (!cam || !this.lowPolyModel) return;

            const dist = this.entity.getPosition().distance(cam.entity.getPosition());

            if (dist > this.threshold) {
                if (this.entity.enabled) {
                    this.entity.enabled = false;
                    this.lowPolyModel.enabled = true;
                }
            } else {
                if (!this.entity.enabled) {
                    this.entity.enabled = true;
                    this.lowPolyModel.enabled = false;
                }
            }
        };
    }
}
