import { useState } from "react";
import { X, Mail, Copy, Check, Image as ImageIcon, FileText, Download, Shield } from "lucide-react";
import Avatar from "../common/Avatar";

function ContactInfoDrawer({
  contact,
  messages = [],
  isOpen,
  onClose,
  onImageClick,
}) {
  const [activeTab, setActiveTab] = useState("media"); // 'media' | 'files'
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!contact) return null;

  // Filter media from messages
  const sharedImages = messages.filter((m) => !!m.image);
  const sharedFiles = messages.filter((m) => !!m.file);

  const handleCopyEmail = () => {
    if (!contact.email) return;
    navigator.clipboard.writeText(contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <>
      {/* Backdrop (mobile/tablet) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed top-0 right-0 z-40 flex h-full w-80 md:w-96 flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/70 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Contact Info</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Profile Overview Card */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <Avatar
                user={contact}
                size={96}
              />
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {contact.fullName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {contact.email}
            </p>
          </div>

          {/* Bio / About Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              About / Status
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
              "{contact.bio || "No status set"}"
            </p>
          </div>

          {/* Email / Details Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-3">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Contact Details
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail size={16} className="text-blue-500 shrink-0" />
                <span className="truncate text-xs text-slate-700 dark:text-slate-200">
                  {contact.email}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title="Copy Email"
              >
                {copiedEmail ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Shared Media Tabs */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                  activeTab === "media"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <ImageIcon size={14} />
                <span>Photos ({sharedImages.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("files")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                  activeTab === "files"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <FileText size={14} />
                <span>Files ({sharedFiles.length})</span>
              </button>
            </div>

            {/* Tab: Photos Grid */}
            {activeTab === "media" && (
              sharedImages.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No photos shared yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {sharedImages.map((m) => (
                    <div
                      key={m._id}
                      onClick={() => onImageClick?.(m.image)}
                      className="aspect-square cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 transition hover:opacity-85"
                    >
                      <img
                        src={m.image}
                        alt="Shared media"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Tab: Files List */}
            {activeTab === "files" && (
              sharedFiles.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No documents shared yet
                </div>
              ) : (
                <div className="space-y-2">
                  {sharedFiles.map((m) => (
                    <a
                      key={m._id}
                      href={m.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 p-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                          <FileText size={16} />
                        </div>
                        <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                          {m.fileName || "Document"}
                        </span>
                      </div>
                      <Download size={15} className="text-slate-400 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Encryption Notice */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-4">
            <Shield size={13} className="text-emerald-500" />
            <span>Messages & media are cloud stored</span>
          </div>

        </div>
      </div>
    </>
  );
}

export default ContactInfoDrawer;
