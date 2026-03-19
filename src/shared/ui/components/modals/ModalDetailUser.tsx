import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { User, BarChart2, XCircle, Loader2 } from "lucide-react";
import { IUser } from "../../../../core/models/user";
import { IAnalysis } from "../../../../core/models/analysis";
import { normalizeUserRole } from "../../../../api/usersApi";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ModalDetailUserProps {
    user: IUser;
    loading: boolean;
    error: string | null;
    analysis: IAnalysis[];
    onClose: () => void;
}

const ModalDetailUser: React.FC<ModalDetailUserProps> = ({ user, analysis, error, loading, onClose }) => {
    // Contar estados (pending, completed, etc.)
    const stateCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        analysis.forEach((q) => {
            counts[q.status] = (counts[q.status] || 0) + 1;
        });
        return counts;
    }, [analysis]);

    // Agrupar por categoría
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        analysis.forEach((q) => {
            const category = q.categoryName || "Sin categoría";
            counts[category] = (counts[category] || 0) + (q.conteo || 0);
        });
        return counts;
    }, [analysis]);

    // Datos para Doughnut (estados)
    const doughnutData = {
        labels: Object.keys(stateCounts),
        datasets: [
            {
                data: Object.values(stateCounts),
                backgroundColor: ["#FBBF24", "#60A5FA", "#34D399", "#F87171"],
                borderWidth: 0,
            },
        ],
    };

    // Datos para Bar (categorías)
    const barData = {
        labels: Object.keys(categoryData),
        datasets: [
            {
                label: "Conteo por categoría",
                data: Object.values(categoryData),
                backgroundColor: ["#F87171", "#34D399", "#60A5FA", "#FBBF24"],
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: false,
        maintainAspectRatio: false,
    };

    if (loading) {
        return (
            <div className="container mx-auto space-y-6 overflow-hidden">
                <div className="flex items-center justify-center min-h-dvh">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="ml-2">Cargando métricas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-base-200 p-4">
                <div className="card w-full max-w-lg bg-base-100 shadow-xl text-center">
                    <div className="card-body">
                        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="h-8 w-8 text-error" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">{error ? 'Ups, ha ocurrido un error!' : 'Análisis no encontrado.'}</h2>
                        <p className="text-base-content/70">
                            {error || 'No se encontró información del análisis solicitado. Por favor, intente seleccionar un análisis desde la lista.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-200 rounded-lg p-4 md:p-6 max-w-3xl w-full max-h-[90vh] flex flex-col">

                {/* Header fijo */}
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h2 className="text-xl md:text-xl font-semibold">Detalles del Usuario</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto overflow-x-hidden pr-1 flex-1">
                    {/* Info básica */}
                    <h3 className="font-semibold mb-2">Información Personal</h3>
                    <div className="grid grid-cols-1 shadow-sm card bg-base-100 p-4 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
                        <div>
                            <label className="text-sm font-medium text-base-content/70">Nombre Legal</label>
                            <p className="text-base-content">{user.legalName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-base-content/70">Cédula / NIT</label>
                            <p className="text-base-content">{user.cedulaOrNIT}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-base-content/70">Correo</label>
                            <p className="text-base-content">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-base-content/70">Tipo de Cliente</label>
                            <p className="text-base-content">{user.clientType}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-base-content/70">Sector</label>
                            <p className="text-base-content">{user.sector || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-base-content/70">Rol</label>
                            <p className="text-base-content">{normalizeUserRole(user.role.id)}</p>
                        </div>
                    </div>

                    {/* Métricas */}
                    <h3 className="font-semibold mb-2">Métricas de Cuestionarios</h3>

                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="card w-full bg-base-100 shadow-sm border border-base-200">
                                <div className="card-body items-center text-center">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                                    <p className="mt-4">Buscando métricas...</p>
                                </div>
                            </div>
                        </div>
                    ) : analysis.length <= 0 ? (
                        <p className="text-sm text-base-content/70 card bg-base-100 flex flex-row p-4 gap-3 border-b border-base-200">
                            Este cliente aún no ha completado cuestionarios.
                        </p>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="card border border-base-200 rounded-2xl space-y-6"
                        >
                            {/* Header */}
                            <div className="card bg-base-100 shadow-sm flex flex-row p-4 gap-3 border-b border-base-200">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <User className="text-primary h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-base-content">{user.legalName}</h2>
                                    <p className="text-sm text-base-content/70">
                                        {normalizeUserRole(user.role?.id)} · {user.sector}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Doughnut Chart */}
                                <div className="card bg-base-100 shadow-md p-4 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 pb-1">
                                            <div className="p-2 bg-primary/10 rounded-full">
                                                <BarChart2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-base-content">
                                                Estado de cuestionarios
                                            </h3>
                                        </div>
                                        <small className="text-base-content/60">
                                            Visualiza el estado actual de los cuestionarios completados, pendientes y en revisión.
                                        </small>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <div className="flex justify-center w-48 h-48">
                                            <Doughnut data={doughnutData} options={options} />
                                        </div>
                                    </div>
                                </div>

                                {/* Bar Chart */}
                                <div className="card bg-base-100 shadow-md p-4 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 pb-1">
                                            <div className="p-2 bg-primary/10 rounded-full">
                                                <BarChart2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-base-content">
                                                Distribución por categoría
                                            </h3>
                                        </div>
                                        <small className="text-base-content/60">
                                            Muestra cómo se distribuyen los cuestionarios entre las diferentes categorías.
                                        </small>
                                    </div>

                                    <div className="w-full">
                                        <Bar
                                            data={barData}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    },
                                                },
                                                scales: {
                                                    x: {
                                                        ticks: { color: '#ccc' },
                                                        grid: { display: false },
                                                    },
                                                    y: {
                                                        ticks: { color: '#ccc' },
                                                        grid: { color: '#333' },
                                                        beginAtZero: true,
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalDetailUser;
