import * as pc from 'playcanvas';
import { SceneManager } from '../../core/SceneManager';

export class SceneTrigger {
    static register(_app: pc.AppBase) {
        const Trigger = pc.createScript('sceneTrigger') as any;

        Trigger.attributes.add('targetScene', { type: 'string', default: 'Default' });

        Trigger.prototype.initialize = function () {
            this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
        };

        Trigger.prototype.onTriggerEnter = function (entity: pc.Entity) {
            if (entity.name.includes('Player')) {
                const target = this.targetScene;
                console.log(`Triggered scene switch to: ${target}`);
                SceneManager.loadScene(target);
            }
        };
    }
}
