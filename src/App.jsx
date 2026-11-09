import { useState } from 'react'
import './App.css'
import PuzzlePanel from "./Puzzle.jsx";
import square from "./assets/samplepuzzles/sample_puzzle.json";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PuzzlePanel puzzle={square} />
    </>
  )
}

export default App
