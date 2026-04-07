import React, { useEffect, useState } from 'react';
import axios from 'axios';

const backendUrl = `http://${window.location.hostname}:3001/api`;

function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${backendUrl}/pokemon`)
      .then(res => {
        setPokemon(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2 className="title">Loading Pokedex...</h2>;

  return (
    <div className="glass-panel">
      <h1 className="title">National Pokedex</h1>
      <div className="pokemon-grid">
        {pokemon.map(p => (
          <div key={p.id} className="pokemon-card">
            <img src={p.imagen} alt={p.nombre} />
            <h3>{p.nombre}</h3>
            <p>Type: {p.tipo}</p>
            <div style={{ marginTop: '10px', width: '100%', fontSize: '0.9rem' }}>
              <div className="flex-between"><span>HP:</span> <span>{p.vida}</span></div>
              <div className="flex-between"><span>ATK:</span> <span>{p.ataque}</span></div>
              <div className="flex-between"><span>DEF:</span> <span>{p.defensa}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pokedex;
