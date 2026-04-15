import { useState } from 'react';
import './App.css'; // Import styles

function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allPokemons, setAllPokemons] = useState([]);
  const [showList, setShowList] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const buscarYAtraparPokemon = async () => {
    if (!pokemonName.trim()) return;

    setLoading(true);
    setError(null);
    setPokemonData(null);

    try {
      const response = await fetch(`http://localhost:3000/api/pokemons/catch/${pokemonName}`, {
        method: 'POST'
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hubo un error al comunicarse con el servidor');
      }

      setPokemonData(data.pokemon);
      setPokemonName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarTodosPokemones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/pokemons');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Error al cargar los pokémon');
      }
      
      setAllPokemons(data.pokemons);
      setShowList(true);
      setSelectedPokemon(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseStats = (statsJson) => {
    try {
      return typeof statsJson === 'string' ? JSON.parse(statsJson) : statsJson;
    } catch {
      return {};
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Pokédex Full-Stack</h1>
        <p>Search and save Pokémon to your database</p>
      </header>

      {!showList ? (
        <div className="search-container">
          <div className="search-section">
            <input
              type="text"
              placeholder="E.g. pikachu, charizard or 25"
              value={pokemonName}
              onChange={(e) => setPokemonName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarYAtraparPokemon()}
              className="search-input"
            />
            <button onClick={buscarYAtraparPokemon} disabled={loading} className="btn btn-primary">
              {loading ? 'Searching...' : 'Find and Catch'}
            </button>
            <button 
              onClick={cargarTodosPokemones} 
              disabled={loading}
              className="btn btn-success"
            >
              View Collection ({allPokemons.length})
            </button>
          </div>

          {error && <div className="error-msg">⚠️ {error}</div>}

          {pokemonData && (
            <div className="pokemon-detail">
              <div className="pokemon-main">
                <div className="pokemon-image-section">
                  <img src={pokemonData.image_url} alt={pokemonData.name} className="pokemon-image" />
                  <h2>{pokemonData.name.toUpperCase()}</h2>
                  <p className="pokemon-id">#{pokemonData.poke_id}</p>
                </div>

                <div className="pokemon-info-section">
                  <div className="info-grid">
                    <div className="info-card">
                      <span className="label">Type</span>
                      <span className="value">{pokemonData.type}</span>
                    </div>
                    <div className="info-card">
                      <span className="label">Height</span>
                      <span className="value">{pokemonData.height} m</span>
                    </div>
                    <div className="info-card">
                      <span className="label">Weight</span>
                      <span className="value">{pokemonData.weight} kg</span>
                    </div>
                    <div className="info-card">
                      <span className="label">Habitat</span>
                      <span className="value">{pokemonData.habitat}</span>
                    </div>
                  </div>

                  <div className="description">
                    <h3>Description</h3>
                    <p>{pokemonData.description}</p>
                  </div>

                  <div className="abilities">
                    <h3>Abilities</h3>
                    <div className="tags">
                      {pokemonData.abilities?.split(', ').map((ability, idx) => (
                        <span key={idx} className="tag">{ability}</span>
                      ))}
                    </div>
                  </div>

                  <div className="moves">
                    <h3>Movimientos</h3>
                    <div className="tags">
                      {pokemonData.moves?.split(', ').map((move, idx) => (
                        <span key={idx} className="tag tag-move">{move}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="stats-section">
                <h3>Estadísticas Base</h3>
                <div className="stats">
                  {Object.entries(parseStats(pokemonData.stats)).map(([stat, value]) => (
                    <div key={stat} className="stat-bar">
                      <span className="stat-name">{stat}</span>
                      <div className="bar">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${Math.min((value / 255) * 100, 100)}%`,
                            backgroundColor: value > 100 ? '#4CAF50' : value > 50 ? '#FFC107' : '#FF5252'
                          }}
                        />
                      </div>
                      <span className="stat-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="success-badge">✓ Saved to DB!</div>
            </div>
          )}
        </div>
      ) : (
        <div className="collection-container">
          <button 
            onClick={() => setShowList(false)}
            className="btn btn-back"
          >
            ← Back to Search
          </button>

          <h2 className="collection-title">My Collection ({allPokemons.length})</h2>

          {selectedPokemon ? (
            <div className="pokemon-detail-card">
              <button 
                onClick={() => setSelectedPokemon(null)}
                className="btn btn-back"
              >
                ← Back to Collection
              </button>
              <div className="pokemon-main">
                <div className="pokemon-image-section">
                  <img src={selectedPokemon.image_url} alt={selectedPokemon.name} className="pokemon-image" />
                  <h2>{selectedPokemon.name.toUpperCase()}</h2>
                  <p className="pokemon-id">#{selectedPokemon.poke_id}</p>
                </div>

                <div className="pokemon-info-section">
                  <div className="info-grid">
                    <div className="info-card">
                      <span className="label">Type</span>
                      <span className="value">{selectedPokemon.type}</span>
                    </div>
                    <div className="info-card">
                      <span className="label">Height</span>
                      <span className="value">{selectedPokemon.height} m</span>
                    </div>
                    <div className="info-card">
                      <span className="label">Weight</span>
                      <span className="value">{selectedPokemon.weight} kg</span>
                    </div>
                    <div className="info-card">
                      <span className="label">Habitat</span>
                      <span className="value">{selectedPokemon.habitat}</span>
                    </div>
                  </div>

                  <div className="description">
                    <h3>Description</h3>
                    <p>{selectedPokemon.description}</p>
                  </div>

                  <div className="abilities">
                    <h3>Abilities</h3>
                    <div className="tags">
                      {selectedPokemon.abilities?.split(', ').map((ability, idx) => (
                        <span key={idx} className="tag">{ability}</span>
                      ))}
                    </div>
                  </div>

                  <div className="moves">
                    <h3>Moves</h3>
                    <div className="tags">
                      {selectedPokemon.moves?.split(', ').map((move, idx) => (
                        <span key={idx} className="tag tag-move">{move}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="stats-section">
                <h3>Base Stats</h3>
                <div className="stats">
                  {Object.entries(parseStats(selectedPokemon.stats)).map(([stat, value]) => (
                    <div key={stat} className="stat-bar">
                      <span className="stat-name">{stat}</span>
                      <div className="bar">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${Math.min((value / 255) * 100, 100)}%`,
                            backgroundColor: value > 100 ? '#4CAF50' : value > 50 ? '#FFC107' : '#FF5252'
                          }}
                        />
                      </div>
                      <span className="stat-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="pokemons-grid">
              {allPokemons.length === 0 ? (
                <p className="empty-message">You haven't caught any pokémon yet. Start searching!</p>
              ) : (
                allPokemons.map((pokemon) => (
                  <div 
                    key={pokemon.id} 
                    className="pokemon-card-small"
                    onClick={() => setSelectedPokemon(pokemon)}
                  >
                    <img src={pokemon.image_url} alt={pokemon.name} />
                    <h3>{pokemon.name.toUpperCase()}</h3>
                    <p className="pokemon-card-id">#{pokemon.poke_id}</p>
                    <p className="pokemon-card-type">{pokemon.type}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;