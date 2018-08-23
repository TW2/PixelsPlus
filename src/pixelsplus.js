const Jimp = require('jimp');
//===============================================================================================
// For drawing a general path:
//===============================================================================================
var x; var y;

var PathEnum = Object.freeze({"MoveTo":1, "LineTo":2, "QuadTo":3, "CurveTo":4, "SplineTo":5});

class GeneralPath {
    constructor(){
        this.PathArray = new Array();
    };
    

    MoveTo(x, y) {
        if (Number.isInteger(x) && Number.isInteger(y)){
            this.PathArray.push(new Move(x, y));
        }
    }

    LineTo(x, y) {
        if (Number.isInteger(x) && Number.isInteger(y)){
            this.PathArray.push(new Line(x, y));
        }
    }

    QuadTo(cpx1, cpy1, x, y) {
        if (Number.isInteger(cpx1) && Number.isInteger(cpy1) && Number.isInteger(x) && Number.isInteger(y)){
            this.PathArray.push(new Quad(cpx1, cpy1, x, y));
        }        
    }

    CurveTo(cpx1, cpy1, cpx2, cpy2, x, y) {
        if (Number.isInteger(cpx1) && Number.isInteger(cpy1) && Number.isInteger(cpx2) && Number.isInteger(cpy2) && Number.isInteger(x) && Number.isInteger(y)){
            this.PathArray.push(new Curve(cpx1, cpy1, cpx2, cpy2, x, y));
        }        
    }
    
    DrawPath(canvas, linecolor) {
        if(canvas instanceof Jimp){
            this.PathArray.forEach(function(element) {

                console.log(element);
    
                switch (element.GetPathEnumType()) {
                    case PathEnum.MoveTo:
                        element.Shift();
                        break;
                    case PathEnum.LineTo:
                    case PathEnum.QuadTo:
                    case PathEnum.CurveTo:
                        element.Draw(canvas, linecolor);
                        break;
                    case PathEnum.SplineTo:
                        break;
                    default:
                        console.log("An error has occured!");
                }

            });
        }
    }
    
    FillPath(canvas, backcolor){
        if(canvas instanceof Jimp){
            for(var x=0; x<canvas.getWidth(); x++){
                var inside = false;
                for(var y=0; y<canvas.getHeight(); y++){
                    
                }
            }
        }
    }

    GetArray(){
        return this.PathArray;
    }
    
}

class Move {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    GetX() {
        return this.x;
    };

    GetY() {
        return this.y;
    };

    //------------------------------------
    // Shift to with:
    // - global x (which represents older)
    // - global y (which represents older)
    // - this.x (which represents newer)
    // - this.y (which represents newer)
    //------------------------------------
    Shift() {
        x = this.x;
        y = this.y;
    };

    GetPathEnumType() {
        return PathEnum.MoveTo;
    };
}

class Line {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    GetX() {
        return this.x;
    };

    GetY() {
        return this.y;
    };

    //------------------------------------
    // Draw a line with:
    // - global x (which represents older)
    // - global y (which represents older)
    // - this.x (which represents newer)
    // - this.y (which represents newer)
    // - image (which represents canvas)
    // - linecolor
    //------------------------------------
    Draw(image, linecolor) {
        var w = this.x - x;
        var h = this.y - y;
        var b = y; // y at origin
        var a = (this.y - b)/this.x;
        if(w !== 0){
            if(x < this.x){                
                for(var ix=x; ix<this.x; ix++){
                    var iy = b;
                    image.setPixelColor(linecolor, ix, iy);
                }
            }else{
                for(var ix=x; ix>=this.x; ix--){
                    var iy = b;
                    image.setPixelColor(linecolor, ix, iy);
                }
            }            
        }else if(h !== 0){
            if(y < this.y){
                for(var iy=y; iy<this.y; iy++){
                    var ix = x;
                    image.setPixelColor(linecolor, ix, iy);
                }
            }else{
                for(var iy=y; iy>=this.y; iy--){
                    var ix = x;
                    image.setPixelColor(linecolor, ix, iy);                    
                }
            }            
        }else{
            for(var ix=x; ix<this.x; ix++){
                var iy = a*ix+b;
                image.setPixelColor(linecolor, ix, iy);
            }
        }
        x = this.x;
        y = this.y;
    };

    IsPixelInLine(pixel_x, pixel_y) {
        
    };

    GetPathEnumType() {
        return PathEnum.LineTo;
    };
}

class Quad {
    constructor(cpx1, cpy1, x, y){
        this.cpx1 = cpx1;
        this.cpy1 = cpy1;
        this.x = x;
        this.y = y;
    }

    GetCPX1() {
        return this.cpx1;
    };
    
    GetCPY1() {
        return this.cpy1;
    };

    GetX() {
        return this.x;
    };

    GetY() {
        return this.y;
    };

    //------------------------------------
    // Draw a quadratic bezier with:
    // - global x (which represents older)
    // - global y (which represents older)
    // - this.x (which represents newer)
    // - this.y (which represents newer)
    // - image (which represents canvas)
    // - linecolor
    //------------------------------------
    Draw(image, linecolor) {
        //===============================================================================================
        // DrawQuad (one control point)
        // P(t) = P0(1-t)^2 + 2P1*t(1-t) + P2*t^2
        //===============================================================================================
        for(var a=0; a<=1000; a++){
            t = a / 1000;
            xt = x * Math.pow((1-t), 2) + 2 * this.cpx1 * t * (1-t) + this.x * Math.pow(t, 2);
            yt = y * Math.pow((1-t), 2) + 2 * this.cpy1 * t * (1-t) + this.y * Math.pow(t, 2);
            image.setPixelColor(linecolor, xt, yt);
        }
        x = this.x;
        y = this.y;
    };

    GetPathEnumType() {
        return PathEnum.QuadTo;
    };
}

class Curve {
    constructor(cpx1, cpy1, cpx2, cpy2, x, y){
        this.cpx1 = cpx1;
        this.cpy1 = cpy1;
        this.cpx2 = cpx2;
        this.cpy2 = cpy2;
        this.x = x;
        this.y = y;
    }

    GetCPX1() {
        return this.cpx1;
    };
    
    GetCPY1() {
        return this.cpy1;
    };

    GetCPX2() {
        return this.cpx2;
    };

    GetCPY2() {
        return this.cpy2;
    };

    GetX() {
        return this.x;
    };

    GetY() {
        return this.y;
    };

    //------------------------------------
    // Draw a cubic bezier with:
    // - global x (which represents older)
    // - global y (which represents older)
    // - this.x (which represents newer)
    // - this.y (which represents newer)
    // - image (which represents canvas)
    // - linecolor
    //------------------------------------
    Draw(image, linecolor) {
        //===============================================================================================
        // DrawCurve (two control points)
        // P(t) = P0(1-t)^3 + 3P1*t(1-t)^2 + 3P2*t^2(1-t) + P3t^3
        //===============================================================================================
        for(var a=0; a<=1000; a++){
            t = a / 1000;
            xt = x1 * Math.pow((1-t), 3) + 3 * cpx1 * t * Math.pow((1-t), 2) + 3 * cpx2 * Math.pow(t, 2) * (1-t) + x2 * Math.pow(t, 3);
            yt = y1 * Math.pow((1-t), 3) + 3 * cpy1 * t * Math.pow((1-t), 2) + 3 * cpy2 * Math.pow(t, 2) * (1-t) + y2 * Math.pow(t, 3);
            image.setPixelColor(linecolor, xt, yt);
        }
        x = this.x;
        y = this.y;
    };

    GetPathEnumType() {
        return PathEnum.CurveTo;
    };
}

class Spline {
    constructor(cpxArray, cpyArray){
        this.cpxArray = cpxArray;
        this.cpyArray = cpyArray;
    }

    GetCPXArray() {
        return this.cpxArray;
    };
    
    GetCPYArray() {
        return this.cpyArray;
    };

    GetPathEnumType() {
        return PathEnum.SplineTo;
    };
}

class Rectangle {
    constructor(x1, y1, x2, y2){
        this.gp = new GeneralPath();
        this.gp.MoveTo(x1, y1);
        this.gp.LineTo(x2, y1);
        this.gp.LineTo(x2, y2);
        this.gp.LineTo(x1, y2);
        this.gp.LineTo(x1, y1);
    }
    
    DrawPath(canvas, linecolor) {
        this.gp.DrawPath(canvas, linecolor);
    }
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Accessors
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function Canvas(width, height, color) {
    return new Jimp(width, height, color);
};
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++




console.log("Hello");
console.log("---");
var gp = new GeneralPath();
gp.MoveTo(10, 10);
gp.LineTo(10, 50);
const px = new Canvas(200, 200, 0xFFFFFFFF);
gp.DrawPath(px, 0x000000FF);
var rect = new Rectangle(15, 10, 115, 50);
rect.DrawPath(px, 0xFF0000FF);
console.log("---");
console.log("Writing file");
px.write("C:\\Users\\util2\\Desktop\\image.png");
console.log("---");
console.log("Bye bye!");