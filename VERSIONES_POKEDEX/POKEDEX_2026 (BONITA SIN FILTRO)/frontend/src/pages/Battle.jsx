import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socketUrl = `http://${window.location.hostname}:3001`;

function Battle() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const mode = query.get('mode');
  const code = query.get('code');

  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [roomCode, setRoomCode] = useState(mode === 'join' ? code : '');
  const [logs, setLogs] = useState([]);
  
  // CPU Mode specific states
  const [cpuState, setCpuState] = useState(null);

  useEffect(() => {
    const rawTeam = localStorage.getItem('myTeamData');
    if (!rawTeam) {
      navigate('/team-builder');
      return;
    }
    const myTeam = JSON.parse(rawTeam);

    if (mode === 'cpu') {
      // Setup simple CPU local state
      setupCpuBattle(myTeam);
      return;
    }

    // Multiplayer
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket id:', newSocket.id);
      if (mode === 'host') {
        newSocket.emit('create_room', { team: myTeam });
      } else if (mode === 'join') {
        newSocket.emit('join_room', { roomCode: code, team: myTeam });
      }
    });

    newSocket.on('room_created', (data) => {
      setRoomCode(data.roomCode);
      addLog(`Room created! Code: ${data.roomCode}. Waiting for opponent...`);
      setGameState({ status: 'waiting', turn: newSocket.id, players: { [newSocket.id]: { team: myTeam, activePokemonIdx: 0 } }});
    });

    newSocket.on('battle_started', (data) => {
      setGameState(data.gameState);
      addLog(data.message);
    });

    newSocket.on('battle_update', (data) => {
      setGameState(data.gameState);
      addLog(data.logMessage);
    });

    newSocket.on('error_message', (msg) => {
      alert(msg);
      navigate('/lobby');
    });

    newSocket.on('player_disconnected', (msg) => {
      addLog(msg);
      alert(msg);
      setGameState(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [mode, code, navigate]);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 5)); // Keep last 5 logs
  };

  const setupCpuBattle = (myTeam) => {
    // Generate an opponent logic locally
    const cpuTeam = JSON.parse(JSON.stringify(myTeam)).reverse(); // Just reverse my team for CPU as a placeholder
    const state = {
      status: 'active',
      turn: 'player', // 'player' or 'cpu'
      players: {
        'player': { team: myTeam, activePokemonIdx: 0 },
        'cpu': { team: cpuTeam, activePokemonIdx: 0 }
      }
    };
    setGameState(state);
    addLog('VS CPU Battle started!');
  };

  const handleCpuTurn = (currentState) => {
    setTimeout(() => {
      if(currentState.status === 'finished') return;
      
      const cpu = currentState.players['cpu'];
      const player = currentState.players['player'];
      const myPoke = cpu.team[cpu.activePokemonIdx];
      const targetPoke = player.team[player.activePokemonIdx];
      
      // Calculate damage
      const dmg = Math.max(1, myPoke.ataque - Math.floor(targetPoke.defensa / 2));
      targetPoke.vida_actual = Math.max(0, targetPoke.vida_actual - dmg);
      
      let msg = `CPU's ${myPoke.nombre} attacked! Dealt ${dmg} damage.`;
      
      if (targetPoke.vida_actual === 0) {
        msg += ` Your ${targetPoke.nombre} fainted!`;
        // Check if player has alive pokemon
        const alive = player.team.findIndex(p => p.vida_actual > 0);
        if (alive === -1) {
          msg += ` CPU wins!`;
          currentState.status = 'finished';
        } else {
          // Force player to switch on next interaction
        }
      }
      
      addLog(msg);
      currentState.turn = 'player';
      setGameState({...currentState});
    }, 1500);
  };

  const attack = () => {
    if (mode === 'cpu') {
      const state = {...gameState};
      if (state.turn !== 'player' || state.status !== 'active') return;
      
      const player = state.players['player'];
      const myPoke = player.team[player.activePokemonIdx];
      if (myPoke.vida_actual === 0) {
          alert('Current Pokemon fainted. Please switch.');
          return;
      }
      
      const cpu = state.players['cpu'];
      const targetPoke = cpu.team[cpu.activePokemonIdx];
      
      const dmg = Math.max(1, myPoke.ataque - Math.floor(targetPoke.defensa / 2));
      targetPoke.vida_actual = Math.max(0, targetPoke.vida_actual - dmg);
      
      let msg = `Your ${myPoke.nombre} attacked! Dealt ${dmg} damage.`;
      
      if (targetPoke.vida_actual === 0) {
        msg += ` CPU's ${targetPoke.nombre} fainted!`;
        const aliveIdx = cpu.team.findIndex(p => p.vida_actual > 0);
        if (aliveIdx === -1) {
          msg += ` You win!`;
          state.status = 'finished';
        } else {
          cpu.activePokemonIdx = aliveIdx;
          msg += ` CPU switched to ${cpu.team[aliveIdx].nombre}!`;
        }
      }
      
      addLog(msg);
      
      if (state.status !== 'finished') {
          state.turn = 'cpu';
          setGameState(state);
          handleCpuTurn(state);
      } else {
          setGameState(state);
      }
    } else {
      if (socket && gameState && gameState.turn === socket.id) {
        socket.emit('attack', { roomCode });
      }
    }
  };

  const switchPokemon = (index) => {
    if (mode === 'cpu') {
      const state = {...gameState};
      const player = state.players['player'];
      
      if (player.team[index].vida_actual <= 0) return;
      if (index === player.activePokemonIdx) return;
      
      player.activePokemonIdx = index;
      addLog(`You switched to ${player.team[index].nombre}!`);
      
      if (state.turn === 'player') {
         state.turn = 'cpu';
         setGameState(state);
         handleCpuTurn(state);
      } else {
         setGameState(state);
      }
    } else {
      if (socket && gameState) {
        socket.emit('switch_pokemon', { roomCode, pokemonIndex: index });
      }
    }
  };

  if (!gameState) return <h2 className="title" style={{marginTop: '5rem'}}>Connecting...</h2>;

  const myId = mode === 'cpu' ? 'player' : socket?.id;
  const oppId = Object.keys(gameState.players).find(id => id !== myId);
  
  const me = gameState.players[myId];
  const opp = oppId ? gameState.players[oppId] : null;

  const myTurn = gameState.turn === myId;
  const myActive = me.team[me.activePokemonIdx];
  const myHPPercent = (myActive.vida_actual / myActive.vida_maxima) * 100;
  
  const oppActive = opp ? opp.team[opp.activePokemonIdx] : null;
  const oppHPPercent = oppActive ? (oppActive.vida_actual / oppActive.vida_maxima) * 100 : 0;

  return (
    <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      
      <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>{roomCode ? `Room: ${roomCode}` : 'VS CPU'}</h2>
        <h3 style={{ color: myTurn ? 'var(--accent-color)' : 'var(--text-primary)' }}>
          {gameState.status === 'waiting' && 'Waiting for opponent...'}
          {gameState.status === 'finished' && 'Battle Finished!'}
          {gameState.status === 'active' && (myTurn ? "Your Turn!" : "Opponent's Turn...")}
        </h3>
      </div>

      {gameState.status !== 'waiting' && oppActive && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* Opponent Area */}
          <div className="flex-between" style={{ alignItems: 'flex-start', padding: '1rem 2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '15px', marginBottom: '2rem' }}>
             <div>
               <h3 style={{ textTransform: 'capitalize', fontSize: '1.5rem' }}>{oppActive.nombre}</h3>
               <p style={{ margin: '0.5rem 0' }}>HP: {oppActive.vida_actual} / {oppActive.vida_maxima}</p>
               <div className="hp-bar-container" style={{ width: '250px' }}>
                 <div className={`hp-bar ${oppHPPercent < 25 ? 'red' : oppHPPercent < 50 ? 'yellow' : ''}`} style={{ width: `${oppHPPercent}%` }}></div>
               </div>
             </div>
             <img src={oppActive.imagen} alt="opponent current" style={{ width: '150px', filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))' }} />
          </div>

          {/* Player Area */}
          <div className="flex-between" style={{ alignItems: 'flex-end', padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '15px', marginBottom: '2rem' }}>
             <img src={myActive.imagen} alt="my current" style={{ width: '200px', filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))', transform: 'scaleX(-1)' }} />
             <div style={{ textAlign: 'right' }}>
               <h3 style={{ textTransform: 'capitalize', fontSize: '1.5rem' }}>{myActive.nombre}</h3>
               <p style={{ margin: '0.5rem 0' }}>HP: {myActive.vida_actual} / {myActive.vida_maxima}</p>
               <div className="hp-bar-container" style={{ width: '250px' }}>
                 <div className={`hp-bar ${myHPPercent < 25 ? 'red' : myHPPercent < 50 ? 'yellow' : ''}`} style={{ width: `${myHPPercent}%` }}></div>
               </div>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
             {/* Controls */}
             <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem',  height: '100%'}}>
                  <button 
                    className="btn btn-accent" 
                    style={{ flex: 1, fontSize: '1.5rem' }} 
                    onClick={attack}
                    disabled={!myTurn || gameState.status !== 'active' || myActive.vida_actual === 0}
                  >
                     ATTACK
                  </button>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {me.team.map((p, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => switchPokemon(idx)}
                        style={{
                          background: me.activePokemonIdx === idx ? 'rgba(255,255,255,0.4)' : p.vida_actual > 0 ? 'rgba(0,0,0,0.3)' : 'rgba(255,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '10px',
                          display: 'flex', justifyContent: 'center', alignItems: 'center',
                          cursor: (p.vida_actual > 0 && me.activePokemonIdx !== idx) ? 'pointer' : 'not-allowed',
                          opacity: p.vida_actual === 0 ? 0.5 : 1
                        }}
                      >
                         <img src={p.imagen} alt="mini" style={{ width: '40px', height: '40px' }} title={p.nombre}/>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             {/* Battle Log */}
             <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#00ff00', fontFamily: 'monospace' }}>
               <h4 style={{ marginBottom: '0.5rem', color: '#fff', fontFamily: 'Outfit' }}>Battle Log</h4>
               {logs.map((L, i) => (
                 <p key={i} style={{ opacity: 1 - (i * 0.2), fontSize: '0.9rem', marginBottom: '0.5rem' }}>&gt; {L}</p>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Battle;
