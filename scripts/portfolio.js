'use strict';

import State from "./portfolio_state.js"
import View from "./portfolio_view.js"

let state
let view

window.onload = (_) => {
    window.scrollTo(0, 0)
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
            case "selectPage":
                state.selectPage(eventValue)
                break
        }
    })

    state = new State(contentsList, 0, 12, (stateEvent, eventValue) => {
        switch (stateEvent) {
            case "selectedAuthors":
                view.showAuthors(eventValue)
                break
            case "selectedTags":
                view.showTags(eventValue)
                break
            case "pageIndicies":
                view.showPageIndicator(eventValue)
                break
            case "pageContents":
                view.showPage(eventValue)
                break
        }
    })
}
