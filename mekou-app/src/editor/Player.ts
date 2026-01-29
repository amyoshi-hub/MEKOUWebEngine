import * as pc from 'playcanvas';

export class Player {
    public entity: pc.Entity;

    public static readonly MODES = {
        DEV: 'devController',
        FPS: 'fpsController',
        TPS: 'tpsController',
        VEHICLE: 'vehicleController'
    } as const;

    constructor(private app: pc.AppBase) {
        this.entity = this.app.root.findByName('MekouPlayer') as pc.Entity || this.createPlayerEntity();
        this.ensureCameraHierarchy();
        this.ensureScripts();
    }

    private ensureCameraHierarchy() {
        let pivot = this.entity.findByName('CameraPivot') as pc.Entity;
        if (!pivot) {
            pivot = new pc.Entity('CameraPivot');
            this.entity.addChild(pivot);
        }

        let cam = this.entity.findByName('Camera') as pc.Entity;
        if (!cam) {
            cam = new pc.Entity('Camera');
            cam.addComponent('camera');
            pivot.addChild(cam);
        }
    }

    private ensureScripts() {
        if (!this.entity.script) this.entity.addComponent('script');
        const s = this.entity.script!;
        if (!s.has(Player.MODES.DEV)) s.create(Player.MODES.DEV);
        if (!s.has(Player.MODES.FPS)) s.create(Player.MODES.FPS);
        if (!s.has(Player.MODES.TPS)) s.create(Player.MODES.TPS);
        if (!s.has(Player.MODES.VEHICLE)) s.create(Player.MODES.VEHICLE);
    }

    public switchController(mode: keyof typeof Player.MODES = 'FPS') {
        const scripts = this.entity.script;
        if (!scripts) return;

        Object.values(Player.MODES).forEach(scriptName => {
            const s = scripts.get(scriptName);
            if (s) {
                s.enabled = false;
            }
        });

        const targetScriptName = Player.MODES[mode];
        const s = scripts.get(targetScriptName);
        if (s) {
            s.enabled = true;

            // Physics Toggle
            if (this.entity.rigidbody) {
                this.entity.rigidbody.enabled = (mode !== 'DEV');
                if (mode === 'DEV') {
                    // Reset velocity to prevent drifting when entering DEV mode
                    this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
                    this.entity.rigidbody.angularVelocity = pc.Vec3.ZERO;
                }
            }

            // Camera Adjustment for Mode
            const pivot = this.entity.findByName('CameraPivot');
            const cam = this.entity.findByName('Camera');
            if (pivot && cam) {
                if (mode === 'TPS') {
                    cam.setLocalPosition(0, 1, 4);
                    cam.setLocalEulerAngles(-15, 0, 0);
                } else if (mode === 'VEHICLE') {
                    cam.setLocalPosition(0, 2, 6);
                    cam.setLocalEulerAngles(-20, 0, 0);
                } else {
                    cam.setLocalPosition(0, 0.6, 0); // FPS/DEV height
                    cam.setLocalEulerAngles(0, 0, 0);
                }
            }

            console.log(`Switched to ${mode} mode`);
        } else {
            console.warn(`Controller script ${targetScriptName} not found on entity.`);
        }
    }

    private createPlayerEntity(): pc.Entity {
        const e = new pc.Entity('MekouPlayer');
        e.addComponent('script');

        e.script?.create(Player.MODES.DEV);
        e.script?.create(Player.MODES.FPS);
        e.script?.create(Player.MODES.TPS);

        // Camera Structure
        const cameraPivot = new pc.Entity('CameraPivot');
        const camera = new pc.Entity('Camera');
        camera.addComponent('camera');
        cameraPivot.addChild(camera);
        e.addChild(cameraPivot);

        e.addComponent('collision', { type: 'capsule', radius: 0.5, height: 2 });
        e.addComponent('rigidbody', {
            type: 'dynamic',
            mass: 1,
            angularFactor: pc.Vec3.ZERO
        });

        e.setLocalPosition(0, 2, 0);
        e.setLocalEulerAngles(0, 0, 0);

        this.app.root.addChild(e);
        this.switchController('DEV');

        return e;
    }
}