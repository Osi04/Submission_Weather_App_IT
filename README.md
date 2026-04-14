# ☀️ MeteoTracker Pro

> Un'app web per le previsioni meteo, costruita con HTML, CSS e JavaScript vanilla.

---

## 📖 Panoramica del Progetto

**MeteoTracker Pro** è un'applicazione web che permette agli utenti di cercare le previsioni meteo di qualsiasi città al mondo. L'app interroga le API gratuite di [Open-Meteo](https://open-meteo.com/) per ottenere dati di geocoding e previsioni giornaliere, presentandoli in un'interfaccia moderna con effetti glassmorphism, animazioni fluide e design responsive.

L'interfaccia è interamente in italiano e mostra previsioni a 7 giorni con temperatura massima, minima e descrizione delle condizioni atmosferiche.

---

## 🛠️ Istruzioni di Installazione

### Prerequisiti

- Un **browser web** moderno (Chrome, Firefox, Safari, Edge)
- **Node.js** (v16+) — solo se si vogliono eseguire i test automatizzati
- Connessione a Internet (per le chiamate API)

### Installazione

1. **Clona o scarica il repository:**
   ```bash
   git clone <url-repository>
   cd MeteoTrial
   ```

2. **Nessuna dipendenza da installare.** L'app è costruita interamente con tecnologie web native (HTML, CSS, JavaScript) e non richiede `npm install` né altri package manager.

3. **Apri l'app nel browser:**
   ```bash
   # macOS
   open index.html

   # Linux
   xdg-open index.html

   # Windows
   start index.html
   ```

   In alternativa, trascina il file `index.html` direttamente nella finestra del browser.

---

## 🚀 Guida all'Utilizzo

1. **Apri** `index.html` nel browser.
2. **Digita** il nome di una città nel campo di ricerca (es. `Roma`, `Milano`, `London`).
3. **Premi** il pulsante **"Cerca"** oppure il tasto **Invio**.
4. **Visualizza** le previsioni a 7 giorni con:
   - Nome della città e Paese
   - Card giornaliere con data, condizioni meteo, temperatura massima e minima
5. Per cercare un'altra città, cancella il campo e inserisci un nuovo nome.

### Esecuzione dei Test

Per eseguire la suite di test automatizzati:

```bash
node test_suite.js
```

Per eseguire i test di base (previsioni a 7, 10, 14 giorni per Milano):

```bash
node test.js
```

---

## 📋 Output di Esempio

### Interfaccia Web

L'app mostra un'interfaccia scura e elegante con:
- Un campo di ricerca con pulsante
- Card animate per ogni giorno di previsione
- Temperatura massima (in bianco) e minima (in grigio)

### Output del test CLI (`test.js`)

```
--- Test: Previsioni per Milano a 7 giorni ---
Città: Milano, Italia
- 2026-04-09: Coperto, Max: 22.6°C, Min: 12.1°C
- 2026-04-10: Coperto, Max: 22.8°C, Min: 10.3°C
- 2026-04-11: Coperto, Max: 22.2°C, Min: 11.6°C
- 2026-04-12: Temporale, Max: 20.4°C, Min: 13.3°C
- 2026-04-13: Temporale, Max: 14.7°C, Min: 10.6°C
- 2026-04-14: Coperto, Max: 15°C, Min: 9.3°C
- 2026-04-15: Parzialmente nuvoloso, Max: 21.6°C, Min: 7.6°C
```

### Output della suite di test (`test_suite.js`)

```
================ INIZIO TEST ==================

▶ TEST: 1. Città valida (Roma)
  ✅ PASSED

▶ TEST: 2. Città inesistente (Cittafinta123)
  ✅ PASSED

▶ TEST: 3. Input vuoto
  ✅ PASSED

▶ TEST: 4. Errore del server API (500)
  ✅ PASSED

▶ TEST: 5. Limite di velocità API (429 Rate Limit)
  ✅ PASSED

▶ TEST: 6. Connessione di rete lenta/timeout
  ✅ PASSED

▶ TEST: 7. Formato risposta API modificato imprevisto
  ✅ PASSED

▶ TEST: 8. Caratteri speciali ed Encoding ('L\'Aquila' & 'São Paulo')
  ✅ PASSED

▶ TEST: 9. Boundary Testing Giorni (0 giorni)
  ✅ PASSED

▶ TEST: 10. Boundary Testing Giorni (20 giorni oltre il max)
  ✅ PASSED

▶ TEST: 11. Zone con dati vuoti (Es. mezzo all'oceano)
  ✅ PASSED

▶ TEST: 12. Dati meteorologici incompleti (Temperature mancanti o nulle)
  ✅ PASSED

▶ TEST: 13. Risposte con cache / Debouncing
  ✅ PASSED

================= FINE TEST ===================
```

---

## ✨ Funzionalità

| Funzionalità | Descrizione |
|---|---|
| **Ricerca città** | Cerca qualsiasi città al mondo per nome, con supporto multilingue |
| **Previsioni a 7 giorni** | Visualizza previsioni giornaliere con temperature max/min e condizioni meteo |
| **Design Glassmorphism** | Interfaccia moderna con effetti vetro, sfondi sfumati e bordi trasparenti |
| **Animazioni fluide** | Card con animazione fade-in sfalsata e hover con elevazione |
| **Design Responsive** | Layout adattivo per desktop, tablet e mobile |
| **Supporto Enter** | Ricerca attivabile sia con il pulsante che con il tasto Invio |
| **Spinner di caricamento** | Feedback visivo durante il recupero dei dati |
| **Messaggi d'errore** | Errori mostrati con stile proprio, senza interrompere l'esperienza |
| **Cache delle risposte** | Le risposte API vengono memorizzate per evitare chiamate ridondanti (in `test_suite.js`) |
| **Validazione input** | Controllo di input vuoti e limiti di giorni di previsione (1–16) |
| **Encoding caratteri speciali** | Gestione corretta di nomi con apostrofi e accenti (es. L'Aquila, São Paulo) |
| **Suite di test completa** | 13 test automatizzati con mock del `fetch` per scenari edge-case |

---

## ⚠️ Gestione degli Errori

L'app gestisce i seguenti scenari di errore in modo robusto:

### Lato UI (`app.js`)

| Scenario | Comportamento |
|---|---|
| **Input vuoto** | La ricerca viene ignorata silenziosamente (`if (!city) return`) |
| **Città non trovata** | Messaggio: *"Città non trovata. Riprova con un altro nome."* |
| **Errore di geocoding** | Messaggio: *"Errore nella richiesta di geocoding"* |
| **Errore dati meteo** | Messaggio: *"Errore nel recupero dei dati meteo"* |
| **Dati non disponibili** | Messaggio: *"Dati meteo non disponibili per questa città"* |

### Lato Test Suite (`test_suite.js`) — Gestione avanzata

| Scenario | Comportamento |
|---|---|
| **Input vuoto o spazi** | `throw Error("Input vuoto: inserisci il nome di una città.")` |
| **Giorni fuori range (< 1 o > 16)** | `throw Error("Numero di giorni non valido. L'API supporta da 1 a 16 giorni.")` |
| **Rate limit (HTTP 429)** | `throw Error("Limite di richieste superato. Riprova più tardi.")` |
| **Errore server (HTTP 5xx)** | `throw Error("Errore dal server: {status}")` con indicazione della fase |
| **Timeout di rete** | L'errore nativo di `fetch` viene propagato |
| **Risposta con formato imprevisto** | `throw Error("Dati meteorologici assenti per questa zona geografica.")` |
| **Dati con temperature nulle** | `throw Error("Dati meteorologici incompleti")` |

Tutti gli errori vengono visualizzati nell'interfaccia all'interno di un box rosso dedicato (`#errorBox`), senza compromettere il funzionamento dell'app.

---

## 🌐 Informazioni API

L'app utilizza due endpoint delle API **Open-Meteo** (gratuite, senza chiave API):

### 1. Geocoding API

- **URL:** `https://geocoding-api.open-meteo.com/v1/search`
- **Scopo:** Convertire il nome della città in coordinate geografiche (latitudine/longitudine)
- **Parametri:**

| Parametro | Valore | Descrizione |
|---|---|---|
| `name` | `{cityName}` | Nome della città (URL-encoded) |
| `count` | `1` | Numero massimo di risultati |
| `language` | `it` | Lingua dei risultati |
| `format` | `json` | Formato della risposta |

### 2. Forecast API

- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Scopo:** Ottenere le previsioni meteo giornaliere per le coordinate fornite
- **Parametri:**

| Parametro | Valore | Descrizione |
|---|---|---|
| `latitude` | `{lat}` | Latitudine dalla Geocoding API |
| `longitude` | `{lon}` | Longitudine dalla Geocoding API |
| `daily` | `weathercode,temperature_2m_max,temperature_2m_min` | Dati giornalieri richiesti |
| `timezone` | `auto` | Fuso orario automatico |
| `forecast_days` | `7` (default, max `16`) | Numero di giorni di previsione |

### Weather Code (Codici Meteo)

L'app traduce i codici meteo WMO in descrizioni italiane:

| Codice | Descrizione |
|---|---|
| 0 | Cielo sereno |
| 1 | Prevalentemente sereno |
| 2 | Parzialmente nuvoloso |
| 3 | Coperto |
| 45, 48 | Nebbia / Nebbia con brina |
| 51, 53, 55 | Pioviggine (leggera → intensa) |
| 61, 63, 65 | Pioggia (leggera → intensa) |
| 71, 73, 75 | Neve (leggera → intensa) |
| 95, 96, 99 | Temporale / con grandine |

> 📌 **Nota:** Open-Meteo è un servizio gratuito e open-source. Non è richiesta alcuna chiave API. Documentazione completa: [open-meteo.com/en/docs](https://open-meteo.com/en/docs)

---

## 🔮 Miglioramenti Futuri

- [ ] **Selezione giorni di previsione** — Aggiungere un selettore (slider o dropdown) per scegliere tra 1 e 16 giorni
- [ ] **Icone meteo** — Associare icone grafiche (SVG/emoji) ai codici meteo WMO per un impatto visivo migliore
- [ ] **Geolocalizzazione automatica** — Utilizzare l'API `navigator.geolocation` per rilevare automaticamente la posizione dell'utente
- [ ] **Dati meteo aggiuntivi** — Mostrare umidità, velocità del vento, probabilità di precipitazioni e indice UV
- [ ] **Grafico temperature** — Visualizzare l'andamento delle temperature in un grafico interattivo (es. con Chart.js)
- [ ] **Salvataggio città preferite** — Permettere di salvare e accedere rapidamente alle città frequenti tramite `localStorage`
- [ ] **Tema chiaro/scuro** — Toggle per passare dalla modalità dark a quella light
- [ ] **Supporto multilingua** — Aggiungere la possibilità di cambiare lingua dell'interfaccia (EN, IT, ES, FR, ecc.)
- [ ] **PWA (Progressive Web App)** — Rendere l'app installabile su dispositivi mobili con supporto offline
- [ ] **Debounce della ricerca** — Aggiungere un meccanismo di debounce per evitare chiamate API troppo frequenti durante la digitazione
- [ ] **Accessibilità (a11y)** — Migliorare il supporto per screen reader con attributi ARIA e navigazione da tastiera

---

## 🐛 Criticità Conosciute

### Bug e Limitazioni

| Criticità | Severità | Descrizione |
|---|---|---|
| **Validazione input limitata in `app.js`** | 🟡 Media | `app.js` ignora silenziosamente gli input vuoti ma non valida caratteri speciali o stringhe troppo lunghe. La validazione più robusta è presente solo in `test_suite.js`. |
| **Nessun limite di giorni in `app.js`** | 🟢 Bassa | Il valore `days` è hardcoded a `7` nell'interfaccia. Non c'è un controllo di boundary come in `test_suite.js` (anche se l'utente non ha modo di modificare il parametro). |
| **Duplicazione del codice** | 🟡 Media | La logica weather (`fetchWeather` / `getWeather`) è duplicata tra `app.js`, `test.js` e `test_suite.js` anziché importata da un modulo condiviso. |
| **Nessun feedback per rete assente** | 🟡 Media | Se la connessione a Internet non è disponibile, l'errore mostrato è generico (`fetch failed`) e poco informativo per l'utente. |
| **Date localizzate** | 🟢 Bassa | La formattazione delle date con `toLocaleDateString('it-IT')` potrebbe comportarsi diversamente su ambienti server Node.js rispetto al browser, a seconda dei locale installati. |
| **Nessun fallback per font** | 🟢 Bassa | Il font Google "Outfit" viene caricato da CDN. Se il CDN non è raggiungibile, si utilizza il fallback generico `sans-serif`. |
| **Weathercode incompleti** | 🟢 Bassa | La mappa `weatherDescriptions` non copre tutti i codici WMO possibili (es. 56, 57, 66, 67, 77, 80, 81, 82, 85, 86). I codici non mappati vengono mostrati come *"Sconosciuto"*. |

---

## 📁 Struttura del Progetto

```
MeteoTrial/
├── index.html        # Pagina HTML principale
├── style.css         # Foglio di stile con design glassmorphism
├── app.js            # Logica applicativa e gestione UI
├── test.js           # Test di base (previsioni a 7/10/14 giorni)
├── test_suite.js     # Suite completa con 13 test e mock di fetch
└── README.md         # Questo file
```

---

## 📄 Licenza

Questo progetto è a scopo didattico. I dati meteo sono forniti da [Open-Meteo](https://open-meteo.com/) sotto licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
