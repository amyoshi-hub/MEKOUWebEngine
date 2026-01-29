
import * as pc from 'playcanvas';

export class SimpleAI {
    static register(_app: pc.AppBase) {
        const AI = pc.createScript('simpleAI') as any;

        AI.attributes.add('target', { type: 'entity', title: 'Target Entity' });
        AI.attributes.add('mode', {
            type: 'string',
            title: 'AI Mode',
            enum: [
                { 'Follow': 'follow' },
                { 'Flee': 'flee' }
            ],
            default: 'follow'
        });
        AI.attributes.add('speed', { type: 'number', default: 2 });
        AI.attributes.add('stopDistance', { type: 'number', default: 2 });

        AI.prototype.initialize = function () {
            this.force = new pc.Vec3();
            // Fallback to player if target not set
            if (!this.target) {
                const player = this.app.root.findByName('Player');
                if (player) this.target = player;
            }
        };

        AI.prototype.update = function (dt: number) {
            if (!this.target) return;

            const myPos = this.entity.getPosition();
            const targetPos = this.target.getPosition();
            const dist = myPos.distance(targetPos);

            const dir = new pc.Vec3().sub2(targetPos, myPos).normalize();

            if (this.mode === 'follow') {
                if (dist > this.stopDistance) {
                    this.move(dir, dt);
                }
            } else if (this.mode === 'flee') {
                this.move(dir.clone().mulScalar(-1), dt);
            }
        };

        AI.prototype.move = function (dir: pc.Vec3, dt: number) {
            if (this.entity.rigidbody) {
                this.entity.rigidbody.applyForce(dir.clone().mulScalar(this.speed * 50 * dt));
            } else {
                this.entity.translate(dir.clone().mulScalar(this.speed * dt));
            }
        };
    }
}
