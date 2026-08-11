interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

/** Píldora de filtro compartida por el listado de reportes y el muro. */
export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`chip ${active ? 'chip-activo' : 'chip-inactivo'}`}
    >
      {label}
    </button>
  );
}
