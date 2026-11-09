import { useState } from 'react'
import './App.css'
import PuzzlePanel from "./Puzzle.jsx";
import square from "./assets/samplepuzzles/sample_hex_puzzle.json";
//import square from "./assets/samplepuzzles/sample_puzzle.json";
//import square from "./assets/samplepuzzles/square.json";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PuzzlePanel puzzle={square} />
    </>
  )
}

export default App
