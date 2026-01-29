import { ContextMenu } from '../../../components/ContextMenu';
import { ObjectCreator } from '../../../core/ObjectCreator';

export function showCreateObjectMenu(x: number, y: number, hierarchy: any, app: pc.AppBase) {
    ContextMenu.show(x, y, [
        {
            label: 'Create 3D > Box', action: () => {
                const e = ObjectCreator.createBox();
                hierarchy.refresh(app);
                if (e) hierarchy.selectEntity(e);
            }
        },
        {
            label: 'Create 3D > Sphere', action: () => {
                const e = ObjectCreator.createSphere();
                hierarchy.refresh(app);
                if (e) hierarchy.selectEntity(e);
            }
        },
        {
            label: 'Create 3D > Plane', action: () => {
                const e = ObjectCreator.createPlane();
                hierarchy.refresh(app);
                if (e) hierarchy.selectEntity(e);
            }
        },
        { label: '---', action: () => { } },
        {
            label: 'Create UI > World Text', action: () => {
                const e = ObjectCreator.createWorldText();
                hierarchy.refresh(app);
                if (e) hierarchy.selectEntity(e);
            }
        },
        {
            label: 'Create UI > Image', action: () => {
                const e = ObjectCreator.createUIImage();
                hierarchy.refresh(app);
                if (e) hierarchy.selectEntity(e);
            }
        },
        {
            label: 'Create UI > Button', action: () => {
                const e = ObjectCreator.createUIButton();
                hierarchy.refresh(app);
                if (e) hierarchy.selectEntity(e);
            }
        },
        {
            label: 'Create UI > Dialog', action: () => {
                const e = ObjectCreator.createDialog();
                hierarchy.refresh(app);
                if (e) hierarchy.selectEntity(e);
            }
        },
    ]);
}