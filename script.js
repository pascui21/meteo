document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    const weatherResults = document.getElementById('weather-results');

    // La tua chiave API Meteosource
    const METEOSOURCE_API_KEY = '2xam02eqjgdv6ehg61mqvdxt46dgj8dmqqfuti10';

    // La tua chiave Google Maps (non usata in questo esempio ma inclusa per riferimento)
    const Maps_API_KEY = 'AIzaSyDcTncbLroGBItEXYAyXU45j2rgisiYi_E';

    getWeatherBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();

        if (city === '') {
            weatherResults.innerHTML = '<p class="error">Per favore, inserisci il nome di una città.</p>';
            return;
        }

        // URL dell'API Meteosource per le previsioni attuali (generalmente per coordinate)
        // Per ottenere previsioni per una città, spesso si usa un servizio di geocoding prima
        // o si cerca un endpoint che accetti nomi di città.
        // Meteosource consiglia di usare le coordinate. Useremo un endpoint di ricerca per il nome.
        // L'endpoint 'point_data' richiede lat/lon, quindi useremo 'find_places' per ottenere le coordinate.

        weatherResults.innerHTML = '<p>Caricamento previsioni...</p>';

        // Passo 1: Trovare le coordinate della città
        fetch(`https://www.meteosource.com/api/v1/web/find_places?text=${encodeURIComponent(city)}&key=${METEOSOURCE_API_KEY}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    const place = data[0]; // Prendiamo il primo risultato
                    const lat = place.lat;
                    const lon = place.lon;
                    const cityName = place.name; // Nome normalizzato della città

                    // Passo 2: Ottenere le previsioni meteo usando le coordinate
                    // Usiamo 'point_data' con 'sections=current' per i dati attuali
                    // e 'sections=daily' per le previsioni dei prossimi giorni
                    return fetch(`https://www.meteosource.com/api/v1/web/point_data?lat=${lat}&lon=${lon}&sections=current%2Cdaily&language=it&units=metric&key=${METEOSOURCE_API_KEY}`);
                } else {
                    throw new Error('Città non trovata. Controlla il nome e riprova.');
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayWeather(data, city); // Passa la città originale per visualizzazione
            })
            .catch(error => {
                console.error('Errore nel recupero delle previsioni:', error);
                weatherResults.innerHTML = `<p class="error">Errore: ${error.message}</p>`;
            });
    });

    function displayWeather(data, originalCity) {
        if (!data || !data.current || !data.daily) {
            weatherResults.innerHTML = '<p class="error">Dati meteo non disponibili per questa città.</p>';
            return;
        }

        const current = data.current;
        const daily = data.daily.data; // Array delle previsioni giornaliere

        let html = `<h2>Previsioni per ${originalCity.charAt(0).toUpperCase() + originalCity.slice(1)}</h2>`;

        // Previsioni attuali
        html += `
            <h3>Attuale</h3>
            <p>Temperatura: ${current.temperature}°C</p>
            <p>Percepita: ${current.feels_like}°C</p>
            <p>Condizioni: ${current.summary}</p>
            <p>Umidità: ${current.humidity}%</p>
            <p>Velocità vento: ${current.wind.speed} m/s</p>
            <p>Pressione: ${current.pressure} hPa</p>
        `;

        // Previsioni per i prossimi giorni (es. i prossimi 3 giorni)
        if (daily && daily.length > 0) {
            html += `<h3>Prossimi Giorni</h3>`;
            for (let i = 0; i < Math.min(daily.length, 3); i++) { // Mostra i prossimi 3 giorni
                const day = daily[i];
                const date = new Date(day.day).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
                html += `
                    <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                        <p><strong>${date}</strong></p>
                        <p>Temperatura Max: ${day.all_day.temperature_max}°C</p>
                        <p>Temperatura Min: ${day.all_day.temperature_min}°C</p>
                        <p>Condizioni: ${day.all_day.summary}</p>
                    </div>
                `;
            }
        }

        weatherResults.innerHTML = html;
    }
});