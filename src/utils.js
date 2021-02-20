import * as posenet from "@tensorflow-models/posenet";

const color = "aqua";
const lineWidth = 2;


function toTuple({x, y}){
    return [x, y];
}

export function drawPoint(ctx, x, y, r, color){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.fillStyle = color;
    ctx.fill;
}

export function drawSegment([ax, ay], [bx, by], color, scale, ctx){
    ctx.beginPath();
    ctx.moveTo(ax*scale, ay*scale);
    ctx.lineTo(bx*scale, by*scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

export function drawSkeleton(keypoints, minConfidence, ctx, scale=1){
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
    adjacentKeyPoints.forEach(keypoints => {
        drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), color, scale, ctx);
    })
}

export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1){
    keypoints.forEach(keypoints => {
        if (keypoints.score < minConfidence){
            return; 
        }
        const {x, y} = keypoints.position; 
        drawPoint(ctx, x*scale, y*scale, 3, color);
    })
}