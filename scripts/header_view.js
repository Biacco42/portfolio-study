'use strict';

import BevelView from "./bevel_view.js"
import ToggleListView from "./toggle_list_view.js"

export default class HeaderView {
    bevelView
    authorsListView
    tagsListView

    constructor(actionHandler) {
        this.bevelView = new BevelView(true)

        const content = window.document.createElement("div")
        const title = window.document.createElement("h1")
        title.innerHTML = "Hello Portfolio!"
        content.appendChild(title)

        this.authorsListView = new ToggleListView("author")
        this.tagsListView = new ToggleListView("tag")

        content.appendChild(this.authorsListView.getElement())
        content.appendChild(this.tagsListView.getElement())

        this.bevelView.setContentElement(content)
    }

    show() {
        return Promise.all([this.bevelView.bevel(true), this.bevelView.showContent(true)])
    }

    hide() {
        return Promise.all([this.bevelView.bevel(false), this.bevelView.showContent(false)])
    }

    getElement() {
        return this.bevelView.getElement()
    }
}
