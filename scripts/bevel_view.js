'use strict';

import Util from "./util.js"

export default class BevelView {
    bevelElement
    contentElement

    constructor(isPosi, extraClasses) {
        const bevelElement = window.document.createElement("div")
        bevelElement.setAttribute("class", "bevel")
        if (!isPosi) {
            bevelElement.classList.add("nega")
        }

        if (extraClasses) {
            extraClasses.forEach((extraClass) => {
                bevelElement.classList.add(extraClass)
            })
        }

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