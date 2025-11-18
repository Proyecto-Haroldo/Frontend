import React from "react";
import { motion } from 'motion/react';
import { AlertTriangle } from "lucide-react";

interface CardConfirmDeleteProps {
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
}

const CardConfirmDelete: React.FC<CardConfirmDeleteProps> = ({
    title = "Confirmar acción",
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    loading = false,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.25 }}
                className="card bg-base-100 border border-base-200 shadow-md max-w-sm w-full p-6 space-y-4 rounded-2xl"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-error/10 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-error" />
                    </div>
                    <h2 className="text-lg font-semibold text-base-content">{title}</h2>
                </div>

                <p className="text-sm text-base-content/70 leading-relaxed">{message}</p>

                <div className="flex justify-end gap-3 pt-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="btn btn-outline btn-sm border-base-300 hover:bg-base-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`btn btn-error btn-sm text-error-content gap-2 ${loading ? "opacity-70 pointer-events-none" : ""}`}
                    >
                        {loading && <span className="loading loading-spinner loading-xs" />}
                        {confirmText}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CardConfirmDelete;
