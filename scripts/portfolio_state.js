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

        this.stateEventHandler("ready", {})
        this.publishAll()
    }

    selectAuthor(author) {
        this.page = 0
        this.authorsList[author] = !this.authorsList[author]

        if (author === "all") {
            Object.keys(this.authorsList).forEach(author => {
                this.authorsList[author] = this.authorsList["all"]
            })
        }

        this.publishAll()
    }

    selectTag(tag) {
        this.page = 0
        this.tagsList[tag] = !this.tagsList[tag]

        if (tag === "all") {
            Object.keys(this.tagsList).forEach(tag => {
                this.tagsList[tag] = this.tagsList["all"]
            })
        }

        this.publishAll()
    }

    selectPage(page) {
        this.page = parseInt(page, 10)

        this.publishPageContents()
        this.publishPageIndicies()
    }

    getPageIndicies() {
        const totalPage = parseInt(this.getActiveContentsList().length / this.contentsNumInPage, 10) + 1

        return Util.range(0, totalPage, 1).reduce((acc, pageNum) => {
            acc[pageNum] = pageNum == this.page ? true : false

            return acc
        }, {})
    }

    getPageContents() {
        return this.getActiveContentsList()
            .slice(this.page * this.contentsNumInPage, (this.page + 1) * this.contentsNumInPage)
            .map(contentDesc => {
                return this.getContent(contentDesc)
            })
    }

    getActiveContentsList() {
        const enabledAuthors = Object.keys(this.authorsList).filter(author => {
            return this.authorsList[author]
        })

        const enabledTags = Object.keys(this.tagsList).filter(tag => {
            return this.tagsList[tag]
        })

        return this.contentsList.filter(contentDesc => {
            const isAuthorsEnabled = contentDesc.authors.reduce((acc, author) => {
                return acc || enabledAuthors.includes(author)
            }, false)

            const isTagsEnabled = contentDesc.tags.reduce((acc, tag) => {
                return acc || enabledTags.includes(tag)
            }, false)

            return isAuthorsEnabled && isTagsEnabled
        })
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
                const id = Util.removeExtension(contentDesc.contentPath)
                content.id = id
                content.authors = contentDesc.authors
                content.tags = contentDesc.tags
                content.publishedOn = contentDesc.publishedOn
                this.contentsCacheDict[contentDesc] = content
                return content
            })
    }

    publishAll() {
        this.publishAuthors()
        this.publishTags()
        this.publishPageContents()
        this.publishPageIndicies()
    }

    publishAuthors() {
        this.stateEventHandler("selectedAuthors", { ...this.authorsList })
    }

    publishTags() {
        this.stateEventHandler("selectedTags", { ...this.tagsList })
    }

    publishPageContents() {
        this.stateEventHandler("pageContents", this.getPageContents())
    }

    publishPageIndicies() {
        this.stateEventHandler("pageIndicies", this.getPageIndicies())
    }

    setupAuthorsList() {
        this.authorsList = this.contentsList.reduce((acc, content) => {
            content.authors.forEach(authorName => {
                acc[authorName] = true
            })

            return acc
        }, { all: true })
    }

    setupTagsList() {
        this.tagsList = this.contentsList.reduce((acc, content) => {
            content.tags.forEach(tagName => {
                acc[tagName] = true
            })

            return acc
        }, { all: true })
    }
}
