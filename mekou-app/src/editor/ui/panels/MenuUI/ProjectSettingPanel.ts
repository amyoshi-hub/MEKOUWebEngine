import { Container, Panel, Label, BooleanInput, Button } from '@playcanvas/pcui';
import * as pc from 'playcanvas';
import { jsx } from '../../../../jsx';
import { ProjectSetting } from './ProjectSettingFunc';
import { MekouApp } from '../../../../core/MekouApp';
import { Player } from '../../../Player';
import { CustomSlider, CustomDropdown } from '../../elements/CustomInputs';

export class ProjectSettingPanel {
    public panel: any;
    private mekou: MekouApp;
    private settingsLogic: ProjectSetting;

    constructor(mekou: MekouApp, settingsLogic: ProjectSetting) {
        this.mekou = mekou;
        this.settingsLogic = settingsLogic;

        this.panel = jsx(Panel, {
            headerText: 'PROJECT SETTINGS',
            hidden: true,
            class: 'settings-panel-overlay',
            width: 320,
            collapsible: true
        });

        // 基本スタイル設定
        this.panel.dom.style.display = 'none';
        this.panel.dom.style.position = 'fixed';
        this.panel.dom.style.top = '40px';
        this.panel.dom.style.left = '0';
        this.panel.dom.style.height = 'calc(100% - 40px)';
        this.panel.dom.style.zIndex = '2000';
        this.panel.dom.style.backgroundColor = '#151515';

        const settingsContent = jsx(Container, {
            class: 'settings-content',
            flex: true,
            flexDirection: 'column',
            padding: 12,
            overflowY: 'auto'
        });

        // --- Controls Section ---
        settingsContent.append(jsx(Label, { text: 'CONTROL MODE', class: 'settings-section-title' }));
        const controlOptions = Object.keys(Player.MODES).map(key => ({
            value: key,
            text: key === 'DEV' ? 'Editor (FlyMode)' : `Player (${key})`
        }));
        const controlSelect = new CustomDropdown({
            options: controlOptions,
            value: this.settingsLogic.controlType
        });
        controlSelect.onChange = (val) => this.settingsLogic.setControlType(val as any);
        settingsContent.append(controlSelect);

        // --- Keybindings Section ---
        settingsContent.append(jsx(Label, { text: 'KEYBINDINGS', class: 'settings-section-title' }));
        const bindRow = (action: string) => {
            const row = jsx(Container, { flex: true, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 });
            row.append(jsx(Label, { text: action, fontScale: 0.8 }));

            const getButtonLabel = (actionStr: string) => {
                const k = this.mekou.input.getBinding(actionStr);
                // Simple map for common keys
                if (k === 87) return 'W';
                if (k === 83) return 'S';
                if (k === 65) return 'A';
                if (k === 68) return 'D';
                if (k === 81) return 'Q';
                if (k === 69) return 'E';
                return k ? `CODE: ${k}` : 'UNBOUND';
            };

            const keyBtn = jsx(Button, { text: getButtonLabel(action), class: 'keybind-btn' });
            keyBtn.on('click', () => {
                keyBtn.text = '...';
                const onKey = (e: KeyboardEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.mekou.input.setBinding(action, e.keyCode);
                    keyBtn.text = getButtonLabel(action);
                    window.removeEventListener('keydown', onKey, true);
                };
                window.addEventListener('keydown', onKey, true);
            });
            row.append(keyBtn);
            return row;
        };
        settingsContent.append(bindRow('FORWARD'));
        settingsContent.append(bindRow('BACK'));
        settingsContent.append(bindRow('LEFT'));
        settingsContent.append(bindRow('RIGHT'));
        settingsContent.append(bindRow('UP'));
        settingsContent.append(bindRow('DOWN'));

        // --- Environment Section (Grouped Fog & Light) ---
        const envPanel = jsx(Panel, { headerText: 'ENVIRONMENT', class: 'settings-section-panel', collapsible: true, open: false });

        envPanel.append(jsx(Label, { text: 'FOG', fontScale: 0.8, marginTop: 8 }));
        const fogType = new CustomDropdown({
            label: 'Fog Type',
            options: [
                { value: pc.FOG_NONE, text: 'NONE' },
                { value: pc.FOG_LINEAR, text: 'LINEAR' },
                { value: pc.FOG_EXP, text: 'EXP' },
                { value: pc.FOG_EXP2, text: 'EXP2' }
            ],
            value: (this.mekou.app.scene as any).fog
        });
        fogType.onChange = (val) => this.settingsLogic.setFog(val);
        envPanel.append(fogType);

        const fogDensity = new CustomSlider({ label: 'Density', min: 0, max: 0.1, precision: 3, value: (this.mekou.app.scene as any).fogDensity });
        fogDensity.onChange = (val: number) => { (this.mekou.app.scene as any).fogDensity = val; };
        envPanel.append(fogDensity);

        envPanel.append(jsx(Label, { text: 'LIGHTING', fontScale: 0.8, marginTop: 12 }));
        const skyIntensity = new CustomSlider({ label: 'Sky Intensity', min: 0, max: 10, value: this.mekou.app.scene.skyboxIntensity });
        skyIntensity.onChange = (val) => { (this.mekou.app.scene as any).skyboxIntensity = val; };
        envPanel.append(skyIntensity);

        const rotationSlider = new CustomSlider({
            label: 'Sky Rotation',
            min: 0, max: 360, precision: 0,
            value: 0
        });
        rotationSlider.onChange = (val: number) => {
            this.mekou.app.scene.skyboxRotation = new pc.Quat().setFromEulerAngles(0, val, 0);
        };
        envPanel.append(rotationSlider);

        settingsContent.append(envPanel);

        // --- Post Effects ---
        settingsContent.append(jsx(Label, { text: 'POST EFFECTS', class: 'settings-section-title' }));

        const aoRow = jsx(Container, { flex: true, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 });
        aoRow.append(jsx(Label, { text: 'Ambient Occlusion' }));
        const aoToggle = jsx(BooleanInput, { value: false });
        aoRow.append(aoToggle);
        settingsContent.append(aoRow);

        const aoSettings = jsx(Container, { hidden: true, class: 'ao-extra-settings', paddingLeft: 12 });

        const aoRadius = new CustomSlider({ label: 'Radius', min: 0, max: 20, value: 4 });
        aoRadius.onChange = (val) => this.settingsLogic.updateAO({ radius: val });
        aoSettings.append(aoRadius);

        const aoIntensity = new CustomSlider({ label: 'Intensity', min: 0, max: 5, value: 1 });
        aoIntensity.onChange = (val) => this.settingsLogic.updateAO({ intensity: val });
        aoSettings.append(aoIntensity);

        const aoSamples = new CustomSlider({ label: 'Samples', min: 1, max: 64, precision: 0, value: 16 });
        aoSamples.onChange = (val) => this.settingsLogic.updateAO({ samples: val });
        aoSettings.append(aoSamples);

        settingsContent.append(aoSettings);

        aoToggle.on('change', (val: boolean) => {
            this.settingsLogic.setAO(val);
            aoSettings.hidden = !val;
        });

        // --- Editor Section ---
        settingsContent.append(jsx(Label, { text: 'EDITOR PREFERENCES', class: 'settings-section-title' }));

        const flySpeedSlider = new CustomSlider({
            label: 'Fly Speed',
            min: 1, max: 100, precision: 0,
            value: this.settingsLogic.flySpeed
        });
        flySpeedSlider.onChange = (val: number) => this.settingsLogic.setFlySpeed(val);
        settingsContent.append(flySpeedSlider);

        const langOptions = [{ value: 'en', text: 'English' }, { value: 'jp', text: '日本語' }];
        const langSelect = new CustomDropdown({
            label: 'Language',
            options: langOptions,
            value: this.settingsLogic.language
        });
        langSelect.onChange = (val) => this.settingsLogic.setLanguage(val);
        settingsContent.append(langSelect);

        // --- Build Section ---
        settingsContent.append(jsx(Label, { text: 'BUILD SETTINGS', class: 'settings-section-title' }));

        const buildListContainer = jsx(Container, { class: 'build-scene-list', marginBottom: 12 });

        const renderBuildList = () => {
            while (buildListContainer.dom.firstChild) buildListContainer.dom.removeChild(buildListContainer.dom.firstChild);

            this.settingsLogic.sceneList.forEach(s => {
                const row = jsx(Container, { flex: true, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 4, class: 'scene-item-row' });
                row.append(jsx(Label, { text: s, fontScale: 0.8 }));

                const removeBtn = jsx(Button, { text: '×', class: 'remove-scene-btn' });
                removeBtn.on('click', () => {
                    this.settingsLogic.removeScene(s);
                    renderBuildList();
                });
                row.append(removeBtn);
                buildListContainer.append(row);
            });
        };
        renderBuildList();
        settingsContent.append(buildListContainer);

        const addSceneRow = jsx(Container, { flex: true, flexDirection: 'row', gap: 4, marginBottom: 12 });
        const sceneInput = jsx(Label, { text: 'Add Scene Path...', class: 'path-placeholder', flexGrow: 1 });
        const addBtn = jsx(Button, { text: '+', class: 'add-scene-btn' });
        addBtn.on('click', () => {
            const path = prompt("Enter scene JSON path:", "public/Templete/SceneList.json");
            if (path) {
                this.settingsLogic.addScene(path);
                renderBuildList();
            }
        });
        addSceneRow.append(sceneInput);
        addSceneRow.append(addBtn);
        settingsContent.append(addSceneRow);

        const buildGroup = jsx(Container, { flex: true, flexDirection: 'row', gap: 8 });


        const rustBtn = jsx(Button, { text: 'BUILD (Rust/Tauri)', class: 'export-btn', flexGrow: 1 });
        rustBtn.on('click', () => {
            console.log("Building for Rust...");
            this.settingsLogic.exportRustBuild();
        });

        const webBtn = jsx(Button, { text: 'BUILD (Web/HTML)', class: 'export-btn-alt', flexGrow: 1 });
        webBtn.on('click', () => {
            console.log("Building for Web...");
            this.settingsLogic.exportWebBuild();
        });

        buildGroup.append(rustBtn);
        buildGroup.append(webBtn);
        settingsContent.append(buildGroup);

        this.panel.append(settingsContent);
        document.body.appendChild(this.panel.dom);
    }

    public toggle() {
        const isHidden = this.panel.dom.style.display === 'none';
        this.panel.dom.style.display = isHidden ? 'flex' : 'none';
    }
}