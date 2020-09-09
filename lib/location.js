export default class Location {
    constructor(container, props) {
        this.container = container;
        this.index = props.nearIndex;
        this.near = props.near;
        this.nearAfter = props.nearAfter;
        this.nearEdge = props.nearEdge;
        this.nearContainerDisplay = props.nearContainerDisplay;

        if (this.nearAfter && this.index >= 0) {
            this.index += 1;
        }
    }

    getIndex() {
        return this.index;
    }

    getNear() {
        return this.near;
    }

    getNearRect() {
        return this.near ? this.near.getRect() : null;
    }

    isNearEdge() {
        return this.nearEdge;
    }

    isNearAfter() {
        return this.nearAfter;
    }

    isVertical() {
        return (
          !this.isNearEdge()
          && ((this.near && this.near.isInline())
            || (this.nearContainerDisplay
              && this.nearContainerDisplay.display === DisplayType.FLEX
              && this.nearContainerDisplay.flexDirection === FlexDirection.ROW))
        );
    }

    getContainer() {
        return this.container;
    }
};
