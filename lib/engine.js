import * as EventEmitter from 'events';

function hasShake(e1, e2, distance = 4) {
    return ((e1.clientY - e2.clientY) ** 2 + (e1.clientX - e2.clientX) ** 2) > distance;
}

class Engine {
    constructor () {
        this.containers = [];
        this.emitter = new EventEmitter();
        const prevent = e => {
            if (!this.boosted) {
                return null;
            }
        
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        document.addEventListener('selectstart', prevent, true);
        document.addEventListener('dragstart', prevent, true);
    }

    addContainer(container) {
        this.containers.push(container);
    }

    from (element, cb) {
        const mousedown = e => {
            if (e.which === 3 || e.button === 2) {
                return;
            }

            const com = cb(e);
            if (!com) {
                return;
            }

            this.decorate(com, e);
        }
        element.addEventListener('mousedown', mousedown);
        return () => {
            element.removeEventListener('mousedown', mousedown);
        };
    }

    decorate (node, event) {
        this.location = null;

        const drag = e => {
            const container = this.chooseContainer(e);
            if (container) {
                this.location = container.orient(node, e);
            } else {
                this.location = null;
            }
            this.emitter.emit('drag', e, node, this.location);
        };
        const dragstart = () => {
            this.emitter.emit('dragstart', event, node);
        };
        const move = e => {
            if (this.isMoving) {
                drag(e);
                return;
            }
      
            if (hasShake(e, event)) {
              this.isMoving = true;
      
              event.shaked = true;
      
                dragstart();
                drag(e);
            }
        };

        const over = () => {
            let exception;
            if (this.isMoving) {
                try {
                    this.emitter.emit('dragend', node, this.location);
                } catch (ex) {
                    exception = ex;
                }
            }
      
            this.isMoving = false;
      
            document.removeEventListener('mousemove', move, true);
            document.removeEventListener('mouseup', over, true);
            if (exception) {
                throw exception;
            }
        };

        document.addEventListener('mousemove', move, true);
        document.addEventListener('mouseup', over, true);
    }

    onDragstart (func) {
        this.emitter.on('dragstart', func);
        return () => {
          this.emitter.removeListener('dragstart', func);
        };
      }
    
    onDrag (func) {
        this.emitter.on('drag', func);
        return () => {
          this.emitter.removeListener('drag', func);
        };
      }
    
    onDragend (func) {
        this.emitter.on('dragend', func);
        return () => {
          this.emitter.removeListener('dragend', func);
        };
    }

    on (obj) {
        Object.entries(obj).forEach(([key, func]) => {
            if (this[key] && typeof func === 'function') {
                this[key](func);
            }
        });
    }

    chooseContainer(e) {
        let container = this.containers.find(container => container.isEnabled() && container.isEnter(e));
        return container;
    }
}
window.engine = new Engine();
export default window.engine;
