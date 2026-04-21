import { useEffect, useState, useRef} from 'react'
import rough from 'roughjs'
import './App.css'
import Board from './components/Board'
import Toolbar from './components/Toolbar'
import BoardProvider from './components/store/BoardProvider'
import ToolboxProvider from "./components/store/ToolboxProvider";
import Toolbox from './components/Toolbox'


function App() {

  return (
    <>
    <BoardProvider>
      <ToolboxProvider>
          <Toolbar/>
          <Board/>
          <Toolbox/>
      </ToolboxProvider>
    </BoardProvider>
    </>
  )
}

export default App
