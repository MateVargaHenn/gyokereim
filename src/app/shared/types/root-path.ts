import { Point } from "./point";

export type RootPath = {
  points: Point[];
  sampledPoints: Point[];
  startWeight: number;
  endWeight: number;
  noiseOffset: number;
  startAt: number;
  endAt: number;
};