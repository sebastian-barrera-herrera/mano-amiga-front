import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ id, label, required, help, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && (
          <span className="ml-1 text-rojo-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {help && !error && (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-slate-500">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-rojo-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function controlClass(error?: string, extra = ''): string {
  return ['field-control', error ? 'field-control-error' : '', extra].filter(Boolean).join(' ');
}

function describedBy(id: string, help?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (help) return `${id}-help`;
  return undefined;
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> &
  Omit<FieldProps, 'children'> & { id: string };

export function TextInput({ id, label, required, help, error, ...rest }: TextInputProps) {
  return (
    <Field id={id} label={label} required={required} help={help} error={error}>
      <input
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        className={controlClass(error)}
        {...rest}
      />
    </Field>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  Omit<FieldProps, 'children'> & { id: string };

export function TextArea({ id, label, required, help, error, rows = 4, ...rest }: TextAreaProps) {
  return (
    <Field id={id} label={label} required={required} help={help} error={error}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        className={controlClass(error, 'resize-y')}
        {...rest}
      />
    </Field>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> &
  Omit<FieldProps, 'children'> & { id: string; options: string[]; placeholder?: string };

export function Select({
  id,
  label,
  required,
  help,
  error,
  options,
  placeholder,
  ...rest
}: SelectProps) {
  return (
    <Field id={id} label={label} required={required} help={help} error={error}>
      <select
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        className={controlClass(error, 'appearance-none bg-white pr-10')}
        {...rest}
      >
        <option value="">{placeholder ?? 'Selecciona'}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}
