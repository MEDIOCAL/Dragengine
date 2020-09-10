import * as EventEmitter from 'events';
import Location from './location';

class Node {
    constructor(props = {}) {
        this.parent = null;
        this.children = props.children || [];
        this.$ele = props.ele;
        this.emitter =  new EventEmitter();
    }

    setParent(ele) {
        this.parent = ele;
    }

    canDropIn() {
        return this.isContainer;
    }

    locate(com, e) {
        const { children } = this;
        let node;
        let rect;
        let distance;
        let near = null;
        let nearDistance = null;
        let nearEdge = false;

        const edgeRect = this.getRect();

        if (this.canDropIn()) {
            let location;
            let nearIndex = 0;
            let nearRect = null;
            let nearAfter;

            for (let i = 0, l = children.length; i < l; i++) {
                node = children[i];
                rect = node.getRect();

                if (!rect) {
                    continue;
                }

                if (node.isContainer && isPointInRect(e, rect)) {
                    location = node.locate(node, e);
                    if (location) {
                        return location;
                    }
                    distance = 0;
                } else {
                    distance = distanceToRect(e, rect);
                }

                if (distance === 0) {
                    nearDistance = distance;
                    near = node;
                    nearIndex = i;
                    nearRect = rect;
                    break;
                }
          
                if (nearDistance === null || distance < nearDistance) {
                    nearDistance = distance;
                    near = node;
                    nearIndex = i;
                    nearRect = rect;
                }
            }

            let nearContainerDisplay;
            if (near) {
                const parentElement = this.$ele.parentElement;
                const parentStyle = window.getComputedStyle(parentElement);
                nearContainerDisplay = {
                  display: parentStyle.getPropertyValue('display'),
                };
                if (/^flex/.test(nearContainerDisplay.display)) {
                  nearContainerDisplay.flexDirection =
                    parentStyle.getPropertyValue('flex-direction') || 'row';
                }
            }

            if (near && nearRect) {
                nearAfter = isNearAfter(e, nearRect, near.isInline(), nearContainerDisplay);
            }

            if (nearDistance !== 0) {
                const edgeDistance = distanceToEdge(e, edgeRect);
                distance = edgeDistance.distance;
                if (nearDistance === null || distance < nearDistance) {
                    nearAfter = edgeDistance.nearAfter;
                    nearIndex = nearAfter ? children.length - 1 : 0;
                    nearEdge = true;
                }
            }

            return new Location(this, {
                near,
                nearAfter,
                nearContainerDisplay,
                nearEdge,
                nearIndex,
            });
        }

        if (!edgeRect) {
            return null;
        }

        if (isPointInRect(e, edgeRect)) {
            for (let i = 0, l = children.length; i < l; i++) {
                node = children[i];
        
                rect = node.getRect();
                if (!node.isContainer || !rect || rect.width <= 0 || rect.height <= 0) {
                    continue;
                }
            
                distance = distanceToRect(e, rect);
            
                if (distance === 0) {
                    near = node;
                    break;
                }
            
                if (nearDistance === null || distance < nearDistance) {
                    nearDistance = distance;
                    near = node;
                }
            }
            return near ? near.locate(com, e) : null;
        }
      
        return null;
    }

    isInline() {
        const nativeNode = this.$ele;
        if (!nativeNode) {
            return false;
        }
        const style = window.getComputedStyle(nativeNode);
        return /^inline/.test(style.getPropertyValue('display'));
    }

    getRect() {
        if (this.$ele) {
            return this.$ele.getBoundingClientRect();
        } else {
            return null;
        }
    }

    insert(node, location, index) {
        if (index == null) {
            index = location ? location.getIndex() : this.children.length;
            if (index === null) {
                return node instanceof Node ? node : null;
            }
        }
        if (!(node instanceof Node)) {
            return null;
        }
    
        const i = this.children.indexOf(node);
        if (i < 0) {
            node.setParent(this);
            if (index < this.children.length) {
                this.children.splice(index, 0, node);
            } else {
                this.children.push(node);
            }
        } else {
            if (index > i) {
                index -= 1;
            }
            if (index === i) {
                return node;
            }
            this.children.splice(i, 1);
            this.children.splice(index, 0, node);
        }
    
        this.emitter.emit('childrenchange', this.children);
        return node;
    }

    onChildrenChange(func) {
        this.emitter.on('childrenchange', func);
        return () => {
            this.emitter.removeListener('childrenchange', func);
        };
    }
};

function isPointInRect(point, rect) {
    return (
        point.clientY >= rect.top
        && point.clientY <= rect.bottom
        && (point.clientX >= rect.left && point.clientX <= rect.right)
    );
}

function distanceToRect(point, rect) {
    let minX = Math.min(Math.abs(point.clientX - rect.left), Math.abs(point.clientX - rect.right));
    let minY = Math.min(Math.abs(point.clientY - rect.top), Math.abs(point.clientY - rect.bottom));
    if (point.clientX >= rect.left && point.clientX <= rect.right) {
        minX = 0;
    }
    if (point.clientY >= rect.top && point.clientY <= rect.bottom) {
        minY = 0;
    }
  
    return Math.sqrt(minX ** 2 + minY ** 2);
}

function distanceToEdge(point, rect) {
    const distanceTop = Math.abs(point.clientY - rect.top);
    const distanceBottom = Math.abs(point.clientY - rect.bottom);
  
    return {
      distance: Math.min(distanceTop, distanceBottom),
      nearAfter: distanceBottom < distanceTop,
    };
}

function isNearAfter(point, rect, inline, containerDisplay) {
    if (
      inline
      || (containerDisplay
        && containerDisplay.display === 'flex'
        && (containerDisplay.flexDirection === 'row'
          || containerDisplay.flexDirection === 'row-reverse'))
    ) {
      return (
        Math.abs(point.clientX - rect.left) + Math.abs(point.clientY - rect.top) >
        Math.abs(point.clientX - rect.right) + Math.abs(point.clientY - rect.bottom)
      );
    }
    return Math.abs(point.clientY - rect.top) > Math.abs(point.clientY - rect.bottom);
}
window.Node = Node;
export default Node;
