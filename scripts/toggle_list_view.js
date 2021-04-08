'use strict';

import BevelView from "./bevel_view.js";

export default class ToggleListView {
    rootElement
    listContainer

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
        this.listContainer = listContainer
        this.rootElement.appendChild(listContainer)

        let toggleViewInitialized = false
        const shrinkThreshold = 0.9
        const intersectionHandler = (entries) => {
            if (!toggleViewInitialized) {
                toggleViewInitialized = true

                Array.from(listContainer.children).forEach((element) => {
                    element.style.width = element.clientWidth + "px"
                    element.style.height = element.clientHeight + "px"
                })
            }

            entries.forEach(entry => {
                if (shrinkThreshold < entry.intersectionRatio) {
                    entry.target.firstElementChild.classList.remove("shrink")
                } else {
                    entry.target.firstElementChild.classList.add("shrink")
                }
            })
        }

        const options = {
            root: listContainer,
            rootMargin: "0px -12px 0px -12px",
            threshold: [0.3, shrinkThreshold]
        }

        this.intersectionObserver = new IntersectionObserver(intersectionHandler, options)
        this.actionHandler = actionHandler

        const firstSpacer = window.document.createElement("div")
        firstSpacer.setAttribute("class", "toggle_list_spacer")
        listContainer.appendChild(firstSpacer)

        this.toggleList = Object.keys(state).reduce((acc, key) => {
            const toggleButtonContainer = window.document.createElement("div")
            toggleButtonContainer.setAttribute("class", "toggle_button_container")

            const toggleButtonBevelContainer = window.document.createElement("div")
            toggleButtonBevelContainer.setAttribute("class", "toggle_button_bevel_container")
            toggleButtonContainer.appendChild(toggleButtonBevelContainer)

            const toggleButtonBevel = new BevelView(false, ["toggle_bevel"])
            toggleButtonBevelContainer.appendChild(toggleButtonBevel.getElement())

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

            listContainer.appendChild(toggleButtonContainer)
            this.intersectionObserver.observe(toggleButtonContainer)

            acc[key] = toggleButtonBevel

            return acc
        }, {})

        const lastSpacer = window.document.createElement("div")
        lastSpacer.setAttribute("class", "toggle_list_spacer")
        listContainer.appendChild(lastSpacer)
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