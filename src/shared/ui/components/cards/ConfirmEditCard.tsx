import React from "react";

interface ConfirmEditCardProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

const ConfirmEditCard: React.FC<ConfirmEditCardProps> = ({
    message,
    onConfirm,
    onCancel,
    loading = false,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <h3 className="text-lg font-semibold mb-2 text-base-content">
                    Confirmar Edición
                </h3>
                <p className="text-sm text-base-content/70 mb-4">{message}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={onCancel} className="btn btn-outline btn-sm">
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn btn-primary btn-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            "Confirmar"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmEditCard;
