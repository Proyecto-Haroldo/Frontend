import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowRight,
  ChevronLeft,
  Lightbulb,
  Calculator,
  DollarSign,
  BarChart2,
  ClipboardList,
  FileText,
  LineChart,
  BanknoteArrowUp,
  Search,
  AlertCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { useNavigate, useSearchParams } from "react-router-dom"
import { Link } from 'react-router-dom'
import { getUserById } from '../../api/userApi'
import { useAuth } from '../../shared/context/AuthContext'
import { Category, IQuestionnaire } from '../../core/models/questionnaire'
import { getQuestionnairesByCategory } from '../../api/analysisApi'

const categories = [
  {
    id: 1,
    title: 'Estrategia',
    description: 'Planificación estratégica para el crecimiento sostenible',
    icon: <Lightbulb className="h-10 w-10 text-primary" />
  },
  {
    id: 2,
    title: 'Contabilidad',
    description: 'Gestión contable y cumplimiento normativo',
    icon: <Calculator className="h-10 w-10 text-primary" />
  },
  {
    id: 5,
    title: 'Costos',
    description: 'Estructuración y análisis de costos operativos',
    icon: <BarChart2 className="h-10 w-10 text-primary" />
  },
  {
    id: 7,
    title: 'Finanzas Corporativas',
    description: 'Estrategias financieras para crecimiento empresarial',
    icon: <LineChart className="h-10 w-10 text-primary" />
  },
  {
    id: 3,
    title: 'Toma de Decisiones Financieras Operativas',
    description: 'Estrategias financieras para crecimiento empresarial',
    icon: <DollarSign className="h-10 w-10 text-primary" />
  },
  {
    id: 4,
    title: 'Tributación',
    description: 'Optimización fiscal y cumplimiento tributario',
    icon: <FileText className="h-10 w-10 text-primary" />
  },
  {
    id: 6,
    title: 'Presupuestos',
    description: 'Planificación presupuestaria para objetivos futuros',
    icon: <ClipboardList className="h-10 w-10 text-primary" />
  },
  {
    id: 8,
    title: 'Proyectos de Inversión',
    description: 'Inversiones para mantener e incrementar el valor de la empresa',
    icon: <BanknoteArrowUp className="h-10 w-10 text-primary" />
  }
]

function Services() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<number | null>(null)
  const [currentView, setCurrentView] =
    useState<'categories' | 'questionnaires' | 'analysisForm'>('categories')
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [questionnaires, setQuestionnaires] = useState<IQuestionnaire[]>([])
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(false)
  const [errorQuestionnaires, setErrorQuestionnaires] = useState("")
  const [search, setSearch] = useState('')
  const [clientType, setClientType] = useState<string>("")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { userId } = useAuth()

  useEffect(() => {
    if (userId == null) return

    getUserById(userId)
      .then(user => {
        setClientType(user.clientType)
      })
      .catch(err =>
        console.error('Error al obtener el tipo de cliente:', err)
      )
  }, [userId])

  useEffect(() => {
    if (!selectedCategory) return

    const fetchQuestionnaires = async () => {
      try {
        setLoadingQuestionnaires(true)

        const data = await getQuestionnairesByCategory(selectedCategory.id)
        setQuestionnaires(data)
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching questionnaires:", error.message)
          setErrorQuestionnaires(error.message)
        } else {
          console.error("Unexpected error fetching questionnaires:", error)
          setErrorQuestionnaires("Unexpected error occurred")
        }
      } finally {
        setLoadingQuestionnaires(false)
      }
    }
    fetchQuestionnaires()
  }, [selectedCategory])

  useEffect(() => {
    const categoryParam = searchParams.get("category")

    if (!categoryParam) return

    const category = categories.find(
      c => c.title.toLowerCase() === categoryParam.toLowerCase()
    )

    if (!category) return

    setSelectedCategory({
      id: category.id,
      name: category.title,
      description: category.description
    })
    setCurrentView("questionnaires")

  }, [searchParams])

  const filteredQuestionnaires = useMemo(() => {
    if (!questionnaires) return []
    if (!search) return questionnaires
    return questionnaires.filter(q =>
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.creatorName?.toLowerCase().includes(search.toLowerCase())
    )
  }, [questionnaires, search])

  const handleQuestionnaireClick = (item: IQuestionnaire) => {
    setSelectedQuestionnaire(item.id)
    setDirection('forward')
    setCurrentView('analysisForm')
  }

  const transition = (
    nextView: 'categories' | 'questionnaires' | 'analysisForm',
    moveDirection: 'forward' | 'backward' = 'forward'
  ) => {
    setDirection(moveDirection)
    setCurrentView(nextView)
  }

  const handleCategorySelect = (categoryId: number) => {

    const category = categories.find(c => c.id === categoryId)

    if (!category) return

    setSelectedCategory({
      id: category.id,
      name: category.title,
      description: category.description
    })

    navigate(`?category=${encodeURIComponent(category.title.toLowerCase())}`)
    transition("questionnaires", "forward")
  }

  const handleBackToCategories = () => {
    navigate("/c/services")
    transition('categories', 'backward')
  }

  const handleBackToQuestionnaires = () => {
    transition('questionnaires', 'backward')
  }

  // Animation variants
  const pageVariants = {
    initial: (direction: string) => ({
      x: direction === 'forward' ? 100 : -100,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? -100 : 100,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    })
  };

  // Card hover animation
  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  };

  const renderCategories = () => (
    <div className="space-y-6">
      <h2 className="text-2xl mb-2 mt-0 font-semibold text-start">
        Nuestros Servicios
      </h2>
      <p className="text-start text-sm text-base-content/70">
        Selecciona una categoría para comenzar. Cada módulo cuenta con cuestionarios que te permitirán conocer tu situación financiera con análisis personalizados.
      </p>
      <hr className="text-accent/25 mx-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (

          <motion.button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="card bg-base-100 shadow-sm cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
            layout
          >
            <div className="card-body items-center text-center p-4">
              <motion.div
                className="mb-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
              >
                {category.icon}
              </motion.div>

              <h3 className="card-title text-lg">
                {category.title}
              </h3>

              <p className="text-sm text-base-content/70">
                {category.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  const renderQuestionnairesList = () => (
    <div className="space-y-5">
      <h2 className="text-2xl mb-2 mt-0 font-semibold text-start">
        {selectedCategory?.name}
      </h2>
      <p className="text-start text-sm text-base-content/70">
        {selectedCategory?.description}. Busca y selecciona un cuestionario de este módulo.
      </p>
      <hr className="text-accent/25 mx-4" />
      <button
        onClick={handleBackToCategories}
        className="btn btn-outline btn-xs gap-2 text-base-content/50"
      >
        <ChevronLeft className="h-4 w-4" /> Volver
      </button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50 z-10" />
        <input
          type="text"
          placeholder="Buscar cuestionario por creador o título..."
          className="input input-bordered w-full pl-10 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          {loadingQuestionnaires && (
            <div className="container mx-auto space-y-6 overflow-hidden">
              <div className="flex items-center justify-center">
                <div className="card w-full bg-base-100 shadow-sm border border-base-200">
                  <div className="card-body items-center text-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                    <p className="mt-4">Cargando cuestionarios...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorQuestionnaires && (
            <div className="container mx-auto p-3">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error shadow-lg"
              >
                <AlertCircle className="h-5 w-5" />
                {errorQuestionnaires}
              </motion.div>
            </div>
          )}

          {!loadingQuestionnaires && filteredQuestionnaires.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-6 hover:bg-base-200/70 transition-colors cursor-pointer ${index !== filteredQuestionnaires.length - 1
                ? 'border-b border-base-200'
                : ''
                }`}
              onClick={() => handleQuestionnaireClick(item)}
            >

              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">
                  {item.title || "Sin definir"}
                </h3>
                <p className="text-sm text-base-content/70">
                  Creado por {item.creatorName}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-base-content/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderWarningAlert = () => (
    <motion.div
      className="alert alert-warning"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <AlertTriangle className="h-5 w-5" />
      <span>Advertencia: Si abandona este formulario, perderá toda la información ingresada.</span>
    </motion.div>
  );

  const renderPolicyAcceptance = () => (
    <div className="space-y-4">
      <div className="bg-base-200/60 rounded-lg p-4">
        <div className="text-sm text-base-content/80 mb-3 flex flex-col gap-2">
          <strong>Política de Privacidad:</strong> De conformidad con lo previsto en las normas sobre protección de datos personales, especialmente lo consagrado en la Ley 1581 de 2012 y sus decretos reglamentarios, autorizo al ITM de manera previa, informada, voluntaria y expresa para que realice el tratamiento de los datos personales consignados en el presente documento y con la finalidad de realizar seguimiento sobre la calidad del servicio prestado por el Consultorio Financiero y Empresarial. Para absolver sus peticiones, solicitudes o reclamos puede consultar la política de tratamiento de datos personales del ITM.
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-primary flex-shrink-0"
            checked={policyAccepted}
            onChange={e => setPolicyAccepted(e.target.checked)}
          />
          <span className="text-sm">
            He leído y acepto la política de tratamiento de datos personales
          </span>
        </label>
      </div>
    </div>
  );

  const renderAnalysisForm = () => (
    <motion.div
      className="card bg-base-100 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-body space-y-6">
        <div className="p-0 mb-4">
          <button
            onClick={handleBackToQuestionnaires}
            className="btn btn-outline btn-xs gap-2 text-base-content/50"
          >
            <ChevronLeft className="h-4 w-4" /> Volver
          </button>
        </div>

        {/* Header Section */}
        <div className="space-y-2">
          <h2 className="card-title text-xl">
            {clientType === 'persona' ? 'Análisis Personal' : 'Análisis Empresarial'}
          </h2>

          <p className="text-sm md:text-base text-base-content/70">
            {clientType === 'persona'
              ? 'Complete el siguiente cuestionario para ayudarnos a entender mejor su situación financiera personal y objetivos.'
              : 'Responda las siguientes preguntas para permitirnos evaluar la situación actual de su empresa y sus necesidades.'}
          </p>
        </div>

        {/* Warning Alert Section */}
        {renderWarningAlert()}

        {/* Policy Acceptance Section */}
        {renderPolicyAcceptance()}

        {/* Action Button */}
        <motion.div
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="pt-2"
        >
          {/* Note: clientType parameter removed for now but may be needed in the future for filtering */}
          <Link
            to={`/c/questionnaire?id=${selectedQuestionnaire}`}
            className={`btn btn-primary gap-2 ${!policyAccepted ? 'btn-disabled' : ''}`}
            tabIndex={policyAccepted ? 0 : -1}
          >
            Comenzar análisis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-dvh flex items-start justify-center overflow-hidden">
      <div className="mx-auto max-w-5xl w-full space-y-6 md:space-y-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentView}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {currentView === 'categories' && renderCategories()}
            {currentView === 'questionnaires' && renderQuestionnairesList()}
            {currentView === 'analysisForm' && renderAnalysisForm()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Services