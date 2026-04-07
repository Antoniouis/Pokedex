import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const backendUrl = `http://${window.location.hostname}:3001/api`;

function Lobby() {
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  const [pokemonDB, setPokemonDB] = useState([]);
  const [encuentro, setEncuentro] = useState(null);
  const [captureStatus, setCaptureStatus] = useState('idle');
  const [captureMessage, setCaptureMessage] = useState('');

  // 🆕 VIDA
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);

  useEffect(() => {
    axios.get(`${backendUrl}/pokemon`)
      .then(res => setPokemonDB(res.data))
      .catch(console.error);
  }, []);

  const handleCreateRoom = () => {
    const teamData = localStorage.getItem('myTeamData');
    if (!teamData) return alert("Primero crea tu equipo");
    navigate('/battle?mode=host');
  };

  const handleJoinRoom = () => {
    const teamData = localStorage.getItem('myTeamData');
    if (!teamData) return alert("Primero crea tu equipo");
    if (!joinCode) return alert("Introduce código");
    navigate(`/battle?mode=join&code=${joinCode}`);
  };

  const handleCpuBattle = () => {
    const teamData = localStorage.getItem('myTeamData');
    if (!teamData) return alert("Primero crea tu equipo");
    navigate('/battle?mode=cpu');
  };

  // 🌿 ENCUENTRO
  const buscarSalvaje = () => {
    if (pokemonDB.length === 0) return;

    const rnd = pokemonDB[Math.floor(Math.random() * pokemonDB.length)];
    const vidaMax = Math.floor(Math.random() * 50) + 80;

    setEncuentro(rnd);
    setMaxHp(vidaMax);
    setHp(vidaMax);

    setCaptureStatus('idle');
    setCaptureMessage(`¡Un ${rnd.nombre} salvaje apareció!`);
  };

  // ⚔️ ATACAR
  const atacarPokemon = () => {
    const daño = Math.floor(Math.random() * 20) + 10;

    setHp(prev => {
      const nuevoHp = Math.max(prev - daño, 0);

      if (nuevoHp <= maxHp * 0.2) {
        setCaptureMessage(`¡${encuentro.nombre} está débil! ¡Captura asegurada!`);
      } else {
        setCaptureMessage(`Le hiciste ${daño} de daño`);
      }

      return nuevoHp;
    });
  };

  // 🎯 CAPTURA
  const intentarCapturar = async () => {
    setCaptureStatus('throwing');
    setCaptureMessage('¡Pokéball, ve!');

    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(async () => {
      setCaptureStatus('shaking');
      setCaptureMessage('...');

      if (navigator.vibrate) navigator.vibrate([100, 200, 100]);

      try {
        let probabilidad = 0.7; // 🌿 Probabilidad base subida al 60% (antes 30%)

        if (hp <= maxHp * 0.2) probabilidad = 1; // 💥 100% (Vida roja)
        else if (hp <= maxHp * 0.5) probabilidad = 0.85; // ⭐ 85% (A mitad de vida)

        const success = Math.random() < probabilidad;

        setTimeout(async () => {
          if (success) {
            try {
              const res = await axios.post(`${backendUrl}/capturar`, {
                pokemon_id: encuentro.id
              });

              if (res.data.success) {
                setCaptureStatus('caught');
                setCaptureMessage("¡Pokémon capturado!");
              } else {
                setCaptureStatus('escaped');
                setCaptureMessage('¡Se escapó de la Pokéball!');
              }
            } catch (err) {
              setCaptureStatus('escaped');
              setCaptureMessage('Hubo un error, huyó.');
            }
          } else {
            setCaptureStatus('escaped');
            setCaptureMessage('¡Se escapó!');
          }

          setTimeout(() => setEncuentro(null), 3000);
        }, 3000); // 3 segundos de suspense

      } catch (e) {
        setCaptureStatus('escaped');
        setCaptureMessage('Error...');
        setTimeout(() => setEncuentro(null), 2000);
      }
    }, 1000);
  };

  return (
    <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '4rem', position: 'relative' }}>
      <h1 className="title">Lobby de Batalla</h1>
      <p style={{ marginBottom: '2rem', fontSize: '1.2rem', textAlign: 'center' }}>
        ¡Elige tu modo de juego!
      </p>

      <div className="flex-center" style={{ gap: '1.5rem', flexDirection: 'column', width: '100%', maxWidth: '400px' }}>
        <button className="btn btn-accent" onClick={handleCreateRoom} style={{ width: '100%', padding: '1rem' }}>
          👥 Crear Sala Multijugador
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <input
            type="text"
            placeholder="Código de sala"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', textAlign: 'center', fontSize: '1rem', color: 'black' }}
          />
          <button className="btn btn-accent" onClick={handleJoinRoom} style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🔌 Unirse
          </button>
        </div>

        <button className="btn" onClick={handleCpuBattle} style={{ width: '100%', padding: '1rem', background: '#3b4cca' }}>
          🤖 Jugar VS CPU
        </button>

        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.3)', margin: '0.5rem 0' }}></div>

        <button className="btn" onClick={buscarSalvaje} style={{ width: '100%', padding: '1rem', background: '#32a852' }}>
          🌿 Buscar Pokémon Salvaje
        </button>
      </div>

      <AnimatePresence>
        {encuentro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <h2 style={{ color: 'white' }}>{captureMessage}</h2>

            {/* VIDA */}
            <div style={{ width: '200px', background: '#333', marginBottom: '10px' }}>
              <div style={{
                width: `${(hp / maxHp) * 100}%`,
                background: hp < maxHp * 0.2 ? 'red' : 'green',
                height: '10px'
              }} />
            </div>

            {captureStatus === 'idle' && (
              <>
                <img src={encuentro.imagen} alt={encuentro.nombre} style={{ width: '200px', filter: 'drop-shadow(0px 0px 10px white)', marginBottom: '20px' }} />

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="btn" onClick={atacarPokemon} style={{ background: '#f59e0b', fontSize: '1rem' }}>
                    ⚔️ Atacar
                  </button>
                  <button className="btn" onClick={intentarCapturar} style={{ background: '#e3350d', fontSize: '1rem' }}>
                    🎯 Capturar
                  </button>
                  <button className="btn" onClick={() => setEncuentro(null)} style={{ background: '#555', fontSize: '1rem' }}>
                    🏃‍♂️ Huir
                  </button>
                </div>
              </>
            )}

            {['throwing', 'shaking'].includes(captureStatus) && (
              <motion.div
                animate={captureStatus === 'throwing'
                  ? { y: [300, -50, 0], rotate: 720 }
                  : { rotate: [0, -20, 20, -20, 20, 0] }
                }
                transition={captureStatus === 'throwing' ? { duration: 1, ease: "easeOut" } : { duration: 1.5, repeat: Infinity }}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(to bottom, #f00 50%, #fff 50%)',
                  border: '4px solid black',
                  position: 'relative',
                  boxShadow: captureStatus === 'shaking' ? '0 0 20px white' : 'none'
                }}
              >
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '15px', height: '15px', background: 'white', border: '3px solid black', borderRadius: '50%' }}></div>
              </motion.div>
            )}

            {captureStatus === 'caught' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} style={{ fontSize: '5rem' }}>✨</motion.div>}
            {captureStatus === 'escaped' && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} style={{ fontSize: '5rem' }}>💨</motion.div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Lobby;
