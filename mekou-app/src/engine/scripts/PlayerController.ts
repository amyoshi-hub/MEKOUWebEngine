
import * as pc from 'playcanvas';

export class PlayerController {
    static register(app: pc.AppBase) {
        // --- Helper: Get Input ---
        const getInput = () => (app as any).mekou?.input;

        // --- DEV CONTROLLER (Fly Mode) ---
        const DevController = pc.createScript('devController') as any;
        DevController.prototype.initialize = function () {
            this.speed = 10;
            this.eulers = new pc.Vec3();
            if (app.mouse) app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        };
        DevController.prototype.update = function (dt: number) {
            const input = getInput();
            if (!input) return;

            const speed = this.speed * dt;
            if (input.isActionPressed('FORWARD')) this.entity.translateLocal(0, 0, -speed);
            if (input.isActionPressed('BACK')) this.entity.translateLocal(0, 0, speed);
            if (input.isActionPressed('LEFT')) this.entity.translateLocal(-speed, 0, 0);
            if (input.isActionPressed('RIGHT')) this.entity.translateLocal(speed, 0, 0);

            // Vertical movement for DEV mode
            if (app.keyboard?.isPressed(pc.KEY_SPACE)) this.entity.translateLocal(0, speed, 0);
            if (app.keyboard?.isPressed(pc.KEY_SHIFT)) this.entity.translateLocal(0, -speed, 0);
        };
        DevController.prototype.onMouseMove = function (e: pc.MouseEvent) {
            if (pc.Mouse.isPointerLocked()) {
                this.eulers.y -= e.dx * 0.1;
                this.eulers.x -= e.dy * 0.1;
                this.entity.setLocalEulerAngles(this.eulers.x, this.eulers.y, 0);
            }
        };

        // --- FPS CONTROLLER ---
        const FPSController = pc.createScript('fpsController') as any;
        FPSController.prototype.initialize = function () {
            this.speed = 1000;
            this.eulers = new pc.Vec3();
            if (app.mouse) app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        };
        FPSController.prototype.update = function (dt: number) {
            const input = getInput();
            if (!input || !this.entity.rigidbody) return;

            const force = new pc.Vec3();
            const forward = this.entity.forward.clone();
            const right = this.entity.right.clone();
            forward.y = 0; right.y = 0;
            forward.normalize(); right.normalize();

            if (input.isActionPressed('FORWARD')) force.add(forward);
            if (input.isActionPressed('BACK')) force.sub(forward);
            if (input.isActionPressed('LEFT')) force.sub(right);
            if (input.isActionPressed('RIGHT')) force.add(right);

            if (force.lengthSq() > 0) {
                force.normalize().mulScalar(this.speed * dt);
                this.entity.rigidbody.applyForce(force);
            }
        };
        FPSController.prototype.onMouseMove = function (e: pc.MouseEvent) {
            if (pc.Mouse.isPointerLocked()) {
                this.eulers.y -= e.dx * 0.1;
                this.eulers.x -= e.dy * 0.1;
                this.eulers.x = pc.math.clamp(this.eulers.x, -85, 85);
                this.entity.setLocalEulerAngles(0, this.eulers.y, 0);
                const cam = this.entity.findByName('Camera');
                if (cam) cam.setLocalEulerAngles(this.eulers.x, 0, 0);
            }
        };

        // --- TPS CONTROLLER ---
        const TPSController = pc.createScript('tpsController') as any;
        TPSController.prototype.initialize = function () {
            this.speed = 1000;
            this.eulers = new pc.Vec3();
            if (app.mouse) app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        };
        TPSController.prototype.update = function (dt: number) {
            const input = getInput();
            if (!input || !this.entity.rigidbody) return;

            const force = new pc.Vec3();
            const forward = this.entity.forward.clone();
            const right = this.entity.right.clone();
            forward.y = 0; right.y = 0;
            forward.normalize(); right.normalize();

            if (input.isActionPressed('FORWARD')) force.add(forward);
            if (input.isActionPressed('BACK')) force.sub(forward);
            if (input.isActionPressed('LEFT')) force.sub(right);
            if (input.isActionPressed('RIGHT')) force.add(right);

            if (force.lengthSq() > 0) {
                force.normalize().mulScalar(this.speed * dt);
                this.entity.rigidbody.applyForce(force);
            }
        };
        TPSController.prototype.onMouseMove = function (e: pc.MouseEvent) {
            if (pc.Mouse.isPointerLocked()) {
                this.eulers.y -= e.dx * 0.1;
                this.eulers.x -= e.dy * 0.1;
                this.eulers.x = pc.math.clamp(this.eulers.x, -85, 85);
                this.entity.setLocalEulerAngles(0, this.eulers.y, 0);
                const pivot = this.entity.findByName('CameraPivot');
                if (pivot) pivot.setLocalEulerAngles(this.eulers.x, 0, 0);
            }
        };

        // --- VEHICLE CONTROLLER ---
        const VehicleController = pc.createScript('vehicleController') as any;
        VehicleController.prototype.initialize = function () {
            this.speed = 1000;
            this.turnSpeed = 200;
            this.steering = 0;
        };
        VehicleController.prototype.update = function (dt: number) {
            const input = getInput();
            if (!input || !this.entity.rigidbody) return;

            const speed = this.speed || 1000;
            const turnSpeed = this.turnSpeed || 200;
            const forward = this.entity.forward;

            // Acceleration / Braking
            if (input.isActionPressed('FORWARD')) {
                this.entity.rigidbody.applyForce(forward.clone().mulScalar(speed * dt));
            }
            if (input.isActionPressed('BACK')) {
                this.entity.rigidbody.applyForce(forward.clone().mulScalar(-speed * 0.5 * dt));
            }

            // Steering
            if (input.isActionPressed('LEFT')) {
                this.entity.rigidbody.applyTorque(0, turnSpeed * dt, 0);
            }
            if (input.isActionPressed('RIGHT')) {
                this.entity.rigidbody.applyTorque(0, -turnSpeed * dt, 0);
            }

            // Simple drag to simulate friction if not pressing anything
            if (!input.isActionPressed('FORWARD') && !input.isActionPressed('BACK')) {
                const vel = this.entity.rigidbody.linearVelocity;
                this.entity.rigidbody.linearVelocity = vel.mulScalar(0.99);
            }
        };
    }
}
