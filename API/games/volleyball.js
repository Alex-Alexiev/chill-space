//import * as posenet from "@tensorflow-models/posenet";
let posenet = require("@tensorflow-models/posenet");
//var circle = require("./circle")
let vec = require("./vector");
var collide = require('line-circle-collision');

let prevTime = 0; 

exports.process = function(game, players) {
    if (Object.keys(game.data).length == 0) {
        initialize(game);
    }
    let timeElapsed = Date.now() - prevTime; 
    prevTime = Date.now();
    collideAll(game.data.objects, players);
    moveItems(game.data.objects, timeElapsed);
}

function initialize(game){
    prevTime = Date.now();
    game.data = {
        objects: []
    }
    for (let i = 0; i < 50; i++){
        game.data.objects.push({
            name: "circle",
            position: vec.createVector(20*i, -100),
            radius: 20,
            velocity: vec.createVector(0, 0)
        })
    }
}

function moveItems(objects, timeElapsed) {
    let acceleration = vec.createVector(0, 0.0002);
    for (let i = 0; i < objects.length; i++){
        objects[i].velocity = vec.add(objects[i].velocity, vec.mult(acceleration, timeElapsed))
        objects[i].position = vec.add(objects[i].position, vec.mult(objects[i].velocity, timeElapsed))
        
        if (objects[i].position.y > 500 && objects[i].velocity.y > 0) {
            objects[i].velocity.y *= -1;
        }
        // if (objects[i].position.x < 0 && objects[i].velocity.x < 0) {
        //     objects[i].velocity.x *= -1;
        // }
        // if (objects[i].position.x > 1000 && objects[i].velocity.x > 0) {
        //     objects[i].velocity.x *= -1;
        // }
    }
}

function collideWithJoint(object, [start, end]){
    let diff = vec.sub(end, start);
    object.velocity = vec.mult(vec.reflect(object.velocity, {x:-diff.y, y:diff.x}), -1);
    object.position = vec.add(object.position, vec.mult(object.velocity, 3));
}

/*
function pointInCircle(x1, y1, cx, cy, cr){
    let distance = (x1-cx)*(x1-cx)+(y1-cy)*(y1-cy);
    distance = Math.sqrt(distance);
    return distance <= cr;
}
*/

function pointOnLine(point, start, end){
    if (point.x < start.x && point.x > end.x || point.x > start.x && point.x < end.x){
        if (point.y > start.y && point.y < end.y || point.y > end.y && point.y < start.y){
            return true;
        }
    }
    // if (vec.mag(vec.sub(point, start)) > vec.mag(vec.sub(end, start))) {
    //     return false;
    // }
    // if (vec.mag(vec.sub(point, end)) > vec.mag(vec.sub(start, end))) {
    //     return false;
    // }
    return false;
}

// is either end INSIDE the circle?
  // if so, return true immediately
 

function overlappingWithJoint(object, start, end){
    // let cx = object.position.x;
    // let cy = object.position.y;
    // let r = object.radius;

    // let x1 = start.x;
    // let y1 = start.y;

    // let x2 = end.x;
    // let y2 = end.y;

    // let inside1 = pointCircle(x1,y1, cx,cy,r);
    // let inside2 = pointCircle(x2,y2, cx,cy,r);
    // if (inside1 || inside2) return true;
  
    // // get length of the line
    // let distX = x1 - x2;
    // let distY = y1 - y2;
    // let len = Math.sqrt( (distX*distX) + (distY*distY) );
  
    // // get dot product of the line and circle
    // let dot = ( ((cx-x1)*(x2-x1)) + ((cy-y1)*(y2-y1)) ) / Math.pow(len,2);
  
    // // find the closest point on the line
    // let closestX = x1 + (dot * (x2-x1));
    // let closestY = y1 + (dot * (y2-y1));
  
    // // is this point actually on the line segment?
    // // if so keep going, but if not, return false
    // let onSegment = linePoint(x1,y1,x2,y2, closestX,closestY);
    // if (!onSegment) return false;
  
    // // optionally, draw a circle at the closest
    // // point on the line
    // // fill(255,0,0);
    // // noStroke();
    // // ellipse(closestX, closestY, 20, 20);
  
    // // get distance to closest point
    // distX = closestX - cx;
    // distY = closestY - cy;
    // let distance = Math.sqrt( (distX*distX) + (distY*distY) );
  
    // if (distance <= r) {
    //   return true;
    // }
    // return false;

    // let pos = object.position;

    // // if (pointInCircle(end.x, end.y, pos.x, pos.y, object.radius)){
    // //     return true;
    // // }
    // // if (pointInCircle(start.x, start.y, pos.x, pos.y, object.radius)){
    // //     return true;
    // // }
    
    // let diff = vec.sub(end, start);
    // let len = vec.mag(diff);
    // let proj = vec.project(vec.sub(end, pos), diff);
    // let point = vec.sub(end, proj);

    // console.log("diff: ")
    // console.log(diff)
    // console.log("proj")
    // console.log(proj)
    // console.log("new")

    // //console.log(point);

    // if (!pointOnLine(point, start, end)){
    //     return false;
    // }

    // //let dist = Math.sqrt(Math.pow(vec.mag(vec.sub(end, pos))) - Math.pow(vec.mag(proj)))
    // let dist = vec.mag(vec.sub(point, pos));
    // return dist <= object.radius;
    
    // //console.log("overlapping detected");
    // // let diff = vec.sub(end, start);
    // // let pos = object.position;
    // // let diff2 = vec.sub(end, pos);
    // // let r = vec.project(diff2, diff);
    // // let dist = Math.sqrt(vec.dot(pos, pos) + vec.dot(r, r));
    // // let midPoint = vec.mult(vec.add(start, end), 0.5);

    // // return Math.abs(dist) <= object.radius;
    return collide([start.x, start.y], [end.x, end.y], [object.position.x, object.position.y], object.radius);
}

function collideAll(objects, players){
    let minConfidence = 0.5;
    if (playes){
    players.forEach(player => {
        if (player.universePairs){
            console.log("sdfsdfg");
            player.universePairs.forEach(pair => {
                let start = vec.createVector(pair.x1, pair.y1);
                let end = vec.createVector(pair.x2, pair.y2);
                for (let i = 0; i < objects.length; i++){
                    let object = objects[i];
                    if (overlappingWithJoint(object, start, end)){
                        collideWithJoint(object, [start, end]); 
                    }
                }
            })     
        }   
    })
}
}

