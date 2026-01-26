import { Vector3 } from 'three';

const DEG2RAD = Math.PI / 180;

export function calcPos(
  lat: number,
  lon: number,
  radius: number,
  lonOffset = -90
) {
  const phi = lat * DEG2RAD;
  const theta = (lon + lonOffset) * DEG2RAD;

  const x = radius * Math.cos(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi);
  const z = -radius * Math.cos(phi) * Math.sin(theta);

  return new Vector3(x, y, z);
}
