import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

export type Palette = "blue" | "violet" | "emerald" | "amber" | "rose" | "cyan" | "slate";

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultPalette?: Palette;
  storageKey?: string;
  paletteStorageKey?: string;
};

export type ThemeProviderState = {
  theme: Theme;
  palette: Palette;
  setTheme: (theme: Theme) => void;
  setPalette: (palette: Palette) => void;
};

// High-fidelity Color Palettes with Light and Dark RGB mappings
export const PALETTES: Record<Palette, {
  light: Record<string, string>;
  dark: Record<string, string>;
}> = {
  blue: {
    light: {
      primary: "59 130 246",
      "primary-foreground": "255 255 255",
      muted: "244 244 245",
      "muted-foreground": "113 113 122",
      background: "255 255 255",
      foreground: "9 9 11"
    },
    dark: {
      primary: "96 165 250",
      "primary-foreground": "9 9 11",
      muted: "39 39 42",
      "muted-foreground": "161 161 170",
      background: "9 9 11",
      foreground: "250 250 250"
    }
  },
  violet: {
    light: {
      primary: "139 92 246",
      "primary-foreground": "255 255 255",
      muted: "245 243 255",
      "muted-foreground": "124 58 237",
      background: "255 255 255",
      foreground: "15 23 42"
    },
    dark: {
      primary: "167 139 250",
      "primary-foreground": "12 10 20",
      muted: "26 23 38",
      "muted-foreground": "196 181 253",
      background: "12 10 20",
      foreground: "245 243 255"
    }
  },
  emerald: {
    light: {
      primary: "16 185 129",
      "primary-foreground": "255 255 255",
      muted: "240 253 250",
      "muted-foreground": "5 150 105",
      background: "255 255 255",
      foreground: "6 12 10"
    },
    dark: {
      primary: "52 211 153",
      "primary-foreground": "6 15 11",
      muted: "18 30 26",
      "muted-foreground": "110 231 183",
      background: "6 12 10",
      foreground: "240 253 250"
    }
  },
  amber: {
    light: {
      primary: "245 158 11",
      "primary-foreground": "255 255 255",
      muted: "254 243 199",
      "muted-foreground": "180 83 9",
      background: "255 255 255",
      foreground: "12 9 6"
    },
    dark: {
      primary: "251 191 36",
      "primary-foreground": "15 11 5",
      muted: "30 24 16",
      "muted-foreground": "252 211 77",
      background: "12 9 6",
      foreground: "254 243 199"
    }
  },
  rose: {
    light: {
      primary: "244 63 94",
      "primary-foreground": "255 255 255",
      muted: "255 241 242",
      "muted-foreground": "225 29 72",
      background: "255 255 255",
      foreground: "15 5 8"
    },
    dark: {
      primary: "251 113 133",
      "primary-foreground": "15 5 8",
      muted: "34 16 22",
      "muted-foreground": "253 164 175",
      background: "14 8 10",
      foreground: "255 241 242"
    }
  },
  cyan: {
    light: {
      primary: "6 182 212",
      "primary-foreground": "255 255 255",
      muted: "236 254 255",
      "muted-foreground": "8 145 178",
      background: "255 255 255",
      foreground: "5 12 14"
    },
    dark: {
      primary: "34 211 238",
      "primary-foreground": "5 12 14",
      muted: "16 28 32",
      "muted-foreground": "103 232 249",
      background: "8 12 14",
      foreground: "236 254 255"
    }
  },
  slate: {
    light: {
      primary: "71 85 105",
      "primary-foreground": "255 255 255",
      muted: "241 245 249",
      "muted-foreground": "100 116 139",
      background: "255 255 255",
      foreground: "15 23 42"
    },
    dark: {
      primary: "148 163 184",
      "primary-foreground": "15 23 42",
      muted: "30 41 59",
      "muted-foreground": "203 213 225",
      background: "15 23 42",
      foreground: "241 245 249"
    }
  }
};

const initialState: ThemeProviderState = {
  theme: "system",
  palette: "blue",
  setTheme: () => null,
  setPalette: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultPalette = "blue",
  storageKey = "vite-ui-theme",
  paletteStorageKey = "vite-ui-palette",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [palette, setPaletteState] = useState<Palette>(defaultPalette);

  // Load from localstorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    const savedPalette = localStorage.getItem(paletteStorageKey) as Palette;
    if (savedPalette) {
      setPaletteState(savedPalette);
    }
  }, [storageKey, paletteStorageKey]);

  // Handle CSS Variables and classes injection
  useEffect(() => {
    const root = window.document.documentElement;

    // Apply light/dark classes
    root.classList.remove("light", "dark");

    let effectiveTheme: "light" | "dark" = "light";
    if (theme === "system") {
      const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      effectiveTheme = systemIsDark ? "dark" : "light";
    } else {
      effectiveTheme = theme;
    }

    root.classList.add(effectiveTheme);

    // Apply active palette CSS variables dynamically
    const colorsMap = PALETTES[palette][effectiveTheme];
    Object.entries(colorsMap).forEach(([key, val]) => {
      root.style.setProperty(`--color-${key}`, val);
    });

  }, [theme, palette]);

  const value = {
    theme,
    palette,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    },
    setPalette: (newPalette: Palette) => {
      localStorage.setItem(paletteStorageKey, newPalette);
      setPaletteState(newPalette);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
