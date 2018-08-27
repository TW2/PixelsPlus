const Jimp = require('jimp');
//===============================================================================================
// For drawing a general path:
//===============================================================================================
var x; var y;

var PathEnum = Object.freeze({"MoveTo":1, "LineTo":2, "QuadTo":3, "CurveTo":4, "SplineTo":5});
var LineEnum = Object.freeze({"X_Axis":1, "Y_Axis":2, "XY_Axis":3});

class GeneralPath {
    constructor(){
        this.PathArray = new Array();
    };
    

    MoveTo(xa, ya) {
        if (Number.isInteger(xa) && Number.isInteger(ya)){
            var shape = new Move(xa, ya);
            this.PathArray.push(shape);
            x = xa;
            y = ya;
        }
    }

    LineTo(xa, ya) {
        if (Number.isInteger(xa) && Number.isInteger(ya)){
            var shape = new Line(xa, ya);
            shape.SetOld(x, y);
            this.PathArray.push(shape);
            x = xa;
            y = ya;
        }
    }

    QuadTo(cpx1, cpy1, xa, ya) {
        if (Number.isInteger(cpx1) && Number.isInteger(cpy1) && Number.isInteger(xa) && Number.isInteger(ya)){
            var shape = new Quad(cpx1, cpy1, xa, ya);
            shape.SetOld(x, y);
            this.PathArray.push(shape);
            x = xa;
            y = ya;
        }        
    }

    CurveTo(cpx1, cpy1, cpx2, cpy2, xa, ya) {
        if (Number.isInteger(cpx1) && Number.isInteger(cpy1) && Number.isInteger(cpx2) && Number.isInteger(cpy2) && Number.isInteger(xa) && Number.isInteger(ya)){
            var shape = new Curve(cpx1, cpy1, cpx2, cpy2, xa, ya);
            shape.SetOld(x, y);
            this.PathArray.push(shape);
            x = xa;
            y = ya;
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
        var inside = false;
        var lineYAxis =  false;
        if(canvas instanceof Jimp){
            for(var ix=0; ix<canvas.getWidth(); ix++){
                inside = false;
                for(var iy=0; iy<canvas.getHeight(); iy++){
                    lineYAxis = false;
                    this.PathArray.forEach(function(element) {
                        if(element.GetPathEnumType() === PathEnum.LineTo && element.GetLineEnumType() === LineEnum.Y_Axis){
                            lineYAxis = true;
                        }
                        if(element.IsPixelInLine(ix, iy) === true){
                            inside = lineYAxis === true ? false : !inside;
                            if(inside === true){
                                canvas.setPixelColor(backcolor, ix, iy);
                            }
                        }else if(element.IsPixelInLine(ix, iy) === false && inside === true){
                            canvas.setPixelColor(backcolor, ix, iy);
                        }
                    });

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

    IsPixelInLine(pixel_x, pixel_y) {
        return false;
    };

    GetPathEnumType() {
        return PathEnum.MoveTo;
    };
}

class Line {
    constructor(xa, ya){
        this.x = xa;
        this.y = ya;
        this.axis = x === xa ? LineEnum.Y_Axis : (y === ya ? LineEnum.X_Axis : LineEnum.XY_Axis);
    }

    GetX() {
        return this.x;
    };

    GetY() {
        return this.y;
    };

    SetOld(oldx, oldy){
        this.oldx = oldx;
        this.oldy = oldy;
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
        var w = this.x - this.oldx;
        var h = this.y - this.oldy;
        var b = this.oldy; // y at origin
        var a = (h - b)/w;
        if(w !== 0 && h === 0){
            if(this.oldx < this.x){
                for(var ix=this.oldx; ix<this.x; ix++){
                    var iy = b;
                    image.setPixelColor(linecolor, ix, iy);
                }
            }else{
                for(var ix=this.oldx; ix>=this.x; ix--){
                    var iy = b;
                    image.setPixelColor(linecolor, ix, iy);
                }
            }            
        }else if(h !== 0 && w === 0){
            if(this.oldy < this.y){
                for(var iy=this.oldy; iy<this.y; iy++){
                    var ix = this.oldx;
                    image.setPixelColor(linecolor, ix, iy);
                }
            }else{
                for(var iy=this.oldy; iy>=this.y; iy--){
                    var ix = this.oldx;
                    image.setPixelColor(linecolor, ix, iy);                    
                }
            }            
        }else{
            if(this.oldx < this.x){
                for(var ix=this.oldx; ix<this.x; ix++){
                    var iy = a*ix+b;
                    image.setPixelColor(linecolor, ix, iy);
                }
            }else{
                for(var ix=this.oldx; ix>=this.x; ix--){
                    var iy = a*ix+b; console.log("x="+ix+"; y="+iy);
                    image.setPixelColor(linecolor, ix, iy);
                }
            }            
        }
    };

    IsPixelInLine(pixel_x, pixel_y) {
        var w = this.x - this.oldx;
        var h = this.y - this.oldy;
        var b = this.oldy; // y at origin
        var a = (this.y - b)/this.x;
        if(w !== 0){
            if(this.oldx < this.x){
                for(var ix=this.oldx; ix<this.x; ix++){
                    var iy = b;
                    if(pixel_x === ix && pixel_y === iy){
                        return true;
                    }
                }
            }else{
                for(var ix=this.oldx; ix>=this.x; ix--){
                    var iy = b;
                    if(pixel_x === ix && pixel_y === iy){
                        return true;
                    }
                }
            }            
        }else if(h !== 0){
            if(this.oldy < this.y){
                for(var iy=this.oldy; iy<this.y; iy++){
                    var ix = x;
                    if(pixel_x === ix && pixel_y === iy){
                        return true;
                    }
                }
            }else{
                for(var iy=this.oldy; iy>=this.y; iy--){
                    var ix = x;
                    if(pixel_x === ix && pixel_y === iy){
                        return true;
                    }
                }
            }            
        }else{
            for(var ix=this.oldx; ix<this.x; ix++){
                var iy = a*ix+b;
                if(pixel_x === ix && pixel_y === iy){
                    return true;
                }
            }
        }
        return false;
    };

    GetPathEnumType() {
        return PathEnum.LineTo;
    };

    GetLineEnumType() {
        return this.axis;
    };
}

class Quad {
    constructor(cpx1, cpy1, xa, ya){
        this.cpx1 = cpx1;
        this.cpy1 = cpy1;
        this.x = xa;
        this.y = ya;
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

    SetOld(oldx, oldy){
        this.oldx = oldx;
        this.oldy = oldy;
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
    };

    IsPixelInLine(pixel_x, pixel_y) {
        var found = false;
        for(var a=0; a<=1000; a++){
            t = a / 1000;
            xt = this.oldx * Math.pow((1-t), 2) + 2 * this.cpx1 * t * (1-t) + this.x * Math.pow(t, 2);
            yt = this.oldy * Math.pow((1-t), 2) + 2 * this.cpy1 * t * (1-t) + this.y * Math.pow(t, 2);
            if(pixel_x === xt && pixel_y === yt){
                found = true;
                break;
            }
        }
        return found;
    };

    GetPathEnumType() {
        return PathEnum.QuadTo;
    };
}

class Curve {
    constructor(cpx1, cpy1, cpx2, cpy2, xa, ya){
        this.cpx1 = cpx1;
        this.cpy1 = cpy1;
        this.cpx2 = cpx2;
        this.cpy2 = cpy2;
        this.x = xa;
        this.y = ya;
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

    SetOld(oldx, oldy){
        this.oldx = oldx;
        this.oldy = oldy;
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
            xt = x * Math.pow((1-t), 3) + 3 * this.cpx1 * t * Math.pow((1-t), 2) + 3 * this.cpx2 * Math.pow(t, 2) * (1-t) + this.x * Math.pow(t, 3);
            yt = x * Math.pow((1-t), 3) + 3 * this.cpy1 * t * Math.pow((1-t), 2) + 3 * this.cpy2 * Math.pow(t, 2) * (1-t) + this.y * Math.pow(t, 3);
            image.setPixelColor(linecolor, xt, yt);
        }
    };

    IsPixelInLine(pixel_x, pixel_y) {
        var found = false;
        for(var a=0; a<=1000; a++){
            t = a / 1000;
            xt = this.oldx * Math.pow((1-t), 3) + 3 * this.cpx1 * t * Math.pow((1-t), 2) + 3 * this.cpx2 * Math.pow(t, 2) * (1-t) + this.x * Math.pow(t, 3);
            yt = this.oldx * Math.pow((1-t), 3) + 3 * this.cpy1 * t * Math.pow((1-t), 2) + 3 * this.cpy2 * Math.pow(t, 2) * (1-t) + this.y * Math.pow(t, 3);
            if(pixel_x === xt && pixel_y === yt){
                found = true;
                break;
            }
        }
        return found;
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

    SetOld(oldx, oldy){
        this.oldx = oldx;
        this.oldy = oldy;
    };

    IsPixelInLine(pixel_x, pixel_y) {
        return false;//TODO
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

    GetPath(){
        return this.gp;
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
rect.GetPath().FillPath(px, 0x00FFFFFF);
rect.DrawPath(px, 0xFF0000FF);
var triangle = new GeneralPath();
triangle.MoveTo(100, 100);
triangle.LineTo(100, 150);
triangle.LineTo(150, 150);
triangle.LineTo(100, 100);
triangle.FillPath(px, 0x00FFFFFF);
triangle.DrawPath(px, 0xFF0000FF);
console.log("---");
console.log("Writing file");
px.write("C:\\Users\\util2\\Desktop\\image.png");
console.log("---");
console.log("Bye bye!");