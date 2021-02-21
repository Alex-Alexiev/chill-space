const express = require('express');
const app = express();
const webSockets = express();
const bodyParser = require('body-parser');
const cors = require('cors');
var fs = require('fs');
var http = require('http');
var https = require('https');
const WebSocket = require('ws');
const mongoose = require('mongoose');

// DB credentials
const config = require('./DB.js'); 

// Routes
const roomRoute = require('./room.route');

// All active rooms, store in map since faster than DB
var rooms = new Map(); 

// For SSL Connection
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/dance.cubehostingmc.com/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/dance.cubehostingmc.com/fullchain.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// DB connection
mongoose.Promise = global.Promise;
mongoose.connect(config.DB, { useNewUrlParser: true }).then(
    () => { console.log('Database is connected') },
    err => { console.log('Can not connect to the database' + err) }
);

// Express config
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/rooms', roomRoute);
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//games 
//import * as volleyball from 'games/volleyball.mjs';

var volleyball = require('./games/volleyball');

// Websocket config
const wss = new WebSocket.Server({ server: httpsServer }); // Use SSL Server

// On WebSocket Connection
wss.on('connection', function connection(ws) {
    // On Message Recieve
    ws.on('message', function incoming(message) {
      let msgJson = JSON.parse(message); // Convert text to JSON
      

      
      // Process Player Positions
      if (rooms.has(msgJson.roomId)) { // Check if the room already exists in the map
        // Process Game Data
        //TODO: implement a generic way to have the gameData sent to the right file 
        if (msgJson.game.name == "0"){         
          //console.log(msgJson.playerArr);
          volleyball.process(rooms.get(msgJson.roomId).game, msgJson.playerArr);
        }
        let changed = false; // To see if the player already exists in the arena
        for (let i = 0; i < rooms.get(msgJson.roomId).playerArr.length; i++) {
          // Update existing player positions
          if (rooms.get(msgJson.roomId).playerArr[i].playerId == msgJson.playerArr[0].playerId) {
            //console.log(msgJson.name);
            let newRoom = rooms.get(msgJson.roomId);
            newRoom.playerArr[i] = msgJson.playerArr[0];
            newRoom.playerArr[i].colour = msgJson.colour;
            newRoom.playerArr[i].name = msgJson.name;
            rooms.set(msgJson.roomId, newRoom);
            changed = true;
          }
        }
        // Create new player positions
        if(!changed) {
          let newRoom = rooms.get(msgJson.roomId);
          newRoom.playerArr.push(msgJson.playerArr[0]);
          newRoom.playerArr[newRoom.playerArr.length-1].session = ws.sessionIdContext; // Required for handling socket closing
          newRoom.playerArr[newRoom.playerArr.length-1].colour = msgJson.colour;
          newRoom.playerArr[newRoom.playerArr.length-1].name = msgJson.name;
          rooms.set(msgJson.roomId, newRoom);
        }
      } else {
        
        msgJson.game.data = {};
        rooms.set(msgJson.roomId, msgJson); // Create the room
      }
      ws.send(JSON.stringify(rooms.get(msgJson.roomId))); // Send the updated room data
    });

    // On websocket close
    ws.onclose = function (event) {
        console.log("Client disconnected");
        // Go through each existing room entry to find the websocket with the session that was closed with
        for (const [key, value] of rooms.entries()) {
          for (let i = 0; i < value.playerArr.length; i++){
            if (value.playerArr[i].session == ws.sessionIdContext) {
              newRoom = value;
              newRoom.playerArr.splice(i); // Remove player with index i
              rooms.set(key, newRoom);
            }
            // TODO: Add code to remove the room from both DB and Map if 
          }
        }
        
    };
});

// Host both an http and https server
httpServer.listen(4001);
httpsServer.listen(4000);