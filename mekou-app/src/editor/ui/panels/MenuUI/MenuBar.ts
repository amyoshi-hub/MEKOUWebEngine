import { Container, Button, Label } from '@playcanvas/pcui';
import { jsx } from '../../../../jsx';
import { TransformGizmo } from '../../../core/TransformGizmo';
import { ObjectCreator } from '../../../core/ObjectCreator';

export class MenuBar {
    public container: any;

    constructor() {
        this.container = jsx(Container, {
            class: 'menu-bar editor-header',
            flex: true,
            flexDirection: 'row',
            alignItems: 'center',
            height: 32,
            style: 'background-color: #2c2c2c; border-bottom: 1px solid #111;'
        });

        const logo = jsx(Label, { text: 'MEKOU ENGINE', class: 'menu-logo', style: 'font-weight: bold; margin-right: 20px;' });
        this.container.append(logo);

        // Standard Menus
        this.createMenu('File', [
            { label: 'New Scene', action: () => console.log('New Scene') },
        ]);

        this.createMenu('Edit', [
            { label: 'Undo', action: () => console.log('Undo') },
        ]);

        this.createMenu('Create', [
            { label: 'Cube', action: () => ObjectCreator.createBox() },
            { label: 'Sphere', action: () => ObjectCreator.createSphere() },
            { label: 'Light', action: () => ObjectCreator.createPointLight() },
        ]);

        // Tool Switcher (Gizmos)
        const sep = jsx(Label, { text: '|', style: 'margin: 0 10px; opacity: 0.5;' });
        this.container.append(sep);

        this.createToolBtn('Translate', () => TransformGizmo.setMode('translate'));
        this.createToolBtn('Rotate', () => TransformGizmo.setMode('rotate'));
        this.createToolBtn('Scale', () => TransformGizmo.setMode('scale'));
    }

    private createMenu(text: string, items: any[]) {
        const btn = jsx(Button, { text: text, class: 'menu-btn' });
        btn.on('click', () => {
            console.log(`Open ${text} menu`);
            if (items.length > 0) {
                console.log("Menu Items:", items.map(i => i.label));
            }
        });
        this.container.append(btn);
    }

    private createToolBtn(text: string, action: () => void) {
        const btn = jsx(Button, { text: text, class: 'tool-btn' });
        btn.on('click', action);
        this.container.append(btn);
    }
}
