
import * as pc from 'playcanvas';
import { MekouApp } from '../../../../core/MekouApp';

export class ProjectSetting {
    private mekou: MekouApp;
    public controlType: 'fly' | 'fps' | 'tps' = 'fly';
    public flySpeed: number = 10;
    public language: string = 'en';
    public sceneList: string[] = ['Templete/SceneList.json'];

    constructor(mekou: MekouApp) {
        this.mekou = mekou;
    }

    public async init() {
        // Load SSAO script if not already loaded
        await this.loadSSAOScript();
    }

    private async loadSSAOScript() {
        return new Promise<void>((resolve) => {
            if ((window as any).ssaoLoaded) { resolve(); return; }
            const s = document.createElement('script');
            s.src = './lib/posteffects/ssao.js';
            s.onload = () => {
                (window as any).ssaoLoaded = true;
                resolve();
            };
            document.head.appendChild(s);
        });
    }

    public setFog(type: string, density: number = 0.01) {
        const scene = this.mekou.app.scene as any;
        scene.fog = type;
        if (type !== pc.FOG_NONE) {
            scene.fogDensity = density;
        }
    }

    public setControlType(type: 'fly' | 'fps' | 'tps') {
        this.controlType = type;
        console.log('Control type set to:', type);
    }

    public setFlySpeed(speed: number) {
        this.flySpeed = speed;
    }

    public updateAO(settings: any) {
        const cameraEntity = this.mekou.app.root.findByName('Camera') as any;
        if (cameraEntity && cameraEntity.script && cameraEntity.script.ssao) {
            Object.assign(cameraEntity.script.ssao, settings);
        }
    }

    public setAO(enabled: boolean) {
        console.log('AO toggled:', enabled);
        const cameraEntity = this.mekou.app.root.findByName('Camera') as any;
        if (!cameraEntity || !cameraEntity.camera) return;

        if (enabled) {
            if (!cameraEntity.script) cameraEntity.addComponent('script');
            if (!cameraEntity.script.ssao) {
                cameraEntity.script.create('ssao', {
                    attributes: {
                        radius: 4,
                        intensity: 1,
                        samples: 16
                    }
                });
            } else {
                cameraEntity.script.ssao.enabled = true;
            }
        } else {
            if (cameraEntity.script && cameraEntity.script.ssao) {
                cameraEntity.script.ssao.enabled = false;
            }
        }
    }

    public setLanguage(lang: string) {
        this.language = lang;
    }

    public addScene(path: string) {
        if (!this.sceneList.includes(path)) {
            this.sceneList.push(path);
        }
    }

    public removeScene(path: string) {
        this.sceneList = this.sceneList.filter(s => s !== path);
    }

    public exportRustBuild() {
        const sceneData = this.getSceneData();
        const msg = { type: 'exportPackage', data: sceneData };

        if ((window as any).ipcRenderer) {
            (window as any).ipcRenderer.send('messagePackage', msg);
            console.log("Exported to Rust/Tauri");
        } else {
            console.warn("ipcRenderer not found. Falling back to JSON download.");
            this.downloadJSON(sceneData, 'scene_rust.json');
        }
    }

    public exportWebBuild() {
        const sceneData = this.getSceneData();
        console.log("Exporting for Web...");
        // For a true "Web Build", we'd bundle the app. 
        // For now, we'll download a structured "web_build.package" (JSON).
        this.downloadJSON(sceneData, 'scene_web.json');
    }

    private getSceneData() {
        return this.mekou.app.root.children
            .filter(c => c.name !== 'EditorCamera' && c.name !== 'TransformGizmo')
            .map((c: any) => ({
                name: c.name,
                pos: `${c.getLocalPosition().x},${c.getLocalPosition().y},${c.getLocalPosition().z}`,
                rot: `${c.getLocalEulerAngles().x},${c.getLocalEulerAngles().y},${c.getLocalEulerAngles().z}`,
                scale: `${c.getLocalScale().x},${c.getLocalScale().y},${c.getLocalScale().z}`,
                components: this.getComponentData(c)
            }));
    }

    private getComponentData(entity: pc.Entity) {
        const data: any = {};
        if (entity.render) data.render = { type: entity.render.type };
        if (entity.light) data.light = { type: entity.light.type, color: `${entity.light.color.r},${entity.light.color.g},${entity.light.color.b}` };
        if (entity.collision) data.collision = { type: entity.collision.type };
        if (entity.rigidbody) data.rigidbody = { type: entity.rigidbody.type, mass: entity.rigidbody.mass };
        // ... add more as needed
        return data;
    }

    private downloadJSON(data: any, filename: string) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}