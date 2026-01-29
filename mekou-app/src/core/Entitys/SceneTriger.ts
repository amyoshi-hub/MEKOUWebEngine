
import * as pc from 'playcanvas';
import { MekouApp } from '../MekouApp';

/**
 * Scene Trigger Component
 * Transition to another scene when an entity (usually player) enters.
 */
export class SceneTriger {
    static register(app: pc.AppBase) {
        const SceneTrigger = pc.createScript('sceneTrigger') as any;

        SceneTrigger.attributes.add('targetScene', {
            type: 'string',
            title: 'Target Scene Path',
            placeholder: 'public/Templete/SceneList.json'
        });

        SceneTrigger.attributes.add('triggerTag', {
            type: 'string',
            title: 'Trigger Tag',
            default: 'player'
        });

        SceneTrigger.prototype.initialize = function () {
            this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
        };

        SceneTrigger.prototype.onTriggerEnter = function (entity: pc.Entity) {
            // Check if it's the player or has the correct tag
            if (entity.name === 'MekouPlayer' || (entity.tags && entity.tags.has(this.triggerTag))) {
                console.log(`SCENE TRIGGER: Transitioning to ${this.targetScene}`);
                const mekou = (app as any).mekou as MekouApp;
                if (mekou) {
                    // We need a way to load the scene. 
                    // For now, let's assume we use the engine's loader or MekouApp's method.
                    const Engine = (window as any).Engine;
                    if (Engine) {
                        // Assuming targetScene is a relative path to JSON
                        mekou.app.root.children.forEach(c => {
                            if (c.name !== 'MekouPlayer') c.destroy();
                        });

                        // We need to re-initialize or use SceneLoader
                        // This might need more logic in SceneManager but let's keep it simple.
                        fetch(this.targetScene)
                            .then(res => res.json())
                            .then(data => {
                                // Basic load logic
                                console.log("New Scene Data Loaded:", data);
                                // This is a placeholder, actual implementation should use SceneLoader
                            });
                    }
                }
            }
        };
    }
}
