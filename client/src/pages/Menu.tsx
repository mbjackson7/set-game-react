import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


export default function Menu() {
    const navigate = useNavigate();
    const [name, setName] = useState(localStorage.getItem('name') || '');
    const [nameEntered, setNameEntered] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    const [enterCode, setEnterCode] = useState(false);

    useEffect(() => {
        socket.disconnect();
        socket.connect();
    }, []);

    function handleNameEnter() {
        if (name.length > 0) {
            localStorage.setItem('name', name);
            setNameEntered(true);
        }
    }

    function createRoom() {
        socket.emit('create-room');
        socket.on('room-created', (roomCode: string) => {
            navigate(`/game/${roomCode}/user/${name}`);
        });
    }

    // create or join room
    return (
        <div className='w-screen h-[calc(100dvh)] flex flex-col justify-center items-center gap-10'>
            {!nameEntered ?
                <>
                    <input type='text' className='border-2 border-black h-20 w-120 text-5xl text-center' placeholder="Enter Name Here" value={name} onChange={(e) => setName(e.target.value)} />
                    <button className='w-40 border-2 bg-green-600 p-5' onClick={handleNameEnter}>Enter</button>
                </>

                :
                (!enterCode ?
                    <>
                        <label className="text-3xl">Welcome, {name}</label>
                        <button className='w-40 border-2 bg-green-600 p-5' onClick={createRoom}>Create Room</button>
                        <button className='w-40 border-2 bg-purple-600 p-5' onClick={() => setEnterCode(true)}>Join Room</button>
                    </>
                    :
                    <>
                        <button className='border-2 bg-red-600  p-1' onClick={() => setEnterCode(false)}>Back</button>
                        <label className="text-3xl">Enter Room Code</label>
                        <input type='text' className='border-2 border-black h-20 w-40 text-5xl text-center' placeholder="####" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
                        <button className='w-40 border-2 bg-green-600 p-5' onClick={() => navigate(`/game/${roomCode}/user/${name}`)}>Enter Room</button>
                    </>)
            }
        </div>
    )
}
