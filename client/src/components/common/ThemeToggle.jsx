import { Sun, Moon, Laptop, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function ThemeToggle({ showSound = true, compact = false }) {
  const { theme, setTheme, soundEnabled, toggleSound } = useTheme();

  return (
    <div className="flex items-center gap-1.5">
      {/* Theme Segmented Pill */}
      <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-inner">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center justify-center rounded-lg p-1.5 transition ${
            theme === "light"
              ? "bg-white text-amber-500 shadow-sm"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          title="Light Mode"
        >
          <Sun size={compact ? 13 : 15} />
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center justify-center rounded-lg p-1.5 transition ${
            theme === "dark"
              ? "bg-slate-700 text-blue-400 shadow-sm"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          title="Dark Mode"
        >
          <Moon size={compact ? 13 : 15} />
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex items-center justify-center rounded-lg p-1.5 transition ${
            theme === "system"
              ? "bg-white text-indigo-500 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          title="System Theme"
        >
          <Laptop size={compact ? 13 : 15} />
        </button>
      </div>

      {/* Sound Mute Toggle */}
      {showSound && (
        <button
          type="button"
          onClick={toggleSound}
          className={`flex items-center justify-center rounded-xl p-2 transition border ${
            soundEnabled
              ? "border-slate-200 bg-slate-100 text-blue-600 hover:bg-slate-200 dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-blue-400 dark:hover:bg-slate-700"
              : "border-slate-200 bg-slate-100 text-slate-400 hover:text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
          title={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
        >
          {soundEnabled ? <Volume2 size={compact ? 14 : 16} /> : <VolumeX size={compact ? 14 : 16} />}
        </button>
      )}
    </div>
  );
}

export default ThemeToggle;
