mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 12, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker() // initialize a new marker
  .setLngLat(campground.geometry.coordinates) // Marker [lng, lat] coordinates
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
  )
  .addTo(map); 