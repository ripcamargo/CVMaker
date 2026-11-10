import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

interface FieldShellProps {
  label: string
  hint?: ReactNode
  optional?: boolean
  className?: string
  htmlFor: string
  children: ReactNode
}

function FieldShell({ label, hint, optional, className = '', htmlFor, children }: FieldShellProps) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={htmlFor}>
        {label}
        {optional && <span className="field-optional">opcional</span>}
      </label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}

type CommonProps = { label: string; hint?: ReactNode; optional?: boolean; className?: string }

export function TextField({
  label,
  hint,
  optional,
  className,
  value,
  onChange,
  ...rest
}: CommonProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value: string
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <FieldShell label={label} hint={hint} optional={optional} className={className} htmlFor={id}>
      <input id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  hint,
  optional,
  className,
  value,
  onChange,
  rows = 4,
  ...rest
}: CommonProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  value: string
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <FieldShell label={label} hint={hint} optional={optional} className={className} htmlFor={id}>
      <textarea
        id={id}
        className="input textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </FieldShell>
  )
}

export function SelectField<T extends string>({
  label,
  hint,
  optional,
  className,
  value,
  onChange,
  options,
}: CommonProps & {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  const id = useId()
  return (
    <FieldShell label={label} hint={hint} optional={optional} className={className} htmlFor={id}>
      <select id={id} className="input select" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

export function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  const id = useId()
  return (
    <div className="field check-field">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-track">
        <span className="switch-thumb" />
      </span>
      <span className="switch-label">{label}</span>
    </button>
  )
}
