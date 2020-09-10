class Controller {
    constructor() {
        window.engine.onDragend((dragment, location) => {
            if (location) {
              const container = location.getContainer();
              const node = container.insert(dragment, location);
              if (node) {
                this.select(node);
              }
            }
        });
    }

    select(node) {
        console.log(node);
    }
}

window.controller = new Controller();
export default window.controller;
