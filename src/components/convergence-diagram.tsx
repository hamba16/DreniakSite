import { Mark } from "./brand";

export function ConvergenceDiagram({
  items,
  caption,
}: {
  items: string[];
  caption?: string;
}) {
  return (
    <div
      className="convergence convergence-arcs"
      role="img"
      aria-label={`${items.join(", ")} converging into shared intelligence`}
    >
      <div className="convergence-stage" aria-hidden="true">
        {items.map((item, i) => (
          <div className={`convergence-layer layer-${i + 1}`} key={item}>
            <Mark stroke />
          </div>
        ))}
        <Mark className="convergence-final-mark" />
      </div>
      <div className="convergence-labels">
        {items.map((item, i) => (
          <span key={item}>
            <b>0{i + 1}</b>
            {item}
          </span>
        ))}
      </div>
      {caption && <p>{caption}</p>}
    </div>
  );
}
