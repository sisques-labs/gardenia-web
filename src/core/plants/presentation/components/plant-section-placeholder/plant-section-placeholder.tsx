type Props = {
  title: string;
  inProgress: string;
};

export function PlantSectionPlaceholder({ title, inProgress }: Props) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-4">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{inProgress}</p>
    </div>
  );
}
