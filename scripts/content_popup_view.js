'use strict';

import BevelView from "./bevel_view.js";

export default class ContentPopupView {
    rootView
    closeIndicator
    bevelView
    relativeContentsContainer

    constructor(content) {
        this.rootView = window.document.createElement("div")
        this.rootView.id = "popup_container_view"

        this.closeIndicator = window.document.createElement("div")
        this.closeIndicator.id = "close_indicator"
        this.rootView.appendChild(this.closeIndicator)

        const xMark = window.document.createElement("div")
        xMark.id = "x_mark"
        xMark.textContent = "✕"
        this.closeIndicator.appendChild(xMark)

        const closeLabel = window.document.createElement("div")
        closeLabel.id = "close_label"
        closeLabel.textContent = "close"
        this.closeIndicator.appendChild(closeLabel)

        this.bevelView = new BevelView()

        this.rootView.appendChild(this.bevelView.getElement())

        this.relativeContentsContainer = window.document.createElement("div")
    }

    getElement() {
        return this.rootView
    }

    setState(state) {

    }

    show() {}

    hide() {}
}
