'use strict';

import HeaderView from "./header_view.js"
import ToggleListView from "./toggle_list_view.js";
import ContentsTileView from "./contents_tile_view.js";
import PageIndicatorView from "./page_indicator_view.js";
import Util from "./util.js"

export default class PortfolioView {
    mainView
    headerView
    contentsListContainer
    authorsView
    tagsView
    contentsTileView
    pageIndicatorView

    actionHandler

    constructor(actionHandler) {
        this.actionHandler = actionHandler
        this.mainView = document.getElementById("main_view")
        this.headerView = new HeaderView()
        this.mainView.appendChild(this.headerView.getElement())

        this.contentsListContainer = document.createElement("div")
        this.contentsListContainer.id = "contents_list"
        this.mainView.appendChild(this.contentsListContainer)

        this.authorsView = new ToggleListView("authors", "thin", (selected) => {
            this.actionHandler("selectAuthor", selected)
        })
        const authorsElement = this.authorsView.getElement()
        authorsElement.id = "authors_list"
        this.contentsListContainer.appendChild(authorsElement)

        this.tagsView = new ToggleListView("tags", "thin", (selected) => {
            this.actionHandler("selectTag", selected)
        })
        this.contentsListContainer.appendChild(this.tagsView.getElement())

        this.contentsTileView = new ContentsTileView()
        this.contentsListContainer.appendChild(this.contentsTileView.getElement())

        this.pageIndicatorView = new PageIndicatorView((pageIndex) => {
            this.actionHandler("selectPage", pageIndex)
        })
        this.contentsListContainer.appendChild(this.pageIndicatorView.getElement())

        // this.popupBackground.onclick = (event) => {
        //     event.stopPropagation()
        //     this.actionHandler("deselectContent", null)
        // }

        // this.popupContent.onclick = (event) => {
        //     event.stopPropagation()
        // }
    }

    setState(state) {
        this.authorsView.setState(state.authors)
        this.tagsView.setState(state.tags)
        this.contentsTileView.setState(state.contents)
        this.pageIndicatorView.setState(state.pageIndicies)
    }

    onResize(pageContents) {
        Promise.all(pageContents).then(pageContents => {
            this.contentsTileView.show(pageContents)
        })
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
