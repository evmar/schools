import DATA from "./data.js";

const map = L.map("map").setView([44.0994213, -120.6629185], 7);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  minZoom: 6,
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let curLayer;
function render(data, subject) {
  if (curLayer) {
    map.removeLayer(curLayer);
  }

  const layer = L.layerGroup();

  const circles = L.layerGroup().addTo(layer);
  const numbers = L.layerGroup();
  for (const s of data) {
    if (!s.lat) continue;
    const score = s.subjects[subject];
    if (!score) continue;

    const circle = L.circleMarker([s.lat, s.long], {
      color: "none",
      fillColor: `hsl(${score} 100% 40%)`,
      fillOpacity: 0.7,
      radius: 20,
    })
      .addTo(circles)
      .bindPopup(`${s.name}: ${score}`);

    const text = L.marker([s.lat, s.long], {
      icon: L.divIcon({
        className: "circle-text",
        html: `<span>${score.toFixed(0)}</span>`,
      }),
      interactive: false,
    }).addTo(numbers);
  }

  function zoomEnd() {
    if (map.getZoom() < 12) {
      layer.removeLayer(numbers);
    } else {
      layer.addLayer(numbers);
    }
  }
  map.on("zoomend", zoomEnd);
  layer.on("remove", () => map.off("zoomend", zoomEnd));
  zoomEnd();
  map.addLayer(layer);
  curLayer = layer;
}

render(DATA, "math");

const x = L.Control.extend({
  onAdd(map) {
    const sel = document.createElement("select");
    for (const f of ["math", "english"]) {
      const opt = document.createElement("option");
      opt.innerText = f;
      sel.appendChild(opt);
    }
    L.DomEvent.on(sel, "change", () => {
      render(DATA, sel.value);
    });
    return sel;
  },
});
new x({ position: "topright" }).addTo(map);
