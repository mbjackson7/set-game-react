import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { CardAttributes } from '../models/card'
import { GameState } from '../models/gameState'
import { socket } from '../socket'
import { useParams, useNavigate } from 'react-router-dom'
import MessageModal from '../components/MessageModal'

export default function Game() {
  const [gameState, setGameState] = useState<string>('waiting')
  const [onTable, setOnTable] = useState<CardAttributes[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [overflowLevel, setOverflowLevel] = useState<number>(0)
  const room = useParams<{ id: string }>().id
  const userName = useParams<{ name: string }>().name
  const [players, setPlayers] = useState<string[]>([userName ? userName : ''])
  const [scores, setScores] = useState<{ [key: string]: number }>({})
  const navigate = useNavigate()
  const rotate = window.innerWidth < window.innerHeight ? 'rotate-90' : ''
  const [message, setMessage] = useState<Message>({ text: '', color: '' })

  interface Message {
    text: string,
    color: string
  }

  // build a deck of cards
  useEffect(() => {
    function updateState(state: GameState) {
      setOnTable(state.onTable)
      setScores(state.scores)
      setGameState(state.gameState)
      setOverflowLevel(state.overflowLevel)
      setSelected(state.selected)
      setPlayers(state.players)
    }
    socket.emit('join-room', room, userName)

    socket.on('already-in-room', () => {
      console.log('already in room')
      navigate('/')
    })

    socket.on('game-started', (state: GameState) => {
      updateState(state)
    });

    socket.on('user-connected', (player: string, state: GameState) => {
      console.log(player + ' connected')
      updateState(state)
    })

    socket.on('set-called', (player: string) => {
      setMessage({ text: player + ' called set!', color: 'green' })
      setGameState(player)
      setTimeout(() => {
        setMessage({ text: '', color: '' })
      }, 2000)
    })

    socket.on('card-selected', (index: number) => {
      setSelected(selected => [...selected, index])
    })

    socket.on('card-deselected', (index: number) => {
      setSelected(selected => selected.filter(i => i !== index))
    })

    socket.on('cards-added', (state: GameState) => {
      updateState(state)
    })

    socket.on('set-found', (state: GameState, player: string) => {
      setMessage({ text: player + ' found a set!', color: 'green' })
      setTimeout(() => {
        setMessage({ text: '', color: '' })
        updateState(state)
      }, 2000)
    })

    socket.on('set-not-found', (state: GameState, player: string) => {
      setMessage({ text: player + " could'nt find a set :(", color: 'red' })
      setTimeout(() => {
        setMessage({ text: '', color: '' })
        updateState(state)
      }, 2000)
    })

    socket.on('game-over', (state: GameState) => {
      let winner = scores[Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)]
      setMessage({ text: `No more sets, ${winner} won!`, color: 'red' })
      setTimeout(() => {
        setMessage({ text: '', color: '' })
        updateState(state)
      }, 2000)
    })

    socket.on('user-disconnected', (player: string) => {
      console.log(player + ' disconnected')
      if (player !== userName) {
        setPlayers(players => players.filter(p => p !== player))
      }
    })

    return () => {
      socket.off('game-started')
    }
  }, [])

  const drawThree = () => {
    socket.emit('draw-three')
  }

  const beginGame = () => {
    socket.emit('start-game')
  }

  const select = (index: number) => {
    if (gameState === userName) {
      socket.emit('select', index)
    }
  }

  const callSet = () => {
    if (gameState === 'in-progress') {
      setGameState(userName ? userName : '')
      socket.emit('call-set')
    }
  }


  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center p-10'>
      {message.text && <MessageModal message={message}/>}
      {gameState === 'waiting' ?
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
        : // game is in progress
        <>
          <div className='flex flex-row gap-4 p-4'>
            <div>
              <h1>Scores</h1>
              <ul>
                {players.map(player => <li key={player}>{player}: {scores[player]}</li>)}
              </ul>
            </div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={drawThree}>Draw 3 Cards</button>
            <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={callSet}>Set!</button>
          </div>
          <div className={`grid grid-rows-3 grid-cols-${overflowLevel + 4} grid-flow-col gap-2 h-5/6 max-h-[96vw] max-w-screen aspect-${overflowLevel + 4}/4 ${rotate}`}>
            {
              onTable.map((card, index) => {
                return (
                  <button key={index} className="flex justify-center h-full aspect-5/7" onClick={() => { select(index) }}>
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