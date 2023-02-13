interface CanvasRenderingContext2D {
    curve(points: number[], tension?: number): void
}

enum ImageDraw{
    Pattern = "pattern",
    MidPoint = "mid"
}

function createBlobAnimation(_target: string, _numOfPoints:number, _color:string, _noiseStep: number = 0.0005, _bgImage: HTMLImageElement|null = null, _imageDrawType: ImageDraw = ImageDraw.MidPoint) {

    const target: HTMLElement = document.getElementById(_target) as HTMLElement;

    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

    const simplex = new SimplexNoise()
    let pattern: CanvasPattern;
    if(_bgImage){
        pattern = ctx.createPattern(_bgImage, 'no-repeat') as CanvasPattern;
        console.log(pattern)
    }
    
    const radius = target.offsetWidth * 0.2;

    function noise(x: number, y: number) {
        return simplex.noise2D(x, y)
    }
    function init() {

        console.log()
        canvas.width = target.offsetWidth
        canvas.height = target.offsetHeight
        ctx.translate(canvas.width / 2, canvas.height / 2)
        target.append(canvas)

        let blob = createBlob()


        requestAnimationFrame(blob.render)
    }
    class Point {
        x: number;
        y: number;

        constructor(_x: number, _y: number) {
            this.x = _x
            this.y = _y
        }
    }
    class BlobPoint extends Point {

        originX: number
        originY: number
        noiseOffsetX: number
        noiseOffsetY: number

        constructor(_x: number, _y: number, _noiseOffsetX: number, _noiseOffsetY: number) {
            super(_x, _y)
            this.originX = _x
            this.originY = _y
            this.noiseOffsetX = _noiseOffsetX
            this.noiseOffsetY = _noiseOffsetY
        }
    }
    function createBlob() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let points: BlobPoint[] = []
        points = createPoints(radius)

        function map(n: number, start1: number, end1: number, start2: number, end2: number): number {
            return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
        }
        function convertPointsToArray() {
            let pointsArr: number[] = []
            points.map((p, i) => {
                pointsArr.push(p.x)
                pointsArr.push(p.y)
                if (i === points.length - 1) {
                    pointsArr.push(points[0].x, points[0].y)
                }
            })

            return pointsArr
        }
        function createPoints( _radius: number): BlobPoint[] {

            const points: BlobPoint[] = []

            let numOfPoints = _numOfPoints;
            let angleStep = (Math.PI * 2) / numOfPoints;
            const r = _radius;

            for (let i = 1; i <= numOfPoints; i++) {
                const theta = i * angleStep;
                const x = Math.cos(theta) * r;
                const y = Math.sin(theta) * r;

                points.push(new BlobPoint(x, y, Math.random() * 1000, Math.random() * 1000))

                if (i === numOfPoints) {
                    for (let j = 0; j <= numOfPoints - 1; j++) {
                        points.push(points[j]);
                    }
                }
            }
            return points
        }
        function render() {
            let range = canvas.height*0.05;
            console.log(range)
            ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)
            canvas.style.background = "transparent";

            ctx.moveTo(points[0].x, points[0].y)
            ctx.beginPath()

            let a:number[] = []
            let b:number[] = []
            let mid:number[] = []
            for (let i = 0; i < points.length; i++) {
                const point = points[i];

                const nX = noise(point.noiseOffsetX, point.noiseOffsetY)
                const nY = noise(point.noiseOffsetX, point.noiseOffsetY)

                const x = map(nX, -1, 1, point.originX - range, point.originX + range);
                const y = map(nY, -1, 1, point.originY - range, point.originY + range);

                point.x = x
                point.y = y

                point.noiseOffsetX += _noiseStep
                point.noiseOffsetY += _noiseStep

                if (i === 0) {
                    a = [point.x, point.y]
                }
                if (i === 2) {
                    b = [point.x, point.y]

                    mid = [(a[0]+b[0])/2, (a[1]+b[1])/2]
                }
            }
            ctx.curve(convertPointsToArray(), 1)
            ctx.fillStyle = _color
            ctx.fill()
            if(_bgImage){
                switch (_imageDrawType) {
                    case ImageDraw.MidPoint:
                        ctx.fillStyle = _color
                        ctx.fill()
                        ctx.drawImage(_bgImage, mid[0] - _bgImage.width/4, mid[1] - _bgImage.height/1.5)
                        break;
                
                    case ImageDraw.Pattern:
                        ctx.fillStyle = pattern
                        ctx.fill()
                        break;
                    default:
                        break;
                }
            }
            
            ctx.closePath()

            requestAnimationFrame(render)
        }

        canvas.onmouseenter = e=>{
            _noiseStep = _noiseStep*2
        }
        canvas.onmouseleave = e=>{
            _noiseStep = _noiseStep/2
        }
        return {
            render
        }
    }
    function changeCurrentColor(c: string){
        _color = c
    }
    return {
        init,
        changeCurrentColor
    }
}
