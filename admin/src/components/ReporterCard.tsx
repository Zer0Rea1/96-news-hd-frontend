import { QRCodeSVG } from "qrcode.react";
import { User } from "@phosphor-icons/react";
import { credentialStatus, profileUrl, type PublicReporter } from "../domain";
import { profileText, type ProfileLanguage } from "../profile-language";

export default function ReporterCard({ reporter, language }: {
  reporter: PublicReporter;
  language: ProfileLanguage;
}) {
  const t = profileText[language];
  const status = credentialStatus(reporter);
  const serial = reporter.serial_number || "—";
  const url = profileUrl(reporter.id);
  return (
    <section className="reporter-card-section" aria-label={t.pressCard}>
      <h2>{t.pressCard}</h2>
      <svg width="0" height="0" aria-hidden="true" className="press-card-filter">
        <defs>
          <filter id="press-authority-ink" colorInterpolationFilters="sRGB">
            {/* Keep blue authority ink while removing the red portrait guides and white background. */}
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4 0 4 0 0" />
          </filter>
        </defs>
      </svg>
      <div className="press-card-pair" dir="ltr">
        <div className="press-card-face press-card-front" role="group" aria-label={t.cardFront}>
          <div className="press-card-portrait">
            {reporter.photo_url ? (
              <img src={reporter.photo_url} alt={reporter.name} loading="lazy" />
            ) : <User size={72} weight="light" aria-label={t.noPhoto} />}
          </div>
          <span className="press-card-authority" aria-hidden="true" />
          <div className="press-card-identity">
            <strong className={`press-card-name ${reporter.name.length > 40 ? "press-card-name-long" : ""}`} title={reporter.name}>{reporter.name}</strong>
            <span className="press-card-father" title={reporter.father_name}>{t.father}: {reporter.father_name}</span>
            <strong className="press-card-designation" title={reporter.designation}>{reporter.designation}</strong>
            <span className="press-card-city" title={reporter.city}>{reporter.city}</span>
          </div>
          <span className="press-card-serial" title={serial}>{serial}</span>
          <a className="press-card-qr" href={url} aria-label={t.cardQr}>
            <QRCodeSVG
            value={url}
            size={256}
            level="M"
            marginSize={4}
            role="img"
            aria-label={t.cardQr}
            />
          </a>
          {status !== "active" && <span className="press-card-state">{t[status]}</span>}
        </div>
        <div className="press-card-face press-card-back" role="group" aria-label={t.cardBack}>
          <span className="press-card-back-value press-card-cnic" aria-label={t.cnic}>{reporter.cnic || t.privateData}</span>
          <span className="press-card-back-value press-card-phone" aria-label={t.contact}>{reporter.contact}</span>
          <span className="press-card-back-value press-card-validity" aria-label={`${t.issued} / ${t.expires}`}>{reporter.issue_date} — {reporter.expiry_date}</span>
          <span className="press-card-back-value press-card-address" aria-label={t.address} title={reporter.address}>{reporter.address || t.privateData}</span>
          {status !== "active" && <span className="press-card-state">{t[status]}</span>}
        </div>
      </div>
    </section>
  );
}
