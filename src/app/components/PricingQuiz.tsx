import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    value: string;
    points: { starter: number; growth: number; scale: number };
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'revenue',
    question: 'What is your monthly revenue?',
    options: [
      { text: 'Just starting out ($0-$5K)', value: 'low', points: { starter: 3, growth: 1, scale: 0 } },
      { text: 'Growing business ($5K-$25K)', value: 'medium', points: { starter: 1, growth: 3, scale: 1 } },
      { text: 'Established business ($25K-$100K)', value: 'high', points: { starter: 0, growth: 2, scale: 3 } },
      { text: 'Enterprise ($100K+)', value: 'enterprise', points: { starter: 0, growth: 1, scale: 3 } },
    ],
  },
  {
    id: 'transactions',
    question: 'How many transactions do you process monthly?',
    options: [
      { text: 'Less than 50', value: 'low', points: { starter: 3, growth: 1, scale: 0 } },
      { text: '50-200', value: 'medium', points: { starter: 1, growth: 3, scale: 1 } },
      { text: '200-500', value: 'high', points: { starter: 0, growth: 2, scale: 3 } },
      { text: '500+', value: 'very-high', points: { starter: 0, growth: 1, scale: 3 } },
    ],
  },
  {
    id: 'team',
    question: 'How many team members need access?',
    options: [
      { text: 'Just me', value: 'solo', points: { starter: 3, growth: 1, scale: 0 } },
      { text: '2-5 people', value: 'small', points: { starter: 1, growth: 3, scale: 1 } },
      { text: '6-15 people', value: 'medium', points: { starter: 0, growth: 2, scale: 3 } },
      { text: '15+ people', value: 'large', points: { starter: 0, growth: 0, scale: 3 } },
    ],
  },
  {
    id: 'features',
    question: 'What features are most important to you?',
    options: [
      { text: 'Basic payment processing', value: 'basic', points: { starter: 3, growth: 1, scale: 0 } },
      { text: 'Analytics and reporting', value: 'analytics', points: { starter: 0, growth: 3, scale: 2 } },
      { text: 'Advanced tools (API, multi-location)', value: 'advanced', points: { starter: 0, growth: 1, scale: 3 } },
      { text: 'Everything + priority support', value: 'premium', points: { starter: 0, growth: 0, scale: 3 } },
    ],
  },
  {
    id: 'growth',
    question: 'What are your growth plans?',
    options: [
      { text: 'Testing the waters', value: 'testing', points: { starter: 3, growth: 1, scale: 0 } },
      { text: 'Steady growth expected', value: 'steady', points: { starter: 0, growth: 3, scale: 1 } },
      { text: 'Rapid expansion planned', value: 'rapid', points: { starter: 0, growth: 1, scale: 3 } },
      { text: 'Already scaling multiple locations', value: 'scaling', points: { starter: 0, growth: 0, scale: 3 } },
    ],
  },
];

export function PricingQuiz() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setShowResult(true);
      }, 300);
    }
  };

  const calculateRecommendation = () => {
    const scores = { starter: 0, growth: 0, scale: 0 };

    quizQuestions.forEach((question) => {
      const answer = answers[question.id];
      const option = question.options.find((opt) => opt.value === answer);
      if (option) {
        scores.starter += option.points.starter;
        scores.growth += option.points.growth;
        scores.scale += option.points.scale;
      }
    });

    if (scores.scale >= scores.growth && scores.scale >= scores.starter) {
      return 'scale';
    } else if (scores.growth >= scores.starter) {
      return 'growth';
    } else {
      return 'starter';
    }
  };

  const getRecommendationDetails = () => {
    const recommendation = calculateRecommendation();
    
    if (recommendation === 'scale') {
      return {
        name: 'Scale',
        price: '$199/mo',
        description: 'Perfect for your growing business with advanced needs',
        badge: 'BEST VALUE',
        badgeColor: 'bg-[#4945FF]',
        benefits: [
          'Unlimited team members',
          'Advanced analytics & API access',
          'Multi-location support',
          'Priority support & dedicated account manager',
        ],
      };
    } else if (recommendation === 'growth') {
      return {
        name: 'Growth',
        price: '$99/mo',
        description: 'Ideal for businesses ready to scale operations',
        badge: 'MOST POPULAR',
        badgeColor: 'bg-[#4945FF]',
        benefits: [
          'Up to 10 team members',
          'Advanced analytics dashboard',
          'API access for integrations',
          'Phone & chat support',
        ],
      };
    } else {
      return {
        name: 'Starter',
        price: 'FREE',
        description: 'Great for getting started with zero monthly fees',
        badge: 'BEST FOR BEGINNERS',
        badgeColor: 'bg-[#080A28]',
        benefits: [
          'Zero monthly fees',
          'Mobile card reader included',
          'Basic analytics dashboard',
          'Email support',
        ],
      };
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  if (!isOpen) {
    return (
      <div className="bg-gradient-to-br from-[#4945FF] to-[#041E42] rounded-xl p-8 text-center text-white shadow-xl">
        <div className="mb-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">Not sure which plan is right?</h3>
          <p className="text-white/80 mb-6">
            Take our quick 5-question quiz and we'll recommend the perfect plan for your business.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-white text-[#4945FF] px-8 py-3 rounded-md font-semibold hover:bg-[#F6F7FB] transition-all inline-flex items-center gap-2"
          >
            Take the Quiz
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const recommendation = getRecommendationDetails();
    
    return (
      <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        <div className="bg-gradient-to-br from-[#4945FF] to-[#041E42] p-8 text-center text-white">
          <div className="mb-4">
            <Check className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full p-3" />
          </div>
          <h3 className="text-3xl font-bold mb-2">We recommend: {recommendation.name}</h3>
          <p className="text-white/90 text-lg">{recommendation.description}</p>
        </div>
        
        <div className="p-8">
          <div className="bg-[#F6F7FB] rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold text-[#041E42] mb-1">{recommendation.price}</div>
                <div className={`inline-block ${recommendation.badgeColor} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                  {recommendation.badge}
                </div>
              </div>
            </div>
            
            <ul className="space-y-3">
              {recommendation.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4945FF] flex-shrink-0 mt-0.5" />
                  <span className="text-[#041E42]">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                window.location.href = '#pricing';
              }}
              className="flex-1 bg-[#4945FF] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#3933CC] transition-all"
            >
              View Full Details
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 rounded-md font-semibold border border-[#E5E7EB] text-[#041E42] hover:bg-[#F6F7FB] transition-all"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 bg-[#E5E7EB]">
        <div
          className="h-full bg-[#4945FF] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="p-8">
        <div className="mb-6">
          <div className="text-sm text-[#6B7280] mb-2">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </div>
          <h3 className="text-2xl font-bold text-[#041E42] mb-6">{question.question}</h3>
        </div>
        
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(question.id, option.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                answers[question.id] === option.value
                  ? 'border-[#4945FF] bg-[#4945FF]/5'
                  : 'border-[#E5E7EB] hover:border-[#4945FF]/50 hover:bg-[#F6F7FB]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#041E42]">{option.text}</span>
                {answers[question.id] === option.value && (
                  <Check className="w-5 h-5 text-[#4945FF]" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setIsOpen(false)}
          className="mt-6 text-[#6B7280] hover:text-[#041E42] text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
