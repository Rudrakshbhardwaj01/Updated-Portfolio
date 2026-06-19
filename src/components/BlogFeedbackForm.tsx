"use client";

import { useState, type FormEvent } from "react";

type BlogFeedbackFormProps = {
  blogTitle: string;
  blogSlug: string;
  blogUrl: string;
};

type FormFields = {
  name: string;
  email: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.name.trim()) errors.name = "Name is required.";
  if (!fields.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(fields.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!fields.message.trim()) errors.message = "Message is required.";
  return errors;
}

const emptyFields: FormFields = { name: "", email: "", message: "" };

export function BlogFeedbackForm({
  blogTitle,
  blogSlug,
  blogUrl,
}: BlogFeedbackFormProps) {
  const [fields, setFields] = useState<FormFields>(emptyFields);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [charCount, setCharCount] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
          blogTitle,
          blogSlug,
          blogUrl,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setFields(emptyFields);
      setErrors({});
      setCharCount(0);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function updateField<K extends keyof FormFields>(key: K, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    if (key === "message") setCharCount(value.length);
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
    if (status === "success" || status === "error") setStatus("idle");
  }

  return (
    <section
      className="mt-16 max-w-[42rem] font-mono"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .fb-headline {
          font-family: 'IM Fell English', serif;
          font-size: 2.75rem;
          font-weight: 400;
          font-style: italic;
          line-height: 1.2;
        }
        .fb-lede p {
          font-size: 16px;
          line-height: 2;
          letter-spacing: 0.02em;
        }
        .fb-kicker {
          font-family: 'IM Fell English', serif;
          font-style: italic;
          font-size: 30px;
          line-height: 1.4;
          font-weight: 400;
          margin-top: 1.5rem;
        }
        .fb-input-base {
          display: block;
          width: 100%;
          box-sizing: border-box;
          background: transparent;
          border: none;
          border-bottom: 1px solid;
          border-radius: 0;
          padding: 0.5rem 0;
          font-size: 16px;
          font-family: 'DM Mono', monospace;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none;
        }
        .fb-input-base::placeholder {
          font-weight: 300;
        }
        .fb-textarea-base {
          display: block;
          width: 100%;
          box-sizing: border-box;
          background: transparent;
          border: 1px solid;
          border-radius: 0;
          padding: 0.875rem 1rem;
          font-size: 16px;
          font-family: 'DM Mono', monospace;
          font-weight: 300;
          line-height: 1.9;
          resize: vertical;
          min-height: 140px;
          outline: none;
          transition: border-color 0.2s;
        }
        .fb-textarea-base::placeholder {
          font-weight: 300;
        }
        .fb-submit {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0.65rem 1.25rem;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          font-weight: 400;
          background: transparent;
          color: var(--foreground);
          border-color: var(--border);
        }
        .fb-submit:hover {
          background: var(--foreground);
          color: var(--background);
          border-color: var(--foreground);
        }
      `}</style>

      <hr className="mb-10 border-t border-border" />

      <h2 className="fb-headline mb-8 text-foreground">Leave a note.</h2>

      <div className="fb-lede mb-10">
        <p className="text-secondary">Found an error?</p>
        <p className="text-secondary">Have a question?</p>
        <p className="text-secondary">Want to continue the discussion?</p>
        <p className="fb-kicker text-foreground">
          I&apos;d love to hear your thoughts.
        </p>
      </div>

      <hr className="mb-8 border-t border-border" />

      {status === "success" ? (
        <p
          className="py-6 text-base text-secondary"
          style={{
            fontFamily: "'IM Fell English', serif",
            fontStyle: "italic",
            fontSize: "18px",
            lineHeight: "4",
          }}
        >
          Your note has been received. Thank you for reading.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* Name + Email side by side */}
          <div className="mb-8 grid grid-cols-2 gap-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="feedback-name"
                  className="text-[10px] uppercase tracking-[0.16em] text-secondary"
                >
                  Name
                </label>
              </div>
              <input
                id="feedback-name"
                name="name"
                type="text"
                value={fields.name}
                onChange={(e) => updateField("name", e.target.value)}
                autoComplete="name"
                placeholder="Your name"
                className="fb-input-base border-border text-primary placeholder:text-secondary focus:border-foreground"
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-secondary">{errors.name}</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="feedback-email"
                  className="text-[10px] uppercase tracking-[0.16em] text-secondary"
                >
                  Email
                </label>
              </div>
              <input
                id="feedback-email"
                name="email"
                type="email"
                value={fields.email}
                onChange={(e) => updateField("email", e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className="fb-input-base border-border text-primary placeholder:text-secondary focus:border-foreground"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-secondary">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="feedback-message"
                className="text-[10px] uppercase tracking-[0.16em] text-secondary"
              >
                Message
              </label>
              <span className="text-[10px] text-secondary/40">
                {charCount} / 1200
              </span>
            </div>
            <textarea
              id="feedback-message"
              name="message"
              rows={5}
              maxLength={1200}
              value={fields.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Write your thoughts…"
              className="fb-textarea-base border-border text-primary placeholder:text-secondary focus:border-foreground"
            />
            {errors.message && (
              <p className="mt-1 text-[11px] text-secondary">
                {errors.message}
              </p>
            )}
          </div>

          {status === "error" && (
            <p className="mb-4 text-[11px] tracking-[0.04em] text-secondary">
              Something went wrong. Please try again.
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-[0.04em] text-secondary/60">
              Replies to the email you provide
            </span>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="fb-submit border border-border text-foreground transition-all duration-200 hover:bg-foreground hover:text-background hover:border-foreground hover:shadow-none disabled:opacity-40"
            >
              {status === "submitting" ? "Sending…" : "Send →"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
