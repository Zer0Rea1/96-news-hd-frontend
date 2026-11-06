import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import {
  UsersThree,
  IdentificationCard,
  ArrowUpRight,
  Plus,
  MagnifyingGlass,
  CaretDown,
  CaretLeft,
  CaretRight,
  DotsThree,
  PencilSimple,
  QrCode,
  Trash,
  SignOut,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  ContactlessPayment,
  X,
  List,
  ArrowClockwise,
  Globe,
  ShareNetwork,
} from "@phosphor-icons/react";
import { configured, supabase, request, loadReporters } from "./api";
import {
  credentialStatus,
  expiringSoon,
  publicReporter,
  profileUrl,
  type Reporter,
  type ReporterInput,
  type RenewalInput,
} from "./domain";
import {
  Avatar,
  Brand,
  ErrorMessage,
  Status,
  formatDate,
} from "./components/common";
import Dialog from "./components/Dialog";
import ReporterForm from "./components/ReporterForm";
import QRCodeDialog from "./components/QRCodeDialog";
import RenewDialog from "./components/RenewDialog";
import ActivityLog from "./components/ActivityLog";
import BulkQRCodeDialog from "./components/BulkQRCodeDialog";
import { ProfileContent } from "./components/Profile";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError(
        "The workspace has not been connected. Ask your administrator to configure Supabase.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <aside className="login-story">
        <Brand light />
        <div>
          <span className="section-label">96 NEWS HD / PRESSROOM</span>
          <h1>
            Behind every story,
            <br />a trusted identity.
          </h1>
          <p>
            The people who report the news deserve credentials that speak for
            themselves.
          </p>
        </div>
        <span className="login-bottom">
          <ShieldCheck size={20} />
          Official News access
        </span>
      </aside>
      <main className="login-main">
        <div className="login-form">
          <span className="section-label">WELCOME BACK</span>
          <h2>Enter the pressroom.</h2>
          <p>Sign in to manage your reporters and credentials.</p>
          <form onSubmit={submit}>
            <label className="field">
              Email address
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="field">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <ErrorMessage message={error} />
            {!configured && (
              <p className="notice">
                Admin sign-in is unavailable until the Supabase publishable key
                is configured.
              </p>
            )}
            <button className="button primary" disabled={busy || !configured}>
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="login-help">
            Access is limited to the 96 News HD owner account.
          </div>
        </div>
      </main>
    </div>
  );
}
function Admin({ session }: { session: Session | null }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ownerChecked, setOwnerChecked] = useState(false);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<
    "new" | "edit" | "qr" | "profile" | "delete" | "renew" | "bulk-qr" | null
  >(null);
  const [selected, setSelected] = useState<Reporter | undefined>();
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState("");
  async function reload() {
    setLoading(true);
    setError("");
    try {
      setReporters(await loadReporters());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    request<{ owner: boolean }>("/admin/session", { signal: controller.signal }).then(result => {
      if (controller.signal.aborted) return;
      setIsAdmin(result.owner === true);
      if (result.owner) void reload();
    }).catch(failure => {
      if (!controller.signal.aborted) setError((failure as Error).message);
    }).finally(() => {
      if (!controller.signal.aborted) setOwnerChecked(true);
    });
    return () => controller.abort();
  }, [session?.access_token]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    document.addEventListener("click", close);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", key);
    };
  }, [menu]);
  async function save(input: ReporterInput, id?: string) {
    const row = await request<Reporter>(
      `/admin/reporters${id ? `/${id}` : ""}`,
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(input),
      },
    );
    setReporters(
      id ? reporters.map((r) => (r.id === id ? row : r)) : [row, ...reporters],
    );
    setSelected(row);
    setToast(id ? "Reporter details updated." : "Reporter profile created.");
  }
  async function remove() {
    if (!selected) return;
    setDeleting(true);
    setModalError("");
    try {
      await request(`/admin/reporters/${selected.id}`, { method: "DELETE" });
      setReporters(reporters.filter((r) => r.id !== selected.id));
      setSelected(undefined);
      setModal(null);
      setToast("Reporter deleted. Their card link is now unavailable.");
    } catch (e) {
      setModalError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }
  async function renew(input: RenewalInput) {
    if (!selected) return;
    const row = await request<Reporter>(`/admin/reporters/${selected.id}/renew`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    setReporters(current => current.map(reporter => reporter.id === row.id ? row : reporter));
    setSelected(row);
    setToast("Credential renewed. Their profile link and QR code stay the same.");
  }
  async function sharePublicUrl(reporter: Reporter) {
    setMenu(null);
    const url = profileUrl(reporter.id);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${reporter.name} | 96 News HD`, url });
        setToast("Public profile link shared.");
      } else {
        await navigator.clipboard.writeText(url);
        setToast("Public profile URL copied.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setError(
          "Could not share the link. You can copy it from Generate QR code.",
        );
    }
  }
  function open(kind: typeof modal, row?: Reporter) {
    setSelected(row);
    setModal(kind);
    setModalError("");
    setMenu(null);
  }
  function closeModal() {
    if (!deleting) setModal(null);
  }
  const counts = {
    all: reporters.length,
    active: reporters.filter((r) => credentialStatus(r) === "active").length,
    expired: reporters.filter((r) => credentialStatus(r) === "expired").length,
    draft: reporters.filter((r) => r.status === "draft").length,
    expiring: reporters.filter((r) => expiringSoon(r)).length,
  };
  const filtered = reporters.filter(
    (r) =>
      `${r.name} ${r.designation} ${r.city} ${r.card_number} ${r.serial_number ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "all" || (filter === "expiring" ? expiringSoon(r) : credentialStatus(r) === filter)) &&
      (city === "all" || r.city === city),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * 6, currentPage * 6);
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <Link to="/admin" className="brand-link">
          <Brand />
        </Link>
        <button
          className="mobile-close icon-button"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <div className="workspace-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <NavLink to="/admin" end onClick={() => setMobileMenu(false)}>
            <UsersThree size={21} />
            Reporters<span className="nav-count">{counts.all}</span>
          </NavLink>
          <NavLink to="/admin/activity" onClick={() => setMobileMenu(false)}>
            <Clock size={21} />
            Activity log
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="nfc-sidebar">
            <ContactlessPayment size={28} />
            <h3>A card that stays current.</h3>
            <p>
              Download a reporter’s QR code from their actions menu and share it
              with your card designer.
            </p>
          </div>
          <div className="workspace-user">
            <div className="user-avatar">N</div>
            <div>
              <strong>96 News HD</strong>
              <span>News administration</span>
            </div>
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <div className="mobile-backdrop" onClick={() => setMobileMenu(false)} />
      )}
      <div className="workspace">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              <List size={23} />
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span> <strong>Pressroom</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="connection connected">
              <span />
              Connected workspace
            </span>
            {configured && (
              <button
                className="icon-button"
                aria-label="Sign out"
                onClick={() => {
                  void supabase!.auth.signOut().then(({ error }) => {
                    if (error) setError(error.message);
                  });
                }}
              >
                <SignOut size={21} />
              </button>
            )}
            <div
              className="admin-avatar"
              title={session?.user.email || "Administrator"}
            >
              AD
            </div>
          </div>
        </header>
        <main id="main" className="main-content">
          {!ownerChecked ? <div className="loading" role="status">Checking owner access…</div> : !isAdmin ? (
            <div className="empty-state">
              <ShieldCheck size={40} />
              <h1>Administrator access required</h1>
              <p>
                This workspace is limited to the existing 96 News HD owner account.
              </p>
            </div>
          ) : (
            <>
              <ErrorMessage message={error} />
              {error && (
                <button
                  className="button secondary"
                  onClick={() => void reload()}
                >
                  <ArrowClockwise />
                  Try again
                </button>
              )}
              <Routes>
                <Route
                  index
                  element={
                    <>
                      <div className="page-heading directory-heading">
                        <div>
                          <div className="section-label">
                            YOUR PEOPLE. YOUR CREDIBILITY.
                          </div>
                          <h1>
                            Reporter directory<span>.</span>
                          </h1>
                          <p>Manage the people who represent 96 News HD.</p>
                        </div>
                        <div className="directory-heading-actions">
                        <button className="button secondary" disabled={loading || !reporters.length} onClick={() => open("bulk-qr")}>
                          <QrCode size={18} />
                          Bulk QR download
                        </button>
                        <button
                          className="button primary"
                          onClick={() => open("new")}
                        >
                          <Plus size={18} />
                          Add reporter
                        </button>
                        </div>
                      </div>
                      <div className="stats-grid">
                        {[
                          {
                            label: "Total reporters",
                            value: counts.all,
                            icon: UsersThree,
                            text: "Across your News team",
                            filter: "all",
                          },
                          {
                            label: "Active credentials",
                            value: counts.active,
                            icon: ShieldCheck,
                            text: "Authorized to report",
                            filter: "active",
                          },
                          {
                            label: "Expired credentials",
                            value: counts.expired,
                            icon: Clock,
                            text: "Ready for renewal",
                            filter: "expired",
                          },
                          {
                            label: "Draft profiles",
                            value: counts.draft,
                            icon: IdentificationCard,
                            text: "Not yet published",
                            filter: "draft",
                          },
                        ].map((stat) => (
                          <button
                            className={`stat ${stat.filter === filter ? "stat-selected" : ""}`}
                            key={stat.label}
                            onClick={() => {
                              setFilter(stat.filter);
                              setPage(1);
                            }}
                          >
                            <div className="stat-top">
                              <span>{stat.label}</span>
                              <stat.icon size={20} />
                            </div>
                            <strong>
                              {loading
                                ? "…"
                                : String(stat.value).padStart(2, "0")}
                            </strong>
                            <span className="stat-caption">
                              {stat.text}
                              <ArrowUpRight size={14} />
                            </span>
                          </button>
                        ))}
                      </div>
                      {!loading && counts.expiring > 0 && (
                        <aside className="expiry-notice" aria-label="Expiry reminders">
                          <Clock size={22} />
                          <div><strong>{counts.expiring} {counts.expiring === 1 ? "credential expires" : "credentials expire"} within 30 days</strong><p>Review and renew these credentials before they expire.</p></div>
                          <button className="button secondary compact" onClick={() => { setFilter("expiring"); setPage(1); }}>Review expiring credentials</button>
                        </aside>
                      )}
                      <div className="directory-grid">
                        <section
                          className="directory-panel"
                          aria-label="Reporter directory"
                        >
                          <div className="panel-heading">
                            <div>
                              <h2>
                                All reporters <span>{filtered.length}</span>
                              </h2>
                              <p>Your team’s credentials, at a glance.</p>
                            </div>
                            <button
                              className="icon-button"
                              onClick={() => void reload()}
                              aria-label="Refresh reporters"
                            >
                              <ArrowClockwise size={18} />
                            </button>
                          </div>
                          <div className="directory-tools">
                            <label className="search-field">
                              <MagnifyingGlass size={18} />
                              <input
                                aria-label="Search reporters"
                                placeholder="Search name, city or card ID…"
                                value={search}
                                onChange={(e) => {
                                  setSearch(e.target.value);
                                  setPage(1);
                                }}
                              />
                              {search && (
                                <button
                                  className="icon-button"
                                  aria-label="Clear search"
                                  onClick={() => setSearch("")}
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </label>
                            <label className="select-wrap">
                              <MapIcon />
                              <select
                                aria-label="Filter by city"
                                value={city}
                                onChange={(e) => {
                                  setCity(e.target.value);
                                  setPage(1);
                                }}
                              >
                                <option value="all">All cities</option>
                                {[...new Set(reporters.map((r) => r.city))]
                                  .sort()
                                  .map((c) => (
                                    <option key={c}>{c}</option>
                                  ))}
                              </select>
                              <CaretDown size={13} />
                            </label>
                          </div>
                          <div
                            className="filter-tabs"
                            role="group"
                            aria-label="Filter by credential status"
                          >
                            {[
                              "all",
                              "active",
                              "expiring",
                              "expired",
                              "draft",
                              "revoked",
                              "scheduled",
                            ].map((s) => (
                              <button
                                key={s}
                                className={filter === s ? "selected" : ""}
                                onClick={() => {
                                  setFilter(s);
                                  setPage(1);
                                }}
                              >
                                {s === "all"
                                  ? "All reporters"
                                  : s === "expiring" ? "Expiring soon"
                                  : s[0].toUpperCase() + s.slice(1)}
                              </button>
                            ))}
                          </div>
                          <div className="table-scroll">
                            <table>
                              <thead>
                                <tr>
                                  <th>REPORTER</th>
                                  <th>CITY</th>
                                  <th>STATUS</th>
                                  <th>EXPIRY DATE</th>
                                  <th>
                                    <span className="visually-hidden">
                                      Actions
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {!loading &&
                                  visible.map((r) => (
                                    <tr key={r.id}>
                                      <td>
                                        <button
                                          className="reporter-name"
                                          onClick={() => open("profile", r)}
                                        >
                                          <Avatar reporter={r} />
                                          <span>
                                            <strong>{r.name}</strong>
                                            <small>
                                              {r.designation}
                                              <span className="card-id">
                                                96-{r.card_number}
                                              </span>
                                            </small>
                                          </span>
                                        </button>
                                      </td>
                                      <td className="city-cell">{r.city}</td>
                                      <td>
                                        <Status reporter={r} />
                                      </td>
                                      <td className="date-cell">
                                        {formatDate(r.expiry_date)}
                                        {expiringSoon(r) && <small className="expiring-label">Expires within 30 days</small>}
                                      </td>
                                      <td className="row-action">
                                        <button
                                          className="icon-button"
                                          aria-label={`Actions for ${r.name}`}
                                          aria-expanded={menu === r.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setMenu(
                                              menu === r.id ? null : r.id,
                                            );
                                          }}
                                        >
                                          <DotsThree size={23} weight="bold" />
                                        </button>
                                        {menu === r.id && (
                                          <div className="action-menu">
                                            <button
                                              onClick={() => open("edit", r)}
                                            >
                                              <PencilSimple />
                                              Edit
                                            </button>
                                            {r.status === "active" && (
                                              <button onClick={() => open("renew", r)}>
                                                <ArrowClockwise />
                                                Renew credentials
                                              </button>
                                            )}
                                            <button
                                              onClick={() => open("qr", r)}
                                            >
                                              <QrCode />
                                              Generate QR code
                                            </button>
                                            <button
                                              onClick={() =>
                                                void sharePublicUrl(r)
                                              }
                                            >
                                              <ShareNetwork />
                                              Share public URL
                                            </button>
                                            <button
                                              className="danger-text"
                                              onClick={() => open("delete", r)}
                                            >
                                              <Trash />
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                          {loading ? (
                            <div className="loading" role="status">
                              Loading your News…
                            </div>
                          ) : !visible.length ? (
                            <div className="empty-state">
                              <MagnifyingGlass size={32} />
                              <h3>
                                {reporters.length
                                  ? "No matching reporters"
                                  : "Your News team starts here."}
                              </h3>
                              <p>
                                {reporters.length
                                  ? "Try another name, city or credential status."
                                  : "Add your first reporter to create their digital credential."}
                              </p>
                              <button
                                className="button secondary"
                                onClick={() =>
                                  reporters.length
                                    ? (setSearch(""),
                                      setFilter("all"),
                                      setCity("all"))
                                    : open("new")
                                }
                              >
                                {reporters.length
                                  ? "Clear filters"
                                  : "Add reporter"}
                              </button>
                            </div>
                          ) : null}
                          <div className="table-footer">
                            <span>
                              {filtered.length
                                ? `${(currentPage - 1) * 6 + 1}-${Math.min(currentPage * 6, filtered.length)} of ${filtered.length} reporters`
                                : "0 reporters"}
                            </span>
                            <div>
                              <button
                                className="icon-button"
                                aria-label="Previous page"
                                disabled={currentPage === 1}
                                onClick={() => setPage(currentPage - 1)}
                              >
                                <CaretLeft size={16} />
                              </button>
                              <span>
                                {currentPage} / {totalPages}
                              </span>
                              <button
                                className="icon-button"
                                aria-label="Next page"
                                disabled={currentPage === totalPages}
                                onClick={() => setPage(currentPage + 1)}
                              >
                                <CaretRight size={16} />
                              </button>
                            </div>
                          </div>
                        </section>
                      </div>
                      <div className="workspace-footer">
                        <ShieldCheck size={16} />
                        <span>Official identities. Managed with care.</span>
                        <span>96 News HD Pressroom</span>
                      </div>
                    </>
                  }
                />
                <Route path="activity" element={<ActivityLog />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle size={21} weight="fill" />
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <Dialog
          label={
            modal === "new"
              ? "Add reporter"
              : modal === "edit"
                ? "Edit reporter"
                : modal === "delete"
                  ? "Delete reporter"
                  : modal === "renew"
                    ? "Renew credentials"
                    : modal === "bulk-qr"
                      ? "Bulk QR download"
                  : modal === "profile"
                    ? "Reporter profile preview"
                    : "Reporter QR code"
          }
          drawer={modal === "new" || modal === "edit"}
          wide={modal === "profile" || modal === "bulk-qr"}
          onClose={closeModal}
        >
          {modal === "new" || modal === "edit" ? (
            <ReporterForm
              reporter={modal === "edit" ? selected : undefined}
              onSave={save}
              onClose={closeModal}
            />
          ) : modal === "bulk-qr" ? (
            <BulkQRCodeDialog reporters={reporters} onClose={closeModal} />
          ) : selected && modal === "renew" ? (
            <RenewDialog reporter={selected} onSave={renew} onClose={closeModal} />
          ) : selected && modal === "qr" ? (
            <QRCodeDialog reporter={selected} onClose={closeModal} />
          ) : selected && modal === "profile" ? (
            <div className="profile-modal">
              <div className="preview-toolbar">
                <span>PROFILE PREVIEW</span>
                <div>
                  <button
                    className="button secondary compact"
                    onClick={() => setModal("edit")}
                  >
                    <PencilSimple size={16} />
                    Edit
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Close preview"
                    onClick={closeModal}
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>
              <ProfileContent reporter={publicReporter(selected)} preview />
            </div>
          ) : selected && modal === "delete" ? (
            <div className="delete-dialog">
              <span className="delete-icon">
                <Trash size={28} />
              </span>
              <h2>Delete {selected.name}?</h2>
              <p>
                This permanently removes the profile. Their QR code and NFC card
                will open an unavailable page. To keep the record, change their
                status to revoked instead.
              </p>
              <ErrorMessage message={modalError} />
              <div className="card-actions">
                <button
                  className="button secondary"
                  onClick={closeModal}
                  disabled={deleting}
                >
                  Keep reporter
                </button>
                <button
                  className="button danger"
                  onClick={() => void remove()}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
            </div>
          ) : null}
        </Dialog>
      )}
    </div>
  );
}
function MapIcon() {
  return <Globe size={16} />;
}
export default function AdminEntry() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(configured);
  useEffect(() => {
    if (!supabase) return;
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setChecking(false);
      })
      .catch(() => setChecking(false));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setChecking(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return checking ? (
    <div className="loading full-loading">Opening the pressroom…</div>
  ) : !session ? (
    <Login />
  ) : (
    <Admin key={session.user.id} session={session} />
  );
}
