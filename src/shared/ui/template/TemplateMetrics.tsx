import useEmblaCarousel from 'embla-carousel-react';
import React, { useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IQuestion, QuestionType } from '../../../core/models/question';
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
    Title
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { normalizeUserRole } from '../../../api/usersApi';

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
    "#A167E8DD", // Violeta 
    "#6F4FAFDD", // Añil 
    "#5565A8DD", // Navy
    "#4FA7FFDD", // Azul
    "#4FC8BFDD", // Celeste
    "#FFE066DD", // Amarillo 
    "#FFB366DD", // Naranja 
    "#FF6161DD", // Rojo 
    "#DC4FD4DD", // Rosa 
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
            ticks: { color: '#999' },
            grid: { display: false },
        },
        y: {
            ticks: { color: '#999' },
            grid: { display: false },
            beginAtZero: true,
        },
    },
};

const TemplateMetricsSkeleton: React.FC = () => {
    const { base } = useThemeColors();

    return (
        <SkeletonTheme baseColor={base} highlightColor={base}>
            <div className="w-full box-border">
                <div className="relative w-full overflow-hidden">
                    <div className="flex flex-col gap-5">
                        <div className="flex w-full gap-4 bg-base-100 w-full shadow-xl rounded-[18px] box-border flex gap-4 p-4 pb-8">
                            <div className="w-full flex flex-col gap-3">
                                <Skeleton height={204} style={{ width: '100%', borderRadius: '14px' }} />
                                <div className='w-7/10'>
                                    <Skeleton height={28} />
                                </div>
                                <div className='w-95/100'>
                                    <Skeleton height={20} />
                                </div>
                            </div>
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="w-full hidden md:flex flex-col gap-3">
                                    <Skeleton height={204} style={{ width: '100%', borderRadius: '14px' }} />
                                    <div className='w-7/10'>
                                        <Skeleton height={28} />
                                    </div>
                                    <div className='w-95/100'>
                                        <Skeleton height={20} />
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

function formatMinutesWithSeconds(totalMinutes: number) {
    const mins = Math.floor(totalMinutes);
    const secs = Math.round((totalMinutes - mins) * 60);
    return `${mins}m ${secs}s`;
}


function minutesBetween(a?: string, b?: string) {
    if (!a || !b) return 0;
    const da = new Date(a).getTime();
    const db = new Date(b).getTime();
    if (isNaN(da) || isNaN(db)) return 0;
    return Math.abs(Math.round((db - da) / (1000 * 60)));
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
            className="bg-base-200 w-[80vw] shadow-xl rounded-xl box-border flex flex-col gap-3 md:w-[30vw] max-w-[544px] p-4"
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
            // 1) Porcentajes de Semáforo (donut)
            const semMap: Record<string, number> = { verde: 0, amarillo: 0, rojo: 0 };
            analysis.forEach((a) => {
                const key = (a.colorSemaforo || '').toLowerCase().trim();
                if (semMap[key] !== undefined) semMap[key]++;
            });
            const semLabels = Object.keys(semMap);
            const semValues = semLabels.map((k) => semMap[k]);

            arr.push({
                id: 'analysis-semaforo',
                title: 'Vista General del Semáforo',
                description: 'Proporción de evaluaciones verdes, amarillas o rojas.',
                chart: (
                    <Doughnut
                        data={{
                            labels: semLabels.map((l) => l.toUpperCase()),
                            datasets: [
                                {
                                    data: semValues,
                                    backgroundColor: ['#22C55EDD', '#EAB308DD', '#EF4444DD'],
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

            analysis.forEach((a) => {
                byCategoryMap[a.categoryName] =
                    (byCategoryMap[a.categoryName] || 0) + 1;
            });

            const sortedCategories = Object.entries(byCategoryMap).sort(
                (a, b) => b[1] - a[1]
            );

            const byCategoryNames = sortedCategories.map((item) => item[0]);
            const byCategoryLabels = byCategoryNames.map(
                (label) => label.slice(0, 5) + '.'
            );
            const byCategoryValues = sortedCategories.map((item) => item[1]);

            arr.push({
                id: 'analysis-by-category',
                title: 'Distribución por Categoría',
                description: 'Cantidad de análisis agrupados por categoría.',
                chart: (
                    <Bar
                        data={{
                            labels: byCategoryLabels,
                            datasets: [
                                {
                                    data: byCategoryValues,
                                    backgroundColor: MAIN_COLORS,
                                    borderRadius: 8,
                                },
                            ],
                        }}
                        options={{ ...baseChartOptions, indexAxis: 'y' }}
                    />
                ),
            });

            // 3) Estados (donut)
            const byState: Record<string, number> = {};
            analysis.forEach((a) => (byState[a.status] = (byState[a.status] || 0) + 1));
            arr.push({
                id: 'analysis-states',
                title: 'Estados de Análisis',
                description: 'Distribución de estados de análisis.',
                chart: <Doughnut data={{ labels: Object.keys(byState), datasets: [{ data: Object.values(byState), borderWidth: 0, backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });

            // 4) Principales clientes (barra)
            const byClient: Record<string, number> = {};
            analysis.forEach((a) => (byClient[a.clientName] = (byClient[a.clientName] || 0) + 1));
            const topClients = Object.entries(byClient).sort((a, b) => b[1] - a[1]).slice(0, 6);
            arr.push({
                id: 'analysis-top-clients',
                title: 'Clientes Principales',
                description: 'Clientes con más análisis enviados.',
                chart: <Bar data={{ labels: topClients.map((t) => t[0].slice(0, 6) + '.'), datasets: [{ data: topClients.map((t) => t[1]), backgroundColor: MAIN_COLORS, borderRadius: 8 }] }} options={{ ...baseChartOptions, indexAxis: 'y' }} />,
            });

            // 5) Tiempo promedio de asesoría (línea por fecha)
            const byDateMap: Record<string, number[]> = {};
            analysis.forEach((a) => {
                const date = new Date(a.timeWhenSolved).toLocaleDateString();
                const mins = minutesBetween(a.timeWhenChecked, a.timeWhenSolved);
                if (!byDateMap[date]) byDateMap[date] = [];
                byDateMap[date].push(mins);
            });

            const dateLabelsFull = Object.keys(byDateMap).sort(
                (a, b) => new Date(a).getTime() - new Date(b).getTime()
            );

            const avgMins = dateLabelsFull.map((d) => {
                const arrM = byDateMap[d] || [];
                if (arrM.length === 0) return 0;
                return arrM.reduce((s, v) => s + v, 0) / arrM.length;
            });

            const globalAvg =
                avgMins.length > 0
                    ? avgMins.reduce((s, v) => s + v, 0) / avgMins.length
                    : 0;

            const getThreeLabels = (labels: string[]) => {
                if (labels.length <= 3) return labels;
                const midIndex = Math.floor(labels.length / 2);
                return [labels[0], labels[midIndex], labels[labels.length - 1]];
            };
            const dateLabels = getThreeLabels(dateLabelsFull);

            arr.push({
                id: 'analysis-avg-solve',
                title: 'Tiempo Promedio de Asesoría',
                description: `Tiempo de atención de asesoría. Global: ${avgMins.length ? formatMinutesWithSeconds(globalAvg) : 'sin datos'}`,
                chart: (
                    <Line
                        data={{
                            labels: dateLabelsFull,
                            datasets: [
                                {
                                    data: avgMins,
                                    borderColor: '#A167E8',
                                    borderWidth: 1,
                                    backgroundColor: '#A167E833',
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 0,
                                },
                            ],
                        }}
                        options={{
                            scales: {
                                x: {
                                    ticks: {
                                        callback: function (_, index) {
                                            const label = dateLabelsFull[index];
                                            return dateLabels.includes(label) ? label : '';
                                        },
                                    },
                                },
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function (tooltipItem) {
                                            const value = tooltipItem.raw as number;
                                            return formatMinutesWithSeconds(value);
                                        },
                                    },
                                },
                            },
                            ...baseChartOptions,
                        }}
                    />
                ),
            });
        }

        // === MÉTRICAS DE CUESTIONARIOS ===
        if (type === 'questionnaires') {
            // 1) Cuestionarios por categoría
            const byCat: Record<string, number> = {};

            questionnaires.forEach((q) => {
                const category = q.categoryName || 'Sin categoría';
                byCat[category] = (byCat[category] || 0) + 1;
            });

            const sortedCategories = Object.entries(byCat).sort(
                (a, b) => b[1] - a[1]
            );
            const filteredData = sortedCategories.filter(([, value]) => value > 0);

            arr.push({
                id: 'q-by-category',
                title: 'Cuestionarios por Categoría',
                description: 'Distribución de cuestionarios por categoría.',
                chart: (
                    <Doughnut
                        data={{
                            labels: filteredData.map(([name]) => name),
                            datasets: [
                                {
                                    data: filteredData.map(([, value]) => value),
                                    borderWidth: 0,
                                    backgroundColor: MAIN_COLORS,
                                },
                            ],
                        }}
                        options={baseChartOptions}
                    />
                ),
            });

            // 2) Promedio de preguntas por categoría (línea)
            const questionsPerQuestionnaire: Record<number, number> = {};

            questions.forEach((q) => {
                if (!q.questionnaireId) return;
                questionsPerQuestionnaire[q.questionnaireId] =
                    (questionsPerQuestionnaire[q.questionnaireId] || 0) + 1;
            });

            const categoryMap: Record<string, number[]> = {};
            questionnaires.forEach((q) => {
                const count = questionsPerQuestionnaire[q.id] || 0;
                if (!categoryMap[q.categoryName]) {
                    categoryMap[q.categoryName] = [];
                }
                categoryMap[q.categoryName].push(count);
            });

            const categoryData = Object.keys(categoryMap).map((cat) => {
                const arr = categoryMap[cat];
                const avg = arr.length
                    ? Math.round(arr.reduce((sum, v) => sum + v, 0) / arr.length)
                    : 0;
                return { name: cat, avg };
            });

            categoryData.sort((a, b) => b.avg - a.avg);

            const categoryLabels = categoryData.map((c) => c.name.slice(0, 5) + '.');
            const categoryAverages = categoryData.map((c) => c.avg);

            arr.push({
                id: 'q-avg-questions-by-category',
                title: 'Promedio de Preguntas',
                description: 'Promedio de preguntas en cuestionarios por categoría.',
                chart: (
                    <Line
                        data={{
                            labels: categoryLabels,
                            datasets: [
                                {
                                    data: categoryAverages,
                                    borderColor: '#A167E8',
                                    borderWidth: 1,
                                    backgroundColor: '#A167E833',
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 0,
                                },
                            ],
                        }}
                        options={baseChartOptions}
                    />
                ),
            });

            // 3) Palabras clave principales (extraídas de preguntas)
            const kwMap: Record<string, number> = {};
            questions.forEach((q) => q.keywords?.forEach((k) => (kwMap[k.title] = (kwMap[k.title] || 0) + 1)));
            const topKws = Object.entries(kwMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
            arr.push({
                id: 'q-top-keywords',
                title: 'Palabras Clave Principales',
                description: 'Palabras clave más frecuentes en las preguntas.',
                chart: <Bar data={{ labels: topKws.map((t) => t[0]), datasets: [{ data: topKws.map((t) => t[1]), backgroundColor: MAIN_COLORS, borderRadius: 8 }] }} options={baseChartOptions} />,
            });

            // 4) Distribución de tipos de pregunta
            const typeMap: Record<QuestionType, number> = {
                OPEN: 0,
                SINGLE: 0,
                MULTIPLE: 0,
            };

            questions.forEach((q) => {
                const rawType = q.questionType;

                if (!rawType) return;

                const type = rawType.toUpperCase().trim() as QuestionType;

                if (typeMap[type] !== undefined) {
                    typeMap[type]++;
                }
            });

            const filteredEntries = Object.entries(typeMap).filter(([, value]) => value > 0);

            const labelsMap: Record<QuestionType, string> = {
                OPEN: 'ABIERTA',
                SINGLE: 'ÚNICA',
                MULTIPLE: 'MÚLTIPLE',
            };

            arr.push({
                id: 'q-types',
                title: 'Tipos de Pregunta',
                description:
                    'Conteo de preguntas abiertas, selección única y múltiple.',
                chart: (
                    <Doughnut
                        data={{
                            labels: filteredEntries.map(([key]) => labelsMap[key as QuestionType]),
                            datasets: [
                                {
                                    data: filteredEntries.map(([, value]) => value),
                                    borderWidth: 0,
                                    backgroundColor: MAIN_COLORS,
                                },
                            ],
                        }}
                        options={baseChartOptions}
                    />
                ),
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
                chart: <Doughnut data={{ labels: Object.keys(ctMap), datasets: [{ data: Object.values(ctMap), borderWidth: 0, backgroundColor: MAIN_COLORS }] }} options={baseChartOptions} />,
            });

            // 2) Distribución de roles
            const roleMap: Record<string, number> = {};
            users.forEach((u) => (roleMap[normalizeUserRole(u.role.id)] = (roleMap[normalizeUserRole(u.role.id)] || 0) + 1));
            arr.push({
                id: 'u-roles',
                title: 'Distribución de Roles',
                description: 'Cantidad de usuarios por rol.',
                chart: <Bar data={{ labels: Object.keys(roleMap), datasets: [{ data: Object.values(roleMap), backgroundColor: MAIN_COLORS, borderRadius: 8 }] }} options={baseChartOptions} />,
            });

            // 3) Completitud de contacto (stacked)
            const totalUsers = users.length;

            const countField = (field: keyof typeof users[number]) => {
                const withField = users.filter((u) => !!u[field]).length;

                return {
                    withField,
                    withoutField: totalUsers - withField,
                };
            };

            const networkStats = countField("network");
            const addressStats = countField("address");
            const phoneStats = countField("phone");

            arr.push({
                id: "u-contact",
                title: "Completitud de Contacto",
                description: "Usuarios con y sin información de contacto.",
                chart: (
                    <Bar
                        data={{
                            labels: ["Red", "Región", "Teléfono"],
                            datasets: [
                                {
                                    label: "Con dato",
                                    data: [
                                        networkStats.withField,
                                        addressStats.withField,
                                        phoneStats.withField,
                                    ],
                                    backgroundColor: MAIN_COLORS[0],
                                    borderRadius: 8,
                                    stack: "total",
                                },
                                {
                                    label: "Sin dato",
                                    data: [
                                        networkStats.withoutField,
                                        addressStats.withoutField,
                                        phoneStats.withoutField,
                                    ],
                                    backgroundColor: MAIN_COLORS[1],
                                    borderRadius: 8,
                                    stack: "total",
                                },
                            ],
                        }}
                        options={{
                            indexAxis: "y",
                            scales: {
                                x: {
                                    stacked: true,
                                    beginAtZero: true,
                                },
                                y: {
                                    stacked: true,
                                },
                            },
                            ...baseChartOptions
                        }}
                    />
                ),
            });

            // 4) Estado de usuarios (Doughnut)
            const statusMap: Record<string, number> = {};

            users.forEach((u) => {
                const status = u.status ?? "DESCONOCIDO";
                statusMap[status] = (statusMap[status] || 0) + 1;
            });

            const formatStatus = (s: string) => {
                switch (s) {
                    case "AUTHORIZED":
                        return "Autorizado";
                    case "UNAUTHORIZED":
                        return "No autorizado";
                    default:
                        return "Desconocido";
                }
            };

            const colorMap: Record<string, string> = {
                AUTHORIZED: "#A167E8DD",
                UNAUTHORIZED: "#6F4FAFDD",
                DESCONOCIDO: "#999",
            };

            const filteredEntries = Object.entries(statusMap).filter(
                ([, value]) => value > 0
            );

            const labels = filteredEntries.map(([key]) => formatStatus(key));
            const dataValues = filteredEntries.map(([, value]) => value);
            const backgroundColor = filteredEntries.map(([key]) => colorMap[key]);

            arr.push({
                id: "u-status",
                title: "Estado de Usuarios",
                description: "Distribución de usuarios según su estado.",
                chart: (
                    <Doughnut
                        data={{
                            labels,
                            datasets: [
                                {
                                    data: dataValues,
                                    borderWidth: 0,
                                    backgroundColor,
                                },
                            ],
                        }}
                        options={baseChartOptions}
                    />
                ),
            });

            // 5) Por sector (top 6)
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
                            labels: topSectors.map(([sector]) => sector.slice(0, 6) + '.'),
                            datasets: [
                                {
                                    data: topSectors.map(([, count]) => count),
                                    backgroundColor: MAIN_COLORS,
                                    borderRadius: 8
                                },
                            ],
                        }}
                        options={{ ...baseChartOptions, indexAxis: 'y' }}
                    />
                ),
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
        <div className="card bg-base-100 p-4 pe-0 pt-0 w-full box-border">
            <div className="relative w-full overflow-hidden">
                {/* Botones de Navegación */}
                <button
                    onClick={scrollPrev}
                    aria-label="Anterior"
                    className="absolute top-1/2 left-2 w-[42px] h-[42px] rounded-full border-none grid place-items-center shadow-[0_6px_18px_rgba(16,24,40,0.08)] btn btn-secondary cursor-pointer z-30 pointer-events-auto"
                >
                    <ArrowLeft />
                </button>
                <button
                    onClick={scrollNext}
                    aria-label="Siguiente"
                    className="absolute top-1/2 right-2 w-[42px] h-[42px] rounded-full border-none grid place-items-center shadow-[0_6px_18px_rgba(16,24,40,0.08)] btn btn-secondary cursor-pointer z-30 pointer-events-auto"
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
