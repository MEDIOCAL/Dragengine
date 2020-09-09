import engine from './engine.js';
import Node from './node.js';

class Container extends Node {
    constructor(props) {
        super(props);
        engine.addContainer(this);
        this.document = props.ele;
        this.isContainer = true;
    }

    mounted(ele) {
        this.document = ele;
    }

    getBounds() {
        return this.document.getBoundingClientRect();
    }

    isEnabled() {
        return this.document !== null;
    }

    isEnter(e) {
        const rect = this.getBounds();
        if (!rect) {
            return false;
        }
        return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    }

    orient(com, e) {
        return this.locate(com, e);
    }
}
window.Container = Container;
export default Container;
