import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { QRCodeCanvas } from "qrcode.react";
import { DownloadSimple, X } from "@phosphor-icons/react";
import { credentialStatus, profileUrl, type Reporter } from "../domain";
import { ErrorMessage } from "./common";

export default function BulkQRCodeDialog({ reporters, onClose }: {
  reporters: Reporter[];
  onClose: () => void;
}) {
  const eligible = reporters.filter(reporter => credentialStatus(reporter) === "active");
  const [selected, setSelected] = useState(() => eligible.slice(0, 100).map(reporter => reporter.id));
  const [rendering, setRendering] = useState<Reporter | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const chosen = eligible.filter(reporter => selected.includes(reporter.id));
  async function download() {
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      const files: Record<string, Uint8Array> = {};
      for (const [index, reporter] of chosen.entries()) {
        if (!alive.current) return;
        // Commit one canvas at a time, keeping memory bounded during large exports.
        flushSync(() => setRendering(reporter));
        const blob = await new Promise<Blob>((resolve, reject) => {
          if (!canvas.current) { reject(new Error("The QR image could not be created.")); return; }
          canvas.current.toBlob(blob => blob ? resolve(blob) : reject(new Error("The QR image could not be created.")), "image/png");
        });
        files[`96news-${reporter.card_number}-qr.png`] = new Uint8Array(await blob.arrayBuffer());
        if (alive.current) setProgress(index + 1);
      }
      if (!alive.current) return;
      const { zipSync } = await import("fflate");
      if (!alive.current) return;
      const zip = zipSync(files, { level: 0 });
      const url = URL.createObjectURL(new Blob([new Uint8Array(zip)], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `96news-qr-codes-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      if (alive.current) setError((error as Error).message);
    } finally {
      if (alive.current) { setRendering(null); setBusy(false); }
    }
  }
  return (
    <div className="bulk-qr-dialog">
      <div className="modal-heading">
        <div><span className="section-label">FOR YOUR CARD DESIGNER</span><h2>Bulk QR download</h2></div>
        <button className="icon-button" aria-label="Close bulk QR download" disabled={busy} onClick={onClose}><X size={22} /></button>
      </div>
      <p>Select up to 100 active reporters. The ZIP contains a separate 1024px PNG for each reporter, with a white scanning margin.</p>
      <div className="bulk-qr-selection">
        <strong>{chosen.length} selected</strong>
        <button className="text-link" disabled={busy} onClick={() => setSelected(selected.length ? [] : eligible.slice(0, 100).map(reporter => reporter.id))}>{selected.length ? "Clear selection" : "Select up to 100"}</button>
      </div>
      <div className="bulk-qr-list">
        {eligible.length ? eligible.map(reporter => (
          <label key={reporter.id}>
            <input type="checkbox" aria-label={`Select ${reporter.name}`} checked={selected.includes(reporter.id)} disabled={busy || (!selected.includes(reporter.id) && selected.length >= 100)} onChange={event => setSelected(event.target.checked ? [...selected, reporter.id] : selected.filter(id => id !== reporter.id))} />
            <span><strong>{reporter.name}</strong><small>Serial ID: {reporter.serial_number || "—"} · Reporter ID: 96-{reporter.card_number}</small></span>
          </label>
        )) : <p>No active reporters are available for export.</p>}
      </div>
      <ErrorMessage message={error} />
      {busy && <p role="status">Preparing QR images: {progress} / {chosen.length}</p>}
      <button className="button primary" disabled={busy || !chosen.length} onClick={() => void download()}><DownloadSimple size={18} />{busy ? "Preparing ZIP…" : "Download QR ZIP"}</button>
      {rendering && <div className="bulk-qr-canvas" aria-hidden="true"><QRCodeCanvas ref={canvas} value={profileUrl(rendering.id)} size={1024} level="M" marginSize={4} /></div>}
    </div>
  );
}
