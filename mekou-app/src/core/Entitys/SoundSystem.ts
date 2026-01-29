
import * as pc from 'playcanvas';

export class SoundSystem {
    static register(_app: pc.AppBase) {
        const Sound = pc.createScript('soundSystem') as any;

        // Simplified for now, in a real engine we'd have a list of slots
        Sound.attributes.add('autoPlay', { type: 'boolean', default: false });
        Sound.attributes.add('loop', { type: 'boolean', default: false });
        Sound.attributes.add('volume', { type: 'number', default: 1, min: 0, max: 1 });
        Sound.attributes.add('pitch', { type: 'number', default: 1, min: 0.1, max: 2 });

        Sound.prototype.initialize = function () {
            // Ensure sound component exists
            if (!this.entity.sound) {
                this.entity.addComponent('sound');
            }
        };

        Sound.prototype.playSound = function (assetName: string) {
            if (this.entity.sound) {
                this.entity.sound.play(assetName);
            }
        };
    }
}
