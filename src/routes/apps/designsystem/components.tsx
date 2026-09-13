import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Settings,
} from "lucide-react";
import styles from "./index.module.css";
import { DesignsystemViewTabs, statusClassForRow, tableRows, useDesignsystemState } from "./shared";

export const Route = createFileRoute("/apps/designsystem/components")({
  component: DesignSystemComponentsRoute,
});

function DesignSystemComponentsRoute() {
  const state = useDesignsystemState();

  return (
    <section className={styles.workspaceRoot} data-theme={state.canvasTheme} style={state.skinVariables}>
      <div className={styles.workspaceInner}>
        <header className={`${styles.panel} ${styles.sectionHeaderPanel}`}>
          <p className={styles.kicker}>Fiwe Product Design System</p>
          <div className={styles.headerTitleRow}>
            <h1>Components</h1>
            <span className={styles.markBadge}>Template-layouter</span>
          </div>
          <p className={styles.lead}>
            Visuella exempel för knappar, formulär och tabeller. Regler fylls i senare.
          </p>
          <DesignsystemViewTabs activeView="components" />
          <div className={styles.heroMeta}>
            <span>Skin: {state.skin.label}</span>
            <span>Primär: {state.activePrimary}</span>
            <span>Tema: {state.canvasTheme === "light" ? "Ljust" : "Mörkt"}</span>
          </div>
        </header>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>Knappar i produktsammanhang</h2>
          <div className={styles.usageGrid}>
            <article className={styles.exampleCard}>
              <h3>Toolbar i artikelvyn</h3>
              <div className={styles.toolbarPattern}>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                  <ChevronDown size={18} />
                  Filter
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonGhost}`}>
                  Exportera
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  <Plus size={18} />
                  Ny artikel
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.iconButton}`}
                  aria-label="Toolbar-inställningar"
                >
                  <Settings size={18} />
                </button>
              </div>
              <p className={styles.ruleLine}>
                När: (fyll i).
              </p>
            </article>

            <article className={styles.exampleCard}>
              <h3>Footer för redigeringsformulär</h3>
              <div className={styles.formPattern}>
                <label htmlFor="button-pattern-name" className={styles.inputLabel}>
                  Artikelnamn
                </label>
                <input
                  id="button-pattern-name"
                  className={styles.textInput}
                  placeholder="Skriv artikelnamn..."
                />
                <label htmlFor="button-pattern-channel" className={styles.inputLabel}>
                  Kanal
                </label>
                <button id="button-pattern-channel" type="button" className={styles.selectButton}>
                  Alla kanaler
                  <ChevronDown size={18} />
                </button>
                <div className={styles.formFooterSplit}>
                  <button type="button" className={`${styles.button} ${styles.buttonGhost}`}>
                    Avbryt
                  </button>
                  <div className={styles.formFooterActions}>
                    <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                      Spara utkast
                    </button>
                    <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                      <Save size={18} />
                      Publicera
                    </button>
                  </div>
                </div>
              </div>
              <p className={styles.ruleLine}>
                Regel: (fyll i).
              </p>
            </article>

            <article className={styles.exampleCard}>
              <h3>Destruktivt steg</h3>
              <div className={styles.dangerPattern}>
                <div className={styles.dangerCallout}>
                  <AlertTriangle size={18} />
                  Radering påverkar publicerad data.
                </div>
                <div className={styles.destructiveRow}>
                  <button type="button" className={`${styles.button} ${styles.buttonDanger}`}>
                    Ta bort artikel
                  </button>
                  <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                    Bekräfta manuellt
                  </button>
                </div>
              </div>
              <p className={styles.ruleLine}>
                Låst: Danger är inte samma sak som primary.
              </p>
            </article>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>Tabeller + semantiska badges</h2>
          <div className={styles.componentStack}>
            <article className={styles.exampleCard}>
              <div className={styles.statusLegend}>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Success</span>
                <span className={`${styles.badge} ${styles.badgeWarning}`}>Warning</span>
                <span className={`${styles.badge} ${styles.badgeDanger}`}>Danger</span>
                <span className={`${styles.badge} ${styles.badgeInfo}`}>Info</span>
                <span className={`${styles.badge} ${styles.badgeNeutral}`}>Neutral</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.sortableHeader}>
                        Objekt
                        <ArrowUpDown size={14} />
                      </th>
                      <th>Status</th>
                      <th>Ansvarig</th>
                      <th>Senast</th>
                      <th>Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr
                        key={row.name}
                        className={row.isSelected ? styles.tableRowSelected : undefined}
                      >
                        <td>{row.name}</td>
                        <td>
                          <span className={`${styles.badge} ${statusClassForRow(row.status, styles)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td>{row.owner}</td>
                        <td>{row.updated}</td>
                        <td>
                          <div className={styles.tableActionRow}>
                            <button
                              type="button"
                              className={styles.rowAction}
                              aria-label={`Visa ${row.name}`}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className={styles.rowAction}
                              aria-label={`Redigera ${row.name}`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className={styles.rowAction}
                              aria-label={`Fler val för ${row.name}`}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.tableFooter}>
                <span>Tomt läge: (fyll i text + nästa steg).</span>
                <div className={styles.paginationRow}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSm}`}
                  >
                    Föregående
                  </button>
                  <span>Sida 2 / 8</span>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSm}`}
                  >
                    Nästa
                  </button>
                </div>
              </div>
              <p className={styles.ruleLine}>
                Undvik: (fyll i).
              </p>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}
