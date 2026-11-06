import { profileText, type ProfileLanguage } from "../profile-language";
import ReporterCard from "./ReporterCard";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Phone,
  WhatsappLogo,
  ShieldCheck,
  MapPin,
  UserPlus,
  Prohibit,
} from "@phosphor-icons/react";
import { request } from "../api";
import { credentialStatus, whatsappUrl, type PublicReporter } from "../domain";
import {
  Avatar,
  Brand,
  ErrorMessage,
  Status,
  TrustNote,
  formatDate,
} from "./common";
export function ProfileContent({
  reporter,
  preview = false,
  language = "en",
}: {
  reporter: PublicReporter;
  preview?: boolean;
  language?: ProfileLanguage;
}) {
  const t = profileText[language];
  const status = credentialStatus(reporter);
  const valid = status === "active";
  return (
    <article className={`profile-card ${preview ? "profile-preview" : ""}`}>
      <div className="profile-masthead">
        <Brand light />
        <span>{t.credential}</span>
      </div>
      <div className="profile-main">
        <div className="profile-photo">
          <Avatar reporter={reporter} large />
          <span className="photo-number">
            {t.serialNumber} / <bdi dir="ltr">{reporter.serial_number || "—"}</bdi>
          </span>
        </div>
        <div className="profile-identity">
          <Status reporter={reporter} language={language} />
          <h1>{reporter.name}</h1>
          <p>{reporter.designation}</p>
          <span className="profile-city">
            <MapPin size={16} />
            {reporter.city}, {t.country}
          </span>
        </div>
      </div>
      <div
        className={`verification-banner ${valid ? "" : "verification-warning"}`}
      >
        {valid ? <ShieldCheck size={22} /> : <Prohibit size={22} />}
        <div>
          <strong>
            {valid
              ? t.authorized
              : t[
                  `${status}Credential` as
                    | "expiredCredential"
                    | "draftCredential"
                    | "revokedCredential"
                    | "scheduledCredential"
                ]}
          </strong>
          <p>{valid ? t.valid : t.invalid}</p>
        </div>
      </div>
      <div className="profile-details">
        <div className="section-label">{t.personal}</div>
        <dl>
          {reporter.serial_number && (
            <div>
              <dt>{t.serialNumber}</dt>
              <dd dir="ltr">{reporter.serial_number}</dd>
            </div>
          )}
          <div>
            <dt>{t.father}</dt>
            <dd>{reporter.father_name}</dd>
          </div>
          <div>
            <dt>{t.city}</dt>
            <dd>{reporter.city}</dd>
          </div>
          {reporter.cnic && (
            <div>
              <dt>{t.cnic}</dt>
              <dd dir="ltr">{reporter.cnic}</dd>
            </div>
          )}
          <div>
            <dt>{t.contact}</dt>
            <dd dir="ltr">{reporter.contact}</dd>
          </div>
          {reporter.address && (
            <div className="full-width">
              <dt>{t.address}</dt>
              <dd>{reporter.address}</dd>
            </div>
          )}
          <div>
            <dt>{t.issued}</dt>
            <dd>{formatDate(reporter.issue_date, language)}</dd>
          </div>
          <div>
            <dt>{t.expires}</dt>
            <dd>{formatDate(reporter.expiry_date, language)}</dd>
          </div>
        </dl>
      </div>
      {valid && (
        <div className="profile-contact">
          <a className="button primary" href={`tel:${reporter.contact}`}>
            <Phone size={18} />
            {t.call}
          </a>
          <a
            className="button secondary"
            href={whatsappUrl(reporter.whatsapp)}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsappLogo size={19} />
            {t.whatsapp}
            <ArrowUpRight size={16} />
          </a>
          <a
            className="save-contact"
            href={`/api/profiles/${reporter.id}/contact.vcf`}
          >
            <UserPlus size={17} />
            {t.save}
          </a>
        </div>
      )}
      <TrustNote language={language} />
    </article>
  );
}
export default function Profile() {
  const { id } = useParams();
  const [language, setLanguage] = useState<ProfileLanguage>("en");
  const t = profileText[language];
  const [reporter, setReporter] = useState<PublicReporter | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setReporter(null);
    setError("");
    const load = async () => {
      try {
        const row = await request<PublicReporter>(`/profiles/${id}`);
        if (alive) setReporter(row);
      } catch (e) {
        if (alive) setError((e as Error).message);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [id]);
  return (
    <div
      className="public-page"
      lang={language}
      dir={language === "ur" ? "rtl" : "ltr"}
    >
      <header className="public-header">
        <Brand />
        <div className="public-header-actions">
          <button
            className="language-toggle"
            type="button"
            aria-label={
              language === "en" ? "Switch to Urdu" : "Switch to English"
            }
            lang={language === "en" ? "ur" : "en"}
            onClick={() => setLanguage(language === "en" ? "ur" : "en")}
          >
            {language === "en" ? "اردو" : "English"}
          </button>
        </div>
      </header>
      <main className="public-main">
        {error ? (
          <div className="public-error">
            <h1>{t.unavailable}</h1>
            <ErrorMessage
              message={language === "ur" ? t.unavailableMessage : error}
            />
            <Link className="button secondary" to="/admin">
              <ArrowLeft />
              {t.back}
            </Link>
          </div>
        ) : reporter ? (
          <>
            <ProfileContent reporter={reporter} language={language} />
            <ReporterCard reporter={reporter} language={language} />
          </>
        ) : (
          <div className="loading" role="status">
            {t.loading}
          </div>
        )}
      </main>
      <footer className="public-footer">
        96 NEWS HD<span>{t.footer}</span>
      </footer>
    </div>
  );
}
