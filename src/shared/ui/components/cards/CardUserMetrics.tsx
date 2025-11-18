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
import { User, BarChart2 } from "lucide-react";
import { IUser } from "../../../../core/models/user";
import { IAnalysis } from "../../../../core/models/analysis";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface CardUserMetricsProps {
    user: IUser;
    analysis: IAnalysis[];
}

const CardUserMetrics: React.FC<CardUserMetricsProps> = ({ user, analysis }) => {
    // Contar estados (pending, completed, etc.)
    const stateCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        analysis.forEach((q) => {
            counts[q.status] = (counts[q.status] || 0) + 1;
        });
        return counts;
    }, [user]);

    // Agrupar por categoría
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        analysis.forEach((q) => {
            const category = q.categoria || "Sin categoría";
            counts[category] = (counts[category] || 0) + (q.conteo || 0);
        });
        return counts;
    }, [user]);

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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card shadow-md border border-base-200 rounded-2xl space-y-6"
        >
            {/* Header */}
            <div className="card bg-base-100 flex flex-row p-4 gap-3 border-b border-base-200">
                <div className="p-2 bg-primary/10 rounded-full">
                    <User className="text-primary h-6 w-6" />
                </div>
                <div>
                    <h2 className="font-semibold text-base-content">{user.legalName}</h2>
                    <p className="text-sm text-base-content/70">
                        {user.role?.name} • {user.sector}
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
                            Visualiza el estado actual de los cuestionarios completados, pendientes y en progreso.
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
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CardUserMetrics;
