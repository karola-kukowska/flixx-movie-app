//Login to imdb to get a free api key

const global = {
	currentPage: window.location.pathname,
	url: "https://api.themoviedb.org/3",
	api_key: "8ae2fe3b2a39f679faa2a8870f04f65b",
	img_url: "https://image.tmdb.org/t/p",
	search: {
		search_term: "",
		type: "",
		page: 1,
		total_pages: 1,
		total_results: 0,
	},
};

// Fetch data from TMDB API
async function fetchAPIData(endpoint, query = "") {
	showSpinner(true);
	const response = await fetch(
		`${global.url}${endpoint}?api_key=${global.api_key}${query}`
	);
	const data = await response.json();
	console.log(data);
	showSpinner(false);
	return data;
}

// Make Request To Search
async function searchAPIData() {
	showSpinner(true);
	const response = await fetch(
		`${global.url}/search/${global.search.type}?api_key=${global.api_key}&query=${global.search.search_term}&page=${global.search.page}`
	);
	const data = await response.json();
	showSpinner(false);
	return data;
}

// Get 20 popular movies
async function getPopularMovies() {
	let movieData = JSON.parse(sessionStorage.getItem("movies_popular") || "[]");

	if (!movieData.length) {
		const { results } = await fetchAPIData("/movie/popular", "&page=1");
		movieData = results;
		sessionStorage.setItem("movies_popular", JSON.stringify(movieData));
	}

	movieData.forEach((item) => {
		const el = createCard(item, "movie");
		const list = document.getElementById("popular-movies");
		list.appendChild(el);
	});
}

// Get 20 popular TV shows
async function getPopularTV() {
	let tvData = JSON.parse(sessionStorage.getItem("shows_popular") || "[]");

	if (!tvData.length) {
		const { results } = await fetchAPIData("/tv/popular", "&page=1");
		tvData = results;
		sessionStorage.setItem("shows_popular", JSON.stringify(tvData));
	}

	tvData.forEach((item) => {
		const el = createCard(item, "tv");
		const list = document.getElementById("popular-shows");
		list.appendChild(el);
	});
}

// Get paginated search results
async function getSearchResults() {
	const urlParams = new URLSearchParams(window.location.search);
	global.search.type = urlParams.get("type");
	global.search.search_term = urlParams.get("search-term");
	let list = [];

	if (!!global.search.search_term) {
		const { results, total_pages, page, total_results } = await searchAPIData();
		global.search.page = page;
		global.search.total_pages = total_pages;
		global.search.total_results = total_results;

		if (!results.length) {
			showAlert("No results found");
		} else {
			displaySearchResults(results);
		}
	} else {
		showAlert("Please enter a search term");
		global.search.page = 1;
		global.search.total_pages = 1;
		global.search.total_results = 0;
	}
}
//Display search results to DOM
function displaySearchResults(list) {
	//clear prev results
	document.querySelector("#search-results").innerHTML = "";
	document.querySelector("#search-results-heading").innerHTML = "";
	document.querySelector("#pagination").innerHTML = "";

	//display results as cards in DOM
	list.forEach((item) => {
		const el = createCard(item, global.search.type);
		const div = document.getElementById("search-results");
		div.appendChild(el);
	});

	// display search results in heading
	document.querySelector("#search-results-heading").innerHTML = `
			<h2>${list.length} of ${global.search.total_results} results for ${global.search.search_term}</h2>`;

	displayPagination();
}

//Display pagination on search page
function displayPagination() {
	const div = document.createElement("div");
	div.classList.add("pagination");
	div.innerHTML = `
			<button class="btn btn-primary" id="prev">Prev</button>
			<button class="btn btn-primary" id="next">Next</button>
			<div class="page-counter">Page ${global.search.page} of ${global.search.total_pages}</div>
			`;
	document.getElementById("pagination").appendChild(div);

	//disable prev button if on first page
	document
		.getElementById("prev")
		.toggleAttribute("disabled", global.search.page === 1);

	//disable next btn if on the last page
	document
		.getElementById("next")
		.toggleAttribute(
			"disabled",
			global.search.page === global.search.total_pages
		);

	//event listeners
	document.getElementById("next").addEventListener("click", async () => {
		global.search.page++;
		const { results } = await searchAPIData();
		displaySearchResults(results);
	});

	document.getElementById("prev").addEventListener("click", async () => {
		global.search.page--;
		const { results } = await searchAPIData();
		displaySearchResults(results);
	});
}

// Display Slider Movies
async function displaySlider() {
	let nowPlaying = JSON.parse(sessionStorage.getItem("now_playing") || "[]");

	if (!nowPlaying.length) {
		const { results } = await fetchAPIData("/movie/now_playing");
		//console.log(results);
		nowPlaying = results;
		sessionStorage.setItem("now_playing", JSON.stringify(nowPlaying));
	}

	nowPlaying.forEach((movie) => {
		const div = document.createElement("div");
		div.classList.add("swiper-slide");

		div.innerHTML = `
      <a href="movie-details.html?id=${movie.id}">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${
			movie.title
		}" />
      </a>
      <h4 class="swiper-rating">
        <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(
					1
				)} / 10
      </h4>
    `;

		document.querySelector(".swiper-wrapper").appendChild(div);

		initSwiper();
	});
}

function initSwiper() {
	const swiper = new Swiper(".swiper", {
		slidesPerView: 1,
		spaceBetween: 50,
		freeMode: true,
		loop: true,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		breakpoints: {
			500: {
				slidesPerView: 3,
			},
			700: {
				slidesPerView: 4,
			},
			1200: {
				slidesPerView: 6,
			},
		},
	});
}

//Get movie details
async function getMovieDetails() {
	showSpinner(true);
	//get id from page adress
	const movieID = window.location.search.split("=")[1];

	//get data
	const res = await fetch(
		global.url + "/movie/" + movieID + `?api_key=${global.api_key}&page=1&`
	);
	const data = await res.json();
	//console.log(data);

	//display details to DOM
	const div = document.querySelector("#movie-details");
	div.innerHTML = `
		<div class="details-top">
			<div>
				<img
                src=
                    ${
											data.poster_path
												? `${global.img_url}/w500/${data.poster_path}`
												: "images/no-image.jpg"
										}
					class="card-img-top"
					alt="${data.title}"
				/>
			</div>
			<div>
				<h2>${data.title}</h2>
				<p>
					<i class="fas fa-star text-primary"></i>
					${data.vote_average.toFixed(1)} / 10
				</p>
				<p class="text-muted">Release Date: ${data.release_date}</p>
				<p>
					${data.overview}
				</p>
				<h5>Genres</h5>
				<ul class="list-group">
                ${data.genres
									.map((item) => `<li>${item.name}</li>`)
									.join("")}</ul>
				<a href="${data.homepage}" target="_blank" class="btn">Visit Movie Homepage</a>
			</div>
		</div>
		<div class="details-bottom">
			<h2>Movie Info</h2>
			<ul>
				<li><span class="text-secondary">Budget:</span> $${numberWithCommas(
					data.budget
				)}</li>
				<li><span class="text-secondary">Revenue:</span> $${numberWithCommas(
					data.revenue
				)}</li>
				<li><span class="text-secondary">Runtime:</span> ${data.runtime} minutes</li>
				<li><span class="text-secondary">Status:</span> ${data.status}</li>
			</ul>
			<h4>Production Companies</h4>
			<div class="list-group">${data.production_companies
				.map((item) => item.name)
				.join(", ")}</div>
        </div>
    `;
	showBgImage("movie", data.backdrop_path);
	showSpinner(false);
}

async function getTVdetails() {
	showSpinner(true);
	//get id from page adress
	const showID = window.location.search.split("=")[1];

	//get data
	const res = await fetch(
		global.url + "/tv/" + showID + `?api_key=${global.api_key}&page=1&`
	);
	const data = await res.json();
	//console.log(data);

	//display details to DOM
	const div = document.querySelector("#show-details");
	div.innerHTML = `
        <div class="details-top">
			<div>
				<img
	           src=
                    ${
											data.poster_path
												? `${global.img_url}/w500/${data.poster_path}`
												: "images/no-image.jpg"
										}
					class="card-img-top"
					alt="${data.name}"
				/>
			</div>
			<div>
				<h2>${data.name}</h2>
				<p>
					<i class="fas fa-star text-primary"></i>
					${data.vote_average.toFixed(1)} / 10
				</p>
				<p class="text-muted">First Aired: ${data.first_air_date}</p>
				<p>
					${data.overview}
				</p>
				<h5>Genres</h5>
				<ul class="list-group">
					${data.genres.map((item) => `<li>${item.name}</li>`).join("")}</ul>
				</ul>
				<a href="${data.homepage}" target="_blank" class="btn">Visit Show Homepage</a>
			</div>
		</div>
		<div class="details-bottom">
			<h2>Show Info</h2>
			<ul>
				<li><span class="text-secondary">Number Of Episodes: </span> ${
					data.number_of_episodes
				}</li>
				<li>
					<span class="text-secondary">Last Episode To Air: </span> ${
						data.last_episode_to_air.name
					}
				</li>
				<li><span class="text-secondary">Status: </span>${data.status}</li>
			</ul>
			<h4>Production Companies</h4>
			<div class="list-group">${data.production_companies
				.map((item) => item.name)
				.join(", ")}</div>
		</div>
        `;
	showBgImage("show", data.backdrop_path);
	showSpinner(false);
}

//Create card of type "movie" or "tv"
//needs to be appended to DOM
function createCard(result, type) {
	const div = document.createElement("div");
	div.classList.add("card");

	//link
	const link = document.createElement("a");
	link.setAttribute("href", `${type}-details.html?id=${result.id}`);
	const img = document.createElement("img");
	img.setAttribute(
		"src",
		result.poster_path
			? `${global.img_url}/w500/${result.poster_path}`
			: "../images/no-image.jpg"
	);
	img.setAttribute("alt", result.title);
	img.className = "card-img-top";
	link.appendChild(img);
	div.appendChild(link);

	//card
	const cardBody = document.createElement("div");
	cardBody.className = "card-cardBody";
	const header = document.createElement("h5");
	header.className = "card-title";
	const p = document.createElement("p");
	p.className = "card-text";
	const small = document.createElement("small");
	small.className = "text-muted";

	if (type === "movie") {
		header.appendChild(document.createTextNode(result.title));
		small.innerText = `Release: ${result["release_date"]}`;
	} else {
		header.appendChild(document.createTextNode(result.name));
		small.innerText = `Aired: ${result.first_air_date}`;
	}

	p.appendChild(small);
	cardBody.appendChild(header);
	cardBody.appendChild(p);
	div.appendChild(cardBody);

	return div;
}

//Show spinner while loading items
function showSpinner(show = true) {
	document.querySelector(".spinner").classList.toggle("show", show);
}

// Show Alert
function showAlert(message, className = "error") {
	const alertEl = document.createElement("div");
	alertEl.classList.add("alert", className);
	alertEl.appendChild(document.createTextNode(message));
	document.querySelector("#alert").appendChild(alertEl);

	setTimeout(() => alertEl.remove(), 5000);
}

//Add backgroud image to show / movie details page
function showBgImage(type, path) {
	const div = document.createElement("div");
	div.style.backgroundImage = `url(${global.img_url}/original${path})`;

	div.className = "overlay";

	if (type === "movie") {
		document.querySelector("#movie-details").appendChild(div);
	} else {
		document.querySelector("#show-details").appendChild(div);
	}
}

//Highlight active link in navbar
function highlightActive() {
	const links = document.querySelectorAll(".nav-link");
	links.forEach((link) => {
		link.classList.toggle(
			"active",
			link.getAttribute("href") === global.currentPage
		);
	});
}

//Add commas to format large numbers
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//runs on every page
function init() {
	//Router
	switch (global.currentPage) {
		case "/":
		case "/index.html":
			getPopularMovies();
			displaySlider();
			break;
		case "/shows.html":
			getPopularTV();
			break;
		case "/movie-details.html":
			getMovieDetails();
			break;
		case "/tv-details.html":
			getTVdetails();
			break;
		case "/search.html":
			getSearchResults();
			break;
	}
	highlightActive();
}

document.addEventListener("DOMContentLoaded", init);
