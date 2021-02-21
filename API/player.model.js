const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Post
let Player = new Schema({
    name: {
        type: String
    },
    session: {
        type: String
    },
    colour: {
        type: Number
    },
    score: {
        type: Number
    }
}, {
    collection: 'players'
});

module.exports = mongoose.model('Player', Player);