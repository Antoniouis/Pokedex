import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import PokemonDetailCard, { colors } from '../components/PokemonDetailCard';

const backendUrl = `http://${window.location.hostname}:3001/api`;

function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('Todos');
  const [mostrarMenuTipos, setMostrarMenuTipos] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // ESTADOS DE CAPTURA
  const [capturingId, setCapturingId] = useState(null); 
  const [captureStatus, setCaptureStatus] = useState('idle'); // 'throwing', 'shaking', 'caught', 'escaped'
  const [captureMessage, setCaptureMessage] = useState('');

  const iniciarCaptura = (pokemonId) => {
    setCapturingId(pokemonId);
    setCaptureStatus('throwing');
    setCaptureMessage('¡Pokéball, ve!');
    if (navigator.vibrate) navigator.vibrate(50); // Feedback táctil

    // 1. Animación de lanzamiento (1 segundo)
    setTimeout(async () => {
      setCaptureStatus('shaking');
      setCaptureMessage('...');
      if (navigator.vibrate) navigator.vibrate([100, 200, 100]); // Vibración al golpear

      try {
        // 2. Ejecutar backend (se hace de fondo mientras vibra)
        const response = await axios.post(`${backendUrl}/capturar`, { pokemon_id: pokemonId });
        
        // Simular suspenso del objeto girando antes de dar el resultado
        setTimeout(() => {
          if (response.data.success) {
            setCaptureStatus('caught');
            setCaptureMessage(response.data.message);
            if (navigator.vibrate) navigator.vibrate([200, 150, 300]); 
          } else {
            setCaptureStatus('escaped');
            setCaptureMessage(response.data.message);
            if (navigator.vibrate) navigator.vibrate(300); 
          }

          // 3. Reset post-animación completa
          setTimeout(() => {
            setCapturingId(null);
            setCaptureStatus('idle');
          }, 2500); 

        }, 3000); // Tiempo de suspense 'shaking' = 3s

      } catch (err) {
        setCaptureStatus('escaped');
        setCaptureMessage('Error de red. ¡Huyó!');
        setTimeout(() => setCapturingId(null), 2000);
      }
    }, 1000); // tiempo de 'throwing'
  };

  useEffect(() => {
    axios.get(`${backendUrl}/pokemon`)
      .then(res => {
        setPokemon(res.data);
        setCargando(false);
      })
      .catch(err => {
        console.error(err);
        setCargando(false);
      });
  }, []);

  if (cargando) return <h2 className="title">Cargando Pokédex...</h2>;

  const tipos = ['Todos', ...Array.from(new Set(pokemon.map(p => p.tipo)))];

  const pokemonFiltrados = pokemon.filter(p =>
    p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) &&
    (tipoSeleccionado === 'Todos' || p.tipo === tipoSeleccionado)
  );

  return (
    <div className="glass-panel">
      <h1 className="title">Pokédex Nacional</h1>

      <div className="flex-center" style={{ gap: '10px', marginBottom: '20px', position: 'relative', alignItems: 'center' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar Pokémon..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          style={{ height: '40px', flex: 1, padding: '0 12px', borderRadius: '20px', border: '1px solid #ccc' }}
        />

        <button
          onClick={() => setMostrarMenuTipos(!mostrarMenuTipos)}
          style={{
            height: '40px',
            padding: '0 20px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: '#FFCB05',
            color: '#2A75BB',
            fontWeight: 'bold'
          }}
        >
          Tipos
        </button>

        {mostrarMenuTipos && (
          <div style={{
            position: 'absolute',
            top: '50px',
            right: 0,
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
            zIndex: 10,
            overflow: 'hidden'
          }}>
            {tipos.map(tipo => (
              <div
                key={tipo}
                onClick={() => {
                  setTipoSeleccionado(tipo);
                  setMostrarMenuTipos(false);
                }}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: tipo === tipoSeleccionado ? '#2A75BB' : 'white',
                  color: tipo === tipoSeleccionado ? 'white' : 'black'
                }}
              >
                {tipo}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pokemon-grid">
        {pokemonFiltrados.map(p => {
          const mainType = p.tipo.split(',')[0].trim();
          const cardColor = colors[mainType] || '#f0f0f0';

          return (
            <div 
              key={p.id} 
              className="pokemon-card" 
              style={{ 
                position: 'relative', 
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${cardColor}44 0%, ${cardColor}88 100%)`,
                border: `2px solid ${cardColor}`,
                color: 'white'
              }}
            >
              <img 
                src={p.imagen} 
                alt={p.nombre} 
                onClick={() => setSelectedPokemon(p)}
                style={{ cursor: 'zoom-in' }}
              />
              <h3>{p.nombre}</h3>
              <p>Tipo: {p.tipo}</p>

              <button 
                onClick={() => iniciarCaptura(p.id)}
                disabled={capturingId !== null}
                style={{
                  width: '100%', padding: '8px', marginTop: '10px', marginBottom: '10px',
                  backgroundColor: '#e3350d', color: 'white', 
                  fontWeight: 'bold', border: 'none', borderRadius: '15px', cursor: 'pointer'
                }}
              >
                Cazar Pokémon
              </button>

              <AnimatePresence>
                {capturingId === p.id && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: captureStatus === 'caught' ? 'rgba(255, 203, 5, 0.9)' : 'rgba(0,0,0,0.7)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    <p style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', textShadow: '1px 1px 2px #000' }}>
                      {captureMessage}
                    </p>
                    
                    {['throwing', 'shaking'].includes(captureStatus) && (
                      <motion.div
                        variants={{
                          throwing: { 
                            y: [200, -80, 0], 
                            scale: [2, 1, 0.6], 
                            rotate: 720,
                          },
                          shaking: {
                            y: 0,
                            rotate: [0, -25, 25, -25, 25, 0], 
                            x: [0, -10, 10, -10, 10, 0] 
                          }
                        }}
                        initial="throwing"
                        animate={captureStatus}
                        transition={
                          captureStatus === 'throwing' 
                            ? { duration: 1, ease: "easeOut" } 
                            : { duration: 1.5, repeat: Infinity } 
                        }
                        style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: 'linear-gradient(to bottom, #f00 50%, #fff 50%)',
                          border: '3px solid black', position: 'relative', marginTop: '15px',
                          boxShadow: captureStatus === 'shaking' ? '0 0 15px white' : 'none'
                        }}
                      >
                         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: 'white', border: '2px solid black', borderRadius: '50%'}}></div>
                      </motion.div>
                    )}
                    
                    {captureStatus === 'caught' && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} style={{ fontSize: '3rem' }}>
                        ✨
                      </motion.div>
                    )}
                    
                    {captureStatus === 'escaped' && (
                       <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} style={{ fontSize: '3rem' }}>
                        💨
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ marginTop: '10px', width: '100%', fontSize: '0.9rem' }}>
                <div className="flex-between">
                  <span>HP:</span>
                  <span>{p.vida}</span>
                </div>
                <div className="stat-bar-container">
                  <div className="stat-bar hp animate" style={{ '--value': p.vida }}></div>
                </div>

                <div className="flex-between">
                  <span>ATQ:</span>
                  <span>{p.ataque}</span>
                </div>
                <div className="stat-bar-container">
                  <div className="stat-bar attack animate" style={{ '--value': p.ataque }}></div>
                </div>

                <div className="flex-between">
                  <span>DEF:</span>
                  <span>{p.defensa}</span>
                </div>
                <div className="stat-bar-container">
                  <div className="stat-bar defense animate" style={{ '--value': p.defensa }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PokemonDetailCard 
        pokemon={selectedPokemon} 
        onClose={() => setSelectedPokemon(null)} 
      />
    </div>
  );
}

export default Pokedex;