'use strict';

export default class ToggleListView {
    tempElement

    constructor(label) {
        this.tempElement = window.document.createElement("p")
        this.tempElement.innerHTML = label
    }

    getElement() {
        return this.tempElement
    }
}