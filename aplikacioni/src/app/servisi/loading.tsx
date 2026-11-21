// Brenda layout-it të stafit: shiriti i poshtëm mbetet, vetëm përmbajtja shfaq skeletin.
export default function Duke() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <div className="skeleton skeleton--title" style={{ marginTop: 52 }} />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--card" />
      <div className="skeleton skeleton--card" />
      <div className="skeleton skeleton--card" />
    </main>
  );
}
