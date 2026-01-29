
import * as pc from 'playcanvas';

export class InputManager {
    private app: pc.AppBase;
    private gamepads: pc.GamePads;
    private touchJoystick: pc.Vec2 = new pc.Vec2;
    private bindings: Map<string, number> = new Map();

    constructor(app: pc.AppBase) {
        this.app = app;
        this.gamepads = new pc.GamePads();

        if (this.app.touch) {
            this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
            this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
            this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        }

        // Default Bindings
        this.bindings.set('FORWARD', pc.KEY_W);
        this.bindings.set('BACK', pc.KEY_S);
        this.bindings.set('LEFT', pc.KEY_A);
        this.bindings.set('RIGHT', pc.KEY_D);
        this.bindings.set('UP', pc.KEY_E);
        this.bindings.set('DOWN', pc.KEY_Q);

        // Register update loop
        this.app.on('update', () => this.update());
    }

    private update() {
        this.gamepads.update();
    }

    private onTouchStart(e: pc.TouchEvent) {
        if (e.touches.length > 0) {
            // const touch = e.touches[0];
            // Initial joystick logic could go here
        }
    }

    private onTouchMove(e: pc.TouchEvent) {
        if (e.touches.length > 0) {
            // const touch = e.touches[0];
            // Update touchJoystick Vec2 based on delta from start
        }
    }

    private onTouchEnd(_e: pc.TouchEvent) {
        this.touchJoystick.set(0, 0);
    }

    private checkHardwareInput(_action: string): boolean {
        // Placeholder for hardware-specific checks (e.g. specialized controllers)
        return false;
    }

    public isActionPressed(action: string): boolean {
        const key = this.bindings.get(action);
        if (key !== undefined && this.app.keyboard?.isPressed(key)) return true;

        // Map common actions to gamepad
        if (action === 'FORWARD' && (this.isPressed(pc.PAD_UP) || this.getAxis(pc.PAD_L_STICK_Y) < -0.5)) return true;
        if (action === 'BACK' && (this.isPressed(pc.PAD_DOWN) || this.getAxis(pc.PAD_L_STICK_Y) > 0.5)) return true;
        if (action === 'LEFT' && (this.isPressed(pc.PAD_LEFT) || this.getAxis(pc.PAD_L_STICK_X) < -0.5)) return true;
        if (action === 'RIGHT' && (this.isPressed(pc.PAD_RIGHT) || this.getAxis(pc.PAD_L_STICK_X) > 0.5)) return true;

        if (this.checkHardwareInput(action)) return true;

        if (action === 'FORWARD' && this.touchJoystick.y < -0.5) return true;
        if (action === 'BACK' && this.touchJoystick.y > 0.5) return true;

        return false;
    }

    public setBinding(action: string, key: number) {
        this.bindings.set(action, key);
    }

    public getBinding(action: string): number | undefined {
        return this.bindings.get(action);
    }

    public isPressed(button: number, padIndex: number = pc.PAD_1): boolean {
        return this.gamepads.isPressed(padIndex, button);
    }

    public wasPressed(button: number, padIndex: number = pc.PAD_1): boolean {
        return this.gamepads.wasPressed(padIndex, button);
    }

    public getAxis(axis: number, padIndex: number = pc.PAD_1): number {
        return (this.gamepads as any).getAxis(padIndex, axis);
    }
}
