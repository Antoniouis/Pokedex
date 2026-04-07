import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socketUrl = `http://${window.location.hostname}:3001`;

function Batalla() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const modo = query.get('mode');
  const codigo = query.get('code');

  const [socket, setSocket] = useState(null);
  const [estadoJuego, setEstadoJuego] = useState(null);
  const [codigoSala, setCodigoSala] = useState(modo === 'join' ? codigo : '');
  const [logs, setLogs] = useState([]);

  // Estados específicos para CPU
  const [estadoCPU, setEstadoCPU] = useState(null);

  useEffect(() => {
    const equipoGuardado = localStorage.getItem('myTeamData');
    if (!equipoGuardado) {
      navigate('/team-builder');
      return;
    }
    const miEquipo = JSON.parse(equipoGuardado);

    if (modo === 'cpu') {
      configurarBatallaCPU(miEquipo);
      return;
    }

    // Multijugador
    const nuevoSocket = io(socketUrl);
    setSocket(nuevoSocket);

    nuevoSocket.on('connect', () => {
      console.log('Conectado al socket id:', nuevoSocket.id);
      if (modo === 'host') {
        nuevoSocket.emit('create_room', { team: miEquipo });
      } else if (modo === 'join') {
        nuevoSocket.emit('join_room', { roomCode: codigo, team: miEquipo });
      }
    });

    nuevoSocket.on('room_created', (data) => {
      setCodigoSala(data.roomCode);
      agregarLog(`Sala creada! Código: ${data.roomCode}. Esperando al oponente...`);
      setEstadoJuego({
        status: 'waiting',
        turn: nuevoSocket.id,
        players: { [nuevoSocket.id]: { team: miEquipo, activePokemonIdx: 0 } }
      });
    });

    nuevoSocket.on('battle_started', (data) => {
      setEstadoJuego(data.gameState);
      agregarLog(data.message);
    });

    nuevoSocket.on('battle_update', (data) => {
      setEstadoJuego(data.gameState);
      agregarLog(data.logMessage);
    });

    nuevoSocket.on('error_message', (msg) => {
      alert(msg);
      navigate('/lobby');
    });

    nuevoSocket.on('player_disconnected', (msg) => {
      agregarLog(msg);
      alert(msg);
      setEstadoJuego(null);
    });

    return () => {
      nuevoSocket.disconnect();
    };
  }, [modo, codigo, navigate]);

  const agregarLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 5)); // Mantener últimos 5 logs
  };

  const configurarBatallaCPU = (miEquipo) => {
    const equipoCPU = JSON.parse(JSON.stringify(miEquipo)).reverse(); // Placeholder: invertir mi equipo
    const estado = {
      status: 'active',
      turn: 'jugador',
      players: {
        'jugador': { team: miEquipo, activePokemonIdx: 0 },
        'cpu': { team: equipoCPU, activePokemonIdx: 0 }
      }
    };
    setEstadoJuego(estado);
    agregarLog('¡Batalla VS CPU iniciada!');
  };

  const turnoCPU = (estadoActual) => {
    setTimeout(() => {
      if (estadoActual.status === 'finished') return;

      const cpu = estadoActual.players['cpu'];
      const jugador = estadoActual.players['jugador'];
      const pokeCPU = cpu.team[cpu.activePokemonIdx];
      const pokeJugador = jugador.team[jugador.activePokemonIdx];

      const daño = Math.max(1, pokeCPU.ataque - Math.floor(pokeJugador.defensa / 2));
      pokeJugador.vida_actual = Math.max(0, pokeJugador.vida_actual - daño);

      let msg = `¡${pokeCPU.nombre} del CPU atacó! Infligió ${daño} de daño.`;

      if (pokeJugador.vida_actual === 0) {
        msg += ` ¡Tu ${pokeJugador.nombre} se debilitó!`;
        const vivo = jugador.team.findIndex(p => p.vida_actual > 0);
        if (vivo === -1) {
          msg += ` ¡CPU gana!`;
          estadoActual.status = 'finished';
        }
      }

      agregarLog(msg);
      estadoActual.turn = 'jugador';
      setEstadoJuego({ ...estadoActual });
    }, 1500);
  };

  const atacar = () => {
    if (modo === 'cpu') {
      const estado = { ...estadoJuego };
      if (estado.turn !== 'jugador' || estado.status !== 'active') return;

      const jugador = estado.players['jugador'];
      const miPoke = jugador.team[jugador.activePokemonIdx];
      if (miPoke.vida_actual === 0) {
        alert('Tu Pokémon actual está debilitado. Cambia de Pokémon.');
        return;
      }

      const cpu = estado.players['cpu'];
      const pokeCPU = cpu.team[cpu.activePokemonIdx];

      const daño = Math.max(1, miPoke.ataque - Math.floor(pokeCPU.defensa / 2));
      pokeCPU.vida_actual = Math.max(0, pokeCPU.vida_actual - daño);

      let msg = `¡${miPoke.nombre} atacó! Infligió ${daño} de daño.`;

      if (pokeCPU.vida_actual === 0) {
        msg += ` ¡${pokeCPU.nombre} del CPU se debilitó!`;
        const idxVivo = cpu.team.findIndex(p => p.vida_actual > 0);
        if (idxVivo === -1) {
          msg += ` ¡Ganaste!`;
          estado.status = 'finished';
        } else {
          cpu.activePokemonIdx = idxVivo;
          msg += ` CPU cambió a ${cpu.team[idxVivo].nombre}!`;
        }
      }

      agregarLog(msg);

      if (estado.status !== 'finished') {
        estado.turn = 'cpu';
        setEstadoJuego(estado);
        turnoCPU(estado);
      } else {
        setEstadoJuego(estado);
      }
    } else {
      if (socket && estadoJuego && estadoJuego.turn === socket.id) {
        socket.emit('attack', { roomCode: codigoSala });
      }
    }
  };

  const cambiarPokemon = (index) => {
    if (modo === 'cpu') {
      const estado = { ...estadoJuego };
      const jugador = estado.players['jugador'];

      if (jugador.team[index].vida_actual <= 0) return;
      if (index === jugador.activePokemonIdx) return;

      jugador.activePokemonIdx = index;
      agregarLog(`¡Cambiado a ${jugador.team[index].nombre}!`);

      if (estado.turn === 'jugador') {
        estado.turn = 'cpu';
        setEstadoJuego(estado);
        turnoCPU(estado);
      } else {
        setEstadoJuego(estado);
      }
    } else {
      if (socket && estadoJuego) {
        socket.emit('switch_pokemon', { roomCode: codigoSala, pokemonIndex: index });
      }
    }
  };

  if (!estadoJuego) return <h2 className="title" style={{ marginTop: '5rem' }}>Conectando...</h2>;

  const miId = modo === 'cpu' ? 'jugador' : socket?.id;
  const oponenteId = Object.keys(estadoJuego.players).find(id => id !== miId);

  const yo = estadoJuego.players[miId];
  const oponente = oponenteId ? estadoJuego.players[oponenteId] : null;

  const miTurno = estadoJuego.turn === miId;
  const miActivo = yo.team[yo.activePokemonIdx];
  const miHPPercent = (miActivo.vida_actual / miActivo.vida_maxima) * 100;

  const opoActivo = oponente ? oponente.team[oponente.activePokemonIdx] : null;
  const opoHPPercent = opoActivo ? (opoActivo.vida_actual / opoActivo.vida_maxima) * 100 : 0;

  return (
    <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

      <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>{codigoSala ? `Sala: ${codigoSala}` : 'VS CPU'}</h2>
        <h3 style={{ color: miTurno ? 'var(--accent-color)' : 'var(--text-primary)' }}>
          {estadoJuego.status === 'waiting' && 'Esperando al oponente...'}
          {estadoJuego.status === 'finished' && '¡Batalla Finalizada!'}
          {estadoJuego.status === 'active' && (miTurno ? "¡Tu Turno!" : "Turno del Oponente...")}
        </h3>
      </div>

      {estadoJuego.status !== 'waiting' && opoActivo && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* Área del Oponente */}
          <div className="flex-between" style={{ alignItems: 'flex-start', padding: '1rem 2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '15px', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ textTransform: 'capitalize', fontSize: '1.5rem' }}>{opoActivo.nombre}</h3>
              <p style={{ margin: '0.5rem 0' }}>HP: {opoActivo.vida_actual} / {opoActivo.vida_maxima}</p>
              <div className="hp-bar-container" style={{ width: '250px' }}>
                <div className={`hp-bar ${opoHPPercent < 25 ? 'red' : opoHPPercent < 50 ? 'yellow' : ''}`} style={{ width: `${opoHPPercent}%` }}></div>
              </div>
            </div>
            <img src={opoActivo.imagen} alt="oponente" style={{ width: '150px', filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))' }} />
          </div>

          {/* Área del Jugador */}
          <div className="flex-between" style={{ alignItems: 'flex-end', padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '15px', marginBottom: '2rem' }}>
            <img src={miActivo.imagen} alt="mi pokemon" style={{ width: '200px', filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))', transform: 'scaleX(-1)' }} />
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ textTransform: 'capitalize', fontSize: '1.5rem' }}>{miActivo.nombre}</h3>
              <p style={{ margin: '0.5rem 0' }}>HP: {miActivo.vida_actual} / {miActivo.vida_maxima}</p>
              <div className="hp-bar-container" style={{ width: '250px' }}>
                <div className={`hp-bar ${miHPPercent < 25 ? 'red' : miHPPercent < 50 ? 'yellow' : ''}`} style={{ width: `${miHPPercent}%` }}></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Controles */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
                <button
                  className="btn btn-accent"
                  style={{ flex: 1, fontSize: '1.5rem' }}
                  onClick={atacar}
                  disabled={!miTurno || estadoJuego.status !== 'active' || miActivo.vida_actual === 0}
                >
                  ATACAR
                </button>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {yo.team.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => cambiarPokemon(idx)}
                      style={{
                        background: yo.activePokemonIdx === idx ? 'rgba(255,255,255,0.4)' : p.vida_actual > 0 ? 'rgba(0,0,0,0.3)' : 'rgba(255,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        cursor: (p.vida_actual > 0 && yo.activePokemonIdx !== idx) ? 'pointer' : 'not-allowed',
                        opacity: p.vida_actual === 0 ? 0.5 : 1
                      }}
                    >
                      <img src={p.imagen} alt="mini" style={{ width: '40px', height: '40px' }} title={p.nombre} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Registro de Batalla */}
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#00ff00', fontFamily: 'monospace' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#fff', fontFamily: 'Outfit' }}>Registro de Batalla</h4>
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

export default Batalla;