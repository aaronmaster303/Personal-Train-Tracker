document.addEventListener("DOMContentLoaded", function () {
	const stopsList = document.getElementById("stopsList");
	const message = document.getElementById("message");
	const alertsMessage = document.getElementById("alertsMessage");
	const directionButtons = document.querySelectorAll(".direction-button");
	const lineSelect = document.getElementById("lineSelect");
	const busSlider = document.getElementById("busSlider");
	const alertButton = document.getElementById("alertButton");
	const alertsList = document.getElementById("alertsList");
	alertButton.onclick = toggleAlerts;

	let stops = [];
	let alerts = [];
	let direction = parseInt(getCookie("direction") || "1"); // Default direction is Inbound
	let selectedLine = getCookie("selectedLine") || "Green-E"; // Get from cookie or default to "Green-E"
	let selectedBus = getCookie("selectedBus") || "39";
	let busChecked = stringToBoolean(getCookie("busChecked"));
	let selected = busChecked ? selectedBus : selectedLine;
	busSlider.checked = busChecked;

	const SERVER_BASE_URL =
		"https://simple-train-tracker-app-server-production.up.railway.app";

	function stringToBoolean(str) {
		return str.toLowerCase() === "true";
	}

	const lineColors = {
		Red: { primary: "#FF0000", lighter: "#ffdfdf" },
		Blue: { primary: "#0000FF", lighter: "#CCCCFF" },
		Orange: { primary: "#ee9b00", lighter: "#fff6d9" },
		"Green-B": { primary: "#008000", lighter: "#dcffdc" },
		"Green-C": { primary: "#008000", lighter: "#dcffdc" },
		"Green-D": { primary: "#008000", lighter: "#dcffdc" },
		"Green-E": { primary: "#008000", lighter: "#dcffdc" },
	};

	const locationStatus = {
		IN_TRANSIT_TO: "In transit to",
		STOPPED_AT: "Stopped at",
		INCOMING_AT: "Incoming at",
	};

	const alertEffects = {
		STATION_ISSUE: "Station Issue",
		SHUTTLE: "Shuttle",
		SUSPENSION: "Suspension",
		ELEVATOR_CLOSURE: "Elevator Closure",
		ESCALATOR_CLOSURE: "Escalator Closure",
		PARKING_ISSUE: "Parking Issue",
		BIKE_ISSUE: "Bike Issue",
		DELAY: "Delay",
	};

	const alertBadgeColors = {
		ONGOING: "#ffd700",
		UPCOMING: "#CECECE",
		NEW: "#DD93F1",
	};

	function setCookie(name, value, days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		const expires = "expires=" + date.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	}

	function getCookie(name) {
		const cname = name + "=";
		const decodedCookie = decodeURIComponent(document.cookie);
		const ca = decodedCookie.split(";");
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i].trim();
			if (c.indexOf(cname) == 0) {
				return c.substring(cname.length, c.length);
			}
		}
		return "";
	}

	async function fetchAlerts() {
		const url = `${SERVER_BASE_URL}/alerts?route=${selected}`;
		try {
			const response = await fetch(url);
			const data = await response.json();
			alerts = data.data;
			displayAlertButton();
			populateAlertsList();

			alertsMessage.textContent = "Displaying all alerts.";
			alertsMessage.style.color = "green";
		} catch (e) {
			alertsMessage.textContent = "Error displaying alerts.";
			alertsMessage.style.color = "red";
			console.log(e);
		}
	}

	function displayAlertButton() {
		if (alerts.length > 0) {
			alertButton.style.display = "block";
		} else {
			alertButton.style.display = "none";
			resetAlertDisplay();
		}
	}

	function toggleDescription(headerElement) {
		const description = headerElement.querySelector(
			".styled-list-description",
		);
		description.classList.toggle("show");
		const arrow = headerElement.querySelector(".styled-list-arrow");
		arrow.classList.toggle("rotate");
	}

	function populateAlertsList() {
		alertsList.replaceChildren();
		alerts.forEach((alert) => {
			const listItem = document.createElement("li");
			listItem.id = alert.id;
			listItem.classList.add("styled-list-item");

			const header = document.createElement("div");
			header.classList.add("styled-list-header");
			header.onclick = () => toggleDescription(header);

			const title = document.createElement("span");
			title.classList.add("styled-list-title");
			const alertEffectText = alertEffects[alert.attributes.effect];
			title.textContent = alertEffectText
				? alertEffectText
				: alert.attributes.effect;

			const badge = document.createElement("span");
			badge.classList.add("styled-list-badge");
			badge.style.backgroundColor =
				alertBadgeColors[alert.attributes.lifecycle];
			badge.textContent = alert.attributes.lifecycle;

			const arrow = document.createElement("span");
			arrow.classList.add("styled-list-arrow");
			arrow.textContent = "▼";

			const description = document.createElement("div");
			description.classList.add("styled-list-description");
			description.textContent = alert.attributes.header;

			header.appendChild(title);
			header.appendChild(badge);
			header.appendChild(arrow);
			header.appendChild(description);

			listItem.appendChild(header);

			alertsList.appendChild(listItem);
		});
	}

	function resetAlertDisplay() {
		alertButton.textContent = "⚠️";
		stopsList.style.display = "block";
		alertsList.style.display = "none";
		message.style.display = "block";
		alertsMessage.style.display = "none";
	}

	function toggleAlerts() {
		if (stopsList.style.display === "block") {
			alertButton.textContent = "❌";
			stopsList.style.display = "none";
			alertsList.style.display = "block";
			message.style.display = "none";
			alertsMessage.style.display = "block";
		} else {
			alertButton.textContent = "⚠️";
			stopsList.style.display = "block";
			alertsList.style.display = "none";
			message.style.display = "block";
			alertsMessage.style.display = "none";
		}
	}

	async function fetchSubwayLines() {
		busChecked = stringToBoolean(getCookie("busChecked"));

		const url = `${SERVER_BASE_URL}/routes?filter[type]=${
			busChecked ? "3" : "0,1"
		}`;

		selectedLine = getCookie("selectedLine") || "Green-E";
		selectedBus = getCookie("selectedBus") || "39";
		selected = busChecked ? selectedBus : selectedLine;

		try {
			const response = await fetch(url);
			const data = await response.json();
			const allLines = data.data;
			const lines = allLines.filter((line) => line.id != "Mattapan");
			lines.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

			lineSelect.innerHTML = "";

			lines.forEach((line) => {
				const option = document.createElement("option");
				option.textContent = line.id;
				if (line.id === selected) {
					option.selected = true;
				}
				lineSelect.appendChild(option);
			});
			updateLineColors(selected);
		} catch (error) {
			message.textContent = "Error fetching subway lines.";
			message.style.color = "red";
			console.error("Error fetching subway lines:", error);
		}
	}

	async function fetchStops() {
		const url = `${SERVER_BASE_URL}/stops?filter[route]=${selected}&filter[direction_id]=1`;
		try {
			const response = await fetch(url);
			const data = await response.json();
			stops = data.data.map((stop) => ({
				id: stop.id,
				name: stop.attributes.name,
			}));
			updateStopsList([]);
		} catch (error) {
			message.textContent = "Error fetching stops data.";
			message.style.color = "red";
			console.error("Error fetching stops data:", error);
		}
	}

	async function fetchStopsBus() {
		stopsList.innerHTML = "";
		const url = `${SERVER_BASE_URL}/stops/bus?direction_id=${direction}&route=${selected}`;
		try {
			const response = await fetch(url);
			const stop_names_list = await response.json();
			stops = stop_names_list;
			updateStopsList([]);
		} catch (error) {
			message.textContent = "Error fetching bus stops data.";
			message.style.color = "red";
			console.error("Error fetching bus stops data:", error);
		}
	}

	async function fetchStopNameFromId(stopId) {
		const url = `${SERVER_BASE_URL}/stops/${stopId}`;
		try {
			const response = await fetch(url);
			const data = await response.json();
			return data.data.attributes.name;
		} catch (error) {
			console.error("Error fetching stop name:", error);
		}
	}

	async function getStopNameFromId(stopId) {
		if (busChecked) {
			return stops.find((stop) => stop.id === stopId).name;
		}

		const trainStopName = await fetchStopNameFromId(stopId);
		return trainStopName;
	}

	async function fetchTrainLocations() {
		const url = `${SERVER_BASE_URL}/vehicles?filter[route]=${selected}&filter[direction_id]=${direction}`;
		try {
			const response = await fetch(url);
			const data = await response.json();
			const vehicles = data.data;
			if (vehicles.length > 0) {
				const vehicleLocations = await Promise.all(
					vehicles.map(async (vehicle) => {
						const stopId = vehicle.relationships.stop.data.id;
						const stopName = await getStopNameFromId(stopId);
						const status = vehicle.attributes.current_status;
						return { stopId, stopName, status };
					}),
				);
				updateStopsList(vehicleLocations);
				message.textContent = "Displaying all train locations.";
				message.style.color = "green";
			} else {
				message.textContent = "No trains currently available.";
				message.style.color = "red";
			}
		} catch (error) {
			message.textContent = "Error fetching train data.";
			message.style.color = "red";
			console.error("Error fetching train data:", error);
		}
	}

	function updateStopsList(vehicleLocations) {
		stops.forEach((stop) => {
			let li = document.querySelector(`#stop-${stop.id}`);
			if (!li) {
				li = document.createElement("li");
				li.id = `stop-${stop.id}`;
				li.textContent = stop.name;
				stopsList.appendChild(li);
			}

			const vehicleAtStop = vehicleLocations.find(
				(location) => location.stopName === stop.name,
			);

			if (vehicleAtStop) {
				if (!li.classList.contains("current-location")) {
					li.classList.add("current-location");
					const status = vehicleAtStop.status;
					const statusSpan = document.createElement("span");
					statusSpan.textContent = `   (${locationStatus[status]})`;
					statusSpan.classList.add("status-span");
					li.appendChild(statusSpan);
				}
			} else {
				if (li.classList.contains("current-location")) {
					li.classList.remove("current-location");
					const statusSpan = li.querySelector(".status-span");
					if (statusSpan) li.removeChild(statusSpan);
				}
			}
		});
	}

	function handleDirectionButtonClick(event) {
		if (busChecked) stopsList.innerHTML = "";

		directionButtons.forEach((button) =>
			button.classList.remove("selected"),
		);
		event.target.classList.add("selected");
		direction = parseInt(event.target.dataset.direction);
		setCookie("direction", direction, 7);

		if (busChecked) {
			fetchStopsBus().then(() => {
				fetchTrainLocations();
			});
		} else {
			fetchStops().then(() => {
				fetchTrainLocations();
			});
		}
	}

	function handleLineSelectChange() {
		resetAlertDisplay();
		stopsList.innerHTML = "";
		selected = lineSelect.value;

		busChecked
			? setCookie("selectedBus", selected, 7)
			: setCookie("selectedLine", selected, 7);

		updateLineColors(selected);
		fetchAlerts();

		if (busChecked) {
			fetchStopsBus().then(() => {
				setDirectionButton();
				fetchTrainLocations();
			});
		} else {
			fetchStops().then(() => {
				setDirectionButton();
				fetchTrainLocations();
			});
		}
	}

	function updateLineColors(line) {
		const color = lineColors[line] || {
			primary: "#000000",
			lighter: "#f0f0f0",
		};
		document.documentElement.style.setProperty(
			"--line-color",
			color.primary,
		);
		document.documentElement.style.setProperty(
			"--line-color-lighter",
			color.lighter,
		);
	}

	directionButtons.forEach((button) => {
		button.addEventListener("click", handleDirectionButtonClick);
	});

	function setDirectionButton() {
		directionButtons.forEach((button) => {
			button.classList.remove("selected");

			if (parseInt(button.dataset.direction) === direction)
				button.classList.add("selected");

			if (parseInt(button.dataset.direction) === 0)
				button.textContent = "↑ " + stops[0].name;
			else button.textContent = "↓ " + stops[stops.length - 1].name;
		});
	}

	function handleBusSliderChange(event) {
		resetAlertDisplay();
		stopsList.innerHTML = "";

		setCookie("busChecked", event.target.checked, 7);
		stopsList.innerHTML = "";
		fetchSubwayLines().then(() => {
			handleLineSelectChange();
		});
	}

	lineSelect.addEventListener("change", handleLineSelectChange);
	busSlider.addEventListener("change", handleBusSliderChange);

	if (busChecked) {
		fetchSubwayLines().then(() => {
			fetchStopsBus().then(() => {
				fetchAlerts();
				setDirectionButton();
				fetchTrainLocations();
				setInterval(fetchTrainLocations, 1000);
			});
		});
	} else {
		fetchSubwayLines().then(() => {
			fetchStops().then(() => {
				fetchAlerts();
				setDirectionButton();
				fetchTrainLocations();
				setInterval(fetchTrainLocations, 1000);
			});
		});
	}
});
