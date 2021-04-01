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

        this.publishAuthors()
        this.publishTags()
        this.publishPageContents()
        this.publishPageIndicies()
    }

    selectAuthor(author) {
        this.authorsList[author] = !this.authorsList[author]

        if (author === "all") {
            Object.keys(this.authorsList).forEach(author => {
                this.authorsList[author] = this.authorsList["all"]
            })
        }

        this.publishAll()
    }

    selectTag(tag) {
        this.tagsList[tag] = !this.tagsList[tag]

        if (tag === "all") {
            Object.keys(this.tagsList).forEach(tag => {
                this.tagsList[tag] = this.tagsList["all"]
            })
        }

        this.publishAll()
    }

    getPageIndicies() {
        const totalPage = parseInt(this.getActiveContentsList().length / this.contentsNumInPage, 10) + 1

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
        const enabledAuthors = Object.keys(this.authorsList).filter(author => {
            return this.authorsList[author]
        })

        const enabledTags = Object.keys(this.tagsList).filter(tag => {
            return this.tagsList[tag]
        })

        const activeContents = this.contentsList.filter(contentDesc => {
            const isAuthorsEnabled = contentDesc.authors.reduce((acc, author) => {
                return acc || enabledAuthors.includes(author)
            }, false)

            const isTagsEnabled = contentDesc.tags.reduce((acc, tag) => {
                return acc || enabledTags.includes(tag)
            }, false)

            return isAuthorsEnabled && isTagsEnabled
        })

        return activeContents.slice(this.page * this.contentsNumInPage, (this.page + 1) * this.contentsNumInPage)
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