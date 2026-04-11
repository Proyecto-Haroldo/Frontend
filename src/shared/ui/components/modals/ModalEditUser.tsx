import React, { useState } from "react";
import { IUser } from "../../../../core/models/user";
import { putUserById } from "../../../../api/usersApi";
import DialogConfirmEdit from "../dialogs/DialogConfirmEdit";
import SelectCategories from "../selects/SelectCategories";
import useCategories from "../../../hooks/useCategories";

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
    const [selectedCategories, setSelectedCategories] = useState<number[]>(
        user.specialities?.map((s) => s.categoryId) || []
    );

    const { categories } = useCategories();

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
            const selectedFullCategories = (formData.specialities ?? []).filter((cat) => selectedCategories.includes(cat.categoryId));
            const updated = await putUserById(formData.userId, {
                ...formData,
                specialities: selectedFullCategories,
            });
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
                <div className="bg-base-200 rounded-lg p-4 pr-3 md:p-6 md:pr-5 max-w-3xl w-full max-h-[80vh] flex flex-col">
                    {/* Header fijo */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg md:text-xl font-semibold">
                            Editar Usuario
                        </h2>
                        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                            ✕
                        </button>
                    </div>

                    <div className="overflow-y-auto overflow-x-hidden pr-1 flex-1">
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="legalName" className="text-sm font-medium text-base-content">
                                        Nombre Legal
                                    </label>
                                    <input
                                        type="text"
                                        title="legalName"
                                        name="legalName"
                                        value={formData.legalName}
                                        onChange={handleChange}
                                        className="input input-bordered w-full text-sm text-base-content/70"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cedulaOrNIT" className="text-sm font-medium text-base-content">
                                        Cédula / NIT
                                    </label>
                                    <input
                                        type="text"
                                        title="cedulaOrNIT"
                                        name="cedulaOrNIT"
                                        value={formData.cedulaOrNIT}
                                        onChange={handleChange}
                                        className="input input-bordered w-full text-sm text-base-content/70"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-base-content">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        title="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input input-bordered w-full text-sm text-base-content/70"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="clientType" className="text-sm font-medium text-base-content">
                                        Tipo de Cliente
                                    </label>
                                    <select
                                        name="clientType"
                                        title="clientType"
                                        value={formData.clientType}
                                        onChange={handleChange}
                                        className="select select-bordered w-full text-sm text-base-content/70"
                                    >
                                        <option value="persona">Persona</option>
                                        <option value="empresa">Empresa</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="sector" className="text-sm font-medium text-base-content">
                                        Sector
                                    </label>
                                    <input
                                        type="text"
                                        title="sector"
                                        name="sector"
                                        value={formData.sector}
                                        onChange={handleChange}
                                        className="input input-bordered w-full text-sm text-base-content/70"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location" className="text-sm font-medium text-base-content">
                                        Región
                                    </label>
                                    <input
                                        type="text"
                                        title="location"
                                        name="location"
                                        value={formData.location || ""}
                                        onChange={handleChange}
                                        className="input input-bordered w-full text-sm text-base-content/70"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="text-sm font-medium text-base-content">
                                        Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        title="phone"
                                        value={formData.phone || ""}
                                        onChange={handleChange}
                                        className="input input-bordered w-full text-sm text-base-content/70"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="network" className="text-sm font-medium text-base-content">
                                        Red
                                    </label>
                                    <input
                                        type="text"
                                        name="network"
                                        title="network"
                                        value={formData.network || ""}
                                        onChange={handleChange}
                                        className="input input-bordered w-full text-sm text-base-content/70"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="status" className="text-sm font-medium text-base-content">
                                        Estado
                                    </label>
                                    <select
                                        name="status"
                                        title="status"
                                        value={formData.status || ""}
                                        onChange={handleChange}
                                        className="select select-bordered w-full text-sm text-base-content/70"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="AUTHORIZED">Activo</option>
                                        <option value="UNAUTHORIZED">Inactivo</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="role" className="text-sm font-medium text-base-content">
                                        Rol
                                    </label>
                                    <input
                                        type="text"
                                        title="role"
                                        name="role"
                                        value={formData.role.name}
                                        disabled
                                        className="input input-bordered w-full"
                                    />
                                </div>
                            </div>

                            {formData.role.id === 3 && (
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="specialties" className="text-sm font-medium text-base-content">
                                        Especialidades
                                    </label>
                                    <SelectCategories
                                        name="categories"
                                        categories={categories || []}
                                        value={selectedCategories}
                                        onChange={(value) => {
                                            setSelectedCategories(value);
                                        }}
                                    />
                                </div>
                            )}
                        </form>

                        <div className="flex justify-end mt-6 gap-2">
                            <button onClick={onClose} className="btn btn-ghost">
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
            </div>

            {showConfirm && (
                <DialogConfirmEdit
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
