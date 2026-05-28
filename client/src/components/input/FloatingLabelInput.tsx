import type { ChangeEventHandler, FC, InputHTMLAttributes } from 'react';

interface FloatingLabelInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  errors?: string | string[];
}

const FloatingLabelInput: FC<FloatingLabelInputProps> = ({
  label,
  errors,
  className = '',
  ...props
}) => {
  const errorText = Array.isArray(errors) ? errors[0] : errors;

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`.trim()}
        {...props}
      />
      {errorText && (
        <span className="mt-1 block text-xs text-red-600">{errorText}</span>
      )}
    </label>
  );
};

export default FloatingLabelInput;
