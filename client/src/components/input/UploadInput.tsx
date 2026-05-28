import type { ChangeEventHandler, FC } from 'react';

interface UploadInputProps {
  label: string;
  name: string;
  value: File | null;
  onChange: (file: File | null) => void;
  existingImageUrl?: string | null;
  onRemoveExistingImageUrl?: () => void;
  errors?: string | string[];
}

const UploadInput: FC<UploadInputProps> = ({
  label,
  name,
  value,
  onChange,
  existingImageUrl,
  onRemoveExistingImageUrl,
  errors,
}) => {
  const errorText = Array.isArray(errors) ? errors[0] : errors;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.files?.[0] ?? null);
  };

  return (
    <div className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      {existingImageUrl ? (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <img
            src={existingImageUrl}
            alt={label}
            className="h-14 w-14 rounded-full object-cover"
          />
          <button
            type="button"
            onClick={onRemoveExistingImageUrl}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
          >
            Remove image
          </button>
        </div>
      ) : null}
      <input
        type="file"
        name={name}
        onChange={handleChange}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
      />
      {value ? (
        <p className="mt-1 text-xs text-gray-500">Selected: {value.name}</p>
      ) : null}
      {errorText && (
        <span className="mt-1 block text-xs text-red-600">{errorText}</span>
      )}
    </div>
  );
};

export default UploadInput;
