"use client";

import { useEffect, useRef, useState } from "react";

export default function LocationAutocomplete({ value, onChange, placeholder = "Search a city or place…" }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [mapsReady, setMapsReady] = useState(false);

  // Poll until the Maps API script is loaded
  useEffect(() => {
    const check = () => {
      if (window.google?.maps?.places) {
        setMapsReady(true);
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  }, []);

  useEffect(() => {
    if (!mapsReady || !inputRef.current) return;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["(cities)"],
    });
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      onChange(place.formatted_address || place.name || inputRef.current.value);
    });
  }, [mapsReady, onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      className="input"
      placeholder={mapsReady ? placeholder : "Loading maps…"}
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
