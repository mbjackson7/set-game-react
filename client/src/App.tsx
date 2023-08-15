import { useEffect, useRef, useState } from 'react'
import './App.css'
import Card from './components/Card'
import { CardAttributes } from './models/card'
import { io } from 'socket.io-client'

function App() {
  const [onTable, setOnTable] = useState<CardAttributes[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [deck, setDeck] = useState<CardAttributes[]>([])
  const colors = ['red', 'green', 'purple']
  const shapes = ['oval', 'diamond', 'squiggle']
  const numbers = [1, 2, 3]
  const shadings = ['fill', 'striped', 'outline']
  const rotate = window.innerWidth < window.innerHeight ? 'rotate-90' : ''
  const [overflowLevel, setOverflowLevel] = useState<number>(0)

  // build a deck of cards
  useEffect(() => {
    let newDeck: CardAttributes[] = []
    colors.forEach(color => {
      shapes.forEach(shape => {
        numbers.forEach(number => {
          shadings.forEach(shading => {
            newDeck.push({ shape: shape, color: color, number: number, shading: shading })
          })
        })
      })
    });
    // shuffle the deck
    newDeck.sort(() => Math.random() - 0.5)
    setOnTable(newDeck.slice(0, 12))
    setDeck(newDeck.slice(12))
  }, [])

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
        let newDeck = deck
        selected.forEach(i => {
          if (overflowLevel === 0) {
            newTable[i] = newDeck.pop()!
          } else {
            newTable.splice(i, 1)
          }
        })
        setTimeout(() => {
          setOnTable(newTable)
          setDeck(newDeck)
          setSelected([])
          if (overflowLevel !== 0) {
            setOverflowLevel(overflowLevel - 1)
          }
        }, 3000)
      } else {
        setTimeout(() => {
          setSelected([])
        }, 500)
      }
    }
  }, [selected])

  const drawThree = () => {
    if (deck.length >= 3) {
      setOnTable([...onTable, deck[0], deck[1], deck[2]])
      setDeck(deck.slice(3))
      setOverflowLevel(overflowLevel + 1)
    }
  }


  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center p-10'>
      <div className='flex flex-row gap-4 p-4'>
        <h1 className="text-4xl font-bold h-1/6">Remaining Cards: {deck.length + onTable.length}</h1>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={drawThree}>Draw 3 Cards</button>
      </div>
      <div className={`grid grid-rows-3 grid-cols-${overflowLevel + 4} grid-flow-col gap-2 h-5/6 max-h-[96vw] max-w-screen aspect-${overflowLevel+4}/4 ${rotate}`}>
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
