import React from 'react';

interface PromptInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
}

const PromptInput: React.FC<PromptInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 8,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/80 focus:border-sky-500/80 transition-all duration-300 resize-none"
        rows={rows}
      />
    </div>
  );
};

export default PromptInput;