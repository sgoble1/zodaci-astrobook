import type { ReactNode } from 'react';

/** Classic outer frame shared by real members and the isolated public demo. */
export function ClassicFrame({ children }: { children: ReactNode }) {
  return <div className="member-experience relative flex min-h-screen flex-col text-foreground">{children}</div>;
}