import { useMemo, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    RadarController,
    RadialLinearScale,
    Tooltip,
    Legend,
    Filler,
    Title,
} from "chart.js";
import { Bar, Pie, Line, Bubble } from "react-chartjs-2";
import { motion } from "framer-motion";
import { IAnalysis } from "../../../core/models/analysis";

// Registrar todos los módulos de Chart.js necesarios
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    RadarController,
    RadialLinearScale,
    Tooltip,
    Legend,
    Filler,
    Title
);

interface MetricsTemplateProps {
    loading: boolean;
    error: string | null;
    analysis: IAnalysis[];
}

type FiltersByTime = "day" | "week" | "month" | "year";

// Paletas de color separadas
const MAIN_COLORS = [
    "#7A00D6",  // Violeta
    "#6A1AB6",  // Violeta-Añil
    "#4B0082",  // Añil
    "#3C4D91",  // Añil-Azul
    "#0000FF",  // Azul
    "#007FFF",  // Azul-verde
    "#00B2A4",  // Azul-verde-Verde
    "#00FF00",  // Verde
    "#66FF33",  // Verde-amarillo
    "#ADFF2F",  // Verde-amarillo
    "#FFFF00",  // Amarillo
    "#FFEA00",  // Amarillo-naranja
    "#FF9A00",  // Naranja
    "#FF4500",  // Naranja-rojo
    "#FF0000",  // Rojo
    "#D700A5",  // Fucsia
    "#b900d1"   // Magenta 
];
const SEMAFORO_COLORS = {
    verde: "#22c55e",
    amarillo: "#eab308",
    rojo: "#ef4444",
};

const SkeletonCard = () => (
    <div className="bg-base-200 animate-pulse rounded-2xl p-4 h-64 shadow-sm" />
);

export default function MetricsTemplate({ loading, error, analysis }: MetricsTemplateProps) {
    const [filter, setFilter] = useState<FiltersByTime>("month");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<string>("all");

    // Filtrado
    const filteredData = useMemo(() => {
        const now = new Date();
        return analysis.filter((a) => {
            const date = new Date(a.timeWhenSolved);
            const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

            const dateFilter =
                filter === "day"
                    ? diffDays <= 1
                    : filter === "week"
                        ? diffDays <= 7
                        : filter === "month"
                            ? diffDays <= 30
                            : diffDays <= 365;

            const categoryFilter = selectedCategory === "all" || a.categoria === selectedCategory;
            const clientFilter = selectedUser === "all" || a.clientName === selectedUser;

            return dateFilter && categoryFilter && clientFilter;
        });
    }, [filter, selectedCategory, selectedUser, analysis]);

    // Agrupaciones
    const byCategory = useMemo(() => {
        const map: Record<string, number> = {};
        filteredData.forEach((a) => (map[a.categoria] = (map[a.categoria] || 0) + 1));
        return Object.entries(map);
    }, [filteredData]);

    const byState = useMemo(() => {
        const map: Record<string, number> = {};
        filteredData.forEach((a) => (map[a.status] = (map[a.status] || 0) + 1));
        return Object.entries(map);
    }, [filteredData]);

    const bySemaforo = useMemo(() => {
        const map: Record<string, number> = { verde: 0, amarillo: 0, rojo: 0 };

        filteredData.forEach((a) => {
            const key = a.colorSemaforo?.toLowerCase();
            if (map[key] !== undefined) map[key]++;
        });

        return Object.entries(map);
    }, [filteredData]);

    // Helper: genera puntos aleatorios no superpuestos y alejados de los bordes ===
    const generateNonOverlappingPoints = (
        count: number,
        minDistance: number,
        min: number = 3,
        max: number = 7
    ) => {
        const points: { x: number; y: number }[] = [];

        while (points.length < count) {
            // genera números *solo* entre min y max
            const x = Math.random() * (max - min) + min;
            const y = Math.random() * (max - min) + min;

            // evita puntos demasiado cercanos
            const tooClose = points.some(
                (p) => Math.hypot(p.x - x, p.y - y) < minDistance
            );

            if (!tooClose) points.push({ x, y });
        }

        return points;
    };

    // Semáforo data con márgenes internos seguros ===
    const semaforoData = useMemo(() => {
        const total = bySemaforo.reduce((acc, [, value]) => acc + (value), 0);
        if (total === 0) {
            return {
                datasets: [
                    {
                        label: "Sin datos",
                        data: [{ x: 5, y: 5, r: 0 }],
                        backgroundColor: "#6b7280",
                    },
                ],
            };
        }

        // genera puntos dentro del rango seguro (entre 3 y 7)
        const points = generateNonOverlappingPoints(bySemaforo.length, 3, 3, 7);

        return {
            datasets: bySemaforo.map(([key, value], index) => {
                const porcentaje = (value) / total;
                const radio = porcentaje * 100;
                const { x, y } = points[index];

                return {
                    label: `${key} (${(porcentaje * 100).toFixed(1)}%)`,
                    data: [{ x, y, r: radio }],
                    backgroundColor: SEMAFORO_COLORS[key as keyof typeof SEMAFORO_COLORS],
                    borderColor: "#fff",
                    borderWidth: 0,
                    hoverBorderWidth: 0,
                };
            }),
        };
    }, [bySemaforo]);

    const byDate = useMemo(() => {
        const map: Record<string, number> = {};
        filteredData.forEach((a) => {
            const date = new Date(a.timeWhenSolved).toLocaleDateString();
            map[date] = (map[date] || 0) + 1;
        });
        return Object.entries(map);
    }, [filteredData]);

    const byUser = useMemo(() => {
        const map: Record<string, number> = {};
        filteredData.forEach((a) => (map[a.clientName] = (map[a.clientName] || 0) + 1));
        return Object.entries(map);
    }, [filteredData]);

    if (loading)
        return (
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );

    if (error)
        return <div className="text-error bg-error/10 p-4 rounded-lg text-center">Error: {error}</div>;

    // Helper para Chart Data
    const createChartData = (labels: string[], values: number[], label: string, colors = MAIN_COLORS) => ({
        labels,
        datasets: [
            {
                label,
                data: values,
                backgroundColor: colors,
                borderRadius: 10,
                borderWidth: 0,
                fill: true,
            },
        ],
    });

    // Configuración global 
    const chartOptions = {
        responsive: true,
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 3,
            },
            point: {
                radius: 5,
                hoverRadius: 8,
            },
        },
        legend: {
            labels: {
                color: "#fff",
                font: { size: 13, weight: "bold" },
                usePointStyle: true,
                pointStyle: 'line',
            },
            tooltip: {
                backgroundColor: "#1c1c1c",
                borderColor: "#333",
                borderWidth: 1,
                titleColor: "#fff",
                bodyColor: "#fff",
                cornerRadius: 8,
                padding: 10,
            },
        },
        scales: {
            x: {
                ticks: { color: "#ccc" },
                grid: { color: "#333", display: false },
            },
            y: {
                ticks: { color: "#ccc" },
                grid: { color: "#333" },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-semibold">Overview de Análisis</h2>
                <div className="flex flex-wrap gap-3">
                    {["day", "week", "month", "year"].map((key) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key as FiltersByTime)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === key
                                ? "bg-primary text-white"
                                : "bg-base-200 hover:bg-base-300"
                                }`}
                        >
                            {key === "day" && "Hoy"}
                            {key === "week" && "Semana"}
                            {key === "month" && "Mes"}
                            {key === "year" && "Año"}
                        </button>
                    ))}
                    <select
                        value={selectedCategory}
                        title="category"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="select select-sm bg-base-200 rounded-xl"
                    >
                        <option value="all">Todas las categorías</option>
                        {Array.from(new Set(analysis.map((a) => a.categoria))).map((cat) => (
                            <option key={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={selectedUser}
                        title="client"
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="select select-sm bg-base-200 rounded-xl"
                    >
                        <option value="all">Todos los clientes</option>
                        {Array.from(new Set(analysis.map((a) => a.clientName))).map((client) => (
                            <option key={client}>{client}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categorías */}
                <motion.div className="card bg-base-100 p-4 rounded-2xl shadow-sm">
                    <h3 className="font-semibold mb-2">Distribución por Categoría</h3>
                    <Bar data={createChartData(byCategory.map(x => x[0]), byCategory.map(x => x[1] as number), "Categorías")} options={chartOptions} />
                </motion.div>

                {/* Evolución Temporal */}
                <motion.div className="card bg-base-100 p-4 rounded-2xl shadow-sm">
                    <h3 className="font-semibold mb-2">Evolución Temporal</h3>
                    <Line data={createChartData(byDate.map(x => x[0]), byDate.map(x => x[1] as number), "Por Fecha")} options={chartOptions} />
                </motion.div>

                {/* Semáforo con Bubble Chart */}
                <motion.div className="card bg-base-100 p-4 rounded-2xl shadow-sm md:col-span-2">
                    <h3 className="font-semibold mb-2">Evaluación Semáforo</h3>
                    <p className="text-sm text-base-content/70 mb-3">
                        Cada burbuja representa un nivel de riesgo: verde (bueno), amarillo (medio) y rojo (crítico).
                    </p>
                    <Bubble data={semaforoData} options={{
                        ...chartOptions,
                        scales: {
                            x: {
                                min: 0,
                                max: 10,
                                ticks: { color: "#ccc" },
                                grid: { color: "#333", display: false },
                            },
                            y: {
                                min: 0,
                                max: 10,
                                ticks: { color: "#ccc" },
                                grid: { color: "#333" },
                                beginAtZero: true,
                            },
                        },
                    }} />
                </motion.div>

                {/* Estados */}
                <motion.div className="card bg-base-100 p-4 rounded-2xl shadow-sm">
                    <h3 className="font-semibold mb-2">Estados de Análisis</h3>
                    <Pie className="max-h-50" data={createChartData(byState.map(x => x[0]), byState.map(x => x[1] as number), "Estados")} options={chartOptions} />
                </motion.div>

                {/* Por Usuario */}
                <motion.div className="card bg-base-100 p-4 rounded-2xl shadow-sm">
                    <h3 className="font-semibold mb-2">Análisis por Usuario</h3>
                    <Line
                        data={createChartData(byUser.map(x => x[0]), byUser.map(x => x[1] as number), "Análisis")}
                        options={{
                            ...chartOptions,
                            scales: {
                                x: {
                                    ticks: { color: "#ccc", display: false },
                                    grid: { color: "#333", display: false },
                                },
                                y: {
                                    ticks: { color: "#ccc" },
                                    grid: { color: "#333" },
                                    beginAtZero: true,
                                },
                            },
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
