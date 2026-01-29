
import { Panel, TreeView, TreeViewItem } from '@playcanvas/pcui';
import { jsx } from '../../../jsx';
import * as pc from 'playcanvas';
import { ObjectCreator } from '../../helpers/ObjectCreator';

export class HierarchyPanel {
    public dom: HTMLElement;
    public panel: any;
    private tree: any;
    private entityToItem: Map<pc.Entity, any> = new Map();
    public selectedEntities: pc.Entity[] = [];
    private app?: pc.AppBase;
    public onEntitySelected?: (entity: pc.Entity | null) => void;
    public onEntityDblClick?: (entity: pc.Entity) => void;
    public onHierarchyChanged?: () => void;

    constructor() {
        this.tree = jsx(TreeView, {
            allowDrag: true,
            allowReordering: true,
            multiSelect: true,
            class: 'hierarchy-tree'
        });

        this.panel = jsx(Panel, {
            headerText: 'HIERARCHY',
            class: 'hierarchy-panel',
            flex: true,
            flexDirection: 'column',
            resizable: 'right',
            width: 280
        });

        this.panel.append(this.tree);
        this.dom = this.panel.dom;

        // Tree interactions
        const updateCurrentSelection = () => {
            this.selectedEntities = this.tree.selected.map((item: any) => item.entity).filter(Boolean);
            const lastSelected = this.selectedEntities[this.selectedEntities.length - 1] || null;

            console.log('Hierarchy selection updated:', lastSelected ? lastSelected.name : 'none',
                'Count:', this.selectedEntities.length);

            if (this.onEntitySelected) {
                this.onEntitySelected(lastSelected);
            }
        };

        this.tree.on('select', (item: any) => {
            console.log('TreeView select event fired for:', item.entity?.name);
            updateCurrentSelection();
        });

        this.tree.on('deselect', (item: any) => {
            console.log('TreeView deselect event fired for:', item.entity?.name);
            updateCurrentSelection();
        });

        this.tree.on('selectionchange', (items: any[]) => {
            console.log('TreeView selectionchange event fired. Items count:', items?.length);
            updateCurrentSelection();
        });

        // Drag & Drop reordering
        this.tree.on('reorder', (item: any, parent: any, index: number) => {
            const entity = item.entity;
            const newParentEntity = parent?.entity;
            if (entity) {
                if (newParentEntity) {
                    entity.reparent(newParentEntity, index);
                } else if (entity.app) {
                    entity.reparent(entity.app.root, index);
                }
                if (this.onHierarchyChanged) this.onHierarchyChanged();
            }
        });

        // Add Drop support for assets from Project Panel
        this.tree.dom.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        });

        this.tree.dom.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            try {
                const data = JSON.parse(e.dataTransfer?.getData('text/plain') || '{}');
                if (data.type === 'model' || data.type === 'prefab') {
                    // Find which entity we dropped ONTO (if any)
                    const targetItem = (e.target as HTMLElement).closest('.pcui-treeview-item') as any;
                    const parentEntity = targetItem?.entity || null;

                    let entity: pc.Entity | undefined;
                    if (data.type === 'prefab' && data.data) {
                        entity = ObjectCreator.deserialize(data.data);
                    } else {
                        entity = ObjectCreator.createBox();
                        if (entity) entity.name = data.name || 'New Object';
                    }

                    if (entity) {
                        if (parentEntity) {
                            parentEntity.addChild(entity);
                        } else if (this.app) {
                            this.app.root.addChild(entity);
                        }
                        if (this.app) this.refresh(this.app);
                    }
                }
            } catch (err) {
                console.error("Hierarchy drop failed:", err);
            }
        });
    }

    public refresh(app: pc.AppBase) {
        this.app = app;
        console.log('Hierarchy refresh started for app:', app.root.name);
        // Save state
        const prevSelected = [...this.selectedEntities];

        // Clear tree
        if (this.tree.clear) {
            this.tree.clear();
        } else {
            while (this.tree.dom.firstChild) {
                this.tree.dom.removeChild(this.tree.dom.firstChild);
            }
        }
        this.entityToItem.clear();

        let count = 0;
        const buildTree = (entity: pc.Entity, parentItem: any) => {
            // Filter out internal editor entities
            if (entity.name === 'TransformGizmo' || entity.name === 'SceneViewCamera' || entity.name === 'EditorCamera') return;

            let icon = 'E259';
            if (entity.camera) icon = 'E212';
            if (entity.light) icon = 'E192';
            if (entity.model || entity.render) icon = 'E254';
            if (entity.name.includes('UI')) icon = 'E115';
            if (entity.name.includes('Player')) icon = 'E257';
            if (entity.children.length > 0 && !entity.render && !entity.camera && !entity.light) icon = 'E137';

            const item = jsx(TreeViewItem, {
                text: entity.name,
                open: true,
                icon: icon,
                class: 'hierarchy-item'
            });

            item.dom.addEventListener('dblclick', (e: MouseEvent) => {
                e.stopPropagation();
                if (this.onEntityDblClick) this.onEntityDblClick(entity);
            });

            // Critical link
            (item as any).entity = entity;
            this.entityToItem.set(entity, item);
            count++;

            if (parentItem) {
                parentItem.append(item);
            } else {
                this.tree.append(item);
            }

            entity.children.forEach(child => buildTree(child as pc.Entity, item));
        };

        app.root.children.forEach(child => buildTree(child as pc.Entity, null));
        console.log('Hierarchy tree built with', count, 'items');

        // Restore state
        if (prevSelected.length > 0) {
            const itemsToSelect: any[] = [];
            this.entityToItem.forEach((item, entity) => {
                if (prevSelected.includes(entity)) {
                    itemsToSelect.push(item);
                }
            });
            if (itemsToSelect.length > 0) {
                console.log('Restoring selection for', itemsToSelect.length, 'items');
                this.tree.selected = itemsToSelect;
                this.selectedEntities = itemsToSelect.map(i => i.entity);
            }
        }
    }

    public selectEntity(entity: pc.Entity | null) {
        console.log('selectEntity called for:', entity ? entity.name : 'null');
        if (!entity) {
            this.tree.selected = [];
            this.selectedEntities = [];
            if (this.onEntitySelected) this.onEntitySelected(null);
            return;
        }

        const item = this.entityToItem.get(entity);
        if (item) {
            console.log('Item found for entity, setting tree selection');
            this.tree.selected = [item];
            this.selectedEntities = [entity];
            if (this.onEntitySelected) this.onEntitySelected(entity);
        } else {
            console.warn('No TreeViewItem found for entity:', entity.name, '. Try refreshing hierarchy.');
        }
    }
}
