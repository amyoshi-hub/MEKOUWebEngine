import * as pcEngine from 'playcanvas';

const rootPath = '';
const deviceType = 'webgl2';
const fileImport = (url: string) => import(/* @vite-ignore */ url);

// @config DESCRIPTION <div style='text-align:center'><div>(<b>WASD</b>) Move</div><div>(<b>Space</b>) Jump</div><div>(<b>Mouse</b>) Look</div></div>
const { FirstPersonController } = (await fileImport(`${rootPath}/static/scripts/esm/first-person-controller.mjs`)) as any;

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
if (!canvas) {
    throw new Error('No canvas found');
}
window.focus();

(pcEngine.WasmModule as any).setConfig('Ammo', {
    glueUrl: `${rootPath}/static/lib/ammo/ammo.wasm.js`,
    wasmUrl: `${rootPath}/static/lib/ammo/ammo.wasm.wasm`,
    fallbackUrl: `${rootPath}/static/lib/ammo/ammo.js`
});

await new Promise((resolve) => {
    (pcEngine.WasmModule as any).getInstance('Ammo', () => resolve(true));
});

const gfxOptions = {
    deviceTypes: [deviceType]
};

const assets = {
    map: new pcEngine.Asset('map', 'container', { url: `${rootPath}/static/assets/models/fps-map.glb` }),
    helipad: new pcEngine.Asset(
        'helipad-env-atlas',
        'texture',
        { url: `${rootPath}/static/assets/cubemaps/morning-env-atlas.png` },
        { type: pcEngine.TEXTURETYPE_RGBP, mipmaps: false }
    )
};

const device = await pcEngine.createGraphicsDevice(canvas, gfxOptions);

const createOptions = new pcEngine.AppOptions();
createOptions.graphicsDevice = device;
createOptions.mouse = new pcEngine.Mouse(canvas);
createOptions.touch = new pcEngine.TouchDevice(canvas);
createOptions.gamepads = new pcEngine.GamePads();
createOptions.keyboard = new pcEngine.Keyboard(window);
createOptions.componentSystems = [
    pcEngine.RenderComponentSystem,
    pcEngine.CameraComponentSystem,
    pcEngine.LightComponentSystem,
    pcEngine.ScriptComponentSystem,
    pcEngine.CollisionComponentSystem,
    pcEngine.RigidBodyComponentSystem
];
createOptions.resourceHandlers = [pcEngine.TextureHandler, pcEngine.ContainerHandler, pcEngine.ScriptHandler];

const app = new pcEngine.AppBase(canvas);
app.init(createOptions);

// Set the canvas to fill the window and automatically change resolution to be the same as the canvas size
app.setCanvasFillMode(pcEngine.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pcEngine.RESOLUTION_AUTO);

// Ensure canvas is resized when window changes size
const resize = () => app.resizeCanvas();
window.addEventListener('resize', resize);
app.on('destroy', () => {
    window.removeEventListener('resize', resize);
});

await new Promise((resolve) => {
    new pcEngine.AssetListLoader(Object.values(assets), app.assets).load(resolve);
});

app.start();

// Skybox
app.scene.skyboxMip = 0;
app.scene.exposure = 0.4;
app.scene.skyboxHighlightMultiplier = 50;   // extra brightness for the clipped sun in the skybox to make it bloom more
app.scene.envAtlas = assets.helipad.resource as any;
app.scene.skyboxRotation = new pcEngine.Quat().setFromEulerAngles(0, 10, 0);

// Gravity (increase for more realistic jumping)
(app.systems.rigidbody as any)?.gravity.set(0, -18, 0);

// Camera
const camera = new pcEngine.Entity();
camera.addComponent('camera', {
    farClip: 100,
    fov: 90
});
camera.setLocalPosition(0, 0.5, 0);

// Custom render passes
const cameraFrame = new (pcEngine as any).CameraFrame(app, camera.camera);
cameraFrame.rendering.samples = 4;
cameraFrame.rendering.toneMapping = pcEngine.TONEMAP_ACES2;
if (cameraFrame.bloom) {
    cameraFrame.bloom.enabled = true;
    cameraFrame.bloom.intensity = 0.01;
}
cameraFrame.update();

// Level
const map = (assets.map.resource as any).instantiateRenderEntity();
map.setLocalScale(2, 2, 2);
map.setLocalEulerAngles(-90, 0, 0);
map.findComponents('render').forEach((render: any) => {
    const r = render as pcEngine.RenderComponent;
    const entity = r.entity;
    entity.addComponent('rigidbody', {
        type: 'static'
    });
    entity.addComponent('collision', {
        type: 'mesh',
        renderAsset: r.asset
    });
});
const level = new pcEngine.Entity();
level.addChild(map);
app.root.addChild(level);

// Character controller
const characterController = new pcEngine.Entity('cc');
characterController.setPosition(5, 2, 10);
characterController.addChild(camera);
characterController.addComponent('collision', {
    type: 'capsule',
    radius: 0.5,
    height: 2
});
characterController.addComponent('rigidbody', {
    type: 'dynamic',
    mass: 100,
    linearDamping: 0,
    angularDamping: 0,
    linearFactor: pcEngine.Vec3.ONE,
    angularFactor: pcEngine.Vec3.ZERO,
    friction: 0.5,
    restitution: 0
});
characterController.addComponent('script');
const fpc = (characterController.script as any)?.create(FirstPersonController, {
    properties: {
        camera,
        jumpForce: 850
    }
}) as any;
app.root.addChild(characterController);

/**
 * @param {string} side - The name.
 * @param {number} baseSize - The base size.
 * @param {number} stickSize - The stick size.
 */
const createJoystickUI = (side: string, baseSize: number = 100, stickSize: number = 60) => {
    const base = document.createElement('div');
    Object.assign(base.style, {
        display: 'none',
        position: 'absolute',
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        borderRadius: '50%',
        backgroundColor: 'rgba(50, 50, 50, 0.5)',
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)'
    });

    const stick = document.createElement('div');
    Object.assign(stick.style, {
        display: 'none',
        position: 'absolute',
        width: `${stickSize}px`,
        height: `${stickSize}px`,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
    });

    const show = (el: HTMLElement, size: number, x: number, y: number) => {
        el.style.display = 'block';
        el.style.left = `${x - size * 0.5}px`;
        el.style.top = `${y - size * 0.5}px`;
    };

    const hide = (el: HTMLElement) => {
        el.style.display = 'none';
    };

    app.on(`${fpc?.joystickEventName}:${side}`, (bx: number, by: number, sx: number, sy: number) => {
        if (bx < 0 || by < 0 || sx < 0 || sy < 0) {
            hide(base);
            hide(stick);
            return;
        }

        show(base, baseSize, bx, by);
        show(stick, stickSize, sx, sy);
    });

    document.body.append(base, stick);
};

// Create joystick UI
createJoystickUI('left');
createJoystickUI('right');

export { app };
