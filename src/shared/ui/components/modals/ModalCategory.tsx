import React, { useState, useEffect } from "react";
import { ICategory, mapCategoryToDTO } from "../../../../core/models/questionnaire";
import { categoriesIcons } from '../../../../../public/assets/Categories';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../../../api/questionnairesApi";
import { useAuth } from "../../../context/AuthContext";
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Loader2
} from 'lucide-react';
import DialogConfirmDelete from '../dialogs/DialogConfirmDelete';   

interface ModalCategoryProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryCreated?: (category: ICategory) => void;  
}

const ModalCategory: React.FC<ModalCategoryProps> = ({
    isOpen,
    onClose,
    onCategoryCreated,
}) => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { role } = useAuth();
    const [confirmDialog, setConfirmDialog] = useState<{
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const isAdmin = role === 1;
    const canManage = isAdmin;

    

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllCategories();
            setCategories(data);
            console.log(data)
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Error al cargar las categorías');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const handleCreate = () => {
        if (!canManage) return;

        setIsCreating(true);
        setEditingCategory({
            id: 0,
            name: '',
            description: '',
            icon: categoriesIcons[0]
        });
    };

    const handleEdit = (category: ICategory) => {
        if (!canManage) return;

        setEditingCategory({ ...category });
        setIsCreating(false);
    };

    const handleDelete = (id: number) => {
        if (!canManage) return;
        setConfirmDialog({
            message: '¿Está seguro de que desea eliminar esta categoría? Esta acción podría afectar a los cuestionarios asociados.',
            onConfirm: async () => {
                try {
                    await deleteCategory(id);
                    await fetchCategories();
                } catch {
                    setError('Error al eliminar la categoría');
                } finally {
                    setConfirmDialog(null);
                }
            }
        });
    };

    const handleSave = async () => {
        if (!canManage || !editingCategory) return;

        // Validation
        if (!editingCategory.name.trim()) {
            setError('El nombre de la categoría es requerido');
            return;
        }

        if (!editingCategory.description.trim()) {
            setError('La descripción de la categoría es requerida');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            let savedCategory: ICategory;

            if (isCreating) {
                savedCategory = await createCategory(mapCategoryToDTO(editingCategory));
                onCategoryCreated?.(savedCategory);
            } else {
                savedCategory = await updateCategory(editingCategory.id, mapCategoryToDTO(editingCategory));
            }

            setEditingCategory(null);
            setIsCreating(false);
            await fetchCategories();
        } catch (err) {
            console.error('Error saving category:', err);
            setError('Error al guardar la categoría');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingCategory(null);
        setIsCreating(false);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 m-0">
            <div className="bg-base-200 rounded-lg p-4 pr-3 md:p-6 md:pr-5 max-w-3xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 shrink-0">
                    <div className="flex gap-4 flex-wrap">
                        <h2 className="text-xl font-semibold">Gestor de Categorías</h2>
                        {/* Create Category Button */}
                        {!editingCategory && canManage && (
                            <div>
                                <button
                                    onClick={handleCreate}
                                    className="btn btn-primary gap-2 btn-xs"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nueva
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                        title="close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error mb-4 flex justify-between">
                        <span>{error}</span>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setError(null)}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="overflow-y-auto overflow-x-hidden pr-1 flex-1">
                    {/* Create/Edit Form */}
                    {editingCategory && (
                        <div className="card bg-base-100 border border-base-300 mb-6">
                            <div className="card-body p-4">
                                <h3 className="card-title text-lg mb-2">
                                    {isCreating ? 'Nueva Categoría' : 'Editar Categoría'}
                                </h3>

                                <div className="space-y-4">
                                    <div className="form-control space-y-1">
                                        <label className="label">
                                            <span className="label-text">Nombre</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            value={editingCategory.name}
                                            onChange={(e) => setEditingCategory({
                                                ...editingCategory,
                                                name: e.target.value
                                            })}
                                            placeholder="Nombre de la categoría"
                                        />
                                    </div>

                                    <div className="form-control space-y-1">
                                        <label className="label">
                                            <span className="label-text">Descripción</span>
                                        </label>
                                        <textarea
                                            className="textarea textarea-bordered w-full"
                                            value={editingCategory.description}
                                            onChange={(e) => setEditingCategory({
                                                ...editingCategory,
                                                description: e.target.value
                                            })}
                                            placeholder="Descripción de la categoría"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-control space-y-1">
                                        <label className="label">
                                            <span className="label-text">Ícono</span>
                                        </label>

                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                            {categoriesIcons.map((icon) => {
                                                const isSelected = editingCategory.icon.id === icon.id;

                                                return (
                                                    <button
                                                        key={icon.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingCategory({
                                                                ...editingCategory,
                                                                icon: icon
                                                            })
                                                        }
                                                        className={`
                                                    flex items-center justify-center aspect-square card
                                                    p-2 transition bg-base-200
                                                    ${isSelected
                                                                ? "bg-primary/20 border-primary"
                                                                : "border-base-300 hover:bg-base-300"}
                                                            `}
                                                    >
                                                        <span className="scale-75">{icon.svg}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={handleCancel}
                                            className="btn btn-ghost"
                                            disabled={saving}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="btn btn-primary gap-2"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Guardar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categories List */}
                    {!editingCategory && (
                        <div className="space-y-3">
                            {loading ? (
                                <div className="min-h-[40dvh] bg-base-200 flex items-center justify-center p-4">
                                    <div className="card w-full container bg-base-100 p-6">
                                        <div className="card-body items-center text-center">
                                            <span className="loading loading-spinner loading-lg text-primary"></span>
                                            <p className="mt-2">Cargando categorías...</p>
                                        </div>
                                    </div>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="min-h-[40dvh] bg-base-200 flex items-center justify-center p-4">
                                    <div className="card w-full container bg-base-100 p-6">
                                        <div className="card-body items-center text-center">
                                            <p className="mt-4 text-base-content/50">No hay categorías registradas.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                categories.map((category) => (
                                    <div key={category.id} className="card bg-base-100 border border-base-300">
                                        <div className="card-body p-3">
                                            <div className="flex justify-center sm:justify-between items-start flex-col sm:flex-row gap-3">
                                                <div className="flex items-center gap-2 flex-col w-full sm:flex-row">
                                                    <div className="bg-base-200 w-fit rounded-full p-4 bg-primary/10 scale-75">
                                                        {category.icon.svg}
                                                    </div>
                                                    <div className="flex-1 text-center sm:text-start">
                                                        <h3 className="font-semibold text-lg">{category.name}</h3>
                                                        <p className="text-base-content/70 mt-1">{category.description}</p>
                                                    </div>
                                                </div>

                                                {canManage && (
                                                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-end p-3">
                                                        <button
                                                            onClick={() => handleEdit(category)}
                                                            className="btn btn-warning btn-sm gap-1"
                                                            title="Editar"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category.id)}
                                                            className="btn btn-error btn-sm gap-1"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {confirmDialog && (
                <DialogConfirmDelete
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    );
};

export default ModalCategory;
