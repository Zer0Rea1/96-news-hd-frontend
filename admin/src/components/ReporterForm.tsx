import { useRef, useState } from "react";

import {
  X,
  UploadSimple,
  ShieldCheck,
  ArrowRight,
} from "@phosphor-icons/react";
import { reporterSchema, type Reporter, type ReporterInput } from "../domain";
import { request } from "../api";
import { Avatar, ErrorMessage } from "./common";
const initial: ReporterInput = {
  name: "",
  serial_number: "",
  father_name: "",
  designation: "Reporter",
  city: "",
  cnic: "",
  contact: "",
  whatsapp: "",
  address: "",
  issue_date: new Date().toISOString().slice(0, 10),
  expiry_date: `${new Date().getUTCFullYear() + 1}-12-31`,
  status: "draft",
  show_sensitive: false,
  photo_url: "",
};
const fields: {
  name: keyof ReporterInput;
  label: string;
  placeholder?: string;
  type?: string;
}[] = [
  { name: "name", label: "Full name", placeholder: "e.g. Ahmed Raza" },
  { name: "serial_number", label: "Serial number", placeholder: "Optional, e.g. 96-00042" },
  {
    name: "father_name",
    label: "Father’s name",
    placeholder: "Full name of father",
  },
  {
    name: "designation",
    label: "Designation",
    placeholder: "e.g. Senior Reporter",
  },
  { name: "city", label: "Designated city", placeholder: "e.g. Lahore" },
  { name: "cnic", label: "CNIC number", placeholder: "12345-1234567-1" },
  {
    name: "contact",
    label: "Contact number",
    placeholder: "+92 300 1234567",
    type: "tel",
  },
  {
    name: "whatsapp",
    label: "WhatsApp number",
    placeholder: "+92 300 1234567",
    type: "tel",
  },
  { name: "address", label: "Address", placeholder: "Street, area and city" },
  { name: "issue_date", label: "Issue date", type: "date" },
  { name: "expiry_date", label: "Expiry date", type: "date" },
];
export default function ReporterForm({
  reporter,
  onClose,
  onSave,
}: {
  reporter?: Reporter;
  onClose: () => void;
  onSave: (input: ReporterInput, id?: string) => Promise<void>;
}) {
  const [form, setForm] = useState<ReporterInput>(() =>
    reporter
      ? (Object.fromEntries(
          Object.keys(initial).map((k) => [
            k,
            reporter[k as keyof ReporterInput] ?? initial[k as keyof ReporterInput],
          ]),
        ) as ReporterInput)
      : initial,
  );
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setError("Choose a JPG, PNG, or WebP image smaller than 8 MB.");
      return;
    }
    setUploading(true);
    try {
      const { default: imageCompression } =
        await import("browser-image-compression");
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1000,
        // Avoid the compressor's default third-party worker script download.
        useWebWorker: false,
        fileType: "image/webp",
      });
      const body = new FormData();
      body.append("photo", compressed, "portrait.webp");
      const result = await request<{ url: string }>("/admin/photos", {
        method: "POST",
        body,
      });
      setForm((old) => ({ ...old, photo_url: result.url }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = reporterSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await onSave(parsed.data, reporter?.id);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="drawer-header">
        <div className="section-label">REPORTER DIRECTORY</div>
        <button
          className="icon-button"
          onClick={onClose}
          disabled={busy || uploading}
          aria-label="Close form"
        >
          <X size={22} />
        </button>
        <h2>{reporter ? "Edit reporter" : "Add a reporter"}</h2>
        <p>
          {reporter
            ? "Keep their details and press credentials up to date."
            : "Create a profile. Connect it to their press card."}
        </p>
      </header>
      <form onSubmit={submit} noValidate className="reporter-form">
        <div className="photo-upload">
          <Avatar
            reporter={{
              name: form.name || "New Reporter",
              photo_url: form.photo_url,
            }}
          />
          <div>
            <strong>Profile photograph</strong>
            <p>JPG, PNG or WebP. Up to 8 MB.</p>
          </div>
          <button
            type="button"
            className="button secondary compact"
            disabled={uploading || busy}
            onClick={() => fileInput.current?.click()}
          >
            <UploadSimple size={16} />
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="visually-hidden"
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </div>
        <div className="form-grid">
          {fields.map((field) => (
            <div
              className={`field ${field.name === "address" ? "full-width" : ""}`}
              key={field.name}
            >
              <label htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={String(form[field.name])}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={
                  errors[field.name] ? `${field.name}-error` : undefined
                }
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                required={field.name !== "serial_number"}
                maxLength={field.name === "address" ? 500 : 100}
              />
              {errors[field.name] && (
                <span className="field-error" id={`${field.name}-error`}>
                  {errors[field.name]?.[0]}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="field">
          <label htmlFor="credential-status">Credential status</label>
          <select
            id="credential-status"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as ReporterInput["status"],
              })
            }
          >
            <option value="draft">Draft · not publicly visible</option>
            <option value="active">Active · published profile</option>
            <option value="revoked">Revoked · authorization withdrawn</option>
          </select>
        </div>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.show_sensitive}
            onChange={(e) =>
              setForm({ ...form, show_sensitive: e.target.checked })
            }
          />
          <span>
            Show CNIC and address on the public profile
            <small>
              Anyone scanning this card will be able to see these details.
            </small>
          </span>
        </label>
        <div className="form-note">
          <ShieldCheck size={20} />
          <span>
            All other profile details are public once the credential is
            published.
          </span>
        </div>
        <ErrorMessage message={error} />
        <footer className="form-footer">
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
            disabled={busy || uploading}
          >
            Cancel
          </button>
          <button
            className="button primary"
            type="submit"
            disabled={busy || uploading}
          >
            {busy ? "Saving…" : reporter ? "Save changes" : "Create profile"}
            <ArrowRight size={17} />
          </button>
        </footer>
      </form>
    </>
  );
}
