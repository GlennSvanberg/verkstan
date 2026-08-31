import { Link, createFileRoute } from "@tanstack/react-router";
import { appRegistry } from "../lib/app-registry";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <section className="page-column">
      <div className="card">
        <p className="kicker">Miniapp-verkstad</p>
        <h1>Bygg små appar snabbt</h1>
        <p>
          Verkstan är Glenn Svanbergs personliga arbetsbänk för miniappar.
          Varje miniapp lever i en egen route-mapp, med egna Convex-funktioner
          och namngivna tabeller.
        </p>
      </div>

      <div className="card">
        <h2>Installerade miniappar</h2>
        <ul className="app-list">
          {appRegistry.map((app) => (
            <li key={app.slug} className="app-list-item">
              <div>
                <h3>
                  {app.name}
                  {app.isLocked ? <span className="app-lock-pill">Låst</span> : null}
                </h3>
                <p>{app.summary}</p>
              </div>
              <Link to={app.route as never} className="action-link">
                Öppna
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
