import { GlossaryTerm, MissionConfig, MissionEventCard } from '../types/game';

export const MISSION_CONFIGS: Record<'moon' | 'mars', MissionConfig> = {
  moon: {
    id: 'moon',
    name: 'Moon: Artemis Shackleton Base',
    subtitle: 'South Pole Crater Rim • Beginner / Intermediate (8 Lunar Cycles)',
    locationName: 'Shackleton Crater Rim, Lunar South Pole',
    coordinates: '89.9° S, 0.0° E (Elevation: +2,100 m)',
    dayUnitName: 'Lunar Cycle',
    totalDays: 8,
    scienceTarget: 100,
    commDelayDisplay: '1.3 seconds (Near-Instant)',
    commDelayMinutes: 0.02,
    baselineRadiationMsVPerDay: 1.37, // Real Chang'e-4 LND & LRO CRaTER measurement
    safeRadiationLimitMsV: 20.0,
    surfaceTempRange: '-203°C (Shadow Crater) to -50°C (Sunlit Peak)',
    gravityFraction: '1/6th Earth Gravity (0.16 g)',
    description:
      'Run NASA’s Artemis South Pole outpost! High crater ridges capture nearly constant sunlight, but when long shadows creep across your solar arrays or the Sun fires a Solar Flare, you must balance battery heaters, oxygen recyclers, and water-wall radiation shields.',
    siteFacts: [
      'RadLab & LRO CRaTER: Astronauts on the unshielded lunar surface absorb ~1.37 mSv/day from Galactic Cosmic Rays—nearly 3× higher than inside the ISS.',
      'Shackleton Crater traps ancient water ice in permanent shadow at -203°C, while peaks on the rim receive sunlight over 80% of the lunar year.',
      'Radio signals travel between Earth and the Moon in just 1.28 seconds each way—so Houston can talk with you live!'
    ]
  },
  mars: {
    id: 'mars',
    name: 'Mars: Jezero Delta Outpost',
    subtitle: 'Ancient Lakebed • Advanced Trade-Offs & Comm Delay (10 Sols)',
    locationName: 'Jezero Crater Western Delta, Mars',
    coordinates: '18.38° N, 77.58° E (MOLA Elevation: -2,540 m)',
    dayUnitName: 'Sol',
    totalDays: 10,
    scienceTarget: 130,
    commDelayDisplay: '14 to 22 minutes (One-Way Delay!)',
    commDelayMinutes: 18,
    baselineRadiationMsVPerDay: 0.64, // Real Curiosity RAD measurement
    safeRadiationLimitMsV: 22.0,
    surfaceTempRange: '-83°C (Night) to -23°C (Afternoon)',
    gravityFraction: '3/8th Earth Gravity (0.38 g)',
    description:
      'Command humanity’s first Martian surface habitat in Jezero Crater! Swinging regional dust storms can choke solar power by 60%, hydroponic crops take days to recover if grow-lights dim, and a 36-minute round-trip radio delay means you cannot wait for Earth during an emergency.',
    siteFacts: [
      'Mars Trek & Perseverance MEDA: Jezero Crater sits 2.5 km below Martian datum; airborne dust optical depth (τ) drastically alters solar array output.',
      'RadLab & Curiosity RAD: Mars’s thin CO₂ atmosphere blocks some radiation (0.64 mSv/day baseline), but major Solar Particle Events can spike surface dose 20×.',
      'Speed of Light Constraint: At 320 million km from Earth, asking Mission Control a question takes ~18 minutes there and 18 minutes back!'
    ]
  }
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'msv',
    term: 'mSv (Millisievert)',
    shortDef: 'A unit that measures how much space radiation is absorbed by human tissue.',
    kidAnalogy:
      'Think of 1 mSv like getting 10 dental or chest X-rays. On Earth we get ~2.4 mSv in a whole year; on the Moon you get more than half of that in a single day!',
    nasaSource: 'NASA RadLab / OSDR Radiation Dosimetry Database'
  },
  {
    id: 'cme',
    term: 'CME (Coronal Mass Ejection)',
    shortDef: 'A giant cloud of magnetized plasma and charged particles blasted out by the Sun.',
    kidAnalogy:
      'Like a solar hurricane! It travels at 500 to 2,500 km per second and can shower unprotected astronauts with dangerous radiation.',
    nasaSource: 'NASA DONKI (Space Weather Database)'
  },
  {
    id: 'sol',
    term: 'Sol (Martian Day)',
    shortDef: 'One full rotation of Mars on its axis: 24 hours, 39 minutes, and 35 seconds.',
    kidAnalogy:
      'A Martian day is almost 40 minutes longer than an Earth day—like getting an extra recess every single day!',
    nasaSource: 'NASA Mars Rover & Mars Trek Mission Operations'
  },
  {
    id: 'eclss',
    term: 'ECLSS (Life Support)',
    shortDef: 'Environmental Control and Life Support System that recycles cabin air and water.',
    kidAnalogy:
      'Since there are no lakes or trees on the Moon or Mars, ECLSS turns astronauts’ breath (CO₂) back into breathable oxygen and filters every drop of water.',
    nasaSource: 'NASA Artemis & ISS Life Support Engineering'
  },
  {
    id: 'hydroponics',
    term: 'Hydroponics',
    shortDef: 'Growing fresh food plants in nutrient-rich water and LED light instead of Earth soil.',
    kidAnalogy:
      'Plants act as double-duty heroes: their leaves soak up CO₂ to make extra oxygen, AND fresh strawberries or lettuce keep astronauts healthy and happy!',
    nasaSource: 'Canadian Space Agency (CSA) Food Production Toolkit & NASA OSDR'
  },
  {
    id: 'osdr',
    term: 'Space Biology (OSDR)',
    shortDef: 'How low gravity and radiation change human bones, muscles, sleep, and plants.',
    kidAnalogy:
      'Without Earth’s gravity pulling on you, your bones and muscles get lazy and shrink unless you exercise and eat the right nutrients every day.',
    nasaSource: 'NASA Open Science Data Repository (OSDR)'
  }
];

export const CURATED_MISSION_EVENTS: MissionEventCard[] = [
  {
    id: 'donki-x-flare-2024',
    title: 'DONKI Alert: X8.7 Solar Flare & Fast CME Detected!',
    category: 'solar-storm',
    severity: 'critical',
    site: 'both',
    flrClassOrSpeed: 'Class X8.7 Flare • CME Speed: 1,750 km/s',
    storyKidFriendly:
      'BEEP-BEEP! NASA’s DONKI Space Weather satellites just spotted a monster X8.7 solar flare erupting from Sunspot Region AR13664. A fast cloud of energetic protons is racing toward your outpost right now!',
    engineeringConstraint:
      'Radiation Trade-Off: Powering up the Active Magnetic & Water-Wall Storm Shelter blocks 85% of the radiation spike, but drains huge battery power—forcing you to either dim the greenhouse grow-lights or throttle oxygen recycling.',
    nasaCitation: {
      dataset: 'DONKI',
      title: 'May 2024 Solar Superstorm (AR13664 X8.7 Flare & CME Shock)',
      referenceId: 'DONKI-2024-05-14T16:46Z-FLR / MAVEN-RAD',
      measuredValue: 'X8.7 Peak Flux; CME 1,750 km/s; Mars RAD recorded highest radiation surge in 12 years',
      url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
      explanation:
        'In May 2024, active region AR13664 unleashed a series of X-class flares. When the particles hit Mars, Curiosity’s RAD instrument measured radiation equivalent to 30 chest X-rays at once.'
    },
    choices: [
      {
        id: 'max-storm-shelter',
        label: 'Full Storm Shelter Protocol (+Water Walls & Magnetic Shield)',
        tradeOffSummary: 'Blocks radiation (+0.4 mSv only), costs -18 Power & dims Greenhouse (-12% Crop Health)',
        whyItMatters:
          'Protects crew DNA and immune systems during peak proton flux, but plants suffer in the dark and batteries drain deeply.',
        effects: {
          powerDelta: -18,
          lifeSupportDelta: -4,
          healthDelta: +4,
          radiationDoseMsV: 0.4,
          cropHealthDelta: -12,
          scienceDelta: +5,
          delayedEffect: {
            turnsLater: 2,
            description: 'Chilled hydroponic lettuce from the storm blackout produced 8% less fresh oxygen & food today.',
            lifeSupportDelta: -8,
            cropHealthDelta: -4
          }
        }
      },
      {
        id: 'balanced-water-vests',
        label: 'Wear AstroRad Water Vests & Keep Greenhouse at 50%',
        tradeOffSummary: 'Moderate radiation (+3.2 mSv), costs -9 Power, saves crops (+0% Crop loss)',
        whyItMatters:
          'Personal polyethylene/water vests shield vital organs while keeping food production alive, though crew still absorbs a measurable radiation dose.',
        effects: {
          powerDelta: -9,
          lifeSupportDelta: 0,
          healthDelta: -5,
          radiationDoseMsV: 3.2,
          cropHealthDelta: 0,
          scienceDelta: +12
        }
      },
      {
        id: 'science-first-unshielded',
        label: 'Keep Shielding Low to Run Solar Storm Particle Sensors',
        tradeOffSummary: 'High radiation spike (+7.8 mSv, -16 Health), gains +28 Science & saves Power',
        whyItMatters:
          'You capture rare solar physics telemetry, but the crew absorbs a dangerous dose that triggers fatigue and immune stress for days!',
        effects: {
          powerDelta: +4,
          lifeSupportDelta: 0,
          healthDelta: -16,
          radiationDoseMsV: 7.8,
          cropHealthDelta: +2,
          scienceDelta: +28,
          delayedEffect: {
            turnsLater: 1,
            description: 'OSDR Radiation Aftereffect: Crew experiences radiation nausea and immune dip from yesterday’s unshielded solar storm.',
            healthDelta: -10,
            scienceDelta: -8
          }
        }
      }
    ]
  },
  {
    id: 'csa-hydroponics-blight',
    title: 'CSA Greenhouse Dilemma: Dwarf Wheat vs. Oxygen Scrubber',
    category: 'food-hydroponics',
    severity: 'warning',
    site: 'both',
    storyKidFriendly:
      'Your hydroponic tray of Red Romaine Lettuce and Dwarf Wheat is entering its rapid growth phase! The plants can naturally scrub CO₂ and boost crew morale with fresh crunch—but they are guzzling water and LED electricity.',
    engineeringConstraint:
      'Closed-Loop Bioregenerative Trade-Off: Running high-intensity LED growth spectra turns electricity and water into food + oxygen tomorrow, but leaves less reserve power for tonight’s thermal heaters.',
    nasaCitation: {
      dataset: 'CSA Food',
      title: 'CSA Food Production on the Moon & OSDR Veggie Study (OSD-321)',
      referenceId: 'CSA-Naurvik-Toolkit / NASA-OSD-321',
      measuredValue: 'LED Hydroponics consumes ~35% of habitat auxiliary power; supplies fresh vitamins C, K & potassium',
      url: 'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/',
      explanation:
        'Packaged space rations lose vitamins C and B1 over long missions. CSA’s lunar greenhouse research shows fresh hydroponic crops boost astronaut nutrition, psychological well-being, and O₂ recycling—at a high energy cost.'
    },
    choices: [
      {
        id: 'boost-led-spectrum',
        label: 'Boost Red/Blue LED Grow Lights & Nutrient Pump',
        tradeOffSummary: 'Costs -14 Power today, boosts Crop Health +22% & yields +14 Life Support in 2 days',
        whyItMatters:
          'Invests scarce electrical energy today so living plants generate breathable oxygen and fresh salad later in the mission.',
        effects: {
          powerDelta: -14,
          lifeSupportDelta: +4,
          healthDelta: +6,
          radiationDoseMsV: 0,
          cropHealthDelta: +22,
          scienceDelta: +14,
          delayedEffect: {
            turnsLater: 2,
            description: 'Bumper Harvest! Thriving CSA hydroponic greens released extra O₂ and boosted crew nutrition!',
            lifeSupportDelta: +14,
            healthDelta: +8
          }
        }
      },
      {
        id: 'harvest-early-save-power',
        label: 'Harvest Baby Greens Early & Put Half the Trays to Sleep',
        tradeOffSummary: 'Saves +8 Power & gives +6 Life Support now, but reduces future O₂ recycling (-15% Crop Health)',
        whyItMatters:
          'Gives the crew a quick snack and frees up battery reserves right now, but shrinks your living oxygen buffer for later days.',
        effects: {
          powerDelta: +8,
          lifeSupportDelta: +6,
          healthDelta: 0,
          radiationDoseMsV: 0,
          cropHealthDelta: -15,
          scienceDelta: +6,
          delayedEffect: {
            turnsLater: 2,
            description: 'With fewer living plants in the greenhouse, mechanical CO₂ scrubbers had to work harder.',
            powerDelta: -6,
            lifeSupportDelta: -7
          }
        }
      },
      {
        id: 'divert-water-to-shielding',
        label: 'Drain Hydroponic Water Tanks to Fill Overhead Radiation Bladder',
        tradeOffSummary: 'Cuts daily radiation (-0.6 mSv) & saves +4 Power, but wilts crops (-24% Crop Health, -8 Life Support)',
        whyItMatters:
          'Water is one of the best radiation shields in space because it is packed with hydrogen atoms—but every liter in the walls is a liter your plants can’t drink!',
        effects: {
          powerDelta: +4,
          lifeSupportDelta: -8,
          healthDelta: +3,
          radiationDoseMsV: -0.6,
          cropHealthDelta: -24,
          scienceDelta: +8
        }
      }
    ]
  },
  {
    id: 'osdr-bone-muscle-countermeasure',
    title: 'OSDR Bio-Monitor: Microgravity Bone & Sleep Drift',
    category: 'biology-health',
    severity: 'warning',
    site: 'both',
    storyKidFriendly:
      'Your crew’s wearable biomonitors flagged two issues from NASA’s Open Science Data Repository (OSDR): reduced gravity is weakening leg bones, and 24-hour habitat work lights are scrambling everyone’s sleep clock!',
    engineeringConstraint:
      'Crew Health vs. Mission Schedule Trade-Off: Mandatory 2-hour resistive exercise (ARED) and circadian blue-light dimming keep astronauts strong and sharp, but increase oxygen/water consumption and cut into geological research time.',
    nasaCitation: {
      dataset: 'OSDR',
      title: 'Spaceflight Bone Density Loss & Circadian Alignment (OSD-379 / OSD-242)',
      referenceId: 'NASA-OSDR-OSD-379 & OSD-242',
      measuredValue: '1.0%–1.5% bone mineral loss per month in low gravity without resistive exercise + vitamin D',
      url: 'https://osdr.nasa.gov/bio/repo/',
      explanation:
        'OSDR biological studies show that reduced mechanical loading triggers osteoclasts to break down bone while cosmic radiation increases oxidative stress. Daily exercise and tuned LED lighting protect crew health.'
    },
    choices: [
      {
        id: 'full-countermeasure-protocol',
        label: 'Enforce 2-Hour Resistive Exercise + Circadian Sleep Lighting',
        tradeOffSummary: 'Restores +16 Crew Health, but panting astronauts use -10 Life Support (O₂/Water) & -6 Power',
        whyItMatters:
          'Exercising hard makes astronauts breathe more oxygen and sweat more water, taxing your ECLSS recyclers to keep their bodies strong.',
        effects: {
          powerDelta: -6,
          lifeSupportDelta: -10,
          healthDelta: +16,
          radiationDoseMsV: 0,
          cropHealthDelta: 0,
          scienceDelta: +10
        }
      },
      {
        id: 'double-science-shift',
        label: 'Skip Exercise Today to Finish Core-Sample Drilling',
        tradeOffSummary: 'Earns +26 Science Points & saves +5 Life Support O₂, but costs -12 Crew Health',
        whyItMatters:
          'Resting astronauts use less oxygen and get more lab work done today, but muscle atrophy and fatigue build up fast.',
        effects: {
          powerDelta: -4,
          lifeSupportDelta: +5,
          healthDelta: -12,
          radiationDoseMsV: 0.2,
          cropHealthDelta: 0,
          scienceDelta: +26,
          delayedEffect: {
            turnsLater: 2,
            description: 'OSDR Fatigue Compounding: Stiff muscles and poor sleep slowed down the crew during EVA prep.',
            healthDelta: -6,
            scienceDelta: -6
          }
        }
      },
      {
        id: 'bio-nutrition-compromise',
        label: 'Feed Fresh Antioxidant Crop Harvest + 45-Min Light Workout',
        tradeOffSummary: 'Balanced (+9 Health, +14 Science), consumes -10% Greenhouse Crops & -4 Life Support',
        whyItMatters:
          'Antioxidant-rich fresh greens help counter radiation oxidative stress while a shorter workout limits oxygen drain.',
        effects: {
          powerDelta: -3,
          lifeSupportDelta: -4,
          healthDelta: +9,
          radiationDoseMsV: -0.2,
          cropHealthDelta: -10,
          scienceDelta: +14
        }
      }
    ]
  },
  {
    id: 'moon-shackleton-shadow-crunch',
    title: 'Shackleton Rim Horizon Shadow: 72-Hour Solar Drop!',
    category: 'environment',
    severity: 'critical',
    site: 'moon',
    storyKidFriendly:
      'As the Moon slowly rotates, a jagged 4-kilometer mountain on the rim of Shackleton Crater just blocked the Sun! Outside temperatures plunged toward -203°C, and your main solar wings dropped to 20% output.',
    engineeringConstraint:
      'Lunar Thermal & Power Crunch: Without thick air to hold heat, lunar night shadows freeze hardware rapidly. You must choose which systems stay warm until the Sun clears the mountain peak.',
    nasaCitation: {
      dataset: 'RadLab',
      title: 'Artemis III Lunar South Pole Illumination & LRO Diviner Thermal Data',
      referenceId: 'LRO-Diviner-Shackleton / RadLab-LND',
      measuredValue: 'Shadowed crater temperatures reach 70 K (-203°C); short illumination dropouts last 2–5 Earth days on rim peaks',
      url: 'https://visualization.osdr.nasa.gov/radlab/gui/data-api/',
      explanation:
        'Even on the "Peaks of Eternal Light" near Shackleton Crater, horizon topography causes multi-day eclipses where outposts must survive strictly on fuel cells and battery reserves.'
    },
    choices: [
      {
        id: 'prioritize-cabin-eclss-heat',
        label: 'Keep Cabin Heaters & O₂ Recyclers at 100% (Drain Reserve Fuel Cells)',
        tradeOffSummary: 'Protects Crew (+6 Health, +4 Life Support), drains -20 Power Reserve',
        whyItMatters:
          'Crew stays warm and breathing clean air, but your main battery bank drops dangerously close to minimum reserve.',
        effects: {
          powerDelta: -20,
          lifeSupportDelta: +4,
          healthDelta: +6,
          radiationDoseMsV: 0,
          cropHealthDelta: -4,
          scienceDelta: +8
        }
      },
      {
        id: 'cold-soak-protocol',
        label: 'Drop Habitat to 14°C "Sweater Mode" & Pause Water Distillation',
        tradeOffSummary: 'Saves Power (-6 Power only), costs -10 Life Support & -7 Crew Health',
        whyItMatters:
          'Astronauts bundle up in thermal suits and ration water so the batteries survive the shadow, at the cost of comfort and water reserves.',
        effects: {
          powerDelta: -6,
          lifeSupportDelta: -10,
          healthDelta: -7,
          radiationDoseMsV: 0,
          cropHealthDelta: -8,
          scienceDelta: +12
        }
      },
      {
        id: 'beam-rover-relay',
        label: 'Drive Heated Rover to Sunlit Ridge to Beam Laser Power Back',
        tradeOffSummary: 'Recovers +6 Power & +20 Science, but EVA exposes astronaut to +1.8 mSv Cosmic Rays & -8 O₂',
        whyItMatters:
          'Leaving the shielded habitat for a lunar ridge EVA solves your power crisis and bags great geology data, but exposes the driver to unshielded Galactic Cosmic Rays!',
        effects: {
          powerDelta: +6,
          lifeSupportDelta: -8,
          healthDelta: -5,
          radiationDoseMsV: 1.8,
          cropHealthDelta: 0,
          scienceDelta: +20
        }
      }
    ]
  },
  {
    id: 'mars-jezero-dust-storm',
    title: 'Mars Trek Telemetry: Regional Dust Storm Over Jezero Delta!',
    category: 'environment',
    severity: 'critical',
    site: 'mars',
    storyKidFriendly:
      'Red alert! Winds sweeping down the Jezero Crater rim have kicked up a towering wall of rusty dust. The sky turned dark butterscotch, choking solar panel output by 55% and coating your external radiator vents with fine grit!',
    engineeringConstraint:
      'Martian Dust Optical Depth (τ) vs. Communication Delay: Fine electrostatic dust cuts solar generation AND clogs air-intake filters (MOXIE O₂ generator). Remember: Earth is 18 minutes away one-way!',
    nasaCitation: {
      dataset: 'Mars Trek',
      title: 'Perseverance MEDA Dust Optical Depth & Jezero Crater Meteorology',
      referenceId: 'M2020-MEDA-Jezero / Mars-Trek-MOLA',
      measuredValue: 'Dust Optical Depth τ rises from 0.4 to >2.5 during regional storms, reducing solar flux by 50–75%',
      url: 'https://trek.nasa.gov/mars/',
      explanation:
        'NASA’s Mars Environmental Dynamics Analyzer (MEDA) on Perseverance tracks dust lifting in Jezero Crater. Dust blocks sunlight while also slightly scattering incoming solar energetic particles.'
    },
    choices: [
      {
        id: 'autonomous-eva-brush',
        label: 'Act Immediately: Suit Up to Brush Solar Arrays & Clear Air Filters',
        tradeOffSummary: 'Saves Power (+6 Power) & protects MOXIE (+6 Life Support), costs -9 Health & +0.7 mSv EVA exposure',
        whyItMatters:
          'Your crew makes an autonomous on-the-spot decision without waiting for Earth, saving the solar grid at the cost of physical exhaustion.',
        effects: {
          powerDelta: +6,
          lifeSupportDelta: +6,
          healthDelta: -9,
          radiationDoseMsV: 0.7,
          cropHealthDelta: 0,
          scienceDelta: +18
        }
      },
      {
        id: 'shut-down-moxie-hunker',
        label: 'Shut Down MOXIE O₂ Generator to Protect Filters & Conserve Battery',
        tradeOffSummary: 'Saves hardware & Crew Health (+4 Health), costs -15 Life Support O₂ & -10 Power',
        whyItMatters:
          'Prevents Martian dust from ruining your oxygen machine, but forces the crew to breathe stored reserve tanks for two Sols.',
        effects: {
          powerDelta: -10,
          lifeSupportDelta: -15,
          healthDelta: +4,
          radiationDoseMsV: -0.1,
          cropHealthDelta: -6,
          scienceDelta: +10
        }
      },
      {
        id: 'ask-earth-mission-control',
        label: 'Transmit Telemetry to Earth & Wait 36 Mins for Flight Director Plan',
        tradeOffSummary: 'COMM DELAY TRAP! Waiting 36 mins while dust piles up costs -18 Power & -12 Life Support, +12 Science',
        whyItMatters:
          'At 320 million km away, radio waves take 18 minutes to reach Earth and 18 minutes back. By the time Houston replies, dust has already coated the arrays and choked the intake!',
        commDelayPenaltyApply: true,
        effects: {
          powerDelta: -18,
          lifeSupportDelta: -12,
          healthDelta: -4,
          radiationDoseMsV: 0,
          cropHealthDelta: -8,
          scienceDelta: +12,
          delayedEffect: {
            turnsLater: 1,
            description: 'Earth’s delayed troubleshooting script arrived after the dust settled—cleaning the clogged filter took extra power today.',
            powerDelta: -6
          }
        }
      }
    ]
  },
  {
    id: 'mars-comm-delay-valve-leak',
    title: '36-Minute Comm Delay Crisis: Sabatier Water-Loop Pressure Drop!',
    category: 'comms-delay',
    severity: 'critical',
    site: 'mars',
    storyKidFriendly:
      'CLANG! A micro-seal inside the Sabatier water-recycling reactor started hissing at 03:00 Mars time. Oxygen and clean water pressure are dropping by the minute, and Earth Mission Control is 19.5 light-minutes away!',
    engineeringConstraint:
      'Deep-Space Autonomy vs. Resource Isolation: On the Moon, Houston can guide a repair in 2.6 seconds. On Mars, waiting ~39 minutes for a round-trip answer means losing precious air and water before Earth even hears your call.',
    nasaCitation: {
      dataset: 'OSDR',
      title: 'NASA Human Research Program: Autonomous Crew Decision-Making Under Comm Delay',
      referenceId: 'NASA-HRP-CHAPEA / HERA-CommDelay',
      measuredValue: '4 to 24 minutes one-way light time (8–48 min round trip) between Earth and Mars',
      url: 'https://osdr.nasa.gov/bio/repo/',
      explanation:
        'In NASA’s CHAPEA and HERA Mars analog missions, crews must diagnose and repair life-support faults autonomously using onboard spares because Earth cannot troubleshoot time-critical leaks in real time.'
    },
    choices: [
      {
        id: 'reroute-backup-eclss-loop',
        label: 'Autonomously Isolate Leak & Spin Up High-Power Backup Scrubber',
        tradeOffSummary: 'Saves Life Support (-2 only) & +15 Science, drains -16 Power for backup heaters',
        whyItMatters:
          'Fast onboard thinking stops the leak immediately, though the backup catalytic scrubber is power-hungry.',
        effects: {
          powerDelta: -16,
          lifeSupportDelta: -2,
          healthDelta: +4,
          radiationDoseMsV: 0,
          cropHealthDelta: 0,
          scienceDelta: +15
        }
      },
      {
        id: 'divert-greenhouse-humidity',
        label: 'Patch Valve Manually & Condense Humidity from Greenhouse Air',
        tradeOffSummary: 'Preserves Power (-5 Power) & +6 Life Support, dries out plants (-18% Crop Health)',
        whyItMatters:
          'Pulling moisture out of the greenhouse air replenishes the crew’s drinking water tank, but stresses your hydroponic crops.',
        effects: {
          powerDelta: -5,
          lifeSupportDelta: +6,
          healthDelta: 0,
          radiationDoseMsV: 0,
          cropHealthDelta: -18,
          scienceDelta: +12
        }
      },
      {
        id: 'wait-for-houston-telemetry',
        label: 'Radio Houston Engineers & Wait 39 Minutes for Step-by-Step Instructions',
        tradeOffSummary: 'COMM DELAY COST: 39 minutes of hissing gas costs -22 Life Support & -8 Health!',
        whyItMatters:
          'Houston sends a textbook repair guide—39 minutes too late! Never wait on speed-of-light radio when air is leaking on Mars.',
        commDelayPenaltyApply: true,
        effects: {
          powerDelta: -4,
          lifeSupportDelta: -22,
          healthDelta: -8,
          radiationDoseMsV: 0,
          cropHealthDelta: 0,
          scienceDelta: +6
        }
      }
    ]
  },
  {
    id: 'radlab-galactic-cosmic-ray-eva',
    title: 'RadLab Dosimeter Check: Lava Tube vs. Exposed Crater Drilling',
    category: 'biology-health',
    severity: 'info',
    site: 'both',
    storyKidFriendly:
      'Mission Science wants rock samples! You can either drill an exposed crater peak rich in ancient solar-wind minerals, or explore a sheltered underground volcanic lava tube where solid rock blocks cosmic rays.',
    engineeringConstraint:
      'Science Return vs. Cumulative Radiation Budget: Every hour outside the shielded habitat adds Galactic Cosmic Ray (GCR) dose to your crew’s career limit.',
    nasaCitation: {
      dataset: 'RadLab',
      title: 'RadLab Absorbed Dose Rates: Surface vs. Subsurface Regolith Shielding',
      referenceId: 'RadLab-CRaTER-RAD-2025',
      measuredValue: '1.37 mSv/day (Moon) / 0.64 mSv/day (Mars) unshielded; 3 meters of regolith/basalt cuts GCR by >90%',
      url: 'https://visualization.osdr.nasa.gov/radlab/gui/data-api/',
      explanation:
        'RadLab dosimetry shows that Galactic Cosmic Rays (heavy ions from outside our solar system) are hard to stop with thin metal walls, but natural underground lava tubes or thick regolith berms provide massive protection.'
    },
    choices: [
      {
        id: 'high-ridge-drilling',
        label: 'Drill the Exposed Crater Peak (Maximum Science Return)',
        tradeOffSummary: 'Earns huge +28 Science Points, costs -10 Power, -8 Life Support O₂, & +2.1 mSv Radiation',
        whyItMatters:
          'High elevation gives unblocked solar-wind core samples, at the cost of higher cosmic ray exposure and suit oxygen.',
        effects: {
          powerDelta: -10,
          lifeSupportDelta: -8,
          healthDelta: -6,
          radiationDoseMsV: 2.1,
          cropHealthDelta: 0,
          scienceDelta: +28
        }
      },
      {
        id: 'subsurface-lava-tube',
        label: 'Survey the Sheltered Volcanic Lava Tube (Natural Rock Shield)',
        tradeOffSummary: 'Reduces daily radiation (-0.4 mSv) & +5 Health, earns +15 Science, costs -12 Power for floodlights',
        whyItMatters:
          'Underground basalt rock blocks cosmic rays almost completely, though your rover needs extra battery power for headlights and radar in the dark cave.',
        effects: {
          powerDelta: -12,
          lifeSupportDelta: -5,
          healthDelta: +5,
          radiationDoseMsV: -0.4,
          cropHealthDelta: 0,
          scienceDelta: +15
        }
      },
      {
        id: 'teleoperate-from-habitat',
        label: 'Stay Inside Habitat & Drive Robotic Arm Remotely',
        tradeOffSummary: 'Zero extra radiation (+0 mSv) & saves O₂ (+4 Life Support), earns only +9 Science & costs -6 Power',
        whyItMatters:
          'Keeping humans inside the shielded habitat protects health and suit air, but robotic arms drill slower than astronauts on site.',
        effects: {
          powerDelta: -6,
          lifeSupportDelta: +4,
          healthDelta: +4,
          radiationDoseMsV: 0,
          cropHealthDelta: 0,
          scienceDelta: +9
        }
      }
    ]
  },
  {
    id: 'donki-m-flare-comms-blackout',
    title: 'DONKI Space Weather: M5.4 Solar Flare & Radio Ionization!',
    category: 'solar-storm',
    severity: 'warning',
    site: 'both',
    flrClassOrSpeed: 'Class M5.4 Solar Flare • X-Ray Burst',
    storyKidFriendly:
      'A medium-strong M5.4 Solar Flare just flashed on the Sun! X-rays travelling at the speed of light hit your outpost antenna first, scrambling your high-rate science transmission to Earth.',
    engineeringConstraint:
      'Power & Comms Trade-Off: Boosting transmitter amplifier power pushes your science data through the solar static, OR you can divert power into battery charging before the slower proton wave arrives tomorrow.',
    nasaCitation: {
      dataset: 'DONKI',
      title: 'DONKI Solar Flare (FLR) R2 Radio Blackout & SEP Precursor',
      referenceId: 'DONKI-FLR-M5.4-Archive',
      measuredValue: 'X-rays arrive in 8.3 mins (1 AU); energetic protons follow 30 mins to 12 hours later',
      url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
      explanation:
        'Solar flares emit X-rays that travel at light speed, disrupting radio bands immediately and serving as an early warning that slower-moving charged particles may follow.'
    },
    choices: [
      {
        id: 'precharge-shields-batteries',
        label: 'Pause Science Downlink & Pre-Charge Storm Batteries + Shielding',
        tradeOffSummary: 'Gains +12 Power & blocks +0.8 mSv radiation, earns only +4 Science today',
        whyItMatters:
          'Smart mission planners use the X-ray flash as an early warning to top off batteries before the particle wave hits!',
        effects: {
          powerDelta: +12,
          lifeSupportDelta: +2,
          healthDelta: +5,
          radiationDoseMsV: -0.5,
          cropHealthDelta: 0,
          scienceDelta: +4,
          delayedEffect: {
            turnsLater: 1,
            description: 'Pre-charged storm shields easily absorbed the trailing solar proton wave (+6 Power saved)!',
            powerDelta: +6,
            healthDelta: +4
          }
        }
      },
      {
        id: 'overdrive-dish-downlink',
        label: 'Overdrive High-Gain Dish to Push Science Data Through Static',
        tradeOffSummary: 'Earns +24 Science Points right now, drains -15 Power & exposes crew to +1.9 mSv',
        whyItMatters:
          'You hit your science milestone fast, but drain batteries right when radiation shielding needs power.',
        effects: {
          powerDelta: -15,
          lifeSupportDelta: -3,
          healthDelta: -6,
          radiationDoseMsV: +1.9,
          cropHealthDelta: 0,
          scienceDelta: +24
        }
      },
      {
        id: 'reroute-to-life-support',
        label: 'Switch Dish to Low-Power Beacon & Run Full ECLSS Water Recovery',
        tradeOffSummary: 'Boosts +12 Life Support, costs -6 Power, +10 Science, +0.9 mSv',
        whyItMatters:
          'Uses the quiet comms window to catch up on water filtration and oxygen generation.',
        effects: {
          powerDelta: -6,
          lifeSupportDelta: +12,
          healthDelta: +2,
          radiationDoseMsV: +0.9,
          cropHealthDelta: +5,
          scienceDelta: +10
        }
      }
    ]
  }
];
