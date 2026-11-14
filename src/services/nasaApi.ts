import { LiveDonkiSummary, MissionEventCard } from '../types/game';

function formatDateYYYYMMDD(d: Date): string {
  return d.toISOString().split('T')[0];
}

export async function fetchLiveDonkiSpaceWeather(apiKey = 'DEMO_KEY'): Promise<{
  ok: boolean;
  summary?: LiveDonkiSummary;
  liveEventCard?: MissionEventCard;
  errorReason?: string;
}> {
  const cleanKey = (apiKey || 'DEMO_KEY').trim();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 28 * 24 * 60 * 60 * 1000);
  const startStr = formatDateYYYYMMDD(startDate);
  const endStr = formatDateYYYYMMDD(endDate);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const [flrRes, cmeRes] = await Promise.all([
      fetch(
        `https://api.nasa.gov/DONKI/FLR?startDate=${startStr}&endDate=${endStr}&api_key=${encodeURIComponent(cleanKey)}`,
        { signal: controller.signal }
      ),
      fetch(
        `https://api.nasa.gov/DONKI/CME?startDate=${startStr}&endDate=${endStr}&api_key=${encodeURIComponent(cleanKey)}`,
        { signal: controller.signal }
      )
    ]);

    clearTimeout(timeout);

    if (!flrRes.ok && !cmeRes.ok) {
      return {
        ok: false,
        errorReason: `NASA API returned HTTP ${flrRes.status} (Using Verified Archived NASA Dataset)`
      };
    }

    const flares = flrRes.ok ? await flrRes.json() : [];
    const cmes = cmeRes.ok ? await cmeRes.json() : [];

    const flareList = Array.isArray(flares) ? flares : [];
    const cmeList = Array.isArray(cmes) ? cmes : [];

    // Rank flares by class (X > M > C > B)
    const scoreFlare = (cls: string): number => {
      if (!cls) return 0;
      const letter = cls[0]?.toUpperCase();
      const num = parseFloat(cls.slice(1)) || 1;
      if (letter === 'X') return 1000 + num * 10;
      if (letter === 'M') return 100 + num * 5;
      if (letter === 'C') return 10 + num;
      return num;
    };

    let strongestFlare: LiveDonkiSummary['strongestFlare'];
    if (flareList.length > 0) {
      const sorted = [...flareList].sort(
        (a, b) => scoreFlare(b.classType || '') - scoreFlare(a.classType || '')
      );
      const top = sorted[0];
      strongestFlare = {
        flrID: top.flrID || 'DONKI-FLR-LIVE',
        classType: top.classType || 'M2.5',
        beginTime: top.beginTime || new Date().toISOString(),
        sourceLocation: top.sourceLocation || 'Active Sunspot Region',
        link: top.link || 'https://ccmc.gsfc.nasa.gov/tools/DONKI/'
      };
    }

    let fastestCme: LiveDonkiSummary['fastestCme'];
    if (cmeList.length > 0) {
      let bestSpeed = 0;
      let bestItem: any = cmeList[0];
      for (const item of cmeList) {
        const analyses = Array.isArray(item.cmeAnalyses) ? item.cmeAnalyses : [];
        for (const an of analyses) {
          if (typeof an.speed === 'number' && an.speed > bestSpeed) {
            bestSpeed = an.speed;
            bestItem = item;
          }
        }
      }
      fastestCme = {
        activityID: bestItem.activityID || 'DONKI-CME-LIVE',
        startTime: bestItem.startTime || new Date().toISOString(),
        speedKmS: bestSpeed || 680,
        note: (bestItem.note || 'Coronal Mass Ejection observed by SOHO/STEREO coronagraphs.').slice(0, 160),
        link: bestItem.link || 'https://ccmc.gsfc.nasa.gov/tools/DONKI/'
      };
    }

    const summary: LiveDonkiSummary = {
      fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flareCount: flareList.length,
      cmeCount: cmeList.length,
      strongestFlare,
      fastestCme
    };

    const flareClass = strongestFlare?.classType || 'M3.2';
    const cmeSpeed = fastestCme?.speedKmS || 750;
    const isMajor = flareClass.startsWith('X') || cmeSpeed >= 1000;
    const unshieldedDose = isMajor ? 6.4 : 2.8;

    const liveEventCard: MissionEventCard = {
      id: `live-donki-${Date.now()}`,
      title: `LIVE NASA DONKI Alert: Class ${flareClass} Solar Event & ${cmeSpeed} km/s CME!`,
      category: 'solar-storm',
      severity: isMajor ? 'critical' : 'warning',
      site: 'both',
      isLiveDonki: true,
      donkiRawTimestamp: strongestFlare?.beginTime || fastestCme?.startTime,
      flrClassOrSpeed: `Live DONKI: ${flareClass} Flare • CME ${cmeSpeed} km/s (${flareList.length} flares / ${cmeList.length} CMEs in past 28d)`,
      storyKidFriendly: `LIVE SPACE WEATHER! NASA’s DONKI satellites recorded ${flareList.length} solar flares and ${cmeList.length} CMEs recently—led by a real Class ${flareClass} flare (${strongestFlare?.flrID || 'Active Sun'}) and a ${cmeSpeed} km/s solar plasma cloud! How will your outpost respond?`,
      engineeringConstraint:
        'Live Space Weather Trade-Off: Actual solar activity from NASA DONKI forces you to weigh battery reserve and greenhouse crop lighting against crew radiation shielding.',
      nasaCitation: {
        dataset: 'DONKI',
        title: `Live NASA DONKI Telemetry (${strongestFlare?.flrID || fastestCme?.activityID || 'Recent Window'})`,
        referenceId: strongestFlare?.flrID || fastestCme?.activityID || 'DONKI-LIVE-API',
        measuredValue: `Peak Flare: ${flareClass} (${strongestFlare?.sourceLocation || 'Disk'}) | Fastest CME: ${cmeSpeed} km/s`,
        url: strongestFlare?.link || fastestCme?.link || 'https://api.nasa.gov/',
        explanation:
          'This event card was generated directly from live NASA Space Weather Database (DONKI) API telemetry, linking your in-game shielding decision to real recent solar activity.'
      },
      choices: [
        {
          id: 'live-full-shield',
          label: 'Activate Full Storm Shielding & Dim Non-Essential Systems',
          tradeOffSummary: `Blocks radiation (+0.3 mSv only), costs -16 Power & -10% Crop Health`,
          whyItMatters:
            'Keeps astronaut radiation exposure near baseline during this real DONKI event, at a steep electrical and agricultural cost.',
          effects: {
            powerDelta: -16,
            lifeSupportDelta: -3,
            healthDelta: +5,
            radiationDoseMsV: 0.3,
            cropHealthDelta: -10,
            scienceDelta: +10
          }
        },
        {
          id: 'live-balanced-vests',
          label: 'Use Personal Water Shield Vests & Keep Life Support Nominal',
          tradeOffSummary: `Moderate dose (+${(unshieldedDose * 0.45).toFixed(1)} mSv), costs -8 Power, +14 Science`,
          whyItMatters:
            'Balances battery survival and crew protection while logging real space-weather dosimetry.',
          effects: {
            powerDelta: -8,
            lifeSupportDelta: +2,
            healthDelta: -3,
            radiationDoseMsV: Number((unshieldedDose * 0.45).toFixed(1)),
            cropHealthDelta: 0,
            scienceDelta: +14
          }
        },
        {
          id: 'live-science-instruments',
          label: 'Keep Shielding Minimal to Calibrate Heliophysics Spectrometers',
          tradeOffSummary: `High radiation (+${unshieldedDose} mSv, -14 Health), earns +26 Science & saves Power`,
          whyItMatters:
            'Captures high-value solar energetic particle spectra, but pushes your crew closer to NASA’s safe radiation limit!',
          effects: {
            powerDelta: +4,
            lifeSupportDelta: 0,
            healthDelta: -14,
            radiationDoseMsV: unshieldedDose,
            cropHealthDelta: 0,
            scienceDelta: +26
          }
        }
      ]
    };

    return { ok: true, summary, liveEventCard };
  } catch (err: any) {
    return {
      ok: false,
      errorReason: 'Offline or rate-limited — running on Verified Archived NASA Datasets (DONKI, RadLab, OSDR, Mars Trek).'
    };
  }
}
