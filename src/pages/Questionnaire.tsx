import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchQuestions, submitQuestionnaireAnswers } from '../api/questionnaireApi';
import type { Question, QuestionnaireResult  } from '../types/questionnaire';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Home, 
  Loader2,
  FileText
} from 'lucide-react';

const Questionnaire = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse URL parameters and fetch questions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const clientType = params.get('clientType');
    
    if (category && clientType) {
      setIsLoading(true);
      fetchQuestions(category, clientType)
        .then(fetchedQuestions => {
          setQuestions(fetchedQuestions);
          setIsLoading(false);
        })
        .catch(err => {
          setError('Error al cargar las preguntas');
          setIsLoading(false);
          console.error('Error fetching questions:', err);
        });
    } else {
      navigate('/services');
    }
  }, [location, navigate]);

  // Process text to find and replace keywords with tooltips in the title
  const processTitleWithKeywords = useMemo(() => {
    return (title: string, question: Question) => {
      if (!question.keywords || question.keywords.length === 0) return title;
      
      // Process title for keywords
      let processedTitle = title;
      const processedPositions: {start: number, end: number}[] = [];
      
      // First, check for exact full keyword matches
      question.keywords.forEach(keyword => {
        const fullKeyword = keyword.title.trim();
        if (!fullKeyword) return;
        
        // Create a regex that matches the full keyword as a whole word
        const fullRegex = new RegExp(`\\b${fullKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        let match;
        
        // Find all matches of the full keyword
        while ((match = fullRegex.exec(title)) !== null) {
          const start = match.index;
          const end = start + match[0].length;
          
          // Check if this position is already processed
          const isOverlap = processedPositions.some(pos => 
            (start >= pos.start && start < pos.end) || // New match starts within an existing match
            (end > pos.start && end <= pos.end) ||    // New match ends within an existing match
            (start <= pos.start && end >= pos.end)    // New match completely contains an existing match
          );
          
          if (!isOverlap) {
            processedPositions.push({ start, end });
            
            // Replace the match with the tooltip
            processedTitle = processedTitle.replace(
              new RegExp(`\\b${fullKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
              (match) => 
                `<span class="tooltip tooltip-info" data-tip="${keyword.description}">
                  <span class="text-primary cursor-help border-b border-dotted border-primary">${match}</span>
                </span>`
            );
          }
          
          // If we don't do this, we'll get an infinite loop for zero-length matches
          if (match.index === fullRegex.lastIndex) {
            fullRegex.lastIndex++;
          }
        }
      });
      
      // Then, check for individual word matches for keywords that weren't matched as whole phrases
      question.keywords.forEach(keyword => {
        const fullKeyword = keyword.title.trim();
        if (!fullKeyword) return;
        
        // Only process single-word keywords or keywords that weren't matched as full phrases
        const keywordParts = fullKeyword.includes(' ') ? [] : [fullKeyword];
        
        keywordParts.forEach(part => {
          // Only process if the part is at least 4 characters to avoid matching common short words
          if (part.length >= 4 && !['what', 'this', 'that', 'with', 'your', 'para', 'sobre', 'cual', 'como', 'tiene'].includes(part.toLowerCase())) {
            const wordRegex = new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            
            processedTitle = processedTitle.replace(wordRegex, (match, offset) => {
              // Check if this match is within any of the already processed positions
              const isInProcessed = processedPositions.some(pos => 
                offset >= pos.start && offset < pos.end
              );
              
              if (!isInProcessed) {
                return `<span class="tooltip tooltip-info" data-tip="${keyword.description}">
                  <span class="text-primary cursor-help border-b border-dotted border-primary">${match}</span>
                </span>`;
              }
              return match;
            });
          }
        });
      });
      
      return processedTitle;
    };
  }, []);

  // Process options for keywords
  const processOptions = useMemo(() => {
    return (question: Question) => {
      if (!question.options) return [];
      
      return question.options.map(option => {
        let processedText = option.text;
        
        if (question.keywords) {
          question.keywords.forEach(keyword => {
            // Check for partial word matches - breaking this into parts
            const keywordParts = keyword.title.toLowerCase().split(' ');
            
            // Simple case: look for individual words from the keyword
            keywordParts.forEach(part => {
              // Only process if the part is at least 4 characters to avoid matching common short words
              if (part.length >= 4 && !['what', 'this', 'that', 'with', 'your'].includes(part.toLowerCase())) {
                const wordRegex = new RegExp(`\\b${part}\\b`, 'gi');
                
                // We need to check if this part appears in the text before trying to replace it
                if (wordRegex.test(option.text)) {
                  // Reset the regex since test() advances the lastIndex
                  const replaceRegex = new RegExp(`\\b${part}\\b`, 'gi');
                  processedText = processedText.replace(replaceRegex, (match) => 
                    `<span class="tooltip tooltip-info" data-tip="${keyword.description}">
                      <span class="text-primary cursor-help border-b border-dotted border-primary">${match}</span>
                    </span>`
                  );
                }
              }
            });
          });
        }
        
        return {
          ...option,
          processedText
        };
      });
    };
  }, []);

  // Initialize these variables outside of any conditional blocks to ensure hooks are always called in the same order
  const currentQuestion = questions[currentQuestionIndex] || {
    id: 0,
    title: '',
    type: 'open' as const,
    keywords: []
  };
  
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = questions.length > 0 ? currentQuestionIndex === questions.length - 1 : false;
  
  // Process the title with keywords highlighting
  const processedTitle = useMemo(() => 
    processTitleWithKeywords(currentQuestion.title, currentQuestion),
  [currentQuestion, processTitleWithKeywords]);
  
  // Process options for the current question
  const processedOptions = useMemo(() => 
    processOptions(currentQuestion),
  [currentQuestion, processOptions]);



  // If questions are still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
          <div className="card-body items-center text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4">Cargando cuestionario...</p>
          </div>
        </div>
      </div>
    );
  }

  // If there was an error loading questions, show error state
  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
          <div className="card-body items-center text-center">
            <div className="alert alert-error mb-6">
              <AlertCircle className="h-6 w-6" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => navigate('/services')} 
              className="btn btn-primary gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver a Servicios
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = async () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      try {
        setIsSubmitting(true);
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        const clientType = params.get('clientType');
        
        if (!category || !clientType) {
          throw new Error('Información de categoría o tipo de cliente no encontrada');
        }

        // Prepare the data in a more structured way
        const questionnaireData: QuestionnaireResult = {
          metadata: {
            category,
            clientType,
            timestamp: new Date().toISOString(),
          },
          answers: questions.map(question => {
            const answer = answers[question.id];
            // Ensure answer is always an array for backend compatibility
            let answerArray: string[];
            if (Array.isArray(answer)) {
              answerArray = answer.map(String);
            } else if (answer === null || answer === undefined) {
              answerArray = [];
            } else {
              answerArray = [String(answer)];
            }
            
            return {
              questionId: question.id,
              questionTitle: question.title,
              answer: answerArray,
              type: question.type
            };
          })
        };

        // Send questionnaire data to backend for AI analysis
        const aiRecommendation = await submitQuestionnaireAnswers(questionnaireData);
        
        // Store the AI recommendation in localStorage for the diagnostic review page
        localStorage.setItem('aiRecommendation', aiRecommendation);
        localStorage.setItem('questionnaireData', JSON.stringify(questionnaireData));
        
        console.log('AI Recommendation:', aiRecommendation);
        console.log('Questionnaire Data:', questionnaireData);
        
        setIsComplete(true);
      } catch (err) {
        setError('Error al procesar las respuestas. Por favor, intente nuevamente.');
        console.error('Error processing answers:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswerChange = (value: any) => {
    // Ensure all answers are stored as arrays for backend compatibility
    let answerValue;
    if (Array.isArray(value)) {
      answerValue = value;
    } else if (value === null || value === undefined) {
      answerValue = [];
    } else {
      answerValue = [String(value)];
    }
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerValue
    }));
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'open':
        return (
          <textarea 
            className="textarea textarea-bordered w-full h-32" 
            placeholder="Escriba la respuesta aqui..."
            value={Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id][0] || '' : ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        );
      
      case 'single':
        return (
          <div className="space-y-1">
            {processedOptions.map((option) => (
              <div key={option.id} className="form-control">
                <label className="label cursor-pointer justify-start gap-3 p-2 hover:bg-base-200 rounded-lg">
                  <input
                    type="radio"
                    id={option.id}
                    name={currentQuestion.id.toString()}
                    checked={Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id][0] === option.id}
                    onChange={() => handleAnswerChange(option.id)}
                    className="radio radio-primary"
                  />
                  <span 
                    className="label-text text-left"
                    dangerouslySetInnerHTML={{ __html: option.processedText }}
                  />
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'multiple':
        return (
          <div className="space-y-1">
            {processedOptions.map((option) => (
              <div key={option.id} className="form-control">
                <label className="label cursor-pointer justify-start gap-3 p-2 hover:bg-base-200 rounded-lg">
                  <input
                    type="checkbox"
                    id={option.id}
                    checked={Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option.id)}
                    onChange={(e) => {
                      const currentAnswers = new Set(answers[currentQuestion.id] || []);
                      if (e.target.checked) {
                        currentAnswers.add(option.id);
                      } else {
                        currentAnswers.delete(option.id);
                      }
                      handleAnswerChange(Array.from(currentAnswers));
                    }}
                    className="checkbox checkbox-primary"
                  />
                  <span 
                    className="label-text text-left"
                    dangerouslySetInnerHTML={{ __html: option.processedText }}
                  />
                </label>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
          <div className="card-body items-center text-center">
            <div className="mb-6">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
            </div>
            <h2 className="card-title text-2xl mb-4">¡Cuestionario Completado!</h2>
            <p className="mb-6">Gracias por completar el cuestionario. Nuestro equipo analizará sus respuestas y se pondrá en contacto con usted pronto para proporcionarle un diagnóstico personalizado.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/')} 
                className="btn btn-primary gap-2"
              >
                <Home className="h-5 w-5" />
                Volver al Inicio
              </button>
              <button 
                onClick={() => navigate('/diagnostic-review?id=1')} 
                className="btn btn-outline gap-2"
              >
                <FileText className="h-5 w-5" />
                Ver Diagnóstico
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Progress Bar */}
          <div className="w-full bg-base-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Progress Text */}
          <div className="text-sm text-gray-500 mb-2">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </div>
          
          {/* Question with keyword highlighting */}
          <h2 
            className="card-title text-2xl mb-6"
            dangerouslySetInnerHTML={{ __html: processedTitle }}
          />
          
          {/* Question Input */}
          <div className="mb-8">
            {renderQuestionInput()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="btn btn-ghost gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!Array.isArray(answers[currentQuestion.id]) || 
                       answers[currentQuestion.id].length === 0 ||
                       isSubmitting}
              className="btn btn-primary gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : isLastQuestion ? (
                <>
                  Enviar
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;