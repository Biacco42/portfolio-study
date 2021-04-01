'use strict';

import Util from "./util.js"
import State from "./portfolio_state.js"
import View from "./portfolio_view.js"

let state
let view

window.onload = (_) => {
    fetch("contents-list.json")
        .then(response => {
            return response.json()
        })
        .then(responseJSON => {
            onContentsListReceived(responseJSON)
        })
}

window.onresize = (_) => {
    view.onResize(state.getPageContents())
}

function onContentsListReceived(contentsList) {
    view = new View(document)
    state = new State(contentsList, 0, 16, (stateEvent, stateValue) => {
        switch (stateEvent) {
            case "selectedAutohrs":
                break
            case "selectedTags":
                break
            case "pageIndicies":
                break
            case "pageContents":
                view.showPage(stateValue)
                break
        }
    })
}
