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
  const rotate = window.innerWidth < window.innerHeight ? 'rotate-90' : ''
  const [overflowLevel, setOverflowLevel] = useState<number>(1)

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
    setOnTable(deck.current.slice(0, 15))
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

  const isSet = (cards: CardAttributes[]) => {
    const shapes = new Set(cards.map(card => card.shape))
    const colors = new Set(cards.map(card => card.color))
    const numbers = new Set(cards.map(card => card.number))
    const shadings = new Set(cards.map(card => card.shading))
    return shapes.size !== 2 && colors.size !== 2 && numbers.size !== 2 && shadings.size !== 2
  }

  useEffect(() => {
    if (selected.length === 3) {
      const selectedCards = selected.map(i => onTable[i])
      if (isSet(selectedCards)) {
        let newTable = onTable
        selected.forEach(i => {
          if (overflowLevel === 0) {
            newTable[i] = deck.current.pop()!
          } else {
            newTable.splice(i, 1)
          }
        })
        setTimeout(() => {
          setOnTable(newTable)
          setSelected([])
          setOverflowLevel(overflowLevel - 1)
        }, 3000)
      } else {
        setTimeout(() => {
          setSelected([])
        }, 500)
      }
    }
  }, [selected])

  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center p-10'>
      <h1 className="text-4xl font-bold h-1/6">Set</h1>
      <div className={`grid grid-rows-3 grid-cols-${overflowLevel + 4} gap-2 h-5/6 max-h-[96vw] max-w-screen aspect-square ${rotate}`}>
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
