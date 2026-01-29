import * as pc from 'playcanvas';
import { DirEntity } from './DirEntityComponents';

/**
 * PostEffect Entity
 * Allows configuring scene-wide effects like Fog and Ambient Light from the inspector.
 */
export class PostEffect extends DirEntity {
    constructor(_app: pc.AppBase) {
        super('PostEffect_Settings', _app);
    }

    static register(_app: pc.AppBase) {
        const PostEffectScript = pc.createScript('postEffect') as any;

        PostEffectScript.attributes.add('fogType', {
            type: 'number',
            enum: [
                { 'None': pc.FOG_NONE },
                { 'Linear': pc.FOG_LINEAR },
                { 'Exp': pc.FOG_EXP },
                { 'Exp2': pc.FOG_EXP2 }
            ],
            default: pc.FOG_NONE
        });

        PostEffectScript.attributes.add('fogDensity', { type: 'number', default: 0.01 });
        PostEffectScript.attributes.add('fogColor', { type: 'rgba', default: [0.5, 0.5, 0.6, 1] });
        PostEffectScript.attributes.add('ambientColor', { type: 'rgba', default: [0.2, 0.2, 0.2, 1] });

        PostEffectScript.prototype.initialize = function () {
            this.on('attr', () => this.applySettings());
            this.applySettings();
        };

        PostEffectScript.prototype.applySettings = function () {
            const scene = this.app.scene as any;
            scene.fog = this.fogType;
            scene.fogDensity = this.fogDensity;
            scene.fogColor.set(this.fogColor.r, this.fogColor.g, this.fogColor.b);
            scene.ambientLight.set(this.ambientColor.r, this.ambientColor.g, this.ambientColor.b);
        };
    }
}
