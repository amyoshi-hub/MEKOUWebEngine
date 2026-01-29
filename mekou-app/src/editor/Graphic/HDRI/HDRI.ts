import * as pc from 'playcanvas';

export class HDRI {
    private app: pc.AppBase;
    private asset: pc.Asset | null = null;

    constructor(app: pc.AppBase) {
        this.app = app;
    }

    public async load(url: string) {
        // 既存のアセットがあれば削除してメモリを解放（重要！）
        if (this.asset) {
            this.app.assets.remove(this.asset);
        }

        this.asset = new pc.Asset(
            'env-atlas-' + Date.now(),
            'texture',
            { url: url },
            { type: pc.TEXTURETYPE_RGBP, mipmaps: false }
        );

        this.app.assets.add(this.asset);
        this.app.assets.load(this.asset);

        this.asset.ready((asset) => {
            this.app.scene.envAtlas = asset.resource as pc.Texture;
            console.log("HDRI Loaded and Applied:", url);
        });
    }

    // 明るさを調整（インスペクターのスライダーから叩く）
    public setIntensity(value: number) {
        this.app.scene.skyboxIntensity = value;
    }

    // 回転を調整（インスペクターのスライダーから叩く）
    public setRotation(yAngle: number) {
        this.app.scene.skyboxRotation = new pc.Quat().setFromEulerAngles(0, yAngle, 0);
    }
}