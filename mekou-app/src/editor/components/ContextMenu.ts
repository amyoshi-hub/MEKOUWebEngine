import { Container, Button } from '@playcanvas/pcui';
import { jsx } from '../../jsx';

export class ContextMenu {
    private static currentMenu: HTMLElement | null = null;

    static hide() {
        if (this.currentMenu) {
            this.currentMenu.remove();
            this.currentMenu = null;
        }
    }

    static show(x: number, y: number, items: { label: string, action: () => void }[]) {
        this.hide();

        const container = jsx(Container, {
            class: 'mekou-context-menu',
            flex: true,
            flexDirection: 'column'
        }) as any;

        const dom = container.dom;
        dom.style.position = 'fixed';
        dom.style.left = `${x}px`;
        dom.style.top = `${y}px`;
        dom.style.zIndex = '10000';
        dom.style.backgroundColor = 'var(--bg-panel)';
        dom.style.border = '1px solid var(--border)';
        dom.style.padding = '4px';
        dom.style.borderRadius = '8px';
        dom.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';

        items.forEach(item => {
            if (item.label === '---') {
                const hr = document.createElement('div');
                hr.style.height = '1px';
                hr.style.background = 'var(--border)';
                hr.style.margin = '4px 0';
                container.append(hr);
            } else {
                const btn = jsx(Button, {
                    text: item.label,
                    class: 'context-menu-item'
                }) as any;

                btn.dom.style.textAlign = 'left';
                btn.dom.style.border = 'none';
                btn.dom.style.backgroundColor = 'transparent';
                btn.dom.style.width = '100%';
                btn.dom.style.padding = '6px 12px';
                btn.dom.style.color = 'var(--text-main)';

                btn.on('click', () => {
                    item.action();
                    this.hide();
                });

                // Simplified hover
                btn.dom.onmouseenter = () => btn.dom.style.backgroundColor = 'var(--primary)';
                btn.dom.onmouseleave = () => btn.dom.style.backgroundColor = 'transparent';

                container.append(btn);
            }
        });

        document.body.appendChild(dom);
        this.currentMenu = dom;

        // Auto close on external click
        const onOutsideClick = (e: MouseEvent) => {
            if (!dom.contains(e.target as Node)) {
                this.hide();
                window.removeEventListener('click', onOutsideClick);
            }
        };
        setTimeout(() => window.addEventListener('click', onOutsideClick), 0);
    }
}
