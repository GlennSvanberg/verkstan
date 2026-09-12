import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Home,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import styles from "./index.module.css";
import { DesignsystemViewTabs, useDesignsystemState } from "./shared";

export const Route = createFileRoute("/apps/designsystem/patterns")({
  component: DesignSystemPatternsRoute,
});

function DesignSystemPatternsRoute() {
  const state = useDesignsystemState();

  return (
    <section className={styles.workspaceRoot} data-theme={state.canvasTheme} style={state.skinVariables}>
      <div className={styles.workspaceInner}>
        <header className={`${styles.panel} ${styles.sectionHeaderPanel}`}>
          <p className={styles.kicker}>Fiwe Product Design System</p>
          <div className={styles.headerTitleRow}>
            <h1>Patterns</h1>
            <span className={styles.markBadge}>Komponerade layouter</span>
          </div>
          <p className={styles.lead}>
            Så här kombineras nav, tabeller och CTA-struktur i verkliga Fiwe-ytor — med samma skin
            och tokens som i övriga views.
          </p>
          <DesignsystemViewTabs activeView="patterns" />
          <div className={styles.heroMeta}>
            <span>Skin: {state.skin.label}</span>
            <span>Primär: {state.activePrimary}</span>
            <span>Tema: {state.canvasTheme === "light" ? "Ljust" : "Mörkt"}</span>
          </div>
        </header>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>App shell — tät arbetsyta</h2>
          <div className={styles.patternShell}>
            <aside className={styles.patternSidebar}>
              <span className={styles.markBadge}>Fiwe Workspace</span>
              <button type="button" className={`${styles.navItem} ${styles.navItemActive}`}>
                <Home size={18} />
                Översikt
              </button>
              <button type="button" className={styles.navItem}>
                <LayoutGrid size={18} />
                Objekt
              </button>
              <button type="button" className={styles.navItem}>
                <Settings size={18} />
                Regler
              </button>
              <button type="button" className={styles.navItem}>
                <Sparkles size={18} />
                Agentjobb
              </button>
            </aside>

            <div className={styles.patternMain}>
              <div className={styles.patternTopbar}>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                  <Search size={16} />
                  Sök artikel
                </button>
                <div className={styles.patternTopbarActions}>
                  <button type="button" className={`${styles.button} ${styles.iconButton}`}>
                    <Bell size={18} />
                  </button>
                  <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                    <Plus size={16} />
                    Ny artikel
                  </button>
                </div>
              </div>

              <div className={styles.patternColumns}>
                <article className={styles.patternCard}>
                  <h3>Arbetslista</h3>
                  <ul className={styles.patternList}>
                    <li>
                      <span>Nordics lansering / 14 objekt</span>
                      <ChevronRight size={16} />
                    </li>
                    <li>
                      <span>Media QA / 6 blockerare</span>
                      <ChevronRight size={16} />
                    </li>
                    <li>
                      <span>PIM-sync / 2 fel</span>
                      <ChevronRight size={16} />
                    </li>
                  </ul>
                </article>
                <article className={styles.patternCard}>
                  <h3>Snabbinsikter</h3>
                  <p className={styles.ruleLine}>
                    Topbaren hålls kort så operatören ser tabell och status utan modalflöden.
                  </p>
                  <div className={styles.statusLegend}>
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>Aktiv</span>
                    <span className={`${styles.badge} ${styles.badgeWarning}`}>Utkast</span>
                    <span className={`${styles.badge} ${styles.badgeDanger}`}>Fel</span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>Tomt läge + primär CTA</h2>
          <div className={styles.emptyStatePattern}>
            <p className={styles.kicker}>Inställningar / exportkanal</p>
            <h3>Ingen kanal kopplad ännu</h3>
            <p className={styles.ruleLine}>
              Fiwe visar först varför sidan är tom och ger därefter en tydlig primärknapp för nästa
              steg i onboarding.
            </p>
            <div className={styles.emptyStateActions}>
              <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                <Plus size={16} />
                Koppla första kanal
              </button>
              <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                Se kravlista
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
