const crypto = require('crypto');

// In-memory store for active battles
const battles = {};

function calculateDamage(attack, defense) {
  const damage = attack - Math.floor(defense / 2);
  return Math.max(1, damage); // Minimum 1 damage
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create a new room
    socket.on('create_room', (data) => {
      // Room code: random 4-character hex
      const roomCode = crypto.randomBytes(2).toString('hex').toUpperCase();
      socket.join(roomCode);
      
      battles[roomCode] = {
        players: {
          [socket.id]: {
            id: socket.id,
            team: data.team, // Array of pokemon with stats
            activePokemonIdx: 0,
            ready: true,
          }
        },
        turn: socket.id,
        status: 'waiting' // waiting, active, finished
      };

      socket.emit('room_created', { roomCode });
      console.log(`Room ${roomCode} created by ${socket.id}`);
    });

    // Join existing room
    socket.on('join_room', (data) => {
      const { roomCode, team } = data;
      const room = battles[roomCode];

      if (!room) {
        socket.emit('error_message', 'Room not found');
        return;
      }

      if (Object.keys(room.players).length >= 2) {
        socket.emit('error_message', 'Room is full');
        return;
      }

      socket.join(roomCode);
      room.players[socket.id] = {
        id: socket.id,
        team: team,
        activePokemonIdx: 0,
        ready: true
      };
      
      room.status = 'active';

      io.to(roomCode).emit('battle_started', {
        gameState: room,
        message: 'Opponent joined! Battle started!'
      });
      console.log(`User ${socket.id} joined room ${roomCode}`);
    });

    // Handle Attack Action
    socket.on('attack', (data) => {
      const { roomCode } = data;
      const room = battles[roomCode];

      if (!room || room.status !== 'active' || room.turn !== socket.id) return;

      const playerIds = Object.keys(room.players);
      const opponentId = playerIds.find(id => id !== socket.id);
      
      const attacker = room.players[socket.id];
      const defender = room.players[opponentId];

      const attackerPokemon = attacker.team[attacker.activePokemonIdx];
      const defenderPokemon = defender.team[defender.activePokemonIdx];

      // Calculate Damage
      const damage = calculateDamage(attackerPokemon.ataque, defenderPokemon.defensa);
      defenderPokemon.vida_actual = Math.max(0, defenderPokemon.vida_actual - damage);

      let message = `${attackerPokemon.nombre} used an attack! It dealt ${damage} damage!`;
      
      // Check if defender fainted
      if (defenderPokemon.vida_actual === 0) {
        message += ` ${defenderPokemon.nombre} fainted!`;
        // Check if defender has any pokemon left
        const hasPokemonLeft = defender.team.some(p => p.vida_actual > 0);
        if (!hasPokemonLeft) {
          room.status = 'finished';
          message += ` ${socket.id} wins!`;
        }
      }

      // Change Turn
      if (room.status !== 'finished') {
        room.turn = opponentId;
      }

      io.to(roomCode).emit('battle_update', {
        gameState: room,
        logMessage: message
      });
    });

    // Handle Switch Action
    socket.on('switch_pokemon', (data) => {
      const { roomCode, pokemonIndex } = data;
      const room = battles[roomCode];

      if (!room || room.status !== 'active') return;
      
      const player = room.players[socket.id];
      
      if (player.team[pokemonIndex].vida_actual <= 0) {
        socket.emit('error_message', 'Cannot switch to a fainted Pokémon');
        return;
      }

      // If it's a forced switch (current pokemon fainted), don't consume turn immediately 
      // otherwise, consume turn
      const currentFainted = player.team[player.activePokemonIdx].vida_actual === 0;
      
      player.activePokemonIdx = pokemonIndex;
      const newPokemon = player.team[pokemonIndex];
      let message = `Player switched to ${newPokemon.nombre}!`;

      if (!currentFainted && room.turn === socket.id) {
        // Normal switch consumes turn
        const playerIds = Object.keys(room.players);
        const opponentId = playerIds.find(id => id !== socket.id);
        room.turn = opponentId;
      } else if (currentFainted && room.turn !== socket.id) {
        // Returning control doesn't change turn, wait the turn is already to the opponent from the attack
        // Wait, if opponent attacked and fainted my pokemon, it should be my turn now?
        // Let's keep turn logic simple: if you switch because it fainted, it becomes your turn?
        // Actually, alternating turns is standard.
      }

      io.to(roomCode).emit('battle_update', {
        gameState: room,
        logMessage: message
      });
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Notify rooms
      for (const [roomCode, room] of Object.entries(battles)) {
        if (room.players[socket.id]) {
          io.to(roomCode).emit('player_disconnected', 'Opponent disconnected.');
          delete battles[roomCode]; // Clean up room
        }
      }
    });
  });
};
