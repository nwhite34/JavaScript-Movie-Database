const apiKey = '9f4000ad';
const apiUrl = 'https://www.omdbapi.com/';

const movieDataContainer = document.getElementById('movieData');
const wrapperIcon = document.getElementById('wrapper-moviediv-icon');
const noMoviesFoundElement = document.getElementById('noMoviesFound');

function toggleWrapperIcon() {
    if (movieDataContainer.childElementCount > 0) {
        wrapperIcon.style.display = 'none';
    } else {
        wrapperIcon.style.display = 'flex';
    }
}

function displayNoMoviesFound() {
    noMoviesFoundElement.style.display = 'block';
    wrapperIcon.style.display = 'none'; // Hide the wrapper icon
}

async function fetchMovieDetails(movieId) {
    const queryParameters = new URLSearchParams({
        i: movieId,
        apikey: apiKey,
    });

    const fullApiUrl = `${apiUrl}?${queryParameters}`;

    try {
        const response = await fetch(fullApiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

const loadingSpinner = document.getElementById('loading-spinner');

async function fetchMoviesByTitle(movieTitle) {
    loadingSpinner.style.display = 'block'; // Show loading spinner

    noMoviesFoundElement.style.display = 'none'; // Hide the noMoviesFoundElement

    const queryParameters = new URLSearchParams({
        s: movieTitle,
        apikey: apiKey,
    });

    const fullApiUrl = `${apiUrl}?${queryParameters}`;

    try {
        const response = await fetch(fullApiUrl);
        const data = await response.json();
        if (data.Search) {
            const moviesWithDetails = await Promise.all(data.Search.map(async movie => {
                const movieDetailsResponse = await fetchMovieDetails(movie.imdbID);
                return { ...movie, ...movieDetailsResponse };
            }));

            displayMovieList(moviesWithDetails);
        } else {
            displayNoMoviesFound();
        }
    } catch (error) {
        console.error('Error fetching movie data:', error);
    } finally {
        setTimeout(() => {
            loadingSpinner.style.display = 'none'; // Hide loading spinner after 5 seconds
        }, 1000);
    }
}

function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('search-bar');
    const movieTitle = searchInput.value;

    if (movieTitle) {
        fetchMoviesByTitle(movieTitle);
    }
}

const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', handleSearch);

function displayMovieList(movies) {
    const movieDataElement = document.getElementById('movieData');
    movieDataElement.innerHTML = '';

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.innerHTML = `
        <div class="movie-content">
            <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder-image.jpg'}" alt="${movie.Title} Poster">
            <div class="movie-details">
                <div class="movie-header">
                    <h2 class="movie-title">${movie.Title}</h2>
                    <div class="rating">
                        <i class="fas fa-star yellow-star"></i>
                        <span class="white-text">${movie.imdbRating || 'N/A'}</span>
                    </div>
                </div>
                <div class="movie-info">
                    <p class="white-text"> <strong> Duration: </strong> ${movie.Runtime}</p>
                    <p class="white-text"> <strong> Genre: </strong>${movie.Genre}</p>
                    <p class="white-text"> <strong> Release date: </strong> ${movie.Released}</p>
                    <a href="#" class="add-to-watchlist ${isInWatchlist(movie) ? 'yellow-text' : 'white-text'}">
                        <i class="fas fa-plus"></i> ${isInWatchlist(movie) ? 'Added to Watchlist' : 'Watchlist'}
                    </a>
                </div>
                <p class="description desc-text">${movie.Plot ? movie.Plot : 'No description available.'}</p>
            </div>
        </div>
        `;

        const watchlistButton = movieElement.querySelector('.add-to-watchlist');
        watchlistButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default link behavior
            addToWatchlist(movie);

            if (isInWatchlist(movie)) {
                watchlistButton.classList.remove('white-text');
                watchlistButton.classList.add('yellow-text');
                watchlistButton.innerHTML = '<i class="fas fa-plus"></i> Added to Watchlist'; // Update the text
            } else {
                watchlistButton.classList.remove('yellow-text');
                watchlistButton.classList.add('white-text');
                watchlistButton.innerHTML = '<i class="fas fa-plus"></i> Watchlist'; // Reset the text
            }

            // Store the updated watchlist data in local storage
            setWatchlist(getWatchlist());
        });


        movieDataElement.appendChild(movieElement);
    });

    toggleWrapperIcon();
}


// Function to reset the page
function resetPage() {
    location.reload();
}

// Add an event listener to the h1 element in the header
const headerTitle = document.querySelector('header h1');
headerTitle.addEventListener('click', resetPage);

function clearSearchInput() {
    const searchInput = document.getElementById("search-bar");
    searchInput.value = "";
    const clearButton = document.getElementById('clear-button');
    clearButton.style.display = 'none'; // Hide the clear button
}

// Initial check when the page loads
toggleWrapperIcon();

const observer = new MutationObserver(() => {
    toggleWrapperIcon();
});
observer.observe(movieDataContainer, { childList: true });

const searchInput = document.getElementById('search-bar');
searchInput.addEventListener('keydown', handleSearchInputChange);

function handleSearchInputChange(event) {
    const clearButton = document.getElementById('clear-button');
    clearButton.style.display = event.target.value ? 'block' : 'none';

    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission behavior
        handleSearch(event);
    }
}

function addToWatchlist(movie) {
    let watchlist = getWatchlist();
    const existingIndex = watchlist.findIndex(item => item.imdbID === movie.imdbID);

    if (existingIndex !== -1) {
        watchlist.splice(existingIndex, 1);
    } else {
        watchlist.push(movie);
    }

    setWatchlist(watchlist);
}


// Function to get the watchlist from local storage
function getWatchlist() {
    const watchlistJSON = localStorage.getItem('watchlist');
    return watchlistJSON ? JSON.parse(watchlistJSON) : [];
}

// Function to set the watchlist in local storage
function setWatchlist(watchlist) {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

// Function to check if a movie is in the watchlist
function isInWatchlist(movie) {
    const watchlist = getWatchlist();
    return watchlist.some(item => item.imdbID === movie.imdbID);
}
