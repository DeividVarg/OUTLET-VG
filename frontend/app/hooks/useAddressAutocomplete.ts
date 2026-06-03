import { useState, useCallback, useRef } from "react";

export interface StructuredAddress {
  fullAddress: string;
  street: string;
  streetNumber: string;
  commune: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface AddressSuggestion {
  displayName: string;
  address: StructuredAddress;
}

const EMPTY_ADDRESS: StructuredAddress = {
  fullAddress: "",
  street: "",
  streetNumber: "",
  commune: "",
  city: "",
  region: "",
  postalCode: "",
  country: "Chile",
};

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    footway?: string;
    suburb?: string;
    quarter?: string;
    neighbourhood?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

function parseNominatimResult(result: NominatimResult): StructuredAddress {
  const a = result.address;
  return {
    fullAddress: result.display_name,
    street: a.road ?? a.pedestrian ?? a.footway ?? "",
    streetNumber: a.house_number ?? "",
    commune:
      a.suburb ??
      a.quarter ??
      a.neighbourhood ??
      a.city_district ??
      a.town ??
      a.village ??
      "",
    city: a.city ?? a.town ?? a.village ?? a.municipality ?? "",
    region: a.state ?? "",
    postalCode: a.postcode ?? "",
    country: a.country ?? "Chile",
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
  };
}

export function useAddressAutocomplete() {
  const [inputValue, setInputValue] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedAddress, setSelectedAddress] =
    useState<StructuredAddress>(EMPTY_ADDRESS);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (query: string) => {
    if (query.trim().length < 4) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        addressdetails: "1",
        countrycodes: "cl",
        limit: "5",
        "accept-language": "es",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        { headers: { "Accept-Language": "es" } },
      );
      const data: NominatimResult[] = await res.json();
      const parsed: AddressSuggestion[] = data.map((r) => ({
        displayName: r.display_name,
        address: parseNominatimResult(r),
      }));
      setSuggestions(parsed);
      setIsOpen(parsed.length > 0);
    } catch (err) {
      console.error("Error buscando dirección:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setSelectedAddress(EMPTY_ADDRESS);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 400);
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion.address);
    setPostalCode(suggestion.address.postalCode ?? ""); //
    const short = [
      suggestion.address.street,
      suggestion.address.streetNumber,
      suggestion.address.commune,
    ]
      .filter(Boolean)
      .join(" ");
    setInputValue(short || suggestion.displayName);
    setSuggestions([]);
    setIsOpen(false);
  };

  const reset = () => {
    setInputValue("");
    setPostalCode("");
    setSelectedAddress(EMPTY_ADDRESS);
    setSuggestions([]);
    setIsOpen(false);
  };

  return {
    inputValue,
    setInputValue,
    postalCode,
    setPostalCode,
    suggestions,
    selectedAddress,
    isLoading,
    isOpen,
    setIsOpen,
    handleInputChange,
    selectSuggestion,
    reset,
  };
}
