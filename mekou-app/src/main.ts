import { Engine } from "./engine/engine";
import './styles.css';

async function init() {
  await Engine.setup(true); // Default to dev mode for now
}

init();