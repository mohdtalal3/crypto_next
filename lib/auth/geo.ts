import "server-only";

export interface MemberGeo {
  country: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

const ISO_CODE = /^[A-Z]{2}$/;

const coordinate = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : null;
};

/** Best-effort member location from edge geo headers (Vercel, then Cloudflare). Empty country = unknown.
    Coordinates are rounded to ~1 km precision — city-level, never a pinpoint. */
export function geoFromRequest(request: Request): MemberGeo {
  const headers = request.headers;
  const country = (headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? "").trim().toUpperCase();
  const cityHeader = headers.get("x-vercel-ip-city") ?? "";
  let city: string | null = null;
  if (cityHeader) {
    try { city = decodeURIComponent(cityHeader).slice(0, 120); } catch { city = cityHeader.slice(0, 120); }
  }
  return {
    country: ISO_CODE.test(country) ? country : "",
    city,
    latitude: coordinate(headers.get("x-vercel-ip-latitude")),
    longitude: coordinate(headers.get("x-vercel-ip-longitude")),
  };
}
