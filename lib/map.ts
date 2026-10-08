import { geoNaturalEarth1, geoPath, geoGraticule } from "d3-geo";
import { merge } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import countries110m from "world-atlas/countries-110m.json";
import { REGIONS, REGION_POINTS, type Region } from "@/lib/utils/regions";

export const MAP_WIDTH = 900;
export const MAP_HEIGHT = 430;

const topology = countries110m as unknown as Topology;
const geometries = (topology.objects.countries as GeometryCollection).geometries.filter((geometry): geometry is import("topojson-specification").Polygon | import("topojson-specification").MultiPolygon => geometry.type !== "GeometryCollection" && geometry.id !== "010");
const land = merge(topology, geometries);
const projection = geoNaturalEarth1().fitExtent([[8, 8], [MAP_WIDTH - 8, MAP_HEIGHT - 8]], land);
const path = geoPath(projection);

/** Precomputed SVG path data for the real world land silhouette and graticule.
    Computed on the server so the atlas data never ships to the browser. */
export function mapPaths() {
  return {
    land: path(land) ?? "",
    graticule: path(geoGraticule().step([30, 30])()) ?? "",
  };
}

/** Projects each region's centroid (lon, lat) into map viewBox coordinates. */
export function regionPositions(): Record<Region | "Unknown", { x: number; y: number }> {
  const positions = {} as Record<Region | "Unknown", { x: number; y: number }>;
  for (const region of [...REGIONS, "Unknown"] as Array<Region | "Unknown">) {
    const point = REGION_POINTS[region];
    const projected = projection([point.lon, point.lat]);
    positions[region] = projected ? { x: projected[0], y: projected[1] } : { x: 0, y: 0 };
  }
  return positions;
}
