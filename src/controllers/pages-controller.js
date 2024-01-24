const { PagesService } = require('../services')

class PagesController {
    constructor() {
        this.pagesService = new PagesService();
    }

    index(req, res) {
        this.pagesService.findAll(req.query).then(pages => {
            res.json(pages).status(200)
        });
    }

    create(req, res) {
        this.pagesService.create(req.body).then(page => {
            res.json(page).status(201)
        })
    }
}

module.exports = new PagesController();