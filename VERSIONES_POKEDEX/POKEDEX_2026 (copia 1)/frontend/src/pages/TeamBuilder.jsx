import React, { useEffect, useState } from 'react';
import axios from 'axios';

const backendUrl = `http://${window.location.hostname}:3001/api`;

function TeamBuilder() {
  const [pokemonList, setPokemonList] = useState([]);
  const [team, setTeam] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${backendUrl}/pokemon`).then(res => setPokemonList(res.data));
    
    // Load local team if exists
    const savedTeamId = localStorage.getItem('myTeamId');
    if (savedTeamId) {
      axios.get(`${backendUrl}/team`).then(res => {
         const mySaved = res.data.find(t => t.id === parseInt(savedTeamId));
         if (mySaved) {
            setTeam(mySaved.pokemons);
            setTeamName(mySaved.nombre_equipo);
         }
      });
    }
  }, []);

  const addToTeam = (pokemon) => {
    if (team.length < 6 && !team.find(p => p.id === pokemon.id)) {
      setTeam([...team, pokemon]);
    }
  };

  const removeFromTeam = (id) => {
    setTeam(team.filter(p => p.id !== id));
  };

  const clearTeam = () => {
    setTeam([]);
    localStorage.removeItem('myTeamId');
    localStorage.removeItem('myTeamData');
  };

  const saveTeam = async () => {
    if (team.length === 0 || !teamName) {
      alert('Give your team a name and add at least 1 Pokemon!');
      return;
    }
    
    setSaving(true);
    try {
      const res = await axios.post(`${backendUrl}/team`, {
        nombre_equipo: teamName,
        pokemon_ids: team.map(p => p.id)
      });
      localStorage.setItem('myTeamId', res.data.id);
      
      // Save full team data for battle
      const teamWithMaxHP = team.map(p => ({...p, vida_actual: p.vida, vida_maxima: p.vida }));
      localStorage.setItem('myTeamData', JSON.stringify(teamWithMaxHP));
      
      alert('Team saved perfectly! Ready for battle.');
    } catch (err) {
      console.error(err);
      alert('Error saving team');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h1 className="title">Your Team</h1>
        <div className="flex-center" style={{ gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Team Name" 
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.8)', fontSize: '1.2rem'}}
          />
          <button className="btn btn-accent" onClick={saveTeam} disabled={saving}>
            {saving ? 'Saving...' : 'Save Team'}
          </button>
          <button className="btn" onClick={clearTeam}>Clear</button>
        </div>
        
        {team.length === 0 ? <p style={{textAlign: 'center'}}>No Pokemon selected. Choose up to 6!</p> : null}
        
        <div className="pokemon-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          {team.map(p => (
            <div key={p.id} className="pokemon-card" onClick={() => removeFromTeam(p.id)} style={{ padding: '0.5rem' }}>
               <img src={p.imagen} alt={p.nombre} style={{ width: '80px', height: '80px' }}/>
               <p>{p.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel">
        <h2 className="title" style={{ fontSize: '2rem' }}>Available Pokemon</h2>
        <div className="pokemon-grid">
          {pokemonList.map(p => (
            <div key={p.id} className="pokemon-card" onClick={() => addToTeam(p)}>
              <img src={p.imagen} alt={p.nombre} />
              <h3>{p.nombre}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamBuilder;
