const db = require("../db");
const { Message, Tag } = require("../models/models");

class Controller {
    async getMessages(req, res) {
        try {
            const tagIds = req.query.tagIds
                ? req.query.tagIds.split(",").map(Number)
                : [];
            const whereCondition = {};
            if (tagIds && tagIds.length > 0) {
                whereCondition.tag_id = tagIds;
            }
            const messages = await Message.findAll({
                include: [
                    {
                        model: Tag,
                        through: { attributes: [] },
                        where: whereCondition,
                        attributes: ["tag_id", "tag"],
                        required: false,
                    },
                ],
                attributes: ["message_id", "text", "createdAt"],
                order: [["createdAt", "ASC"]],
            });
            return res.json(messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ error: "An error occurred" });
        }
    }

    async addMessage(req, res) {
        try {
            const text = await req.body.message;
            const tags = await req.body.tags;
            const newMessage = await Message.create({ text });
            const newTags = [];
            const allMessageTags = [];
            for (const tag of tags) {
                const savedTag = await Tag.findOne({ where: { tag } });
                if (!savedTag) {
                    const createdTag = await Tag.create({ tag });
                    newTags.push(createdTag);
                    allMessageTags.push(createdTag);
                } else {
                    allMessageTags.push(savedTag);
                }
            }
            await newMessage.addTags(allMessageTags);
            return res.json({ messageID: newMessage.message_id, newTags });
        } catch (e) {
            console.log(e);
        }
    }

    async getTags(req, res) {
        try {
            const tags = await Tag.findAll();
            return res.json(tags);
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new Controller();
