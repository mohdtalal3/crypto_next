import "server-only";

export interface MemberGeo {
  country: string;
}

const ISO_CODE = /^[A-Z]{2}$/;

/** Member country from edge geo headers (Vercel, then Cloudflare). Empty = unknown.
    Region-level only — nothing more precise is stored. */
export function geoFromRequest(request: Request): MemberGeo {
  const country = (request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? "").trim().toUpperCase();
  return { country: ISO_CODE.test(country) ? country : "" };
}
