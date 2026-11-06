import { useEffect, useState } from "react";
import { ArrowClockwise, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { request } from "../api";
import { ErrorMessage } from "./common";
import PhotoCleanup from "./PhotoCleanup";

interface Activity {
  id: string;
  created_at: string;
  actor_id: string;
  actor_email: string;
  reporter_id: string;
  reporter_name: string;
  serial_number: string;
  action: "created" | "updated" | "revoked" | "renewed" | "deleted";
  changed_fields: string[];
}
const actionLabels = { created: "Created", updated: "Updated", revoked: "Revoked", renewed: "Renewed", deleted: "Deleted" };
export default function ActivityLog() {
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    void request<{ activities: Activity[]; total: number }>(`/admin/activity?page=${page}`)
      .then(data => { if (alive) { setActivities(data.activities); setTotal(data.total); } })
      .catch(error => { if (alive) setError((error as Error).message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [page, refresh]);
  const pages = Math.max(1, Math.ceil(total / 50));
  return (
    <>
      <div className="page-heading">
        <div><div className="section-label">ACCOUNTABILITY</div><h1>Activity log</h1><p>Who changed a credential, when, and which fields changed.</p></div>
        <button className="button secondary" disabled={loading} onClick={() => setRefresh(value => value + 1)}><ArrowClockwise size={17} />Refresh activity</button>
      </div>
      <section className="directory-panel activity-panel" aria-label="Admin activity log">
        <ErrorMessage message={error} />
        {loading ? <div className="loading" role="status">Loading activity…</div> : error ? (
          <button className="button secondary" onClick={() => setRefresh(value => value + 1)}>Try again</button>
        ) : !activities.length ? <div className="empty-state"><h2>No activity yet</h2><p>Reporter changes made after activity logging was enabled will appear here.</p></div> : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>WHEN</th><th>ADMINISTRATOR</th><th>ACTION</th><th>REPORTER</th><th>FIELDS CHANGED</th></tr></thead>
              <tbody>{activities.map(activity => (
                <tr key={activity.id}>
                  <td><time dateTime={activity.created_at}>{new Date(activity.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</time></td>
                  <td>{activity.actor_email || activity.actor_id}</td>
                  <td>{actionLabels[activity.action]}</td>
                  <td><strong>{activity.reporter_name}</strong><small className="activity-serial">Serial ID: {activity.serial_number || "—"}</small></td>
                  <td className="activity-fields">{activity.changed_fields.map(field => field.replaceAll("_", " ")).join(", ") || "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>{total} recorded {total === 1 ? "change" : "changes"}</span>
          <div>
            <button className="icon-button" aria-label="Previous activity page" disabled={loading || page === 1} onClick={() => setPage(value => value - 1)}><CaretLeft size={16} /></button>
            <span>{page} / {pages}</span>
            <button className="icon-button" aria-label="Next activity page" disabled={loading || page >= pages} onClick={() => setPage(value => value + 1)}><CaretRight size={16} /></button>
          </div>
        </div>
      </section>
      <PhotoCleanup />
    </>
  );
}
