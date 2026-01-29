
import { Container, Panel, Label, TextInput, BooleanInput } from '@playcanvas/pcui';
import * as pc from 'playcanvas';
import { jsx } from '../../../jsx';
import { Material } from './Material/Material';
import { CustomSlider, CustomVectorInput, NativeSlider, NativeToggle } from '../elements/CustomInputs';

/**
 * Utility to create an attribute row (Label + Input)
 */
export function createAttribute(label: string, component: any) {
    const container = jsx(Container, { class: 'attribute-item' });
    container.append(jsx(Label, { text: label, class: 'attribute-label' }));
    container.append(component);
    return container;
}

/**
 * Draws the base Entity info (Name, Active) and Transform
 */
export function drawEntityBase(entity: pc.Entity) {
    const root = jsx(Container, { class: 'inspector-section' });

    // Entity Info
    const nameInput = jsx(TextInput, { value: entity.name });
    nameInput.on('change', (val: string) => entity.name = val);

    const enabledInput = jsx(BooleanInput, { value: entity.enabled });
    enabledInput.on('change', (val: boolean) => entity.enabled = val);

    const infoRow = jsx(Container, { flex: true, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 4 });
    infoRow.append(nameInput);
    infoRow.append(enabledInput);
    root.append(infoRow);

    // Transform Panel
    const transformPanel = jsx(Panel, { headerText: 'TRANSFORM', class: 'component-panel', collapsible: true });

    const pos = entity.getLocalPosition();
    const posInput = new CustomVectorInput({ value: [pos.x, pos.y, pos.z], dimensions: 3 });
    posInput.onChange = (val: number[]) => entity.setLocalPosition(val[0], val[1], val[2]);
    transformPanel.append(createAttribute('Position', posInput));

    const sca = entity.getLocalScale();
    const scaInput = new CustomVectorInput({ value: [sca.x, sca.y, sca.z], dimensions: 3 });
    scaInput.onChange = (val: number[]) => entity.setLocalScale(val[0], val[1], val[2]);
    transformPanel.append(createAttribute('Scale', scaInput));

    const rot = entity.getLocalEulerAngles();
    const rotInput = new CustomVectorInput({ value: [rot.x, rot.y, rot.z], dimensions: 3, precision: 1 });
    rotInput.onChange = (val: number[]) => entity.setLocalEulerAngles(val[0], val[1], val[2]);
    transformPanel.append(createAttribute('Rotation', rotInput));

    root.append(transformPanel);
    return root;
}

/**
 * Draws Physics components (RigidBody, Collision)
 */
export function drawPhysics(entity: pc.Entity) {
    const physicsPanel = jsx(Panel, { headerText: 'PHYSICS', class: 'component-panel', collapsible: true });

    const rbToggle = jsx(BooleanInput, { value: !!entity.rigidbody });
    const massContainer = jsx(Container, { hidden: !entity.rigidbody });
    rbToggle.on('change', (val: boolean) => {
        if (val) {
            if (!entity.rigidbody) entity.addComponent('rigidbody', { type: 'dynamic' });
            massContainer.hidden = false;
        } else {
            if (entity.rigidbody) entity.removeComponent('rigidbody');
            massContainer.hidden = true;
        }
    });
    physicsPanel.append(createAttribute('Enabled', rbToggle));

    const massInput = new CustomSlider({
        value: entity.rigidbody?.mass || 1,
        min: 0, max: 100, precision: 1
    });

    massInput.onChange = (val: number) => {
        if (entity.rigidbody) entity.rigidbody.mass = val;
    };
    massContainer.append(createAttribute('Mass (kg)', massInput));
    physicsPanel.append(massContainer);
    return physicsPanel;
}

export function drawCollision(entity: pc.Entity) {
    const hasCollision = !!entity.collision;
    const colPanel = jsx(Panel, { headerText: 'COLLISION', class: 'component-panel', collapsible: true });
    const colToggle = jsx(BooleanInput, { value: hasCollision });
    colToggle.on('change', (val: boolean) => {
        if (val && !entity.collision) {
            entity.addComponent('collision', { type: 'box' });
        } else if (!val && entity.collision) {
            entity.removeComponent('collision');
        }
    });
    colPanel.append(createAttribute('Enabled', colToggle));
    return colPanel;
}

/**
 * Draws the Light component
 */
export function drawLight(entity: pc.Entity) {
    if (!entity.light) return null;
    const lightPanel = jsx(Panel, { headerText: 'LIGHT', class: 'component-panel', collapsible: true });

    const colorInput = jsx(TextInput, { value: '#' + entity.light.color.toString(true) });
    colorInput.on('change', (val: string) => {
        if (!entity.light) return;
        const c = new pc.Color();
        if (c.fromString(val)) entity.light.color = c;
    });
    lightPanel.append(createAttribute('Color', colorInput));

    const intensityInput = new CustomSlider({ value: entity.light.intensity, min: 0, max: 10, precision: 1 });
    intensityInput.onChange = (val: number) => { if (entity.light) entity.light.intensity = val; };
    lightPanel.append(createAttribute('Intensity', intensityInput));

    return lightPanel;
}

/**
 * Draws the Camera component
 */
export function drawCamera(entity: pc.Entity) {
    if (!entity.camera) return null;
    const cameraPanel = jsx(Panel, { headerText: 'CAMERA', class: 'component-panel', collapsible: true });

    const fovInput = new CustomSlider({ value: entity.camera.fov, min: 30, max: 120, precision: 1 });
    fovInput.onChange = (val: number) => { if (entity.camera) entity.camera.fov = val; };
    cameraPanel.append(createAttribute('FOV', fovInput));

    return cameraPanel;
}

/**
 * Draws UI Element components
 */
export function drawElement(entity: pc.Entity) {
    if (!entity.element) return null;
    const elementPanel = jsx(Panel, { headerText: 'UI ELEMENT', class: 'component-panel', collapsible: true });

    if (entity.element.type === 'text') {
        const textInput = jsx(TextInput, { value: entity.element.text });
        textInput.on('change', (val: string) => { if (entity.element) entity.element.text = val; });
        elementPanel.append(createAttribute('Text Content', textInput));
    }

    const widthInput = new CustomSlider({ value: entity.element.width, min: 0, max: 100000, precision: 1 });
    widthInput.onChange = (val: number) => { if (entity.element) entity.element.width = val; };
    elementPanel.append(createAttribute('Width', widthInput));

    const heightInput = new CustomSlider({ value: entity.element.height, min: 0, max: 1000, precision: 1 });
    heightInput.onChange = (val: number) => { if (entity.element) entity.element.height = val; };
    elementPanel.append(createAttribute('Height', heightInput));

    return elementPanel;
}

/**
 * Draws Material settings
 */
export function drawMaterial(entity: pc.Entity) {
    return Material.drawMaterial(entity);
}

/**
 * Draws the SceneTrigger component
 */
export function drawSceneTrigger(entity: pc.Entity) {
    const scripts = entity.script;
    if (!scripts || !scripts.has('sceneTrigger')) return null;
    const script = scripts.get('sceneTrigger') as any;

    const triggerPanel = jsx(Panel, { headerText: 'SCENE TRIGGER', class: 'component-panel', collapsible: true });

    const targetInput = jsx(TextInput, { value: script.targetScene || '' });
    targetInput.on('change', (val: string) => script.targetScene = val);
    triggerPanel.append(createAttribute('Target Scene', targetInput));

    const tagInput = jsx(TextInput, { value: script.triggerTag || 'player' });
    tagInput.on('change', (val: string) => script.triggerTag = val);
    triggerPanel.append(createAttribute('Trigger Tag', tagInput));

    return triggerPanel;
}

/**
 * Draws the Render component
 */
export function drawRender(entity: pc.Entity) {
    if (!entity.render) return null;
    const renderPanel = jsx(Panel, { headerText: 'RENDER', class: 'component-panel', collapsible: true });

    const render = entity.render; // Assuming entity.render is the component

    const modelUrl = jsx(TextInput, { value: (render as any).asset || '' });
    modelUrl.on('change', (val: string) => {
        console.log("Loading model from:", val);
        // In a real app, this would load the asset
        // this.mekou.loadAsset(val, 'model', (asset) => render.asset = asset);
    });
    renderPanel.append(createAttribute('Model URL', modelUrl));

    return renderPanel;
}

/**
 * Draws PostEffect settings if on entity
 */
export function drawPostEffect(entity: pc.Entity) {
    const scripts = entity.script;
    if (!scripts || !scripts.has('ssao')) return null;
    const ssao = scripts.get('ssao') as any;

    const postPanel = jsx(Panel, { headerText: 'POST EFFECT (SSAO)', class: 'component-panel', collapsible: true });

    const radiusInput = new CustomSlider({ value: ssao.radius, min: 0, max: 20, precision: 1 });
    radiusInput.onChange = (val: number) => ssao.radius = val;
    postPanel.append(createAttribute('Radius', radiusInput));

    const intensityInput = new CustomSlider({ value: ssao.intensity, min: 0, max: 5, precision: 1 });
    intensityInput.onChange = (val: number) => ssao.intensity = val;
    postPanel.append(createAttribute('Intensity', intensityInput));

    return postPanel;
}

/**
 * Draws the SimpleAI component
 */
export function drawSimpleAI(entity: pc.Entity) {
    const scripts = entity.script;
    if (!scripts || !scripts.has('simpleAI')) return null;
    const ai = scripts.get('simpleAI') as any;

    const aiPanel = jsx(Panel, { headerText: 'AI (SIMPLE)', class: 'component-panel', collapsible: true });

    // Mode selection
    const modeSelect = jsx(TextInput, { value: ai.mode });
    modeSelect.on('change', (val: string) => ai.mode = val);
    aiPanel.append(createAttribute('Mode (follow/flee)', modeSelect));

    const speedSlider = new CustomSlider({ value: ai.speed, min: 0, max: 20, precision: 1 });
    speedSlider.onChange = (val: number) => ai.speed = val;
    aiPanel.append(createAttribute('Speed', speedSlider));

    const stopSlider = new CustomSlider({ value: ai.stopDistance, min: 0, max: 10, precision: 1 });
    stopSlider.onChange = (val: number) => ai.stopDistance = val;
    aiPanel.append(createAttribute('Stop Distance', stopSlider));

    return aiPanel;
}

/**
 * Draws the SoundSystem component
 */
export function drawSoundSystem(entity: pc.Entity) {
    const scripts = entity.script;
    if (!scripts || !scripts.has('soundSystem')) return null;
    const sound = scripts.get('soundSystem') as any;

    const soundPanel = jsx(Panel, { headerText: 'SOUND SYSTEM', class: 'component-panel', collapsible: true });

    const volumeSlider = new CustomSlider({ value: sound.volume, min: 0, max: 1, precision: 2 });
    volumeSlider.onChange = (val: number) => sound.volume = val;
    soundPanel.append(createAttribute('Volume', volumeSlider));

    return soundPanel;
}

/**
 * Draws Vehicle settings if present
 */
export function drawVehicleController(entity: pc.Entity) {
    const scripts = entity.script;
    if (!scripts || !scripts.has('vehicleController')) return null;
    const v = scripts.get('vehicleController') as any;

    const vPanel = jsx(Panel, { headerText: 'VEHICLE SETTINGS', class: 'component-panel', collapsible: true });

    const speedSlider = new CustomSlider({ value: v.speed || 1000, min: 0, max: 5000, precision: 0 });
    speedSlider.onChange = (val: number) => v.speed = val;
    vPanel.append(createAttribute('Engine Power', speedSlider));

    const turnSlider = new CustomSlider({ value: v.turnSpeed || 200, min: 0, max: 1000, precision: 0 });
    turnSlider.onChange = (val: number) => v.turnSpeed = val;
    vPanel.append(createAttribute('Steering Power', turnSlider));

    if (entity.rigidbody) {
        const rb = entity.rigidbody;
        const massSlider = new CustomSlider({ value: rb.mass, min: 0.1, max: 5000, precision: 1 });
        massSlider.onChange = (val: number) => rb.mass = val;
        vPanel.append(createAttribute('Mass (kg)', massSlider));

        const brakeSlider = new CustomSlider({ value: v.brakeForce || 10, min: 0, max: 100, precision: 1 });
        brakeSlider.onChange = (val: number) => v.brakeForce = val;
        vPanel.append(createAttribute('Brake Power', brakeSlider));

        const frictionSlider = new CustomSlider({ value: rb.friction, min: 0, max: 2, precision: 2 });
        frictionSlider.onChange = (val: number) => rb.friction = val;
        vPanel.append(createAttribute('Friction', frictionSlider));
    }

    return vPanel;
}

/**
 * Draws the SimpleLOD component
 */
export function drawSimpleLOD(entity: pc.Entity) {
    const scripts = entity.script;
    if (!scripts || !scripts.has('simpleLOD')) return null;
    const lod = scripts.get('simpleLOD') as any;

    const lodPanel = jsx(Panel, { headerText: 'LOD (SIMPLE)', class: 'component-panel', collapsible: true });

    const thresholdSlider = new CustomSlider({ value: lod.threshold, min: 1, max: 200, precision: 0 });
    thresholdSlider.onChange = (val: number) => lod.threshold = val;
    lodPanel.append(createAttribute('Distance Threshold', thresholdSlider));

    return lodPanel;
}
