import { useEffect } from "react";
import { useState } from "react";
import "./map.css";

const API = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MapApi = () => {
	const [map, setMap] = useState("");
	const [name, setName] = useState("");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");
	useEffect(() => {
		// Initialize and add the map
		((g) => {
			let h,
				a,
				k,
				p = "The Google Maps JavaScript API",
				c = "google",
				l = "importLibrary",
				q = "__ib__",
				m = document,
				b = window;
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
			// The location of Uluru
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(async (position) => {
					const pos = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};
					// Request needed libraries.
					//@ts-ignore
					const { Map } = await google.maps.importLibrary("maps");
					const { AdvancedMarkerElement } =
						await google.maps.importLibrary("marker");

					// The map starts at Current location

					setMap(
						new Map(document.getElementById("map-container"), {
							zoom: 10,
							center: pos,
							mapId: "app",
						}),
					);

					// The marker, positioned at actual location
					new AdvancedMarkerElement({
						map: map,
						position: pos,
						title: "Local",
					});
				});
			} else {
				// Browser doesn't support Geolocation
				alert("Browser doesn't support Geolocation!!!");
			}
		}

		initMap();
	}, []);

	

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (name && latitude && longitude) {
			console.log(name, latitude, longitude);
			const pos = {
				lat: Number.parseFloat(latitude),
				lng: Number.parseFloat(longitude),
			};
			const { AdvancedMarkerElement } =
				await google.maps.importLibrary("marker");
			new AdvancedMarkerElement({
				map: map,
				position: pos,
				title: name,
			});
		} else {
			alert("All inputs must be filled");
		}
	};

	return (
		<div id="general-container">
			Welcome to my map,
			<form onSubmit={handleSubmit}>
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
			<div id="map-container" />
		</div>
	);
};
export default MapApi;
