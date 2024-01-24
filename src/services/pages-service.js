const { Page } = require('../models')

class PagesService {
    constructor() {
        console.log("--------------------------------------")
    }

    findAll({ limit = 10 }) {
        console.log("-----------------")
        return Page.findAll({ limit, order: [['createdAt', 'DESC']] })
    }

    create(page) {
        return Page.create(page)
    }
}

module.exports = PagesService