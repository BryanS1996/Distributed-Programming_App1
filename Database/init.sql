-- Crear tabla de pokemons
CREATE TABLE IF NOT EXISTS pokemons (
  id SERIAL PRIMARY KEY,
  poke_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  image_url TEXT,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  habitat VARCHAR(100),
  abilities TEXT,
  moves TEXT,
  stats JSONB,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas rápidas por nombre
CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemons(name);
CREATE INDEX IF NOT EXISTS idx_pokemon_poke_id ON pokemons(poke_id);
