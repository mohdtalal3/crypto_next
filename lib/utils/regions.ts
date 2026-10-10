export type Region = "North America" | "Latin America" | "Europe" | "Africa & Middle East" | "Asia" | "Asia-Pacific";
export const REGIONS: Region[] = ["North America", "Latin America", "Europe", "Africa & Middle East", "Asia", "Asia-Pacific"];

const regionCountries: Record<Region, string> = {
  "North America": "US CA BM GL AI AG AW BS BQ KY CW DM GD GP KN LC MF MS MQ SX TC VG VI BL",
  "Latin America": "MX GT BZ SV HN NI CR PA CU JM HT DO PR TT BB CO VE EC GY SR PE BR BO PY UY AR CL FK GF GS",
  Europe: "AL AD AT BY BE BA BG HR CY CZ DK EE FO FI FR DE GB GI GR GG HU IS IE IM IT JE LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA VA XK AX SJ",
  "Africa & Middle East": "AE BH IL IQ IR JO KW LB OM PS QA SA SY TR YE DZ AO BJ BW BF BI CM CV CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW EH RE SH YT",
  Asia: "AF AM AZ BD BT BN KH CN GE IN ID JP KZ KG LA LK MV MN MY MM NP KP PK PH SG KR TW TJ TH TL TM UZ VN HK MO IO",
  "Asia-Pacific": "AU NZ FJ PG SB VU WS TO KI FM NR PW NC AS GU MP MH TV CK NU TK WF NF PF",
};

const lookup = new Map<string, Region>();
for (const [region, codes] of Object.entries(regionCountries) as [Region, string][]) {
  for (const code of codes.split(" ")) lookup.set(code, region);
}

export function regionForCountry(code: string | null | undefined): Region | "Unknown" {
  if (!code) return "Unknown";
  return lookup.get(code.toUpperCase()) ?? "Unknown";
}

/** Approximate label positions (lon, lat) for each region's map point —
    tuned for visual clarity, not mathematically exact centroids. */
export const REGION_POINTS: Record<Region | "Unknown", { lon: number; lat: number; labelDy: number }> = {
  "North America": { lon: -100, lat: 45, labelDy: -27 },
  "Latin America": { lon: -65, lat: -15, labelDy: 36 },
  Europe: { lon: 15, lat: 50, labelDy: -27 },
  "Africa & Middle East": { lon: 30, lat: 20, labelDy: 34 },
  Asia: { lon: 90, lat: 35, labelDy: -23 },
  "Asia-Pacific": { lon: 135, lat: -25, labelDy: 32 },
  Unknown: { lon: 0, lat: 0, labelDy: 0 },
};
