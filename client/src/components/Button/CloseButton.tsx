import type { ButtonHTMLAttributes, FC } from 'react';

interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  onClose: () => void;
}

const CloseButton: FC<CloseButtonProps> = ({
  label,
  onClose,
  className = '',
  ...props
}) => (
  <button
    type="button"
    onClick={onClose}
    className={`rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 ${className}`.trim()}
    {...props}
  >
    {label}
  </button>
);

export default CloseButton;
