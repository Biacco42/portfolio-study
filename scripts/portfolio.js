'use strict';

import PortfolioState from "./portfolio_state.js"
import PortfolioView from "./portfolio_view.js"

let portfolioState
let portfolioView

window.onload = (_) => {
    window.scrollTo(0, 0)
    history.scrollRestoration = 'manual'
    fetch("contents-list.json")
        .then(response => {
            return response.json()
        })
        .then(responseJSON => {
            onContentsListReceived(responseJSON)
        })
}

window.onresize = (_) => {
    portfolioView.onResize()
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
    const params = new URLSearchParams(window.location.search)
    const storeFromParams = parseParamsToStore(params)

    portfolioState = new PortfolioState(contentsList, storeFromParams, 12, (stateEvent, state, store) => {
        switch (stateEvent) {
            case "deserialize":
                hideAllContents(portfolioView).then(() => {
                    window.scrollTo(0, 0)

                    portfolioView.setState(state) // setState で contents tile と content popup の表示の出し分け

                    portfolioView.showHeader()
                    window.setTimeout(() => {
                        portfolioView.showAuthors()
                        portfolioView.showTags()
                        portfolioView.showContentsTile()
                    }, 550)
                })
                break
            case "author":
            case "tag":
                {
                    portfolioView.hidePageIndicator()

                    const query = storeToParams(store).toString()
                    const queryCleaned = query === "" ? "/" : "?" + query
                    history.pushState(store, "", queryCleaned)
                    portfolioView.setState(state)

                    portfolioView.showContentsTile()
                }
                break
            case "page":
                hideAllContents(portfolioView).then(() => {
                    window.scrollTo(0, 0)

                    const query = storeToParams(store).toString()
                    const queryCleaned = query === "" ? "/" : "?" + query
                    history.pushState(store, "", queryCleaned)
                    portfolioView.setState(state)

                    portfolioView.showHeader()
                    window.setTimeout(() => {
                        portfolioView.showAuthors()
                        portfolioView.showTags()
                        portfolioView.showContentsTile()
                    }, 550)
                })
                break
            case "content":
                if (state.selectedContent) {
                    hideAllContents(portfolioView).then(() => {
                        window.scrollTo(0, 0)

                        const query = storeToParams(store).toString()
                        const queryCleaned = query === "" ? "/" : "?" + query
                        history.pushState(store, "", queryCleaned)
                        portfolioView.setState(state)

                        portfolioView.showHeader()
                        window.setTimeout(() => {
                            portfolioView.showAuthors()
                            portfolioView.showTags()
                        }, 550)
                    })
                } else {

                }
                break
        }
    })

    portfolioView = new PortfolioView((viewEvent, eventValue) => {
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
            case "deselectContent":
                portfolioState.selectContent(null)
                break
            case "selectPage":
                portfolioState.selectPage(eventValue)
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

function hideAllContents(portfolioView) {
    const hideHeaderTask = portfolioView.hideHeader()
    const hideAuthorsTask = portfolioView.hideAuthors()
    const hideTagsTask = portfolioView.hideTags()
    const hideContentsTileTask = portfolioView.hideContentsTile()
    const hidePageIndicatorTask = portfolioView.hidePageIndicator()

    return Promise.all([hideHeaderTask, hideAuthorsTask, hideTagsTask, hideContentsTileTask, hidePageIndicatorTask])
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