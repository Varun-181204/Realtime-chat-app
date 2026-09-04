import { MessageSquare, ShieldCheck, Zap, Lock } from "lucide-react";

function ChatPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12 text-center text-slate-800 dark:text-white select-none transition-colors duration-200">
      <div className="max-w-md">
        {/* Animated Glowing Icon Container */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/20">
          <div className="absolute inset-0 rounded-3xl bg-blue-500 blur-xl opacity-30 animate-pulse" />
          <MessageSquare size={44} className="relative z-10 text-white" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          RealTime Chat Web
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Send and receive messages in real time with instant delivery receipts, 
          image sharing, and live presence.
        </p>

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/80 p-3 text-left shadow-sm">
            <Zap size={18} className="text-amber-500 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Instant Sync</p>
              <p className="text-[11px] text-slate-400">Powered by Socket.IO</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/80 p-3 text-left shadow-sm">
            <ShieldCheck size={18} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Cloud Storage</p>
              <p className="text-[11px] text-slate-400">Media via Cloudinary</p>
            </div>
          </div>
        </div>

        {/* Bottom Encrypted Badge */}
        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 shadow-sm">
          <Lock size={12} className="text-slate-400" />
          <span>Select a contact from the left to begin messaging</span>
        </div>
      </div>
    </div>
  );
}

export default ChatPlaceholder;
