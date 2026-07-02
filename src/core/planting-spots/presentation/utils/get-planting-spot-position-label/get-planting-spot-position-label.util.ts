type PositionInput = {
  row?: number | null;
  column?: number | null;
};

export function getPlantingSpotPositionLabel({ row, column }: PositionInput): string | null {
  if (row != null && column != null) return `F${row} · C${column}`;
  if (row != null) return `F${row}`;
  if (column != null) return `C${column}`;
  return null;
}
