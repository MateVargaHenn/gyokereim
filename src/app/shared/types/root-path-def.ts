import { Point } from "./point";

export type RootPathDef = {
  points: Point[];
  startWeight: number;
  endWeight: number;
  noiseOffset: number;
  startAt: number;
  endAt: number;
}