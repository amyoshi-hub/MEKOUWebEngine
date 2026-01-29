import * as pc from 'playcanvas';

export class MobileJoystick {
    private base: HTMLElement;
    private stick: HTMLElement;
    private app: pc.AppBase;
    private side: 'left' | 'right';
    private baseSize: number;

    constructor(app: pc.AppBase, side: 'left' | 'right', baseSize = 100, stickSize = 60) {
        this.app = app;
        this.side = side;
        this.baseSize = baseSize;

        this.base = document.createElement('div');
        Object.assign(this.base.style, {
            position: 'absolute',
            bottom: '40px',
            [side]: '40px',
            width: `${baseSize}px`,
            height: `${baseSize}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            zIndex: '1000',
            touchAction: 'none'
        });

        this.stick = document.createElement('div');
        Object.assign(this.stick.style, {
            position: 'absolute',
            width: `${stickSize}px`,
            height: `${stickSize}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
        });

        this.base.appendChild(this.stick);
        document.body.appendChild(this.base);

        this.initEvents();
    }

    private initEvents() {
        let identifier: number | null = null;

        const onStart = (e: TouchEvent) => {
            if (identifier !== null) return;
            const touch = e.changedTouches[0];
            identifier = touch.identifier;
            this.handleMove(touch.clientX, touch.clientY);
        };

        const onMove = (e: TouchEvent) => {
            if (identifier === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === identifier) {
                    this.handleMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                    break;
                }
            }
        };

        const onEnd = (e: TouchEvent) => {
            if (identifier === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === identifier) {
                    identifier = null;
                    this.resetStick();
                    break;
                }
            }
        };

        this.base.addEventListener('touchstart', onStart);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    }

    private handleMove(x: number, y: number) {
        const rect = this.base.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = this.baseSize / 2;

        const angle = Math.atan2(dy, dx);
        const limitedDist = Math.min(dist, maxDist);

        const moveX = Math.cos(angle) * limitedDist;
        const moveY = Math.sin(angle) * limitedDist;

        this.stick.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

        // Normalize axes -1 to 1
        const axisX = moveX / maxDist;
        const axisY = moveY / maxDist;

        this.app.fire(`joystick:${this.side}`, axisX, axisY);
    }

    private resetStick() {
        this.stick.style.transform = 'translate(-50%, -50%)';
        this.app.fire(`joystick:${this.side}`, 0, 0);
    }
}
