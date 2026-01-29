import * as pc from 'playcanvas';

export class SceneLoader {
    private app: pc.AppBase;

    constructor(app: pc.AppBase) {
        this.app = app;
    }

    public async loadScene(jsonPath: string): Promise<pc.Entity[]> {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`Failed to load scene: ${response.statusText}`);
            const data = await response.json();

            const spawnedEntities: pc.Entity[] = [];
            if (data.entities && Array.isArray(data.entities)) {
                for (const entry of data.entities) {
                    const entity = this.createEntity(entry);
                    this.app.root.addChild(entity);
                    spawnedEntities.push(entity);
                }
            }
            console.log(`Loaded ${spawnedEntities.length} entities from ${jsonPath}`);
            return spawnedEntities;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    private createEntity(data: any): pc.Entity {
        const entity = new pc.Entity(data.name || 'New Entity');

        // Transform
        if (data.transform) {
            const t = data.transform;
            const p = t.pos || t.position;
            if (p) entity.setLocalPosition(p[0], p[1], p[2]);
            const r = t.rot || t.rotation;
            if (r) entity.setLocalEulerAngles(r[0], r[1], r[2]);
            const s = t.scale;
            if (s) entity.setLocalScale(s[0], s[1], s[2]);
        }

        // Components
        if (data.components) {
            for (const [key, config] of Object.entries(data.components)) {
                if (key === 'script') {
                    entity.addComponent('script');
                    const scriptsToLoad = Array.isArray(config) ? config : config.scripts;
                    scriptsToLoad.forEach((s: any) => {
                        const name = typeof s === 'string' ? s : s.name;
                        const scriptInstance = entity.script?.create(name);
                        // attributes（速度設定など）も反映させるならここで行う
                        if (s.attributes && scriptInstance) {
                            Object.assign(scriptInstance, s.attributes);
                        }
                    });
                }
            }
        }

        // Special handling for legacy/shortcut types
        if (data.type === 'box' && !data.components?.render) {
            entity.addComponent('render', { type: 'box' });
        }

        return entity;
    }
}