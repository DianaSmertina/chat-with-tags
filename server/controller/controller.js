const db = require("../db");

class Controller {
    async getMessages(req, res) {
        try {
            const messages = await db.query("SELECT * FROM messages;");
            return res.json(messages.rows);
        } catch (e) {
            console.log(e);
        } 
    }
}

module.exports = new Controller();