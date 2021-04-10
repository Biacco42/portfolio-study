'use strict';

import PortfolioState from "./portfolio_state.js"
import PortfolioView from "./portfolio_view.js"

let portfolioState
let portfolioView

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
    portfolioView.onResize(portfolioState.getPageContents())
}

window.onpopstate = (popState) => {
    if (popState.state) {
        portfolioState.deserialize(popState.state)
    } else {
        const params = new URLSearchParams(window.location.search)
        const storeFromParams = parseParamsToStore(params)
        portfolioState.deserialize(storeFromParams)
    }
}

function onContentsListReceived(contentsList) {
    portfolioView = new PortfolioView(document, (viewEvent, eventValue) => {
        switch (viewEvent) {
            case "selectAuthor":
                portfolioState.selectAuthor(eventValue)
                break
            case "selectTag":
                portfolioState.selectTag(eventValue)
                break
            case "selectContent":
                portfolioState.selectContent(eventValue)
                break
            case "selectPage":
                portfolioState.selectPage(eventValue)
                break
            case "deselectContent":
                if (history.state) {
                    history.back()
                } else {
                    closePopup()
                }
                break
        }
    })

    const params = new URLSearchParams(window.location.search)
    const storeFromParams = parseParamsToStore(params)

    portfolioState = new PortfolioState(contentsList, storeFromParams, 12, (stateEvent, state, store) => {
        switch (stateEvent) {
            case "deserialize":
                portfolioView.setState(state)
                window.setTimeout(() => {
                    portfolioView.showHeader()
                }, 50)

                window.setTimeout(() => {
                    portfolioView.showAuthors()
                    portfolioView.showTags()
                }, 600)
                break
            case "author":
            case "tag":
            case "page":
            case "content":
                history.pushState(store, "", "?" + storeToParams(store).toString())
                portfolioView.setState(state)
                break
        }
    })
}

function closePopup() {
    const params = new URLSearchParams(window.location.search)
    params.delete("id")
    const storeFromParams = parseParamsToStore(params)
    portfolioView.hidePopup()
    history.replaceState(null, "", "?" + params.toString())
    portfolioState.deserialize(storeFromParams)
}

function storeToParams(store) {
    const storeForParams = {}

    if (!(isAllEnabled(store.authorsList))) {
        storeForParams.auth = Object.keys(store.authorsList).filter(author => {
            return store.authorsList[author]
        })
    }

    if (!(isAllEnabled(store.tagsList))) {
        storeForParams.tag = Object.keys(store.tagsList).filter(tag => {
            return store.tagsList[tag]
        })
    }

    if (store.page) {
        storeForParams.p = store.page
    }

    if (store.contentID) {
        storeForParams.id = store.contentID
    }

    return new URLSearchParams(storeForParams)
}

function isAllEnabled(enabledDict) {
    return Object.keys(enabledDict).reduce((acc, key) => {
        return acc && enabledDict[key]
    }, true)
}

function parseParamsToStore(params) {
    const storedState = {}

    if (params.has("auth")) {
        storedState.authorsList = params.get("auth").split(",").reduce((acc, author) => {
            acc[author] = true
            return acc
        }, {})
    }

    if (params.has("tag")) {
        storedState.tagsList = params.get("tag").split(",").reduce((acc, tag) => {
            acc[tag] = true
            return acc
        }, {})
    }

    if (params.has("p")) {
        storedState.page = params.get("p")
    }

    if (params.has("id")) {
        storedState.contentID = params.get("id")
    }

    return storedState
}