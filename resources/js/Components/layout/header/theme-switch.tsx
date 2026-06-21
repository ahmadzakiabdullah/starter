"use client";

import { useState, useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { useThemeConfig } from "@/Components/active-theme";
import { THEMES } from "@/lib/themes";
import { MoonIcon, SunIcon, Monitor, Check, Palette } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { usePage } from "@inertiajs/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme: mode, setTheme: setMode } = useNextTheme();
  const { theme: config, setTheme: setConfig } = useThemeConfig();
  const { props: pageProps } = usePage();
  const system = pageProps.system as any;
  const showPresets = system?.module_theme_presets !== false;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button size="icon-sm" variant="ghost" className="h-8 w-8" disabled>
        <SunIcon className="h-4 w-4" />
      </Button>
    );
  }

  const activePreset = config.preset || "default";

  const handlePresetSelect = (presetValue: string) => {
    setConfig({
      ...config,
      preset: presetValue as any,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          className="relative h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {mode === "dark" ? (
            <MoonIcon className="h-4 w-4 text-primary" />
          ) : (
            <SunIcon className="h-4 w-4 text-primary" />
          )}
          <span className="sr-only">Toggle theme dropdown</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-52 sm:rounded-xl p-1 bg-popover border border-slate-200 dark:border-slate-800 shadow-md">
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1.5 flex items-center gap-1.5">
          <Monitor className="h-3.5 w-3.5" />
          Theme Mode
        </DropdownMenuLabel>
        
        <DropdownMenuItem
          onClick={() => setMode("light")}
          className={`flex items-center justify-between text-xs px-2.5 py-1.5 cursor-pointer rounded-md ${
            mode === "light" ? "bg-accent/40 font-semibold" : ""
          }`}
        >
          <span className="flex items-center gap-2">
            <SunIcon className="h-3.5 w-3.5 text-amber-500" />
            Light
          </span>
          {mode === "light" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setMode("dark")}
          className={`flex items-center justify-between text-xs px-2.5 py-1.5 cursor-pointer rounded-md ${
            mode === "dark" ? "bg-accent/40 font-semibold" : ""
          }`}
        >
          <span className="flex items-center gap-2">
            <MoonIcon className="h-3.5 w-3.5 text-indigo-500" />
            Dark
          </span>
          {mode === "dark" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setMode("system")}
          className={`flex items-center justify-between text-xs px-2.5 py-1.5 cursor-pointer rounded-md ${
            mode === "system" ? "bg-accent/40 font-semibold" : ""
          }`}
        >
          <span className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5 text-slate-500" />
            System
          </span>
          {mode === "system" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </DropdownMenuItem>

        {showPresets && (
          <>
            <DropdownMenuSeparator className="border-slate-100 dark:border-slate-800" />

            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1.5 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              Color Preset
            </DropdownMenuLabel>

            <div className="max-h-48 overflow-y-auto pr-0.5 space-y-0.5">
              {THEMES.map((themePreset) => {
                const isPresetSelected = activePreset === themePreset.value;
                return (
                  <DropdownMenuItem
                    key={themePreset.value}
                    onClick={() => handlePresetSelect(themePreset.value)}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 cursor-pointer rounded-md ${
                      isPresetSelected ? "bg-accent/40 font-semibold" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span 
                        className="h-3.5 w-3.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0" 
                        style={{ backgroundColor: themePreset.colors[0] }}
                      />
                      {themePreset.name}
                    </span>
                    {isPresetSelected && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
