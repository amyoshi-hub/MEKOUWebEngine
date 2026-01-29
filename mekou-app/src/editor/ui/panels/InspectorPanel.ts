import { Container, Panel, Label, Button } from '@playcanvas/pcui';
import * as pc from 'playcanvas';
import { jsx } from '../../../jsx';
import { ContextMenu } from '../../components/ContextMenu';
import * as IF from './InspectorFunction';

export class InspectorPanel {
    public dom: HTMLElement;
    public panel: any;
    private content: any;

    constructor() {
        this.panel = jsx(Panel, {
            headerText: 'INSPECTOR',
            class: 'inspector-panel',
            flex: true,
            flexDirection: 'column',
            resizable: 'left',
            width: 300
        });

        this.content = jsx(Container, {
            class: 'inspector-content',
            flex: true,
            flexDirection: 'column'
        });

        // スクロール設定
        this.content.dom.style.overflowY = 'auto';
        this.content.dom.style.overflowX = 'hidden';
        this.content.dom.style.height = '100%';
        this.content.dom.style.paddingBottom = '20px';

        this.updateSelection(null);

        this.panel.append(this.content);
        this.dom = this.panel.dom;
    }

    // --- 自作UI生成ヘルパー ---

    /** ネイティブトグル (Checkbox) */
    private createToggle(label: string, value: boolean, onChange: (val: boolean) => void) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'space-between';
        container.style.marginBottom = '10px';
        container.style.padding = '0 4px';

        const text = document.createElement('span');
        text.textContent = label;
        text.style.fontSize = '11px';
        text.style.color = '#ccc';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = value;
        checkbox.style.cursor = 'pointer';

        checkbox.addEventListener('change', () => onChange(checkbox.checked));

        container.appendChild(text);
        container.appendChild(checkbox);
        return container;
    }

    private createSelect(options: { value: string, text: string }[], currentValue: string, onChange: (val: string) => void) {
        const select = document.createElement('select');
        Object.assign(select.style, {
            width: '100%', backgroundColor: '#2c2c2c', color: '#eee',
            border: '1px solid #444', borderRadius: '4px', padding: '4px',
            fontSize: '12px', marginBottom: '10px'
        });
        options.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.value; el.text = opt.text;
            if (opt.value === currentValue) el.selected = true;
            select.appendChild(el);
        });
        select.addEventListener('change', (e) => onChange((e.target as HTMLSelectElement).value));
        return select;
    }

    private createSlider(min: number, max: number, step: number, value: number, onChange: (val: number) => void) {
        const container = document.createElement('div');
        container.style.display = 'flex'; container.style.alignItems = 'center';
        container.style.gap = '8px'; container.style.marginBottom = '10px';
        const slider = document.createElement('input');
        slider.type = 'range'; slider.min = min.toString(); slider.max = max.toString();
        slider.step = step.toString(); slider.value = value.toString(); slider.style.flex = '1';
        const valDisplay = document.createElement('span');
        valDisplay.textContent = value.toFixed(2);
        valDisplay.style.fontSize = '11px'; valDisplay.style.minWidth = '40px'; valDisplay.style.color = '#00abff';
        slider.addEventListener('input', (e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            valDisplay.textContent = val.toFixed(2);
            onChange(val);
        });
        container.appendChild(slider); container.appendChild(valDisplay);
        return container;
    }

    public updateSelection(entity: pc.Entity | null) {
        if (this.content.clear) {
            this.content.clear();
        } else {
            while (this.content.dom.children.length > 0) {
                this.content.dom.removeChild(this.content.dom.children[0]);
            }
        }

        if (!entity) {
            this.content.append(jsx(Label, { text: 'Select an object to inspect', class: 'no-selection-label' }));
            return;
        }

        // --- 描画セクション ---
        this.content.append(IF.drawEntityBase(entity));

        // --- PHYSICS TOGGLE SECTION ---
        // rigidbodyコンポーネントがあるかどうかで初期値を決定
        const hasPhysics = !!(entity.rigidbody || entity.collision);
        const physicsToggle = this.createToggle('PHYSICS ENABLE', hasPhysics, (enabled) => {
            if (enabled) {
                // 物理を有効化（デフォルト設定で追加）
                if (!entity.collision) entity.addComponent('collision', { type: 'box' });
                if (!entity.rigidbody) entity.addComponent('rigidbody', { type: 'dynamic' });
            } else {
                // 物理を無効化（コンポーネント削除）
                if (entity.rigidbody) entity.removeComponent('rigidbody');
                if (entity.collision) entity.removeComponent('collision');
            }
            // 表示を更新して詳細設定（重力など）の出し入れを行う
            this.updateSelection(entity);
        });
        this.content.append({ dom: physicsToggle });

        // 物理が有効な場合のみ、詳細な物理UI（IF.drawPhysics）を表示
        if (hasPhysics) {
            const physicsDetails = IF.drawPhysics(entity);
            if (physicsDetails) this.content.append(physicsDetails);
        }

        const light = IF.drawLight(entity);
        if (light) this.content.append(light);

        if (entity.render) {
            this.content.append(jsx(Label, { text: 'OPACITY', fontScale: 0.7 }));
            const opacitySlider = this.createSlider(0, 1, 0.01, 1, (val) => {
                console.log(`Opacity change: ${val}`);
            });
            this.content.append({ dom: opacitySlider });
        }

        const material = IF.drawMaterial(entity);
        if (material) this.content.append(material);

        const trigger = IF.drawSceneTrigger(entity);
        if (trigger) this.content.append(trigger);

        const post = IF.drawPostEffect(entity);
        if (post) this.content.append(post);

        const ai = IF.drawSimpleAI(entity);
        if (ai) this.content.append(ai);

        const vSettings = IF.drawVehicleController(entity);
        if (vSettings) this.content.append(vSettings);

        const sound = IF.drawSoundSystem(entity);
        if (sound) this.content.append(sound);

        const lod = IF.drawSimpleLOD(entity);
        if (lod) this.content.append(lod);

        // --- ADD COMPONENT ---
        const btnContainer = document.createElement('div');
        btnContainer.style.padding = '10px 0';
        const addBtn = jsx(Button, { text: 'Add Component', class: 'add-component-btn' });
        addBtn.on('click', (e: MouseEvent) => {
            ContextMenu.show(e.clientX, e.clientY, [
                {
                    label: 'Physics > Rigidbody', action: () => {
                        if (!entity.rigidbody) entity.addComponent('rigidbody');
                        this.updateSelection(entity);
                    }
                },
                { label: 'Light > Point', action: () => { entity.addComponent('light', { type: 'point' }); this.updateSelection(entity); } },
                { label: 'Visuals > Camera', action: () => { entity.addComponent('camera'); this.updateSelection(entity); } },
                { label: 'AI > Simple AI', action: () => { if (!entity.script) entity.addComponent('script'); (entity.script as any).create('simpleAI'); this.updateSelection(entity); } },
                { label: 'Audio > Sound System', action: () => { if (!entity.script) entity.addComponent('script'); (entity.script as any).create('soundSystem'); this.updateSelection(entity); } },
                { label: 'Performance > Simple LOD', action: () => { if (!entity.script) entity.addComponent('script'); (entity.script as any).create('simpleLOD'); this.updateSelection(entity); } }
            ]);
        });
        btnContainer.appendChild(addBtn.dom);
        this.content.append({ dom: btnContainer });
    }
}