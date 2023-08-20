const db = require("../db");

class Controller {
    async getMessages(req, res) {
        const tagIds = req.query.tagIds
            ? req.query.tagIds.split(",").map(Number)
            : [];
        try {
            let messages = [];
            messages = await db.query(`
                SELECT m.message_id, m.text, m.date, COALESCE(
                    JSON_AGG(json_build_object('tag_id', t.tag_id, 'tag', t.tag)), '[]'
                ) AS tags
                FROM messages m
                LEFT JOIN message_tags mt ON m.message_id = mt.message_id
                LEFT JOIN tags t ON mt.tag_id = t.tag_id
                WHERE mt.tag_id = ANY($1) OR mt.tag_id IS NULL
                GROUP BY m.message_id
                ORDER BY m.date ASC
                `,
                [tagIds]
            );
            return res.json(messages.rows);
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ error: "An error occurred" });
        }
    }

    async getTagId(tag) {
        try {
            const tagInfo = await db.query(
                "SELECT * FROM tags where tag = $1",
                [tag]
            );
            if (tagInfo.rowCount === 0) {
                const newController = new Controller();
                return (await newController.addNewTag(tag)).rows[0].tag_id;
            }
            return tagInfo.rows[0].tag_id;
        } catch (e) {
            console.log(e);
        }
    }

    async addNewTag(tag) {
        try {
            const insertedTag = await db.query(
                "INSERT INTO tags(tag) VALUES ($1) RETURNING *",
                [tag]
            );
            return insertedTag;
        } catch (e) {
            console.log(e);
        }
    }

    async addMessage(req, res) {
        try {
            const text = await req.body.message;
            const tags = await req.body.tags;
            const messageID = (
                await db.query(
                    "INSERT INTO messages(text) VALUES ($1) RETURNING *",
                    [text]
                )
            ).rows[0].message_id;
            for (const element of tags) {
                const newController = new Controller();
                const tagID = await newController.getTagId(element);
                await db.query(
                    "INSERT INTO message_tags(message_id, tag_id) VALUES ($1, $2)",
                    [messageID, tagID]
                );
            }
            return res.json(messageID);
        } catch (e) {
            console.log(e);
        }
    }

    async getTags(req, res) {
        try {
            const tags = await db.query("SELECT * FROM tags");
            return res.json(tags.rows);
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new Controller();
