
import { Container, Label, NumericInput } from '@playcanvas/pcui';
import { jsx } from '../../../jsx';

/**
 * Custom Slider with internal numeric value and click-drag support
 */
export class CustomSlider {
    public dom: HTMLElement;
    public container: any;
    private input: any;
    private slider: any;
    private _value: number = 0;
    public onChange?: (val: number) => void;

    constructor(props: { min?: number, max?: number, precision?: number, value?: number, step?: number, label?: string }) {
        this._value = props.value ?? 0;
        const min = props.min ?? 0;
        const max = props.max ?? 100;
        const precision = props.precision ?? 2;
        const step = props.step ?? (1 / Math.pow(10, precision));

        this.container = jsx(Container, { class: 'custom-slider-container', flex: true, flexDirection: 'row', alignItems: 'center' });

        if (props.label) {
            this.container.append(jsx(Label, { text: props.label, class: 'custom-slider-label' }));
        }

        // Numeric Input with click-drag logic
        this.input = jsx(NumericInput, {
            value: this._value,
            min: min,
            max: max,
            precision: precision,
            step: step,
            class: 'custom-slider-numeric'
        });

        // The "Slider" part - using a div for custom look
        this.slider = document.createElement('div');
        this.slider.className = 'custom-slider-track';
        const fill = document.createElement('div');
        fill.className = 'custom-slider-fill';
        this.slider.appendChild(fill);

        const updateFill = () => {
            const percent = ((this._value - min) / (max - min)) * 100;
            fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        };

        const setValue = (val: number) => {
            this._value = Math.max(min, Math.min(max, Number(val.toFixed(precision))));
            this.input.value = this._value;
            updateFill();
            if (this.onChange) this.onChange(this._value);
        };

        // Slider Interaction
        this.slider.addEventListener('mousedown', (e: MouseEvent) => {
            const onMove = (me: MouseEvent) => {
                const rect = this.slider.getBoundingClientRect();
                const p = (me.clientX - rect.left) / rect.width;
                setValue(min + p * (max - min));
            };
            const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
            onMove(e);
        });

        // Numeric Input Drag Interaction (Horizontal Drag on value)
        let isDraggingInput = false;

        this.input.dom.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.button !== 0) return; // Left click only
            isDraggingInput = true;
            this.input.dom.requestPointerLock();
        });

        window.addEventListener('mousemove', (e: MouseEvent) => {
            if (!isDraggingInput) return;
            const delta = e.movementX;
            const sensitivity = (max - min) / 200; // Adjust based on range
            setValue(this._value + delta * sensitivity);
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingInput) {
                isDraggingInput = false;
                if (document.pointerLockElement) document.exitPointerLock();
            }
        });

        this.input.on('change', (val: number) => setValue(val));

        this.container.append(this.slider);
        this.container.append(this.input);
        this.dom = this.container.dom;
        updateFill();
    }

    set value(v: number) {
        this._value = v;
        this.input.value = v;
        // update fill...
    }
}

/**
 * Custom Dropdown using styled select
 */
export class CustomDropdown {
    public dom: HTMLElement;
    private select: HTMLSelectElement;
    public onChange?: (val: string) => void;

    constructor(props: { options: { value: any, text: string }[], value?: any, label?: string }) {
        const container = document.createElement('div');
        container.className = 'custom-dropdown-container';

        if (props.label) {
            const label = document.createElement('label');
            label.innerText = props.label;
            label.className = 'custom-dropdown-label';
            container.appendChild(label);
        }

        this.select = document.createElement('select');
        this.select.className = 'custom-dropdown-select';

        props.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = String(opt.value);
            option.text = opt.text;
            if (String(opt.value) === String(props.value)) option.selected = true;
            this.select.appendChild(option);
        });

        this.select.addEventListener('change', () => {
            if (this.onChange) this.onChange(this.select.value);
        });

        container.appendChild(this.select);
        this.dom = container;
    }

    set value(v: string) {
        this.select.value = v;
    }
}

/**
 * Custom Vector Input with horizontal drag support on each label
 */
export class CustomVectorInput {
    public dom: HTMLElement;
    public container: any;
    private inputs: any[] = [];
    public onChange?: (val: number[]) => void;

    constructor(props: { dimensions?: number, value?: number[], precision?: number, labels?: string[] }) {
        const dims = props.dimensions ?? 3;
        const precision = props.precision ?? 2;
        const labels = props.labels ?? ['X', 'Y', 'Z', 'W'];
        const values = props.value ?? [0, 0, 0, 0];

        this.container = jsx(Container, { class: 'custom-vector-container', flex: true, flexDirection: 'row' });

        for (let i = 0; i < dims; i++) {
            const inputContainer = jsx(Container, { class: 'vector-axis-container', flex: true, flexDirection: 'row', alignItems: 'center', flexGrow: 1 });

            const axisLabel = jsx(Label, { text: labels[i] || '', class: 'vector-axis-label' });
            const numeric = jsx(NumericInput, {
                value: values[i] || 0,
                precision: precision,
                step: 0.1,
                min: -1000000,
                max: 1000000,
                class: 'vector-axis-input'
            });

            // Drag Interaction
            let isDragging = false;
            axisLabel.dom.addEventListener('mousedown', (e: MouseEvent) => {
                if (e.button !== 0) return;
                isDragging = true;
                axisLabel.dom.requestPointerLock();
            });

            window.addEventListener('mousemove', (e: MouseEvent) => {
                if (!isDragging) return;
                const delta = e.movementX;
                const newVal = numeric.value + delta * 0.1;
                numeric.value = Number(newVal.toFixed(precision));
                updateValues();
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    if (document.pointerLockElement) document.exitPointerLock();
                }
            });

            numeric.on('change', () => updateValues());

            inputContainer.append(axisLabel);
            inputContainer.append(numeric);
            this.container.append(inputContainer);
            this.inputs.push(numeric);
        }

        const updateValues = () => {
            const vals = this.inputs.map(inp => inp.value);
            if (this.onChange) this.onChange(vals);
        };

        this.dom = this.container.dom;
    }

    set value(vals: number[]) {
        vals.forEach((v, i) => {
            if (this.inputs[i]) this.inputs[i].value = v;
        });
    }
}
