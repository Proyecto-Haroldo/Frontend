import React, { useState } from "react";
import { IUser } from "../../../../core/models/user";
import { putUserById } from "../../../../api/userApi";
import CardConfirmEdit from "../cards/CardConfirmEdit";

interface ModalEditUserProps {
    user: IUser;
    onClose: () => void;
    onUpdate: (updatedUser: IUser) => void;
}

const ModalEditUser: React.FC<ModalEditUserProps> = ({
    user,
    onClose,
    onUpdate,
}) => {
    const [formData, setFormData] = useState<IUser>(user);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleConfirmEdit = async () => {
        setLoading(true);
        try {
            const updated = await putUserById(formData.userId, formData);
            onUpdate(updated);
            onClose();
        } catch (error) {
            console.error("Error al editar el cliente:", error);
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-base-100 rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg md:text-xl font-semibold">
                            Editar Usuario
                        </h2>
                        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                            ✕
                        </button>
                    </div>

                    <form className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="legalName" className="text-sm font-medium text-base-content/70">
                                    Nombre Legal
                                </label>
                                <input
                                    type="text"
                                    title="legalName"
                                    name="legalName"
                                    value={formData.legalName}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="cedulaOrNIT" className="text-sm font-medium text-base-content/70">
                                    Cédula / NIT
                                </label>
                                <input
                                    type="text"
                                    title="cedulaOrNIT"
                                    name="cedulaOrNIT"
                                    value={formData.cedulaOrNIT}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-base-content/70">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    title="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="clientType" className="text-sm font-medium text-base-content/70">
                                    Tipo de Cliente
                                </label>
                                <select
                                    name="clientType"
                                    title="clientType"
                                    value={formData.clientType}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                >
                                    <option value="persona">Persona</option>
                                    <option value="empresa">Empresa</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="sector" className="text-sm font-medium text-base-content/70">
                                    Sector
                                </label>
                                <input
                                    type="text"
                                    title="sector"
                                    name="sector"
                                    value={formData.sector}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-base-content/70">
                                    Rol
                                </label>
                                <input
                                    type="text"
                                    title="name"
                                    name="name"
                                    value={formData.role.name}
                                    disabled
                                    className="input input-bordered w-full opacity-70"
                                />
                            </div>
                        </div>
                    </form>

                    <div className="flex justify-end mt-6 gap-2">
                        <button onClick={onClose} className="btn btn-outline">
                            Cancelar
                        </button>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                "Guardar Cambios"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showConfirm && (
                <CardConfirmEdit
                    message="¿Deseas guardar los cambios realizados en este usuario?"
                    onConfirm={handleConfirmEdit}
                    onCancel={() => setShowConfirm(false)}
                    loading={loading}
                />
            )}
        </>
    );
};

export default ModalEditUser;
