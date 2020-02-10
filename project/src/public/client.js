let store = Immutable.fromJS({
	user: { name: 'Student' },
	apod: '',
	rovers: ['Curiosity', 'Opportunity', 'Spirit'],
	selectedRover: 'Curiosity',
	roverInfo: [],
	loading: false,
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (key, value) => {
	store = store.set(key, value);
	render(root, store.toJS());
};

const render = async (root, state) => {
	root.innerHTML = App(state);
};

const selectRover = (event, name) => {
	updateStore('selectedRover', name);
};

// create content
const App = state => {
	let { rovers, selectedRover } = state;
	return `
				<header>
				</header>
        <main>
					${Greeting(state.user.name)}
					<section>
						${Tabs(rovers, selectedRover)}
						${DashboardUI(List, state)}
					</section>
        </main>
        <footer></footer>
  `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
	render(root, store.toJS());
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = name => {
	let html = `
		<h1 class="title">Mars Dashboard</h1>
		<p class="desc">Click on any of the rovers to view recent pictures.</p>
	`;
	if (name) {
		return (
			`<h1 class="welcome">Welcome, <span class="name">${name}</span></h1>` +
			html
		);
	}
	return html;
};

const Tabs = (tabLinks, selected) => {
	//Check if tabLink is empty
	const tabLinkHtml = tabLinks
		.map(link => {
			if (link == selected) {
				return `<button class="tabLink active" onclick="selectRover(event, '${link}')" >${link}</button>`;
			}
			return `<button class="tabLink" onclick="selectRover(event, '${link}')" >${link}</button>`;
		})
		.join('');
	return `
        <div class="tabs">${tabLinkHtml}</div>
    `;
};

const imageHtml = image => `
	<img src=${image.src}>
	<p class="date"><span class="bold">Date: </span>${image.date}</p>
`;

const DashboardUI = (listComponent, data) => {
	const roverData = getRoverInfo(data);
	const images = getRoverImages(data);
	if ((!roverData || roverData.name !== data.selectedRover) && !data.loading) {
		getRoverData(data);
	}
	if (images.length) {
		return `
    <section class="rover-info">
			<h2>Details for ${roverData.name} rover camera</h2>
			<section class="rover-details">
				<p class="detail"><span class="detail-name">Launch Date:</span> ${
					roverData.launch_date
				}</p>
				<p class="detail"><span class="detail-name">Landing Date:</span> ${
					roverData.landing_date
				}</p>
				<p class="detail"><span class="detail-name">Status: </span> ${
					roverData.status
				}</p>
			</section>
			<div class="gallery">
					${listComponent(imageHtml, images)}
			</div>
		</section>
  `;
	} else {
		return '<p class="loading">Loading..</p>';
	}
};

const List = (fn, data) => {
	const listHtml = data
		.map(
			item => `<li class="image-list">${fn(item)}</li>
    `,
		)
		.join('');

	return `
        <ol>${listHtml}</ol>
    `;
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = apod => {
	/// If image does not already exist, or it is not from today -- request it again
	const today = new Date();
	const photodate = new Date(apod.date);
	console.log(photodate.getDate(), today.getDate());

	if (!apod || apod.date === today.getDate()) {
		getImageOfTheDay(store);
	}
	// check if the photo of the day is actually type video!
	if (apod.media_type === 'video') {
		return `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `;
	} else {
		return `
            <img src="${
							apod.image ? apod.image.url : ''
						}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `;
	}
};

const getRoverImages = state => {
	return state.roverInfo.map(imageData => ({
		src: imageData.img_src,
		date: imageData.earth_date,
	}));
};

const getRoverInfo = store => {
	const roverObj = store.roverInfo.find(
		imageData => imageData.rover.name === store.selectedRover,
	);
	return roverObj && roverObj.rover;
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = state => {
	let { apod } = state;

	fetch(`http://localhost:3000/apod`)
		.then(res => res.json())
		.then(apod => {
			updateStore('apod', apod);
		})
		.catch(err => console.log(err));

	return;
};

const getRoverData = async state => {
	let { selectedRover } = state;
	await fetch(`http://localhost:3000/rover?rover=${selectedRover}`)
		.then(res => res.json())
		.then(({ data }) => {
			updateStore('roverInfo', data.photos);
		})
		.catch(err => {
			console.log('err', err);
		});

	return;
};
