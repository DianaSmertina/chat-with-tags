const db = require("../db");
const { Message, Tag } = require("../models/models");

class Controller {
    async getMessages(req, res) {
        try {
            let messages = [];
            messages = await Message.findAll({
                include: [{
                  model: Tag,
                  through: { attributes: [] },
                  attributes: ['tag_id', 'tag'],
                }],
                attributes: ['message_id', 'text', 'createdAt'],
                order: [['createdAt', 'ASC']],
            });
            // const resultMessages = messages.map(message => ({
            //     message_id: message.message_id,
            //     text: message.text,
            //     date: message.createdAt.toISOString(),
            //     tags: message.tags || [],
            // }));
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
            const newMessage = await Message.create({text});
            const createdTags = await Tag.bulkCreate(tags);
            await newMessage.addTags(createdTags);
            return res.json({messageID: messageID, newTags: createdTags});
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
