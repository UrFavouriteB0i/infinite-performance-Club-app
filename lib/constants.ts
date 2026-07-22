export const REGION_MAP = {
  TGR: "Tangerang",
  JKT: "DKI Jakarta",
  BGR: "Bogor",
  BKS: "Bekasi",
  DPK: "Depok",
} as const;

export const REGIONS = Object.entries(REGION_MAP).map(([code, name]) => ({
  code,
  name,
}));

export type RegionCode = keyof typeof REGION_MAP;