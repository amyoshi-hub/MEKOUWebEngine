import { TransformGizmo } from "./TransformGizmo";
import * as pc from 'playcanvas';
import { CameraMove } from '../helpers/CameraMove';
import { ComponentsManager } from "../../core/components/ConponentsManager";

export class SelectionManager {
    private static instance: SelectionManager;
    public selectedEntity: pc.Entity | null = null;
    private app: pc.AppBase | null = null;

    // Callbacks for UI synchronization
    public onSelectionChanged: (entity: pc.Entity | null) => void = () => { };

    private constructor() { }

    public static getInstance(): SelectionManager {
        if (!SelectionManager.instance) {
            SelectionManager.instance = new SelectionManager();
        }
        return SelectionManager.instance;
    }

    public setApp(app: pc.AppBase) {
        this.app = app;
    }

    public setSelection(entity: pc.Entity | null) {
        this.selectedEntity = entity;

        // Update Gizmo
        TransformGizmo.setSelection(entity);

        // Notify ComponentsManager to update state/UI binding
        if (entity) {
            ComponentsManager.getInstance().setEntity(entity);
        }

        // Notify UI (Inspector, etc.)
        this.onSelectionChanged(entity);
    }

    public onEntityDblClick(entity: pc.Entity): void {
        this.setSelection(entity);
        if (this.app) {
            CameraMove.focus(this.app, entity);
        }
    }
}