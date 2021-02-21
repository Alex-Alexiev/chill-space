exports.createVector = function(x, y) {
    return {x: x, y: y};
}

exports.mag = function(v){
    return Math.sqrt(exports.dot(v, v));
}

exports.add = function(v1, v2){
    return {x:v1.x + v2.x, y:v1.y + v2.y};
}

exports.sub = function(v1, v2){
    return {x: v1.x - v2.x, y:v1.y - v2.y};
}

exports.dot = function(v1, v2){
    return v1.x*v2.x + v1.y*v2.y;
}

exports.mult = function(v1, k){
    return {x: v1.x*k, y:v1.y*k};
}

exports.reflect = function(v1, n){
    return exports.sub(exports.mult(exports.project(v1, n), 2), v1);
}

exports.project = function(v1, v2){
    return exports.mult(v2, (1/Math.pow(exports.mag(v2), 2)) * exports.dot(v1, v2));
}

