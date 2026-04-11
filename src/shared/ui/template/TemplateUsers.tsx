import React, { useCallback, useEffect, useState } from "react";
import { Filter, Search, Eye, Trash2, Loader2, Edit } from "lucide-react";
import { IUser } from "../../../core/models/user.ts";
import { motion } from 'motion/react';
import { IAnalysis } from "../../../core/models/analysis.ts";
import { getUserAnalysis } from "../../../api/analysisApi.ts";
import { deleteUserById, normalizeUserRole } from "../../../api/usersApi.ts";
import DialogConfirmDelete from "../components/dialogs/DialogConfirmDelete.tsx";
import ModalEditUser from "../components/modals/ModalEditUser.tsx";
import ModalDetailUser from "../components/modals/ModalDetailUser.tsx";

interface TemplateUsersProps {
    users: IUser[];
    loading: boolean;
    error: string | null;
    role: number | null;
}

const TemplateUsers: React.FC<TemplateUsersProps> = ({
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
    const [loadingAnalysis, setLoadingAnalysis] = useState(true);
    const [errorAnalysis, setErrorAnalysis] = useState("");
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [toConfirm, setToConfirm] = useState<number | null>(null);
    const [toDelete, setToDelete] = useState<number | null>(null);

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

        // Ordenar para que los UNAUTHORIZED vayan primero
        filtered = filtered.sort((a, b) => {
            if (a.status === "UNAUTHORIZED" && b.status !== "UNAUTHORIZED") return -1;
            if (a.status !== "UNAUTHORIZED" && b.status === "UNAUTHORIZED") return 1;
            return 0;
        });

        setFilteredUsers(filtered);
    }, [users, filter, searchTerm]);

    const fetchUserAnalysis = async (userId: number) => {
        try {
            setLoadingAnalysis(true);
            const data = await getUserAnalysis(userId);
            setSelectedUserAnalysis(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error fetching analysis:", error.message);
                setErrorAnalysis(error.message);
            } else {
                console.error("Unexpected error fetching analysis:", error);
                setErrorAnalysis("Unexpected error occurred");
            }
        } finally {
            setLoadingAnalysis(false);
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

    if (loading)
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
                                <div className="dropdown dropdown-start">
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
                                        className="dropdown-content z-[1] menu p-2 shadow-md bg-base-300 mt-2 rounded-box w-52"
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

                <div className="container mx-auto space-y-6 overflow-hidden">
                    <div className="flex items-center justify-center">
                        <div className="card w-full bg-base-100 shadow-sm border border-base-200">
                            <div className="card-body items-center text-center">
                                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                                <p className="mt-4">Cargando usuarios...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

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
                            <div className="dropdown dropdown-start">
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
                                    className="dropdown-content z-[1] menu p-2 shadow-md bg-base-300 mt-2 rounded-box w-52"
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
                    <h2 className="card-title mb-2 lg:mb-4 text-lg">Usuarios</h2>

                    <div className="hidden lg:block overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre Legal</th>
                                    <th>Rol</th>
                                    <th>Cédula/NIT</th>
                                    <th>Tipo</th>
                                    <th>Sector</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="[&>tr:hover>td]:bg-base-200/70 [&>tr:hover>td:first-child]:rounded-l-lg [&>tr:hover>td:last-child]:rounded-r-lg">
                                {filteredUsers.map((user) => (
                                    <tr key={user.userId} className={user.status === "UNAUTHORIZED" ? "opacity-70" : ""}>
                                        <td>{user.userId}</td>
                                        <td className="font-semibold">{user.legalName}</td>
                                        <td>
                                            <span className="badge badge-outline font-semibold border-0 bg-base-content/30 text-xs badge-sm">{normalizeUserRole(user.role.id)}</span>
                                        </td>
                                        <td>{user.cedulaOrNIT}</td>
                                        <td>
                                            <span className="badge badge-outline font-semibold border-0 bg-base-content/30 capitalize text-xs badge-sm">{user.clientType.toLocaleLowerCase()}</span>
                                        </td>
                                        <td>{user.sector || "No especificado"}</td>
                                        <td>
                                            <span className="badge badge-outline font-semibold border-0 bg-base-content/30 capitalize text-xs badge-sm">{user.status === "UNAUTHORIZED" ? "Inactivo" : "Activo"}</span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">

                                                <button
                                                    className="btn btn-info btn-xs gap-1 whitespace-nowrap"
                                                    onClick={() => openDetailsModal(user)}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    <p className="whitespace-nowrap">Ver</p>
                                                </button>

                                                <button
                                                    className="btn btn-warning btn-xs gap-1 whitespace-nowrap"
                                                    onClick={() => openEditModal(user)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                    Editar
                                                </button>

                                                <button
                                                    className="btn btn-error btn-xs gap-1 whitespace-nowrap"
                                                    onClick={() => setToConfirm(user.userId)}
                                                    disabled={toDelete === user.userId}
                                                >
                                                    {toDelete === user.userId ? (
                                                        <span className="loading loading-spinner loading-xs" />
                                                    ) : (
                                                        <Trash2 className="h-3 w-3" />
                                                    )}
                                                    {toDelete === user.userId ? "Eliminando..." : "Eliminar"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista móvil */}
                    <div className="lg:hidden space-y-3">
                        {filteredUsers.map((user) => (
                            <div key={user.userId} className={`card bg-base-200 p-4 space-y-2 ${user.status === "UNAUTHORIZED" ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-xs text-base-content/70 whitespace-nowrap">#{user.userId}</span>
                                    <span className="badge badge-outline font-semibold border-0 bg-base-content/30 text-xs badge-sm">{user.status === "UNAUTHORIZED" ? "Inactivo" : "Activo"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex justify-between w-full">
                                        <h3 className="font-semibold text-sm">{user.legalName}</h3>
                                        <span className="text-xs text-base-content/60">{user.cedulaOrNIT}</span>
                                    </div>
                                    <p className="text-xs capitalize text-base-content/70">
                                        {user.clientType.toLocaleLowerCase()} · {user.sector}
                                    </p>
                                    <span className="badge badge-outline font-semibold border-0 bg-base-content/30 text-xs badge-sm mt-2">{normalizeUserRole(user.role.id)}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <button
                                        className="btn btn-info btn-xs gap-1"
                                        onClick={() => openDetailsModal(user)}
                                    >
                                        <Eye className="h-3 w-3" /> Ver
                                    </button>
                                    <button
                                        className="btn btn-warning btn-xs gap-1 whitespace-nowrap"
                                        onClick={() => openEditModal(user)}
                                    >
                                        <Edit className="h-3 w-3" />
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-error btn-xs gap-1 whitespace-nowrap"
                                        onClick={() => setToConfirm(user.userId)}
                                        disabled={toDelete === user.userId}
                                    >
                                        {toDelete === user.userId ? (
                                            <span className="loading loading-spinner loading-xs" />
                                        ) : (
                                            <Trash2 className="h-3 w-3" />
                                        )}
                                        {toDelete === user.userId ? "Eliminando..." : "Eliminar"}
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
                <ModalDetailUser
                    onClose={closeDetailsModal}
                    loading={loadingAnalysis}
                    error={errorAnalysis}
                    user={selectedUser}
                    analysis={selectedUserAnalysis}
                />
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

            {toConfirm !== null && (
                <DialogConfirmDelete
                    message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
                    onConfirm={async () => {
                        setToDelete(toConfirm);
                        try {
                            await deleteUserById(toConfirm);
                            setFilteredUsers(prev => prev.filter(u => u.userId !== toConfirm));
                        } catch (error) {
                            console.error("Error al eliminar cliente:", error);
                        } finally {
                            setToDelete(null);
                            setToConfirm(null);
                        }
                    }}
                    onCancel={() => setToConfirm(null)}
                    loading={toDelete === toConfirm}
                />
            )}
        </div>
    );
};

export default TemplateUsers;
