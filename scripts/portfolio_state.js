'use strict';

import Util from "./util.js"

export default class State {
    contentsList
    authorsList
    tagsList
    page
    contentsNumInPage
    stateEventHandler
    contentCacheDict

    constructor(contentsList, page, contentsNumInPage, stateEventHandler) {
        this.contentsList = contentsList
        this.page = page
        this.contentsNumInPage = contentsNumInPage
        this.stateEventHandler = stateEventHandler
        this.contentsCacheDict = {}

        this.setupAuthorsList()
        this.setupTagsList()

        this.stateEventHandler("selectedAuthors", {...this.authorsList})
        this.stateEventHandler("selectedTags", {...this.tagsList})
        this.stateEventHandler("pageIndicies", this.getPageIndicies())
        this.stateEventHandler("pageContents", this.getPageContents())
    }

    setupAuthorsList() {
        this.authorsList = this.contentsList.reduce((acc, content) => {
            content.author.forEach(authorName => {
                acc[authorName] = true
            })

            return acc
        }, {})
    }

    setupTagsList() {
        this.tagsList = this.contentsList.reduce((acc, content) => {
            content.tag.forEach(tagName => {
                acc[tagName] = true
            })

            return acc
        }, {})
    }

    getPageIndicies() {
        let totalPage = parseInt(this.getActiveContentsList().length / this.contentsNumInPage, 10) + 1

        return Util.range(0, totalPage, 1).reduce((acc, pageNum) => {
            acc[pageNum] = pageNum == this.page ? true : false
            
            return acc
        }, {})
    }

    getPageContents() {
        return this.getActiveContentsList().map(contentDesc => {
            return this.getContent(contentDesc)
        })
    }

    getActiveContentsList() {
        // TODO: filter by author / tags
        return this.contentsList.slice(this.page * this.contentsNumInPage, (this.page + 1) * this.contentsNumInPage)
    }

    getContent(contentDesc) {
        if (contentDesc.contentPath in this.contentsCacheDict) {
            return new Promise((resolve, _) => {
                resolve(this.contentsCacheDict[contentDesc.contentPath])
            })
        }

        return fetch(contentDesc.contentPath)
            .then(response => {
                return response.json()
            }).then(content => {
                content.author = contentDesc.author
                content.tag = contentDesc.tag
                content.published = contentDesc.publishedOn
                this.contentsCacheDict[contentDesc] = content
                return content
            })
    }
}
