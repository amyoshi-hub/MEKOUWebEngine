
import * as pc from 'playcanvas';

export class TransformGizmo {
    private static gizmoRoot: pc.Entity | null = null;
    private static selectedEntity: pc.Entity | null = null;
    private static app: pc.AppBase;

    static register(app: pc.AppBase) {
        this.app = app;
        const Gizmo = pc.createScript('transformGizmo') as any;

        Gizmo.prototype.initialize = function () {
            this.activeAxis = null;
            this.ray = new pc.Ray();

            // Create visual axes
            this.createAxes();
        };

        Gizmo.prototype.createAxes = function () {
            const size = 2;
            const thickness = 0.05;

            // X Axis (Red)
            this.xAxis = this.createAxis('X', new pc.Color(1, 0, 0), new pc.Vec3(size, thickness, thickness), new pc.Vec3(size / 2, 0, 0));
            // Y Axis (Green)
            this.yAxis = this.createAxis('Y', new pc.Color(0, 1, 0), new pc.Vec3(thickness, size, thickness), new pc.Vec3(0, size / 2, 0));
            // Z Axis (Blue)
            this.zAxis = this.createAxis('Z', new pc.Color(0, 0, 1), new pc.Vec3(thickness, thickness, size), new pc.Vec3(0, 0, size / 2));
        };

        Gizmo.prototype.createAxis = function (name: string, color: pc.Color, scale: pc.Vec3, pos: pc.Vec3) {
            const axis = new pc.Entity(`Axis_${name}`);
            const mat = new pc.StandardMaterial();
            mat.diffuse = color;
            mat.emissive = color;
            mat.useLighting = false;
            mat.update();

            axis.addComponent('render', { type: 'box', material: mat });
            axis.setLocalScale(scale);
            axis.setLocalPosition(pos);
            this.entity.addChild(axis);
            return axis;
        };

        Gizmo.prototype.update = function () {
            if (!TransformGizmo.selectedEntity) {
                this.entity.enabled = false;
                return;
            }
            this.entity.enabled = true;
            this.entity.setPosition(TransformGizmo.selectedEntity.getPosition());

            // Scaled based on distance to camera to keep consistent screen size
            const cam = this.app.root.findComponent('camera') as pc.CameraComponent;
            if (cam) {
                const dist = this.entity.getPosition().distance(cam.entity.getPosition());
                const s = dist * 0.1;
                this.entity.setLocalScale(s, s, s);
            }
        };
    }

    static setSelection(entity: pc.Entity | null) {
        this.selectedEntity = entity;
        if (!this.gizmoRoot && this.app) {
            this.gizmoRoot = new pc.Entity('TransformGizmo');
            this.gizmoRoot.addComponent('script');
            (this.gizmoRoot.script as any).create('transformGizmo');
            this.app.root.addChild(this.gizmoRoot);
        }
        if (this.gizmoRoot) {
            this.gizmoRoot.enabled = !!entity;
        }
    }
}
