const express = require('express');
const router = express.Router();
const pool = require('./config/db');

// GET /pokemon - List all pokemon
router.get('/pokemon', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pokemon ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /pokemon/:id - Get specific pokemon
router.get('/pokemon/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM pokemon WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pokemon not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /team - List all teams
router.get('/team', async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT * FROM team');

    // Fetch pokemons for each team
    for (let team of teams) {
      const [pokemons] = await pool.query(`
        SELECT p.* FROM pokemon p
        JOIN team_pokemon tp ON p.id = tp.pokemon_id
        WHERE tp.team_id = ?
      `, [team.id]);
      team.pokemons = pokemons;
    }

    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /team - Create a new team
router.post('/team', async (req, res) => {
  const { nombre_equipo, pokemon_ids } = req.body;
  if (!nombre_equipo || !pokemon_ids || pokemon_ids.length === 0 || pokemon_ids.length > 6) {
    return res.status(400).json({ error: 'Invalid team data. Provide nombre_equipo and an array of up to 6 pokemon_ids.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert team
    const [teamResult] = await connection.query('INSERT INTO team (nombre_equipo) VALUES (?)', [nombre_equipo]);
    const teamId = teamResult.insertId;

    // Insert team pokemons
    for (const pokemonId of pokemon_ids) {
      await connection.query('INSERT INTO team_pokemon (team_id, pokemon_id) VALUES (?, ?)', [teamId, pokemonId]);
    }

    await connection.commit();
    res.status(201).json({ id: teamId, nombre_equipo, pokemon_ids });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
});

// POST /capturar - Intento de captura de un Pokémon
router.post('/capturar', async (req, res) => {
  const { pokemon_id } = req.body;
  if (!pokemon_id) return res.status(400).json({ error: 'pokemon_id es requerido' });

  // Tal y como pediste estableciendo 'success = true' en el Lobby:
  // Hacemos que el backend SIEMPRE acepte la captura (100%)
  const isCaught = true;

  if (isCaught) {
    try {
      await pool.query('INSERT INTO capturas (pokemon_id) VALUES (?)', [pokemon_id]);
      res.json({ success: true, message: '¡Pokémon capturado exitosamente!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error del servidor al guardar.' });
    }
  } else {
    // Escapó, no hacemos INSERT
    res.json({ success: false, message: '¡El Pokémon se escapó!' });
  }
});

module.exports = router;
