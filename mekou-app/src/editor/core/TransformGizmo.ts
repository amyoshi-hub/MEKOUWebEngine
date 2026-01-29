
import * as pc from 'playcanvas';

export type GizmoMode = 'translate' | 'rotate' | 'scale';

export class TransformGizmo {
    private static gizmoRoot: pc.Entity | null = null;
    private static selectedEntity: pc.Entity | null = null;
    private static app: pc.AppBase;
    private static currentMode: GizmoMode = 'translate';

    static register(app: pc.AppBase) {
        this.app = app;
        const Gizmo = pc.createScript('transformGizmo') as any;

        Gizmo.prototype.initialize = function () {
            this.axes = { translate: [], rotate: [], scale: [] };

            // Create visual axes for all modes
            this.createTranslateAxes();
            this.createRotateAxes();
            this.createScaleAxes();

            this.updateVisibility();
        };

        Gizmo.prototype.createTranslateAxes = function () {
            const size = 2; const t = 0.05;
            this.axes.translate.push(this.createAxis('X', new pc.Color(1, 0, 0), new pc.Vec3(size, t, t), new pc.Vec3(size / 2, 0, 0), 'box'));
            this.axes.translate.push(this.createAxis('Y', new pc.Color(0, 1, 0), new pc.Vec3(t, size, t), new pc.Vec3(0, size / 2, 0), 'box'));
            this.axes.translate.push(this.createAxis('Z', new pc.Color(0, 0, 1), new pc.Vec3(t, t, size), new pc.Vec3(0, 0, size / 2), 'box'));
        };

        Gizmo.prototype.createRotateAxes = function () {
            const r = 1.5; const t = 0.05;
            // Torus or thin box approximation for rings. Using thin boxes for now as "arcs"
            this.axes.rotate.push(this.createAxis('RX', new pc.Color(1, 0, 0), new pc.Vec3(t, r, r), new pc.Vec3(0, 0, 0), 'torus', [0, 0, 90]));
            this.axes.rotate.push(this.createAxis('RY', new pc.Color(0, 1, 0), new pc.Vec3(r, t, r), new pc.Vec3(0, 0, 0), 'torus', [0, 0, 0]));
            this.axes.rotate.push(this.createAxis('RZ', new pc.Color(0, 0, 1), new pc.Vec3(r, r, t), new pc.Vec3(0, 0, 0), 'torus', [90, 0, 0]));
        };

        Gizmo.prototype.createScaleAxes = function () {
            const size = 2; const t = 0.05; const box = 0.2;
            // Line + Box tip
            this.axes.scale.push(this.createAxis('SX', new pc.Color(1, 0, 0), new pc.Vec3(size, t, t), new pc.Vec3(size / 2, 0, 0), 'box'));
            this.axes.scale.push(this.createAxis('SY', new pc.Color(0, 1, 0), new pc.Vec3(t, size, t), new pc.Vec3(0, size / 2, 0), 'box'));
            this.axes.scale.push(this.createAxis('SZ', new pc.Color(0, 0, 1), new pc.Vec3(t, t, size), new pc.Vec3(0, 0, size / 2), 'box'));

            const tipX = this.createAxis('SX_Tip', new pc.Color(1, 0, 0), new pc.Vec3(box, box, box), new pc.Vec3(size, 0, 0), 'box');
            const tipY = this.createAxis('SY_Tip', new pc.Color(0, 1, 0), new pc.Vec3(box, box, box), new pc.Vec3(0, size, 0), 'box');
            const tipZ = this.createAxis('SZ_Tip', new pc.Color(0, 0, 1), new pc.Vec3(box, box, box), new pc.Vec3(0, 0, size), 'box');
            this.axes.scale.push(tipX, tipY, tipZ);
        };

        Gizmo.prototype.createAxis = function (name: string, color: pc.Color, scale: pc.Vec3, pos: pc.Vec3, type: string, rot?: number[]) {
            const axis = new pc.Entity(`Axis_${name}`);
            const mat = new pc.StandardMaterial();
            mat.diffuse = color;
            mat.emissive = color;
            mat.useLighting = false;
            mat.depthTest = false; // Always visible
            mat.update();

            // For torus (rotation), we might need a custom mesh or just render primitive for now
            // PC supports 'cylinder', 'cone', etc. 'torus' is not standard primitive in simpler API, assume box/cylinder
            const renderType = type === 'torus' ? 'cylinder' : 'box';

            axis.addComponent('render', { type: renderType, material: mat });
            axis.setLocalScale(scale);
            axis.setLocalPosition(pos);
            if (rot) axis.setLocalEulerAngles(rot[0], rot[1], rot[2]);

            this.entity.addChild(axis);
            return axis;
        };

        Gizmo.prototype.updateVisibility = function () {
            // Hide all first
            Object.values(this.axes).forEach((list: any) => list.forEach((e: any) => e.enabled = false));

            // Show current mode
            const mode = TransformGizmo.currentMode;
            if (this.axes[mode]) {
                this.axes[mode].forEach((e: any) => e.enabled = true);
            }
        };

        Gizmo.prototype.update = function () {
            if (!TransformGizmo.selectedEntity) {
                this.entity.enabled = false;
                return;
            }
            this.entity.enabled = true;
            this.entity.setPosition(TransformGizmo.selectedEntity.getPosition());

            // Scaled based on distance
            const cam = this.app.root.findComponent('camera') as pc.CameraComponent;
            if (cam) {
                const dist = this.entity.getPosition().distance(cam.entity.getPosition());
                const s = dist * 0.15;
                this.entity.setLocalScale(s, s, s);
            }

            // Check mode change
            this.updateVisibility();
        };
    }

    static setSelection(entity: pc.Entity | null) {
        this.selectedEntity = entity;
        this.ensureGizmo();
        if (this.gizmoRoot) {
            this.gizmoRoot.enabled = !!entity;
        }
    }

    static setMode(mode: GizmoMode) {
        this.currentMode = mode;
        this.ensureGizmo();
        // Trigger update immediately if possible?
        // Logic handled in update loop
        console.log("Gizmo Mode set to:", mode);
    }

    static getMode() {
        return this.currentMode;
    }

    private static ensureGizmo() {
        if (!this.gizmoRoot && this.app) {
            this.gizmoRoot = new pc.Entity('TransformGizmo');
            this.gizmoRoot.addComponent('script');
            (this.gizmoRoot.script as any).create('transformGizmo');
            this.app.root.addChild(this.gizmoRoot);
        }
    }
}
