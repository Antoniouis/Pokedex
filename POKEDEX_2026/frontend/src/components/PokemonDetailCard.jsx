import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const typeColors = {
  normal: '#A8A77A', fuego: '#EE8130', agua: '#6390F0', planta: '#7AC74C',
  eléctrico: '#F7D02C', hielo: '#96D9D6', lucha: '#C22E28', veneno: '#A33EA1',
  tierra: '#E2BF65', volador: '#A98FF3', psíquico: '#F95587', bicho: '#A6B91A',
  roca: '#B6A136', fantasma: '#735797', dragón: '#6F35FC', siniestro: '#705848',
  acero: '#B7B7CE', hada: '#D685AD'
};
// Include Capitalized versions just in case
export const colors = {
  ...typeColors,
  Normal: '#A8A77A', Fuego: '#EE8130', Agua: '#6390F0', Planta: '#7AC74C',
  Eléctrico: '#F7D02C', Hielo: '#96D9D6', Lucha: '#C22E28', Veneno: '#A33EA1',
  Tierra: '#E2BF65', Volador: '#A98FF3', Psíquico: '#F95587', Bicho: '#A6B91A',
  Roca: '#B6A136', Fantasma: '#735797', Dragón: '#6F35FC', Siniestro: '#705848',
  Acero: '#B7B7CE', Hada: '#D685AD'
};

// Animated background based on type
const TypeBackground = ({ tipo }) => {
  const t = tipo ? tipo.toLowerCase().split(',')[0].trim() : 'normal';

  if (t === 'fuego') {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, x: Math.random() * 500, opacity: 0, scale: Math.random() * 0.5 + 0.5 }}
            animate={{ y: -550, opacity: [0, 0.8, 0], x: `calc(${Math.random() * 500}px + ${Math.random() * 60 - 30}px)` }}
            transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, ease: 'linear', delay: Math.random() * 2 }}
            style={{ position: 'absolute', bottom: -50, width: 25, height: 25, borderRadius: '50%', background: '#ffeb3b', filter: 'blur(6px)' }}
          />
        ))}
      </div>
    );
  }

  if (t === 'agua') {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110%', x: Math.random() * 500, opacity: 0 }}
            animate={{ y: '-10%', opacity: [0, 0.6, 0] }}
            transition={{ duration: Math.random() * 3 + 3, repeat: Infinity, ease: 'easeOut', delay: Math.random() * 3 }}
            style={{ position: 'absolute', bottom: 0, border: '2px solid rgba(255,255,255,0.4)', width: Math.random() * 25 + 15, height: Math.random() * 25 + 15, borderRadius: '50%' }}
          />
        ))}
      </div>
    );
  }

  if (t === 'planta') {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -50, x: Math.random() * 500, rotate: 0, opacity: 0 }}
            animate={{ y: 600, x: `calc(${Math.random() * 500}px + ${Math.random() * 120 - 60}px)`, rotate: 360, opacity: [0, 0.7, 0] }}
            transition={{ duration: Math.random() * 4 + 4, repeat: Infinity, ease: 'linear', delay: Math.random() * 4 }}
            style={{ position: 'absolute', top: -20, width: 18, height: 18, background: 'rgba(122, 199, 76, 0.7)', borderRadius: '0 50% 0 50%' }}
          />
        ))}
      </div>
    );
  }

  if (t === 'eléctrico') {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5, x: Math.random() * 500, y: Math.random() * 500 }}
            animate={{ opacity: [0, 0.9, 0, 0.9, 0], scale: 1 }}
            transition={{ duration: Math.random() * 1 + 1, repeat: Infinity, delay: Math.random() * 3, times: [0, 0.1, 0.2, 0.3, 1] }}
            style={{ position: 'absolute', top: 0, left: 0, width: 50, height: 4, background: '#fff', transform: `rotate(${Math.random() * 180}deg)`, filter: 'blur(1.5px)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.4, 0], scale: [0, 1.2, 0], y: [0, -60] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 3 }}
          style={{ position: 'absolute', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: 12, height: 12, background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }}
        />
      ))}
    </div>
  );
};

const StatBar = ({ label, value, color, max = 150 }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color, fontWeight: 'bold', fontSize: '0.95rem' }}>
    <span style={{ width: '70px' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, marginLeft: '5px' }}>
      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((value / max) * 100, 100)}%` }} style={{ height: '100%', background: color }} />
      </div>
      <span style={{ minWidth: '35px', textAlign: 'right', fontSize: '1.1rem' }}>{value}</span>
    </div>
  </div>
);

const PokemonDetailCard = ({ pokemon, onClose }) => {
  if (!pokemon) return null;

  const typeColor = colors[pokemon.tipo.split(',')[0].trim()] || '#444';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          cursor: 'zoom-out'
        }}
      >
        <motion.div
          initial={{ scale: 0.8, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '500px',
            height: '700px',
            background: `linear-gradient(145deg, ${typeColor} 0%, #1a1a1a 100%)`,
            borderRadius: '25px',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 25px 50px rgba(0,0,0,0.8)`,
            border: `4px solid ${typeColor}`,
            position: 'relative',
            cursor: 'default',
            overflow: 'hidden'
          }}
        >
          <TypeBackground tipo={pokemon.tipo} />

          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
              borderRadius: '50%', width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontWeight: 'bold', zIndex: 10
            }}
          >
            ✕
          </button>

          <div style={{ textAlign: 'center', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              transition={{ type: 'spring', damping: 15, delay: 0.1 }}
              src={pokemon.imagen}
              alt={pokemon.nombre}
              style={{
                width: '160px',
                height: '160px',
                objectFit: 'contain',
                filter: `drop-shadow(0px 8px 12px rgba(0,0,0,0.5))`,
                zIndex: 1,
                marginBottom: '1rem'
              }}
            />

            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', fontWeight: 'bold', margin: '0' }}>
              #{pokemon.id.toString().padStart(3, '0')}
            </p>
            <h2 style={{
              color: 'white',
              fontSize: '2.5rem',
              marginTop: '0.2rem',
              textTransform: 'capitalize',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              marginBottom: '0.5rem'
            }}>
              {pokemon.nombre}
            </h2>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {pokemon.tipo.split(',').map((t, idx) => (
                <span key={idx} style={{
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  background: colors[t.trim()] || 'rgba(0,0,0,0.3)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  {t.trim()}
                </span>
              ))}
            </div>

            {/* Stats Box */}
            <div style={{
              width: '100%',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
            }}>
              <StatBar label="❤️ HP" value={pokemon.vida} color="#ffb3ba" />
              <StatBar label="⚔️ ATQ" value={pokemon.ataque} color="#ffd5b5" />
              <StatBar label="🛡️ DEF" value={pokemon.defensa} color="#b5eafa" />
              <StatBar label="🔥 SP.A" value={pokemon.sp_ataque || 50} color="#fca3b7" />
              <StatBar label="🌀 SP.D" value={pokemon.sp_defensa || 50} color="#a3bcfc" />
              <StatBar label="⚡ VEL" value={pokemon.velocidad || 50} color="#fcf8a3" />
            </div>

            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', color: 'rgba(255,255,255,0.8)', marginTop: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
              <span>📏 {pokemon.altura / 10} m</span>
              <span>⚖️ {pokemon.peso / 10} kg</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PokemonDetailCard;
