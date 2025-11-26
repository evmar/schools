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
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";

    const sel = document.createElement("select");
    for (const f of ["math", "english"]) {
      const opt = document.createElement("option");
      opt.innerText = f;
      sel.appendChild(opt);
    }
    L.DomEvent.on(sel, "change", () => {
      render(DATA, sel.value);
    });
    container.appendChild(sel);

    const button = document.createElement("button");
    button.innerText = "What's this?";
    button.popoverTargetAction = "toggle";
    container.appendChild(button);

    const panel = document.createElement("div");
    panel.innerHTML = `
      <p>
        Oregon ranks 50th in US states for 4th grade reading scores.
        <a href='https://www.wweek.com/news/state/2025/11/13/christine-pitts-has-spotted-one-key-reason-oregon-kids-arent-learning-to-read/'>This article discusses why</a>.
      </p>
      <p>
        I was curious: how do the schools within Oregon compare?
        The test used for the national ranking is not available at the level of schools, but the state conducts
        its own <a href='https://www.oregon.gov/ode/educator-resources/assessment/Pages/Statewide-Assessments.aspx'>statewide assessments</a>.
      </p>
      <p>
        This map displays the results for math or English.
        The scores (shown as numbers when you zoom in) are the percentage of students scoring at the level the state deems "proficient".
        (Warning: the state website has mountains of text and data on it but what the actual numbers mean is extremely difficult to figure out!)
      </p>
      <p>
        If you're interested in more details on a particular school, the <a href='https://www.ode.state.or.us/data/ReportCard/'>at-a-glance profile site</a>
        generates nice reports &mdash; though for some reason it only shows proficiency scores for elementary/middle schools, not high schools.
      </p>
      <p>
        Disclaimer: site is a quick hack; schools I failed to geolocate are omitted.  <a href='https://github.com/evmar/schools'>Source code here</a>.
      </p>
    `;
    panel.style.backgroundColor = "white";
    panel.style.border = "1px solid #ccc";
    panel.style.padding = "0 2ex";
    panel.style.borderRadius = "5px";
    panel.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
    panel.style.fontSize = "16px";
    panel.style.maxWidth = "60ex";
    panel.popover = "auto";
    container.appendChild(panel);

    button.popoverTargetElement = panel;

    return container;
  },
});
new x({ position: "topright" }).addTo(map);
