const axios = require('axios');
const pool = require('./config/db');

async function seed() {
  try {
    console.log('Starting seed process...');
    
    // Fetch first 151 Pokemon
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
    const pokemonList = response.data.results;

    console.log(`Fetched ${pokemonList.length} pokemon from PokeAPI. Fetching details...`);

    for (const p of pokemonList) {
      const detailsRes = await axios.get(p.url);
      const data = detailsRes.data;

      const id = data.id;
      const nombre = data.name;
      const tipo = data.types.map(t => t.type.name).join(', ');
      const altura = data.height;
      const peso = data.weight;
      const imagen = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
      
      const stats = {};
      data.stats.forEach(s => {
        stats[s.stat.name] = s.base_stat;
      });

      const ataque = stats['attack'] || 50;
      const defensa = stats['defense'] || 50;
      const vida = stats['hp'] || 50;

      // Insert or ignore
      await pool.query(
        `INSERT IGNORE INTO pokemon (id, nombre, tipo, altura, peso, imagen, ataque, defensa, vida) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, nombre, tipo, altura, peso, imagen, ataque, defensa, vida]
      );
      
      console.log(`Inserted ${nombre} (#${id})`);
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();
