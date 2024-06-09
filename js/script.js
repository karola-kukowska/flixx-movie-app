import { TMBD_API_TOKEN as token } from "../.auth/vars.js";

const url = "https://api.themoviedb.org/3";
const global = {
	currentPage: window.location.pathname,
};

//Highlight active link
function highlightActive() {
	const links = document.querySelectorAll(".nav-link");
	links.forEach((link) => {
		link.classList.toggle(
			"active",
			link.getAttribute("href") === global.currentPage
		);
	});
}

// Get 20 popular movies
async function getPopularMovies() {
	showSpinner(true);
	let movieData = JSON.parse(sessionStorage.getItem("movies_popular")) ?? [];

	if (!movieData.length) {
		const res = await fetch(
			url + "/movie/popular" + `?api_key=${token}&page=1&`
		);
		const data = await res.json();
		movieData = data.results;
		sessionStorage.setItem("movies_popular", JSON.stringify(movieData));
	}

	movieData.forEach((item) => {
		addCardToDOM(item);
	});

	showSpinner(false);
}

// Get 20 popular TV shows
async function getPopularTV() {
	showSpinner(true);
	let tvData = JSON.parse(sessionStorage.getItem("shows_popular")) ?? [];

	if (!tvData.length) {
		const res = await fetch(url + "/tv/popular" + `?api_key=${token}&page=1&`);
		const data = await res.json();
		tvData = data.results;
		sessionStorage.setItem("shows_popular", JSON.stringify(tvData));
	}

	tvData.forEach((item) => {
		addTVCardToDOM(item);
	});

	showSpinner(false);
}

//Create movie/show div box
function addCardToDOM(movie) {
	const div = document.createElement("div");
	div.classList.add("card");

	//link
	const link = document.createElement("a");
	link.setAttribute("href", "movie-details.html?id=" + movie.id);
	const img = document.createElement("img");
	img.setAttribute(
		"src",
		movie.poster_path
			? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
			: "../images/no-image.jpg"
	);
	img.setAttribute("alt", movie.title);
	img.className = "card-img-top";
	link.appendChild(img);
	div.appendChild(link);

	//card
	const cardBody = document.createElement("div");
	cardBody.className = "card-cardBody";
	const header = document.createElement("h5");
	header.className = "card-title";
	header.appendChild(document.createTextNode(movie.title));
	cardBody.appendChild(header);
	const p = document.createElement("p");
	p.className = "card-text";
	const small = document.createElement("small");
	small.className = "text-muted";
	small.innerText = `Release: ${movie["release_date"]}`;
	p.appendChild(small);
	cardBody.appendChild(p);
	div.appendChild(cardBody);

	//append to DOM
	const list = document.getElementById("popular-movies");
	list.appendChild(div);
}

//Create show card
function addTVCardToDOM(show) {
	const div = document.createElement("div");
	div.classList.add("card");
	div.innerHTML = `
    	<a 
        href=${"/tv-details.html?id=" + show.id}>
    		<img
    			src=${
						show.poster_path
							? `https://image.tmdb.org/t/p/w500/${show.poster_path}`
							: "images/no-image.jpg"
					}
                    
    			class="card-img-top"
    			alt=${show.name}
    		/>
    	</a>
    	<div class="card-body">
    		<h5 class="card-title">${show.name}</h5>
    		<p class="card-text">
    			<small class="text-muted">Aired: ${show.first_air_date}</small>
    		</p>
    	</div>
        `;

	//append to DOM
	const list = document.getElementById("popular-shows");
	list.appendChild(div);
}

//Show spinner while loading items
function showSpinner(show = true) {
	document.querySelector(".spinner").classList.toggle("show", show);
}

//Get movie details
async function getMovieDetails() {
	showSpinner(true);
	//get id from page adress
	const movieID = window.location.search.split("=")[1];

	//get data
	const res = await fetch(
		url + "/movie/" + movieID + `?api_key=${token}&page=1&`
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
												? `https://image.tmdb.org/t/p/w500/${data.poster_path}`
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
	const res = await fetch(url + "/tv/" + showID + `?api_key=${token}&page=1&`);
	const data = await res.json();
	console.log(data);

	//display details to DOM
	const div = document.querySelector("#show-details");
	div.innerHTML = `
        <div class="details-top">
			<div>
				<img
	           src=
                    ${
											data.poster_path
												? `https://image.tmdb.org/t/p/w500/${data.poster_path}`
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

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showBgImage(type, path) {
	const div = document.createElement("div");
	div.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${path})`;

	div.className = "overlay";

	if (type === "movie") {
		document.querySelector("#movie-details").appendChild(div);
	} else {
		document.querySelector("#show-details").appendChild(div);
	}
}

//runs on every page
function init() {
	//Router
	switch (global.currentPage) {
		case "/":
		case "/index.html":
			getPopularMovies();
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
			console.log("movie det");
			break;
	}
	highlightActive();
}

document.addEventListener("DOMContentLoaded", init);
