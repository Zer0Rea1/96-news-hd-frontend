import { useState } from "react";
import { X, ArrowClockwise } from "@phosphor-icons/react";
import { renewalSchema, type RenewalInput, type Reporter } from "../domain";
import { ErrorMessage, formatDate } from "./common";

export default function RenewDialog({ reporter, onSave, onClose }: {
  reporter: Reporter;
  onSave: (input: RenewalInput) => Promise<void>;
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<RenewalInput>(() => {
    const expiry = new Date(Math.max(Date.parse(today), Date.parse(reporter.expiry_date)));
    expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);
    return { issue_date: today, expiry_date: expiry.toISOString().slice(0, 10) };
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string[] | undefined>>({});
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = renewalSchema.safeParse(form);
    if (!parsed.success) {
      setFields(parsed.error.flatten().fieldErrors);
      return;
    }
    setFields({});
    if (parsed.data.expiry_date <= reporter.expiry_date || parsed.data.expiry_date < today) {
      setError("Choose an expiry date after the current expiry and on or after today.");
      return;
    }
    setBusy(true);
    try {
      await onSave(parsed.data);
      onClose();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="renew-dialog" onSubmit={submit} noValidate>
      <div className="modal-heading">
        <div>
          <span className="section-label">CREDENTIAL RENEWAL</span>
          <h2>Renew {reporter.name}?</h2>
        </div>
        <button type="button" className="icon-button" aria-label="Close renewal" disabled={busy} onClick={onClose}><X size={22} /></button>
      </div>
      <p>Current expiry: <strong>{formatDate(reporter.expiry_date)}</strong></p>
      <p>Confirm this reporter is authorized for the new dates. Their Serial ID, profile link and QR code stay the same.</p>
      <div className="form-grid">
        {(["issue_date", "expiry_date"] as const).map(name => (
          <div className="field" key={name}>
            <label htmlFor={`renew-${name}`}>{name === "issue_date" ? "New issue date" : "New expiry date"}</label>
            <input
              id={`renew-${name}`}
              type="date"
              required
              value={form[name]}
              aria-invalid={Boolean(fields[name])}
              aria-describedby={fields[name] ? `renew-${name}-error` : undefined}
              disabled={busy}
              onChange={event => setForm({ ...form, [name]: event.target.value })}
            />
            {fields[name] && <span className="field-error" id={`renew-${name}-error`}>{fields[name]?.[0]}</span>}
          </div>
        ))}
      </div>
      <ErrorMessage message={error} />
      <div className="card-actions">
        <button type="button" className="button secondary" disabled={busy} onClick={onClose}>Cancel</button>
        <button className="button primary" disabled={busy}><ArrowClockwise size={17} />{busy ? "Renewing…" : "Confirm renewal"}</button>
      </div>
    </form>
  );
}
