# Outpost Commander: Deep Space Trade-Offs

**2026 NASA Space Apps Challenge Project**  
*Track: Beginner / Youth (Ages 7–12) • Intermediate • Education & Games*

---

**Prototype Link** - **https://pragna235.github.io/Mission-Trainers-Challenge-3/**

## 🚀 Overview

Space education for kids often oversimplifies mission design into trivia or safe choices without consequences. In reality, human survival on the Moon and Mars is governed by relentless engineering trade-offs:
- **A decision that saves power today might starve life support of oxygen tomorrow.**
- **Boosting radiation shielding drains batteries, forcing greenhouse grow-lights to dim.**
- **On Mars, an 18-minute one-way radio delay means asking Earth for help during an emergency might arrive too late.**

**Outpost Commander** is a browser-based, turn-based mission control simulator where students command either:
1. **Moon: Artemis Shackleton Base** (South Pole crater rim, 1.3s comms, extreme radiation spikes & crater shadow thermal drops)
2. **Mars: Jezero Delta Outpost** (Ancient crater lakebed, 18-minute comm delay, atmospheric dust storms & MOXIE oxygen filtering)

---

## 🔬 Grounded in Real NASA Open Data & Science

Rather than inventing arcade numbers, every mechanic and event is linked directly to published NASA & Canadian Space Agency (CSA) datasets:

| System & Mechanic | NASA / Partner Dataset | Real Measurement / Mission Reference |
| :--- | :--- | :--- |
| **Solar Flares & Radiation Storms** | [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) | Live 28-day `/DONKI/FLR` and `/DONKI/CME` API telemetry + May 2024 AR13664 X8.7 Superflare shockwave (1,750 km/s). |
| **Cumulative Radiation Dosimetry** | [NASA RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/) | Real surface GCR absorbed doses: `1.37 mSv/day` (Moon, Chang'e-4 LND / LRO CRaTER) vs `0.64 mSv/day` (Mars Curiosity RAD). |
| **Crew Biology & Countermeasures** | [NASA OSDR](https://osdr.nasa.gov/bio/repo/) | Studies `OSD-379` (1.0–1.5% bone loss/mo in low-g), `OSD-242` (circadian lighting), and `OSD-321` (spaceflight plant growth). |
| **Martian Dust & Weather** | [NASA Mars Trek](https://trek.nasa.gov/mars/) | Jezero Crater topography (`-2,540 m` elevation) & Perseverance MEDA dust optical depth ($\tau$) choking solar arrays by 55%. |
| **Hydroponic Food & Air Loop** | [CSA Food Production](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/) | Naurvik closed-loop CEA research: LED grow lights trade 35% habitat power for fresh vitamins and biogenic $O_2$. |

---

## 🎮 Core Gameplay Loop

1. **Step 1: Daily Power Allocation Sliders**  
   Solar arrays provide ~95% total load. Players budget electricity between **Life Support (ECLSS)**, **Active Radiation Shielding**, **CSA Hydroponic Greenhouse**, and **Science / Earth Comms**. Over-allocating drains battery reserves; under-allocating compromises tomorrow's oxygen, crops, or radiation defense.
2. **Step 2: Real NASA Dilemma Cards (No "Free" Choices)**  
   Respond to real space weather alerts, dust storms, microgravity health alerts, or comms delay crises. Every response has clear resource trade-offs and multi-turn compounding aftereffects.
3. **NASA Data Traceability Hub**  
   Click the top status badge at any time to open the **Data Traceability Hub**, inspect live DONKI space weather telemetry, enter custom NASA API keys, or read the kid-friendly space science glossary.

---

## 🛠️ Setup & Running Locally

### Prerequisites
- Node.js (v18+) & npm

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/pragnayanduri/Mission-Trainers-Challenge-3.git
cd Mission-Trainers-Challenge-3

# 2. Install dependencies
npm install

# 3. Configure NASA API Key
cp .env.example .env
# Edit .env and enter your NASA API Key (or keep default DEMO_KEY)

# 4. Start the development server
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
├── .env.example              # Template for NASA API key
├── index.html                # HTML entry point with Space Grotesk / JetBrains Mono fonts
├── src/
│   ├── App.tsx               # Main simulation orchestration & UI layout
│   ├── index.css             # High-contrast space mission control design system
│   ├── types/game.ts         # TypeScript interfaces for telemetry, cards, & datasets
│   ├── data/nasaData.ts      # Curated real NASA & CSA datasets (DONKI, RadLab, OSDR, Mars Trek)
│   ├── engine/simulation.ts  # Resource trade-off math & compounding turn consequences
│   ├── services/nasaApi.ts   # Live NASA DONKI API integration with honest fallback
│   └── components/
│       ├── OutpostVisualizer.tsx        # Interactive SVG Outpost HUD (Moon & Mars)
│       └── ScienceTraceabilityModal.tsx # NASA Data Hub, Live Telemetry, & Glossary
```
>>>>>>> 9e8caed (feat: complete Outpost Commander simulator with real NASA data, .env configuration, and GitHub Pages deployment workflow)
