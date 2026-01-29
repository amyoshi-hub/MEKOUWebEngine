import { Container, Panel, Label, Button } from '@playcanvas/pcui';
import { jsx } from '../../../jsx';
import { ContextMenu } from '../../components/ContextMenu';
import { ObjectCreator } from '../../core/ObjectCreator';

export class AssetPanel {
    public dom: HTMLElement;
    public panel: any;
    private fileGrid: any;
    private breadcrumbs: any; // 現在の階層表示用
    private currentPath: string = 'Assets';

    // 仮想ディレクトリ構造（folder: true でフォルダを定義）
    private assets = [
        { name: 'Models', type: 'folder', path: 'Assets', icon: '📁', folder: true },
        { name: 'Textures', type: 'folder', path: 'Assets', icon: '📁', folder: true },
        { name: 'Scenes', type: 'folder', path: 'Assets', icon: '📁', folder: true },
        { name: 'Scripts', type: 'folder', path: 'Assets', icon: '📁', folder: true },
        { name: 'PlayerModel', type: 'model', path: 'Assets/Models', icon: '👤' },
        { name: 'GrassTex', type: 'texture', path: 'Assets/Textures', icon: '🖼️' },
        { name: 'MainScene', type: 'scene', path: 'Assets/Scenes', icon: '🎬' },
    ];

    constructor() {
        this.panel = jsx(Panel, {
            headerText: 'ASSETS',
            class: 'asset-panel',
            flex: true,
            flexDirection: 'column',
            resizable: 'top',
            height: 300
        });

        // --- 上部：パンくずリスト（ナビゲーション） ---
        this.breadcrumbs = jsx(Container, { class: 'asset-breadcrumbs', flex: true, padding: 4 });
        this.panel.append(this.breadcrumbs);

        // --- メイン：ファイルグリッド ---
        this.fileGrid = jsx(Container, {
            class: 'project-files',
            flex: true,
            flexGrow: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 10,
            overflowY: 'auto'
        });

        this.panel.append(this.fileGrid);
        this.dom = this.panel.dom;

        this.renderGrid();
        this.setupGlobalEvents();
        this.setupImportEvents();
    }

    private navigateTo(path: string) {
        this.currentPath = path;
        this.renderGrid();
    }

    private renderGrid() {
        // クリア
        this.fileGrid.dom.innerHTML = '';
        this.renderBreadcrumbs();

        // 1. 「戻る」ボタン（トップ階層でない場合）
        if (this.currentPath !== 'Assets') {
            const backItem = this.createGridItem({ name: '..', icon: '⬅️', type: 'back' });
            backItem.dom.addEventListener('dblclick', () => {
                const parts = this.currentPath.split('/');
                parts.pop();
                this.navigateTo(parts.join('/'));
            });
            this.fileGrid.append(backItem);
        }

        // 2. 現在のパスに属するアセットをフィルタリング
        const filtered = this.assets.filter(a => a.path === this.currentPath);

        filtered.forEach(asset => {
            const item = this.createGridItem(asset);

            if (asset.folder) {
                // フォルダならダブルクリックで中に入る
                item.dom.addEventListener('dblclick', () => {
                    this.navigateTo(`${this.currentPath}/${asset.name}`);
                });
            } else {
                // ファイルならドラッグ可能にする
                item.dom.draggable = true;
                item.dom.addEventListener('dragstart', (e: DragEvent) => {
                    if (e.dataTransfer) {
                        e.dataTransfer.setData('text/plain', JSON.stringify(asset));
                    }
                });
            }

            this.fileGrid.append(item);
        });
        //再描画のおまじない
        this.fileGrid.dom.style.display = 'none';
        this.fileGrid.dom.offsetHeight;
        this.fileGrid.dom.style.display = 'flex';
    }

    // グリッドアイテムの共通生成
    private createGridItem(asset: any) {
        const item = jsx(Container, { class: 'asset-item' });
        item.dom.style.width = '80px';
        item.dom.style.textAlign = 'center';
        item.dom.style.cursor = 'pointer';

        const icon = jsx(Label, { text: asset.icon, class: 'asset-icon' });
        icon.dom.style.fontSize = '32px';

        const name = jsx(Label, { text: asset.name, class: 'asset-name' });
        name.dom.style.display = 'block';
        name.dom.style.fontSize = '10px';

        item.append(icon);
        item.append(name);
        return item;
    }

    // パンくずリストの更新（Assets > Models > ...）
    private renderBreadcrumbs() {
        this.breadcrumbs.dom.innerHTML = '';
        const parts = this.currentPath.split('/');
        let pathAccumulator = '';

        parts.forEach((p, i) => {
            pathAccumulator += (i === 0 ? p : '/' + p);
            const currentLink = pathAccumulator;
            const btn = jsx(Button, { text: p, class: 'breadcrumb-btn' });
            btn.on('click', () => this.navigateTo(currentLink));
            this.breadcrumbs.append(btn);

            if (i < parts.length - 1) {
                this.breadcrumbs.append(jsx(Label, { text: '>' }));
            }
        });
    }

    private setupGlobalEvents() {
        this.fileGrid.dom.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            ContextMenu.show(e.clientX, e.clientY, [
                { label: 'New Folder', action: () => this.createFolder() },
                {
                    label: 'Import File', action: () => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = '.fbx,.glb,.obj,.png,.jpg,.jpeg';
                        input.onchange = async (ev: any) => {
                            if (ev.target.files) {
                                for (const file of Array.from(ev.target.files) as File[]) {
                                    await this.processImportedFile(file);
                                }
                                this.renderGrid();
                            }
                        };
                        input.click();
                    }
                },
                { label: '---', action: () => { } },
                { label: 'Create Cube', action: () => { ObjectCreator.createBox(); window.dispatchEvent(new Event('editor:refresh_hierarchy')); } },
                { label: 'Create Sphere', action: () => { ObjectCreator.createSphere(); window.dispatchEvent(new Event('editor:refresh_hierarchy')); } },
                { label: 'Create Plane', action: () => { ObjectCreator.createPlane(); window.dispatchEvent(new Event('editor:refresh_hierarchy')); } },
                { label: 'Create Light', action: () => { ObjectCreator.createPointLight(); window.dispatchEvent(new Event('editor:refresh_hierarchy')); } },
            ]);
        });
    }

    private createFolder() {
        const folderName = prompt('Folder Name?', 'New Folder');
        if (folderName) {
            this.assets.push({
                name: folderName,
                type: 'folder',
                path: this.currentPath,
                icon: '📁',
                folder: true
            });
            this.renderGrid();
            console.log("new folder");
        }
    }

    private setupImportEvents() {
        // ブラウザのデフォルト挙動（ファイルを開く）を防止
        this.fileGrid.dom.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
            this.fileGrid.dom.style.backgroundColor = 'rgba(0, 171, 255, 0.1)'; // ハイライト
        });

        this.fileGrid.dom.addEventListener('dragleave', () => {
            this.fileGrid.dom.style.backgroundColor = '';
        });

        this.fileGrid.dom.addEventListener('drop', async (e: DragEvent) => {
            e.preventDefault();
            try {
                const data = JSON.parse(e.dataTransfer?.getData('text/plain') || '{}');
                if (data.type === 'prefab') {
                    console.log('Creating Prefab Asset:', data.name);
                    this.addPrefab(data); // Re-use the new method
                } else if (e.dataTransfer && e.dataTransfer.files) {
                    const files = Array.from(e.dataTransfer.files);
                    for (const file of files) {
                        await this.processImportedFile(file);
                    }
                    this.renderGrid();
                }
            } catch (err) {
                // Fallback for files
                if (e.dataTransfer && e.dataTransfer.files) {
                    const files = Array.from(e.dataTransfer.files);
                    for (const file of files) {
                        await this.processImportedFile(file);
                    }
                    this.renderGrid();
                }
            }
            this.fileGrid.dom.style.backgroundColor = '';
        });
    }

    private async processImportedFile(file: File) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        let type = 'unknown';
        let icon = '📄';

        // 拡張子による自動判別
        if (['fbx', 'glb', 'obj'].includes(extension!)) {
            type = 'model';
            icon = '📦';
        } else if (['png', 'jpg', 'jpeg', 'tga'].includes(extension!)) {
            type = 'texture';
            icon = '🖼️';
        } else if (['mp3', 'wav', 'ogg'].includes(extension!)) {
            type = 'audio';
            icon = '🔊';
        } else if (extension === 'js' || extension === 'ts') {
            type = 'script';
            icon = '📜';
        }

        // --- ここで本来は Rust 側やサーバーにファイルをアップロードする処理を挟む ---
        console.log(`Importing: ${file.name} to ${this.currentPath}`);

        // 仮想アセットリストに追加
        this.assets.push({
            name: file.name,
            type: type,
            path: this.currentPath,
            icon: icon,
            fileData: file // 実際のファイル参照を保持
        });

        // メッセージや通知を出すならここ
    }

    public addPrefab(entity: any) {
        console.log('Adding prefab from entity:', entity.name);
        this.assets.push({
            name: entity.name,
            type: 'model',
            path: this.currentPath,
            icon: '📦',
            folder: false
        });
        this.renderGrid();
    }
}