import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';


export default function Menu() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState('');
    const [enterCode, setEnterCode] = useState(false);

    function createRoom() {
        socket.emit('create-room');
        socket.on('room-created', (roomCode: string) => {
            navigate(`/game/${roomCode}`);
        });
    }

    // create or join room
    return (
        <div className='w-screen h-screen flex flex-col justify-center items-center gap-10'>
            {!enterCode ?
                <>
                    <button className='w-40 border-2 bg-green-600 hover:bg-slate-500 p-5' onClick={createRoom}>Create Room</button>
                    <button className='w-40 border-2 bg-purple-600 hover:bg-slate-500 p-5' onClick={() => setEnterCode(true)}>Join Room</button>
                </>
                :
                <>
                    <button className='border-2 bg-red-600 hover:bg-slate-500 p-1' onClick={() => setEnterCode(false)}>Back</button>
                    <label className="text-3xl">Enter Room Code</label>
                    <input type='text' className='border-2 border-black h-20 w-40 text-5xl text-center' value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
                    <button className='w-40 border-2 bg-green-600 hover:bg-slate-500 p-5' onClick={() => navigate(`/game/${roomCode}`)}>Enter Room</button>
                </>
            }
        </div>
    )
}
