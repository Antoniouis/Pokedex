import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Lobby() {
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const teamData = localStorage.getItem('myTeamData');
    if (!teamData) {
      alert("Please build and save a team in the Team Builder first!");
      return;
    }
    navigate('/battle?mode=host');
  };

  const handleJoinRoom = () => {
    const teamData = localStorage.getItem('myTeamData');
    if (!teamData) {
      alert("Please build and save a team in the Team Builder first!");
      return;
    }
    if (!joinCode) {
      alert("Please enter a room code.");
      return;
    }
    navigate(`/battle?mode=join&code=${joinCode}`);
  };
  
  const handleCpuBattle = () => {
     const teamData = localStorage.getItem('myTeamData');
     if (!teamData) {
      alert("Please build and save a team in the Team Builder first!");
      return;
    }
    navigate('/battle?mode=cpu');
  }

  return (
    <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '4rem' }}>
      <h1 className="title">Battle Lobby</h1>
      <p style={{ marginBottom: '2rem', fontSize: '1.2rem', textAlign: 'center' }}>
        Play locally on this network!
      </p>

      <div className="flex-center" style={{ gap: '2rem', flexDirection: 'column', width: '100%', maxWidth: '400px' }}>
        <button className="btn btn-accent" onClick={handleCreateRoom} style={{ width: '100%', padding: '1rem' }}>
          Create Multiplayer Room
        </button>
        
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.3)', margin: '1rem 0' }}></div>

        <div className="flex-center" style={{ width: '100%', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Room Code" 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            style={{ flex: 1, padding: '1rem', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', textAlign: 'center'}}
            maxLength={4}
          />
          <button className="btn" onClick={handleJoinRoom} style={{ padding: '1rem' }}>Join</button>
        </div>
        
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.3)', margin: '1rem 0' }}></div>
        
        <button className="btn" onClick={handleCpuBattle} style={{ width: '100%', padding: '1rem', background: '#3b4cca' }}>
          Play VS CPU
        </button>
      </div>
    </div>
  );
}

export default Lobby;
