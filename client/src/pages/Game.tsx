import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { CardAttributes } from '../models/card'
import { socket } from '../socket'
import { useParams } from 'react-router-dom'

export default function Game() {
  const [gameState, setGameState] = useState<string>('waiting')
  const [onTable, setOnTable] = useState<CardAttributes[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [deck, setDeck] = useState<CardAttributes[]>([])
  const [overflowLevel, setOverflowLevel] = useState<number>(0)
  const room = useParams<{ id: string }>().id
  const userName = "Mike" //useParams<{ name: string }>().name
  const [players, setPlayers] = useState<string[]>([userName])
  const rotate = window.innerWidth < window.innerHeight ? 'rotate-90' : ''


  // build a deck of cards
  useEffect(() => {
    socket.emit('join-room', room, userName)
    
    socket.on('game-started', (stuff: any) => {
      console.log(stuff)
    });

    socket.on('user-connected', (player: string) => {
      if (player !== userName) {
        setPlayers(players => [...players, player])
      }
    })

    socket.on('user-disconnected', (player: string) => {
      if (player !== userName) {
        setPlayers(players => players.filter(p => p !== player))
      }
    })

    return () => {
      socket.off('game-started')
    }
  }, [])

  const drawThree = () => {
    
  }

  const beginGame = () => {
    socket.emit('start-game')
  }

  


  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center p-10'>
      { gameState === 'waiting' ?
        <>
          <h1>Room</h1>
          <h2>{room}</h2>
          <h1>Current Players:</h1>
          <ul>
            {players.map(player => <li key={player}>{player}</li>)}
          </ul>
          <div className='flex flex-row gap-4 p-4'>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={beginGame}>Start Game</button>
          </div>
        </>
        :
        <>
          <div className='flex flex-row gap-4 p-4'>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={drawThree}>Draw 3 Cards</button>
          </div>
          <div className={`grid grid-rows-3 grid-cols-${overflowLevel + 4} grid-flow-col gap-2 h-5/6 max-h-[96vw] max-w-screen aspect-${overflowLevel + 4}/4 ${rotate}`}>
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
        </>
      }
    </div>
  )
}