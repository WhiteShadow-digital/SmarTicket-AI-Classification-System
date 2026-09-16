"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Languages, ShieldCheck, Zap, BrainCircuit, Palette, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAppTheme, type AppTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useAppTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  const themeOptions: { value: AppTheme; label: string; desc: string; icon: any }[] = [
    { value: 'default', label: 'Enterprise Standard', desc: 'Professional blue corporate identity.', icon: Monitor },
    { value: 'midnight', label: 'Midnight Pro', desc: 'High-contrast charcoal and gold.', icon: Moon },
    { value: 'minimalist', label: 'Modern Minimalist', desc: 'Clean, Swiss-inspired utilitarian design.', icon: Palette },
    { value: 'visionary', label: 'Visionary (Person 3)', desc: 'Glassmorphism, vibrant purple, and fluid motion.', icon: Sparkles },
    { value: 'industrial', label: 'Industrial Ops', desc: 'Rugged orange and steel for field work.', icon: Zap },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-12">
      <div>
        <h1 className="text-3xl font-black font-headline tracking-tight text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground font-medium italic">Manage your application preferences and visual personas.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card shadow-md rounded-[2rem] border-border overflow-hidden">
          <CardHeader className="p-8">
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-black font-headline uppercase tracking-tight">Visual Identity</CardTitle>
            </div>
            <CardDescription>Select a UI persona that best fits your organizational workflow.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex flex-col items-start p-6 rounded-[2rem] border-2 transition-all text-left gap-3 group",
                    theme === opt.value 
                      ? "border-primary bg-primary/5 shadow-lg" 
                      : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    theme === opt.value ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                  )}>
                    <opt.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-black block">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight block mt-1">{opt.desc}</span>
                  </div>
                  {opt.value === 'visionary' && (
                    <div className="mt-2 bg-accent/10 text-accent px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                      Full Animation Suite
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between p-6 rounded-3xl border border-border bg-muted/20 mt-8">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">{t('settings.dark_mode')}</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark visual themes.</p>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
            </div>

            <div className="flex items-center justify-between p-6 rounded-3xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <Label className="text-base font-bold">{t('settings.language')}</Label>
                </div>
                <p className="text-sm text-muted-foreground">{t('settings.language_desc')}</p>
              </div>
              <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                <SelectTrigger className="w-[180px] bg-card rounded-xl font-bold">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="af">Afrikaans</SelectItem>
                  <SelectItem value="zu">isiZulu</SelectItem>
                  <SelectItem value="xh">isiXhosa</SelectItem>
                  <SelectItem value="ve">Tshivenda</SelectItem>
                  <SelectItem value="sn">Chishona</SelectItem>
                  <SelectItem value="st">Sesotho</SelectItem>
                  <SelectItem value="tn">Setswana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-md border-primary/20 bg-gradient-to-br from-background to-primary/5 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-black font-headline uppercase tracking-tight">Intelligence Architecture</CardTitle>
            </div>
            <CardDescription>Advanced details about the underlying neural classification logic.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-6 rounded-3xl border border-border bg-card/50">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-black">Neural Model</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gemini 2.5 Flash</span>
                  </div>
                </div>
                <div className="bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">STABLE</div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-3xl border border-border bg-card/50">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-black">Resolution Engine</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Deterministic Logic</span>
                  </div>
                </div>
                <div className="bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">ACTIVE</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
