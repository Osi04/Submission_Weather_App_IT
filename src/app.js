const weatherDescriptions = {
    0: "Cielo sereno",
    1: "Prevalentemente sereno",
    2: "Parzialmente nuvoloso",
    3: "Coperto",
    45: "Nebbia",
    48: "Nebbia con brina",
    51: "Pioviggine leggera",
    53: "Pioviggine moderata",
    55: "Pioviggine intensa",
    61: "Pioggia leggera",
    63: "Pioggia moderata",
    65: "Pioggia intensa",
    71: "Neve leggera",
    73: "Neve moderata",
    75: "Neve intensa",
    95: "Temporale",
    96: "Temporale con grandine",
    99: "Temporale forte"
};

const weatherCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 ora in millisecondi

async function fetchWeather(cityName, days = 7) {
    const cacheKey = `${cityName.trim().toLowerCase()}_${days}`;
    const now = Date.now();

    // Controlla se la città è in cache e i dati sono validi (meno di 1 ora)
    if (weatherCache[cacheKey] && (now - weatherCache[cacheKey].timestamp < CACHE_DURATION)) {
        console.log(`📥 Dati per ${cityName} recuperati dalla cache.`);
        return weatherCache[cacheKey].data;
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=it&format=json`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Errore nella richiesta di geocoding");

    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) throw new Error("Città non trovata. Riprova con un altro nome.");
    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=${days}`;

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("Errore nel recupero dei dati meteo");

    const weatherData = await weatherResponse.json();

    if (!weatherData.daily) throw new Error("Dati meteo non disponibili per questa città");

    const dailyForecasts = weatherData.daily.time.map((time, index) => {
        // Format date better
        const dateObj = new Date(time);

        // Capitalize the day name correctly
        let dayName = dateObj.toLocaleDateString('it-IT', { weekday: 'short' });
        dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        const dayOfMonth = dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

        return {
            dateStr: `${dayName}, ${dayOfMonth}`,
            max_temp: weatherData.daily.temperature_2m_max[index],
            min_temp: weatherData.daily.temperature_2m_min[index],
            description: weatherDescriptions[weatherData.daily.weathercode[index]] || "Sconosciuto"
        };
    });

    const result = {
        city: name,
        country: country,
        forecasts: dailyForecasts
    };

    // Salva il risultato in cache
    weatherCache[cacheKey] = {
        timestamp: Date.now(),
        data: result
    };

    return result;
}

// UI LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const loadingText = document.getElementById('loading');
    const errorBox = document.getElementById('errorBox');
    const weatherResult = document.getElementById('weatherResult');
    const cityNameEl = document.getElementById('cityName');
    const countryCodeEl = document.getElementById('countryCode');
    const forecastCardsEl = document.getElementById('forecastCards');

    /**
 * Gestisce il flusso dell'interfaccia utente (UI) quando l'utente cerca una città.
 * 
 * Si occupa di leggere il valore di input, di ripulire le visualizzazioni precedenti,
 * di mostrare lo stato di "Caricamento...", chiamare il servizio di rete `fetchWeather` 
 * e, infine, di generare dinamicamente nel DOM le card (HTML) contenenti i risultati.
 * In caso di eccezioni gestisce la visualizzazione degli errori (es. Città inesistente).
 *
 * @async
 * @function handleSearch
 * @returns {Promise<void>} Questa funzione non restituisce valori, ma esegue manipolazioni laterali direttamente sul DOM.
 * 
 * @example
 * // Viene normalmente associata ad un event listener dei bottoni e dello stato dell'input:
 * 
 * searchBtn.addEventListener('click', handleSearch);
 * 
 * cityInput.addEventListener('keypress', (e) => {
 *     if (e.key === 'Enter') handleSearch();
 * });
 */
    async function handleSearch() {
        const city = cityInput.value.trim();
        if (!city) return;

        // Reset UI
        weatherResult.classList.add('hidden');
        errorBox.classList.add('hidden');
        loadingText.classList.remove('hidden');
        forecastCardsEl.innerHTML = '';

        try {
            const data = await fetchWeather(city, 7); // Default to 7 days

            // Update UI
            cityNameEl.textContent = data.city;
            countryCodeEl.textContent = data.country;

            data.forecasts.forEach((f, idx) => {
                const card = document.createElement('div');
                card.className = 'forecast-card';
                card.style.animationDelay = `${idx * 0.05}s`; // staggered animation

                const dateEl = document.createElement('div');
                dateEl.className = 'date';
                dateEl.textContent = f.dateStr;

                const descEl = document.createElement('div');
                descEl.className = 'desc';
                descEl.textContent = f.description;

                const tempsEl = document.createElement('div');
                tempsEl.className = 'temps';

                const maxSpan = document.createElement('span');
                maxSpan.className = 'max';
                maxSpan.title = 'Massima';
                maxSpan.textContent = `${Math.round(f.max_temp)}°`;

                const minSpan = document.createElement('span');
                minSpan.className = 'min';
                minSpan.title = 'Minima';
                minSpan.textContent = `${Math.round(f.min_temp)}°`;

                tempsEl.appendChild(maxSpan);
                tempsEl.appendChild(minSpan);

                card.appendChild(dateEl);
                card.appendChild(descEl);
                card.appendChild(tempsEl);

                forecastCardsEl.appendChild(card);
            });

            weatherResult.classList.remove('hidden');
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.classList.remove('hidden');
        } finally {
            loadingText.classList.add('hidden');
        }
    }

    searchBtn.addEventListener('click', handleSearch);

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
});
