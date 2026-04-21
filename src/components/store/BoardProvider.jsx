
import React, { useCallback, useReducer, useState } from 'react'

import boardContext from "./board-context";
import {BOARD_ACTIONS, TOOL_ACTION_TYPES, TOOL_ITEMS} from "../../constants";
import rough from "roughjs/bin/rough";
import { createElement, getSvgPathFromStroke, isPointNearElement } from '../../utils/element';
import getStroke from 'perfect-freehand';
 
// const gen = rough.generator();

const BoardProvider = ({children}) => {

  // const [activeToolItem, setActiveToolItem] = useState(item.LINE);
   const initialBoardState = {
    activeToolItem: TOOL_ITEMS.BRUSH,
    toolActionType: TOOL_ACTION_TYPES.NONE,
    boardMouseUpHandler: () => {},
    elements: [],
    history: [[]],
    index: 0
  }

  const boardReducer = (state, action) => {
    switch(action.type){
      case "CHANGE_TOOL": {
        return {
          ...state,
          activeToolItem: action.payload.tool,
        }
      }

      case "CHANGE_ACTION_TYPE": {
        return {
          ...state,
          toolActionType: action.payload.actionType
        }
      }


      case "DRAW_DOWN": {
        const {clientX, clientY, stroke, fill, size} = action.payload;
        const newElement = createElement(state.elements.length, clientX, clientY, clientX, clientY, {type: state.activeToolItem, stroke, fill, size});
        // const newElement = {
        //   id: state.elements.length,
        //   clientX,
        //   clientY,
        //   clientX,
        //   clientY,
        //   // {type}: state.activeToolItem,
        //   roughEle: gen.line(clientX, clientY, clientX, clientY)
        // };
        // const newElement = {
        //   id: state.elements.length,
        //   x1: clientX,
        //   y1: clientY,
        //   x2: clientX,
        //   y2: clientY,
        //   roughEle: gen.line(clientX, clientY, clientX, clientY)
        // };

        return {
          ...state,
          toolActionType: ((state.activeToolItem === TOOL_ITEMS.TEXT)?TOOL_ACTION_TYPES.WRITING:TOOL_ACTION_TYPES.DRAWING),
          elements: [...state.elements, newElement]
        }
      }
      case "DRAW_MOVE": {
        const {clientX, clientY} = action.payload;
        const newelements = [...state.elements];
        const index = newelements.length - 1;
        const {type} = newelements[index];
        // newelements[index].x2 = clientX;
        // newelements[index].y2 = clientY;
        // newelements[index].roughEle = gen.line(newelements[index].x1, newelements[index].y1, clientX, clientY);
        switch(type){
          case TOOL_ITEMS.LINE:
          case TOOL_ITEMS.RECTANGLE:
          case TOOL_ITEMS.CIRCLE: 
          case TOOL_ITEMS.ARROW:
            const {x1, y1, stroke, fill, size} = newelements[index];
            const newElement = createElement(index, x1, y1, clientX, clientY, {type: state.activeToolItem, stroke, fill, size});
            newelements[index] = newElement;
            return {
              ...state,
              elements: newelements
            }
          case TOOL_ITEMS.BRUSH: 
             newelements[index].points = [...newelements[index].points, {x: clientX, y: clientY}];
             newelements[index].path = new Path2D(getSvgPathFromStroke(getStroke (newelements[index].points)));
             return {
              ...state,
              elements: newelements
             }
        }
      }

      case BOARD_ACTIONS.DRAW_UP: {
        const elementsCopy = [...state.elements];
        const newHistory = state.history.slice(0, state.index + 1);
        newHistory.push(elementsCopy);

        return {
          ...state,
          history: newHistory,
          index: state.index + 1,
        };
      }

       

      case BOARD_ACTIONS.CHANGE_TEXT: {
        const index = state.elements.length - 1;
        const newElements = [...state.elements];
        newElements[index].text = action.payload.text;

        const newHistory = state.history.slice(0, state.index + 1);
        newHistory.push(newElements);

        return {
          ...state,
          elements: newElements,
          toolActionType: TOOL_ACTION_TYPES.NONE,
          history: newHistory,
          index: state.index + 1
        }
      }

      // case "DRAW_UP": {
      //   return {
      //     ...state,
      //     toolActionType: TOOL_ACTION_TYPES.NONE
      //   }
      // }

      case BOARD_ACTIONS.UNDO: {
        if(state.index <= 0) return state;

        return {
          ...state,
          elements: state.history[state.index - 1],
          index: state.index - 1
        }
      }

      case BOARD_ACTIONS.REDO: {
        if(state.index >= state.history.length - 1) return state;

        return {
          ...state,
          elements: state.history[state.index + 1],
          index: state.index + 1
        }
      }

      case "ERASE": {
        const {clientX, clientY} = action.payload;
        let newElements = [...state.elements];
        newElements = newElements.filter(ele => {
          return !isPointNearElement(ele, clientX, clientY);
        });

        const newHistory = state.history.slice(0, state.index + 1);
        newHistory.push(newElements);

        return {
          ...state,
          elements: newElements,
          history: newHistory,
          index: state.index + 1
        }

      }

      default: {
        return state;
      }
    }
  }

  const [boardState, dispatchBoardAction] = useReducer(boardReducer, initialBoardState);

 

  const changeToolHandler = (tool) => {
    console.log(tool);  
    // setActiveToolItem(toolItem);
    dispatchBoardAction({
      type:"CHANGE_TOOL",
      payload: {
        tool
      }
    })
  }

  const boardMouseDownHandler = (event, toolboxState) => {
    // if(boardState.activeToolItem === TOOL_ITEMS.TEXT){
    //   dispatchBoardAction({
    //     type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
    //     payload: {
    //       actionType: TOOL_ACTION_TYPES.WRITING
    //     }
    //   });
    //   return;
    // }
     if(boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;

    const {clientX, clientY} = event;
    // const roughEle = gen.line(clientX, clientY, clientX, clientY);
    if(boardState.activeToolItem === TOOL_ITEMS.ERASER){
      dispatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: {
          actionType: TOOL_ACTION_TYPES.ERASING
        }
      });
      return;
    }
    
    dispatchBoardAction({
      type:"DRAW_DOWN",
      payload: {
        clientX,
        clientY,
        stroke: toolboxState[boardState.activeToolItem]?.stroke,
        fill: toolboxState[boardState.activeToolItem]?.fill,
        size: toolboxState[boardState.activeToolItem]?.size
      }
    });
  }

  const boardUndoHandler = useCallback(() => {
    // if(boardState.index <= 0) return;
    dispatchBoardAction({
      type: BOARD_ACTIONS.UNDO
    });
  }, []);

  const boardRedoHandler = useCallback(() => {
    // if(boardState.index >= boardState.history.length - 1) return;
    dispatchBoardAction({
      type: BOARD_ACTIONS.REDO
    });
  }, []);

  const boardMouseMoveHandler = (event) => {
   
    const {clientX, clientY} = event;
    // const roughEle = gen.line(clientX, clientY, clientX, clientY);
    if(boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    if(boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING){
      dispatchBoardAction({
        type:"DRAW_MOVE",
        payload: {
          clientX,
          clientY
        }
      });
    }else if(boardState.toolActionType === TOOL_ACTION_TYPES.ERASING){
      dispatchBoardAction({
        type:"ERASE",
        payload: {
          clientX,
          clientY
        }
      })
    }
  }

  const boardMouseUpHandler = () => {
    if(boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    if(boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING){
      dispatchBoardAction({
        type:BOARD_ACTIONS.DRAW_UP,
      });
    }
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: {
        actionType: TOOL_ACTION_TYPES.NONE
      }
    });
  }

  const textAreaBlurHandler = (text, toolboxState) => { 
    // console.log("Text area blur with text: ", text);
    const {stroke, size} = toolboxState[boardState.activeToolItem];
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text,
        stroke,
        size
      }
    });
  }

  const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    toolActionType: boardState.toolActionType,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undo: boardUndoHandler,
    redo: boardRedoHandler
  }

  return (
    <boardContext.Provider value={boardContextValue}>
        {children}
    </boardContext.Provider>
  )
}

export default BoardProvider