import { useEffect, useRef, type ReactNode } from "react";
export default function Dialog({
  children,
  onClose,
  wide = false,
  drawer = false,
  label,
}: {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  drawer?: boolean;
  label: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={`dialog ${wide ? "dialog-wide" : ""} ${drawer ? "dialog-drawer" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === ref.current) closeRef.current();
      }}
    >
      {children}
    </dialog>
  );
}
