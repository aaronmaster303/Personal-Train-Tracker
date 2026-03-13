# Personal Train Tracker

**A real-time MBTA transit tracker for Boston trains and buses — a web-based companion to the [iOS app](https://apps.apple.com/us/app/mbta-train-bus-tracker/id6748243506), with 350+ active users.**

## Screenshots

<img width="300" alt="image" src="https://github.com/user-attachments/assets/31070148-1e16-41a0-a234-fb3bc4aff2ef" />
<img width="300" alt="image" src="https://github.com/user-attachments/assets/7b0ba3a6-8122-46dc-986c-ebaa84f07cbb" />



## Features

- Live vehicle positions updated every second across all MBTA subway and bus lines
- Stop-by-stop list showing each train's current status (`Stopped at`, `Incoming at`, `In transit to`)
- Toggle between subway and bus modes; direction picker shows terminal stop names inline
- Expandable service alerts panel with lifecycle badges (Ongoing, Upcoming, New)
- Line color theming via CSS custom properties — the entire UI updates to match the selected route
- User preferences (selected line, direction, mode) persisted across sessions via cookies

## Tech Stack

`HTML` · `CSS` · `Vanilla JavaScript` · `Google Analytics`

No framework was used by design. A frontend framework would introduce significant complexity and build tooling overhead for what is fundamentally a DOM manipulation problem — fetching data and updating a list. Vanilla JS handles this cleanly in a single file with no dependencies and no build step.

## Backend

This app is powered by a shared Express backend also used by the iOS app:
[Simple-Train-Tracker-App-Server](https://github.com/aaronmaster303/Simple-Train-Tracker-App-Server)

The server proxies MBTA V3 API requests and caches responses to reduce latency and API load.

## Related

- **iOS App:** [MBTA Train & Bus Tracker on the App Store](https://apps.apple.com/us/app/mbta-train-bus-tracker/id6748243506) — 100+ downloads, 5.0 stars
- **Mobile client repo:** [Simple-Train-Tracker-App](https://github.com/aaronmaster303/Simple-Train-Tracker-App)

## Getting Started

No build step required. Open `index.html` directly in a browser, or serve it with any static file server.

To point at a local backend instead of the deployed server, update `SERVER_BASE_URL` in `app.js`:

```js
// app.js
const SERVER_BASE_URL = 'http://localhost:3000';
```

Then start the backend server locally — see the [server repo](https://github.com/aaronmaster303/Simple-Train-Tracker-App-Server) for setup instructions.

## How It Works

On load, the app fetches the route list and stop list from the backend, then polls for vehicle positions every second. Vehicle responses include a stop ID; the app resolves each ID against the already-fetched stop list to avoid redundant network calls for buses, and falls back to individual stop lookups for subway lines where stop sets vary by direction. CSS custom properties on `:root` are updated dynamically to theme the UI per line.

## Privacy Policy

[View Privacy Policy](https://aaronmaster303.github.io/MBTA-Train-Bus-Tracker-Privacy-Policy/)

## License

MIT License
