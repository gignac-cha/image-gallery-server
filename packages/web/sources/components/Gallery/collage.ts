import type { MediaFile } from '../../types.ts';

const GRID_UNIT = 16;
const BASE_ROW_HEIGHT = 240;

export interface TileLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface CollageLayout {
  tiles: TileLayout[];
  totalHeight: number;
}

function aspectRatio(item: MediaFile): number {
  const w = item.width ?? 400;
  const h = item.height ?? 300;
  return w / h;
}

function normalize(value: number): number {
  return Math.round(value / GRID_UNIT) * GRID_UNIT;
}

export function computeCollageLayout(
  media: MediaFile[],
  containerWidth: number,
): CollageLayout {
  if (media.length === 0) return { tiles: [], totalHeight: 0 };

  const tiles: TileLayout[] = [];
  let currentY = 0;
  let i = 0;
  let rowNumber = 0;

  while (i < media.length) {
    const rowStart = i;
    let testWidth = 0;

    // Determine how many tiles fit in this row at BASE_ROW_HEIGHT
    while (i < media.length) {
      const tileWidth = normalize(BASE_ROW_HEIGHT * aspectRatio(media[i]));

      if (testWidth + tileWidth > containerWidth && i > rowStart) {
        break;
      }

      testWidth += tileWidth;
      i++;
    }

    const rowEnd = i;

    // Compute justified row height so tiles fill container width
    let aspectSum = 0;
    for (let j = rowStart; j < rowEnd; j++) {
      aspectSum += aspectRatio(media[j]);
    }

    // Last row with low fill: keep base height instead of stretching
    const isLastRow = rowEnd === media.length;
    const fillRatio = testWidth / containerWidth;
    const rowHeight =
      isLastRow && fillRatio < 0.6
        ? BASE_ROW_HEIGHT
        : containerWidth / aspectSum;

    const gridRowHeight = normalize(rowHeight);

    // Place each tile in the row
    let currentX = 0;
    for (let j = rowStart; j < rowEnd; j++) {
      const ar = aspectRatio(media[j]);
      const displayWidth = rowHeight * ar;
      const gridWidth = normalize(displayWidth);

      tiles.push({
        x: currentX,
        y: currentY,
        width: displayWidth,
        height: rowHeight,
        // Later rows always on top; within a row, alternate for depth
        zIndex: rowNumber * 2 + ((j - rowStart) % 2),
      });

      // Advance by grid slot → difference with displayWidth creates micro-overlap
      currentX += gridWidth;
    }

    currentY += gridRowHeight;
    rowNumber++;
  }

  return { tiles, totalHeight: currentY };
}
