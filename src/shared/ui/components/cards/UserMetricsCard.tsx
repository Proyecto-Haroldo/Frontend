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

interface UserMetricsCardProps {
    user: IUser;
    analysis: IAnalysis[];
}

const UserMetricsCard: React.FC<UserMetricsCardProps> = ({ user, analysis }) => {
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
                backgroundColor: ["#F87171", "#34D399", "#60A5FA", "#FBBF24"],
                borderWidth: 1,
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
                backgroundColor: "#60A5FA",
                borderRadius: 6,
            },
        ],
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card bg-base-100 shadow-md border border-base-200 rounded-2xl p-6 space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-base-200 pb-3">
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

            {/* Doughnut Chart */}
            <div className="flex flex-col items-center">
                <h3 className="font-medium text-base-content/80 mb-2">
                    Estado general de cuestionarios
                </h3>
                <div className="w-48 h-48">
                    <Doughnut data={doughnutData} />
                </div>
            </div>

            {/* Bar Chart */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    <h3 className="font-medium text-base-content/80">
                        Distribución por categoría
                    </h3>
                </div>
                <div className="w-full">
                    <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
            </div>
        </motion.div>
    );
};

export default UserMetricsCard;
