import * as pc from 'playcanvas';
import { PlayerController } from '../../engine/scripts/PlayerController';
import { SceneTriger } from '../../core/Entitys/SceneTriger';
import { TransformGizmo } from './TransformGizmo';
import { SimpleAI } from '../../core/Entitys/SimpleAI';
import { SoundSystem } from '../../core/Entitys/SoundSystem';
import { SimpleLOD } from '../../core/Entitys/SimpleLOD';
import { PostEffect } from '../../core/Entitys/PostEffect';

export class ObjectCreator {
    private static app: pc.AppBase;

    static setApp(app: pc.AppBase) {
        this.app = app;
    }

    static registerScripts() {
        if (!this.app) return;
        PlayerController.register(this.app);
        SceneTriger.register(this.app);
        TransformGizmo.register(this.app);
        SimpleAI.register(this.app);
        SoundSystem.register(this.app);
        SimpleLOD.register(this.app);
        PostEffect.register(this.app);
    }


    // Simplistic serialization for prefab creation
    static serialize(entity: pc.Entity): any {
        const data: any = {
            name: entity.name,
            position: [entity.getLocalPosition().x, entity.getLocalPosition().y, entity.getLocalPosition().z],
            rotation: [entity.getLocalEulerAngles().x, entity.getLocalEulerAngles().y, entity.getLocalEulerAngles().z],
            scale: [entity.getLocalScale().x, entity.getLocalScale().y, entity.getLocalScale().z],
            components: {}
        };

        if (entity.render) data.components.render = { type: entity.render.type };
        if (entity.model) data.components.model = { type: entity.model.type };
        if (entity.collision) data.components.collision = { type: entity.collision.type };
        if (entity.rigidbody) data.components.rigidbody = { type: entity.rigidbody.type, mass: entity.rigidbody.mass };
        if (entity.light) data.components.light = { type: entity.light.type, color: [entity.light.color.r, entity.light.color.g, entity.light.color.b] };
        if (entity.camera) data.components.camera = {};

        return data;
    }

    static deserialize(data: any): pc.Entity {
        const entity = new pc.Entity(data.name);
        entity.setLocalPosition(data.position[0], data.position[1], data.position[2]);
        entity.setLocalEulerAngles(data.rotation[0], data.rotation[1], data.rotation[2]);
        entity.setLocalScale(data.scale[0], data.scale[1], data.scale[2]);

        for (const [name, config] of Object.entries(data.components)) {
            entity.addComponent(name, config as any);
        }

        return entity;
    }

    static createBox() {
        if (!this.app) return;
        const box = new pc.Entity('Box');
        box.addComponent('render', { type: 'box' });
        box.addComponent('collision', { type: 'box' });
        box.addComponent('rigidbody', { type: 'dynamic', mass: 1 });
        box.setLocalPosition(0, 5, 0);
        this.app.root.addChild(box);
        return box;
    }

    static createSphere() {
        if (!this.app) return;
        const sphere = new pc.Entity('Sphere');
        sphere.addComponent('render', { type: 'sphere' });
        sphere.addComponent('collision', { type: 'sphere' });
        sphere.addComponent('rigidbody', { type: 'dynamic', mass: 1 });
        sphere.setLocalPosition(0, 5, 0);
        this.app.root.addChild(sphere);
        return sphere;
    }

    static createPlane() {
        if (!this.app) return;
        const plane = new pc.Entity('Plane');
        plane.addComponent('render', { type: 'plane' });
        plane.addComponent('collision', { type: 'box', halfExtents: new pc.Vec3(5, 0.01, 5) });
        plane.setLocalScale(10, 1, 10);
        this.app.root.addChild(plane);
        return plane;
    }

    static createWorldText() {
        if (!this.app) return;
        const text = new pc.Entity('WorldText');
        text.addComponent('element', {
            type: 'text',
            text: 'Hello World',
            fontSize: 64,
            preset: 'screen',
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5]
        });
        text.setLocalPosition(0, 2, 0);
        this.app.root.addChild(text);
        return text;
    }

    static createUIButton() {
        if (!this.app) return;
        const button = new pc.Entity('UIButton');
        button.addComponent('element', {
            type: 'image',
            color: new pc.Color(0.5, 0.5, 0.5),
            useInput: true,
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width: 150,
            height: 50
        });

        const label = new pc.Entity('ButtonLabel');
        label.addComponent('element', {
            type: 'text',
            text: 'Button',
            fontSize: 24,
            color: pc.Color.WHITE,
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5]
        });
        button.addChild(label);

        button.setLocalPosition(0, 0, 0);
        this.app.root.addChild(button);
        return button;
    }

    static createUIImage() {
        if (!this.app) return;
        const image = new pc.Entity('UIImage');
        image.addComponent('element', {
            type: 'image',
            color: new pc.Color(1, 1, 1),
            useInput: true,
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width: 100,
            height: 100
        });
        this.app.root.addChild(image);
        return image;
    }

    static createDialog() {
        if (!this.app) return;
        const dialog = new pc.Entity('Dialog');
        dialog.addComponent('element', {
            type: 'image',
            color: new pc.Color(0.2, 0.2, 0.2),
            useInput: true,
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width: 400,
            height: 300
        });

        const title = new pc.Entity('Title');
        title.addComponent('element', {
            type: 'text',
            text: 'Dialog Title',
            fontSize: 24,
            anchor: [0.5, 0.9, 0.5, 0.9],
            pivot: [0.5, 0.5]
        });
        dialog.addChild(title);

        this.app.root.addChild(dialog);
        return dialog;
    }

    static createPlayerFPS() {
        if (!this.app) return;
        const player = new pc.Entity('PlayerFPS');
        player.addComponent('collision', { type: 'capsule', radius: 0.5, height: 2 });
        player.addComponent('rigidbody', {
            type: 'dynamic',
            mass: 80,
            angularFactor: pc.Vec3.ZERO
        });
        player.addComponent('script');
        (player.script as any).create('playerMovement');

        const camera = new pc.Entity('Camera');
        camera.addComponent('camera');
        camera.setLocalPosition(0, 1.6, 0);
        player.addChild(camera);

        player.setLocalPosition(0, 2, 0);
        this.app.root.addChild(player);
        return player;
    }

    static createPlayerTPS() {
        if (!this.app) return;
        const player = new pc.Entity('PlayerTPS');
        player.addComponent('render', { type: 'capsule' });
        player.addComponent('collision', { type: 'capsule', radius: 0.5, height: 2 });
        player.addComponent('rigidbody', {
            type: 'dynamic',
            mass: 80,
            angularFactor: pc.Vec3.ZERO
        });
        player.addComponent('script');
        (player.script as any).create('playerMovement');

        const cameraPivot = new pc.Entity('CameraPivot');
        const camera = new pc.Entity('Camera');
        camera.addComponent('camera');
        camera.setLocalPosition(0, 1, 4);
        camera.setLocalEulerAngles(-15, 0, 0);
        cameraPivot.addChild(camera);
        player.addChild(cameraPivot);

        player.setLocalPosition(0, 2, 0);
        this.app.root.addChild(player);
        return player;
    }
    public static createTessellatedObject() {
        const entity = new pc.Entity('TessellatedObject');
        entity.addComponent('render', { type: 'box' });

        const gd = this.app.graphicsDevice;
        const vertexShader = `
            attribute vec3 vertex_position;
            attribute vec2 vertex_texCoord0;
            uniform mat4 matrix_model;
            uniform mat4 matrix_viewProjection;
            uniform float uTime;
            varying vec2 vUv;
            void main(void) {
                vUv = vertex_texCoord0;
                vec3 pos = vertex_position;
                // Displacement
                pos.y += sin(pos.x * 10.0 + uTime) * 0.1;
                gl_Position = matrix_viewProjection * matrix_model * vec4(pos, 1.0);
            }
        `;
        const fragmentShader = `
            precision mediump float;
            varying vec2 vUv;
            void main(void) {
                gl_FragColor = vec4(vUv.x, vUv.y, 1.0, 1.0);
            }
        `;

        const shaderDefinition = {
            attributes: {
                vertex_position: pc.SEMANTIC_POSITION,
                vertex_texCoord0: pc.SEMANTIC_TEXCOORD0
            },
            vshader: vertexShader,
            fshader: fragmentShader
        };

        const shader = new pc.Shader(gd, shaderDefinition);
        const mat = new pc.Material();
        (mat as any).shader = shader;

        let time = 0;
        this.app.on('update', (dt) => {
            time += dt;
            mat.setParameter('uTime', time);
        });

        if (entity.render) {
            entity.render.meshInstances[0].material = mat;
        }

        this.app.root.addChild(entity);
        return entity;
    }

    public static createGameStarter() {
        if (!this.app) return;
        const root = new pc.Entity('GameStarter_Root');
        this.app.root.addChild(root);

        const floor = this.createPlane();
        if (floor) { floor.name = 'Starter_Floor'; root.addChild(floor); }

        const light = new pc.Entity('Starter_Light');
        light.addComponent('light', { type: 'directional', castShadows: true });
        light.setLocalEulerAngles(45, 45, 0);
        root.addChild(light);

        const box = this.createBox();
        if (box) { box.name = 'Starter_Obstacle'; box.setLocalPosition(2, 2, 2); root.addChild(box); }

        const player = this.createPlayerFPS();
        if (player) { player.name = 'Starter_Player'; root.addChild(player); }

        return root;
    }

    public static loadFBX(url: string, name: string = 'FBXModel') {
        if (!this.app) return;
        const entity = new pc.Entity(name);

        // Use GLB loader as standard for web FBX workflows
        this.app.assets.loadFromUrl(url, "container", (err: any, asset: any) => {
            if (err) {
                console.error("FBX/GLB Load failed:", err);
                return;
            }
            entity.addComponent('model', {
                type: 'asset',
                asset: asset.resource.model
            });
            this.app.root.addChild(entity);
        });

        return entity;
    }

    public static createPointLight() {
        if (!this.app) return;
        const light = new pc.Entity('PointLight');
        light.addComponent('light', {
            type: 'point',
            color: new pc.Color(1, 1, 1),
            range: 10
        });
        light.setLocalPosition(0, 2, 0);
        this.app.root.addChild(light);
        return light;
    }

    public static createCollision(type: 'box' | 'sphere' | 'capsule' = 'box') {
        if (!this.app) return;
        const entity = new pc.Entity('Collision_' + type);
        entity.addComponent('collision', { type: type });
        entity.addComponent('rigidbody', { type: 'static' });
        entity.setLocalPosition(0, 0, 0);
        this.app.root.addChild(entity);
        return entity;
    }
}

