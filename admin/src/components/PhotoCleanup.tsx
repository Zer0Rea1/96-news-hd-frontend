import { useState } from "react";
import { Trash } from "@phosphor-icons/react";
import { request } from "../api";
import { ErrorMessage } from "./common";

export default function PhotoCleanup() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function cleanup() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await request<{ deleted: number; failed: number }>("/admin/photos/cleanup", { method: "POST" });
      setMessage(`${result.deleted} unused ${result.deleted === 1 ? "photo" : "photos"} removed.${result.failed ? ` ${result.failed} could not be removed; try again later.` : ""}`);
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  return (
    <section className="directory-panel photo-cleanup" aria-label="Photo cleanup">
      <h2>Unused photos</h2>
      <p>Replaced and deleted profile photos are cleaned up automatically. You can also clear abandoned uploads here. Photos uploaded in the last 24 hours are kept so work in progress is protected.</p>
      <ErrorMessage message={error} />
      {message && <p role="status">{message}</p>}
      <button className="button secondary" disabled={busy} onClick={() => void cleanup()}><Trash size={17} />{busy ? "Cleaning up…" : "Clean up unused photos"}</button>
    </section>
  );
}
