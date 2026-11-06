import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Copy,
  DownloadSimple,
  X,
  Check,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { profileUrl, type Reporter } from "../domain";
import { Status, ErrorMessage } from "./common";
export default function QRCodeDialog({
  reporter,
  onClose,
}: {
  reporter: Reporter;
  onClose: () => void;
}) {
  const qr = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const url = profileUrl(reporter.id);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("Clipboard unavailable. Select and copy the profile URL below.");
    }
  }
  function download() {
    const canvas = qr.current?.querySelector("canvas");
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("The PNG could not be generated. Please try again.");
        return;
      }
      const object = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = object;
      a.download = `96news-${reporter.card_number}-qr.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(object), 1000);
    }, "image/png");
  }

  return (
    <div className="qr-dialog">
      <div className="modal-heading">
        <div>
          <span className="section-label">REPORTER PROFILE</span>
          <h2>{reporter.name}</h2>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close QR code"
        >
          <X size={22} />
        </button>
      </div>
      <div className="qr-export" ref={qr}>
        <QRCodeCanvas
          value={url}
          size={1024}
          level="M"
          marginSize={4}
          role="img"
          aria-label={`Profile QR code for ${reporter.name}`}
        />
      </div>
      <div className="qr-status">
        <Status reporter={reporter} />
        <span>Reporter ID: 96-{reporter.card_number}</span>
      </div>
      {reporter.status === "draft" && (
        <p className="notice">
          Publish this reporter before distributing the QR code. Draft profiles
          are private.
        </p>
      )}
      <label className="field">
        Permanent profile URL
        <input readOnly value={url} onFocus={(e) => e.target.select()} />
      </label>
      <div className="card-actions">
        <button className="button secondary" onClick={() => void copy()}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button className="button primary" onClick={download}>
          <DownloadSimple size={17} />
          Download PNG
        </button>
      </div>
      <p className="qr-help">
        Send this high-resolution PNG to your card designer. Keep the white
        margin and the QR code’s proportions when placing it on the card.
      </p>
      <ErrorMessage message={error} />
      <a
        className="text-link"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        Open public profile
        <ArrowUpRight size={16} />
      </a>
    </div>
  );
}
