import { useEffect, useState } from 'react';
import { productBrand, userAgreementPoints } from '../../constants/branding';
import type { UserRecord } from '../../types/domain';

const agreementVersion = '2026-02';

function agreementKey(user: UserRecord) {
  return `rollouthq:user-agreement:${agreementVersion}:${user.email || user.role}`;
}

export function UserAgreementDialog({ user }: { user: UserRecord | null }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsVisible(false);
      return;
    }

    setIsVisible(localStorage.getItem(agreementKey(user)) !== 'accepted');
  }, [user]);

  if (!user || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur-md">
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-[1.75rem] border border-white/10 bg-slate-950 p-6 shadow-[0_32px_120px_rgba(0,0,0,0.42)]">
        <p className="text-xs uppercase tracking-[0.32em] text-teal-200">User agreement</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Before using {productBrand.name}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">By using this platform you acknowledge that:</p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-200">
          {userAgreementPoints.map((point) => (
            <li key={point} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(agreementKey(user), 'accepted');
            setIsVisible(false);
          }}
          className="sticky bottom-0 mt-6 rounded-2xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
        >
          I acknowledge and continue
        </button>
      </section>
    </div>
  );
}