import { QuestionnaireData } from '../types/questionnaire';

export const sampleQuestionnaire: QuestionnaireData = {
  id: 'financial-health',
  title: 'Financial Health Assessment',
  description: 'Answer these questions to assess your financial health',
  questions: [
    {
      id: 'q1',
      title: 'What is your primary financial goal?',
      description: 'Select the option that best describes your main financial objective',
      type: 'single',
      options: [
        { id: 'q1o1', text: 'Saving for retirement' },
        { id: 'q1o2', text: 'Buying a home' },
        { id: 'q1o3', text: 'Paying off debt' },
        { id: 'q1o4', text: 'Building an emergency fund' },
      ],
      keywords: [
        {
          title: 'Retirement Planning',
          description: 'Planning for financial security in retirement',
        },
        {
          title: 'financial',
          description: 'Relating to finance or money matters',
        },
      ],
    },
    {
      id: 'q2',
      title: 'Which investments are you currently holding?',
      description: 'Select all that apply',
      type: 'multiple',
      options: [
        { id: 'q2o1', text: 'Stocks' },
        { id: 'q2o2', text: 'Bonds' },
        { id: 'q2o3', text: 'Mutual Funds' },
        { id: 'q2o4', text: 'Real Estate' },
      ],
      keywords: [],
    },
    {
      id: 'q3',
      title: 'Tell us about your financial concerns',
      description: 'Please describe any financial worries or questions you have',
      type: 'open',
      keywords: [
        {
          title: 'Worries',
          description: 'Concerns or anxieties about financial matters',
        },
      ],
    },
  ],
};
