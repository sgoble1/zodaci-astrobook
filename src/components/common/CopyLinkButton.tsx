import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

interface Props {
  /** Hash-fragment (without the `#`) or full path. If omitted, copies the current URL. */
  hash?: string;
  path?: string;
  label?: string;
  className?: string;
}

/** One-line "copy deep link" button. Uses the current origin + path unless
 *  `path` is provided; appends `#hash` if given. */
export function CopyLinkButton({ hash, path, label, className }: Props) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const base = window.location.origin + (path ?? window.location.pathname);
    const url = base + (hash ? `#${hash}` : '');
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard may be unavailable in some contexts — fall back to select
      window.prompt('Copy this link', url);
    }
  };

  return (
    <button
      onClick={onClick}
      aria-label="Copy shareable link"
      className={`inline-flex items-center gap-1.5 text-[10px] font-smallcaps tracking-wider text-muted-foreground hover:text-gold transition-colors ${className ?? ''}`}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Link2 className="w-3 h-3" />}
      {copied ? 'Link copied' : (label ?? 'Copy link')}
    </button>
  );
}
