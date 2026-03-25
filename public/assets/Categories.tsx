import {
    Lightbulb,
    Calculator,
    DollarSign,
    BarChart2,
    ClipboardList,
    FileText,
    LineChart,
    BanknoteArrowUp,
    TrendingUp,
} from "lucide-react";
import { ICategory, ICategoryIcon } from "../../src/core/models/questionnaire";

export const categories: ICategory[] = [
    {
        id: 1,
        name: 'Estrategia',
        description: 'Planificación estratégica para el crecimiento sostenible',
        icon: {
            id: 1,
            svg: <Lightbulb className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
        }
    },
    {
        id: 2,
        name: 'Contabilidad',
        description: 'Gestión contable y cumplimiento normativo',
        icon: {
            id: 2,
            svg: <Calculator className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
        }
    },
    {
        id: 3,
        name: 'Costos',
        description: 'Estructuración y análisis de costos operativos',
        icon: {
            id: 3,
            svg: <BarChart2 className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
        }
    },
    {
        id: 4,
        name: 'Finanzas Corporativas',
        description: 'Estrategias financieras para crecimiento empresarial',
        icon: {
            id: 4,
            svg: <LineChart className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
        }
    },
    {
        id: 5,
        name: 'Tributación',
        description: 'Optimización fiscal y cumplimiento tributario',
        icon: {
            id: 5,
            svg: <FileText className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
        }
    },
    {
        id: 6,
        name: 'Decisiones Operativas',
        description: 'Estrategias financieras para crecimiento empresarial',
        icon: {
            id: 6,
            svg: <DollarSign className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
        }
    },
    {
        id: 7,
        name: 'Presupuestos',
        description: 'Planificación presupuestaria para objetivos futuros',
        icon: {
            id: 7,
            svg: <ClipboardList className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
        }
    },
    {
        id: 8,
        name: 'Proyectos de Inversión',
        description: 'Inversiones para mantener e incrementar el valor de la empresa',
        icon: {
            id: 8,
            svg: <BanknoteArrowUp className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
        }
    },
    {
        id: 9,
        name: 'Mercadeo',
        description: 'Estrategias de marketing para posicionamiento y crecimiento empresarial',
        icon: {
            id: 9,
            svg: <TrendingUp className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
        }
    }
];

export const categoriesIcons: ICategoryIcon[] = [
    {
        id: 1,
        svg: <Lightbulb className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
    },
    {

        id: 2,
        svg: <Calculator className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
    },
    {
        id: 3,
        svg: <BarChart2 className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
    },
    {
        id: 4,
        svg: <LineChart className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
    },
    {
        id: 5,
        svg: <FileText className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
    },
    {
        id: 6,
        svg: <DollarSign className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
    },
    {
        id: 7,
        svg: <ClipboardList className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
    },
    {
        id: 8,
        svg: <BanknoteArrowUp className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
    },
    {
        id: 9,
        svg: <TrendingUp className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 text-primary" />
    }
];