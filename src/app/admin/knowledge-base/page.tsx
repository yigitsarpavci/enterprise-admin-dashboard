"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useKnowledgeBase, KnowledgeItem } from "@/lib/hooks/use-knowledge";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function KnowledgeBasePage() {
  const { t } = useLanguage();
  const { items, isLoading, mutate } = useKnowledgeBase();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Filtered entries based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await apiClient.post("/api/knowledge", {
        question: question.trim(),
        answer: answer.trim(),
        is_active: true,
      });

      if (res.success) {
        // Optimistic cache revalidation
        await mutate();
        setQuestion("");
        setAnswer("");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to create knowledge base entry:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/api/knowledge/${deletingId}`);
      await mutate();
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-b border-[var(--border)] pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">
              Performo Intelligence Suite
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            {t("knowledgeBase")}
          </h1>
          <p className="text-xs md:text-sm text-[var(--muted)] mt-1 max-w-xl">
            {t("knowledgeBaseDesc")}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-bold text-xs uppercase tracking-[0.15em] hover:opacity-90 transition-all shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("newEntry")}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full px-5 py-4 pl-12 rounded-2xl bg-[var(--accent)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all"
        />
        <svg
          className="w-5 h-5 text-[var(--muted)] absolute left-4 top-1/2 -translate-y-1/2"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>

      {/* Content Feed */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[var(--muted)] gap-3">
          <div className="w-6 h-6 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest">{t("processing")}</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[var(--border)] rounded-3xl p-12">
          <svg
            className="w-12 h-12 text-[var(--muted)] opacity-30 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            />
          </svg>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            {searchQuery ? t("noMissions") : t("noMissionsHistory")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="group p-6 rounded-2xl bg-[var(--accent)] border border-[var(--border)] hover:border-[var(--muted)]/40 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        SOP / FAQ
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--foreground)] mb-2">
                      {item.question}
                    </h3>
                    <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDeletingId(item.id);
                      setDeleteConfirmOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    title={t("delete")}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--background)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
              {t("newEntry")}
            </h2>
            <p className="text-xs text-[var(--muted)] mb-6">
              {t("knowledgeBaseDesc")}
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  {t("questionOrTitle")}
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Employee Travel & Expense Reimbursement Policy"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--accent)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  {t("answerOrContent")}
                </label>
                <textarea
                  required
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Provide the procedure, guidelines, or resolution steps..."
                  className="w-full px-4 py-3 rounded-xl bg-[var(--accent)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? t("processing") : t("saveEntry")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--background)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--foreground)] mb-2">
              {t("confirmDelete")}
            </h3>
            <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
              {t("deleteConfirm")}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-600"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
