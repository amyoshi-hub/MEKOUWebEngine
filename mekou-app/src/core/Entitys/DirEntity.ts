
import * as pc from 'playcanvas';

/**
 * Base Directory Entity
 * Used for organizing objects in the hierarchy with a custom icon/behavior.
 */
export class DirEntity {
    static create(app: pc.AppBase, name: string = 'New Folder') {
        const entity = new pc.Entity(name);
        entity.tags.add('dir');
        app.root.addChild(entity);
        return entity;
    }
}

/**
 * PostEffect Entity
 * Holds post-effect settings and applies them to the camera.
 */
export class PostEffectEntity {
    static create(app: pc.AppBase) {
        const entity = new pc.Entity('PostEffectSettings');
        entity.addComponent('script');

        // Add SSAO by default if available
        if (!(entity.script as any).has('ssao')) {
            (entity.script as any).create('ssao', {
                attributes: {
                    radius: 4,
                    intensity: 1,
                    samples: 16
                }
            });
        }

        app.root.addChild(entity);
        return entity;
    }
}
