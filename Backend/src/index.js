const express = require('express');
const cors = require('cors');
const axios = require('axios'); // To query external PokeAPI
const pool = require('./db');   // Your connection to Postgres

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route to search for a Pokémon and "catch" it (save it to your DB)
app.post('/api/pokemons/catch/:nameOrId', async (req, res) => {
  const { nameOrId } = req.params;

  try {
    // 1. Query the external PokeAPI
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
    const pokeData = response.data;

    // Get species information for habitat and description
    let habitat = 'Unknown';
    let description = 'No description';
    try {
      const speciesResponse = await axios.get(pokeData.species.url);
      const speciesData = speciesResponse.data;
      habitat = speciesData.habitat?.name || 'Unknown';
      
      // Get description in Spanish or English
      const flavorText = speciesData.flavor_text_entries?.find(entry => 
        entry.language.name === 'es' || entry.language.name === 'en'
      );
      description = flavorText?.flavor_text?.replace(/[\n\f]/g, ' ') || 'No description';
    } catch (err) {
      console.log('Species information not available');
    }

    // 2. Extract the information we need for our table
    const idOficial = pokeData.id;
    const nombre = pokeData.name;
    const tipo = pokeData.types.map(t => t.type.name).join(', ');
    const imagen = pokeData.sprites.front_default;
    const height = (pokeData.height / 10).toFixed(2); // Convert to meters
    const weight = (pokeData.weight / 10).toFixed(2); // Convert to kg
    const abilities = pokeData.abilities.map(a => a.ability.name).join(', ');
    const moves = pokeData.moves.slice(0, 5).map(m => m.move.name).join(', ');
    
    // Prepare stats as JSON
    const stats = JSON.stringify(
      pokeData.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {})
    );

    // 3. Save to your Postgres database
    const query = `
      INSERT INTO pokemons (poke_id, name, type, image_url, height, weight, habitat, abilities, moves, stats, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [idOficial, nombre, tipo, imagen, height, weight, habitat, abilities, moves, stats, description];

    const dbResult = await pool.query(query, values);

    // 4. Respond to the Frontend (React) with success
    res.json({
      mensaje: "¡Pokémon atrapado y guardado con éxito!",
      pokemon: dbResult.rows[0]
    });

  } catch (error) {
    console.error("Error in /catch route:", error.message);
    
    // Friendly error handling
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: "That Pokémon does not exist in PokeAPI." });
    }
    // Error 23505 occurs because poke_id already exists in DB (UNIQUE constraint violation)
    if (error.code === '23505') {
       return res.status(400).json({ error: "You already caught this Pokémon!" });
    }
    
    res.status(500).json({ error: "Internal server error." });
  }
});

// Route to get ALL caught Pokémon
app.get('/api/pokemons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pokemons ORDER BY created_at DESC');
    res.json({
      total: result.rows.length,
      pokemons: result.rows
    });
  } catch (error) {
    console.error("Error getting pokémons:", error.message);
    res.status(500).json({ error: "Error retrieving Pokémon." });
  }
});

// Route to get a specific Pokémon by ID in the DB
app.get('/api/pokemons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM pokemons WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pokémon not found." });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error getting pokémon:", error.message);
    res.status(500).json({ error: "Error retrieving the Pokémon." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});