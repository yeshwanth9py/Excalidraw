

import React, {Children, useReducer} from 'react'
import toolboxContext from './toolbox-context'
import {TOOL_ITEMS, COLORS, TOOLBOX_ACTION} from "../../constants";


function toolboxReducer(state, action){
  switch (action.type) {
    case TOOLBOX_ACTION.CHANGE_STROKE:{
      const newstate = {...state};
      newstate[action.payload.tool].stroke = action.payload.stroke;
      return newstate;
    }
    
    case TOOLBOX_ACTION.CHANGE_FILL:{
      const newstate2 = {...state};
      newstate2[action.payload.tool].fill = action.payload.fill;
      return newstate2;
    }

    case TOOLBOX_ACTION.CHANGE_SIZE: {
      const newstate3 = {...state};
      newstate3[action.payload.tool].size = action.payload.size;
      return newstate3;
    }

    default: {
      return state;
    }

  }
}

const initialToolboxState = {
  [TOOL_ITEMS.BRUSH]: {
    stroke: COLORS.BLACK,
  },

  [TOOL_ITEMS.LINE]: {
    stroke: COLORS.BLACK,
    size: 1
  },

  [TOOL_ITEMS.RECTANGLE]: {
    stroke: COLORS.BLACK,
    fill: null,
    size: 1
  },

  [TOOL_ITEMS.CIRCLE]: {
    stroke: COLORS.BLACK,
    fill: null,
    size: 1
  },

  [TOOL_ITEMS.ARROW]: {
    stroke: COLORS.BLACK,
    size: 1
  },
  [TOOL_ITEMS.TEXT]: {
    stroke: COLORS.BLACK,
    size: 32
  }
}



const ToolboxProvider = ({children}) => {
  const [toolboxState, dispactchToolboxAction] = useReducer(toolboxReducer, initialToolboxState);

  

  const changeStrokeHandler = (tool, stroke) => {
    dispactchToolboxAction({
      type: TOOLBOX_ACTION.CHANGE_STROKE,
      payload: {
        tool,
        stroke,
      }
    })
  }

  const changeFillHandler = (tool, fill) => {
    dispactchToolboxAction({
      type: TOOLBOX_ACTION.CHANGE_FILL,
      payload: {
        tool,
        fill,
      }
    })
  }

  const changeSizeHandler = (tool, size) => {
    dispactchToolboxAction({
      type: TOOLBOX_ACTION.CHANGE_SIZE,
      payload: {
        tool,
        size,
      }
    })
  }

  const toolboxContextValue = {
    toolboxState,
    changeStroke: changeStrokeHandler,
    changeFill: changeFillHandler,
    changeSize: changeSizeHandler
  }

  return <toolboxContext.Provider value={toolboxContextValue}>
    {children}
  </toolboxContext.Provider>
}

export default ToolboxProvider 
