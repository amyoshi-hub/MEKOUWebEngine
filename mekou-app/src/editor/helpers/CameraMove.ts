import * as pc from 'playcanvas';

export class CameraMove {
    private static isFocusing = false;

    public static focus(app: pc.AppBase, target: pc.Entity) {
        if (this.isFocusing) return;

        const editorCam = app.root.findByName('EditorCamera') as pc.Entity;
        if (!editorCam) return;

        this.isFocusing = true;
        const targetPos = target.getPosition().clone();

        // Calculate an ideal offset based on target's bounding box or a default
        const offset = new pc.Vec3(4, 4, 4);
        const startPos = editorCam.getPosition().clone();
        const endPos = targetPos.clone().add(offset);

        const duration = 0.6;
        let elapsed = 0;

        const onUpdate = (dt: number) => {
            elapsed += dt;
            const t = Math.min(elapsed / duration, 1);

            // Cubic ease out
            const ease = 1 - Math.pow(1 - t, 3);

            const currentPos = new pc.Vec3().lerp(startPos, endPos, ease);
            editorCam.setPosition(currentPos);
            editorCam.lookAt(targetPos);

            if (t >= 1) {
                app.off('update', onUpdate);
                this.isFocusing = false;

                // Sync internal rotation of camera controller
                const rot = editorCam.getLocalEulerAngles();
                app.fire('editor:camera:moved', { x: rot.x, y: rot.y });
            }
        };

        app.on('update', onUpdate);
    }
}
