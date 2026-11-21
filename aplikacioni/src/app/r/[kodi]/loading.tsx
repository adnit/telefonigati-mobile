export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <div className="skeleton skeleton--brand" />
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--card" style={{ height: 220 }} />
      <div className="skeleton skeleton--card" />
    </main>
  );
}
