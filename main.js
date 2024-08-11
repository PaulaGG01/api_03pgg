document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'https://restcountries.com/v3.1/all';
    const pexelsApiKey = 'hQLa1um3diBfGuX8MNl2tQL6QM936pYy7bns6YavibjV3tadbd8fTpCy'; // Reemplaza con tu clave de API de Pexels
    let countriesData = [];

    // Obtener la lista de países al cargar la página
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            countriesData = data;
            displayCountries(countriesData);
            renderPieChart(countriesData);
        })
        .catch(error => console.error('Error al obtener la lista de países:', error));

    async function getCountryImage(query) {
        const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
        try {
            const response = await fetch(pexelsUrl, {
                headers: {
                    'Authorization': pexelsApiKey
                }
            });
            const data = await response.json();
            return data.photos[0] ? data.photos[0].src.medium : 'https://via.placeholder.com/400'; // Imagen por defecto si no se encuentra una
        } catch (error) {
            console.error('Error al obtener la imagen de Pexels:', error);
            return 'https://via.placeholder.com/400'; // Imagen por defecto en caso de error
        }
    }

    function displayCountries(countries) {
        const countriesListElement = document.getElementById('countries-list');
        const searchInput = document.getElementById('search-input');
        const countryDetailsElement = document.getElementById('country-details');

        // Inicializar el mapa
        const map = L.map('map').setView([0, 0], 2); // Centrar el mapa en el ecuador con zoom 2

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Función para formatear el objeto de idiomas en una cadena de texto
        function formatLanguages(languages) {
            return Object.values(languages).join(', ');
        }

        // Función para mostrar detalles del país seleccionado
        async function showCountryDetails(countryCode) {
            const selectedCountry = countries.find(country => country.cca3 === countryCode);
            if (selectedCountry) {
                const { name, flags, capital, population, area, region, latlng } = selectedCountry;
                const lat = latlng[0];
                const lng = latlng[1];
                const countryImageUrl = await getCountryImage(name.common);

                const countryDetails = `
                    <h2>${name.common}</h2>
                    <img src="${flags.svg}" alt="Flag" width="400" height="auto">
                    <img src="${countryImageUrl}" alt="Country Image" width="400" height="auto">
                    <p>Capital: ${capital}</p>
                    <p>Población: ${population}</p>
                    <p>Área: ${area} km²</p>
                    <p>Región: ${region}</p>
                    <p>Lenguaje: ${formatLanguages(selectedCountry.languages)}</p>
                `;
                countryDetailsElement.innerHTML = countryDetails;

                // Actualizar el mapa
                map.setView([lat, lng], 5); // Centrar el mapa en el país seleccionado
                L.marker([lat, lng]).addTo(map)
                    .bindPopup(`<b>${name.common}</b><br>Capital: ${capital}`)
                    .openPopup();
            } else {
                countryDetailsElement.innerHTML = '<p>No se encontraron detalles para este país.</p>';
            }
        }

        // Función para filtrar los países según el término de búsqueda
        function filterCountries() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredCountries = countries.filter(country =>
                country.name.common.toLowerCase().includes(searchTerm)
            );
            renderCountryList(filteredCountries);
        }

        // Escuchar eventos de cambio en el campo de búsqueda
        searchInput.addEventListener('input', filterCountries);

        // Renderizar la lista de países
        function renderCountryList(countryList) {
            // Limpiar la lista existente
            countriesListElement.innerHTML = '';
            countryDetailsElement.innerHTML = '';

            // Agrupar países por continente
            const continents = {};
            countryList.forEach(country => {
                const continent = country.region;
                if (!continents[continent]) {
                    continents[continent] = [];
                }
                continents[continent].push(country);
            });

            // Crear cards por continente en una fila
            for (const continent in continents) {
                const continentSection = document.createElement('div');
                continentSection.classList.add('continent-section');

                const continentTitle = document.createElement('h2');
                continentTitle.textContent = continent;
                continentSection.appendChild(continentTitle);

                const countryRow = document.createElement('div');
                countryRow.classList.add('country-row');

                continents[continent].forEach(country => {
                    const countryCard = document.createElement('div');
                    countryCard.classList.add('country-card');
                    countryCard.textContent = country.name.common;

                    // Agregar evento click para mostrar detalles del país
                    countryCard.addEventListener('click', () => showCountryDetails(country.cca3));

                    countryRow.appendChild(countryCard);
                });

                continentSection.appendChild(countryRow);
                countriesListElement.appendChild(continentSection);
            }
        }

        // Renderizar la lista inicial de países
        renderCountryList(countries);
    }

    function renderPieChart(data) {
        // Supongamos que 'data' es un array con datos de varios países y cada país tiene una propiedad 'region'
        const regions = Array.from(new Set(data.map(country => country.region)));
        const countriesByRegion = regions.map(region => data.filter(country => country.region === region).length);
    
        new Chart(document.getElementById("pie-chart"), {
            type: 'pie',
            data: {
                labels: regions,
                datasets: [{
                    data: countriesByRegion,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(131, 255, 97, 0.7)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(131, 255, 97, 1)',
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                maintainAspectRatio: false
            }
        });
    }
});
