export function StepItem({
  numero,
  titre,
  description,
}: {
  numero: string;
  titre: string;
  description: string;
}) {
  return (
    <article>
      <span>{numero}</span>
      <div>
        <h3>{titre}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
