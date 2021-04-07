'use strict';

import Util from "./util.js"

export default class BevelView {
    bevelElement
    contentElement

    constructor(isPosi) {
        const bevelElement = window.document.createElement("div")
        const bevelStyle = isPosi ? "bevel" : "nega_bevel"
        bevelElement.setAttribute("class", bevelStyle)
        this.bevelElement = bevelElement

        const contentElement = window.document.createElement("div")
        contentElement.setAttribute("class", "bevel_content")
        this.contentElement = contentElement

        this.bevelElement.appendChild(contentElement)
    }

    getElement() {
        return this.bevelElement
    }

    setContentElement(element) {
        this.removeContentElement()
        this.contentElement.appendChild(element)
    }

    removeContentElement() {
        Util.removeAllChildren(this.contentElement)
    }

    bevel(isEnabled) {
        if (isEnabled) {
            this.bevelElement.classList.add("shown")

            return new Promise((resolve, _) => {
                window.setTimeout(() => {
                    resolve()
                }, 1000)
            })
        } else {
            this.bevelElement.classList.remove("shown")

            return new Promise((resolve, _) => {
                window.setTimeout(() => {
                    resolve()
                }, 1000)
            })
        }
    }

    showContent(isEnabled) {
        if (isEnabled) {
            this.contentElement.classList.add("shown")

            return new Promise((resolve, _) => {
                window.setTimeout(() => {
                    resolve()
                }, 1000)
            })
        } else {
            this.contentElement.classList.remove("shown")

            return new Promise((resolve, _) => {
                window.setTimeout(() => {
                    resolve()
                }, 1000)
            })
        }
    }
}