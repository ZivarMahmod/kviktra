import { useState } from 'react';
import type { Email } from '../types';

interface EmailCardsProps {
  emails: Email[];
  loading: boolean;
}

export function EmailCards({ emails, loading }: EmailCardsProps) {
  const [copied, setCopied] = useState<number | null>(null);

  const copyEmail = async (email: Email, index: number) => {
    const text = `Ämne: ${email.subject}\n\n${email.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="font-condensed text-lg font-bold text-accent">Uppföljningsmejl</h2>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-6 text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span>Genererar uppföljningsmejl...</span>
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted">
        <p>Skapa en offert först för att generera uppföljningsmejl</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-condensed text-lg font-bold text-accent">Uppföljningsmejl</h2>
      {emails.map((email, i) => (
        <div key={i} className="card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent2/20 px-2 py-0.5 font-mono text-xs font-bold text-accent2">
                Dag {email.day}
              </span>
              <span className="text-sm font-medium">{email.subject}</span>
            </div>
            <button
              onClick={() => copyEmail(email, i)}
              className="btn-secondary text-xs"
            >
              {copied === i ? 'Kopierat!' : 'Kopiera'}
            </button>
          </div>
          <div className="p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
              {email.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
