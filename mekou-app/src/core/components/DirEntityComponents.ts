import * as pc from 'playcanvas';

/**
 * Base class for Core entities in the engine.
 * Provides standard initialization and lifecycle hooks.
 */
export class DirEntityComponents {
    public entity: pc.Entity;
    public app: pc.AppBase;

    constructor(name: string, app: pc.AppBase) {
        this.app = app;
        this.entity = new pc.Entity(name);
        app.root.addChild(this.entity);
    }

    public addComponent(type: string, data?: any) {
        return this.entity.addComponent(type, data);
    }

    public setPosition(x: number, y: number, z: number) {
        this.entity.setLocalPosition(x, y, z);
    }

}
