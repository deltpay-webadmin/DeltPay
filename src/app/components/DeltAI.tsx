import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image as ImageIcon, Code, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import logoImage from 'figma:asset/61527edee0ea2e963bace756584cec3657b62f9e.png';
import aiIcon from 'figma:asset/f4e6b69864ccf72e81b67d1397494cae42f32717.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DeltAIProps {
  embedded?: boolean;
  externalQuestion?: string | null;
  externalQuestionId?: number;
}

export function DeltAI({ embedded = false, externalQuestion = null, externalQuestionId = 0 }: DeltAIProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSimulatingTyping, setIsSimulatingTyping] = useState(false);
  const [demoComplete, setDemoComplete] = useState(false);
  const [showInitialState, setShowInitialState] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!embedded);
  const animationStarted = useRef(false);

  const scrollToBottom = () => {
    if (embedded && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    } else if (!embedded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, embedded]);

  // Visibility detection for embedded mode
  useEffect(() => {
    if (!embedded || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('Visibility changed:', entry.isIntersecting);
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [embedded]);

  // Auto-start demo animation with TWO questions
  useEffect(() => {
    console.log('Demo effect running:', {
      animationStarted: animationStarted.current,
      isInView,
      demoComplete,
      embedded
    });

    if (animationStarted.current || !isInView || demoComplete) {
      console.log('Skipping animation start');
      return;
    }
    
    animationStarted.current = true;
    console.log('🚀 Starting DeltAI demo animation...');

    // Helper function to type text character by character
    const typeText = (text: string, callback: () => void) => {
      let charIndex = 0;
      const interval = setInterval(() => {
        if (charIndex <= text.length) {
          setInputValue(text.substring(0, charIndex));
          charIndex++;
        } else {
          clearInterval(interval);
          callback();
        }
      }, 50);
    };

    // Step 1: Show initial state for 3 seconds
    setTimeout(() => {
      console.log('✅ Step 1: Hiding initial state');
      setShowInitialState(false);
      
      // Step 2: Type FIRST question
      setTimeout(() => {
        console.log('✅ Step 2: Typing first question');
        setIsSimulatingTyping(true);
        const firstQuestion = "Show me my top-selling products this month";
        
        typeText(firstQuestion, () => {
          setIsSimulatingTyping(false);
          
          // Step 3: Send first message
          setTimeout(() => {
            console.log('✅ Step 3: Sending first question');
            const userMessage1: Message = {
              id: 'demo-user-1',
              role: 'user',
              content: firstQuestion,
              timestamp: new Date(),
            };
            setMessages([userMessage1]);
            setInputValue('');
            setIsTyping(true);

            // Step 4: Show FIRST AI response
            setTimeout(() => {
              console.log('✅ Step 4: Showing first AI response');
              const aiResponse1 = embedded 
                ? `Based on your sales data, here are your top 3 products this month:\n\n1. Iced Lattes - $8,450 (↑ 23%)\n2. Breakfast Sandwiches - $6,280 (↑ 18%)\n3. Cold Brew Coffee - $4,920 (↑ 31%)\n\n💡 Your cold beverages are performing exceptionally well!`
                : `Based on your sales data for Blue Moon Cafe, here are your top 3 products this month:\n\n1. Iced Lattes - $8,450 (↑ 23% from last month)\n2. Breakfast Sandwiches - $6,280 (↑ 18%)\n3. Cold Brew Coffee - $4,920 (↑ 31%)\n\n💡 Insight: Your cold beverage sales are performing exceptionally well. This represents 52% of your total revenue this month.`;

              const aiMessage1: Message = {
                id: 'demo-ai-1',
                role: 'assistant',
                content: aiResponse1,
                timestamp: new Date(),
              };
              setMessages([userMessage1, aiMessage1]);
              setIsTyping(false);
              
              // Step 5: Type SECOND question after a pause
              setTimeout(() => {
                console.log('✅ Step 5: Typing second question');
                setIsSimulatingTyping(true);
                const secondQuestion = "What's my revenue prediction for next month?";
                
                typeText(secondQuestion, () => {
                  setIsSimulatingTyping(false);
                  
                  // Step 6: Send second message
                  setTimeout(() => {
                    console.log('✅ Step 6: Sending second question');
                    const userMessage2: Message = {
                      id: 'demo-user-2',
                      role: 'user',
                      content: secondQuestion,
                      timestamp: new Date(),
                    };
                    setMessages([userMessage1, aiMessage1, userMessage2]);
                    setInputValue('');
                    setIsTyping(true);

                    // Step 7: Show SECOND AI response
                    setTimeout(() => {
                      console.log('✅ Step 7: Showing second AI response');
                      const aiResponse2 = embedded
                        ? `📊 Revenue Prediction: $28,400 next month\n\nThis is based on:\n• Current growth: +24% avg\n• Seasonal trends\n• Customer acquisition rate\n• Avg transaction: $12.50\n\n💡 Consider launching an iced coffee subscription to lock in this momentum!`
                        : `📊 Revenue Prediction for Next Month: $28,400\n\nThis prediction is based on:\n• Current growth trajectory (+24% average)\n• Seasonal trends (summer drinks performing well)\n• Recent customer acquisition rate\n• Average transaction value increase to $12.50\n\n💡 Recommendation: Consider launching an iced coffee subscription or loyalty program to lock in this momentum. Your breakfast items are strong—bundling them with morning drinks could boost average order value by 15-20%.`;

                      const aiMessage2: Message = {
                        id: 'demo-ai-2',
                        role: 'assistant',
                        content: aiResponse2,
                        timestamp: new Date(),
                      };
                      setMessages([userMessage1, aiMessage1, userMessage2, aiMessage2]);
                      setIsTyping(false);
                      setDemoComplete(true);
                      console.log('✅ Demo complete! Now waiting for user input.');
                    }, 2000);
                  }, 200);
                });
              }, 1500); // Pause before second question
            }, 2000);
          }, 200);
        });
      }, 100);
    }, 3000); // Show initial state for 3 seconds
  }, [isInView, demoComplete, embedded]);

  // Handle external questions from parent component
  const lastExternalQuestionId = useRef(0);
  useEffect(() => {
    if (!externalQuestion || externalQuestionId === lastExternalQuestionId.current || isTyping || isSimulatingTyping) return;
    lastExternalQuestionId.current = externalQuestionId;

    // Skip the demo and go straight to answering
    if (!demoComplete) {
      animationStarted.current = true;
      setDemoComplete(true);
    }
    setShowInitialState(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: externalQuestion,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = '';

      if (externalQuestion.toLowerCase().includes('return rate')) {
        aiResponse = `📦 Product Return Rate Analysis — Q1 2026\n\nHere are your products ranked by return rate this quarter:\n\n1. Wireless Earbuds Pro — 14.2% return rate\n   • 142 of 1,000 units returned\n   • Top reason: "Connectivity issues" (61%)\n   • 💡 Consider a firmware update or supplier change\n\n2. Leather Weekender Bag — 9.8% return rate\n   • 49 of 500 units returned\n   • Top reason: "Smaller than expected" (73%)\n   • 💡 Update product photos with size reference\n\n3. Stainless Steel Water Bottle — 3.1% return rate\n   • 31 of 1,000 units returned\n   • Top reason: "Dented in shipping" (58%)\n   • 💡 Upgrade packaging for transit protection\n\n⚠️ Your Wireless Earbuds Pro alone account for 47% of all returns this quarter. Addressing that one SKU could cut your overall return rate nearly in half.\n\n✅ Average return rate across all products: 6.4% (industry avg: 8.1%)`;
      } else if (externalQuestion.toLowerCase().includes('losing the most revenue') || externalQuestion.toLowerCase().includes('what days')) {
        aiResponse = `📉 Revenue Loss Analysis by Day\n\nYour weakest revenue days over the past 90 days:\n\n🔴 Tuesdays — avg $1,840/day (↓ 34% vs. daily avg)\n   • Foot traffic drops 41% vs. Monday\n   • Online orders also dip 22%\n   • 💡 This is your biggest opportunity gap\n\n🟠 Sundays — avg $2,120/day (↓ 24% vs. daily avg)\n   • Morning rush is strong, but afternoon dies\n   • Average ticket drops to $9.20 (vs. $12.50 weekday)\n\n🟢 Best day: Saturdays — avg $3,890/day\n\nWhy Tuesdays hurt:\n• No promotions currently running\n• Staff is at full capacity (overstaffed for demand)\n• Competitors run Tuesday specials that pull traffic\n\n💡 Recommendation: Launch a "Tuesday Double Points" loyalty promo and reduce staffing by 1 person. Estimated recovery: +$580/week → +$30,160/year in recaptured revenue.`;
      } else if (externalQuestion.toLowerCase().includes('reinvesting') || externalQuestion.toLowerCase().includes('cutting costs')) {
        aiResponse = `📊 Reinvest vs. Cut Costs — Strategic Analysis\n\nBased on your financials, cash flow, and growth trajectory:\n\n✅ Verdict: Reinvest — but strategically.\n\nHere's why:\n• Revenue is trending up +18% QoQ\n• Cash reserves: $47,200 (healthy 3.2-month runway)\n• Profit margin: 14.6% (above industry avg of 11%)\n• Customer acquisition cost is dropping (-12% this quarter)\n\n🎯 Where to reinvest for highest ROI:\n\n1. Marketing — $3,000/month\n   • Your CAC is low and trending lower\n   • Expected return: 4.2x within 90 days\n\n2. Inventory (Cold Beverages) — $2,500 one-time\n   • Cold drinks are up 31% — you're at risk of stockouts\n   • Expected return: 2.8x within 60 days\n\n3. Staff training — $1,200 one-time\n   • Upsell conversion is only 8% (industry best: 22%)\n   • Expected return: +$850/month ongoing\n\n⚠️ Where NOT to spend right now:\n• New equipment (utilization is only 64%)\n• Physical expansion (lease market is peaking)\n\n💡 Bottom line: You're in a growth phase with strong fundamentals. Now is the time to invest in revenue drivers, not cut costs that slow momentum.`;
      } else {
        aiResponse = `Great question! Based on your business data, I can provide detailed analysis on this topic. Let me pull up the relevant metrics and trends for you.\n\nI'm Delt AI, your intelligent business assistant. I can help you analyze payment trends, generate financial reports, provide business insights, and much more.`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  }, [externalQuestion, externalQuestionId, isTyping, isSimulatingTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSimulatingTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm Delt AI, your intelligent business assistant. I can help you analyze payment trends, generate financial reports, provide business insights, and much more. How can I assist you today?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (promptText: string) => {
    if (isSimulatingTyping || !demoComplete) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    
    setTimeout(() => {
      let aiResponse = '';
      
      if (promptText === 'Generate financial report') {
        aiResponse = embedded
          ? `📊 Financial Report - Blue Moon Cafe\n\n💰 Revenue Summary:\n• This Month: $28,450\n• Last Month: $24,200 (↑ 17.6%)\n• YTD: $312,800\n\n📈 Top Revenue Streams:\n1. Food & Beverages: $22,100 (78%)\n2. Merchandise: $4,200 (15%)\n3. Catering: $2,150 (7%)\n\n💳 Payment Methods:\n• Card: 68% ($19,346)\n• Cash: 22% ($6,259)\n• Digital Wallets: 10% ($2,845)\n\n✅ Your business is growing steadily with strong card adoption.`
          : `📊 Financial Report - Blue Moon Cafe\nPeriod: February 2026\n\n💰 Revenue Summary:\n• This Month: $28,450\n• Last Month: $24,200 (↑ 17.6%)\n• Year-to-Date: $312,800\n• Average Daily: $1,423\n\n📈 Revenue by Category:\n1. Food & Beverages: $22,100 (78%)\n2. Merchandise: $4,200 (15%)\n3. Catering Services: $2,150 (7%)\n\n💳 Payment Methods:\n• Card Payments: 68% ($19,346)\n• Cash: 22% ($6,259)\n• Digital Wallets: 10% ($2,845)\n\n📊 Expenses:\n• Cost of Goods: $9,890 (35%)\n• Labor: $8,120 (29%)\n• Rent & Utilities: $4,200 (15%)\n• Other: $2,100 (7%)\n• Net Profit: $4,140 (14.6%)\n\n✅ Your business is performing well with healthy profit margins and strong card payment adoption.`;
      } else if (promptText === 'Business insights') {
        aiResponse = embedded
          ? `💡 Business Insights - Blue Moon Cafe\n\n🔥 Key Trends:\n• Cold drinks sales up 28% this month\n• Morning rush intensifying (7-9 AM)\n• Avg transaction value increased to $12.50\n\n🎯 Opportunities:\n• Launch iced coffee subscription\n• Add 1-2 morning staff\n• Promote 3-4 PM "Happy Hour"\n\n⚠️ Watch Out:\n• Afternoon traffic down 8%\n• Cash payments declining\n\n📊 Your business is on a strong growth trajectory!`
          : `💡 Business Insights - Blue Moon Cafe\nWeek of February 1-7, 2026\n\n🔥 Key Trends:\n• Cold beverage sales up 28% vs last month\n• Morning rush getting busier (7-9 AM peak)\n• Average transaction value increased to $12.50 (+8%)\n• Customer retention rate: 73% (excellent)\n\n🎯 Top Opportunities:\n1. Launch an iced coffee subscription program\n2. Add 1-2 staff during morning rush\n3. Promote 3-4 PM "Happy Hour" to balance traffic\n4. Bundle breakfast items with drinks\n\n⚠️ Areas to Watch:\n• Afternoon traffic down 8% - needs attention\n• Cash payments declining (good for you - lower fees)\n• Weekend sales slightly below weekday average\n\n📊 Overall: Your business is on a strong growth trajectory with healthy margins. Focus on capitalizing on the cold drink trend and optimizing staffing.`;
      } else if (promptText === 'Customer analytics') {
        aiResponse = embedded
          ? `👥 Customer Analytics - Blue Moon Cafe\n\n📊 Customer Base:\n• Total Active: 1,247 customers\n• New This Month: 89 (+7.2%)\n• Retention Rate: 73%\n\n⭐ Top Segments:\n1. Morning Regulars: 342 (27%)\n2. Lunch Crowd: 298 (24%)\n3. Weekend Visitors: 187 (15%)\n\n💰 Spending Patterns:\n• Avg Order: $12.50\n• Top Spenders: $45-60/week\n• Repeat Visit Rate: 4.2x/month\n\n✅ Strong customer loyalty!`
          : `👥 Customer Analytics - Blue Moon Cafe\nPeriod: February 2026\n\n📊 Customer Base Overview:\n• Total Active Customers: 1,247\n• New Customers This Month: 89 (+7.2%)\n• Customer Retention Rate: 73% (industry avg: 65%)\n• Repeat Visit Rate: 4.2 visits/month\n\n⭐ Top Customer Segments:\n1. Morning Regulars: 342 customers (27%)\n   - Avg spend: $8.50/visit\n   - Visit frequency: 5.1x/week\n\n2. Lunch Crowd: 298 customers (24%)\n   - Avg spend: $14.20/visit\n   - Visit frequency: 3.2x/week\n\n3. Weekend Visitors: 187 customers (15%)\n   - Avg spend: $18.50/visit\n   - Visit frequency: 1.8x/week\n\n💰 Spending Patterns:\n• Average Order Value: $12.50\n• Top 10% Spenders: $45-60/week\n• Most Popular Items: Iced Lattes, Breakfast Sandwiches\n\n✅ Your customer loyalty is excellent! Consider launching a rewards program to boost retention even further.`;
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const suggestedPrompts = [
    { text: 'Generate financial report', icon: Code },
    { text: 'Business insights', icon: ImageIcon },
    { text: 'Customer analytics', icon: Search },
  ];

  return (
    <div ref={containerRef} className={`flex flex-col bg-white relative ${embedded ? 'h-full' : 'h-screen'}`}>
      {/* Header */}
      {!embedded && (
      <div className="border-b border-[#E2E8F0] px-8 py-6 bg-white">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-[#041E42]" />
            </button>
            <div className="flex items-center gap-1">
              <img src={logoImage} alt="Delt" className="h-12" style={{ imageRendering: '-webkit-optimize-contrast' }} />
              <span className="text-xl font-normal text-[#041E42]">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 text-base font-medium text-[#041E42] hover:bg-[#F8FAFC] rounded-lg transition-colors">
              Log in
            </button>
            <button className="px-5 py-2.5 text-base font-medium text-white bg-[#4945FF] hover:bg-[#080A28] rounded-lg transition-colors">
              Sign up for free
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Messages Area */}
      <div className={`flex-1 ${embedded ? 'overflow-y-auto scrollbar-hide' : 'overflow-y-auto'}`} ref={messagesContainerRef}>
        <div className={`${embedded ? 'h-full px-4 py-4' : 'min-h-full max-w-3xl mx-auto px-6 py-8'}`}>
          {showInitialState && messages.length === 0 ? (
            // Initial state - show for 3 seconds with chatbot-style interface
            <div className={`flex flex-col items-center justify-center text-center w-full ${embedded ? 'py-8 min-h-[400px]' : 'py-32 min-h-[600px]'}`}>
              {/* AI Assistant Avatar with Blue Background */}
              <div className="mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4945FF] to-[#6366F1] flex items-center justify-center shadow-lg">
                  <img 
                    src={aiIcon} 
                    alt="Delt AI" 
                    className="w-14 h-14"
                  />
                </div>
              </div>
              
              {/* Chatbot Greeting Bubble */}
              <div className="bg-[#4945FF] text-white rounded-3xl px-8 py-6 mb-8 max-w-md shadow-lg">
                <h1 className="text-3xl font-medium mb-2">
                  Hi! I'm Delt AI
                </h1>
                <p className="text-lg opacity-90">
                  What can I help with?
                </p>
              </div>
              
              {/* Quick Action Chips */}
              <div className="flex flex-wrap gap-3 justify-center max-w-lg">
                <div className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-sm text-[#64748B]">
                  💰 Revenue insights
                </div>
                <div className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-sm text-[#64748B]">
                  📊 Sales analytics
                </div>
                <div className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-sm text-[#64748B]">
                  👥 Customer data
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center min-h-[600px] text-center ${embedded ? 'py-8' : 'py-20'}`}>
              <img 
                src={logoImage} 
                alt="Delt" 
                className="h-16 mb-6 opacity-80" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <h1 className="text-4xl font-semibold text-[#041E42] mb-4">
                What can I help with?
              </h1>
              <p className="text-lg text-[#64748B] mb-12 max-w-2xl">
                I'm your AI-powered business assistant, ready to help with analytics, insights, and more.
              </p>

              {/* Suggested Prompts */}
              {embedded ? (
                <div className="w-full space-y-2">
                  <h3 className="text-sm font-semibold text-[#041E42] mb-3">Try asking:</h3>
                  {suggestedPrompts.slice(0, 2).map((prompt, idx) => {
                    const IconComponent = prompt.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handlePromptClick(prompt.text)}
                        className="flex items-center gap-2 p-3 w-full border border-[#E2E8F0] rounded-lg hover:border-[#4945FF] hover:bg-[#F8FAFC] transition-all text-left group"
                      >
                        <IconComponent className="w-4 h-4 text-[#64748B] group-hover:text-[#4945FF] flex-shrink-0" />
                        <span className="text-sm text-[#041E42]">{prompt.text}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestedPrompts.map((prompt, idx) => {
                  const IconComponent = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.text)}
                      className="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-lg hover:border-[#4945FF] hover:bg-[#F8FAFC] transition-all text-left group"
                    >
                      <IconComponent className="w-5 h-5 text-[#64748B] group-hover:text-[#4945FF]" />
                      <span className="text-base text-[#041E42]">{prompt.text}</span>
                    </button>
                  );
                })}
              </div>
              )}
            </div>
          ) : (
            <div className={`space-y-4 ${embedded ? 'text-sm' : 'space-y-6'}`}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className={`flex-shrink-0 rounded-full bg-white flex items-center justify-center ${embedded ? 'w-8 h-8' : 'w-10 h-10'}`}>
                      <img 
                        src={aiIcon} 
                        alt="Delt AI" 
                        className={embedded ? 'w-6 h-6' : 'w-7 h-7'}
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-[#4945FF] text-white'
                        : 'bg-[#F8FAFC] text-[#041E42]'
                    } ${embedded ? 'px-4 py-3' : 'px-5 py-3'}`}
                  >
                    <p className={`leading-relaxed whitespace-pre-wrap ${embedded ? 'text-sm' : 'text-base'}`}>
                      {message.content}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className={`flex-shrink-0 rounded-full bg-[#080A28] flex items-center justify-center text-white font-semibold ${embedded ? 'w-8 h-8 text-xs' : 'w-8 h-8 text-sm'}`}>
                      You
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className={`flex gap-4 justify-start ${embedded ? 'gap-2' : 'gap-4'}`}>
                  <div className={`flex-shrink-0 rounded-full bg-white flex items-center justify-center ${embedded ? 'w-8 h-8' : 'w-10 h-10'}`}>
                    <img 
                      src={aiIcon} 
                      alt="Delt AI" 
                      className={embedded ? 'w-6 h-6' : 'w-7 h-7'}
                    />
                  </div>
                  <div className={`bg-[#F8FAFC] rounded-2xl ${embedded ? 'px-4 py-3' : 'px-5 py-3'}`}>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show suggested prompts after demo is complete (4 messages = 2 Q&A pairs) */}
              {demoComplete && messages.length === 4 && !isTyping && (
                <div className={`${embedded ? 'mt-4' : 'mt-8'}`}>
                  {embedded ? (
                    <div className="w-full space-y-2">
                      <h3 className="text-sm font-semibold text-[#041E42] mb-3">Try asking:</h3>
                      {suggestedPrompts.map((prompt, idx) => {
                        const IconComponent = prompt.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => handlePromptClick(prompt.text)}
                            className="flex items-center gap-2 p-3 w-full border border-[#E2E8F0] rounded-lg hover:border-[#4945FF] hover:bg-[#F8FAFC] transition-all text-left group"
                          >
                            <IconComponent className="w-4 h-4 text-[#64748B] group-hover:text-[#4945FF] flex-shrink-0" />
                            <span className="text-sm text-[#041E42]">{prompt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-[#041E42]">Try asking:</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {suggestedPrompts.map((prompt, idx) => {
                          const IconComponent = prompt.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => handlePromptClick(prompt.text)}
                              className="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-lg hover:border-[#4945FF] hover:bg-[#F8FAFC] transition-all text-left group"
                            >
                              <IconComponent className="w-5 h-5 text-[#64748B] group-hover:text-[#4945FF]" />
                              <span className="text-base text-[#041E42]">{prompt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className={`border-t border-[#E2E8F0] bg-white ${embedded ? 'mt-auto' : ''}`}>
        <div className={`${embedded ? 'px-4 py-3' : 'max-w-3xl mx-auto px-6 py-6'}`}>
          {showInitialState && messages.length === 0 && !embedded ? (
            // Initial state input
            <div className="relative bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0] transition-colors">
              <div className="flex items-center gap-3 p-4">
                <input
                  type="text"
                  placeholder="Ask anything"
                  disabled
                  className="flex-1 bg-transparent outline-none text-[#041E42] placeholder-[#94A3B8] text-base"
                />
              </div>
              <div className="flex items-center gap-2 px-4 pb-4">
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:bg-white rounded-lg transition-colors" disabled>
                  <Paperclip className="w-4 h-4" />
                  <span>Attach</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:bg-white rounded-lg transition-colors" disabled>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:bg-white rounded-lg transition-colors" disabled>
                  <Code className="w-4 h-4" />
                  <span>Study</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:bg-white rounded-lg transition-colors" disabled>
                  <ImageIcon className="w-4 h-4" />
                  <span>Create image</span>
                </button>
                <div className="flex-1" />
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:bg-white rounded-lg transition-colors" disabled>
                  <Mic className="w-4 h-4" />
                  <span>Voice</span>
                </button>
              </div>
            </div>
          ) : (
          <div className={`relative bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0] focus-within:border-[#4945FF] transition-colors`}>
            <div className={`flex items-end gap-3 ${embedded ? 'p-2' : 'p-4'}`}>
              {/* Action Buttons */}
              {!embedded && (
              <div className="flex items-center gap-2 pb-2">
                <button className="p-2 text-[#64748B] hover:text-[#4945FF] hover:bg-white rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 text-[#64748B] hover:text-[#4945FF] hover:bg-white rounded-lg transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
              )}

              {/* Text Input */}
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => !isSimulatingTyping && setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                rows={1}
                disabled={isSimulatingTyping}
                className={`flex-1 bg-transparent resize-none outline-none text-[#041E42] placeholder-[#94A3B8] max-h-40 ${embedded ? 'text-xs py-1' : 'text-base py-2'}`}
                style={{ minHeight: embedded ? '24px' : '32px' }}
              />

              {/* Send Button */}
              <div className={`flex items-center gap-2 ${embedded ? 'pb-1' : 'pb-2'}`}>
                {inputValue.trim() ? (
                  <button
                    onClick={handleSendMessage}
                    className={`bg-[#4945FF] text-white hover:bg-[#080A28] rounded-lg transition-colors ${embedded ? 'p-1.5' : 'p-2'}`}
                  >
                    <Send className={embedded ? 'w-4 h-4' : 'w-5 h-5'} />
                  </button>
                ) : (
                  !embedded && (
                  <button className="p-2 text-[#64748B] hover:text-[#4945FF] hover:bg-white rounded-lg transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  )
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}