export function StepItem({
  numero,
  titre,
  description,
  delai,
}: Readonly<{
  numero: string;
  titre: string;
  description: string;
  delai?: number;
}>) {
  return (
    <article data-revelation="droite" data-delai={delai}>
      <span>{numero}</span>
      <div>
        <h3>{titre}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
