import * as posenet from "@tensorflow-models/posenet";

const lineWidth = 6;
const defaultConfidence = 0.5;

export const colors = { 0: "red", 1: "green", 2: "blue", 3: "orange", 4: "purple", 5: "pink", 6: "black", 7: "brown", 8: "aqua" }


export function drawGame(game, ctx) {
    if (game && game.name == "0") {
        try {
            game.data.objects.forEach(object => {
                let pos = object.position;
                let r = object.radius;
                drawPoint(ctx, pos.x, pos.y, r, "black");
            })

        } catch (e) {
            console.log(e);
        }
    }
    return;
}

function toTuple({ x, y }) {
    return [x, y];
}

export function drawPlayers(players, ctx) {
    players.forEach(player => {
        drawPoint(ctx, player.head.x, player.head.y, 50, colors[player.colour]);
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = colors[player.colour];
        ctx.fillText(player.name, player.head.x, player.head.y - 60);
        player.universePairs.forEach(pair => {
            drawSegment([pair.x1, pair.y1], [pair.x2, pair.y2], colors[player.colour], 1, ctx);
        })
    })
}

export function assignAllUniversePairs(players, ctx) {
    try{
        let numPlayers = players.length;
        let width = ctx.canvas.width;
        let x_spacing = width / (numPlayers + 1);
        for (let i = 0; i < numPlayers; i++) {
            let x = (i + 1) * x_spacing;
            let y = ctx.canvas.height / 2;
            let com = getCenterOfMass(players[i].pose.keypoints);
            players[i].universePairs = keypointsToUniverse(players[i].pose.keypoints, com, [x, y])
            players[i].pose.keypoints.forEach(keypoint => {
                if (keypoint.part == "nose") {
                    players[i].head = getUniversePoint(keypoint, com, [x, y])
                }
            })
    }
}catch(e) {
    console.log(e);
}

}

export function keypointsToUniverse(keypoints, com, [x, y]) {
    let universePairs = []
    let minConfidence = 0.5;
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
    adjacentKeyPoints.forEach(keypoint => {
        universePairs.push(getUniversePair(keypoint[0], keypoint[1], com, [x, y]));
    })
    return universePairs;
}

export function getUniversePair(keypoint1, keypoint2, com, [x, y]) {
    let p1 = getUniversePoint(keypoint1, com, [x, y]);
    let p2 = getUniversePoint(keypoint2, com, [x, y]);
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
}

export function getUniversePoint(keypoint, com, [x, y]) {
    let xNew = keypoint.position.x - com[0];
    let yNew = keypoint.position.y - com[1];
    xNew = -xNew;// flip horizontally 
    xNew += x;
    yNew += y;
    return { x: xNew, y: yNew }
}

export function getCenterOfMass(keypoints) {
    let x_sum = 0, y_sum = 0, num = 0;
    keypoints.forEach(keypoint => {
        if (isConfident(keypoint)) {
            x_sum += keypoint.position.x;
            y_sum += keypoint.position.y;
            num++;
        }
    })
    let com = [(x_sum / num), (y_sum / num)];
    return com;
}

export function isConfident(keypoint) {
    return keypoint.score > defaultConfidence;
}


export function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function drawPoint(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

export function drawSegment([ax, ay], [bx, by], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

export function drawRawSkeleton(keypoints, minConfidence, ctx, color, scale = 1) {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
    adjacentKeyPoints.forEach(keypoint => {
        drawSegment(toTuple(keypoint[0].position), toTuple(keypoint[1].position), color, scale, ctx);
    })
}

export function drawKeypoints(keypoints, minConfidence, ctx, color, scale = 1) {
    keypoints.forEach(keypoint => {
        if (keypoint.score < minConfidence) {
            return;
        }
        const { x, y } = keypoint.position;
        if (keypoint.part == "nose") {
            drawPoint(ctx, x * scale, y * scale, 40, color);
        } else {

            drawPoint(ctx, x * scale, y * scale, 3, color);
        }
    })
}