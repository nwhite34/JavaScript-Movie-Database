document.addEventListener('DOMContentLoaded', () => {
    toggleWrapperIcon();
    const watchlistContainer = document.getElementById('watchlist-container');
    const watchlist = getWatchlist();
    const wrapperMoviedivIcon = document.getElementById('wrapper-moviediv-icon');

    if (watchlist.length === 0) {
        wrapperMoviedivIcon.style.display = '';
    } else {
        watchlist.forEach(movie => {
            const movieElement = createMovieElement(movie, wrapperMoviedivIcon);
            watchlistContainer.appendChild(movieElement);
            wrapperMoviedivIcon.style.display = 'none';
        });
    }
});

function createMovieElement(movie, wrapperMoviedivIcon) {
    const movieElement = document.createElement('div');
    movieElement.classList.add('watchlist-movie');
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
                    <button class="remove-button">Remove</button>
                </div>
                <p class="description desc-text">${movie.Plot ? movie.Plot : 'No description available.'}</p>
            </div>
        </div>
    `;

    const removeButton = movieElement.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
        removeMovieFromWatchlist(movie);
        movieElement.style.display = 'none';
        if (getWatchlist().length === 0) {
            wrapperMoviedivIcon.style.display = '';
        }
    });

    return movieElement;
}

function removeMovieFromWatchlist(movie) {
    const watchlist = getWatchlist();
    const updatedWatchlist = watchlist.filter(item => item.Title !== movie.Title);
    setWatchlist(updatedWatchlist);
    toggleWrapperIcon();
}

function getWatchlist() {
    const watchlistJSON = localStorage.getItem('watchlist');
    return watchlistJSON ? JSON.parse(watchlistJSON) : [];
}

function setWatchlist(watchlist) {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function toggleWrapperIcon() {
    const watchlist = getWatchlist();
    const wrapperMoviedivIcon = document.getElementById('wrapper-moviediv-icon');
    if (watchlist.length === 0) {
        wrapperMoviedivIcon.style.display = '';
    } else {
        wrapperMoviedivIcon.style.display = 'none';
    }
}
