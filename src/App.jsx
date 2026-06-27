import { useState } from "react";
import "./App.css";

const TYPE_COLORS = {
  normal: "#827B5D", fire: "#F08030", water: "#6890F0", electric: "#C9A30D",
  grass: "#78C850", ice: "#4FA8A8", fighting: "#C03028", poison: "#A040A0",
  ground: "#B08D3F", flying: "#7A5FDB", psychic: "#F85888", bug: "#8C9618",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#8C8CA8", fairy: "#D6678A",
};
const ABILITY_COLOR = "#586078";

function App() {
  const [loading, setLoading] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [banList, setBanList] = useState([]);
  const [history, setHistory] = useState([]);

  function isBanned(value) {
    return banList.includes(value);
  }

  function toggleBan(value) {
    if (isBanned(value)) {
      setBanList(banList.filter((v) => v !== value));
    } else {
      setBanList([...banList, value]);
    }
  }

  async function discover() {
    setLoading(true);

    let found = null;
    let attempts = 0;

    while (!found && attempts < 30) {
      attempts++;

      const randomId = Math.floor(Math.random() * 1010) + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await res.json();

      const types = data.types.map((t) => t.type.name);
      const abilities = data.abilities.map((a) => a.ability.name);

      const hasBannedType = types.some((t) => banList.includes(t));
      const hasBannedAbility = abilities.some((a) => banList.includes(a));

      if (!hasBannedType && !hasBannedAbility) {
        let image = data.sprites.other["official-artwork"].front_default;
        if (!image) {
          image = data.sprites.front_default; // fallback if no official artwork
        }

        found = {
          id: data.id,
          name: data.name,
          image,
          types,
          abilities,
          height: data.height,
          weight: data.weight,
        };
      }
    }

    if (found) {
      setPokemon(found);
      setHistory((prevHistory) => [found, ...prevHistory]);
    } else {
      alert("Couldn't find a Pokémon that clears your ban list. Try unbanning something!");
    }

    setLoading(false);
  }

  return (
    <div className="app-shell">
      <div className="header">
        <h1>Whisker Catalog</h1>
        <p>Catch a Pokémon, ban a trait you don't want again.</p>
      </div>

      {/* Center stage */}
      <div className="stage">
        {pokemon ? (
          <>
            <img src={pokemon.image} alt={pokemon.name} />
            <h2>{pokemon.name}</h2>
            <div className="stat-row">
              <span>Height: {pokemon.height}</span>
              <span>Weight: {pokemon.weight}</span>
            </div>
          </>
        ) : (
          <p className="empty-hint">Click Discover to find your first Pokémon.</p>
        )}
        <button className="discover-btn" onClick={discover} disabled={loading}>
          {loading ? "Searching..." : "Discover"}
        </button>
      </div>

      {/* Types/abilities + ban list, side by side */}
      <div className="control-deck">
        <div className="panel">
          <h3>Types &amp; Abilities</h3>
          {pokemon ? (
            <>
              <div className="chip-row" style={{ marginBottom: "8px" }}>
                {pokemon.types.map((type) => (
                  <button
                    key={type}
                    className={`chip ${isBanned(type) ? "banned" : ""}`}
                    style={{ background: isBanned(type) ? undefined : TYPE_COLORS[type] }}
                    onClick={() => toggleBan(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="chip-row">
                {pokemon.abilities.map((ability) => (
                  <button
                    key={ability}
                    className={`chip ${isBanned(ability) ? "banned" : ""}`}
                    style={{ background: isBanned(ability) ? undefined : ABILITY_COLOR }}
                    onClick={() => toggleBan(ability)}
                  >
                    {ability}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="empty-hint">Discover a Pokémon to see its types and abilities here.</p>
          )}
        </div>

        <div className="panel">
          <h3>Banned</h3>
          {banList.length === 0 ? (
            <p className="empty-hint">Click a type or ability to ban it.</p>
          ) : (
            <>
              <div className="chip-row">
                {banList.map((value) => (
                  <button key={value} className="chip banned" onClick={() => toggleBan(value)}>
                    {value} ✕
                  </button>
                ))}
              </div>
              <button className="clear-bans" onClick={() => setBanList([])}>
                Clear all bans
              </button>
            </>
          )}
        </div>
      </div>

      {/* History */}
      <div className="history-panel">
        <h3>History ({history.length})</h3>
        <div className="history-row">
          {history.map((p) => (
            <div key={p.id} className="history-item">
              <img src={p.image} alt={p.name} />
              <p>{p.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;