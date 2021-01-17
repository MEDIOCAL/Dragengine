class Controller {
    constructor() {
        window.engine.onDragend((dragment, location) => {
            if (location) {
              const container = location.getContainer();
              const node = container.insert(dragment, location);
              if (node) {
                this.render(node);
              }
            }
        });
    }

    render(node) {
      console.log(node);
      const container = node.parent;
      container.$ele.innerHTML = '';
      for (const child of container.children) {
        container.$ele.appendChild(child.$ele);
      }
      
    }
}

window.controller = new Controller();
export default window.controller;
