import useEmblaCarousel from 'embla-carousel-react';
import React, { useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IQuestion } from '../../../core/models/question';
import { IUser } from '../../../core/models/user';
import { IQuestionnaire } from '../../../core/models/questionnaire';
import { IAnalysis } from '../../../core/models/analysis';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler,
    Title,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Registrar elementos de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler,
    Title
);

interface MetricsCarouselProps {
    loading: boolean;
    error?: string | null;
    analysis?: IAnalysis[];
    questionnaires?: IQuestionnaire[];
    users?: IUser[];
    questions?: IQuestion[];
    type: 'analysis' | 'questionnaires' | 'users';
    minCards?: number;
}

const MAIN_COLORS = [
    "#A167E8", // Violeta 
    "#6F4FAF", // Añil 
    "#5565A8", // Navy
    "#4FA7FF", // Azul
    "#4FC8BF", // Celeste
    "#6DFF6D", // Verde 
    "#C9FF77", // Lima 
    "#FFE066", // Amarillo 
    "#FFB366", // Naranja 
    "#FF6161", // Rojo 
    "#DC4FD4", // Rosa 
];

const baseChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
        title: { display: false },
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
};

const TemplateMetricsSkeleton: React.FC = () => {
    const { base, highlight } = useThemeColors();

    return (
        <SkeletonTheme baseColor={base} highlightColor={highlight}>
            <div className="w-full box-border">
                <div className="relative w-full overflow-hidden">
                    <div className="flex flex-col gap-5 p-5 px-3">
                        <div className="flex w-full gap-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="w-full flex flex-col gap-3">
                                    <Skeleton height={180} style={{ width: '100%' }} />
                                    <div style={{ width: '70%' }}>
                                        <Skeleton height={22} />
                                    </div>
                                    <div style={{ width: '95%' }}>
                                        <Skeleton count={2} />
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

function minutesBetween(a?: string, b?: string) {
    if (!a || !b) return 0;
    const da = new Date(a).getTime();
    const db = new Date(b).getTime();
    if (isNaN(da) || isNaN(db)) return 0;
    return Math.abs(Math.round((db - da) / (1000 * 60)));
}

function formatMinutes(mins: number) {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
}

function MetricCardShell({
    title,
    description,
    chart,
}: {
    title: string;
    description?: string;
    chart: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-base-200 w-[80vw] shadow-[0_6px_18px_rgba(16,24,40,0.06)] rounded-[18px] p-[18px] box-border flex flex-col gap-3 md:w-[30vw] max-w-[544px] md:p-4"
        >
            <div className="h-[180px] w-full rounded-xl overflow-hidden flex items-center justify-center md:h-[200px]">
                {chart}
            </div>
            <div className="text-[20px] font-bold leading-[1.1] text-base-content/80">{title}</div>
            <div className="text-[13px] text-base-content/40">{description}</div>
        </motion.div>
    );
}

export default function TemplateMetrics({
    loading,
    error = null,
    analysis = [],
    questionnaires = [],
    users = [],
    questions = [],
    type,
    minCards = 4,
}: MetricsCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
        skipSnaps: false,
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    const items = useMemo(() => {
        const arr: {
            id: string;
            title: string;
            description?: string;
            chart: React.ReactNode;
        }[] = [];

        // === MÉTRICAS DE ANÁLISIS ===
        if (type === 'analysis') {
            // 1) Porcentajes de Semáforo (pastel)
            const semMap: Record<string, number> = { verde: 0, amarillo: 0, rojo: 0 };
            analysis.forEach((a) => {
                const key = (a.colorSemaforo || '').toLowerCase();
                if (semMap[key] !== undefined) semMap[key]++;
            });
            const semLabels = Object.keys(semMap);
            const semValues = semLabels.map((k) => semMap[k]);

            arr.push({
                id: 'analysis-semaforo',
                title: 'Vista General del Semáforo',
                description: 'Proporción de evaluaciones verdes / amarillas / rojas.',
                chart: (
                    <Pie
                        data={{
                            labels: semLabels,
                            datasets: [
                                {
                                    data: semValues,
                                    backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                                    borderWidth: 0,
                                },
                            ],
                        }}
                        options={baseChartOptions}
                    />
                ),
            });

            // 2) Por Categoría (barra)
            const byCategoryMap: Record<string, number> = {};
            analysis.forEach((a) => (byCategoryMap[a.categoria] = (byCategoryMap[a.categoria] || 0) + 1));
            const byCategoryLabels = Object.keys(byCategoryMap);
            const byCategoryValues = byCategoryLabels.map((l) => byCategoryMap[l]);

            arr.push({
                id: 'analysis-by-category',
                title: 'Distribución por Categoría',
                description: 'Cantidad de análisis agrupados por categoría.',
                chart: (
                    <Bar
                        data={{
                            labels: byCategoryLabels,
                            datasets: [{ data: byCategoryValues, backgroundColor: MAIN_COLORS, borderRadius: 8 }],
                        }}
                        options={baseChartOptions}
                    />
                ),
            });

            // 3) Tiempo promedio de resolución (línea por fecha)
            const byDateMap: Record<string, number[]> = {};
            analysis.forEach((a) => {
                const date = new Date(a.timeWhenSolved).toLocaleDateString();
                const mins = minutesBetween(a.timeWhenChecked, a.timeWhenSolved);
                if (!byDateMap[date]) byDateMap[date] = [];
                byDateMap[date].push(mins);
            });
            const dateLabels = Object.keys(byDateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            const avgMins = dateLabels.map((d) => {
                const arrM = byDateMap[d] || [];
                if (arrM.length === 0) return 0;
                return Math.round(arrM.reduce((s, v) => s + v, 0) / arrM.length);
            });

            arr.push({
                id: 'analysis-avg-solve',
                title: 'Tiempo Promedio de Resolución',
                description: `Tiempo promedio de resolución por día. Último: ${avgMins.length ? formatMinutes(avgMins[avgMins.length - 1]) : 'sin datos'}`,
                chart: <Line data={{ labels: dateLabels, datasets: [{ data: avgMins, fill: true, backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });

            // 4) Principales clientes (barra)
            const byClient: Record<string, number> = {};
            analysis.forEach((a) => (byClient[a.clientName] = (byClient[a.clientName] || 0) + 1));
            const topClients = Object.entries(byClient).sort((a, b) => b[1] - a[1]).slice(0, 6);
            arr.push({
                id: 'analysis-top-clients',
                title: 'Principales Clientes (por análisis)',
                description: 'Clientes con más análisis enviados.',
                chart: <Bar data={{ labels: topClients.map((t) => t[0]), datasets: [{ data: topClients.map((t) => t[1]), backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });

            // 5) Estados (pastel)
            const byState: Record<string, number> = {};
            analysis.forEach((a) => (byState[a.status] = (byState[a.status] || 0) + 1));
            arr.push({
                id: 'analysis-states',
                title: 'Estados de Análisis',
                description: 'Distribución de estados de análisis.',
                chart: <Pie data={{ labels: Object.keys(byState), datasets: [{ data: Object.values(byState), borderWidth: 0, backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });
        }

        // === MÉTRICAS DE CUESTIONARIOS ===
        if (type === 'questionnaires') {
            // 1) Cuestionarios por categoría
            const byCat: Record<string, number> = {};
            questionnaires.forEach((q) => (byCat[q.categoryName] = (byCat[q.categoryName] || 0) + 1));
            arr.push({
                id: 'q-by-category',
                title: 'Cuestionarios por Categoría',
                description: 'Cantidad de cuestionarios por categoría.',
                chart: <Bar data={{ labels: Object.keys(byCat), datasets: [{ data: Object.values(byCat), backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });

            // 2) Promedio de preguntas por cuestionario
            const qMap: Record<number, number> = {};
            questions.forEach((q) => {
                if (!q.questionnaireId) return;
                qMap[q.questionnaireId] = (qMap[q.questionnaireId] || 0) + 1;
            });
            const counts = Object.values(qMap);
            const avg = counts.length ? Math.round(counts.reduce((s, v) => s + v, 0) / counts.length) : 0;
            arr.push({
                id: 'q-avg-questions',
                title: 'Promedio de Preguntas por Cuestionario',
                description: `Número promedio de preguntas en los cuestionarios: ${avg}`,
                chart: <Bar data={{ labels: ['promedio'], datasets: [{ data: [avg], backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });

            // 3) Palabras clave principales (extraídas de preguntas)
            const kwMap: Record<string, number> = {};
            questions.forEach((q) => q.keywords?.forEach((k) => (kwMap[k.title] = (kwMap[k.title] || 0) + 1)));
            const topKws = Object.entries(kwMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
            arr.push({
                id: 'q-top-keywords',
                title: 'Palabras Clave Principales',
                description: 'Palabras clave más frecuentes en las preguntas.',
                chart: <Bar data={{ labels: topKws.map((t) => t[0]), datasets: [{ data: topKws.map((t) => t[1]), backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });

            // 4) Distribución de tipos de pregunta
            const typeMap: Record<string, number> = { abierta: 0, única: 0, múltiple: 0 };
            const typeTranslation: Record<string, string> = {
                open: 'abierta',
                single: 'única',
                multiple: 'múltiple',
            };
            questions.forEach((q) => {
                const translatedType = typeTranslation[q.questionType] || q.questionType;
                typeMap[translatedType] = (typeMap[translatedType] || 0) + 1;
            });
            arr.push({
                id: 'q-types',
                title: 'Tipos de Pregunta',
                description: 'Conteo de preguntas abiertas / única selección / múltiple selección.',
                chart: <Pie data={{ labels: Object.keys(typeMap), datasets: [{ data: Object.values(typeMap), borderWidth: 0, backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });
        }

        // === MÉTRICAS DE USUARIOS ===
        if (type === 'users') {
            // 1) Por tipo de cliente
            const ctMap: Record<string, number> = {};
            users.forEach((u) => (ctMap[u.clientType] = (ctMap[u.clientType] || 0) + 1));
            arr.push({
                id: 'u-client-type',
                title: 'Usuarios por Tipo de Cliente',
                description: 'Distribución Persona vs Empresa.',
                chart: <Pie data={{ labels: Object.keys(ctMap), datasets: [{ data: Object.values(ctMap), borderWidth: 0, backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });

            // 2) Distribución de roles
            const roleMap: Record<string, number> = {};
            users.forEach((u) => (roleMap[u.role?.name || 'desconocido'] = (roleMap[u.role?.name || 'desconocido'] || 0) + 1));
            arr.push({
                id: 'u-roles',
                title: 'Distribución de Roles',
                description: 'Cantidad de usuarios por rol.',
                chart: <Bar data={{ labels: Object.keys(roleMap), datasets: [{ data: Object.values(roleMap), backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });

            // 3) Por sector (top 6)
            const sectorMap: Record<string, number> = {};
            users.forEach((u) => {
                const sector = u.sector ?? "N/A"; // si es null o undefined → "N/A"
                sectorMap[sector] = (sectorMap[sector] || 0) + 1;
            });
            const topSectors = Object.entries(sectorMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);
            arr.push({
                id: "u-sectors",
                title: "Sectores Principales",
                description: "Sectores de usuarios más comunes.",
                chart: (
                    <Bar
                        data={{
                            labels: topSectors.map(([sector]) => sector),
                            datasets: [
                                {
                                    data: topSectors.map(([, count]) => count),
                                    backgroundColor: MAIN_COLORS,
                                },
                            ],
                        }}
                        options={baseChartOptions}
                    />
                ),
            });

            // 4) Completitud de contacto (teléfono presente vs ausente)
            const withPhone = users.filter((u) => u.phone).length;
            const withoutPhone = users.length - withPhone;
            arr.push({
                id: 'u-contact',
                title: 'Completitud de Contacto',
                description: 'Usuarios con y sin teléfono registrado.',
                chart: <Pie data={{ labels: ['con teléfono', 'sin teléfono'], datasets: [{ data: [withPhone, withoutPhone], borderWidth: 0, backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });
        }

        // Garantizar número mínimo de tarjetas
        while (arr.length < minCards) {
            const idx = arr.length;
            arr.push({
                id: `placeholder-${idx}`,
                title: 'Sin datos',
                description: 'No hay suficientes datos para calcular esta métrica.',
                chart: <div className="w-full h-full grid place-items-center text-[#9ca3af]">—</div>,
            });
        }

        return arr;
    }, [type, analysis, questionnaires, users, questions, minCards]);

    if (loading) return <TemplateMetricsSkeleton />;

    if (error) {
        return (
            <div className="w-full box-border">
                <div className="p-3 rounded-[10px] bg-[rgba(254,226,226,0.7)] text-[#b91c1c] font-semibold">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 p-4 pe-0 w-full box-border">
            <div className="relative w-full overflow-hidden">
                {/* Botones de Navegación */}
                <button
                    onClick={scrollPrev}
                    aria-label="Anterior"
                    className="absolute top-1/2 left-2 -translate-y-1/2 w-[42px] h-[42px] rounded-full border-none grid place-items-center shadow-[0_6px_18px_rgba(16,24,40,0.08)] btn btn-secondary cursor-pointer z-30"
                >
                    <ArrowLeft />
                </button>
                <button
                    onClick={scrollNext}
                    aria-label="Siguiente"
                    className="absolute top-1/2 right-2 -translate-y-1/2 w-[42px] h-[42px] rounded-full border-none grid place-items-center shadow-[0_6px_18px_rgba(16,24,40,0.08)] btn btn-secondary cursor-pointer z-30"
                >
                    <ArrowRight />
                </button>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-5 p-5 px-3">
                        {items.map((it) => (
                            <div key={it.id} className="flex-[0_0_auto]">
                                <MetricCardShell title={it.title} description={it.description} chart={it.chart} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Indicadores de puntos */}
            <div className="flex gap-2 justify-center mt-2.5" aria-hidden="true">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => emblaApi?.scrollTo(i)}
                        aria-label={`Ir a ${i + 1}`}
                        className={`w-2.5 h-2.5 rounded-full border-none ${i === selectedIndex ? 'bg-base-300' : 'bg-base-200'}`}
                    />
                ))}
            </div>
        </div>
    );
}
