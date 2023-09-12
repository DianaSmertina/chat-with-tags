const sequelize = require("../db");
const {DataTypes} = require("sequelize");

const Message = sequelize.define("message", {
    message_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.TEXT, allowNull: false},
})

const Tag = sequelize.define("tag", {
    tag_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    tag: {type: DataTypes.STRING, allowNull: false},
})

Message.belongsToMany(Tag, {through: "messagetag"});
Tag.belongsToMany(Message, {through: "messagetag"});

module.exports = {Message, Tag};