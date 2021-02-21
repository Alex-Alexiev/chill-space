const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Post
let Room = new Schema({
    title: {
        type: String
    },
    members: {
        type: Array
    },
    game: {
        type: String
    }
}, {
    collection: 'rooms'
});

module.exports = mongoose.model('Room', Room);