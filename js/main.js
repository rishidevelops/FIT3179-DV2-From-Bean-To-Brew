/* ═══════════════════════════════════════════════════════
   From Bean to Brew — main.js
   FIT2179 Data Visualisation 2, Monash University 2026
   ═══════════════════════════════════════════════════════ */

/* ── GLOBAL CONFIG ── */
const CONFIG = {
  background: "transparent",
  font: "Source Serif 4, Georgia, serif",
  title: { font: "Playfair Display, serif", fontSize: 14, fontWeight: "bold",
           color: "#4A2C0A", anchor: "start", offset: 8 },
  axis: {
    labelFont: "DM Sans, sans-serif", labelFontSize: 11, labelColor: "#7A5C3A",
    titleFont: "DM Sans, sans-serif", titleFontSize: 11, titleColor: "#A07850",
    gridColor: "rgba(74,44,10,0.08)", domainColor: "rgba(74,44,10,0.25)",
    tickColor: "rgba(74,44,10,0.25)"
  },
  legend: {
    labelFont: "DM Sans, sans-serif", labelFontSize: 11, labelColor: "#7A5C3A",
    titleFont: "DM Sans, sans-serif", titleFontSize: 11, titleColor: "#4A2C0A",
    padding: 8, cornerRadius: 4,
    fillColor: "rgba(253,246,236,0.92)", strokeColor: "rgba(74,44,10,0.12)"
  },
  range: { category: ["#4A2C0A","#C9A96E","#8B5E2E","#E8C17A","#2E1A06","#D4A55A","#6B3F1A","#F0D9A8"] },
  view: { stroke: "transparent" }
};

const EMBED_OPT = { actions: false, config: CONFIG };

/* annotation text mark defaults */
const ANN = {
  type: "text",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 10.5,
  fontStyle: "italic",
  color: "#B8860B"
};

/* ── SVG HELPERS ── */
const NS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}
function svgText(txt, attrs) {
  const el = svgEl("text", attrs);
  el.textContent = txt;
  return el;
}

/* ════════════════════════════════════════
   VIS 1 — Consumption trend
   IDIOM: Colour-gradient bar chart with
   connecting dotted trend line and
   per-bar value labels. Interactive
   year-range filter.
════════════════════════════════════════ */
function buildVis1(startYear, endYear) {
  const layers = [
    {
      mark: { type: "bar", width: { band: 0.7 },
              cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3 },
      encoding: {
        x: { field: "year", type: "ordinal",
             axis: { title: null, labelAngle: 0 } },
        y: { field: "bags_m", type: "quantitative",
             axis: { title: "Million 60 kg bags", format: ".2f", grid: true },
             scale: { domain: [0, 2.4] } },
        color: {
          field: "bags_m", type: "quantitative",
          scale: { domain: [1.65, 2.15], range: ["#E8C17A","#4A2C0A"] },
          legend: null
        },
        tooltip: [
          { field: "year",   title: "Year" },
          { field: "bags_m", title: "Consumption (M bags)", format: ".2f" }
        ]
      }
    },
    {
      mark: { type: "line", color: "#2E1A06", strokeWidth: 1.6,
              strokeDash: [3,2], opacity: 0.45, interpolate: "monotone" },
      encoding: {
        x: { field: "year",   type: "ordinal" },
        y: { field: "bags_m", type: "quantitative" }
      }
    },
    {
      mark: { type: "text", dy: -9, fontSize: 9.5,
              fontFamily: "DM Sans, sans-serif", color: "#7A5C3A" },
      encoding: {
        x: { field: "year",   type: "ordinal" },
        y: { field: "bags_m", type: "quantitative" },
        text: { field: "bags_m", format: ".2f" }
      }
    }
  ];

  if (startYear <= 2020 && endYear >= 2020) {
    layers.push({
      data: { values: [{ year: "2020" }] },
      mark: { type: "rule", color: "#B8860B", strokeDash: [4,3],
              strokeWidth: 1.4, opacity: 0.8 },
      encoding: { x: { field: "year", type: "ordinal" } }
    });
    layers.push({
      data: { values: [{ year: "2020", bags_m: 2.32,
                         label: "COVID-19: home brewing surged 37%" }] },
      mark: Object.assign({}, ANN, { align: "left", dx: 10, dy: 0, fontSize: 10.5 }),
      encoding: {
        x: { field: "year",   type: "ordinal" },
        y: { field: "bags_m", type: "quantitative" },
        text: { field: "label" }
      }
    });
  }
  if (endYear >= 2024) {
    layers.push({
      data: { values: [{ year: "2024", bags_m: 2.22, label: "Record high" }] },
      mark: Object.assign({}, ANN, { align: "right", dx: -8, dy: -2, fontSize: 10.5 }),
      encoding: {
        x: { field: "year",   type: "ordinal" },
        y: { field: "bags_m", type: "quantitative" },
        text: { field: "label" }
      }
    });
  }
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container", height: 300,
    data: { url: "data/market.json",
            format: { type: "json", property: "consumption_trend" } },
    transform: [{ filter: "datum.year >= " + startYear +
                           " && datum.year <= " + endYear }],
    layer: layers
  };
}
vegaEmbed("#vis1", buildVis1(2015, 2024), EMBED_OPT);
document.getElementById("vis1-start").addEventListener("change", function () {
  const s = parseInt(this.value),
        e = parseInt(document.getElementById("vis1-end").value);
  if (s < e) vegaEmbed("#vis1", buildVis1(s, e), EMBED_OPT);
});
document.getElementById("vis1-end").addEventListener("change", function () {
  const s = parseInt(document.getElementById("vis1-start").value),
        e = parseInt(this.value);
  if (s < e) vegaEmbed("#vis1", buildVis1(s, e), EMBED_OPT);
});

/* ════════════════════════════════════════
   VIS 2 — Radial Coffee Clock
   IDIOM: True radial bar chart where each
   time slot is a wedge sector and the
   bar length (outer radius) encodes
   relative popularity. A ghost ring
   shows the maximum reference line.
   Uses en-dash (U+2013) to match JSON keys.
════════════════════════════════════════ */
(function buildRadialClock() {
  fetch("data/preferences.json")
    .then(r => r.json())
    .then(prefs => {
      const data = prefs.coffee_time_of_day;
      const container = document.getElementById("vis2");
      const SIZE = Math.min(container.offsetWidth || 320, 320);
      const CX = SIZE / 2, CY = SIZE / 2;
      const R_MIN = SIZE * 0.15;
      const R_MAX = SIZE * 0.44;
      const MAX_VAL = Math.max(...data.map(d => d.popularity));
      const N = data.length;
      const TWO_PI = 2 * Math.PI;
      const SLICE = TWO_PI / N;
      const GAP_FRAC = 0.12;

      const COLOURS = [
        "#F0D9A8","#D4A55A","#C9A96E","#A07850",
        "#8B5E2E","#6B3F1A","#4A2C0A","#2E1A06"
      ];

      const svg = svgEl("svg", {
        width: "100%",
        viewBox: `0 0 ${SIZE} ${SIZE}`,
        "font-family": "DM Sans, sans-serif"
      });

      /* ghost reference ring */
      svg.appendChild(svgEl("circle", {
        cx: CX, cy: CY, r: R_MAX,
        fill: "none", stroke: "rgba(74,44,10,0.1)", "stroke-width": "1"
      }));
      svg.appendChild(svgEl("circle", {
        cx: CX, cy: CY, r: R_MIN,
        fill: "rgba(74,44,10,0.04)", stroke: "none"
      }));

      data.forEach((d, i) => {
        const startA = -Math.PI / 2 + i * SLICE + (SLICE * GAP_FRAC / 2);
        const endA   = -Math.PI / 2 + (i + 1) * SLICE - (SLICE * GAP_FRAC / 2);
        const r      = R_MIN + (d.popularity / MAX_VAL) * (R_MAX - R_MIN);
        const midA   = (startA + endA) / 2;
        const laf    = endA - startA > Math.PI ? 1 : 0;

        /* bar wedge */
        const x1 = CX + R_MIN * Math.cos(startA);
        const y1 = CY + R_MIN * Math.sin(startA);
        const x2 = CX + r     * Math.cos(startA);
        const y2 = CY + r     * Math.sin(startA);
        const x3 = CX + r     * Math.cos(endA);
        const y3 = CY + r     * Math.sin(endA);
        const x4 = CX + R_MIN * Math.cos(endA);
        const y4 = CY + R_MIN * Math.sin(endA);

        const wedge = svgEl("path", {
          d: `M${x1},${y1} L${x2},${y2} A${r},${r},0,${laf},1,${x3},${y3} L${x4},${y4} A${R_MIN},${R_MIN},0,${laf},0,${x1},${y1} Z`,
          fill: COLOURS[i],
          stroke: "#F5ECD7",
          "stroke-width": "1.5",
          opacity: "0.92"
        });
        /* tooltip via title element */
        const title = svgEl("title", {});
        title.textContent = d.time_slot + ": " + d.popularity + "% relative popularity";
        wedge.appendChild(title);
        svg.appendChild(wedge);

        /* time label at outer edge */
        const LABEL_R = R_MAX + 14;
        const lx = CX + LABEL_R * Math.cos(midA);
        const ly = CY + LABEL_R * Math.sin(midA);
        const align = Math.abs(Math.cos(midA)) < 0.3 ? "middle"
                    : Math.cos(midA) < 0 ? "end" : "start";
        svg.appendChild(svgText(d.time_slot, {
          x: lx, y: ly,
          "text-anchor": align,
          "dominant-baseline": "middle",
          "font-size": "9",
          fill: "#4A2C0A"
        }));

        /* popularity value inside bar */
        if (d.popularity >= 20) {
          const vr = R_MIN + (r - R_MIN) * 0.6;
          svg.appendChild(svgText(d.popularity + "%", {
            x: CX + vr * Math.cos(midA),
            y: CY + vr * Math.sin(midA),
            "text-anchor": "middle",
            "dominant-baseline": "middle",
            "font-size": "9",
            "font-weight": "700",
            fill: "#F5ECD7"
          }));
        }
      });

      /* centre annotation */
      svg.appendChild(svgText("Peak", {
        x: CX, y: CY - 9,
        "text-anchor": "middle",
        "font-size": "11",
        "font-weight": "700",
        "font-family": "Playfair Display, serif",
        fill: "#4A2C0A"
      }));
      svg.appendChild(svgText("7\u20139am", {
        x: CX, y: CY + 8,
        "text-anchor": "middle",
        "font-size": "10",
        fill: "#8B5E2E"
      }));

      container.innerHTML = "";
      container.appendChild(svg);
    });
})();

/* ════════════════════════════════════════
   VIS 3 — Daily cups by generation
   IDIOM: Isotype / unit dot plot.
   Each filled circle = 0.2 cups. Circles
   arranged in rows of 5 per generation,
   colour-coded dark-to-light by volume.
════════════════════════════════════════ */
(function buildVis3() {
  fetch("data/preferences.json")
    .then(r => r.json())
    .then(prefs => {
      const data = prefs.daily_cups_by_generation;
      const container = document.getElementById("vis3");
      const W = Math.min(container.offsetWidth || 500, 560);
      const UNIT = 0.2;
      const COLS = 5;
      const R  = 8;
      const GAP_X = 22, GAP_Y = 20;
      const ROW_H = 68;
      const LEFT_PAD = 130;
      const H = data.length * ROW_H + 30;
      const COLOURS = ["#E8C17A","#C9A96E","#8B5E2E","#4A2C0A"];

      const svg = svgEl("svg", {
        width: "100%", viewBox: `0 0 ${W} ${H}`,
        "font-family": "DM Sans, sans-serif"
      });

      /* chart title */
      svg.appendChild(svgText("Average Daily Cups by Generation", {
        x: LEFT_PAD, y: 14,
        "font-family": "Playfair Display, serif",
        "font-size": "13", "font-weight": "700", fill: "#4A2C0A"
      }));

      data.forEach((d, gi) => {
        const baseY = 30 + gi * ROW_H;
        const count = Math.round(d.avg_cups / UNIT);

        /* generation label */
        svg.appendChild(svgText(d.generation, {
          x: LEFT_PAD - 8, y: baseY + 20,
          "text-anchor": "end", "dominant-baseline": "middle",
          "font-size": "11", "font-weight": "500", fill: "#4A2C0A"
        }));

        /* cups value */
        svg.appendChild(svgText(d.avg_cups.toFixed(1) + " cups", {
          x: LEFT_PAD + COLS * GAP_X + 18,
          y: baseY + 20,
          "font-size": "10.5", fill: "#7A5C3A"
        }));

        /* unit dots */
        for (let ci = 0; ci < count; ci++) {
          const col = ci % COLS;
          const row = Math.floor(ci / COLS);
          const cx = LEFT_PAD + col * GAP_X + 9;
          const cy = baseY + row * GAP_Y + 3;
          const fill = COLOURS[gi];
          const dot = svgEl("circle", {
            cx, cy, r: R,
            fill, stroke: "#F5ECD7", "stroke-width": "1", opacity: "0.92"
          });
          const title = svgEl("title", {});
          title.textContent = d.generation + ": " + d.avg_cups.toFixed(1) + " cups/day";
          dot.appendChild(title);
          svg.appendChild(dot);
        }
      });

      /* legend note */
      svg.appendChild(svgEl("circle", {
        cx: LEFT_PAD, cy: H - 10, r: R,
        fill: "#C9A96E", stroke: "#F5ECD7", "stroke-width": "1"
      }));
      svg.appendChild(svgText("= 0.2 cups", {
        x: LEFT_PAD + 14, y: H - 9,
        "font-size": "9.5", fill: "#7A5C3A"
      }));

      container.innerHTML = "";
      container.appendChild(svg);
    });
})();

/* ════════════════════════════════════════
   VIS 4 — Choropleth map  [UNCHANGED]
════════════════════════════════════════ */
const spec4 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Number of Cafes & Restaurants by State, 2024",
  width: "container", height: 400,
  projection: { type: "mercator" },
  layer: [
    {
      data: {
        url: "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson",
        format: { type: "json", property: "features" }
      },
      mark: { type: "geoshape", stroke: "#F5ECD7", strokeWidth: 1.5 },
      transform: [{
        lookup: "properties.STATE_NAME",
        from: {
          data: { url: "data/cafes_by_state.json" },
          key: "state_full",
          fields: ["cafes","state","cafes_per_100k","revenue_aud_b"]
        }
      }],
      encoding: {
        color: {
          field: "cafes", type: "quantitative",
          scale: { range: ["#F0D9A8","#8B5E2E","#2E1A06"] },
          legend: { title: "Number of cafes", orient: "bottom-left",
                    gradientLength: 140, offset: 10 }
        },
        tooltip: [
          { field: "properties.STATE_NAME", title: "State" },
          { field: "cafes",          title: "Cafes & restaurants", format: "," },
          { field: "cafes_per_100k", title: "Per 100,000 people" },
          { field: "revenue_aud_b",  title: "Revenue (AUD billions)", format: ".1f" }
        ]
      }
    }
  ]
};
vegaEmbed("#vis4", spec4, EMBED_OPT);

/* ════════════════════════════════════════
   VIS 5 — Small Multiple State Cards
   Each card: state badge, 3 mini spark-
   bar metrics, coffee-drinker percentage.
   A compact visual profile per state.
════════════════════════════════════════ */
(function buildStateCards() {
  fetch("data/cafes_by_state.json")
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById("vis5");
      const maxRevenue = Math.max(...data.map(d => d.revenue_aud_b));
      const maxCafes   = Math.max(...data.map(d => d.cafes));
      const maxPer100k = Math.max(...data.map(d => d.cafes_per_100k));
      const metrics = [
        { key: "revenue_aud_b",  label: "Revenue",  max: maxRevenue, color: "#4A2C0A",
          fmt: v => "$" + v.toFixed(1) + "B" },
        { key: "cafes",          label: "Cafes",    max: maxCafes,   color: "#8B5E2E",
          fmt: v => v.toLocaleString() },
        { key: "cafes_per_100k", label: "Per 100k", max: maxPer100k, color: "#C9A96E",
          fmt: v => v }
      ];

      const sorted = [...data].sort((a, b) => b.revenue_aud_b - a.revenue_aud_b);
      sorted.forEach(d => {
        const card = document.createElement("div");
        card.style.cssText = [
          "background:rgba(253,246,236,0.92)",
          "border:1px solid rgba(74,44,10,0.15)",
          "border-radius:10px",
          "padding:12px 12px 10px",
          "display:flex",
          "flex-direction:column",
          "gap:0"
        ].join(";");

        /* state abbreviation badge */
        const badge = document.createElement("div");
        badge.style.cssText = [
          "font-family:'Playfair Display',serif",
          "font-size:20px", "font-weight:900",
          "color:#4A2C0A",
          "text-align:center",
          "line-height:1",
          "margin-bottom:2px"
        ].join(";");
        badge.textContent = d.state;
        card.appendChild(badge);

        const stateName = document.createElement("div");
        stateName.style.cssText = [
          "font-family:'DM Sans',sans-serif",
          "font-size:8px", "color:#A07850",
          "text-align:center",
          "letter-spacing:0.06em",
          "text-transform:uppercase",
          "margin-bottom:10px"
        ].join(";");
        stateName.textContent = d.state_full;
        card.appendChild(stateName);

        /* metric rows */
        metrics.forEach(m => {
          const pct = (d[m.key] / m.max) * 100;

          const row = document.createElement("div");
          row.style.marginBottom = "7px";

          const topLine = document.createElement("div");
          topLine.style.cssText = "display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;";

          const lbl = document.createElement("span");
          lbl.style.cssText = "font-family:'DM Sans',sans-serif;font-size:8.5px;color:#A07850;letter-spacing:0.07em;text-transform:uppercase;";
          lbl.textContent = m.label;

          const val = document.createElement("span");
          val.style.cssText = "font-family:'DM Sans',sans-serif;font-size:9.5px;font-weight:600;color:#4A2C0A;";
          val.textContent = m.fmt(d[m.key]);

          topLine.appendChild(lbl);
          topLine.appendChild(val);

          const track = document.createElement("div");
          track.style.cssText = "background:rgba(74,44,10,0.09);border-radius:3px;height:6px;width:100%;overflow:hidden;";

          const fill = document.createElement("div");
          fill.style.cssText = `background:${m.color};width:${pct.toFixed(1)}%;height:100%;border-radius:3px;`;

          track.appendChild(fill);
          row.appendChild(topLine);
          row.appendChild(track);
          card.appendChild(row);
        });

        /* daily drinkers pct */
        const divider = document.createElement("div");
        divider.style.cssText = "border-top:1px solid rgba(74,44,10,0.1);margin:6px 0 5px;";
        card.appendChild(divider);

        const drinkRow = document.createElement("div");
        drinkRow.style.cssText = "text-align:center;";
        drinkRow.innerHTML =
          `<span style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#4A2C0A;">${d.coffee_drinkers_pct}%</span>` +
          `<span style="font-family:'DM Sans',sans-serif;font-size:8px;color:#A07850;display:block;letter-spacing:0.06em;text-transform:uppercase;">drink daily</span>`;
        card.appendChild(drinkRow);

        container.appendChild(card);
      });
    });
})();

/* ════════════════════════════════════════
   VIS 6 — Drink preferences
   IDIOM: Packed tile chart (mosaic grid).
   Tile area encodes market share.
════════════════════════════════════════ */
const spec6 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: { text: "Most Popular Coffee Drinks in Australia, 2023",
           font: "Playfair Display, serif", fontSize: 14, fontWeight: "bold",
           color: "#4A2C0A", anchor: "start", offset: 8 },
  width: 420, height: 260,
  data: { url: "data/preferences.json",
          format: { type: "json", property: "drink_preferences_national" } },
  transform: [
    { sort: [{ field: "share_pct", order: "descending" }],
      window: [{ op: "rank", as: "rank" }] },
    { calculate: "(datum.rank - 1) % 3", as: "col" },
    { calculate: "floor((datum.rank - 1) / 3)", as: "row" }
  ],
  layer: [
    {
      mark: { type: "rect", stroke: "#F5ECD7", strokeWidth: 2.5, cornerRadius: 5 },
      encoding: {
        x: { field: "col", type: "ordinal", axis: null,
             scale: { paddingInner: 0.07, paddingOuter: 0.04 } },
        y: { field: "row", type: "ordinal", axis: null,
             scale: { paddingInner: 0.07, paddingOuter: 0.04 } },
        size: { field: "share_pct", type: "quantitative",
                scale: { range: [1800, 14000] }, legend: null },
        color: {
          field: "drink", type: "nominal",
          legend: { title: null, orient: "bottom", columns: 3,
                    labelFontSize: 10, symbolSize: 80, rowPadding: 3, offset: 4 },
          scale: {
            domain: ["Cappuccino","Latte","Flat White","Long Black","Mocha",
                     "Macchiato","Espresso","Cold Brew","Other"],
            range:  ["#2E1A06","#4A2C0A","#6B3F1A","#8B5E2E","#C9A96E",
                     "#D4A55A","#E8C17A","#F0D9A8","#B8860B"]
          }
        },
        tooltip: [
          { field: "drink",     title: "Drink" },
          { field: "share_pct", title: "Share (%)" },
          { field: "category",  title: "Category" }
        ]
      }
    },
    {
      mark: { type: "text", fontFamily: "DM Sans, sans-serif",
              fontSize: 10, fontWeight: "bold",
              color: "#F5ECD7", align: "center", baseline: "middle" },
      encoding: {
        x: { field: "col", type: "ordinal", axis: null },
        y: { field: "row", type: "ordinal", axis: null },
        text: { field: "drink" },
        opacity: { condition: { test: "datum.share_pct >= 10", value: 1 }, value: 0 }
      }
    },
    {
      mark: { type: "text", fontFamily: "DM Sans, sans-serif",
              fontSize: 9.5, color: "#F5ECD7",
              align: "center", baseline: "middle", dy: 13 },
      encoding: {
        x: { field: "col", type: "ordinal", axis: null },
        y: { field: "row", type: "ordinal", axis: null },
        text: { field: "share_pct", format: ".0f", type: "quantitative" },
        opacity: { condition: { test: "datum.share_pct >= 10", value: 1 }, value: 0 }
      }
    }
  ]
};
vegaEmbed("#vis6", spec6, EMBED_OPT);

/* ════════════════════════════════════════
   VIS 7 — Drink preference by state
   IDIOM: Bubble matrix. Size + hue both
   encode the popularity index so patterns
   jump out even in peripheral vision.
════════════════════════════════════════ */
const spec7 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Drink Preference by State (Index: 100 = National Average)",
  width: "container", height: 230,
  padding: { right: 80 },
  data: { url: "data/preferences.json",
          format: { type: "json", property: "drink_by_state" } },
  layer: [
    {
      mark: { type: "rect", opacity: 0.04, color: "#4A2C0A" },
      encoding: {
        x: { field: "drink", type: "nominal",
             axis: { title: null, labelAngle: -22 } },
        y: { field: "state", type: "nominal", axis: { title: null } }
      }
    },
    {
      mark: { type: "point", filled: true, opacity: 0.88 },
      encoding: {
        x: { field: "drink", type: "nominal",
             axis: { title: null, labelAngle: -22 } },
        y: { field: "state", type: "nominal", axis: { title: null } },
        size: {
          field: "index", type: "quantitative",
          scale: { domain: [78, 122], range: [80, 820] },
          legend: { title: "Index", orient: "right", offset: 4,
                    values: [80,100,120] }
        },
        color: {
          field: "index", type: "quantitative",
          scale: { domain: [80, 100, 122], range: ["#F0D9A8","#C9A96E","#2E1A06"] },
          legend: null
        },
        tooltip: [
          { field: "state", title: "State" },
          { field: "drink", title: "Drink" },
          { field: "index", title: "Popularity Index" }
        ]
      }
    },
    {
      mark: { type: "text", fontSize: 9.5, fontFamily: "DM Sans, sans-serif",
              color: "#F5ECD7", fontWeight: "bold" },
      encoding: {
        x: { field: "drink", type: "nominal" },
        y: { field: "state", type: "nominal" },
        text: { field: "index", type: "quantitative" },
        opacity: { condition: { test: "datum.index >= 118", value: 1 }, value: 0 }
      }
    }
  ]
};
vegaEmbed("#vis7", spec7, EMBED_OPT);

/* ════════════════════════════════════════
   VIS — Coffee Culture Network (Chord)
   A true chord diagram. Outer arcs = states.
   Inner chords connect each state to the
   drinks it over-indexes on. Chord width
   encodes the affinity index value.
════════════════════════════════════════ */
(function buildChordDiagram() {
  const container = document.getElementById("vis-chord");
  if (!container) return;

  fetch("data/preferences.json")
    .then(r => r.json())
    .then(prefs => {
      const { states, drinks, matrix } = prefs.drink_chord;
      const SIZE    = Math.min(container.offsetWidth || 520, 520);
      const MARGIN  = 56;
      const CX = SIZE / 2, CY = SIZE / 2;
      const R_OUT   = SIZE / 2 - MARGIN;
      const R_IN    = R_OUT - 20;
      const ARC_GAP = 0.04;
      const TWO_PI  = 2 * Math.PI;

      const STATE_C = ["#2E1A06","#4A2C0A","#6B3F1A","#8B5E2E","#A07850"];
      const DRINK_C = ["#C9A96E","#B8860B","#D4A55A","#E8C17A","#8B5E2E"];

      /* only draw chords where affinity > 105 */
      const THRESHOLD = 105;

      /* compute state totals for arc sizing */
      const stateTotals = matrix.map(row => row.reduce((s, v) => s + v, 0));
      const grandTotal  = stateTotals.reduce((s, v) => s + v, 0);

      /* angle ranges per state */
      const stateArcs = [];
      let a = -Math.PI / 2;
      stateTotals.forEach((tot, i) => {
        const sweep = (tot / grandTotal) * (TWO_PI - ARC_GAP * states.length);
        stateArcs.push({ s: a, e: a + sweep, mid: a + sweep / 2 });
        a += sweep + ARC_GAP;
      });

      /* per-state per-drink sub-angles */
      const subAngles = matrix.map((row, i) => {
        const range = stateArcs[i].e - stateArcs[i].s;
        const tot   = stateTotals[i];
        let sa = stateArcs[i].s;
        return row.map(v => {
          const sw = (v / tot) * range;
          const r  = { s: sa, e: sa + sw };
          sa += sw;
          return r;
        });
      });

      /* for each drink, collect all state sub-arcs and sort by start angle
         to find a central "target" arc region */
      const drinkArcs = drinks.map((_, j) => {
        const segs = states.map((_, i) => subAngles[i][j]);
        return segs;
      });

      /* helper: arc path between two radii */
      function arcPath(r1, r2, startA, endA) {
        const laf = (endA - startA > Math.PI) ? 1 : 0;
        const p = (r, angle) => ({
          x: CX + r * Math.cos(angle),
          y: CY + r * Math.sin(angle)
        });
        const A = p(r2, startA), B = p(r2, endA);
        const C = p(r1, endA),   D = p(r1, startA);
        return `M${A.x},${A.y} A${r2},${r2},0,${laf},1,${B.x},${B.y} ` +
               `L${C.x},${C.y} A${r1},${r1},0,${laf},0,${D.x},${D.y} Z`;
      }

      /* helper: chord path */
      function chordPath(s1, e1, s2, e2) {
        const p = (angle) => ({
          x: CX + R_IN * Math.cos(angle),
          y: CY + R_IN * Math.sin(angle)
        });
        const A = p(s1), B = p(e1), C = p(s2), D = p(e2);
        return `M${A.x},${A.y} A${R_IN},${R_IN},0,0,1,${B.x},${B.y} ` +
               `Q${CX},${CY} ${C.x},${C.y} A${R_IN},${R_IN},0,0,0,${D.x},${D.y} ` +
               `Q${CX},${CY} ${A.x},${A.y} Z`;
      }

      const svg = svgEl("svg", {
        width: "100%",
        viewBox: `0 0 ${SIZE} ${SIZE}`,
        "font-family": "DM Sans, sans-serif"
      });

      /* draw chords (behind arcs) */
      matrix.forEach((row, i) => {
        row.forEach((val, j) => {
          if (val < THRESHOLD) return;
          const sa = subAngles[i][j];
          const da = drinkArcs[j][i]; /* reciprocal: drink side of this state */
          const chord = svgEl("path", {
            d: chordPath(sa.s, sa.e, da.s, da.e),
            fill: STATE_C[i],
            stroke: "none",
            opacity: String(0.12 + ((val - THRESHOLD) / 20) * 0.14)
          });
          const title = svgEl("title", {});
          title.textContent = states[i] + " \u2194 " + drinks[j] + ": index " + val;
          chord.appendChild(title);
          svg.appendChild(chord);
        });
      });

      /* draw state arcs */
      stateArcs.forEach((arc, i) => {
        const path = svgEl("path", {
          d: arcPath(R_IN, R_OUT, arc.s, arc.e),
          fill: STATE_C[i],
          stroke: "#F5ECD7",
          "stroke-width": "1.5"
        });
        svg.appendChild(path);

        /* state label */
        const LR  = R_OUT + 16;
        const lx  = CX + LR * Math.cos(arc.mid);
        const ly  = CY + LR * Math.sin(arc.mid);
        const anc = Math.abs(Math.cos(arc.mid)) < 0.25 ? "middle"
                  : Math.cos(arc.mid) < 0 ? "end" : "start";
        svg.appendChild(svgText(states[i], {
          x: lx, y: ly,
          "text-anchor": anc,
          "dominant-baseline": "middle",
          "font-size": "11",
          "font-weight": "700",
          fill: "#4A2C0A"
        }));
      });

      /* centre label */
      svg.appendChild(svgText("Drink", {
        x: CX, y: CY - 8,
        "text-anchor": "middle",
        "font-family": "Playfair Display, serif",
        "font-size": "12", "font-weight": "700",
        fill: "#4A2C0A"
      }));
      svg.appendChild(svgText("Affinity", {
        x: CX, y: CY + 9,
        "text-anchor": "middle",
        "font-family": "Playfair Display, serif",
        "font-size": "11",
        fill: "#8B5E2E"
      }));

      /* drink legend — bottom row */
      drinks.forEach((d, j) => {
        const lx = 10 + j * (SIZE / drinks.length);
        const ly = SIZE - 12;
        svg.appendChild(svgEl("rect", {
          x: lx, y: ly - 6, width: 10, height: 10,
          fill: DRINK_C[j], rx: "2"
        }));
        svg.appendChild(svgText(d, {
          x: lx + 13, y: ly,
          "font-size": "9",
          fill: "#7A5C3A"
        }));
      });

      container.innerHTML = "";
      container.appendChild(svg);
    });
})();

/* ════════════════════════════════════════
   VIS 8 — Flat white price by city
   IDIOM: Dumbbell (gap) chart. Each city
   shows the gap from actual price to national
   average. Dark = above avg, light = below.
   National average = $5.36.
════════════════════════════════════════ */
const NAT_AVG = 5.3625;
const spec8 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Average Flat White Price by Capital City, 2024 (AUD)",
  width: "container", height: 280,
  data: { url: "data/preferences.json",
          format: { type: "json", property: "price_by_city" } },
  layer: [
    /* national average vertical rule */
    {
      data: { values: [{}] },
      mark: { type: "rule", color: "#B8860B",
              strokeDash: [5,3], strokeWidth: 1.6, opacity: 0.85 },
      encoding: { x: { datum: NAT_AVG } }
    },
    /* gap segment */
    {
      mark: { type: "rule", strokeWidth: 3, opacity: 0.55 },
      encoding: {
        y: { field: "city", type: "nominal", sort: "-x",
             axis: { title: null } },
        x: { field: "flat_white_aud", type: "quantitative",
             axis: { title: "Price (AUD)", format: "$,.2f" },
             scale: { domain: [4.7, 6.3] } },
        x2: { datum: NAT_AVG },
        color: {
          condition: { test: "datum.flat_white_aud > " + NAT_AVG, value: "#4A2C0A" },
          value: "#C9A96E"
        }
      }
    },
    /* actual price dot */
    {
      mark: { type: "point", filled: true, size: 160 },
      encoding: {
        y: { field: "city", type: "nominal", sort: "-x" },
        x: { field: "flat_white_aud", type: "quantitative" },
        color: {
          condition: { test: "datum.flat_white_aud > " + NAT_AVG, value: "#2E1A06" },
          value: "#E8C17A"
        },
        tooltip: [
          { field: "city",          title: "City" },
          { field: "flat_white_aud", title: "Price (AUD)", format: "$,.2f" }
        ]
      }
    },
    /* price value labels */
    {
      mark: { type: "text", dx: 12, fontSize: 10.5,
              fontFamily: "DM Sans, sans-serif", color: "#7A5C3A", align: "left" },
      encoding: {
        y: { field: "city", type: "nominal", sort: "-x" },
        x: { field: "flat_white_aud", type: "quantitative" },
        text: { field: "flat_white_aud", format: "$,.2f" }
      }
    },
    /* national average annotation — floated at top of chart */
    {
      data: { values: [{ x: NAT_AVG, label: "National avg $5.36" }] },
      mark: Object.assign({}, ANN, {
        align: "left", dx: 5, fontSize: 10.5,
        baseline: "bottom"
      }),
      encoding: {
        x: { field: "x", type: "quantitative" },
        y: { value: 10 },
        text: { field: "label" }
      }
    }
  ]
};
vegaEmbed("#vis8", spec8, EMBED_OPT);

/* ════════════════════════════════════════
   VIS 9 — Import value over time
   IDIOM: Dual-axis combo chart. Bars =
   import value (AUD M); line = consumption
   volume (M bags). Independent y-axes
   reveal the post-2022 price divergence.
════════════════════════════════════════ */
function buildVis9(startYear, endYear) {
  const layers = [
    {
      mark: { type: "bar", width: { band: 0.65 },
              cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3,
              color: "#8B5E2E", opacity: 0.75 },
      encoding: {
        x: { field: "year", type: "ordinal",
             axis: { title: null, labelAngle: 0 } },
        y: { field: "import_value_aud_m", type: "quantitative",
             axis: { title: "Import value (AUD M)", format: ",.0f",
                     grid: true, titleColor: "#8B5E2E" },
             scale: { zero: true } }
      }
    },
    {
      mark: { type: "line", color: "#4A2C0A", strokeWidth: 2.6,
              interpolate: "monotone",
              point: { filled: true, size: 60, color: "#4A2C0A" } },
      encoding: {
        x: { field: "year", type: "ordinal" },
        y: { field: "consumption_bags_m", type: "quantitative",
             axis: { title: "Consumption (M bags)", format: ".2f",
                     orient: "right", grid: false, titleColor: "#4A2C0A" },
             scale: { zero: false } },
        tooltip: [
          { field: "year",                  title: "Year" },
          { field: "import_value_aud_m",    title: "Import value (AUD M)", format: ",.0f" },
          { field: "consumption_bags_m",    title: "Consumption (M bags)", format: ".2f" }
        ]
      }
    }
  ];

  if (startYear <= 2020 && endYear >= 2020) {
    layers.push({
      data: { values: [{ year: "2020" }] },
      mark: { type: "rule", color: "#B8860B",
              strokeDash: [4,3], strokeWidth: 1.2, opacity: 0.7 },
      encoding: { x: { field: "year", type: "ordinal" } }
    });
    layers.push({
      data: { values: [{ year: "2020", import_value_aud_m: 950,
                         label: "COVID dip: -2.2%" }] },
      mark: Object.assign({}, ANN, { align: "center", dy: -12 }),
      encoding: {
        x: { field: "year", type: "ordinal" },
        y: { field: "import_value_aud_m", type: "quantitative" },
        text: { field: "label" }
      }
    });
  }
  if (startYear <= 2022 && endYear >= 2024) {
    layers.push({
      data: { values: [{ year: "2022", import_value_aud_m: 1180,
                         label: "Global price surge: +77% by 2024" }] },
      mark: Object.assign({}, ANN, { align: "left", dx: 8, dy: -12, fontSize: 10.5 }),
      encoding: {
        x: { field: "year", type: "ordinal" },
        y: { field: "import_value_aud_m", type: "quantitative" },
        text: { field: "label" }
      }
    });
  }
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Coffee Import Value into Australia, " +
           startYear + "\u2013" + endYear + " (AUD Millions)",
    width: "container", height: 280,
    resolve: { scale: { y: "independent" } },
    data: { url: "data/imports.json",
            format: { type: "json", property: "import_value_by_year" } },
    transform: [{ filter: "datum.year >= " + startYear +
                           " && datum.year <= " + endYear }],
    layer: layers
  };
}
vegaEmbed("#vis9", buildVis9(2013, 2024), EMBED_OPT);
document.getElementById("vis9-start").addEventListener("change", function () {
  const s = parseInt(this.value),
        e = parseInt(document.getElementById("vis9-end").value);
  if (s < e) vegaEmbed("#vis9", buildVis9(s, e), EMBED_OPT);
});
document.getElementById("vis9-end").addEventListener("change", function () {
  const s = parseInt(document.getElementById("vis9-start").value),
        e = parseInt(this.value);
  if (s < e) vegaEmbed("#vis9", buildVis9(s, e), EMBED_OPT);
});

/* ════════════════════════════════════════
   VIS 10 — Bean Origin Flight Map [UNCHANGED]
   The existing bubble map already works as
   an origin flight map. Kept intact.
════════════════════════════════════════ */
function buildVis10(beanType) {
  const filter = beanType === "All"
    ? "datum.country !== 'Other'"
    : "datum.country !== 'Other' && datum.type === '" + beanType + "'";

  /* Great-circle arcs: destination is Australia (-25.3, 133.8) */
  const AUS_LAT = -25.3, AUS_LON = 133.8;

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: beanType !== "All"
      ? "Bean Origin Flight Map (" + beanType + " only)"
      : "Bean Origin Flight Map",
    width: "container", height: 360,
    resolve: { legend: { size: "independent" } },
    projection: { type: "naturalEarth1" },
    layer: [
      /* base countries */
      {
        data: { url: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
                format: { type: "topojson", feature: "countries" } },
        mark: { type: "geoshape", fill: "#E8C17A", fillOpacity: 0.3,
                stroke: "#F5ECD7", strokeWidth: 0.5 }
      },
      /* flight arc lines (rule from each country to Australia) */
      {
        data: { url: "data/imports.json",
                format: { type: "json", property: "import_share_by_country" } },
        transform: [{ filter: filter }],
        mark: { type: "rule", opacity: 0.5, strokeWidth: 1.4,
                strokeDash: [4, 3] },
        encoding: {
          longitude:  { field: "lon", type: "quantitative" },
          latitude:   { field: "lat", type: "quantitative" },
          longitude2: { datum: AUS_LON },
          latitude2:  { datum: AUS_LAT },
          color: {
            field: "type", type: "nominal",
            scale: { domain: ["Arabica","Robusta","Mixed"],
                     range: ["#4A2C0A","#C9A96E","#8B5E2E"] },
            legend: null
          }
        }
      },
      /* origin country circles */
      {
        data: { url: "data/imports.json",
                format: { type: "json", property: "import_share_by_country" } },
        transform: [{ filter: filter }],
        mark: { type: "circle", opacity: 0.88, stroke: "#2E1A06", strokeWidth: 1 },
        encoding: {
          longitude: { field: "lon", type: "quantitative" },
          latitude:  { field: "lat", type: "quantitative" },
          size: { field: "share_pct", type: "quantitative",
                  scale: { range: [300, 3500] }, legend: null },
          color: {
            field: "type", type: "nominal",
            scale: { domain: ["Arabica","Robusta","Mixed"],
                     range: ["#4A2C0A","#C9A96E","#8B5E2E"] },
            legend: { title: "Bean type", orient: "bottom-right", offset: 12,
                      symbolSize: 120, labelFontSize: 12,
                      fillColor: "rgba(253,246,236,0.92)",
                      strokeColor: "rgba(74,44,10,0.12)",
                      cornerRadius: 4, padding: 8 }
          },
          tooltip: [
            { field: "country",   title: "Country" },
            { field: "share_pct", title: "Import share (%)" },
            { field: "type",      title: "Bean type" }
          ]
        }
      },
      /* Australia destination dot */
      {
        data: { values: [{ lon: AUS_LON, lat: AUS_LAT, label: "Australia" }] },
        mark: { type: "circle", size: 80, color: "#2E1A06",
                stroke: "#4A2C0A", strokeWidth: 2, opacity: 1 },
        encoding: {
          longitude: { field: "lon", type: "quantitative" },
          latitude:  { field: "lat", type: "quantitative" }
        }
      }
    ]
  };
}
vegaEmbed("#vis10", buildVis10("All"), EMBED_OPT);
document.getElementById("vis10-type").addEventListener("change", function () {
  vegaEmbed("#vis10", buildVis10(this.value), EMBED_OPT);
});

/* ════════════════════════════════════════
   VIS 11 — Import share: Nested sunburst
   Inner ring = bean type; outer = country.
════════════════════════════════════════ */
const beanAgg = [
  { type: "Arabica", total: 65 },
  { type: "Robusta", total: 15 },
  { type: "Mixed",   total: 20 }
];
const spec11 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Composition of Coffee Imports by Country of Origin, 2023",
  width: 380, height: 310,
  layer: [
    /* inner ring: bean type */
    {
      data: { values: beanAgg },
      mark: { type: "arc", innerRadius: 52, outerRadius: 90,
              stroke: "#F5ECD7", strokeWidth: 2 },
      encoding: {
        theta: { field: "total", type: "quantitative", stack: true },
        color: {
          field: "type", type: "nominal",
          scale: { domain: ["Arabica","Robusta","Mixed"],
                   range:  ["#4A2C0A","#C9A96E","#8B5E2E"] },
          legend: { title: "Bean Type", orient: "bottom-left",
                    labelFontSize: 10, symbolSize: 80, offset: 4 }
        },
        tooltip: [
          { field: "type",  title: "Bean type" },
          { field: "total", title: "Share (%)" }
        ]
      }
    },
    /* inner ring labels */
    {
      data: { values: beanAgg },
      mark: { type: "text", radius: 73, fontSize: 9.5,
              fontFamily: "DM Sans, sans-serif",
              color: "#F5ECD7", fontWeight: "bold" },
      encoding: {
        theta: { field: "total", type: "quantitative", stack: true },
        text:  { field: "type" }
      }
    },
    /* outer ring: countries */
    {
      data: { url: "data/imports.json",
              format: { type: "json", property: "import_share_by_country" } },
      mark: { type: "arc", innerRadius: 96, outerRadius: 144,
              stroke: "#F5ECD7", strokeWidth: 1.5 },
      encoding: {
        theta: { field: "share_pct", type: "quantitative", stack: true },
        color: {
          field: "country", type: "nominal",
          legend: { title: null, orient: "bottom", columns: 4,
                    labelFontSize: 10, symbolSize: 80,
                    rowPadding: 3, offset: 4 },
          scale: {
            domain: ["Brazil","Colombia","Vietnam","Indonesia",
                     "Ethiopia","Guatemala","Papua New Guinea","Other"],
            range:  ["#2E1A06","#4A2C0A","#6B3F1A","#8B5E2E",
                     "#A07850","#C9A96E","#D4A55A","#E8C17A"]
          }
        },
        order: { field: "share_pct", sort: "descending" },
        tooltip: [
          { field: "country",   title: "Country" },
          { field: "share_pct", title: "Share (%)" },
          { field: "type",      title: "Bean type" }
        ]
      }
    },
    /* centre year label */
    {
      data: { values: [{ label: "2023" }] },
      mark: { type: "text", fontFamily: "Playfair Display, serif",
              fontSize: 13, fontWeight: "bold", color: "#4A2C0A", radius: 0 },
      encoding: { text: { field: "label" }, theta: { datum: 0 } }
    }
  ]
};
vegaEmbed("#vis11", spec11, EMBED_OPT);

/* ════════════════════════════════════════
   VIS 12 — Roast-to-Cup Pipeline
   IDIOM: Proper Sankey/alluvial diagram.
   Left column = equipment. Right = drink.
   Bezier flows encode share of home coffee.
   Rebuilt with correct proportional layout,
   clean labels and hover tooltips.
════════════════════════════════════════ */
(function buildRoastPipeline() {
  fetch("data/preferences.json")
    .then(r => r.json())
    .then(prefs => {
      const flows   = prefs.roast_pipeline;
      const container = document.getElementById("vis12");
      const W = Math.min(container.offsetWidth || 700, 700);
      const H = 340;
      const PAD = { top: 28, bottom: 14, left: 14, right: 14 };
      const NODE_W   = 14;
      const NODE_GAP = 10;
      const usable   = H - PAD.top - PAD.bottom;

      /* aggregate totals */
      const eqMap = {}, drMap = {};
      flows.forEach(f => {
        eqMap[f.equipment] = (eqMap[f.equipment] || 0) + f.pct;
        drMap[f.drink]     = (drMap[f.drink]     || 0) + f.pct;
      });
      const eqs    = Object.entries(eqMap).sort((a,b) => b[1]-a[1]);
      const drs    = Object.entries(drMap).sort((a,b) => b[1]-a[1]);
      const total  = eqs.reduce((s,[,v]) => s+v, 0);

      /* column x positions */
      const EQ_X = PAD.left + 110;
      const DR_X = W - PAD.right - 110 - NODE_W;

      /* compute node Y + heights */
      function layoutNodes(items) {
        const totalGap = NODE_GAP * (items.length - 1);
        let y = PAD.top;
        const out = {};
        items.forEach(([name, val]) => {
          const h = Math.max(8, (val / total) * (usable - totalGap));
          out[name] = { y, h };
          y += h + NODE_GAP;
        });
        return out;
      }
      const eqLayout = layoutNodes(eqs);
      const drLayout = layoutNodes(drs);

      /* flow cursors */
      const eqCursor = {}, drCursor = {};
      eqs.forEach(([n]) => eqCursor[n] = eqLayout[n].y);
      drs.forEach(([n]) => drCursor[n] = drLayout[n].y);

      const EQ_COLOURS = {
        "Pod / Capsule":        "#4A2C0A",
        "Manual espresso":      "#6B3F1A",
        "Drip / filter":        "#8B5E2E",
        "Plunger / French press":"#A07850",
        "AeroPress":            "#C9A96E",
        "Stovetop Moka":        "#D4A55A"
      };

      const svg = svgEl("svg", {
        width: "100%",
        viewBox: `0 0 ${W} ${H}`,
        "font-family": "DM Sans, sans-serif"
      });

      /* column headers */
      [["Equipment", EQ_X + NODE_W / 2],
       ["Drink",     DR_X + NODE_W / 2]].forEach(([lbl, x]) => {
        svg.appendChild(svgText(lbl, {
          x, y: 14,
          "text-anchor": "middle",
          "font-family": "Playfair Display, serif",
          "font-size": "12", "font-weight": "700",
          fill: "#4A2C0A"
        }));
      });

      /* flows */
      flows.forEach(f => {
        const fH = (f.pct / total) * usable;
        const x0 = EQ_X + NODE_W, x1 = DR_X;
        const y0s = eqCursor[f.equipment];
        const y0e = y0s + fH;
        const y1s = drCursor[f.drink];
        const y1e = y1s + fH;
        eqCursor[f.equipment] += fH;
        drCursor[f.drink]     += fH;
        const mx = (x0 + x1) / 2;
        const path = svgEl("path", {
          d: `M${x0},${y0s} C${mx},${y0s} ${mx},${y1s} ${x1},${y1s} ` +
             `L${x1},${y1e} C${mx},${y1e} ${mx},${y0e} ${x0},${y0e} Z`,
          fill: EQ_COLOURS[f.equipment] || "#8B5E2E",
          stroke: "none",
          opacity: "0.38"
        });
        const title = svgEl("title", {});
        title.textContent = f.equipment + " \u2192 " + f.drink + ": " + f.pct + "%";
        path.appendChild(title);
        svg.appendChild(path);
      });

      /* equipment nodes + labels */
      eqs.forEach(([name]) => {
        const { y, h } = eqLayout[name];
        svg.appendChild(svgEl("rect", {
          x: EQ_X, y, width: NODE_W,
          height: Math.max(h, 2),
          fill: EQ_COLOURS[name] || "#8B5E2E",
          rx: "3"
        }));
        svg.appendChild(svgText(name + "  " + eqMap[name] + "%", {
          x: EQ_X - 7,
          y: y + h / 2,
          "text-anchor": "end",
          "dominant-baseline": "middle",
          "font-size": "9.5",
          fill: "#4A2C0A"
        }));
      });

      /* drink nodes + labels */
      drs.forEach(([name]) => {
        const { y, h } = drLayout[name];
        svg.appendChild(svgEl("rect", {
          x: DR_X, y, width: NODE_W,
          height: Math.max(h, 2),
          fill: "#2E1A06",
          rx: "3"
        }));
        svg.appendChild(svgText(name + "  " + drMap[name] + "%", {
          x: DR_X + NODE_W + 7,
          y: y + h / 2,
          "text-anchor": "start",
          "dominant-baseline": "middle",
          "font-size": "9.5",
          fill: "#4A2C0A"
        }));
      });

      container.innerHTML = "";
      container.appendChild(svg);
    });
})();

/* ════════════════════════════════════════
   VIS 13 — Bump / rank chart
   IDIOM: Rank-shift chart. Each generation
   is ranked 1-4 by cafe preference per year.
   Lines track how ranks changed 2019->2023.
════════════════════════════════════════ */
const GEN_DOMAIN = [
  "Gen Z (18\u201327)",
  "Millennial (28\u201343)",
  "Gen X (44\u201359)",
  "Boomer (60\u201378)"
];
const spec13 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Shift Toward Home Coffee: Cafe Preference Rank by Generation, 2019 vs 2023",
  width: "container", height: 300,
  data: { url: "data/preferences.json",
          format: { type: "json", property: "cafe_vs_home_by_generation" } },
  transform: [
    { window: [{ op: "rank", field: "cafe_pct", as: "rank" }],
      sort: [{ field: "cafe_pct", order: "descending" }],
      groupby: ["year"] }
  ],
  layer: [
    /* connecting lines */
    {
      mark: { type: "line", strokeWidth: 3.5, opacity: 0.9 },
      encoding: {
        x: { field: "year", type: "ordinal",
             axis: { title: null, labelAngle: 0 } },
        y: { field: "rank", type: "quantitative",
             axis: { title: "Rank (1 = most cafe-focused)",
                     values: [1,2,3,4] },
             scale: { domain: [0.5, 4.5] } },
        color: {
          field: "generation", type: "nominal",
          legend: { title: "Generation", orient: "bottom",
                    columns: 2, labelFontSize: 11, offset: 6 },
          scale: { domain: GEN_DOMAIN,
                   range: ["#2E1A06","#6B3F1A","#C9A96E","#E8C17A"] }
        },
        detail: { field: "generation", type: "nominal" }
      }
    },
    /* rank dots */
    {
      mark: { type: "point", filled: true, size: 130 },
      encoding: {
        x: { field: "year", type: "ordinal" },
        y: { field: "rank", type: "quantitative" },
        color: {
          field: "generation", type: "nominal", legend: null,
          scale: { domain: GEN_DOMAIN,
                   range: ["#2E1A06","#6B3F1A","#C9A96E","#E8C17A"] }
        },
        tooltip: [
          { field: "generation", title: "Generation" },
          { field: "year",       title: "Year" },
          { field: "cafe_pct",   title: "Cafe preference (%)" },
          { field: "rank",       title: "Rank" }
        ]
      }
    },
    /* end-of-line labels at 2023 */
    {
      transform: [{ filter: "datum.year === 2023" }],
      mark: { type: "text", align: "left", dx: 10, fontSize: 10,
              fontFamily: "DM Sans, sans-serif" },
      encoding: {
        x: { field: "year", type: "ordinal" },
        y: { field: "rank", type: "quantitative" },
        text: { field: "generation" },
        color: {
          field: "generation", type: "nominal", legend: null,
          scale: { domain: GEN_DOMAIN,
                   range: ["#2E1A06","#6B3F1A","#C9A96E","#E8C17A"] }
        }
      }
    }
  ]
};
vegaEmbed("#vis13", spec13, EMBED_OPT);

/* ════════════════════════════════════════
   VIS 14 — Marimekko market segments
   IDIOM: Variable-width bars.
   Column width = market share %;
   column height = CAGR growth rate.
   Darker fill = faster growth.
════════════════════════════════════════ */
const spec14 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Coffee Market Share by Segment vs Growth Rate, 2025",
  width: "container", height: 300,
  data: { url: "data/market.json",
          format: { type: "json", property: "market_segments_2025" } },
  transform: [
    { sort: [{ field: "share_pct", order: "descending" }],
      window: [{ op: "sum", field: "share_pct", as: "x_end" }],
      frame: [null, 0] },
    { calculate: "datum.x_end - datum.share_pct", as: "x_start" },
    { calculate: "datum.x_start + datum.share_pct / 2", as: "x_mid" }
  ],
  layer: [
    {
      mark: { type: "rect", stroke: "#F5ECD7", strokeWidth: 2 },
      encoding: {
        x: { field: "x_start", type: "quantitative",
             axis: { title: "Cumulative market share (%)", grid: false } },
        x2: { field: "x_end" },
        y: { datum: 0 },
        y2: { field: "growth_cagr" },
        color: {
          field: "growth_cagr", type: "quantitative",
          scale: { domain: [2, 12], range: ["#C9A96E","#2E1A06"] },
          legend: { title: "CAGR (%)", orient: "top-right",
                    gradientLength: 90, offset: 8 }
        },
        tooltip: [
          { field: "segment",     title: "Segment" },
          { field: "share_pct",   title: "Market share (%)" },
          { field: "growth_cagr", title: "CAGR (%)", format: ".1f" }
        ]
      }
    },
    /* segment name labels (only for wide enough columns) */
    {
      mark: { type: "text", fontFamily: "DM Sans, sans-serif",
              fontSize: 9.5, fontWeight: "bold",
              color: "#F5ECD7", align: "center",
              baseline: "top", dy: 6 },
      encoding: {
        x: { field: "x_mid", type: "quantitative" },
        y: { datum: 0 },
        text: { field: "segment" },
        opacity: { condition: { test: "datum.share_pct >= 10", value: 1 }, value: 0 }
      }
    },
    /* CAGR value at top of each bar */
    {
      mark: { type: "text", fontFamily: "DM Sans, sans-serif",
              fontSize: 9, color: "#F5ECD7",
              align: "center", baseline: "bottom", dy: -5 },
      encoding: {
        x: { field: "x_mid", type: "quantitative" },
        y: { field: "growth_cagr", type: "quantitative" },
        text: { field: "growth_cagr", format: ".1f" },
        opacity: { condition: { test: "datum.share_pct >= 10", value: 1 }, value: 0 }
      }
    },
    /* annotation for fastest growing segment */
    {
      data: { values: [{ x_mid: 96.5, growth_cagr: 12.8,
                         label: "RTD: fastest growing at 11.4% CAGR" }] },
      mark: Object.assign({}, ANN, { align: "right", dx: -4, dy: -8, fontSize: 10 }),
      encoding: {
        x: { field: "x_mid",        type: "quantitative" },
        y: { field: "growth_cagr",  type: "quantitative" },
        text: { field: "label" }
      }
    }
  ]
};
vegaEmbed("#vis14", spec14, EMBED_OPT);

/* ════════════════════════════════════════
   VIS 15 — Streamgraph
   IDIOM: Centred-stack streamgraph.
   Symmetric silhouette layout emphasises
   the wave of change from conventional
   to specialty coffee.
════════════════════════════════════════ */
const spec15 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Rise of Specialty Coffee: Market Share Trend, 2019\u20132025",
  width: "container", height: 270,
  data: { url: "data/market.json",
          format: { type: "json", property: "specialty_vs_conventional" } },
  transform: [
    { fold: ["specialty_pct","conventional_pct"], as: ["category","pct"] },
    { calculate: "datum.category === 'specialty_pct' ? 'Specialty Coffee' : 'Conventional Coffee'",
      as: "category_label" }
  ],
  layer: [
    {
      mark: { type: "area", interpolate: "monotone", opacity: 0.92 },
      encoding: {
        x: { field: "year", type: "ordinal",
             axis: { title: null, labelAngle: 0 } },
        y: { field: "pct", type: "quantitative",
             stack: "center",
             axis: { title: "Proportional share (centred stream)",
                     format: ".0f", grid: false } },
        color: {
          field: "category_label", type: "nominal",
          sort: ["Conventional Coffee","Specialty Coffee"],
          scale: { domain: ["Specialty Coffee","Conventional Coffee"],
                   range: ["#4A2C0A","#D4A55A"] },
          legend: { title: null, orient: "bottom",
                    labelFontSize: 12, symbolSize: 100, offset: 6 }
        },
        order:   { field: "category_label", sort: "ascending" },
        tooltip: [
          { field: "year",           title: "Year" },
          { field: "category_label", title: "Category" },
          { field: "pct",            title: "Market share (%)", format: ".1f" }
        ]
      }
    },
    /* annotation — positioned at a predictable y value */
    {
      data: { values: [{ year: "2024", pct: -35,
                         label: "Specialty crossed 10% in 2024" }] },
      mark: Object.assign({}, ANN, { align: "center", dy: 0, fontSize: 10 }),
      encoding: {
        x: { field: "year", type: "ordinal" },
        y: { field: "pct",  type: "quantitative" },
        text: { field: "label" }
      }
    }
  ]
};
vegaEmbed("#vis15", spec15, EMBED_OPT);

/* ════════════════════════════════════════
   VIS 16 — Market projection trajectory
   IDIOM: Connected scatterplot on a
   continuous year axis. Historical path
   solid; projected path dashed.
════════════════════════════════════════ */
const spec16 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Australian Coffee Market: Historical & Projected Value, 2020\u20132031 (USD Billions)",
  width: "container", height: 290,
  data: { url: "data/market.json",
          format: { type: "json", property: "market_value_usd_b" } },
  layer: [
    /* historical line */
    {
      transform: [{ filter: "datum.type === 'Historical'" }],
      mark: { type: "line", color: "#4A2C0A",
              strokeWidth: 2.8, interpolate: "monotone" },
      encoding: {
        x: { field: "year", type: "quantitative",
             axis: { title: null, format: "d",
                     values: [2020,2021,2022,2023,2024,2025,
                               2026,2027,2028,2029,2030,2031],
                     labelAngle: 0 } },
        y: { field: "value_usd_b", type: "quantitative",
             axis: { title: "Market value (USD billions)", format: ".2f" },
             scale: { zero: false } }
      }
    },
    /* projected line */
    {
      transform: [{ filter: "datum.type === 'Projected'" }],
      mark: { type: "line", color: "#C9A96E",
              strokeWidth: 2.8, strokeDash: [6,3], interpolate: "monotone" },
      encoding: {
        x: { field: "year", type: "quantitative" },
        y: { field: "value_usd_b", type: "quantitative", scale: { zero: false } }
      }
    },
    /* historical dots */
    {
      transform: [{ filter: "datum.type === 'Historical'" }],
      mark: { type: "point", filled: true, size: 80, color: "#4A2C0A" },
      encoding: {
        x: { field: "year",        type: "quantitative" },
        y: { field: "value_usd_b", type: "quantitative" },
        tooltip: [
          { field: "year",        title: "Year",           format: "d" },
          { field: "value_usd_b", title: "Market (USD B)", format: ".2f" },
          { field: "type",        title: "Data type" }
        ]
      }
    },
    /* projected dots */
    {
      transform: [{ filter: "datum.type === 'Projected'" }],
      mark: { type: "point", filled: true, size: 80, color: "#C9A96E" },
      encoding: {
        x: { field: "year",        type: "quantitative" },
        y: { field: "value_usd_b", type: "quantitative" },
        tooltip: [
          { field: "year",        title: "Year",           format: "d" },
          { field: "value_usd_b", title: "Market (USD B)", format: ".2f" },
          { field: "type",        title: "Data type" }
        ]
      }
    },
    /* Historical / Projected divider */
    {
      data: { values: [{}] },
      mark: { type: "rule", color: "#A07850",
              strokeDash: [3,3], strokeWidth: 1, opacity: 0.65 },
      encoding: { x: { datum: 2025 } }
    },
    {
      data: { values: [{ year: 2025, value_usd_b: 2.52,
                         label: "Historical | Projected" }] },
      mark: { type: "text", align: "center", dy: -10, fontSize: 10,
              color: "#A07850", fontFamily: "DM Sans, sans-serif",
              fontStyle: "italic" },
      encoding: {
        x: { field: "year",        type: "quantitative" },
        y: { field: "value_usd_b", type: "quantitative" },
        text: { field: "label" }
      }
    },
    /* USD $3B milestone */
    {
      data: { values: [{}] },
      mark: { type: "rule", color: "#B8860B",
              strokeDash: [4,2], strokeWidth: 1, opacity: 0.5 },
      encoding: { y: { datum: 3.0 } }
    },
    {
      data: { values: [{ year: 2022, value_usd_b: 3.0,
                         label: "USD $3B milestone" }] },
      mark: Object.assign({}, ANN, { align: "left", dx: 6, dy: -8, fontSize: 10 }),
      encoding: {
        x: { field: "year",        type: "quantitative" },
        y: { field: "value_usd_b", type: "quantitative" },
        text: { field: "label" }
      }
    }
  ]
};
vegaEmbed("#vis16", spec16, EMBED_OPT);

/* ════════════════════════════════════════
   VIS — Coffee Journey Sankey Diagram
   Full 4-column Sankey:
   Bean Origin -> Bean Type -> Drink Category
   -> Consumption Format.
   Hover on any flow for exact percentages.
════════════════════════════════════════ */
(function buildJourneySankey() {
  const container = document.getElementById("vis-sankey");
  if (!container) return;

  const W = Math.min(container.offsetWidth || 760, 760);
  const H = 440;
  const PAD = { left: 90, right: 90, top: 36, bottom: 16 };
  const NODE_W   = 14;
  const NODE_GAP = 8;
  const NUM_COLS = 4;

  const nodes = [
    /* col 0: Origins */
    { id: 0,  name: "Brazil",        col: 0 },
    { id: 1,  name: "Colombia",      col: 0 },
    { id: 2,  name: "Vietnam",       col: 0 },
    { id: 3,  name: "Indonesia",     col: 0 },
    { id: 4,  name: "Ethiopia",      col: 0 },
    { id: 5,  name: "Other Origins", col: 0 },
    /* col 1: Bean Type */
    { id: 6,  name: "Arabica",       col: 1 },
    { id: 7,  name: "Robusta",       col: 1 },
    { id: 8,  name: "Mixed",         col: 1 },
    /* col 2: Drink Category */
    { id: 9,  name: "Milk-based",    col: 2 },
    { id: 10, name: "Black coffee",  col: 2 },
    { id: 11, name: "Instant blend", col: 2 },
    /* col 3: Format */
    { id: 12, name: "Cafe cup",      col: 3 },
    { id: 13, name: "Home brew",     col: 3 },
    { id: 14, name: "RTD can",       col: 3 }
  ];

  const links = [
    /* origins -> bean type */
    { s:0, t:6, v:32 }, { s:1, t:6, v:18 },
    { s:4, t:6, v:8  }, { s:5, t:6, v:7  },
    { s:2, t:7, v:15 },
    { s:3, t:8, v:10 },
    /* bean type -> drink category */
    { s:6, t:9,  v:40 }, { s:6, t:10, v:15 }, { s:6, t:11, v:10 },
    { s:7, t:11, v:12 }, { s:7, t:9,  v:3  },
    { s:8, t:9,  v:7  }, { s:8, t:11, v:3  },
    /* drink category -> format */
    { s:9,  t:12, v:28 }, { s:9,  t:13, v:22 },
    { s:10, t:12, v:8  }, { s:10, t:13, v:7  },
    { s:11, t:13, v:18 }, { s:11, t:14, v:7  }
  ];

  /* column x positions — evenly spaced */
  const colSpan = W - PAD.left - PAD.right - NODE_W * NUM_COLS;
  const colStep = colSpan / (NUM_COLS - 1);
  const colX = Array.from({ length: NUM_COLS }, (_, i) =>
    PAD.left + i * (colStep + NODE_W));

  /* compute node value = max of inflow/outflow */
  const inflow  = Array(nodes.length).fill(0);
  const outflow = Array(nodes.length).fill(0);
  links.forEach(l => { outflow[l.s] += l.v; inflow[l.t] += l.v; });
  const nodeVal  = nodes.map(n => Math.max(inflow[n.id], outflow[n.id], 1));
  const colNodes = Array.from({ length: NUM_COLS }, (_, c) =>
    nodes.filter(n => n.col === c));
  const colTotal = colNodes.map(ns =>
    ns.reduce((s, n) => s + nodeVal[n.id], 0));
  const usableH  = H - PAD.top - PAD.bottom;

  /* assign y+h to each node */
  const nodeY = {}, nodeH = {};
  colNodes.forEach((ns, c) => {
    const gapTotal = NODE_GAP * (ns.length - 1);
    let y = PAD.top;
    ns.forEach(n => {
      nodeH[n.id] = Math.max(6,
        (nodeVal[n.id] / colTotal[c]) * (usableH - gapTotal));
      nodeY[n.id] = y;
      y += nodeH[n.id] + NODE_GAP;
    });
  });

  /* flow placement cursors */
  const srcCursor = {}, tgtCursor = {};
  nodes.forEach(n => {
    srcCursor[n.id] = nodeY[n.id];
    tgtCursor[n.id] = nodeY[n.id];
  });

  const PALETTE = [
    /* origins */   "#4A2C0A","#6B3F1A","#8B5E2E","#A07850","#C9A96E","#D4A55A",
    /* bean type */ "#4A2C0A","#C9A96E","#8B5E2E",
    /* category */  "#2E1A06","#6B3F1A","#A07850",
    /* format */    "#2E1A06","#4A2C0A","#8B5E2E"
  ];

  const svg = svgEl("svg", {
    width: "100%",
    viewBox: `0 0 ${W} ${H}`,
    "font-family": "DM Sans, sans-serif"
  });

  /* column header labels */
  ["Origins","Bean Type","Drink Category","Format"].forEach((lbl, i) => {
    svg.appendChild(svgText(lbl, {
      x: colX[i] + NODE_W / 2,
      y: 18,
      "text-anchor": "middle",
      "font-family": "Playfair Display, serif",
      "font-size": "11", "font-weight": "700",
      fill: "#4A2C0A"
    }));
  });

  /* draw flows */
  links.forEach(l => {
    const sn    = nodes[l.s], tn = nodes[l.t];
    const srcFr = nodeVal[l.s] > 0 ? l.v / nodeVal[l.s] : 0;
    const tgtFr = nodeVal[l.t] > 0 ? l.v / nodeVal[l.t] : 0;
    const srcH  = nodeH[l.s] * srcFr;
    const tgtH  = nodeH[l.t] * tgtFr;
    const x0    = colX[sn.col] + NODE_W;
    const x1    = colX[tn.col];
    const y0s   = srcCursor[l.s];
    const y0e   = y0s + srcH;
    const y1s   = tgtCursor[l.t];
    const y1e   = y1s + tgtH;
    srcCursor[l.s] += srcH;
    tgtCursor[l.t] += tgtH;
    const mx = (x0 + x1) / 2;
    const path = svgEl("path", {
      d: `M${x0},${y0s} C${mx},${y0s} ${mx},${y1s} ${x1},${y1s} ` +
         `L${x1},${y1e} C${mx},${y1e} ${mx},${y0e} ${x0},${y0e} Z`,
      fill: PALETTE[l.s],
      stroke: "none",
      opacity: "0.36"
    });
    const title = svgEl("title", {});
    title.textContent = nodes[l.s].name + " \u2192 " + nodes[l.t].name + ": " + l.v + "%";
    path.appendChild(title);
    svg.appendChild(path);
  });

  /* draw nodes + labels */
  nodes.forEach(n => {
    /* node rect */
    const rect = svgEl("rect", {
      x: colX[n.col], y: nodeY[n.id],
      width: NODE_W, height: nodeH[n.id],
      fill: PALETTE[n.id], rx: "3"
    });
    const rTitle = svgEl("title", {});
    rTitle.textContent = n.name + ": " + nodeVal[n.id] + "%";
    rect.appendChild(rTitle);
    svg.appendChild(rect);

    /* label */
    const isLeft  = n.col === 0;
    const isRight = n.col === NUM_COLS - 1;
    const tx = isLeft  ? colX[n.col] - 5
             : isRight ? colX[n.col] + NODE_W + 5
                       : colX[n.col] + NODE_W / 2;
    const anchor = isLeft ? "end" : isRight ? "start" : "middle";
    svg.appendChild(svgText(n.name, {
      x: tx,
      y: nodeY[n.id] + nodeH[n.id] / 2,
      "text-anchor": anchor,
      "dominant-baseline": "middle",
      "font-size": "9.5",
      fill: "#4A2C0A"
    }));
  });

  container.innerHTML = "";
  container.appendChild(svg);
})();
