interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buttonClass =
    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white';

  return (
    <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Paginación">
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        Anterior
      </button>
      <span className="text-sm text-slate-600" aria-live="polite">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Siguiente
      </button>
    </nav>
  );
}
