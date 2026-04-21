import { useEffect, useState, useRef, useContext, useLayoutEffect} from 'react'
import rough from 'roughjs'
import boardContext from '../store/board-context';
import TOOL_ITEMS, { TOOL_ACTION_TYPES } from '../../constants';
import toolboxContext from '../store/toolbox-context';

import classes from "./index.module.css";


function Board() {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const {elements, boardMouseDownHandler, boardMouseMoveHandler, toolActionType, boardMouseUpHandler
    ,changeToolHandler, textAreaBlurHandler, undo, redo
  } = useContext(boardContext);
  
  const {toolboxState} = useContext(toolboxContext);

  useEffect(()=>{
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
  }, []);

  useEffect(()=>{
    function handleKeyDown(event){
      if(event.ctrlKey && event.key === "z"){
        undo();
      }else if(event.ctrlKey && (event.key === "x" || event.key === "y")){
        console.log(event.ctrlKey);
        redo();
      }
    }
    
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [undo, redo]);

  useLayoutEffect(()=>{
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.save();
    
    let roughCanvas = rough.canvas(canvas);

    let generator = roughCanvas.generator;

    // let rect1 = generator.rectangle(10, 10, 100, 100);
    // let rect2 = generator.rectangle(10, 120, 100, 100, {fill: 'red', stroke:"blue"});
    // roughCanvas.draw(rect1);
    // roughCanvas.draw(rect2);
    // elements.forEach(element => {
    //   roughCanvas.draw(element.roughEle);
    // })

    elements.forEach(element => {
      switch(element.type){
        case "LINE":
        case "RECTANGLE":
        case "CIRCLE":
        case "ARROW": 
          roughCanvas.draw(element.roughEle);
          break;
        
        case "BRUSH": 
          context.fillStyle = element.stroke;
          context.fill(element.path);
          context.restore();
          break;
        
        // case TOOL_ITEMS.TEXT:
        case TOOL_ITEMS.TEXT:{
            context.textBaseline = "top";
            context.font = `${element.size}px Caveat`;
            context.fillStyle = element.stroke;
            context.fillText(element.text || "" , element.x1, element.y1);
            context.restore();
            break; 
        }

        default: 
          throw new Error("Unknown element type: " + element.type);
      }
    })

    return ()=>{
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

  }, [elements]);

  useEffect(()=>{
      const textarea = textAreaRef.current;
      if(toolActionType === TOOL_ACTION_TYPES.WRITING){
        setTimeout(() => {
          textarea.focus();
        }, 0);
      }
  }, [toolActionType])


  const handleMouseDown = (event) => {
    const clientX = event.clientX;
    const clientY = event.clientY;

    console.log("Mouse down at: ", clientX, clientY);
    boardMouseDownHandler(event, toolboxState);
  }


  const handleMouseMove = (event) => {
    const clientX = event.clientX;
    const clientY = event.clientY;

    // if(toolActionType === TOOL_ACTION_TYPES.DRAWING){
      console.log("Mouse down at: ", clientX, clientY);
      boardMouseMoveHandler(event);
    // }
  }

  const handleMouseUp = () => {
    boardMouseUpHandler();
  }


  return (
    <>
    {toolActionType === TOOL_ACTION_TYPES.WRITING && <textarea type="text"
    className={classes.TextElementBox}
    ref = {textAreaRef}
    onBlur={(event)=> textAreaBlurHandler(event.target?.value, toolboxState)}
    style={{
      top: elements[elements.length-1].y1,
      left: elements[elements.length-1].x1,
      fontSize: `${elements[elements.length-1]?.size}px`,
      color: elements[elements.length-1]?.stroke,
    }} />}
      <canvas id="canvas" ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} />
      {/* <h1>My whiteboard app</h1> */}
    </>
  )
}

export default Board
