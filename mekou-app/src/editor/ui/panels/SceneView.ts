
import { Container, Label } from '@playcanvas/pcui';
import * as pc from 'playcanvas';
import { jsx } from '../../../jsx';
import { TransformGizmo } from '../../../engine/scripts/TransformGizmo';
import { ObjectCreator } from '../../helpers/ObjectCreator';

export class SceneView {
    public dom: HTMLElement;
    public container: any;
    public onEntityPicked?: (entity: pc.Entity | null) => void;
    private app?: pc.AppBase;

    private eulerX: number = 0;
    private eulerY: number = 0;

    constructor() {
        this.container = jsx(Container, {
            class: 'scene-view-panel',
            flex: true,
            flexGrow: 1
        });

        const label = jsx(Label, { text: 'Scene View', class: 'scene-view-label' });
        label.dom.style.position = 'absolute';
        label.dom.style.top = '10px';
        label.dom.style.left = '10px';
        label.dom.style.pointerEvents = 'none';
        label.dom.style.opacity = '0.5';

        this.container.append(label);

        this.dom = this.container.dom;
        this.dom.tabIndex = 0;

        // Drag & Drop listeners
        this.dom.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        });

        this.dom.addEventListener('drop', (e) => this.handleDrop(e));
    }

    setApp(app: pc.AppBase) {
        this.app = app;
        this.dom.addEventListener('mousedown', (e: MouseEvent) => this.handlePick(e));

        this.dom.addEventListener('mousedown', () => {
            if (this.app?.timeScale === 0) this.dom.requestPointerLock();
        });

        this.dom.addEventListener('mousemove', (e: MouseEvent) => {
            if (document.pointerLockElement !== this.dom) return;
            const currentApp = this.app;
            if (!currentApp) return;

            // Only rotate editor camera if in pause mode (timeScale === 0)
            if (currentApp.timeScale === 0) {
                const editorCam = currentApp.root.findByName('EditorCamera') as pc.Entity;
                if (!editorCam) return;

                this.eulerY -= e.movementX * 0.1;
                this.eulerX -= e.movementY * 0.1;
                this.eulerX = pc.math.clamp(this.eulerX, -85, 85);
                editorCam.setLocalEulerAngles(this.eulerX, this.eulerY, 0);
            }
        });

        app.on('update', (dt: number) => {
            const pcApp = this.app;
            if (!pcApp || pcApp.timeScale !== 0) return;

            const editorCam = pcApp.root.findByName('EditorCamera') as pc.Entity;
            if (!editorCam) return;

            // Access fly speed from MekouApp instance
            const settings = (pcApp as any).mekou?.mainLayout?.settingsLogic;
            const speed = settings?.flySpeed || 10;
            const actualDt = dt || 0.016;

            if (pcApp.keyboard?.isPressed(pc.KEY_W)) editorCam.translateLocal(0, 0, -speed * actualDt);
            if (pcApp.keyboard?.isPressed(pc.KEY_S)) editorCam.translateLocal(0, 0, speed * actualDt);
            if (pcApp.keyboard?.isPressed(pc.KEY_A)) editorCam.translateLocal(-speed * actualDt, 0, 0);
            if (pcApp.keyboard?.isPressed(pc.KEY_D)) editorCam.translateLocal(speed * actualDt, 0, 0);
            if (pcApp.keyboard?.isPressed(pc.KEY_E)) editorCam.translateLocal(0, speed * actualDt, 0);
            if (pcApp.keyboard?.isPressed(pc.KEY_Q)) editorCam.translateLocal(0, -speed * actualDt, 0);
        });
    }

    private getPickResult(x: number, y: number): pc.Entity | null {
        if (!this.app) return null;
        const editorCam = this.app.root.findByName('EditorCamera') as pc.Entity;
        const camera = editorCam?.camera;
        if (!camera) return null;

        const ray = new pc.Ray();
        camera.screenToWorld(x, y, camera.nearClip, ray.origin);
        camera.screenToWorld(x, y, camera.farClip, ray.direction);
        ray.direction.sub(ray.origin).normalize();

        const end = ray.origin.clone().add(ray.direction.clone().mulScalar(1000));
        const results = this.app.systems.rigidbody?.raycastAll(ray.origin, end);

        if (results && results.length > 0) {
            for (const res of results) {
                if (!res.entity.name.includes('Axis') && res.entity.name !== 'TransformGizmo') {
                    return res.entity;
                }
            }
        }
        return null;
    }

    private handlePick(e: MouseEvent) {
        if (!this.app || this.app.timeScale > 0) return;

        const rect = this.dom.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const selected = this.getPickResult(x, y);

        if (this.onEntityPicked) {
            this.onEntityPicked(selected);
        }

        TransformGizmo.setSelection(selected);
    }

    private handleDrop(e: DragEvent) {
        e.preventDefault();
        const app = this.app;
        if (!app || !e.dataTransfer) return;

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const cameraEntity = app.root.findByName('EditorCamera') as pc.Entity || app.root.findComponent('camera')?.entity;
            const camera = cameraEntity?.camera;
            if (!camera) return;

            const rect = this.dom.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (data.type === 'model' || data.type === 'prefab') {
                let entity;
                if (data.type === 'prefab' && data.data) {
                    entity = ObjectCreator.deserialize(data.data);
                    app.root.addChild(entity);
                } else {
                    entity = ObjectCreator.createBox();
                }

                if (entity) {
                    const rect = this.dom.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // Surface Snap Raycast
                    const ray = new pc.Ray();
                    camera.screenToWorld(x, y, camera.nearClip, ray.origin);
                    camera.screenToWorld(x, y, camera.farClip, ray.direction);
                    ray.direction.sub(ray.origin).normalize();

                    const end = ray.origin.clone().add(ray.direction.clone().mulScalar(1000));
                    const hit = app.systems.rigidbody?.raycastFirst(ray.origin, end);

                    let finalPos = hit ? hit.point : camera.screenToWorld(x, y, 5);
                    const snap = 0.5;

                    entity.setLocalPosition(
                        Math.round(finalPos.x / snap) * snap,
                        Math.round(finalPos.y / snap) * snap,
                        Math.round(finalPos.z / snap) * snap
                    );

                    if (hit) {
                        // Align with surface normal
                        const lookAt = new pc.Vec3().add2(finalPos, hit.normal);
                        entity.lookAt(lookAt);
                        entity.rotateLocal(90, 0, 0); // Correct for box up
                    }
                }
            } else if (data.type === 'material') {
                // Raycast to find entity under mouse
                const picked = this.getPickResult(x, y);
                if (picked && (picked.render || picked.model)) {
                    console.log("Applying material to:", picked.name);
                    // This is a placeholder for material application
                    // Real implementation would load the material asset
                    const mat = new pc.StandardMaterial();
                    mat.diffuse.set(Math.random(), Math.random(), Math.random());
                    mat.update();

                    if (picked.render) {
                        picked.render.meshInstances.forEach(mi => mi.material = mat);
                    } else if (picked.model) {
                        (picked.model as any).meshInstances.forEach((mi: any) => mi.material = mat);
                    }
                }
            }
        } catch (err) {
            console.error("Drop failed:", err);
        }
    }

    public focusEntity(entity: pc.Entity) {
        if (!this.app) return;
        const editorCam = this.app.root.findByName('EditorCamera') as pc.Entity;
        if (!editorCam) return;

        const targetPos = entity.getPosition();
        // Offset the camera a bit so we aren't inside the object
        const offset = new pc.Vec3(5, 5, 5);
        const newPos = targetPos.clone().add(offset);

        editorCam.setPosition(newPos);
        editorCam.lookAt(targetPos);

        // Update the euler angles for the fly-camera logic
        const rot = editorCam.getLocalEulerAngles();
        this.eulerX = rot.x;
        this.eulerY = rot.y;
    }

    attachCanvas(canvas: HTMLElement) {
        this.container.dom.appendChild(canvas);
        canvas.style.outline = 'none';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }
}
