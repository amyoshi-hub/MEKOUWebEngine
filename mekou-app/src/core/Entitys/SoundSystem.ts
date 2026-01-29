import * as pc from 'playcanvas';

export class SoundSystem {
    static register(_app: pc.AppBase) {
        const Sound = pc.createScript('soundSystem') as any;

        Sound.attributes.add('audioUrl', {
            type: 'string',
            title: 'Audio URL',
            placeholder: 'assets/audio/bgm.mp3'
        });
        Sound.attributes.add('loop', { type: 'boolean', default: true });
        Sound.attributes.add('autoPlay', { type: 'boolean', default: true });
        Sound.attributes.add('volume', { type: 'number', default: 1, min: 0, max: 1 });
        Sound.attributes.add('spatial', { type: 'boolean', default: true, title: 'Spatial (3D) Audio' });

        Sound.prototype.initialize = function () {
            if (!this.audioUrl) return;

            // Simple audio tag approach for now
            this.audio = new Audio(this.audioUrl);
            this.audio.loop = this.loop;
            this.audio.volume = this.volume;

            if (this.autoPlay) {
                // Browsers need user interaction
                const firstClickPlay = () => {
                    this.audio.play().catch((e: any) => console.warn("Audio play failed, waiting for interaction:", e));
                    window.removeEventListener('mousedown', firstClickPlay);
                };
                window.addEventListener('mousedown', firstClickPlay);
            }
        };

        Sound.prototype.update = function (_dt: number) {
            if (this.spatial && this.audio && !this.audio.paused) {
                const cam = this.app.root.findByName('EditorCamera') || this.app.root.findComponent('camera')?.entity;
                if (cam) {
                    const dist = this.entity.getPosition().distance(cam.getPosition());
                    const maxDist = 20;
                    const falloff = pc.math.clamp(1 - (dist / maxDist), 0, 1);
                    this.audio.volume = this.volume * falloff;
                }
            }
        };

        Sound.prototype.onDisable = function () {
            if (this.audio) this.audio.pause();
        };
    }
}
