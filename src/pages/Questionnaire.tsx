import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { sampleQuestionnaire } from '../data/questionnaireData';
import type {  Question } from '../types/questionnaire';

const Questionnaire = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  
  const currentQuestion = sampleQuestionnaire.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sampleQuestionnaire.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === sampleQuestionnaire.questions.length - 1;

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Mark as complete but don't submit yet
      setIsComplete(true);
      // Here you would typically send the answers to your backend
      console.log('Questionnaire completed:', answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswerChange = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  // Process text to find and replace keywords with tooltips
  const processTextForKeywords = useMemo(() => {
    return (text: string, question: Question) => {
      if (!question.keywords || question.keywords.length === 0) return text;
      
      // Process description for keywords
      let processedText = text;
      
      // First, check for exact keyword matches
      question.keywords.forEach(keyword => {
        // Check for partial word matches - breaking this into parts
        const keywordParts = keyword.title.toLowerCase().split(' ');
        
        // Simple case: look for individual words from the keyword
        keywordParts.forEach(part => {
          // Only process if the part is at least 4 characters to avoid matching common short words
          if (part.length >= 4 && !['what', 'this', 'that', 'with', 'your'].includes(part.toLowerCase())) {
            const wordRegex = new RegExp(`\\b${part}\\b`, 'gi');
            
            // We need to check if this part appears in the text before trying to replace it
            if (wordRegex.test(text)) {
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
      
      return processedText;
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

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'open':
        return (
          <textarea 
            className="textarea textarea-bordered w-full h-32" 
            placeholder="Escriba la respuesta aqui..."
            value={answers[currentQuestion.id] || ''}
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
                    name={currentQuestion.id}
                    checked={answers[currentQuestion.id] === option.id}
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
                    checked={answers[currentQuestion.id]?.includes(option.id) || false}
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
  
  const processedDescription = processTextForKeywords(currentQuestion.description, currentQuestion);
  const processedOptions = processOptions(currentQuestion);

  if (isComplete) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-2xl mb-4">Thank You!</h2>
            <p className="mb-6">Your responses have been recorded. We'll review your information and get back to you soon.</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-primary"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
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
            Question {currentQuestionIndex + 1} of {sampleQuestionnaire.questions.length}
          </div>
          
          {/* Question */}
          <h2 className="card-title text-2xl mb-2">{currentQuestion.title}</h2>
          
          {/* Description with keyword highlighting */}
          {currentQuestion.description && (
            <div 
              className="mb-6 text-gray-600"
              dangerouslySetInnerHTML={{ __html: processedDescription }}
            />
          )}
          
          {/* Question Input */}
          <div className="mb-8">
            {renderQuestionInput()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="btn btn-ghost"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id] || 
                       (Array.isArray(answers[currentQuestion.id]) && 
                        answers[currentQuestion.id].length === 0)}
              className="btn btn-primary"
            >
              {isLastQuestion ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
