
import * as pc from 'playcanvas';
import { ObjectCreator } from '../editor/helpers/ObjectCreator';
import { InputManager } from './Input/InputManager';
import { Player } from '../editor/Player';

export class MekouApp {
    public app!: pc.AppBase;
    public input!: InputManager;
    public player!: Player;
    public canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    public async init() {
        // 0. Initialize Physics (Ammo)
        await this.initAmmo();

        // 1. Graphics Device
        const device = await pc.createGraphicsDevice(this.canvas, { deviceTypes: ['webgl2'] });

        // 2. App Options
        const createOptions = new pc.AppOptions();
        createOptions.graphicsDevice = device;
        createOptions.keyboard = new pc.Keyboard(window);
        createOptions.mouse = new pc.Mouse(this.canvas);
        createOptions.gamepads = new pc.GamePads();
        createOptions.touch = new pc.TouchDevice(this.canvas);
        createOptions.elementInput = new pc.ElementInput(this.canvas);

        createOptions.componentSystems = [
            pc.RenderComponentSystem,
            pc.CameraComponentSystem,
            pc.LightComponentSystem,
            pc.ScriptComponentSystem,
            pc.CollisionComponentSystem,
            pc.RigidBodyComponentSystem,
            pc.ElementComponentSystem
        ];

        createOptions.resourceHandlers = [
            pc.TextureHandler, pc.ContainerHandler, pc.ScriptHandler, pc.JsonHandler, pc.FontHandler
        ];

        this.app = new pc.AppBase(this.canvas);
        (this.app as any).mekou = this;
        this.app.init(createOptions);
        this.app.start();

        // 2.5 Input Manager
        this.input = new InputManager(this.app);

        // 3. Physics Setup
        this.app.systems.rigidbody!.gravity.set(0, -9.81, 0);

        // 4. Scene Setup (Default Floor)
        const light = new pc.Entity('SkyLight');
        light.addComponent('light', {
            type: 'directional',
            castShadows: true,
            shadowBias: 0.2,
            normalOffsetBias: 0.05,
            shadowType: pc.SHADOW_PCF3,
            shadowResolution: 1024
        });
        light.setLocalEulerAngles(45, 30, 0);
        this.app.root.addChild(light);

        const floor = new pc.Entity('Floor');
        floor.addComponent('render', { type: 'box' });
        floor.addComponent('collision', { type: 'box', halfExtents: new pc.Vec3(50, 0.5, 50) });
        floor.addComponent('rigidbody', { type: 'static', friction: 0.5 });
        floor.setLocalScale(100, 1, 100);
        floor.setLocalPosition(0, -0.5, 0);
        this.app.root.addChild(floor);

        // 5. Editor Camera (Persistent)
        const editorCam = new pc.Entity('EditorCamera');
        editorCam.addComponent('camera', {
            clearColor: new pc.Color(0.1, 0.1, 0.12)
        });
        editorCam.setLocalPosition(0, 5, 15);
        editorCam.setLocalEulerAngles(-15, 0, 0);
        this.app.root.addChild(editorCam);

        // Register Scripts
        ObjectCreator.setApp(this.app);
        ObjectCreator.registerScripts();

        // Handle Resize
        window.addEventListener('resize', () => this.onResize());
        this.onResize();
    }

    public setupPlayer() {
        this.player = new Player(this.app);
        console.log("Player initialized on entity:", this.player.entity.name);
    }

    private async initAmmo() {
        if (typeof (window as any).Ammo !== 'undefined') return;

        return new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.src = './lib/ammo/ammo.wasm.js';
            script.onload = () => {
                (window as any).Ammo().then((lib: any) => {
                    (window as any).Ammo = lib;
                    resolve();
                });
            };
            document.head.appendChild(script);
        });
    }

    private onResize() {
        this.app.resizeCanvas();
    }
}
