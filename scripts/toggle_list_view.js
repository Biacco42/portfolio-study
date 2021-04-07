'use strict';

import BevelView from "./bevel_view.js";
import Util from "./util.js";

export default class ToggleListView {
    rootElement

    toggleList

    actionHandler
    intersectionObserver

    constructor(label, state, actionHandler) {
        this.rootElement = window.document.createElement("div")

        const labelElement = window.document.createElement("p")
        labelElement.innerHTML = label
        this.rootElement.appendChild(labelElement)

        const listContainer = window.document.createElement("div")
        listContainer.setAttribute("class", "toggle_list_container")
        this.rootElement.appendChild(listContainer)

        const intersectionHandler = (entries) => {
            entries.forEach(entry => {
                entry.target.style.opacity = Math.max(0.0, entry.intersectionRatio * 2.0 - 1.0)
            })
        }

        const options = {
            root: listContainer,
            rootMargin: "0px -10px 0px -10px",
            threshold: Util.range(0.0, 1.0, 0.1)
        }

        this.intersectionObserver = new IntersectionObserver(intersectionHandler, options)
        this.actionHandler = actionHandler

        this.toggleList = Object.keys(state).reduce((acc, key) => {
            const toggleButtonBevel = new BevelView(false, ["toggle_bevel"])

            const toggleButton = window.document.createElement("a")
            toggleButton.innerHTML = key
            toggleButton.setAttribute("href", "#")
            toggleButton.setAttribute("class", "toggle_button")
            toggleButton.onclick = (event) => {
                event.preventDefault()
                this.actionHandler(key)
            }
            toggleButtonBevel.setContentElement(toggleButton)

            toggleButtonBevel.showContent(true)
            toggleButtonBevel.bevel(state[key])

            listContainer.appendChild(toggleButtonBevel.getElement())
            this.intersectionObserver.observe(toggleButtonBevel.getElement())

            acc[key] = toggleButtonBevel

            return acc
        }, {})
    }

    getElement() {
        return this.rootElement
    }

    setState(toggleState) {
        Object.keys(toggleState).forEach(key => {
            if (typeof this.toggleList[key] !== "undefined") {
                const target = this.toggleList[key]
                target.bevel(toggleState[key])

                if (toggleState[key]) {
                    target.contentElement.firstElementChild.classList.remove("disabled")
                } else {
                    target.contentElement.firstElementChild.classList.add("disabled")
                }
            }
        })
    }
}