import React, { useCallback, useEffect, useState } from "react";
import { Filter, Search, Eye, Trash } from "lucide-react";
import { Client } from "../../../../core/models/ClientModel.ts";
import { useThemeColors } from "../../../hooks/useThemeColors.ts";
import { motion } from 'motion/react';
import { deleteClientById } from "../../../../api/userApi.ts";
import ConfirmDeleteCard from "../cards/ConfirmDeleteCard.tsx";
import EditClientModal from "../modals/EditClientModal.tsx";
import ClientMetricsCard from "../cards/ClientMetricsCard.tsx";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface ClientsSearchTableProps {
    loading: boolean;
    error: string | null;
    clients: Client[];
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

const ClientsSearchTable: React.FC<ClientsSearchTableProps> = ({
    loading,
    error,
    clients,
}) => {
    const [filter, setFilter] = useState<"all" | "admin" | "client" | "adviser">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmClientId, setConfirmClientId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    const filterClients = useCallback(() => {
        let filtered = clients;

        if (filter === "admin") {
            filtered = filtered.filter((c) => c.role.id === 1);
        } else if (filter === "client") {
            filtered = filtered.filter((c) => c.role.id === 2);
        } else if (filter === "adviser") {
            filtered = filtered.filter((c) => c.role.id === 3);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (c) =>
                    c.cedulaOrNIT.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.clientType.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredClients(filtered);
    }, [clients, filter, searchTerm]);

    useEffect(() => {
        filterClients();
    }, [filterClients]);


    const openEditModal = (client: Client) => {
        setSelectedClient(client);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedClient(null);
    };

    const openDetailsModal = (client: Client) => {
        setSelectedClient(client);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedClient(null);
    };

    if (loading) return <SearchTableSkeleton />;

    if (error)
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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
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
                                <div tabIndex={0} role="button" className="btn btn-outline btn-sm gap-2">
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
                                    <li>
                                        <button onClick={() => setFilter("all")}>Todos</button>
                                    </li>
                                    <li>
                                        <button onClick={() => setFilter("admin")}>Administradores</button>
                                    </li>
                                    <li>
                                        <button onClick={() => setFilter("client")}>Clientes</button>
                                    </li>
                                    <li>
                                        <button onClick={() => setFilter("adviser")}>Asesores</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de clientes */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6">
                    <h2 className="card-title mb-4 text-lg">Clientes</h2>

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
                                {filteredClients.map((client) => (
                                    <tr key={client.clientId}>
                                        <td>{client.legalName}</td>
                                        <td>{client.cedulaOrNIT}</td>
                                        <td>{client.clientType}</td>
                                        <td>{client.sector}</td>
                                        <td>
                                            <span className="badge badge-outline text-xs">{client.role.name}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-error btn-xs gap-1 whitespace-nowrap"
                                                onClick={() => setConfirmClientId(client.clientId)}
                                                disabled={deleting === client.clientId}
                                            >
                                                {deleting === client.clientId ? (
                                                    <span className="loading loading-spinner loading-xs" />
                                                ) : (
                                                    <Trash className="h-3 w-3" />
                                                )}
                                                {deleting === client.clientId ? "Eliminando..." : "Eliminar"}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-xs gap-1 whitespace-nowrap"
                                                onClick={() => openEditModal(client)}
                                            >
                                                <Eye className="h-3 w-3" />
                                                Editar
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-xs gap-1 whitespace-nowrap"
                                                onClick={() => openDetailsModal(client)}
                                            >
                                                <Eye className="h-3 w-3" />
                                                Ver detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista móvil */}
                    <div className="lg:hidden space-y-3">
                        {filteredClients.map((client) => (
                            <div key={client.clientId} className="card bg-base-200 p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-sm">{client.legalName}</h3>
                                        <p className="text-xs text-base-content/60">{client.cedulaOrNIT}</p>
                                    </div>
                                    <span className="badge badge-outline text-xs">{client.role.name}</span>
                                </div>
                                <div className="text-xs text-base-content/70">
                                    {client.clientType} - {client.sector}
                                </div>
                                <button
                                    className="btn btn-primary btn-xs gap-1"
                                    onClick={() => openDetailsModal(client)}
                                >
                                    <Eye className="h-3 w-3" /> Ver
                                </button>
                            </div>
                        ))}
                    </div>

                    {filteredClients.length === 0 && (
                        <div className="text-center py-8 text-base-content/50">
                            No se encontraron clientes
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de detalles */}
            {showDetailsModal && selectedClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-lg p-4 md:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg md:text-xl font-semibold">Detalles del Cliente</h2>
                            <button onClick={closeDetailsModal} className="btn btn-ghost btn-sm btn-circle">
                                ✕
                            </button>
                        </div>

                        {/* Info básica */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
                            <div>
                                <label className="text-sm font-medium text-base-content/70">Nombre Legal</label>
                                <p className="text-base-content">{selectedClient.legalName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-base-content/70">Cédula / NIT</label>
                                <p className="text-base-content">{selectedClient.cedulaOrNIT}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-base-content/70">Correo</label>
                                <p className="text-base-content">{selectedClient.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-base-content/70">Tipo de Cliente</label>
                                <p className="text-base-content">{selectedClient.clientType}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-base-content/70">Sector</label>
                                <p className="text-base-content">{selectedClient.sector}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-base-content/70">Rol</label>
                                <p className="text-base-content">{selectedClient.role.name}</p>
                            </div>
                        </div>

                        {/* Métricas del client card con gráficos */}
                        <h3 className="font-semibold mb-2">Métricas de Cuestionarios</h3>
                        {selectedClient.questionnaires.length > 0 ? (
                            <ClientMetricsCard client={selectedClient} />
                        ) : (
                            <p className="text-sm text-base-content/70">
                                Este cliente aún no ha completado cuestionarios.
                            </p>
                        )}
                        <div className="flex justify-end mt-6">
                            <button onClick={closeDetailsModal} className="btn btn-outline">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && selectedClient && (
                <EditClientModal
                    client={selectedClient}
                    onClose={closeEditModal}
                    onUpdate={(updatedClient) => {
                        setFilteredClients((prev) =>
                            prev.map((c) =>
                                c.clientId === updatedClient.clientId ? updatedClient : c
                            )
                        );
                    }}
                />
            )}

            {confirmClientId !== null && (
                <ConfirmDeleteCard
                    message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
                    onConfirm={async () => {
                        setDeleting(confirmClientId);
                        try {
                            await deleteClientById(confirmClientId);
                            setFilteredClients(prev => prev.filter(c => c.clientId !== confirmClientId));
                        } catch (error) {
                            console.error("Error al eliminar cliente:", error);
                        } finally {
                            setDeleting(null);
                            setConfirmClientId(null);
                        }
                    }}
                    onCancel={() => setConfirmClientId(null)}
                    loading={deleting === confirmClientId}
                />
            )}
        </div>
    );
};

export default ClientsSearchTable;
