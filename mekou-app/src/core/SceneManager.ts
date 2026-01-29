
import * as pc from 'playcanvas';

export interface SceneConfig {
    name: string;
    setup: (app: pc.AppBase) => void;
}

export class SceneManager {
    private static app: pc.AppBase;
    private static scenes: Map<string, SceneConfig> = new Map();
    private static currentSceneName: string = '';

    static init(app: pc.AppBase) {
        this.app = app;
    }

    static registerScene(config: SceneConfig) {
        this.scenes.set(config.name, config);
    }

    static async loadScene(name: string) {
        if (!this.app || !this.scenes.has(name)) return;

        console.log(`Switching to scene: ${name}`);

        // 1. Clear current scene
        const root = this.app.root;
        while (root.children.length > 0) {
            root.children[0].destroy();
        }

        // 2. Setup new scene
        const config = this.scenes.get(name)!;
        config.setup(this.app);
        this.currentSceneName = name;
    }

    static getCurrentScene() {
        return this.currentSceneName;
    }

    static getAvailableScenes() {
        return Array.from(this.scenes.keys());
    }
}
