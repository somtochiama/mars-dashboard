let store = Immutable.fromJS({
	user: { name: 'Student' },
	apod: '',
	rovers: ['Curiosity', 'Opportunity', 'Spirit'],
	selectedRover: '',
	roverInfo: [],
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (key, value) => {
	store = store.set(key, value);
	render(root, store);
};

const render = async (root, state) => {
	root.innerHTML = App(state);
};

const selectRover = async (event, name) => {
	console.log('running');
	updateStore('selectedRover', name);
	await getRoverData(store.toJS());
};

// create content
const App = state => {
	let { rovers, apod, roverInfo } = state.toJS();
	// console.log(rovers);
	//const apod = state.get('apod').toJS();
	//const rover = state.get('rover');
	return `
        <header></header>
        <main>
            ${Greeting(store.get('name'))}
            <section>
                ${Tabs(rovers)}
                ${DashboardUI(List, store.toJS())}
                </section>
                </main>
                <footer></footer>
                `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
	render(root, store);
});

const List = (fn, data) => {
	console.log(data);
	const listHtml = data
		.map(
			item => `<li>${fn(item)}</li>
    `,
		)
		.join('');

	return `
        <ol>${listHtml}</ol>
    `;
};

const imageHtml = image => `
    <div>
        <img src=${image.src}>
        <p>${image.date}</p>
    </div>
`;

const DashboardUI = (listComponent, data) => {
	const roverData = getRoverInfo(data);
	const images = getRoverImages(data);
	console.log(images, roverData);
	if (images.length) {
		return `
    <section>
    <h1>${roverData.name}</h2>
            <p>Launch Date: ${roverData.launch_date}   Landing Date:${
			roverData.landing_date
		}</p>
        <p>${roverData.status}</p>
            ${listComponent(item => {
							console.log(item.name);
							return `<p>${item.name}<p>`;
						}, roverData.cameras)}
                        </section>
                        <div>
                            ${listComponent(imageHtml, images)}
                        </div>
                        `;
	}
};

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = name => {
	if (name) {
		return `
            <h1>Welcome, ${name}!</h1>
        `;
	}

	return `
        <h1>Hello!</h1>
    `;
};

const Tabs = tabLinks => {
	//Check if tabLink is empty
	const tabLinkHtml = tabLinks
		.map(
			link =>
				`
            <button class="tabLink" onclick="selectRover(event, '${link}')" >${link}</button>
        `,
		)
		.join('');
	return `
        <div class="tabs">${tabLinkHtml}</div>
    `;
};
// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = apod => {
	/// If image does not already exist, or it is not from today -- request it again
	const today = new Date();
	const photodate = new Date(apod.date);
	console.log(photodate.getDate(), today.getDate());

	console.log(photodate.getDate() === today.getDate());
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
			console.log('here', data);
			updateStore('roverInfo', data.photos);
		})
		.catch(err => {
			console.log('err', err);
		});

	return;
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
