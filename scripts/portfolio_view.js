'use strict';

import HeaderView from "./header_view.js"
import ToggleListView from "./toggle_list_view.js";
import ContentsTileView from "./contents_tile_view.js";
import PageIndicatorView from "./page_indicator_view.js";
import ContentPopupView from "./content_popup_view.js";
import Util from "./util.js"

export default class PortfolioView {
    mainView
    backgroundView
    foregroundView
    headerContainer
    headerView
    authorsView
    tagsView
    contentsListContainer
    contentsTileView
    pageIndicatorView
    popupContainer
    contentPopupView

    state
    actionHandler

    constructor(actionHandler) {
        this.actionHandler = actionHandler
        this.state = null

        this.mainView = document.getElementById("main_view")

        this.backgroundView = document.createElement("div")
        this.backgroundView.id = "background_view"
        this.backgroundView.onclick = () => {
            if (this.state && this.state.selectedContent) {
                this.actionHandler("deselectContent", null)
            }
        }
        this.mainView.appendChild(this.backgroundView)

        this.foregroundView = document.createElement("div")
        this.foregroundView.id = "foreground_view"
        this.backgroundView.appendChild(this.foregroundView)

        this.headerContainer = document.createElement("div")
        this.headerContainer.id = "header_container"
        this.foregroundView.appendChild(this.headerContainer)

        this.headerView = new HeaderView()
        this.headerContainer.appendChild(this.headerView.getElement())

        this.authorsView = new ToggleListView("authors", "thin", (selected) => {
            this.actionHandler("selectAuthor", selected)
        })
        const authorsElement = this.authorsView.getElement()
        authorsElement.id = "authors_list"
        this.headerContainer.appendChild(authorsElement)

        this.tagsView = new ToggleListView("tags", "thin", (selected) => {
            this.actionHandler("selectTag", selected)
        })
        this.headerContainer.appendChild(this.tagsView.getElement())

        this.contentsListContainer = document.createElement("div")
        this.contentsListContainer.id = "contents_list"
        this.contentsListContainer.style.display = "none"
        this.foregroundView.appendChild(this.contentsListContainer)

        this.contentsTileView = new ContentsTileView((contentID) => {
            this.actionHandler("selectContent", contentID)
        })
        this.contentsListContainer.appendChild(this.contentsTileView.getElement())

        this.pageIndicatorView = new PageIndicatorView((pageIndex) => {
            this.actionHandler("selectPage", pageIndex)
        })
        this.contentsListContainer.appendChild(this.pageIndicatorView.getElement())

        this.popupContainer = document.createElement("div")
        this.popupContainer.id = "popup_container"
        this.popupContainer.style.display = "none"
        this.foregroundView.appendChild(this.popupContainer)

        this.contentPopupView = new ContentPopupView()
        this.popupContainer.appendChild(this.contentPopupView.getElement())
    }

    setState(state) {
        this.state = state
        this.authorsView.setState(state.authors)
        this.tagsView.setState(state.tags)
        this.contentsTileView.setState(state.contents)
        this.pageIndicatorView.setState(state.pageIndicies)
        this.contentPopupView.setState(state.selectedContent)

        if (state.selectedContent) {
            this.contentsListContainer.style.display = "none"
            this.popupContainer.style.display = "block"
        } else {
            this.contentsListContainer.style.display = "block"
            this.popupContainer.style.display = "none"
        }
    }

    onResize() {
        this.contentsTileView.show()
    }

    showHeader() {
        return this.headerView.show()
    }

    hideHeader() {
        return this.headerView.hide()
    }

    showAuthors() {
        return this.authorsView.show()
    }

    hideAuthors() {
        return this.authorsView.hide()
    }

    showTags() {
        return this.tagsView.show()
    }

    hideTags() {
        return this.tagsView.hide()
    }

    showContentsTile() {
        return this.contentsTileView.show()
    }

    hideContentsTile() {
        return this.contentsTileView.hide()
    }

    showPageIndicator() {
        return this.pageIndicatorView.show()
    }

    hidePageIndicator() {
        return this.pageIndicatorView.hide()
    }

    showPopup(content) {
        window.setTimeout(() => {
            window.scrollTo(0, 0)
            this.mainView.style.display = "none"
            this.popupBackground.style.display = "block"

            window.setTimeout(() => {
                PortfolioView.showBevel(this.popupView)
            }, 30)
        }, 450)

        this.lastScroll = window.scrollY
        PortfolioView.hideBevel(this.mainView)
    }

    hidePopup(completion) {
        window.setTimeout(() => {
            this.mainView.style.display = "block"
            this.popupBackground.style.display = "none"
            completion()
        }, 450)

        PortfolioView.hideBevel(this.popupView)
    }

    initAuthors(authorsState) {
        Util.removeAllChildren(this.authorsList)
        Object.keys(authorsState).forEach(author => {
            const authorButton = window.document.createElement("a")
            authorButton.innerHTML = author
            authorButton.setAttribute("href", "#")
            authorButton.setAttribute("id", "author_" + author)
            authorButton.onclick = (event) => {
                event.preventDefault()
                this.actionHandler("selectAuthor", author)
            }

            if (authorsState[author]) {
                authorButton.setAttribute("class", "enabled")
            }

            this.authorsList.appendChild(authorButton)
        })
    }

    initTags(tagsState) {
        Util.removeAllChildren(this.tagsList)
        Object.keys(tagsState).forEach(tag => {
            const tagButton = window.document.createElement("a")
            tagButton.innerHTML = tag
            tagButton.setAttribute("href", "#")
            tagButton.setAttribute("id", "tag_" + tag)
            tagButton.onclick = (event) => {
                event.preventDefault()
                this.actionHandler("selectTag", tag)
            }

            if (tagsState[tag]) {
                tagButton.setAttribute("class", "enabled")
            }

            this.tagsList.appendChild(tagButton)
        })
    }

    createCardIntersectionObserver() {
        const intersectionHandler = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const seed = Math.random()
                    const delay = seed * seed * 400

                    if (entry.target.id && this.contentCardDict.hasOwnProperty(entry.target.id)) {
                        const card = this.contentCardDict[entry.target.id]
                        window.setTimeout(() => {
                            card.show()
                        }, delay)
                    }
                }
            })
        }
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0.1
        }

        return new IntersectionObserver(intersectionHandler, options)
    }
}
