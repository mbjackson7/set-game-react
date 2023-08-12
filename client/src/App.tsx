import { useEffect, useRef, useState } from 'react'
import './App.css'
import Card from './components/Card'
import { CardAttributes } from './models/card'

function App() {
  const [onTable, setOnTable] = useState<CardAttributes[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const deck = useRef<CardAttributes[]>([])
  const colors = ['red', 'green', 'purple']
  const shapes = ['oval', 'diamond', 'squiggle']
  const numbers = [1, 2, 3]
  const shadings = ['fill', 'striped', 'outline']
  const [overflowLevel, setOverflowLevel] = useState<number>(0)

  // build a deck of cards
  useEffect(() => {
    deck.current = []
    colors.forEach(color => {
      shapes.forEach(shape => {
        numbers.forEach(number => {
          shadings.forEach(shading => {
            deck.current.push({ shape: shape, color: color, number: number, shading: shading })
          })
        })
      })
    });
    // shuffle the deck
    deck.current.sort(() => Math.random() - 0.5)
  }, [colors, shapes, numbers, shadings])

  // deal 12 cards
  useEffect(() => {
    setOnTable(deck.current.slice(0, 12))
  }, [deck])

  const toggleSelected = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index))
    } else {
      if (selected.length !== 3) {
        setSelected([...selected, index])
      }
    }
  }

  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center p-10'>
      <h1 className="text-4xl font-bold h-1/6">Set</h1>
      <div className={`grid grid-rows-3 grid-cols-${overflowLevel+4} gap-2 h-5/6 max-h-[80vw] max-w-screen aspect-square`}>
      {
        onTable.map((card, index) => {
          return (
            <button key={index} className="flex justify-center h-full aspect-5/7" onClick={() => { toggleSelected(index) }}>
              <Card key={index} attributes={card} selected={selected.includes(index)} />
            </button>
          )
        })
      }
      </div>
    </div>
  )
}

export default App
