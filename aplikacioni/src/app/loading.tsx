// Skeleti shfaqet menjëherë gjatë leximit nga serveri, në vend të një ekrani bosh.
export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <div className="skeleton skeleton--brand" />
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--card" />
      <div className="skeleton skeleton--card" />
    </main>
  );
}
