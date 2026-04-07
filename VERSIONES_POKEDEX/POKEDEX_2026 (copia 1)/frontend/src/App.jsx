import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Pokedex from './pages/Pokedex';
import TeamBuilder from './pages/TeamBuilder';
import Lobby from './pages/Lobby';
import Battle from './pages/Battle';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <nav className="glass-panel" style={{ padding: '1rem', borderRadius: '50px' }}>
          <Link to="/" className="btn">Pokedex</Link>
          <Link to="/team-builder" className="btn">Team Builder</Link>
          <Link to="/lobby" className="btn btn-accent">Battle Lobby</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Pokedex />} />
          <Route path="/team-builder" element={<TeamBuilder />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/battle" element={<Battle />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
