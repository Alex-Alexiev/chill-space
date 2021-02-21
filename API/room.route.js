const express = require('express');
const postRoutes = express.Router();

let Room = require('./room.model');
let Player = require('./player.model');

// Add a room
postRoutes.route('/add').get(function (req, res) {
    let r = new Room();
    let p = new Player();
    p.colour = Math.trunc(Math.random()*8);
    p.score = 0;
    r.members.push(p);
    r.save()
        .then(() => {
            let ret = {};
            ret._id = r._id;
            ret.playerId = p._id;
            ret.colour = p.colour;
            res.send(ret);
            console.log("Created Room");
        })
        .catch(() => {
            console.log("Unable to save to db");
            res.status(400).send("Unable to save to the database");
        });
});

// Join a room
postRoutes.route('/join').post(function (req, res) {
    console.log(req.body);
    Room.findById(req.body.id, function (err, r) {
        if (err) {
            res.json(err);
            console.log("Error Joining Room");
        } else {
            if (r) {
                let p = new Player();
                p.colour = Math.trunc(Math.random()*8);
                p.score = 0;
                r.members.push(p);
                r.save().then(() => {
                    res.send(p);
                    console.log(p);
                    console.log("Joined Room");
                    console.log(r.members);
                }).catch(() => {
                    console.log("Unable to save to db");
                    res.status(400).send("Unable to save to the database")
                })
            } else {
                res.send(null);
            }
        }
    })

});

module.exports = postRoutes;