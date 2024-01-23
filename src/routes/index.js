const express = require("express");

const v1Routes = require("./v1");

const router = express.Router();

router.use("/v1", v1Routes);

router.get('/health', (req, res) => {
    res.status(200).send('OK');
});

module.exports = router;
