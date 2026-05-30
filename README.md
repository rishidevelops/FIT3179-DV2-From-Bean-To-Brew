# From Bean to Brew: How Coffee Became Australia's Favourite Obsession

**FIT2179 Data Visualisation 2 Monash University, Semester 1, 2026**
**Author:** Rishi
**Published:** May 2026

---

## Visualisation

**[https://rishidevelops.github.io/FIT3179-DV2-From-Bean-To-Brew/](https://rishidevelops.github.io/FIT3179-DV2-From-Bean-To-Brew/)**

---

## Overview

*From Bean to Brew* is a data-driven narrative exploring Australia's coffee culture  from the bean farms of Brazil and Ethiopia to the 55,000+ cafes lining Australian streets. The visualisation traces the full arc of the story: how consumption has grown, where the beans come from, what Australians order, how much they pay, and where the market is heading.

The project is structured as a single scrollable web page divided into nine chapters, each combining Vega-Lite diagrams, custom SVG charts, and narrative text to guide the reader through an interconnected story.

---

## Structure

| Chapter | Title | Key visualisations |
|---|---|---|
| 1 | A Nation Hooked on Coffee | Gradient bar trend chart, Radial Coffee Clock, Isotype dot plot |
| 2 | A Cafe on Every Corner | Choropleth map, Small Multiple State Cards |
| 3 | Latte, Flat White, or Cappuccino? | Packed tile chart, Bubble matrix, Coffee Culture Network (chord) |
| 4 | What We Pay for Our Daily Fix | Dumbbell price chart, Dual-axis import chart |
| 5 | Australia's Coffee Comes From Around the World | Bean Origin Flight Map, Nested sunburst |
| 6 | From Bean to Cup | Coffee Journey Sankey diagram |
| 7 | Bringing the Cafe Home | Roast-to-Cup Pipeline (Sankey), Bump/rank chart |
| 8 | A $2.4 Billion Industry | Marimekko chart, Streamgraph |
| 9 | Where Is the Cup Going? | Connected scatterplot (trajectory chart) |

---

## Visualisation Idioms

All charts were designed and built from scratch. The project uses the following idioms:

**Vega-Lite charts:**
- Gradient bar chart with trend overlay (vis1)
- Packed tile mosaic (vis6)
- Bubble matrix (vis7)
- Dumbbell / gap chart (vis8)
- Dual-axis bar + line combination (vis9)
- Nested sunburst (vis11)
- Bump / rank chart (vis13)
- Marimekko / variable-width bar chart (vis14)
- Streamgraph with centred stacking (vis15)
- Connected scatterplot (vis16)

**Custom SVG / JavaScript charts:**
- Radial bar chart (clock face)  vis2
- Isotype unit dot plot  vis3
- Small Multiple State Cards  vis5
- Bean Origin Flight Map with arc lines  vis10
- Coffee Culture Network chord diagram  vis-chord
- Coffee Journey Sankey (4-column)  vis-sankey
- Roast-to-Cup Pipeline Sankey  vis12

**Geographic maps:**
- Australian states choropleth (vis4)
- World bubble map with flight arcs (vis10)

---

## Technology Stack

| Tool | Purpose |
|---|---|
| [Vega-Lite v5](https://vega.github.io/vega-lite/) | All chart-based visualisations |
| Native SVG + JavaScript | Custom diagrams (Sankey, chord, radial, isotype, state cards) |
| HTML5 / CSS3 | Layout, typography, responsive grid |
| [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) / [DM Sans](https://fonts.google.com/specimen/DM+Sans) / [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) | Typography |
| GitHub Pages | Hosting |

---

## Data Sources

| Source | Data used |
|---|---|
| Australian Bureau of Statistics (ABS) | Import trade statistics 2013-2024; cafe & restaurant counts |
| IBISWorld | State-level cafe revenue, industry market share |
| Mordor Intelligence | Market value projections 2020-2031, segment CAGR |
| Statista | Domestic consumption trends 2015-2024 |
| Roy Morgan Research | Time-of-day preferences, consumer habits |
| Square Australia | Drink preferences by state, generation data |
| Finder Australia / Numbeo | Flat white prices by capital city |
| rowanhogan/australian-states | Australian state boundary GeoJSON |
| world-atlas (TopoJSON) | World country boundaries |

---

## Repository Structure

```
/
├── index.html          Main visualisation page
├── css/
│   └── style.css       All styling and layout
├── js/
│   └── main.js         All chart code (Vega-Lite specs + custom SVG)
└── data/
    ├── market.json         Market value, segments, consumption, specialty trends
    ├── preferences.json    Drink preferences, prices, generation data, pipeline flows
    ├── imports.json        Import values by year, country shares with coordinates
    └── cafes_by_state.json State-level cafe and revenue data
```

---

## Licence

All visualisation designs are the author's own. Data remains the property of the respective sources listed above. Geographic boundary data is used under open licence (MIT / CC).
