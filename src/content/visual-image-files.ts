import type { StaticImageData } from "next/image";
import { photographs, sectorPhotographs } from "./photography";

export const visualImageFiles: Record<string, StaticImageData> = Object.fromEntries(
  Object.entries(sectorPhotographs).flatMap(([slot, id]) => id ? [[slot, photographs[id].image]] : []),
);
