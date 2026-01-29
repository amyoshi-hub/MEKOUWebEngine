
import { Container, Button, Label } from '@playcanvas/pcui';
import { jsx } from '../../jsx';
import { HierarchyPanel } from './panels/HierarchyPanel';
import { InspectorPanel } from './panels/InspectorPanel';
import { AssetPanel } from './panels/AssetPanel';
import { SceneView } from './panels/SceneView';
import { MekouApp } from '../../core/MekouApp';

import { ObjectCreator } from '../helpers/ObjectCreator';
import { showCreateObjectMenu } from './panels/MenuUI/CreateObjectMenu';
import { ProjectSetting } from './panels/MenuUI/ProjectSettingFunc';
import { ProjectSettingPanel } from './panels/MenuUI/ProjectSettingPanel';
import { Player } from '../Player';

export class MainLayout {
    public dom: HTMLElement;
    private mekou: MekouApp;
    public settingsPanel?: ProjectSettingPanel;
    public settingsLogic?: ProjectSetting;
    private currentPlayer: Player | null = null;

    constructor(existingMekou: MekouApp) {
        this.mekou = existingMekou;

        const hierarchy = new HierarchyPanel();
        const inspector = new InspectorPanel();
        const assets = new AssetPanel();
        const sceneView = new SceneView();

        const playBtn = jsx(Button, { text: '▶', class: 'play-btn' });
        const projectBtn = jsx(Button, { text: 'PROJECT', class: 'toolbar-btn-text' });

        const mainContainerInstance = jsx(Container, {
            class: 'main-layout',
            flex: true,
            flexDirection: 'column',
            width: '100%',
            height: '100%'
        },
            // Header
            jsx(Container, { class: 'editor-header', flex: true, flexDirection: 'row' },
                jsx(Container, { class: 'toolbar-group-left', flex: true, alignItems: 'center' },
                    projectBtn,
                    jsx(Label, { text: '|', class: 'toolbar-separator' }),
                    jsx(Label, { text: 'SCENE: Initial Workspace', id: 'current-scene-label', class: 'scene-name-header' }),
                    jsx(Button, { text: 'GAME STARTER', class: 'starter-btn', onClick: () => ObjectCreator.createGameStarter() })
                ),
                jsx(Container, { flexGrow: 1 }),
                jsx(Container, { class: 'toolbar-group' },
                    playBtn
                ),
                jsx(Container, { flexGrow: 1 })
            ),
            // Body
            jsx(Container, { class: 'editor-body', flex: true, flexGrow: 1, flexDirection: 'row' },
                hierarchy.panel,
                jsx(Container, { class: 'center-column', flex: true, flexGrow: 1, flexDirection: 'column' },
                    sceneView.container,
                    assets.panel
                ),
                inspector.panel
            )
        );

        this.dom = mainContainerInstance.dom;

        // --- Logic Hooks ---
        let isPlaying = false;
        playBtn.on('click', () => {
            if (!this.mekou) return;
            isPlaying = !isPlaying;
            if (isPlaying) {
                this.mekou.app.timeScale = 1;
                playBtn.text = '■';
                playBtn.dom.classList.add('play-active');

                if (this.settingsLogic) {
                    this.currentPlayer = new Player(this.mekou.app);
                    const mode = this.settingsLogic.controlType.toUpperCase() as any;
                    this.currentPlayer.switchController(mode);
                }
            } else {
                this.mekou.app.timeScale = 0;
                playBtn.text = '▶';
                playBtn.dom.classList.remove('play-active');
                if (document.pointerLockElement) document.exitPointerLock();

                if (this.currentPlayer) {
                    this.currentPlayer.entity.destroy();
                    this.currentPlayer = null;
                }
            }
        });

        projectBtn.on('click', () => this.settingsPanel?.toggle());

        // Event Links
        hierarchy.onEntitySelected = (entity) => inspector.updateSelection(entity);
        hierarchy.onEntityDblClick = (entity) => sceneView.focusEntity(entity);
        sceneView.onEntityPicked = (entity) => {
            inspector.updateSelection(entity);
            hierarchy.selectEntity(entity);
        };

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                playBtn.emit('click');
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const selected = hierarchy.selectedEntities;
                if (selected && selected.length > 0) {
                    selected.forEach(entity => {
                        if (entity.name !== 'Floor' && entity.name !== 'SkyLight') entity.destroy();
                    });
                    hierarchy.refresh(this.mekou.app);
                    inspector.updateSelection(null);
                }
            }
            if (e.shiftKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                const rect = this.dom.getBoundingClientRect();
                const selected = hierarchy.selectedEntities;
                if (selected && selected.length > 0) {
                    assets.addPrefab(selected[0]);
                } else {
                    showCreateObjectMenu(rect.width / 2, rect.height / 2, hierarchy, this.mekou.app);
                }
            }
        });

        // Initialize Engine-linked parts
        this.setupEditor(sceneView, hierarchy, inspector);
    }

    private setupEditor(sceneView: SceneView, hierarchy: HierarchyPanel, _inspector: InspectorPanel) {
        if (!this.mekou) return;

        (this.mekou as any).mainLayout = this;

        this.settingsLogic = new ProjectSetting(this.mekou);
        this.settingsLogic.init(); // Initialize post effects
        this.settingsPanel = new ProjectSettingPanel(this.mekou, this.settingsLogic);

        sceneView.attachCanvas(this.mekou.canvas);
        sceneView.setApp(this.mekou.app);
        ObjectCreator.setApp(this.mekou.app);

        hierarchy.refresh(this.mekou.app);
        this.mekou.app.timeScale = 0;
        console.log("Modules initialized from existing MekouApp");
    }
}