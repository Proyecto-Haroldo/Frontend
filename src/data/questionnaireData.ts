import { QuestionnaireData } from '../types/questionnaire';

// Helper function to create questionnaire variants based on client type
const createQuestionnaireVariants = (
  baseId: string,
  personalQuestions: QuestionnaireData['questions'],
  businessQuestions: QuestionnaireData['questions']
): { 
  [key: string]: QuestionnaireData 
} => {
  return {
    [`${baseId}_personal`]: {
      id: `${baseId}_personal`,
      questions: personalQuestions,
    },
    [`${baseId}_business`]: {
      id: `${baseId}_business`,
      questions: businessQuestions,
    }
  };
};

// Estrategia questionnaire - Personal version
const estrategiaPersonalQuestions = [
  {
    id: 1,
    title: '¿Cuáles son sus objetivos financieros personales?',
    type: 'open' as const,
    keywords: [
      {
        title: 'Objetivos Financieros',
        description: 'Metas financieras personales a largo plazo'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuál es su situación financiera actual?',
    type: 'single' as const,
    options: [
      { id: 'q2o1', text: 'Tengo deudas significativas' },
      { id: 'q2o2', text: 'Estoy equilibrado financieramente' },
      { id: 'q2o3', text: 'Tengo ahorros moderados' },
      { id: 'q2o4', text: 'Tengo inversiones diversificadas' }
    ],
    keywords: [
      {
        title: 'Situación Financiera',
        description: 'Estado actual de sus finanzas personales'
      }
    ]
  }
];

// Estrategia questionnaire - Business version
const estrategiaBusinessQuestions = [
  {
    id: 1,
    title: '¿Cuáles son los objetivos estratégicos de su empresa?',
    type: 'open' as const,
    keywords: [
      {
        title: 'Objetivos Estratégicos',
        description: 'Metas a largo plazo de la empresa'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuál es su modelo de negocio actual?',
    type: 'single' as const,
    options: [
      { id: 'q2o1', text: 'Producto/Servicio' },
      { id: 'q2o2', text: 'Suscripción' },
      { id: 'q2o3', text: 'Consultoría' },
      { id: 'q2o4', text: 'Otro' }
    ],
    keywords: [
      {
        title: 'Modelo de Negocio',
        description: 'Estructura de operaciones y ganancias'
      }
    ]
  }
];

// Contabilidad questionnaire - Personal version
const contabilidadPersonalQuestions = [
  {
    id: 1,
    title: '¿Cómo gestiona sus finanzas personales?',
    type: 'multiple' as const,
    options: [
      { id: 'q1o1', text: 'Registro manual de gastos' },
      { id: 'q1o2', text: 'Aplicaciones de finanzas personales' },
      { id: 'q1o3', text: 'Asesores financieros' },
      { id: 'q1o4', text: 'No llevo un registro formal' }
    ],
    keywords: [
      {
        title: 'Gestión Financiera Personal',
        description: 'Método para administrar finanzas personales'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son sus principales desafíos financieros personales?',
    type: 'open' as const,
    keywords: [
      {
        title: 'Desafíos Financieros',
        description: 'Problemas en el manejo de sus finanzas personales'
      }
    ]
  }
];

// Contabilidad questionnaire - Business version
const contabilidadBusinessQuestions = [
  {
    id: 1,
    title: '¿Qué tipo de contabilidad utiliza su empresa actualmente?',
    type: 'multiple' as const,
    options: [
      { id: 'q1o1', text: 'Contabilidad manual' },
      { id: 'q1o2', text: 'Software contable' },
      { id: 'q1o3', text: 'Servicios contables externos' },
      { id: 'q1o4', text: 'Departamento contable interno' }
    ],
    keywords: [
      {
        title: 'Contabilidad Empresarial',
        description: 'Sistema de registro financiero de la empresa'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son los principales desafíos contables de su empresa?',
    type: 'open' as const,
    keywords: [
      {
        title: 'Desafíos Contables',
        description: 'Problemas en el manejo financiero empresarial'
      }
    ]
  }
];

// Finanzas questionnaire - Personal version
const finanzasPersonalQuestions = [
  {
    id: 1,
    title: '¿Cuál es su nivel de endeudamiento personal?',
    type: 'single' as const,
    options: [
      { id: 'q1o1', text: 'Sin deudas' },
      { id: 'q1o2', text: 'Deudas menores (< 30% de ingresos)' },
      { id: 'q1o3', text: 'Deudas moderadas (30-50% de ingresos)' },
      { id: 'q1o4', text: 'Deudas significativas (> 50% de ingresos)' }
    ],
    keywords: [
      {
        title: 'Nivel de Endeudamiento',
        description: 'Proporción de deuda sobre ingresos personales'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son sus metas financieras personales?',
    type: 'multiple' as const,
    options: [
      { id: 'q2o1', text: 'Ahorro para emergencias' },
      { id: 'q2o2', text: 'Inversión para jubilación' },
      { id: 'q2o3', text: 'Compra de propiedad' },
      { id: 'q2o4', text: 'Eliminación de deudas' }
    ],
    keywords: [
      {
        title: 'Metas Financieras',
        description: 'Objetivos financieros personales'
      }
    ]
  }
];

// Finanzas questionnaire - Business version
const finanzasBusinessQuestions = [
  {
    id: 1,
    title: '¿Cuál es el ratio de endeudamiento de su empresa?',
    type: 'single' as const,
    options: [
      { id: 'q1o1', text: 'Menos del 30%' },
      { id: 'q1o2', text: '30-50%' },
      { id: 'q1o3', text: '50-70%' },
      { id: 'q1o4', text: 'Más del 70%' }
    ],
    keywords: [
      {
        title: 'Ratio de Endeudamiento',
        description: 'Proporción de deuda total sobre activos de la empresa'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son las metas financieras de su empresa?',
    type: 'multiple' as const,
    options: [
      { id: 'q2o1', text: 'Aumentar ingresos' },
      { id: 'q2o2', text: 'Reducir costos' },
      { id: 'q2o3', text: 'Mejorar flujo de efectivo' },
      { id: 'q2o4', text: 'Expandir operaciones' }
    ],
    keywords: [
      {
        title: 'Metas Financieras',
        description: 'Objetivos de rendimiento financiero empresarial'
      }
    ]
  }
];

// Costos questionnaire - Personal version
const costosPersonalQuestions = [
  {
    id: 1,
    title: '¿Cómo distribuye sus gastos personales?',
    type: 'multiple' as const,
    options: [
      { id: 'q1o1', text: 'Vivienda' },
      { id: 'q1o2', text: 'Alimentación' },
      { id: 'q1o3', text: 'Transporte' },
      { id: 'q1o4', text: 'Entretenimiento' }
    ],
    keywords: [
      {
        title: 'Distribución de Gastos',
        description: 'Clasificación de gastos personales'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuál es su principal desafío en el control de gastos personales?',
    type: 'open' as const,
    keywords: [
      {
        title: 'Control de Gastos',
        description: 'Estrategias para optimizar gastos personales'
      }
    ]
  }
];

// Costos questionnaire - Business version
const costosBusinessQuestions = [
  {
    id: 1,
    title: '¿Cuál es la estructura de costos de su empresa?',
    type: 'multiple' as const,
    options: [
      { id: 'q1o1', text: 'Costos fijos' },
      { id: 'q1o2', text: 'Costos variables' },
      { id: 'q1o3', text: 'Costos mixtos' },
      { id: 'q1o4', text: 'Costos indirectos' }
    ],
    keywords: [
      {
        title: 'Estructura de Costos',
        description: 'Clasificación de gastos empresariales'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuál es el principal desafío en control de costos de su empresa?',
    type: 'open' as const,
    keywords: [
      {
        title: 'Control de Costos',
        description: 'Estrategias para optimizar gastos empresariales'
      }
    ]
  }
];

// Presupuesto questionnaire - Personal version
const presupuestoPersonalQuestions = [
  {
    id: 1,
    title: '¿Cómo planifica su presupuesto personal?',
    type: 'single' as const,
    options: [
      { id: 'q1o1', text: 'Presupuesto mensual detallado' },
      { id: 'q1o2', text: 'Presupuesto simple por categorías' },
      { id: 'q1o3', text: 'No uso un presupuesto formal' },
      { id: 'q1o4', text: 'Uso aplicaciones de presupuesto' }
    ],
    keywords: [
      {
        title: 'Planificación Presupuestaria',
        description: 'Técnicas de planificación financiera personal'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son sus objetivos presupuestarios personales?',
    type: 'multiple' as const,
    options: [
      { id: 'q2o1', text: 'Reducir gastos' },
      { id: 'q2o2', text: 'Aumentar ahorros' },
      { id: 'q2o3', text: 'Pagar deudas' },
      { id: 'q2o4', text: 'Planificar grandes compras' }
    ],
    keywords: [
      {
        title: 'Objetivos Presupuestarios',
        description: 'Metas de planificación financiera personal'
      }
    ]
  }
];

// Presupuesto questionnaire - Business version
const presupuestoBusinessQuestions = [
  {
    id: 1,
    title: '¿Cuál es el método de presupuestación de su empresa?',
    type: 'single' as const,
    options: [
      { id: 'q1o1', text: 'Presupuesto estático' },
      { id: 'q1o2', text: 'Presupuesto flexible' },
      { id: 'q1o3', text: 'Presupuesto base cero' },
      { id: 'q1o4', text: 'Presupuesto por actividades' }
    ],
    keywords: [
      {
        title: 'Métodos Presupuestarios',
        description: 'Técnicas de planificación financiera empresarial'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son los objetivos presupuestarios de su empresa?',
    type: 'multiple' as const,
    options: [
      { id: 'q2o1', text: 'Reducir gastos operativos' },
      { id: 'q2o2', text: 'Aumentar ingresos' },
      { id: 'q2o3', text: 'Mejorar margen de beneficio' },
      { id: 'q2o4', text: 'Optimizar recursos' }
    ],
    keywords: [
      {
        title: 'Objetivos Presupuestarios',
        description: 'Metas de planificación financiera empresarial'
      }
    ]
  }
];

// Tributaria questionnaire - Personal version
const tributariaPersonalQuestions = [
  {
    id: 1,
    title: '¿Qué tipo de obligaciones fiscales personales tiene?',
    type: 'multiple' as const,
    options: [
      { id: 'q1o1', text: 'Impuesto sobre la renta' },
      { id: 'q1o2', text: 'Impuesto predial' },
      { id: 'q1o3', text: 'Impuestos por inversiones' },
      { id: 'q1o4', text: 'Otras' }
    ],
    keywords: [
      {
        title: 'Obligaciones Fiscales',
        description: 'Responsabilidades tributarias personales'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son sus principales desafíos tributarios personales?',
    type: 'open' as const,
    keywords: [
      {
        title: 'Desafíos Tributarios',
        description: 'Problemas en cumplimiento fiscal personal'
      }
    ]
  }
];

// Tributaria questionnaire - Business version
const tributariaBusinessQuestions = [
  {
    id: 1,
    title: '¿Qué tipo de obligaciones fiscales tiene su empresa?',
    type: 'multiple' as const,
    options: [
      { id: 'q1o1', text: 'IVA' },
      { id: 'q1o2', text: 'ISR' },
      { id: 'q1o3', text: 'IEPS' },
      { id: 'q1o4', text: 'Otras' }
    ],
    keywords: [
      {
        title: 'Obligaciones Fiscales',
        description: 'Responsabilidades tributarias empresariales'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son los principales desafíos tributarios de su empresa?',
    type: 'open' as const,
    keywords: [
      {
        title: 'Desafíos Tributarios',
        description: 'Problemas en cumplimiento fiscal empresarial'
      }
    ]
  }
];

// Finanzas corporativas questionnaire - Personal version (adapting to personal finance planning)
const finanzasCorporativasPersonalQuestions = [
  {
    id: 1,
    title: '¿Cómo gestiona su patrimonio personal?',
    type: 'multiple' as const,
    options: [
      { id: 'q1o1', text: 'Ahorro tradicional' },
      { id: 'q1o2', text: 'Inversiones en bolsa' },
      { id: 'q1o3', text: 'Bienes raíces' },
      { id: 'q1o4', text: 'Otros activos' }
    ],
    keywords: [
      {
        title: 'Gestión Patrimonial',
        description: 'Administración de activos personales'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son sus objetivos de planificación financiera personal?',
    type: 'multiple' as const,
    options: [
      { id: 'q2o1', text: 'Crecimiento patrimonial' },
      { id: 'q2o2', text: 'Protección de activos' },
      { id: 'q2o3', text: 'Planificación de jubilación' },
      { id: 'q2o4', text: 'Planificación sucesoria' }
    ],
    keywords: [
      {
        title: 'Objetivos Financieros',
        description: 'Metas de planificación financiera personal'
      }
    ]
  }
];

// Finanzas corporativas questionnaire - Business version
const finanzasCorporativasBusinessQuestions = [
  {
    id: 1,
    title: '¿Cuál es la estructura de capital de su empresa?',
    type: 'multiple' as const,
    options: [
      { id: 'q1o1', text: 'Capital propio' },
      { id: 'q1o2', text: 'Deuda a corto plazo' },
      { id: 'q1o3', text: 'Deuda a largo plazo' },
      { id: 'q1o4', text: 'Otras' }
    ],
    keywords: [
      {
        title: 'Estructura de Capital',
        description: 'Composición financiera de la empresa'
      }
    ]
  },
  {
    id: 2,
    title: '¿Cuáles son las metas estratégicas financieras de su empresa?',
    type: 'multiple' as const,
    options: [
      { id: 'q2o1', text: 'Aumentar valor accionario' },
      { id: 'q2o2', text: 'Optimizar estructura de capital' },
      { id: 'q2o3', text: 'Expandir operaciones' },
      { id: 'q2o4', text: 'Mejorar rentabilidad' }
    ],
    keywords: [
      {
        title: 'Metas Estratégicas',
        description: 'Objetivos financieros corporativos'
      }
    ]
  }
];

// Create questionnaire variants for each category
export const estrategiaQuestionnaires = createQuestionnaireVariants(
  'estrategia',
  estrategiaPersonalQuestions,
  estrategiaBusinessQuestions
);

export const contabilidadQuestionnaires = createQuestionnaireVariants(
  'contabilidad',
  contabilidadPersonalQuestions,
  contabilidadBusinessQuestions
);

export const finanzasQuestionnaires = createQuestionnaireVariants(
  'finanzas',
  finanzasPersonalQuestions,
  finanzasBusinessQuestions
);

export const costosQuestionnaires = createQuestionnaireVariants(
  'costos',
  costosPersonalQuestions,
  costosBusinessQuestions
);

export const presupuestoQuestionnaires = createQuestionnaireVariants(
  'presupuesto',
  presupuestoPersonalQuestions,
  presupuestoBusinessQuestions
);

export const tributariaQuestionnaires = createQuestionnaireVariants(
  'tributaria',
  tributariaPersonalQuestions,
  tributariaBusinessQuestions
);

export const finanzasCorporativasQuestionnaires = createQuestionnaireVariants(
  'finanzas-corporativas',
  finanzasCorporativasPersonalQuestions,
  finanzasCorporativasBusinessQuestions
);

// Combine all questionnaires into one map
export const questionnaires: Record<string, QuestionnaireData> = {
  ...estrategiaQuestionnaires,
  ...contabilidadQuestionnaires,
  ...finanzasQuestionnaires,
  ...costosQuestionnaires,
  ...presupuestoQuestionnaires,
  ...tributariaQuestionnaires,
  ...finanzasCorporativasQuestionnaires
};