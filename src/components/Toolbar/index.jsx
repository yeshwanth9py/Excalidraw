import React, {useContext, useState} from 'react';
import {
  FaSlash,
  FaRegCircle,
  FaEraser,
  FaArrowRight,
  FaDownload,
  FaFont,
  FaPaintBrush,
  FaUndoAlt,
  FaRedoAlt,
} from "react-icons/fa";

import { LuRectangleHorizontal } from "react-icons/lu";
import cx from "classnames";

import classes from "./index.module.css";
import boardContext from "../store/board-context";
import items from "../../constants";


const Toolbar = () => {
  const {activeToolItem, changeToolHandler, undo, redo} = useContext(boardContext);

  const handleDownload = () => {
    const canvas = document.getElementById("canvas");
    const data = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = data;
    anchor.download = "board.png";
    anchor.click();
  };


  return (
    <div className={classes.container}>
        <div className={cx(classes.toolItem, {[classes.active]: activeToolItem === items.BRUSH})} onClick={()=>changeToolHandler(items.BRUSH)} >
            <FaPaintBrush />
        </div>
        <div className={cx(classes.toolItem, {[classes.active]: activeToolItem === items.LINE})} onClick={()=>changeToolHandler(items.LINE)} >
            <FaSlash />
        </div>
        <div className={cx(classes.toolItem, {[classes.active]: activeToolItem === items.RECTANGLE})} onClick={()=>changeToolHandler(items.RECTANGLE)} >
            <LuRectangleHorizontal />
        </div>
        <div className={cx(classes.toolItem, {[classes.active]: activeToolItem === items.CIRCLE})} onClick={()=>changeToolHandler(items.CIRCLE)} >
            <FaRegCircle />
        </div>

        <div className={cx(classes.toolItem, {[classes.active]: activeToolItem === items.ARROW})} onClick={()=>changeToolHandler(items.ARROW)} >
            <FaArrowRight />
        </div>

        <div className={cx(classes.toolItem, {[classes.active]: activeToolItem === items.ERASER})} onClick={()=>changeToolHandler(items.ERASER)} >
            <FaEraser />
        </div>
        <div className={cx(classes.toolItem, {[classes.active]: activeToolItem === items.TEXT})} onClick={()=>changeToolHandler(items.TEXT)} >
            <FaFont />
        </div>

        <div className={classes.toolItem} onClick={undo} >
            <FaUndoAlt />
        </div>

        <div className={classes.toolItem} onClick={redo} >
            <FaRedoAlt />
        </div>

        <div className={classes.toolItem} onClick={handleDownload} >
            <FaDownload />
        </div>
    </div>
  )
}

export default Toolbar