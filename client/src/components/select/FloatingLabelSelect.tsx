import type {
  ChangeEventHandler,
  FC,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';

interface FloatingLabelSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  errors?: string | string[];
  children: ReactNode;
}

const FloatingLabelSelect: FC<FloatingLabelSelectProps> = ({
  label,
  errors,
  className = '',
  children,
  ...props
}) => {
  const errorText = Array.isArray(errors) ? errors[0] : errors;

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <select
        className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
      {errorText && (
        <span className="mt-1 block text-xs text-red-600">{errorText}</span>
      )}
    </label>
  );
};

export default FloatingLabelSelect;
