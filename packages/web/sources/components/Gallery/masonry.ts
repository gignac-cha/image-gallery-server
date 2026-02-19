import type { MediaFile } from "../../types.ts";

export interface TileLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface MasonryResult {
  tiles: TileLayout[];
  totalHeight: number;
}

const DEFAULT_COLUMN_COUNT = 4;
const GAP = 12;

export function computeMasonryLayout(
  media: MediaFile[],
  containerWidth: number,
  columnCount: number = DEFAULT_COLUMN_COUNT,
): MasonryResult {
  const totalGapWidth = GAP * (columnCount - 1);
  const columnWidth = (containerWidth - totalGapWidth) / columnCount;

  // Track the current height of each column.
  const columnHeights = new Array<number>(columnCount).fill(0);

  const tiles: TileLayout[] = media.map((item) => {
    // Find the shortest column.
    let shortestIndex = 0;
    for (let i = 1; i < columnCount; i++) {
      if (columnHeights[i] < columnHeights[shortestIndex]) {
        shortestIndex = i;
      }
    }

    const originalWidth = item.width ?? 400;
    const originalHeight = item.height ?? 300;
    const aspectRatio = originalHeight / originalWidth;

    const tileWidth = columnWidth;
    const tileHeight = tileWidth * aspectRatio;

    const x = shortestIndex * (columnWidth + GAP);
    const y = columnHeights[shortestIndex];

    // Advance the column height, adding a gap for the next tile.
    columnHeights[shortestIndex] = y + tileHeight + GAP;

    return {
      x,
      y,
      width: tileWidth,
      height: tileHeight,
      zIndex: 0,
    };
  });

  // Total height is the tallest column, minus the trailing gap.
  const maxHeight = Math.max(...columnHeights);
  const totalHeight = media.length > 0 ? maxHeight - GAP : 0;

  return { tiles, totalHeight };
}
