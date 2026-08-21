/**
 * tscircuit / graphics-debug bounding box calculation
 */
export interface Point2D {
  x: number;
  y: number;
}

export function computeBoundingBoxWithPadding(points: Point2D[], paddingRatio = 0.1) {
  if (!points.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, viewBox: '0 0 0 0' };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const rawW = maxX - minX;
  const rawH = maxY - minY;
  const padX = rawW * paddingRatio;
  const padY = rawH * paddingRatio;
  const finalX = minX - padX;
  const finalY = minY - padY;
  const finalW = rawW + padX * 2;
  const finalH = rawH + padY * 2;
  return {
    minX: finalX,
    minY: finalY,
    maxX: maxX + padX,
    maxY: maxY + padY,
    width: finalW,
    height: finalH,
    viewBox: `${finalX.toFixed(2)} ${finalY.toFixed(2)} ${finalW.toFixed(2)} ${finalH.toFixed(2)}`
  };
}
