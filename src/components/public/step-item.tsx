export function StepItem({
  number,
  title,
  description,
  delay,
}: Readonly<{
  number: string;
  title: string;
  description: string;
  delay?: number;
}>) {
  return (
    <article data-reveal="droite" data-delai={delay}>
      <span>{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
