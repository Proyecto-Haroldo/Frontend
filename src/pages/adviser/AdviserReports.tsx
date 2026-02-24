import { useEffect, useState, useMemo } from "react";
import { IAnalysis } from "../../core/models/analysis";
import { IQuestionnaire } from "../../core/models/questionnaire";
import { IUser } from "../../core/models/user";
import { IQuestion } from "../../core/models/question";
import { fetchQuestionsByQuestionnaire, getAllAnalysis, getAllQuestionnaires } from "../../api/analysisApi";
import { getAllUsers } from "../../api/userApi";
import { X, Search, ClipboardList, Users, FileText } from "lucide-react";
import TemplateMetrics from "../../shared/ui/template/TemplateMetrics";

export default function AdviserReports() {
    // States
    const [analysis, setAnalysis] = useState<IAnalysis[]>([]);
    const [questionnaires, setQuestionnaires] = useState<IQuestionnaire[]>([]);
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState({ users: true, analysis: true, questionnaires: true, questions: true });
    const [error, setError] = useState({ users: "", analysis: "", questionnaires: "", questions: "" });

    // Filters
    const [filterByTime, setFilterByTime] = useState<"day" | "week" | "month" | "year">("month");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedQuestionType, setSelectedQuestionType] = useState<string>("all");
    const [selectedColor, setSelectedColor] = useState<string>("all");
    const [searchText, setSearchText] = useState<string>("");

    // Modal
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Fetch data
    useEffect(() => {
        fetchUsersData();
        fetchAnalysisData();
        fetchQuestionnairesData();
    }, []);

    useEffect(() => {
        questionnaires.forEach(q => fetchQuestionsData(q.id));
    }, [questionnaires]);

    // Fetch functions
    const fetchUsersData = async () => {
        try {
            setLoading(prev => ({ ...prev, users: true }));
            const data = await getAllUsers();

            console.log(data);
            const onlyClients = data.filter(u => u.role.id === 2);
            setUsers(onlyClients);
        } catch (err: unknown) {
            setError(prev => ({ ...prev, users: err instanceof Error ? err.message : "Unexpected error" }));
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    };

    const fetchAnalysisData = async () => {
        try {
            setLoading(prev => ({ ...prev, analysis: true }));
            const data = await getAllAnalysis();
            setAnalysis(data);
        } catch (err: unknown) {
            setError(prev => ({ ...prev, analysis: err instanceof Error ? err.message : "Unexpected error" }));
        } finally {
            setLoading(prev => ({ ...prev, analysis: false }));
        }
    };

    const fetchQuestionnairesData = async () => {
        try {
            setLoading(prev => ({ ...prev, questionnaires: true }));
            const data = await getAllQuestionnaires();
            setQuestionnaires(data);
        } catch (err: unknown) {
            setError(prev => ({ ...prev, questionnaires: err instanceof Error ? err.message : "Unexpected error" }));
        } finally {
            setLoading(prev => ({ ...prev, questionnaires: false }));
        }
    };

    const fetchQuestionsData = async (questionnaireId: number) => {
        try {
            setLoading(prev => ({ ...prev, questions: true }));
            const data = await fetchQuestionsByQuestionnaire(questionnaireId);
            setQuestions(prev => [...prev, ...data]);
        } catch (err) {
            setError(prev => ({ ...prev, questions: err instanceof Error ? err.message : "Unexpected error" }));
        } finally {
            setLoading(prev => ({ ...prev, questions: false }));
        }
    };

    const getColorValue = (color: string) => {
        switch (color) {
            case "rojo":
                return "#FF0000";   // red
            case "verde":
                return "#00FF00";   // green
            case "amarillo":
                return "#FFFF00";   // yellow
            default:
                return "#808080";   // gray
        }
    }

    const getCategories = (questionnnaires: IQuestionnaire[]) => {
        const categories = new Set<string>();
        questionnnaires.forEach(q => categories.add(q.categoryName));
        return Array.from(categories);
    };

    // Filtered data
    const filteredAnalysis = useMemo(() => {
        const now = new Date();
        return analysis.filter(a => {
            const date = new Date(a.timeWhenSolved);
            const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
            const timeFilter =
                filterByTime === "day" ? diffDays <= 1 :
                    filterByTime === "week" ? diffDays <= 7 :
                        filterByTime === "month" ? diffDays <= 30 :
                            diffDays <= 365;
            const categoryFilter = selectedCategory === "all" || a.categoria === selectedCategory;
            const userFilter = selectedUser === "all" || a.clientName === selectedUser;
            const statusFilter = selectedStatus === "all" || a.status === selectedStatus;
            const colorFilter = selectedColor === "all" || a.colorSemaforo === selectedColor;
            const searchFilter = searchText === "" || a.clientName.toLowerCase().includes(searchText.toLowerCase());
            return timeFilter && categoryFilter && userFilter && statusFilter && colorFilter && searchFilter;
        });
    }, [analysis, filterByTime, selectedCategory, selectedUser, selectedStatus, selectedColor, searchText]);

    const filteredQuestionnaires = useMemo(() => {
        return questionnaires.filter(q => {
            const searchFilter =
                searchText === "" ||
                q.categoryName.toLowerCase().includes(searchText.toLowerCase())
                || q.creatorName.toLowerCase().includes(searchText.toLowerCase());
            const categoryFilter =
                selectedCategory === "all" ||
                q.categoryName === selectedCategory;
            const creatorFilter =
                selectedUser === "all" ||
                q.creatorName === selectedUser;

            return searchFilter && categoryFilter && creatorFilter;
        });
    }, [questionnaires, selectedUser, selectedCategory, searchText]);

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const typeFilter = selectedQuestionType === "all" || q.questionType === selectedQuestionType;
            const searchFilter = searchText === "" || q.question.toLowerCase().includes(searchText.toLowerCase());
            return typeFilter && searchFilter;
        });
    }, [questions, selectedQuestionType, searchText]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const searchFilter = searchText === "" || u.legalName.toLowerCase().includes(searchText.toLowerCase());
            return searchFilter;
        });
    }, [users, searchText]);

    // Handlers for advanced filter modal
    const toggleFilter = (category: string, value: string) => {
        switch (category) {
            case "category":
                setSelectedCategory(selectedCategory === value ? "all" : value);
                break;
            case "user":
                setSelectedUser(selectedUser === value ? "all" : value);
                break;
            case "status":
                setSelectedStatus(selectedStatus === value ? "all" : value);
                break;
            case "color":
                setSelectedColor(selectedColor === value ? "all" : value);
                break;
            case "questionType":
                setSelectedQuestionType(selectedQuestionType === value ? "all" : value);
                break;
        }
    };

    const resetFilters = () => {
        setSelectedCategory("all");
        setSelectedUser("all");
        setSelectedStatus("all");
        setSelectedColor("all");
        setSelectedQuestionType("all");
        setSearchText("");
    };

    return (
        <div>
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold">Reportes del Asesor</h1>
                <p className="text-gray-600 mt-1">Visualiza estadísticas relevantes de usuarios, cuestionarios y análisis. Utiliza los filtros para obtener información específica.</p>
            </header>

            {/* Simple filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <select className="form-select select" title="time" value={filterByTime} onChange={e => setFilterByTime(e.target.value as "day" | "week" | "month" | "year")}>
                    <option value="day">Último día</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mes</option>
                    <option value="year">Último año</option>
                </select>
                <button
                    className="btn m-1 btn-sm gap-2 hover:bg-primary bg-secondary text-white transition"
                    onClick={() => setShowAdvancedFilters(true)}
                >
                    Filtros avanzados
                </button>
            </div>

            {/* Advanced Filter Modal */}
            {showAdvancedFilters && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-base-200 rounded-lg shadow-lg w-[90%] max-w-4xl h-[85%] flex flex-col p-6">

                        {/* Header fijo */}
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-xl font-bold">Filtros avanzados</h2>
                            <button className="cursor-pointer" aria-label="close" onClick={() => setShowAdvancedFilters(false)}>
                                <X />
                            </button>
                        </div>

                        {/* Búsqueda global - fija */}
                        <div className="relative shrink-0">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50 z-10" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="input input-bordered input-sm sm:input-md pl-10 w-full"
                            />
                        </div>

                        {/* CONTENIDO SCROLLEABLE */}
                        <div className="mt-4 overflow-y-auto pr-2 flex-1">

                            {/* GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {/* Usuarios */}
                                <div className="col-span-3 flex flex-col bg-base-100 card p-4 h-42">
                                    <h3 className="font-semibold mb-2">Usuarios</h3>
                                    <div className="flex flex-row gap-2 flex-wrap overflow-y-auto">
                                        {users
                                            .filter(u => u.legalName.toLowerCase().includes(searchText.toLowerCase()))
                                            .map(u => (
                                                <button
                                                    key={u.userId}
                                                    onClick={() => toggleFilter("user", u.legalName)}
                                                    className={`btn w-auto h-auto min-h-[32px] max-w-[200px] btn-sm gap-2 btn-outline ${selectedUser === u.legalName ? "btn-primary" : "text-base-content/50"
                                                        }`}
                                                >
                                                    {u.legalName}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                {/* Categoría */}
                                <div className="col-span-3 flex flex-col bg-base-100 card p-4 h-42">
                                    <h3 className="font-semibold mb-2">Categoría</h3>
                                    <div className="flex flex-row gap-2 flex-wrap overflow-y-auto">
                                        {getCategories(questionnaires)
                                            .filter(c => c.toLowerCase().includes(searchText.toLowerCase()))
                                            .map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => toggleFilter("category", c)}
                                                    className={`capitalize h-auto min-h-[32px] max-w-[200px] btn btn-sm gap-2 btn-outline ${selectedCategory === c ? "btn-primary" : "text-base-content/50"
                                                        }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                {/* Estado */}
                                <div className="md:col-span-1 col-span-3 flex flex-col bg-base-100 card p-4 h-42">
                                    <h3 className="font-semibold mb-2">Estado</h3>
                                    <div className="flex flex-row gap-2 flex-wrap overflow-y-auto">
                                        {["pending", "completed", "in-progress"]
                                            .filter(s => s.toLowerCase().includes(searchText.toLowerCase()))
                                            .map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => toggleFilter("status", s)}
                                                    className={`capitalize h-auto min-h-[32px] btn btn-sm gap-2 btn-outline ${selectedStatus === s ? "btn-primary" : "text-base-content/50"
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                {/* Color Semáforo */}
                                <div className="md:col-span-1 col-span-3 flex flex-col bg-base-100 card p-4 h-42">
                                    <h3 className="font-semibold mb-2">Color Semáforo</h3>
                                    <div className="flex flex-row gap-2 flex-wrap overflow-y-auto">
                                        {["verde", "amarillo", "rojo"]
                                            .filter(c => c.toLowerCase().includes(searchText.toLowerCase()))
                                            .map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => toggleFilter("color", c)}
                                                    className={`capitalize h-auto min-h-[32px] btn btn-sm gap-2 btn-outline ${selectedColor === c ? "btn-primary" : "text-base-content/50"
                                                        }`}
                                                >
                                                    <span
                                                        className="w-4 h-4 rounded-full shadow-xl"
                                                        style={{
                                                            backgroundColor: getColorValue(c),
                                                            boxShadow: `0 0 6px ${getColorValue(c)}80`
                                                        }}
                                                    ></span>
                                                    {c}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                {/* Tipo de Pregunta */}
                                <div className="md:col-span-1 col-span-3 flex flex-col bg-base-100 card p-4 h-42">
                                    <h3 className="font-semibold mb-2">Tipo de Pregunta</h3>
                                    <div className="flex flex-row gap-2 flex-wrap overflow-y-auto">
                                        {["open", "single", "multiple"]
                                            .filter(q => q.toLowerCase().includes(searchText.toLowerCase()))
                                            .map(q => (
                                                <button
                                                    key={q}
                                                    onClick={() => toggleFilter("questionType", q)}
                                                    className={`btn btn-sm h-auto min-h-[32px] capitalize gap-2 btn-outline ${selectedQuestionType === q ? "btn-primary" : "text-base-content/50"
                                                        }`}
                                                >
                                                    {q.charAt(0).toUpperCase() + q.slice(1)}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER FIJO */}
                        <div className="flex justify-between gap-2 mt-4 shrink-0">
                            {/* TAGS */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {[selectedCategory, selectedUser, selectedStatus, selectedColor, selectedQuestionType]
                                    .filter(f => f !== "all")
                                    .map(f => (
                                        <button key={f} className="capitalize btn btn-sm gap-2 btn-primary">
                                            {f}
                                            <X
                                                className="w-3 h-3 cursor-pointer"
                                                onClick={() =>
                                                    toggleFilter(
                                                        selectedCategory === f
                                                            ? "category"
                                                            : selectedUser === f
                                                                ? "user"
                                                                : selectedStatus === f
                                                                    ? "status"
                                                                    : selectedColor === f
                                                                        ? "color"
                                                                        : "questionType",
                                                        f
                                                    )
                                                }
                                            />
                                        </button>
                                    ))}
                            </div>
                            {/* OPTIONS */}

                            <div className="flex justify-end gap-2 mt-4 shrink-0">

                                <button className="btn btn-sm gap-2 btn-accent" onClick={resetFilters}>
                                    Reset
                                </button>
                                <button className="btn btn-sm gap-2 btn-primary" onClick={() => setShowAdvancedFilters(false)}>
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Metrics Templates */}
            <div className="space-y-8 mt-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xl md:text-2xl text-base-content">
                        Métricas de Análisis
                    </h3>
                </div>
                <TemplateMetrics type="analysis" analysis={filteredAnalysis} loading={loading.analysis} error={error.analysis} />

                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xl md:text-2xl text-base-content">
                        Métricas de Cuestionarios
                    </h3>
                </div>
                <TemplateMetrics type="questionnaires" questionnaires={filteredQuestionnaires} questions={filteredQuestions} loading={loading.questionnaires || loading.questions} error={error.questionnaires || error.questions} />

                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xl md:text-2xl text-base-content">
                        Métricas de Usuarios
                    </h3>
                </div>
                <TemplateMetrics type="users" users={filteredUsers} loading={loading.users} error={error.users} />
            </div>
        </div>
    );
}
