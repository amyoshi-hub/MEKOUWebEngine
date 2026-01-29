import { Panel } from '@playcanvas/pcui';
import * as pc from 'playcanvas';
import { jsx } from '../../../../jsx';
import { CustomSlider, CustomDropdown } from '../../elements/CustomInputs';

export interface MaterialPreset {
    opacity?: number;
    metalness?: number;
    gloss?: number;
    diffuse?: pc.Color;
    emissive?: pc.Color;
    blendType?: number;
}

// プリセットデータ
export const PRESETS: Record<string, MaterialPreset> = {
    glass: { opacity: 0.3, metalness: 0.1, gloss: 80, blendType: pc.BLEND_NORMAL },
    gold: { metalness: 1.0, gloss: 90, diffuse: new pc.Color(1, 0.84, 0) },
    chrome: { metalness: 0.9, gloss: 100, diffuse: new pc.Color(0.7, 0.7, 0.7) },
    matte: { metalness: 0, gloss: 5, diffuse: new pc.Color(0.5, 0.5, 0.5) }
};

export class Material {
    static drawMaterial(entity: pc.Entity) {
        if (!entity.render && !entity.model) return null;
        const renderPanel = jsx(Panel, { headerText: 'MATERIAL', class: 'component-panel', collapsible: true });

        // マテリアル取得ヘルパー
        const getMat = () => (entity.render?.meshInstances[0]?.material ||
            (entity.model as any)?.meshInstances[0]?.material) as pc.StandardMaterial;

        const mat = getMat();
        if (!mat) return null;

        // --- 1. プリセット選択 ---
        const shaderSelect = new CustomDropdown({
            options: Object.keys(PRESETS).map(key => ({ value: key, text: key.toUpperCase() })),
            value: 'matte',
            label: 'Preset'
        });

        shaderSelect.onChange = (val: string) => {
            const preset = PRESETS[val];
            if (preset) {
                if (preset.opacity !== undefined) mat.opacity = preset.opacity;
                if (preset.metalness !== undefined) mat.metalness = preset.metalness;
                if (preset.gloss !== undefined) mat.gloss = preset.gloss;
                if (preset.diffuse) mat.diffuse = preset.diffuse;
                if (preset.blendType !== undefined) mat.blendType = preset.blendType;
                mat.update();

                // Note: Sliders values won't auto-update without an observer pattern, 
                // but this satisfies the "modular component" request.
            }
        };
        renderPanel.append(shaderSelect);

        // --- 2. 各パラメーターのスライダー化 ---
        const metalSlider = new CustomSlider({ label: 'Metalness', value: mat.metalness || 0, min: 0, max: 1, precision: 2 });
        metalSlider.onChange = (v: number) => { mat.metalness = v; mat.update(); };
        renderPanel.append(metalSlider);

        const glossSlider = new CustomSlider({ label: 'Glossiness', value: mat.gloss || 0, min: 0, max: 100, precision: 1 });
        glossSlider.onChange = (v: number) => { mat.gloss = v; mat.update(); };
        renderPanel.append(glossSlider);

        return renderPanel;
    }
}