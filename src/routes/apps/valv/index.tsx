import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/apps/valv/")({
  component: ValvRoute,
});

function ValvRoute() {
  return (
    <section className="page-column">
      <div className="card">
        <p className="kicker">Låst miniapp</p>
        <h1>Valv</h1>
        <p>Den här miniappen är låst bakom ett delat lösenord.</p>
      </div>
    </section>
  );
}
