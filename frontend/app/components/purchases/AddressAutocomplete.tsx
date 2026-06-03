import { useRef, useEffect } from "react";
import { useAddressAutocomplete } from "~/hooks/useAddressAutocomplete";
import type { StructuredAddress } from "~/hooks/useAddressAutocomplete";
import { useTheme } from "~/context/themeContext";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: StructuredAddress) => void;
  error?: string;
  postalCodeError?: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  error,
  postalCodeError,
  placeholder = "Ej: Av. Providencia 1234, Providencia",
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    inputValue,
    setInputValue,
    postalCode,
    setPostalCode,
    selectedAddress,
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    handleInputChange,
    selectSuggestion,
  } = useAddressAutocomplete();

  const { theme } = useTheme();
  useEffect(() => {
    if (value && !inputValue) setInputValue(value);
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (suggestion: Parameters<typeof selectSuggestion>[0]) => {
    selectSuggestion(suggestion);
    onChange({ ...suggestion.address });
  };

  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPostalCode(val);
    onChange({ ...selectedAddress, postalCode: val });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setIsOpen]);

  const isDark = theme === "dark";
  const inputBase = `w-full border rounded-lg p-3 pr-10 outline-none transition-colors
    focus:ring-2 focus:ring-blue-500 focus:border-transparent`;
  const inputTheme = isDark
    ? "bg-bgSecondary border-gray-600 text-white placeholder-gray-400"
    : "bg-bgPrimary border-gray-300 text-gray-900";
  const dropdownTheme = isDark
    ? "bg-bgSecondary border-gray-600 text-white"
    : "bg-bgPrimary border-gray-200 text-gray-900";

  const showPostalField = !!(selectedAddress.street || selectedAddress.commune);

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`${inputBase} ${inputTheme} ${error ? "border-red-500" : ""}`}
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          {isLoading ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>
          )}
        </span>

        {isOpen && suggestions.length > 0 && (
          <ul
            className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg overflow-hidden ${dropdownTheme}`}
          >
            {suggestions.map((s, i) => {
              const { street, streetNumber, commune, city, region } = s.address;
              const line1 = [street, streetNumber].filter(Boolean).join(" ");
              const line2 = [commune, city, region].filter(Boolean).join(", ");
              return (
                <li
                  key={i}
                  onMouseDown={() => handleSelect(s)}
                  className={`px-4 py-3 cursor-pointer transition-colors
                    ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                    ${i < suggestions.length - 1 ? (isDark ? "border-b border-gray-700" : "border-b border-gray-100") : ""}
                  `}
                >
                  <p className="text-sm font-medium truncate">
                    {line1 || s.displayName}
                  </p>
                  {line2 && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {line2}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {showPostalField && (
        <div className="flex flex-col gap-1 mt-1">
          <label className="text-sm font-medium flex items-center gap-1">
            Código postal
            {!postalCode && (
              <span className="text-xs text-amber-500 font-normal">
                — no encontrado, ingresa manualmente
              </span>
            )}
          </label>
          <input
            type="text"
            value={postalCode}
            onChange={handlePostalChange}
            placeholder="Ej: 2820000"
            maxLength={7}
            className={`border rounded-lg p-3 outline-none transition-colors w-40
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${postalCodeError ? "border-red-500" : isDark ? "border-gray-600" : "border-gray-300"}
              ${isDark ? "bg-bgSecondary text-white placeholder-gray-400" : "bg-bgPrimary text-gray-900"}
            `}
          />
          {postalCodeError && (
            <p className="text-red-500 text-xs">{postalCodeError}</p>
          )}
        </div>
      )}
    </div>
  );
}
