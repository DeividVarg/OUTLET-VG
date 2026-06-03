import { useEffect, useRef, useState } from "react";

export interface StructuredAddress {
  fullAddress: string; // dirección completa formateada
  street: string; // nombre de la calle
  streetNumber: string; // número
  commune: string; // comuna (requerido por ChileExpress)
  city: string; // ciudad
  region: string; // región
  postalCode: string; // código postal
  country: string; // país
  lat?: number;
  lng?: number;
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

function extractAddressComponents(): Omit<
// components: google.maps.GeocoderAddressComponent[]
  StructuredAddress,
  "fullAddress" | "lat" | "lng"
> {
  const get = (type: string) =>
    // components.find((c) => c.types.includes(type))?.long_name ?? "";
    "";

  return {
    street: get("route"),
    streetNumber: get("street_number"),
    commune: get("locality") || get("sublocality_level_1"),
    city:
      get("administrative_area_level_3") ||
      get("locality") ||
      get("sublocality_level_1"),
    region: get("administrative_area_level_1"),
    postalCode: get("postal_code"),
    country: get("country") || "Chile",
  };
}

export function useAddressAutocomplete(
  inputRef: React.RefObject<HTMLInputElement | null>,
) {
  // const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [address, setAddress] = useState<StructuredAddress>(EMPTY_ADDRESS);
  const [isLoaded, setIsLoaded] = useState(false);

  // useEffect(() => {
  //   const checkLoaded = () => {
  //     if (window.google?.maps?.places) {
  //       setIsLoaded(true);
  //     } else {
  //       setTimeout(checkLoaded, 100);
  //     }
  //   };
  //   checkLoaded();
  // }, []);

  // useEffect(() => {
  //   if (!isLoaded || !inputRef.current) return;

  //   autocompleteRef.current = new window.google.maps.places.Autocomplete(
  //     inputRef.current,
  //     {
  //       componentRestrictions: { country: "cl" }, // Solo Chile
  //       fields: ["address_components", "formatted_address", "geometry"],
  //       types: ["address"],
  //     }
  //   );

  //   const listener = autocompleteRef.current.addListener(
  //     "place_changed",
  //     () => {
  //       const place = autocompleteRef.current!.getPlace();
  //       if (!place.address_components) return;

  //       const components = extractAddressComponents(place.address_components);
  //       const structured: StructuredAddress = {
  //         ...components,
  //         fullAddress: place.formatted_address ?? "",
  //         lat: place.geometry?.location?.lat(),
  //         lng: place.geometry?.location?.lng(),
  //       };
  //       setAddress(structured);
  //     }
  //   );

  //   return () => {
  //     // google.maps.event.removeListener(listener);
  //   };
  // }, [isLoaded, inputRef]);

  const reset = () => setAddress(EMPTY_ADDRESS);

  return { address, setAddress, reset, isLoaded };
}
