"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icons";
import { Overlay } from "./ui";

type Toast = { id: number; text: string; tone: "ok" | "bad" };
type ConfirmOpts = { title: string; text?: string; confirmLabel?: string; danger?: boolean };

type Ctx = {
  toast: (text: string, tone?: Toast["tone"]) => void;
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
};

const FeedbackContext = createContext<Ctx | null>(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used inside <FeedbackProvider>");
  return ctx;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const nextId = useRef(1);

  const toast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const confirm = useCallback(
    (opts: ConfirmOpts) => new Promise<boolean>((resolve) => setDialog({ ...opts, resolve })),
    [],
  );

  const close = (v: boolean) => {
    dialog?.resolve(v);
    setDialog(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="a-anim-pop pointer-events-auto flex items-center gap-2.5 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-xl"
          >
            <span className={`grid h-5 w-5 place-items-center rounded-full ${t.tone === "ok" ? "bg-ok" : "bg-bad"}`}>
              <Icon name={t.tone === "ok" ? "check" : "alert"} size={12} />
            </span>
            {t.text}
          </div>
        ))}
      </div>

      <Overlay
        open={!!dialog}
        onClose={() => close(false)}
        variant="modal"
        title={dialog?.title ?? ""}
        footer={
          <>
            <button type="button" className="a-btn a-btn-outline" onClick={() => close(false)}>Cancel</button>
            <button type="button" className={`a-btn ${dialog?.danger ? "a-btn-danger-solid" : "a-btn-primary"}`} onClick={() => close(true)}>
              {dialog?.confirmLabel ?? "Confirm"}
            </button>
          </>
        }
      >
        {dialog?.text && <p className="text-muted">{dialog.text}</p>}
      </Overlay>
    </FeedbackContext.Provider>
  );
}
