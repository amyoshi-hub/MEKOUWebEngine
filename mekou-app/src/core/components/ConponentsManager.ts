import * as pc from 'playcanvas';
import * as IF from '../../editor/ui/panels/InspectorFunction';

/**
 * ComponentsManager handles the mapping between selected entities 
 * and their corresponding UI components in the inspector.
 */
export class ComponentsManager {
    private static instance: ComponentsManager;
    private entity: pc.Entity | null = null;

    private constructor() { }

    public static getInstance(): ComponentsManager {
        if (!ComponentsManager.instance) {
            ComponentsManager.instance = new ComponentsManager();
        }
        return ComponentsManager.instance;
    }

    public setEntity(entity: pc.Entity) {
        this.entity = entity;
        console.log(`ComponentsManager: Entity set to ${entity.name}`);
    }

    /**
     * Build and return a list of UI panels/elements for the current entity.
     */
    public getComponentsUI(): any[] {
        if (!this.entity) return [];

        const uiElements: any[] = [];
        const entity = this.entity;

        // 1. Transform / Base info
        uiElements.push(IF.drawEntityBase(entity));

        // 2. Physics logic (Binding state)
        // We can handle the "setting" logic here or delegate to IF
        // Note: The toggle itself can be managed here to ensure state binding

        // 3. Render / Materials
        if (entity.render) {
            const materialPanel = IF.drawMaterial(entity);
            if (materialPanel) uiElements.push(materialPanel);
        }

        // 4. Lights
        if (entity.light) {
            const lightPanel = IF.drawLight(entity);
            if (lightPanel) uiElements.push(lightPanel);
        }

        // 5. Camera
        if (entity.camera) {
            const cameraPanel = IF.drawCamera(entity);
            if (cameraPanel) uiElements.push(cameraPanel);
        }

        // 6. Scripts / Custom Logic (AI, Sound, etc.)
        if (entity.script) {
            const ai = IF.drawSimpleAI(entity);
            if (ai) uiElements.push(ai);

            const sound = IF.drawSoundSystem(entity);
            if (sound) uiElements.push(sound);
        }

        return uiElements;
    }
}