import { MekouApp } from "../core/MekouApp";
import { MainLayout } from "../editor/ui/MainLayout";
import { SceneLoader } from "../core/SceneManage/SceneLoader/SceneLoader";

export class Engine {
    public static async setup(isDev: boolean = true) {
        console.log("ENGINE: Initializing setup... mode:", isDev ? "DEV" : "PROD");

        // 1. Get/Create Canvas
        let canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
        if (!canvas) {
            console.log("ENGINE: Canvas not found, creating new one...");
            canvas = document.createElement('canvas');
            canvas.id = 'application-canvas';
            document.body.appendChild(canvas);
        }

        // 2. Initialize MekouApp
        const mekou = new MekouApp(canvas);
        await mekou.init();
        console.log("ENGINE: MekouApp initialized.");

        // 3. Load Scene from Template
        const loader = new SceneLoader(mekou.app);
        await loader.loadScene('Templete/SceneList.json');
        console.log("ENGINE: Scene loaded.");

        // 4. Setup Player (After scene loaded so it can find MekouPlayer)
        mekou.setupPlayer();

        // 4. Mode specific setup
        if (isDev) {
            console.log("ENGINE: Launching in DEV mode (Editor)");
            const root = document.getElementById("root");
            if (root) {
                // Clear root to be safe
                root.innerHTML = '';

                const layout = new MainLayout(mekou);
                root.appendChild(layout.dom);
            } else {
                console.error("ENGINE: #root element not found in index.html!");
            }
        } else {
            console.log("ENGINE: Launching in PRODUCTION mode");
            mekou.player.switchController('FPS');
            mekou.app.timeScale = 1; // Start simulation immediately
        }
    }
}