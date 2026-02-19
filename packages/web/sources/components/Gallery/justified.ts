import type { MediaFile } from "../../types.ts";

export interface TileLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export function computeJustifiedLayout(
  media: MediaFile[],
  containerWidth: number
): { tiles: TileLayout[]; totalHeight: number } {
  const targetRowHeight = 240;
  const gap = 4;

  const tiles: TileLayout[] = [];
  let y = 0;
  let index = 0;

  while (index < media.length) {
    // Greedily collect items for this row
    const rowStartIndex = index;
    let rowItemCount = 0;
    let totalAspectRatio = 0;

    // Add tiles until the next one would cause the row to exceed container width
    while (index < media.length) {
      const item = media[index];
      const aspectRatio = (item.width ?? 400) / (item.height ?? 300);
      const tileWidthAtTarget = aspectRatio * targetRowHeight;
      const gapSpace = rowItemCount > 0 ? gap : 0;
      const projectedWidth =
        (totalAspectRatio + aspectRatio) * targetRowHeight +
        rowItemCount * gap;

      // If adding this tile would exceed container width, decide whether to include it
      if (rowItemCount > 0 && projectedWidth > containerWidth) {
        break;
      }

      totalAspectRatio += aspectRatio;
      rowItemCount++;
      index++;
    }

    const isLastRow = index >= media.length;
    const totalGapWidth = (rowItemCount - 1) * gap;
    const availableWidth = containerWidth - totalGapWidth;

    // Determine the row height
    // Scale so that sum of tile widths at this height equals availableWidth
    // availableWidth = totalAspectRatio * rowHeight
    // rowHeight = availableWidth / totalAspectRatio
    let rowHeight: number;

    if (isLastRow) {
      // Check fill ratio: how much of the container would the row fill at target height?
      const widthAtTarget = totalAspectRatio * targetRowHeight + totalGapWidth;
      const fillRatio = widthAtTarget / containerWidth;

      if (fillRatio < 0.6) {
        // Less than 60% filled — keep target height, don't stretch
        rowHeight = targetRowHeight;
      } else {
        rowHeight = availableWidth / totalAspectRatio;
      }
    } else {
      rowHeight = availableWidth / totalAspectRatio;
    }

    // Lay out the tiles in this row
    let x = 0;
    for (let i = rowStartIndex; i < rowStartIndex + rowItemCount; i++) {
      const item = media[i];
      const aspectRatio = (item.width ?? 400) / (item.height ?? 300);
      const tileWidth = aspectRatio * rowHeight;

      tiles.push({
        x,
        y,
        width: tileWidth,
        height: rowHeight,
        zIndex: 0,
      });

      x += tileWidth + gap;
    }

    y += rowHeight + gap;
  }

  // totalHeight is the bottom edge of the last row (subtract trailing gap if tiles exist)
  const totalHeight = tiles.length > 0 ? y - gap : 0;

  return { tiles, totalHeight };
}
