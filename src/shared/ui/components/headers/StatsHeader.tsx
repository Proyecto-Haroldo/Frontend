import React from 'react';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';
import { useThemeColors } from "../../../hooks/useThemeColors";
import { motion } from 'motion/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Questionnaire {
    id: number;
    categoryName: string;
    clientName: string;
    timeWhenSolved: string;
    state: string;
    recomendacionUsuario: string;
    colorSemaforo: string;
    analisisAsesor: string;
    conteo: number;
}

interface StatsHeaderProps {
    stats: {
        total: number;
        pending: number;
        completed: number;
        green: number;
        yellow: number;
        red: number;
    };
    questionnaires: Questionnaire[];
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
}

const SkeletonCard: React.FC = () => (
    <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body space-y-2">
            <Skeleton width="60%" height={14} />
            <Skeleton width="80%" height={20} />
        </div>
    </div>
);

const StatsHeaderSkeleton: React.FC = () => {
    const { base, highlight } = useThemeColors();

    return (
        <SkeletonTheme baseColor={base} highlightColor={highlight}>
            <div className="container mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Skeleton width={200} height={28} />
                    <Skeleton width={100} height={32} borderRadius={6} />
                </div>

                {/* Statistics Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                {/* Risk Distribution */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        </SkeletonTheme>
    );
};

const StatCard: React.FC<{
    label: string;
    value: number | string;
    icon?: React.ReactNode;
    valueClass?: string;
}> = ({ label, value, icon, valueClass }) => (
    <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-base-content/70">{label}</p>
                    <p className={`text-2xl font-bold ${valueClass || ''}`}>{value}</p>
                </div>
                {icon}
            </div>
        </div>
    </div>
);

const RiskCard: React.FC<{
    label: string;
    value: number;
    colorClass: string;
}> = ({ label, value, colorClass }) => (
    <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-base-content/70">{label}</p>
                    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${colorClass.replace('text-', 'bg-')}`}></div>
            </div>
        </div>
    </div>
);

const StatsHeader: React.FC<StatsHeaderProps> = ({
    loading,
    error,
    stats,
    questionnaires,
    onRefresh,
}) => {
    const uniqueClients = new Set(questionnaires.map((q) => q.clientName)).size;

    if (loading) {
        return (
            <StatsHeaderSkeleton />
        );
    }

    if (error) {
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
    }

    return (
        <div className="container mx-auto space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">Panel Administrativo</h1>
                <button onClick={onRefresh} className="btn btn-primary btn-sm gap-2">
                    <Clock className="h-4 w-4" />
                    Actualizar
                </button>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard label="Total Cuestionarios" value={stats.total} icon={<FileText className="h-8 w-8 text-primary" />} />
                <StatCard
                    label="Pendientes"
                    value={stats.pending}
                    icon={<Clock className="h-8 w-8 text-warning" />}
                    valueClass="text-warning"
                />
                <StatCard
                    label="Completados"
                    value={stats.completed}
                    icon={<CheckCircle className="h-8 w-8 text-success" />}
                    valueClass="text-success"
                />
                <StatCard
                    label="Clientes"
                    value={uniqueClients}
                    icon={<Users className="h-8 w-8 text-info" />}
                    valueClass="text-info"
                />
            </div>

            {/* Risk Distribution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <RiskCard label="Riesgo Verde" value={stats.green} colorClass="text-success" />
                <RiskCard label="Riesgo Amarillo" value={stats.yellow} colorClass="text-warning" />
                <RiskCard label="Riesgo Rojo" value={stats.red} colorClass="text-error" />
            </div>
        </div>
    );
};

export default StatsHeader;
