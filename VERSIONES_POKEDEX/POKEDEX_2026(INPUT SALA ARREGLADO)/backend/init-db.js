const mysql = require('mysql2/promise');

async function initDB() {
  let connection;
  try {
    // Connect without database first to create it if it doesn't exist
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root'
    });

    console.log('Connected to MySQL server.');

    await connection.query('CREATE DATABASE IF NOT EXISTS pokedex_2026');
    console.log('Database pokedex_2026 created or already exists.');

    await connection.query('USE pokedex_2026');

    // Drop tables if they exist to start fresh
    await connection.query('DROP TABLE IF EXISTS team_pokemon');
    await connection.query('DROP TABLE IF EXISTS team');
    await connection.query('DROP TABLE IF EXISTS capturas');
    await connection.query('DROP TABLE IF EXISTS pokemon');

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pokemon (
        id INT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        tipo VARCHAR(100),
        altura INT,
        peso INT,
        imagen VARCHAR(255),
        ataque INT,
        defensa INT,
        vida INT
      )
    `);
    console.log('Table "pokemon" ready.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS team (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre_equipo VARCHAR(100) NOT NULL
      )
    `);
    console.log('Table "team" ready.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS team_pokemon (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT,
        pokemon_id INT,
        FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
        FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "team_pokemon" ready.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS capturas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pokemon_id INT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "capturas" ready.');

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('MySQL connection closed.');
    }
  }
}

initDB();
