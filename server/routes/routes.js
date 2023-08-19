const Router = require("express");
const controller = require("../controller/controller");
const router = new Router();

router.get("/messages", controller.getMessages);

module.exports = router;