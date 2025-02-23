import { useEffect } from "react";
import { useState } from "react";
import useDocumentTitle from "../Hooks/useDocumentTitle.jsx";
import useQueryParameters from "../Hooks/useQueryParameters.jsx";
import useClipboard from "../Hooks/useClipboard.jsx";
import useLocalStorage from "../Hooks/useLocalStorage.jsx";
import "./map.css";

const API = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const BASE_URL = "http://localhost:5173/";

const MapApi = () => {
	const {params, setQueryParameters } = useQueryParameters();
	const {copied, copyToClipboard} = useClipboard();
	const [storedLocation, setStoredLocation] = useLocalStorage("mapLocation",{
		lat: 9.8990415,
		lng: -84.1556396
	});
	const [map, setMap] = useState();
	const [name, setName] = useState("");
	const [nextId, setNextId] = useState(0);
	const [pageTitle, setPageTitle] = useState("My map!!!");
	const [latitude, setLatitude] = useState(Number.parseFloat(params.get("latitude")) || storedLocation.lat);
	const [longitude, setLongitude] = useState(Number.parseFloat(params.get("longitude")) || storedLocation.lng);
	const [infoWindow, setInfoWindow] = useState(null);
	const [isLoading, setLoading] = useState(false);
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

		async function initMap() {
			// The location of Costa Rica Map
			// Request needed libraries.
			//@ts-ignore
			const { Map } = await google.maps.importLibrary("maps");

			// The map starts at Costa Rica
			const newMap = new Map(document.getElementById("map-container"), {
				zoom: 8,
				center: {lat: latitude, lng: longitude,},
				mapId: "app",
			})
			const newInfoWindow = new window.google.maps.InfoWindow();
			const placeName = await getLocationName(latitude, longitude);
			setPageTitle(placeName);
			setMap(newMap);
			setInfoWindow(newInfoWindow);
		}

		initMap();
	}, []);

	useEffect(() =>  {
		if (map && infoWindow) {
			const handleMapClick = (e) => {
				const clickedLat = e.latLng.lat();
				const clickedLng = e.latLng.lng();
				setLatitude(clickedLat);
				setLongitude(clickedLng);
				setStoredLocation({
					lat:clickedLat,
					lng:clickedLng
				});
				const fetchName = async () => {
					const placeName = await getLocationName(clickedLat, clickedLng);
					setPageTitle(placeName);
				}
				fetchName();
				setQueryParameters("latitude", clickedLat);
				setQueryParameters("longitude", clickedLng);
				const locationURL = `${BASE_URL}?latitude=${clickedLat}&longitude=${clickedLng}`;

				//the infowindow has diferent carateristics so we are going to divided by sections
				const contentString = `
				<div>
					<p class= "infoWindow-text">Lat ${clickedLat.toFixed(5)}, Lng: ${clickedLng.toFixed(5)}</p>
					<button id="copy-btn"> Copy to clipboard </button>
				</div>
				`;

				//shows infowindow with the coords
				infoWindow.setContent(contentString);
				infoWindow.setPosition({ lat: clickedLat, lng: clickedLng });
				infoWindow.open(map);

				//Wait for the infowindow to be rendered
				setTimeout(() => {
					const copyBtn = document.getElementById("copy-btn");
					if (copyBtn){
						copyBtn.addEventListener("click", () => copyToClipboard(locationURL));
					}
				}, 100);
			};
			map.addListener("click",handleMapClick);
			return () => {
				window.google.maps.event.clearListeners(map, "click"); //clear listeners
			};
		};
	},[map, infoWindow]);

	const getLocationName = async (lat, lng) => {
		const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API}`;
		try {
			const response = await fetch(url);
			const data = await response.json();
			if (data.results.length > 0) {
				return data.results[0].formatted_address;
			}
			return "Unknown location";
		} catch (error) {
			console.error("Error getting places name", error);
			return "Error getting places name";
		}
	};

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
				id: nextId,
				map: map,
				position: pos,
				title: name
			});
			setNextId(nextId + 1);
			setMarkers([...markers, marker]);
			const placeName = await getLocationName(latitude, longitude);
			setPageTitle(placeName);
			map.panTo(pos);
			map.setZoom(14);
		} else {
			alert("All inputs must be filled");
		}
	};

	const handleRemove = async (item) => {
		setMarkers((markers) => {
			return markers.filter((marker) => marker !== item);
		});
		item.setMap(null);
	};

	const handleClickWhereAmI = async (e) => {
		e.preventDefault();
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(async (position) => {
				setLoading(true);
				setLatitude(position.coords.latitude);
				setLongitude(position.coords.longitude)
				const pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
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
				const placeName = await getLocationName(pos.lat,pos.lng);
				
				setPageTitle(placeName);
				setLoading(false);
			});
		} else {
			// Browser doesn't support Geolocation
			alert("Browser doesn't support Geolocation!!!");
		}
	};

	useDocumentTitle(pageTitle);

	return (
		<div id="general-container">
			<title> {pageTitle} </title>
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
					step="0.0000001"
					min="-90"
					max="90"
					placeholder={"Enter latitude"}
				/>
				<input
					onChange={(e) => setLongitude(e.target.value)}
					type="number"
					step="0.0000001"
					min="-90"
					max="90"
					placeholder={"Enter your longitude"}
				/>
				<button type="submit">Click to Proceed</button>
			</form>
			<button type="button" disabled={isLoading} onClick={handleClickWhereAmI}>
				{isLoading ? "Loading..." : "Where am i?"}
			</button>
			<div id="map-list">
				<div id="map-container" />
				<div id="marker-list">
					<h2>List of markers</h2>
					{markers.length <= 0
						? "You dont have markers yet"
						: markers.map((item) => (
								<li key={item.id}>
									<span id="list-element">{item.title}</span>
									<button type="button" onClick={() => handleRemove(item)}>
										Remove
									</button>
								</li>
							))}
				</div>
			</div>
		</div>
	);
};
export default MapApi;
