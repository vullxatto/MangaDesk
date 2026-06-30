import type { ButtonHTMLAttributes, ReactNode } from 'react'

type PressActionButtonProps = {
  children: ReactNode
  wrapClassName?: string
  buttonClassName?: string
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'disabled' | 'type' | 'aria-expanded' | 'aria-label'
>

export function PressActionButton({
  children,
  wrapClassName,
  buttonClassName,
  onClick,
  disabled,
  type = 'button',
  ...rest
}: PressActionButtonProps) {
  return (
    <span
      className={['btn-press-wrap', 'btn-press-wrap--design', 'dashboard-press-wrap', wrapClassName]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type={type}
        className={['btn-cabinet', 'btn-press', 'dashboard-press-btn', buttonClassName].filter(Boolean).join(' ')}
        onClick={onClick}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    </span>
  )
}
