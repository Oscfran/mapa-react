import { useEffect } from "react";
import { useState } from "react";
import "./map.css";

const API = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const nextId = 0;

const MapApi = () => {
	const [map, setMap] = useState("");
	const [name, setName] = useState("");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");
	const [markers, setMarkers] = useState([]);
	useEffect(() => {
		// Initialize and add the map
		((g) => {
			let h;
			let a;
			let k;
			const p = "The Google Maps JavaScript API";
			const c = "google";
			const l = "importLibrary";
			const q = "__ib__";
			const m = document;
			let b = window;
			b = b[c] || (b[c] = {});
			const d = b.maps || (b.maps = {}),
				r = new Set(),
				e = new URLSearchParams(),
				u = () =>
					h ||
					(h = new Promise(async (f, n) => {
						await (a = m.createElement("script"));
						e.set("libraries", [...r] + "");
						for (k in g)
							e.set(
								k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
								g[k],
							);
						e.set("callback", c + ".maps." + q);
						a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
						d[q] = f;
						a.onerror = () => (h = n(Error(p + " could not load.")));
						a.nonce = m.querySelector("script[nonce]")?.nonce || "";
						m.head.append(a);
					}));
			d[l]
				? console.warn(`${p} + " only loads once. Ignoring:"`, g)
				: (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
		})({
			key: API,
			v: "weekly",
			// Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
			// Add other bootstrap parameters as needed, using camel case.
		});

		let map;

		async function initMap() {
			// The location actual location
			const pos = {
				lat: 9.8990415,
				lng: -84.1556396,
			};
			// Request needed libraries.
			//@ts-ignore
			const { Map } = await google.maps.importLibrary("maps");

			// The map starts at Current location
			setMap(
				new Map(document.getElementById("map-container"), {
					zoom: 8,
					center: pos,
					mapId: "app",
				}),
			);
		}

		initMap();
	}, []);

	const handleSubmitSetMarker = async (e) => {
		e.preventDefault();
		if (name && latitude && longitude) {
			const pos = {
				lat: Number.parseFloat(latitude),
				lng: Number.parseFloat(longitude),
			};
			const { AdvancedMarkerElement } =
				await google.maps.importLibrary("marker");

			const marker = new AdvancedMarkerElement({
				map: map,
				position: pos,
				title: name,
			});
		} else {
			alert("All inputs must be filled");
		}
	};
	const handleClickWhereAmI = async (e) => {
		e.preventDefault();
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(async (position) => {
				const pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				map.panTo(pos);
				map.setZoom(14);
				const { AdvancedMarkerElement } =
					await google.maps.importLibrary("marker");
				new AdvancedMarkerElement({
					map: map,
					position: pos,
					title: name,
				});
			});
		} else {
			// Browser doesn't support Geolocation
			alert("Browser doesn't support Geolocation!!!");
		}
	};

	return (
		<div id="general-container">
			<title>My map!!! </title>
			Welcome to my map,
			<form onSubmit={handleSubmitSetMarker}>
				<input
					onChange={(e) => setName(e.target.value)}
					type={"text"}
					placeholder={"Enter Place Name"}
				/>
				<input
					onChange={(e) => setLatitude(e.target.value)}
					type="number"
					step="0.001"
					min="-90"
					max="90"
					placeholder={"Enter latitude"}
				/>
				<input
					onChange={(e) => setLongitude(e.target.value)}
					type="number"
					step="0.001"
					min="-90"
					max="90"
					placeholder={"Enter your longitude"}
				/>
				<button type="submit">Click to Proceed</button>
			</form>
			<button type="button" onClick={handleClickWhereAmI}>
				Where am i?
			</button>
			<div id="map-container" />
		</div>
	);
};
export default MapApi;
