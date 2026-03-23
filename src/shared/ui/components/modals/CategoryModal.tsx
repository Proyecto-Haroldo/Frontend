import React, { useState, useEffect } from "react";
import { ICategory, mapCategoryToDTO } from "../../../../core/models/questionnaire";
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

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryCreated?: (category: ICategory) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
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

    const isAdmin = role === 1;
    const canManage = isAdmin;

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllCategories();
            console.log('Categories:', data);
            setCategories(data);
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
            description: ''
        });
    };

    const handleEdit = (category: ICategory) => {
        if (!canManage) return;
        
        setEditingCategory({ ...category });
        setIsCreating(false);
    };

    const handleDelete = async (id: number) => {
        if (!canManage) return;

        if (!confirm('¿Está seguro de que desea eliminar esta categoría? Esta acción podría afectar a los cuestionarios asociados.')) {
            return;
        }

        try {
            await deleteCategory(id);
            await fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            setError('Error al eliminar la categoría');
        }
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg p-4 md:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Gestionar Categorías</h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setError(null)}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Create Category Button */}
                {!editingCategory && canManage && (
                    <div className="mb-4">
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Nueva Categoría
                        </button>
                    </div>
                )}

                {/* Create/Edit Form */}
                {editingCategory && (
                    <div className="card bg-base-200 border border-base-300 mb-6">
                        <div className="card-body p-4">
                            <h3 className="card-title text-lg mb-4">
                                {isCreating ? 'Nueva Categoría' : 'Editar Categoría'}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="form-control">
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

                                <div className="form-control">
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
                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-8 text-base-content/50">
                                No hay categorías registradas
                            </div>
                        ) : (
                            categories.map((category) => (
                                <div key={category.id} className="card bg-base-200 border border-base-300">
                                    <div className="card-body p-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{category.name}</h3>
                                                <p className="text-base-content/70 mt-1">{category.description}</p>
                                            </div>
                                            
                                            {canManage && (
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="btn btn-warning btn-sm gap-1"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="btn btn-error btn-sm gap-1"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
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
    );
};

export default CategoryModal;
