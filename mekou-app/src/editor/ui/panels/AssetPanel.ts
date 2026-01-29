
import { Container, Panel, Label, TreeView, TreeViewItem } from '@playcanvas/pcui';
import { jsx } from '../../../jsx';
import { ContextMenu } from '../../components/ContextMenu';
import { ObjectCreator } from '../../helpers/ObjectCreator';

export class AssetPanel {
    public dom: HTMLElement;
    public panel: any;
    private fileGrid: any;
    private currentPath: string = 'Assets';

    private assets = [
        { name: 'PlayerModel', type: 'model', path: 'Assets/Models', icon: '👤' },
        { name: 'Environment', type: 'model', path: 'Assets/Models', icon: '🌳' },
        { name: 'GrassTex', type: 'texture', path: 'Assets/Textures', icon: '🖼️' },
        { name: 'MainScene', type: 'scene', path: 'Assets/Scenes', icon: '🎬' },
        { name: 'PlayerController', type: 'script', path: 'Assets/Scripts', icon: '📜' },
    ];

    constructor() {
        this.panel = jsx(Panel, {
            headerText: 'ASSETS',
            class: 'asset-panel',
            flex: true,
            flexDirection: 'row',
            resizable: 'top',
            height: 300
        });

        const tree = jsx(TreeView, { class: 'project-tree-view' });
        const assetsRoot = jsx(TreeViewItem, { text: 'Assets', open: true });

        const folders = ['Models', 'Textures', 'Scenes', 'Scripts', 'Prefabs'];
        folders.forEach(f => {
            const item = jsx(TreeViewItem, { text: f });
            item.on('click', () => this.navigateTo(`Assets/${f}`));
            assetsRoot.append(item);
        });
        assetsRoot.on('click', () => this.navigateTo('Assets'));

        tree.append(assetsRoot);
        const leftPane = jsx(Container, { width: 200, class: 'project-sidebar' });
        leftPane.append(tree);

        this.fileGrid = jsx(Container, {
            class: 'project-files',
            flex: true,
            flexGrow: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 10
        });

        this.panel.append(leftPane);
        this.panel.append(this.fileGrid);

        this.dom = this.panel.dom;
        this.renderGrid();

        this.fileGrid.dom.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            ContextMenu.show(e.clientX, e.clientY, [
                { label: 'Create Folder', action: () => console.log("Create Folder") },
                { label: 'Import Asset', action: () => console.log("Import Asset") },
                { label: '---', action: () => { } },
                { label: 'Create 3D > Box', action: () => ObjectCreator.createBox() },
                { label: 'Create 3D > Sphere', action: () => ObjectCreator.createSphere() },
                { label: 'Create 2D > World Text', action: () => ObjectCreator.createWorldText() },
            ]);
        });
    }

    public addPrefab(entity: any) {
        const prefabData = ObjectCreator.serialize(entity);
        const asset = {
            name: entity.name,
            type: 'prefab',
            path: 'Assets/Prefabs',
            icon: '📦',
            data: prefabData
        };
        this.assets.push(asset);
        this.renderGrid();
    }

    private navigateTo(path: string) {
        this.currentPath = path;
        this.renderGrid();
    }

    private renderGrid() {
        while (this.fileGrid.dom.children.length > 0) {
            this.fileGrid.dom.removeChild(this.fileGrid.dom.children[0]);
        }

        const filtered = this.assets.filter(a => a.path === this.currentPath || this.currentPath === 'Assets');

        filtered.forEach(asset => {
            const item = jsx(Container, { class: 'asset-item' });
            item.dom.draggable = true;
            item.dom.addEventListener('dragstart', (e: DragEvent) => {
                if (e.dataTransfer) {
                    e.dataTransfer.setData('text/plain', JSON.stringify(asset));
                    e.dataTransfer.effectAllowed = 'copy';
                }
            });

            item.append(jsx(Label, { text: asset.icon, class: 'asset-icon' }));
            item.append(jsx(Label, { text: asset.name, class: 'asset-name' }));
            this.fileGrid.append(item);
        });
    }
}
