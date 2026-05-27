import type {
  Arrow,
  Circle,
  GraphicsObject,
  InfiniteLine,
  Line,
  Point,
  Polygon,
  Rect,
  Text,
} from "../../../lib/types"

export type GraphicsObjectType =
  | "lines"
  | "infiniteLines"
  | "rects"
  | "polygons"
  | "points"
  | "circles"
  | "texts"
  | "arrows"

export type IndexedGraphicsObject<T> = T & {
  originalIndex: number
}

export type LimitedGraphicsCollections = {
  lines: IndexedGraphicsObject<Line>[]
  infiniteLines: IndexedGraphicsObject<InfiniteLine>[]
  rects: IndexedGraphicsObject<Rect>[]
  polygons: IndexedGraphicsObject<Polygon>[]
  points: IndexedGraphicsObject<Point>[]
  circles: IndexedGraphicsObject<Circle>[]
  texts: IndexedGraphicsObject<Text>[]
  arrows: IndexedGraphicsObject<Arrow>[]
  totalFilteredObjects: number
  totalDisplayedObjects: number
  isLimitReached: boolean
}

const GRAPHICS_OBJECT_TYPES: GraphicsObjectType[] = [
  "lines",
  "infiniteLines",
  "rects",
  "polygons",
  "points",
  "circles",
  "texts",
  "arrows",
]

type FilterMap = {
  lines: (obj: Line) => boolean
  infiniteLines: (obj: InfiniteLine) => boolean
  rects: (obj: Rect) => boolean
  polygons: (obj: Polygon) => boolean
  points: (obj: Point) => boolean
  circles: (obj: Circle) => boolean
  texts: (obj: Text) => boolean
  arrows: (obj: Arrow) => boolean
}

export const getFilteredAndLimitedGraphics = (
  graphics: GraphicsObject,
  filters: FilterMap,
  objectLimit?: number,
): LimitedGraphicsCollections => {
  const filteredCollections = {
    lines: (graphics.lines ?? [])
      .map((obj, originalIndex) => ({ ...obj, originalIndex }))
      .filter(filters.lines),
    infiniteLines: (graphics.infiniteLines ?? [])
      .map((obj, originalIndex) => ({ ...obj, originalIndex }))
      .filter(filters.infiniteLines),
    rects: (graphics.rects ?? [])
      .map((obj, originalIndex) => ({ ...obj, originalIndex }))
      .filter(filters.rects),
    polygons: (graphics.polygons ?? [])
      .map((obj, originalIndex) => ({ ...obj, originalIndex }))
      .filter(filters.polygons),
    points: (graphics.points ?? [])
      .map((obj, originalIndex) => ({ ...obj, originalIndex }))
      .filter(filters.points),
    circles: (graphics.circles ?? [])
      .map((obj, originalIndex) => ({ ...obj, originalIndex }))
      .filter(filters.circles),
    texts: (graphics.texts ?? [])
      .map((obj, originalIndex) => ({ ...obj, originalIndex }))
      .filter(filters.texts),
    arrows: (graphics.arrows ?? [])
      .map((obj, originalIndex) => ({ ...obj, originalIndex }))
      .filter(filters.arrows),
  }

  const totalFilteredObjects = Object.values(filteredCollections).reduce(
    (sum, objects) => sum + objects.length,
    0,
  )

  if (!objectLimit || objectLimit <= 0 || totalFilteredObjects <= objectLimit) {
    return {
      ...filteredCollections,
      totalFilteredObjects,
      totalDisplayedObjects: totalFilteredObjects,
      isLimitReached: false,
    }
  }

  const keptKeys = new Set<string>()
  const flattened = GRAPHICS_OBJECT_TYPES.flatMap((type) =>
    filteredCollections[type].map((obj) => ({
      type,
      key: `${type}:${obj.originalIndex}`,
    })),
  )
  const limitedObjects = flattened.slice(-objectLimit)
  for (const entry of limitedObjects) keptKeys.add(entry.key)

  const limitedCollections = {
    lines: filteredCollections.lines.filter((obj) =>
      keptKeys.has(`lines:${obj.originalIndex}`),
    ),
    infiniteLines: filteredCollections.infiniteLines.filter((obj) =>
      keptKeys.has(`infiniteLines:${obj.originalIndex}`),
    ),
    rects: filteredCollections.rects.filter((obj) =>
      keptKeys.has(`rects:${obj.originalIndex}`),
    ),
    polygons: filteredCollections.polygons.filter((obj) =>
      keptKeys.has(`polygons:${obj.originalIndex}`),
    ),
    points: filteredCollections.points.filter((obj) =>
      keptKeys.has(`points:${obj.originalIndex}`),
    ),
    circles: filteredCollections.circles.filter((obj) =>
      keptKeys.has(`circles:${obj.originalIndex}`),
    ),
    texts: filteredCollections.texts.filter((obj) =>
      keptKeys.has(`texts:${obj.originalIndex}`),
    ),
    arrows: filteredCollections.arrows.filter((obj) =>
      keptKeys.has(`arrows:${obj.originalIndex}`),
    ),
  }

  return {
    ...limitedCollections,
    totalFilteredObjects,
    totalDisplayedObjects: objectLimit,
    isLimitReached: true,
  }
}
