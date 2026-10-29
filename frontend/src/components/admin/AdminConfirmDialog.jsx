import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function AdminConfirmDialog({ message, onYes, onNo, isLoading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="corner-card rounded-2xl p-6 w-full max-w-xs shadow-2xl text-center bg-card">
        <p className="text-sm font-semibold text-muted mb-5">{message}</p>
        <div className="modal-actions modal-actions--inline">
          <button type="button" onClick={onNo} disabled={isLoading}
            className="modal-btn btn-ghost disabled:opacity-50">
            <span className="modal-btn-label">Cancel</span>
          </button>
          <button type="button" onClick={onYes} disabled={isLoading}
            className="modal-btn text-white bg-red-600 hover:bg-red-500 disabled:opacity-50">
            {isLoading && <Loader2 size={14} className="modal-btn-icon animate-spin" />}
            <span className="modal-btn-label">Delete</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
