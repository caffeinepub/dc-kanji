import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface TranslationResult {
  kanji: string;
  romaji: string;
}

async function translateToJapanese(text: string): Promise<TranslationResult> {
  const encoded = encodeURIComponent(text);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&dt=rm&q=${encoded}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Translation failed");
  const data = await response.json();
  if (!data || !data[0] || !data[0][0] || !data[0][0][0]) {
    throw new Error("Unexpected response");
  }
  const kanji = (data[0] as [string, string][]).map((seg) => seg[0]).join("");
  // Romaji is in data[0][i][3] when available
  let romaji = "";
  try {
    const parts = data[0] as string[][];
    romaji = parts
      .map((seg) => seg[3] ?? "")
      .join("")
      .trim();
  } catch (_) {
    romaji = "";
  }
  return { kanji, romaji };
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTranslate() {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const translation = await translateToJapanese(inputText.trim());
      setResult(translation);
    } catch (_err) {
      setError("No se pudo traducir. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setInputText("");
    setResult(null);
    setError(null);
    setIsLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleTranslate();
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Mount Fuji background */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0"
        style={{ zIndex: 0 }}
      >
        <img
          src="/assets/generated/mount-fuji-bg.dim_1920x1080.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="pt-16 pb-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-xs tracking-[0.35em] uppercase text-white/60 mb-3">
              Translation Studio
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight text-white">
              DC <span style={{ color: "oklch(0.65 0.22 27)" }}>漢字</span>
            </h1>
            <p className="mt-2 text-sm tracking-[0.2em] uppercase text-white/60">
              Kanji
            </p>
          </motion.div>
        </header>

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {/* Thin decorative line */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/50 text-xs tracking-widest uppercase">
                翻訳
              </span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Input row */}
            <div className="flex gap-2 mb-3">
              <Input
                data-ocid="kanji.input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe en cualquier idioma…"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-red-400 h-12 text-base tracking-wide rounded-sm backdrop-blur-sm"
                disabled={isLoading}
              />
              <Button
                data-ocid="kanji.secondary_button"
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title="Reiniciar"
                className="h-12 w-12 border border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-sm shrink-0"
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <Button
              data-ocid="kanji.submit_button"
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="w-full h-12 rounded-sm text-sm tracking-[0.2em] uppercase font-medium transition-opacity"
              style={{ backgroundColor: "oklch(0.55 0.22 27)", color: "white" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traduciendo
                </>
              ) : (
                "Traducir"
              )}
            </Button>

            {/* Result area */}
            <div className="mt-12 min-h-[140px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    key="loading"
                    data-ocid="kanji.loading_state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3 text-white/60"
                  >
                    <Loader2
                      className="h-8 w-8 animate-spin"
                      style={{ color: "oklch(0.65 0.22 27)" }}
                    />
                    <p className="text-xs tracking-widest uppercase">
                      Procesando…
                    </p>
                  </motion.div>
                )}

                {error && !isLoading && (
                  <motion.div
                    key="error"
                    data-ocid="kanji.error_state"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <p className="text-red-400 text-sm tracking-wide">
                      {error}
                    </p>
                  </motion.div>
                )}

                {result && !isLoading && (
                  <motion.div
                    key="result"
                    data-ocid="kanji.success_state"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-center"
                  >
                    <p
                      className="font-display text-6xl md:text-8xl leading-tight tracking-wide"
                      style={{ color: "oklch(0.65 0.22 27)" }}
                    >
                      {result.kanji}
                    </p>
                    {result.romaji && (
                      <p className="mt-3 text-sm italic text-white/70 tracking-widest">
                        {result.romaji}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-white/40 tracking-[0.3em] uppercase">
                      {inputText}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center">
          <p className="text-xs text-white/40 tracking-wide">
            © {currentYear}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70 transition-colors"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
