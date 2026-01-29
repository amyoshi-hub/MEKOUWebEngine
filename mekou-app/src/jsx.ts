export const jsx = (Component: any, props: any, ...children: any[]) => {
    // Handle multiple classes (PCUI constructor only accepts a single token in 'class' prop)
    let extraClasses: string[] = [];
    if (props && props.class && typeof props.class === 'string' && props.class.includes(' ')) {
        const classes = props.class.split(/\s+/).filter(Boolean);
        if (classes.length > 1) {
            props.class = classes[0];
            extraClasses = classes.slice(1);
        }
    }

    // 1. PCUIのクラスを実体化（new）する
    const instance = new Component(props);

    // Apply extra classes
    if (extraClasses.length > 0) {
        extraClasses.forEach(cls => {
            if (cls) instance.dom.classList.add(cls);
        });
    }

    // 2. 子要素があれば追加する処理
    if (children) {
        children.forEach(child => {
            if (!child) return;
            const domToAppend = child.dom ? child.dom : child;
            if (domToAppend instanceof HTMLElement) {
                instance.dom.appendChild(domToAppend);
            }
        });
    }

    // 3. 最後に「作成したインスタンス」を返す！ ← ここが重要
    return instance;
};