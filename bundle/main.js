"use strict";
var ImageDraw;
(function (ImageDraw) {
    ImageDraw["Pattern"] = "pattern";
    ImageDraw["MidPoint"] = "mid";
})(ImageDraw || (ImageDraw = {}));
function createBlobAnimation(_target, _numOfPoints, _color, _noiseStep = 0.005, _bgImage = null, _imageDrawType = ImageDraw.MidPoint) {
    const target = document.getElementById(_target);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const simplex = new SimplexNoise();
    let pattern;
    if (_bgImage) {
        pattern = ctx.createPattern(_bgImage, 'no-repeat');
        console.log(pattern);
    }
    const radius = target.offsetWidth * 0.2;
    function noise(x, y) {
        return simplex.noise2D(x, y);
    }
    function init() {
        console.log();
        canvas.width = target.offsetWidth;
        canvas.height = target.offsetHeight;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        target.append(canvas);
        let blob = createBlob();
        requestAnimationFrame(blob.render);
    }
    class Point {
        constructor(_x, _y) {
            this.x = _x;
            this.y = _y;
        }
    }
    class BlobPoint extends Point {
        constructor(_x, _y, _noiseOffsetX, _noiseOffsetY) {
            super(_x, _y);
            this.originX = _x;
            this.originY = _y;
            this.noiseOffsetX = _noiseOffsetX;
            this.noiseOffsetY = _noiseOffsetY;
        }
    }
    function createBlob() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let points = [];
        points = createPoints(radius);
        function map(n, start1, end1, start2, end2) {
            return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
        }
        function convertPointsToArray() {
            let pointsArr = [];
            points.map((p, i) => {
                pointsArr.push(p.x);
                pointsArr.push(p.y);
                if (i === points.length - 1) {
                    pointsArr.push(points[0].x, points[0].y);
                }
            });
            return pointsArr;
        }
        function createPoints(_radius) {
            const points = [];
            let numOfPoints = _numOfPoints;
            let angleStep = (Math.PI * 2) / numOfPoints;
            const r = _radius;
            for (let i = 1; i <= numOfPoints; i++) {
                const theta = i * angleStep;
                const x = Math.cos(theta) * r;
                const y = Math.sin(theta) * r;
                points.push(new BlobPoint(x, y, Math.random() * 1000, Math.random() * 1000));
                if (i === numOfPoints) {
                    for (let j = 0; j <= numOfPoints - 1; j++) {
                        points.push(points[j]);
                    }
                }
            }
            return points;
        }
        function render() {
            let range = canvas.height * 0.05;
            console.log(range);
            ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
            canvas.style.background = "transparent";
            ctx.moveTo(points[0].x, points[0].y);
            ctx.beginPath();
            let a = [];
            let b = [];
            let mid = [];
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                const nx = noise(point.noiseOffsetX, point.noiseOffsetY);
                const nY = noise(point.noiseOffsetX, point.noiseOffsetY);
                const x = map(nx, -1, 1, point.originX - range, point.originX + range);
                const y = map(nY, -1, 1, point.originY - range, point.originY + range);
                point.x = x;
                point.y = y;
                point.noiseOffsetX += _noiseStep;
                point.noiseOffsetY += _noiseStep;
                if (i === 0) {
                    a = [point.x, point.y];
                }
                if (i === 2) {
                    b = [point.x, point.y];
                    mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
                }
            }
            ctx.curve(convertPointsToArray(), 1);
            ctx.fillStyle = _color;
            ctx.fill();
            if (_bgImage) {
                switch (_imageDrawType) {
                    case ImageDraw.MidPoint:
                        ctx.fillStyle = _color;
                        ctx.fill();
                        ctx.drawImage(_bgImage, mid[0] - _bgImage.width / 4, mid[1] - _bgImage.height / 1.5);
                        break;
                    case ImageDraw.Pattern:
                        ctx.fillStyle = pattern;
                        ctx.fill();
                        break;
                    default:
                        break;
                }
            }
            ctx.closePath();
            requestAnimationFrame(render);
        }
        canvas.onmouseenter = e => {
            _noiseStep = _noiseStep * 1.5;
        };
        canvas.onmouseleave = e => {
            _noiseStep = _noiseStep / 1.5;
        };
        return {
            render
        };
    }
    function changeCurrentColor(c) {
        _color = c;
    }
    return {
        init,
        changeCurrentColor
    };
}
