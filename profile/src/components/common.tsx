import { profileText, type ProfileLanguage } from "../profile-language";
import {
  CheckCircle,
  Clock,
  Prohibit,
  FileText,
  ShieldCheck,
  User,
  Phone,
} from "@phosphor-icons/react";
import {
  credentialStatus,
  type PublicReporter,
  type ReporterInput,
} from "../domain";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`} dir="ltr">
      <img
        className="brand-logo"
        src="/96news.webp"
        alt="96 News HD"
        width={49}
        height={49}
      />
      <div className="brand-copy">
        PRESSROOM<span>Credential management</span>
      </div>
    </div>
  );
}
export function Status({
  reporter,
  language = "en",
}: {
  reporter: Pick<ReporterInput, "status" | "issue_date" | "expiry_date">;
  language?: ProfileLanguage;
}) {
  const status = credentialStatus(reporter);
  const Icon = {
    active: CheckCircle,
    expired: Clock,
    draft: FileText,
    revoked: Prohibit,
    scheduled: Clock,
  }[status];
  return (
    <span className={`status status-${status}`}>
      <Icon size={14} weight="fill" />
      {profileText[language][status]}
    </span>
  );
}
export function Avatar({
  reporter,
  large = false,
}: {
  reporter: Pick<PublicReporter, "name" | "photo_url">;
  large?: boolean;
}) {
  return (
    <div className={`avatar ${large ? "avatar-large" : ""}`}>
      {reporter.photo_url ? (
        <img
          src={reporter.photo_url}
          alt={reporter.name}
          loading={large ? "eager" : "lazy"}
          width={large ? 144 : 44}
          height={large ? 144 : 44}
        />
      ) : large ? (
        <User size={72} weight="light" aria-label="No portrait uploaded" />
      ) : (
        <span aria-hidden="true">
          {reporter.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </span>
      )}
    </div>
  );
}
export function TrustNote({ language = "en" }: { language?: ProfileLanguage }) {
  const t = profileText[language];
  return (
    <div className="trust-note">
      <ShieldCheck size={20} />
      <p>
        {t.issuedBy} <strong>96 News HD</strong>
        <span>{t.trust}</span>
        <a className="newsroom-contact" href="tel:+923008687435">
          <Phone size={14} />
          {t.officialContact}
          <bdi dir="ltr">0300 8687435</bdi>
        </a>
      </p>
    </div>
  );
}
export function formatDate(value: string, language: ProfileLanguage = "en") {
  return new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p className="error-message" role="alert">
      {message}
    </p>
  ) : null;
}
