import React from 'react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const LANGUAGES = [
  { code: 'Anglais', name: 'Anglais' },
  { code: 'Français', name: 'Français' },
  { code: 'Espagnol', name: 'Espagnol' },
  { code: 'Allemand', name: 'Allemand' },
  { code: 'Japonais', name: 'Japonais' },
  { code: 'Chinois', name: 'Chinois' },
  { code: 'Italien', name: 'Italien' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onChange }) => {
  return (
    <div>
      <label htmlFor="language-selector" className="block text-sm font-medium text-slate-300 mb-2">
        Langue du prompt final
      </label>
      <select
        id="language-selector"
        value={selectedLanguage}
        onChange={onChange}
        className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200"
        aria-label="Sélectionner la langue du prompt final"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
