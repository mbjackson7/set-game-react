import { useEffect, useState, useRef } from 'react'
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
  const [timer, setTimer] = useState<number>(0)
  const timerID = useRef<NodeJS.Timeout | null>(null)
  const messageTimeID = useRef<NodeJS.Timeout | null>(null)

  interface Message {
    text: string,
    color: string
  }

  useEffect(() => {
    function updateState(state: GameState) {
      setOnTable(state.onTable)
      setScores(state.scores)
      setGameState(state.gameState)
      setOverflowLevel(state.overflowLevel)
      setSelected(state.selected)
      setPlayers(state.players)
    }
    socket.disconnect()
    socket.connect()
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
      if (player !== userName) {
        sendMessage({ text: player + ' called set!', color: 'green' })
      }
      setGameState(player)
      setTimer(10)
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
      clearTimer()
      sendMessage({ text: player + ' found a set!', color: 'green' }, state, updateState)
    })

    socket.on('set-not-found', (state: GameState, player: string) => {
      clearTimer()
      sendMessage({ text: player + " couldn't find a set :(", color: 'red' }, state, updateState)
    })

    socket.on('game-over', (state: GameState) => {
      clearTimer()
      console.log("Game over pt 1")
      let winner = Object.keys(state.scores).reduce(function(a, b){ return state.scores[a] > state.scores[b] ? a : b });
      console.log(`Game Over, ${winner} wins in ${room}!`)
      sendMessage({ text: `No more sets, ${winner} won!`, color: 'red' }, state, updateState, true)
    })

    socket.on('user-disconnected', (player: string) => {
      console.log(player + ' disconnected')
      if (player !== userName) {
        setPlayers(players => players.filter(p => p !== player))
      }
    })

    return () => {
      socket.off('game-started')
      socket.off('user-connected')
      socket.off('set-called')
      socket.off('card-selected')
      socket.off('card-deselected')
      socket.off('cards-added')
      socket.off('set-found')
      socket.off('set-not-found')
      socket.off('game-over')
      socket.off('user-disconnected')
    }
  }, [])

  useEffect(() => {
    timer > 0 && (timerID.current = setTimeout(() => setTimer(timer - 1), 1000))
  }, [timer]);

  function clearTimer() {
    if (timerID.current) {
      clearTimeout(timerID.current)
      timerID.current = null
    }
    setTimer(0)
  }

  function sendMessage(message: Message, state?: GameState, updateState?: (state: GameState) => void, untimed?: boolean) {
    setMessage(message)
    if (messageTimeID.current) { clearTimeout(messageTimeID.current) }
    messageTimeID.current = setTimeout(() => {
      if (!untimed){
        setMessage({ text: '', color: '' })
      }
      if (state && updateState) {
        updateState(state)
      }
    }, 2500)
  }
   
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

  const playAgain = () => {
    socket.emit('play-again')
  }


  return (
    <div className='h-[calc(100dvh)] w-screen flex flex-col items-center justify-between px-10 py-4'>
      {message.text && <MessageModal message={message}/>}
      {gameState == "game-over" && 
        <button onClick={playAgain} className='fixed bottom-80 text-3xl bg-purple-800 p-5 border z-50'>
          Play Again
        </button>
      }
      {gameState === 'waiting' ?
        <div className='h-full w-full flex flex-col items-center justify-center'>
          <h1>Room</h1>
          <h2>{room}</h2>
          <h1>Current Players:</h1>
          <ul>
            {players.map(player => <li key={player}>{player}</li>)}
          </ul>
          <div className='flex flex-row gap-4 p-4'>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={beginGame}>Start Game</button>
          </div>
        </div>
        : // game is in progress
        <>
          <div className='flex flex-row gap-4 p-4'>
            <div className='text-center'>
              <h1>Scores</h1>
              <ul className='flex flex-row gap-5'>
                {players.map(player => <li key={player}>{player}: {scores[player]}</li>)}
              </ul>
            </div>
            <div className='w-4'>
              {timer > 0 && <h1 className='text-3xl py-1'>{timer}</h1>}
            </div>
          </div>
          <div className={`grid grid-rows-3 grid-cols-${overflowLevel + 4} grid-flow-col gap-2 h-5/6 max-h-[96vw] max-w-[90vw] aspect-${rotate ? (overflowLevel ? 5 : 4) : overflowLevel + 4}/4 ${rotate}`}>
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
          <div className='flex flex-row gap-4 p-4'>
            <button className="bg-red-800 text-white font-bold py-2 w-24 rounded" onClick={drawThree}>Draw 3</button>
            <button className='bg-green-800 text-white font-bold py-2 w-24 rounded' onClick={callSet}>Set!</button>
          </div>
        </>
      }
    </div>
  )
}