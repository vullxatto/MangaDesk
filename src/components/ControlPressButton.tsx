import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ControlPressButtonProps = {
  wrapClassName?: string
  buttonClassName?: string
  ariaLabel: string
  children: ReactNode
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onPointerDown' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuenow'>

export function ControlPressButton({
  wrapClassName,
  buttonClassName,
  ariaLabel,
  children,
  onClick,
  onPointerDown,
  ...ariaProps
}: ControlPressButtonProps) {
  return (
    <span className={['btn-press-wrap', 'btn-press-wrap--design', wrapClassName].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={['control-surface-btn', 'btn-press', buttonClassName].filter(Boolean).join(' ')}
        aria-label={ariaLabel}
        onClick={onClick}
        onPointerDown={onPointerDown}
        {...ariaProps}
      >
        {children}
      </button>
    </span>
  )
}
