import React, { useCallback, useEffect, useState } from "react";
import { Filter, Search, Eye, Trash } from "lucide-react";
import { IUser } from "../../../../core/models/user.ts";
import { useThemeColors } from "../../../hooks/useThemeColors.ts";
import { motion } from 'motion/react';
import { IAnalysis } from "../../../../core/models/analysis.ts";
import { getUserAnalysis } from "../../../../api/analysisApi.ts";
import { deleteUserById } from "../../../../api/userApi.ts";
import CardConfirmDelete from "../cards/CardConfirmDelete.tsx";
import ModalEditUser from "../modals/ModalEditUser.tsx";
import CardUserMetrics from "../cards/CardUserMetrics.tsx";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface TableSearchUsersProps {
    users: IUser[];
    loading: boolean;
    error: string | null;
    role: number | null;
}

const SearchTableSkeleton: React.FC = () => {
    const { base, highlight } = useThemeColors();

    return (
        <SkeletonTheme baseColor={base} highlightColor={highlight}>
            <div className="container mx-auto space-y-4 md:space-y-6">
                {/* Filtros y búsqueda */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-3 md:p-6 space-y-4">
                        <div className="flex flex-col gap-3">
                            {/* Search Input */}
                            <div>
                                <Skeleton height={40} borderRadius={8} />
                            </div>
                            {/* Filter Button */}
                            <div className="flex gap-2">
                                <Skeleton width={100} height={32} borderRadius={6} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de Cuestionarios */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-3 md:p-6">
                        <Skeleton width={150} height={20} className="mb-4" />

                        {/* Vista de escritorio */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td><Skeleton width={120} height={16} /></td>
                                            <td><Skeleton width={100} height={16} /></td>
                                            <td><Skeleton width={90} height={16} /></td>
                                            <td><Skeleton width={80} height={16} /></td>
                                            <td><Skeleton width={100} height={16} /></td>
                                            <td><Skeleton width={60} height={30} borderRadius={6} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Vista móvil */}
                        <div className="lg:hidden space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="card bg-base-200 p-4 space-y-3 border border-base-300 rounded-lg"
                                >
                                    <Skeleton width="60%" height={16} />
                                    <Skeleton width="40%" height={14} />
                                    <div className="flex justify-between items-center">
                                        <Skeleton width="30%" height={14} />
                                        <Skeleton width="30%" height={30} borderRadius={6} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </SkeletonTheme>
    );
};

const TableSearchUsers: React.FC<TableSearchUsersProps> = ({
    loading,
    error,
    role,
    users,
}) => {
    const [filter, setFilter] = useState<"all" | "admin" | "client" | "adviser">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [selectedUserAnalysis, setSelectedUserAnalysis] = useState<IAnalysis[]>([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmUserId, setConfirmUserId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    const filterUsers = useCallback(() => {
        let filtered = users;

        if (filter === "admin") {
            filtered = filtered.filter((u) => u.role.id === 1);
        } else if (filter === "client") {
            filtered = filtered.filter((u) => u.role.id === 2);
        } else if (filter === "adviser") {
            filtered = filtered.filter((u) => u.role.id === 3);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (u) =>
                    u.cedulaOrNIT.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.clientType.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [users, filter, searchTerm]);

    const fetchUserAnalysis = async (userId: number) => {
        try {
            const data = await getUserAnalysis(userId);
            setSelectedUserAnalysis(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error fetching analysis:', error.message);
            } else {
                console.error('Unexpected error fetching analysis:', error);
            }
        }
    };

    useEffect(() => {
        filterUsers();
    }, [filterUsers]);

    useEffect(() => {
        if (typeof selectedUser?.userId === "number") {
            // selectedUser.userId is guaranteed to be a number here
            fetchUserAnalysis(selectedUser.userId);
        } else {
            setSelectedUserAnalysis([]);
        }
    }, [selectedUser]);

    const openEditModal = (user: IUser) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedUser(null);
    };

    const openDetailsModal = (user: IUser) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedUser(null);
    };

    console.log("SelectedUser:", selectedUser);


    if (loading) return <SearchTableSkeleton />;

    if (error || role !== 1)
        return (
            <div className="container mx-auto p-3">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-error shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </motion.div>
            </div>
        );

    return (
        <div className="container mx-auto space-y-4 md:space-y-6">
            {/* Filtros y búsqueda */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6">
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50 z-10" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, NIT o sector..."
                                className="input input-bordered w-full pl-10 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-outline btn-sm gap-2 text-base-content/50">
                                    <Filter className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {filter === "all"
                                            ? "Todos"
                                            : filter === "admin"
                                                ? "Administradores"
                                                : filter === "client"
                                                    ? "Clientes"
                                                    : "Asesores"}
                                    </span>
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                                >
                                    <li key={"all"}>
                                        <button onClick={() => setFilter("all")}>Todos</button>
                                    </li>
                                    <li key={"admin"}>
                                        <button onClick={() => setFilter("admin")}>Administradores</button>
                                    </li>
                                    <li key={"client"}>
                                        <button onClick={() => setFilter("client")}>Clientes</button>
                                    </li>
                                    <li key={"adviser"}>
                                        <button onClick={() => setFilter("adviser")}>Asesores</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6">
                    <h2 className="card-title mb-4 text-lg">Usuarios</h2>

                    <div className="hidden lg:block overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Nombre Legal</th>
                                    <th>Cédula/NIT</th>
                                    <th>Tipo</th>
                                    <th>Sector</th>
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.userId}>
                                        <td>{user.legalName}</td>
                                        <td>{user.cedulaOrNIT}</td>
                                        <td>{user.clientType}</td>
                                        <td>{user.sector}</td>
                                        <td>
                                            <span className="badge badge-outline text-xs">{user.role.name}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-xs gap-1 whitespace-nowrap"
                                                onClick={() => openDetailsModal(user)}
                                            >
                                                <Eye className="h-3 w-3" />
                                                Ver detalles
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-xs gap-1 whitespace-nowrap"
                                                onClick={() => openEditModal(user)}
                                            >
                                                <Eye className="h-3 w-3" />
                                                Editar
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-error btn-xs gap-1 whitespace-nowrap"
                                                onClick={() => setConfirmUserId(user.userId)}
                                                disabled={deleting === user.userId}
                                            >
                                                {deleting === user.userId ? (
                                                    <span className="loading loading-spinner loading-xs" />
                                                ) : (
                                                    <Trash className="h-3 w-3" />
                                                )}
                                                {deleting === user.userId ? "Eliminando..." : "Eliminar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista móvil */}
                    <div className="lg:hidden space-y-3">
                        {filteredUsers.map((user) => (
                            <div key={user.userId} className="card bg-base-200 p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-sm">{user.legalName}</h3>
                                        <p className="text-xs text-base-content/60">{user.cedulaOrNIT}</p>
                                    </div>
                                    <span className="badge badge-outline text-xs">{user.role.name}</span>
                                </div>
                                <div className="text-xs text-base-content/70">
                                    {user.clientType} - {user.sector}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <button
                                        className="btn btn-primary btn-xs gap-1"
                                        onClick={() => openDetailsModal(user)}
                                    >
                                        <Eye className="h-3 w-3" /> Ver
                                    </button>
                                    <button
                                        className="btn btn-primary btn-xs gap-1 whitespace-nowrap"
                                        onClick={() => openEditModal(user)}
                                    >
                                        <Eye className="h-3 w-3" />
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-error btn-xs gap-1 whitespace-nowrap"
                                        onClick={() => setConfirmUserId(user.userId)}
                                        disabled={deleting === user.userId}
                                    >
                                        {deleting === user.userId ? (
                                            <span className="loading loading-spinner loading-xs" />
                                        ) : (
                                            <Trash className="h-3 w-3" />
                                        )}
                                        {deleting === user.userId ? "Eliminando..." : "Eliminar"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-base-content/50">
                            No se encontraron usuarios.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de detalles */}
            {showDetailsModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-200 rounded-lg p-4 md:p-6 max-w-3xl w-full max-h-[90vh] flex flex-col">

                        {/* Header fijo */}
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-xl md:text-xl font-semibold">Detalles del Usuario</h2>
                            <button onClick={closeDetailsModal} className="btn btn-ghost btn-sm btn-circle">
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto overflow-x-hidden pr-1 flex-1">
                            {/* Info básica */}
                            <h3 className="font-semibold mb-2">Información Personal</h3>
                            <div className="grid grid-cols-1 card bg-base-100 p-4 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
                                <div>
                                    <label className="text-sm font-medium text-base-content/70">Nombre Legal</label>
                                    <p className="text-base-content">{selectedUser.legalName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-base-content/70">Cédula / NIT</label>
                                    <p className="text-base-content">{selectedUser.cedulaOrNIT}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-base-content/70">Correo</label>
                                    <p className="text-base-content">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-base-content/70">Tipo de Cliente</label>
                                    <p className="text-base-content">{selectedUser.clientType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-base-content/70">Sector</label>
                                    <p className="text-base-content">{selectedUser.sector}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-base-content/70">Rol</label>
                                    <p className="text-base-content">{selectedUser.role.name}</p>
                                </div>
                            </div>

                            {/* Métricas */}
                            <h3 className="font-semibold mb-2">Métricas de Cuestionarios</h3>
                            {selectedUserAnalysis.length > 0 ? (
                                <CardUserMetrics user={selectedUser} analysis={selectedUserAnalysis} />
                            ) : (
                                <p className="text-sm text-base-content/70">
                                    Este cliente aún no ha completado cuestionarios.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de edición */}
            {showEditModal && selectedUser && (
                <ModalEditUser
                    user={selectedUser}
                    onClose={closeEditModal}
                    onUpdate={(updatedUser) => {
                        setFilteredUsers((prev) =>
                            prev.map((u) =>
                                u.userId === updatedUser.userId ? updatedUser : u
                            )
                        );
                    }}
                />
            )}

            {confirmUserId !== null && (
                <CardConfirmDelete
                    message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
                    onConfirm={async () => {
                        setDeleting(confirmUserId);
                        try {
                            await deleteUserById(confirmUserId);
                            setFilteredUsers(prev => prev.filter(u => u.userId !== confirmUserId));
                        } catch (error) {
                            console.error("Error al eliminar cliente:", error);
                        } finally {
                            setDeleting(null);
                            setConfirmUserId(null);
                        }
                    }}
                    onCancel={() => setConfirmUserId(null)}
                    loading={deleting === confirmUserId}
                />
            )}
        </div>
    );
};

export default TableSearchUsers;
