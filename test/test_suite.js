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

// 1. Nuovo strato di cache
const cache = new Map();
/**
 * Recupera i dati meteorologici per una determinata città tramite l'API di Open-Meteo.
 * Esegue una prima richiesta (geocoding) per ottenere latitudine e longitudine della città,
 * seguita da una successiva richiesta API per ottenere le previsioni meteo giornaliere.
 *
 * @async
 * @function fetchWeather
 * @param {string} cityName - Il nome della città per la quale ottenere le previsioni (es. "Milano", "Roma").
 * @param {number} [days=7] - Il numero di giorni da includere nelle previsioni. Default: 7.
 * @returns {Promise<Object>} Una Promise che restituisce un oggetto strutturato con i risultati:
 * @returns {string} return.city - Il nome formattato della città trovata tramite geocoding.
 * @returns {string} return.country - Il codice o il nome del paese di appartenenza.
 * @returns {Array<Object>} return.forecasts - Array contenente le previsioni giornaliere.
 * @returns {string} return.forecasts[].dateStr - La data formattata (es. "Lun, 10 Apr").
 * @returns {number} return.forecasts[].max_temp - La temperatura massima prevista.
 * @returns {number} return.forecasts[].min_temp - La temperatura minima prevista.
 * @returns {string} return.forecasts[].description - Descrizione testuale della condizione meteo in italiano.
 * @throws {Error} Lancia un'eccezione in caso di problemi di rete, città non trovata o formato dati non valido.
 *
 * @example
 * // Esempio di utilizzo:
 * try {
 *   const data = await fetchWeather('Torino', 3); // Previsioni per 3 giorni
 *   console.log(`Meteo per ${data.city}, ${data.country}:`);
 *   
 *   data.forecasts.forEach(day => {
 *     console.log(`${day.dateStr}: ${day.description}, Max: ${day.max_temp}°, Min: ${day.min_temp}°`);
 *   });
 * } catch (error) {
 *   console.error("Errore durante il recupero dei dati:", error.message);
 * }
 */
async function fetchWeather(cityName, days = 7) {
    if (!cityName || cityName.trim() === "") {
        throw new Error("Input vuoto: inserisci il nome di una città.");
    }

    // 2. Controllo dei boundary per i giorni
    if (days < 1 || days > 16) {
        throw new Error("Numero di giorni non valido. L'API supporta da 1 a 16 giorni.");
    }

    const cacheKey = `${cityName.trim().toLowerCase()}_${days}`;
    if (cache.has(cacheKey)) {
        return { ...cache.get(cacheKey), cached: true }; // Flag aggiunto per i test
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=it&format=json`;
    const geoResponse = await fetch(geoUrl);

    if (geoResponse.status === 429) throw new Error("Limite di richieste superato. Riprova più tardi.");
    if (!geoResponse.ok) throw new Error(`Errore dal server: ${geoResponse.status} (Richiesta di geocoding)`);

    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) throw new Error("Città non trovata. Riprova con un altro nome.");
    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=${days}`;

    const weatherResponse = await fetch(weatherUrl);

    if (weatherResponse.status === 429) throw new Error("Limite di richieste superato. Riprova più tardi.");
    if (!weatherResponse.ok) throw new Error(`Errore dal server: ${weatherResponse.status} (Recupero dati meteo)`);

    const weatherData = await weatherResponse.json();

    // 3. Gestione di risposte vuote (es. in mezzo all'oceano)
    if (!weatherData || !weatherData.daily || !weatherData.daily.time || weatherData.daily.time.length === 0) {
        throw new Error("Dati meteorologici assenti per questa zona geografica.");
    }

    const dailyForecasts = weatherData.daily.time.map((time, index) => {
        // Verifica dei dati mancanti
        if (!weatherData.daily.temperature_2m_max || weatherData.daily.temperature_2m_max[index] === null) {
            throw new Error("Dati meteorologici incompleti");
        }

        const dateObj = new Date(time);
        let dayName = dateObj.toLocaleDateString('it-IT', { weekday: 'short' });
        dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        const dayOfMonth = dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

        return {
            dateRaw: time,
            dateStr: `${dayName}, ${dayOfMonth}`,
            max_temp: weatherData.daily.temperature_2m_max[index],
            min_temp: weatherData.daily.temperature_2m_min[index],
            description: weatherDescriptions[weatherData.daily.weathercode[index]] || "Sconosciuto"
        };
    });

    const result = {
        city: name,
        country: country,
        forecasts: dailyForecasts,
        cached: false
    };

    cache.set(cacheKey, result);
    return result;
}

// === TEST FRAMEWORK ===
const originalFetch = global.fetch;
let currentScenario = 'normal';
let fetchCallCount = 0;

global.fetch = async (url) => {
    fetchCallCount++;

    if (currentScenario === 'timeout') {
        await new Promise(r => setTimeout(r, 1000));
        throw new TypeError("fetch failed: network timeout");
    }

    if (currentScenario === 'server_error') {
        return { ok: false, status: 500, json: async () => ({ error: "Internal Server Error" }) };
    }

    if (currentScenario === 'rate_limit') {
        return { ok: false, status: 429, json: async () => ({ error: "Too many requests" }) };
    }

    if (currentScenario === 'bad_format' && url.includes('forecast')) {
        return { ok: true, status: 200, json: async () => ({ some_random_key: "value" }) };
    }

    if (currentScenario === 'empty_data' && url.includes('forecast')) {
        return { ok: true, status: 200, json: async () => ({ daily: { time: [] } }) };
    }

    if (currentScenario === 'missing_temp' && url.includes('forecast')) {
        return { ok: true, status: 200, json: async () => ({ daily: { time: ["2026-04-07"], temperature_2m_max: [null] } }) };
    }

    if (currentScenario === 'not_found' && url.includes('search')) {
        return { ok: true, status: 200, json: async () => ({ results: undefined }) };
    }

    return originalFetch(url);
};

// Test Runner Helper
async function runTest(name, scenario, testLogic) {
    console.log(`\n▶ TEST: ${name}`);
    currentScenario = scenario;
    fetchCallCount = 0;
    try {
        await testLogic();
        console.log(`  ✅ PASSED`);
    } catch (e) {
        console.log(`  ❌ FAILED: ${e.message}`);
    }
}

async function executeTests() {
    console.log("================ INIZIO TEST ==================");

    await runTest("1. Città valida (Roma)", "normal", async () => {
        const data = await fetchWeather("Roma");
        if (data.city !== "Rome" && data.city !== "Roma") throw new Error(`Città inaspettata: ${data.city}`);
    });

    await runTest("2. Città inesistente (Cittafinta123)", "not_found", async () => {
        try { await fetchWeather("Cittafinta123"); throw new Error("Doveva fallire"); } catch (e) { if (!e.message.includes("Città non trovata")) throw e; }
    });

    await runTest("3. Input vuoto", "normal", async () => {
        try { await fetchWeather("   "); throw new Error("Doveva fallire"); } catch (e) { if (!e.message.includes("Input vuoto")) throw e; }
    });

    await runTest("4. Errore del server API (500)", "server_error", async () => {
        try { await fetchWeather("Napoli"); throw new Error("Doveva fallire"); } catch (e) { if (!e.message.includes("Errore dal server: 500")) throw e; }
    });

    await runTest("5. Limite di velocità API (429 Rate Limit)", "rate_limit", async () => {
        try { await fetchWeather("Torino"); throw new Error("Doveva fallire"); } catch (e) { if (!e.message.includes("Limite di richieste superato")) throw e; }
    });

    await runTest("6. Connessione di rete lenta/timeout", "timeout", async () => {
        try { await fetchWeather("Genova"); throw new Error("Doveva fallire"); } catch (e) { if (!e.message.includes("network timeout") && !e.message.includes("fetch failed")) throw e; }
    });

    await runTest("7. Formato risposta API modificato imprevisto", "bad_format", async () => {
        try { await fetchWeather("Palermo"); throw new Error("Doveva fallire"); } catch (e) { if (!e.message.includes("assenti per questa zona")) throw e; }
    });

    // NUOVI TEST
    await runTest("8. Caratteri speciali ed Encoding ('L\\'Aquila' & 'São Paulo')", "normal", async () => {
        const data1 = await fetchWeather("L'Aquila");
        if (!data1.city.includes("L'Aquila")) throw new Error(`Encoding apostrofo fallito: trovato ${data1.city}`);

        const data2 = await fetchWeather("São Paulo");
        if (!data2.city.includes("Pau") && !data2.city.includes("Pao")) throw new Error(`Encoding accenti fallito: trovato ${data2.city}`);
    });

    await runTest("9. Boundary Testing Giorni (0 giorni)", "normal", async () => {
        try { await fetchWeather("Milano", 0); throw new Error("Doveva fallire per limite inferiore"); } catch (e) { if (!e.message.includes("Numero di giorni non valido")) throw e; }
    });

    await runTest("10. Boundary Testing Giorni (20 giorni oltre il max)", "normal", async () => {
        try { await fetchWeather("Milano", 20); throw new Error("Doveva fallire per limite superiore"); } catch (e) { if (!e.message.includes("Numero di giorni non valido")) throw e; }
    });

    await runTest("11. Zone con dati vuoti (Es. mezzo all'oceano)", "empty_data", async () => {
        try { await fetchWeather("Atlantis"); throw new Error("Doveva fallire per risposta con array vuoto"); } catch (e) { if (!e.message.includes("Dati meteorologici assenti")) throw e; }
    });

    await runTest("12. Dati meteorologici incompleti (Temperature mancanti o nulle)", "missing_temp", async () => {
        try { await fetchWeather("Bari"); throw new Error("Doveva fallire per temperatura null"); } catch (e) { if (!e.message.includes("Dati meteorologici incompleti")) throw e; }
    });

    await runTest("13. Risposte con cache / Debouncing", "normal", async () => {
        const countBefore = fetchCallCount;

        // Prima chiamata: fetch reali eseguiti (Geocoding + Forecast)
        const d1 = await fetchWeather("Verona", 3);
        if (d1.cached) throw new Error("La primissima volta non dovrebbe essere un hit di cache");

        const fetchesD1 = fetchCallCount - countBefore;

        // Seconda chiamata immediata (non deve eseguire nuovi fetch network)
        const d2 = await fetchWeather("Verona", 3);
        if (!d2.cached) throw new Error("La seconda volta deve restituire dalla cache");

        const totalFetches = fetchCallCount - countBefore;
        if (totalFetches > fetchesD1) throw new Error("fetch() non doveva essere invocato la seconda chiamata");
    });

    console.log("================= FINE TEST ===================");
}

executeTests();
