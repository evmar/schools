import DATA from "./data.js";

var map = L.map("map").setView([44.0994213, -120.6629185], 7);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  minZoom: 6,
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const numbers = L.layerGroup();
for (const s of DATA) {
  if (!s.lat) continue;
  const score = s.subjects?.english;
  if (!score) continue;

  const circle = L.circleMarker([s.lat, s.long], {
    color: "none",
    fillColor: `hsl(${score} 100% 40%)`,
    fillOpacity: 0.7,
    radius: 20,
  })
    .addTo(map)
    .bindPopup(`${s.name}: ${score}`);

  const text = L.marker([s.lat, s.long], {
    icon: L.divIcon({
      className: "circle-text",
      html: `<span>${score.toFixed(0)}</span>`,
    }),
    interactive: false,
  }).addTo(numbers);
}

map.on("zoomend", () => {
  if (map.getZoom() < 12) {
    map.removeLayer(numbers);
  } else {
    map.addLayer(numbers);
  }
});
