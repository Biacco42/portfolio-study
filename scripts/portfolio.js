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
    view = new View(document, (viewEvent, eventValue) => {
        switch (viewEvent) {
            case "selectAuthor":
                state.selectAuthor(eventValue)
                break
            case "selectTag":
                state.selectTag(eventValue)
                break
        }
    })

    state = new State(contentsList, 0, 16, (stateEvent, eventValue) => {
        switch (stateEvent) {
            case "selectedAuthors":
                view.showAuthors(eventValue)
                break
            case "selectedTags":
                view.showTags(eventValue)
                break
            case "pageIndicies":
                break
            case "pageContents":
                view.showPage(eventValue)
                break
        }
    })
}
