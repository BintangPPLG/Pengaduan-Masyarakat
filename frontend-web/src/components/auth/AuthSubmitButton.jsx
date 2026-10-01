import { Loader2 } from 'lucide-react';

function AuthSubmitButton({ loading, text }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6FCF97] to-[#56B97E] text-sm font-semibold text-white shadow-[0_10px_28px_rgba(111,207,151,0.3)] transition hover:-translate-y-0.5 hover:brightness-[1.05] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {loading ? 'Memproses...' : text}
    </button>
  );
}

export default AuthSubmitButton;

