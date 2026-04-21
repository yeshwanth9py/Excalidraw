
import {TOOL_ITEMS} from "../constants";
import rough from "roughjs/bin/rough";
import getStroke from "perfect-freehand";
import { getArrowHeadsCoordinates, isPointCloseToLine } from "./math";
const gen = rough.generator();



export const createElement = (id, x1, y1, x2, y2, {type, stroke, fill, size}) => {
    const element = {id, x1, y1, x2, y2, type, stroke, fill, size};
    let options = {
        seed: id+1,  //id can not be 0
        fillStyle: 'solid',
    };

    if(stroke){
        options.stroke = stroke;
    }

    if(fill){
        options.fill = fill;
    }

    if(stroke){
        options.strokeWidth = size;
    }

    switch(type){
        case TOOL_ITEMS.BRUSH: {
            const brushElement = {
                id, 
                points: [{x: x1, y: y1}],
                path: new Path2D(getSvgPathFromStroke(getStroke([{x: x1, y: y1}]))),
                type,
                stroke,
            }
            return brushElement;
        }
        case TOOL_ITEMS.LINE: {
            element.roughEle = gen.line(x1, y1, x2, y2, options);
            return element;
        }
        case TOOL_ITEMS.RECTANGLE: {
            element.roughEle = gen.rectangle(x1, y1, x2-x1, y2-y1, options);
            return element;
        }
        case TOOL_ITEMS.CIRCLE: {
            const cx = (x1+x2)/2;
            const cy = (y1+y2)/2;
            const width = x2-x1;
            const height = y2-y1;
            element.roughEle = gen.ellipse(cx, cy, width, height, options);
            return element;
        }
        
        case TOOL_ITEMS.ARROW: {
            const {x3, y3, x4, y4} = getArrowHeadsCoordinates(x1, y1, x2, y2, 20);
            const points = [[x1, y1], [x2, y2], [x3, y3], [x2, y2], [x4, y4]];
            element.roughEle = gen.linearPath(points, options);
            return element;
        }

        default: {
            return element;
        }
    }
}


export const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};


export const isPointNearElement = (element, x, y) => {
    const {x1, y1, x2, y2} = element;
    switch(element.type){
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.ARROW:
            return isPointCloseToLine(x1, y1, x2, y2, x, y);    
        
        case TOOL_ITEMS.RECTANGLE:{
            return (
                isPointCloseToLine(x1, y1, x2, y1, x, y) ||
                isPointCloseToLine(x2, y1, x2, y2, x, y) ||
                isPointCloseToLine(x2, y2, x1, y2, x, y) ||
                isPointCloseToLine(x1, y2, x1, y1, x, y)
            );
        }

        case TOOL_ITEMS.CIRCLE: {
            return (
                isPointCloseToLine(x1, y1, x2, y1, x, y) ||
                isPointCloseToLine(x2, y1, x2, y2, x, y) ||
                isPointCloseToLine(x2, y2, x1, y2, x, y) ||
                isPointCloseToLine(x1, y2, x1, y1, x, y) || 
                ((element.fill!==null && x<=Math.max(x1,x2) && x>=Math.min(x1,x2) && y<=Math.max(y1,y2) && y>=Math.min(y1,y2)))
            );
        }

        case TOOL_ITEMS.BRUSH: {
            const context = document.getElementById("canvas").getContext("2d");
            return context.isPointInPath(element.path, x, y);
        }

        case TOOL_ITEMS.TEXT: {
            const context = document.getElementById("canvas").getContext("2d");
            context.font = `${element.size}px Caveat`;
            context.fillStyle = element.stroke;

            const textWidth = context.measureText(element.text).width;
            const textHeight = parseInt(element.size);

            context.restore();

            return (
                isPointCloseToLine(x1, y1, x1 + textWidth, y1, x, y) ||
                isPointCloseToLine(
                x1 + textWidth,
                y1,
                x1 + textWidth,
                y1 + textHeight,
                x,
                y
                ) ||
                isPointCloseToLine(
                x1,
                y1 + textHeight,
                x1 + textWidth,
                y1 + textHeight,
                x,
                y
                ) ||
                isPointCloseToLine(
                x1,
                y1,
                x1,
                y1 + textHeight,
                x,
                y
                )
            );
        }

        default:
            console.log("wrong element type: ", element.type);
            return false;
    }
}