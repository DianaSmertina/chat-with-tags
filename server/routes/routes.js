const Router = require("express");
const controller = require("../controller/controller");
const router = new Router();

router.get("/messages", controller.getMessages);
router.post("/messages", controller.addMessage);
router.get("/tags", controller.getTags);

module.exports = router;