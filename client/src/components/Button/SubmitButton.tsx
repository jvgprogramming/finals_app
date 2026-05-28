import type { ButtonHTMLAttributes, FC } from 'react';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
}

const SubmitButton: FC<SubmitButtonProps> = ({
  label,
  loading = false,
  loadingLabel = 'Loading...',
  className = '',
  ...props
}) => (
  <button
    type="submit"
    disabled={loading || props.disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 ${className}`.trim()}
    {...props}
  >
    <span>{loading ? loadingLabel : label}</span>
  </button>
);

export default SubmitButton;
