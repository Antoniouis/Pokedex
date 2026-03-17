import React, { useEffect, useState } from 'react';
import axios from 'axios';

const backendUrl = `http://${window.location.hostname}:3001/api`;

function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('Todos');
  const [mostrarMenuTipos, setMostrarMenuTipos] = useState(false);

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
        {pokemonFiltrados.map(p => (
          <div key={p.id} className="pokemon-card">
            <img src={p.imagen} alt={p.nombre} />
            <h3>{p.nombre}</h3>
            <p>Tipo: {p.tipo}</p>

            <div style={{ marginTop: '10px', width: '100%', fontSize: '0.9rem' }}>

              {/* VIDA */}
              <div className="flex-between">
                <span>HP:</span>
                <span>{p.vida}</span>
              </div>
              <div className="stat-bar-container">
                <div
                  className="stat-bar hp animate"
                  style={{ '--value': p.vida }}
                ></div>
              </div>

              {/* ATAQUE */}
              <div className="flex-between">
                <span>ATQ:</span>
                <span>{p.ataque}</span>
              </div>
              <div className="stat-bar-container">
                <div
                  className="stat-bar attack animate"
                  style={{ '--value': p.ataque }}
                ></div>
              </div>

              {/* DEFENSA */}
              <div className="flex-between">
                <span>DEF:</span>
                <span>{p.defensa}</span>
              </div>
              <div className="stat-bar-container">
                <div
                  className="stat-bar defense animate"
                  style={{ '--value': p.defensa }}
                ></div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pokedex;