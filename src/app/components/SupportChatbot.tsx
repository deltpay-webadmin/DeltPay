import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SupportChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportChatbot({ isOpen, onClose }: SupportChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm the Delt Support Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Pricing questions
    if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return "Our pricing is transparent and competitive! We offer three plans:\n\n• FREE Starter: 2.9% + 30¢ per transaction\n• $99/mo Growth: 2.6% + 30¢ per transaction\n• $199/mo Scale: 2.2% + 30¢ per transaction\n\nAll plans include secure payment processing. Would you like to learn more about any specific plan?";
    }

    // Setup questions
    if (lowerMessage.includes('setup') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return "Getting started with Delt is quick and easy! You can set up your account in just a few minutes:\n\n1. Sign up for a free account\n2. Verify your business information\n3. Choose your plan\n4. Start accepting payments immediately\n\nWould you like help with a specific step?";
    }

    // Payment methods
    if (lowerMessage.includes('payment method') || lowerMessage.includes('accept') || lowerMessage.includes('card')) {
      return "Delt supports all major payment methods:\n\n• All major credit and debit cards (Visa, Mastercard, Amex, Discover)\n• Contactless payments (tap to pay)\n• Mobile wallets (Apple Pay, Google Pay)\n• Online and in-person payments\n\nYou can accept payments anywhere your customers are!";
    }

    // Funding/Capital questions
    if (lowerMessage.includes('funding') || lowerMessage.includes('capital') || lowerMessage.includes('loan') || lowerMessage.includes('advance')) {
      return "Delt Capital offers fast business funding with transparent terms:\n\n• Funding from $5,000 to $500,000\n• Simple factor rates (1.05-1.15)\n• Estimated terms: 3-9 months\n• Approval in as little as 24 hours\n• No hidden fees\n\nWould you like to start an application or learn more about our funding options?";
    }

    // Payout questions
    if (lowerMessage.includes('payout') || lowerMessage.includes('settlement') || lowerMessage.includes('deposit') || lowerMessage.includes('money')) {
      return "Payouts are fast and reliable with Delt:\n\n• FREE Starter: Next-day settlement\n• Growth Plan: Instant settlement\n• Scale Plan: Same-day settlement option\n\nYou can track all your payouts in real-time through your dashboard!";
    }

    // Support/Contact questions
    if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return "We're here to help 24/7!\n\n📞 Phone: 1-888-555-1234\n✉️ Email: support@deltcapital.com\n💬 Live Chat: Right here!\n\nOur support hours:\n• Mon-Fri: 8:00 AM - 8:00 PM EST\n• Saturday: 9:00 AM - 5:00 PM EST\n• Sunday: Closed\n\nAverage response time: Under 2 minutes!";
    }

    // Hardware questions
    if (lowerMessage.includes('hardware') || lowerMessage.includes('terminal') || lowerMessage.includes('reader') || lowerMessage.includes('device')) {
      return "Delt offers modern payment hardware:\n\n• Free card reader with Starter plan\n• Countertop terminals\n• Mobile card readers\n• Contactless payment devices\n\nAll hardware is easy to set up and comes with full support. Need help choosing the right device for your business?";
    }

    // Website/Online selling questions
    if (lowerMessage.includes('website') || lowerMessage.includes('online') || lowerMessage.includes('e-commerce') || lowerMessage.includes('ecommerce')) {
      return "Delt makes selling online easy! Our platform includes:\n\n• Integrated payment processing\n• Professional website builder\n• Shopping cart functionality\n• Inventory management\n• SEO optimization\n• Custom domain support\n\nEverything you need to sell online, all in one place!";
    }

    // API/Integration questions
    if (lowerMessage.includes('api') || lowerMessage.includes('integration') || lowerMessage.includes('developer')) {
      return "Delt offers powerful APIs for developers:\n\n• RESTful API\n• Comprehensive documentation\n• SDKs for popular languages\n• Webhook support\n• Sandbox environment for testing\n\nAvailable on Growth and Scale plans. Would you like access to our API documentation?";
    }

    // Security questions
    if (lowerMessage.includes('security') || lowerMessage.includes('secure') || lowerMessage.includes('safe') || lowerMessage.includes('pci')) {
      return "Security is our top priority:\n\n• PCI DSS Level 1 compliant\n• End-to-end encryption\n• Fraud detection and prevention\n• 99.6% uptime guarantee\n• Secure data storage\n\nYour business and customer data is always protected with industry-leading security measures.";
    }

    // Account questions
    if (lowerMessage.includes('account') || lowerMessage.includes('sign up') || lowerMessage.includes('register')) {
      return "Creating a Delt account is free and takes just minutes!\n\n1. No setup fees or monthly minimums on our Starter plan\n2. Quick verification process\n3. Start accepting payments right away\n\nReady to get started? You can sign up directly from our homepage!";
    }

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! 👋 I'm here to help answer your questions about Delt. I can help with:\n\n• Pricing and plans\n• Payment processing\n• Business funding\n• Getting started\n• Account support\n\nWhat would you like to know?";
    }

    // Thank you responses
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with today?";
    }

    // Default response
    return "I'd be happy to help with that! Here are some topics I can assist with:\n\n• Pricing and fees\n• Payment methods\n• Getting started\n• Business funding options\n• Payout schedules\n• Hardware and equipment\n• Website building\n• API integrations\n• Account questions\n\nYou can also reach our support team at 1-888-555-1234 or support@deltcapital.com for personalized assistance.";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-[#4945FF] text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Delt Support</h3>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                <span>Online now</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F6F7FB]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user'
                    ? 'bg-[#041E42]'
                    : 'bg-[#4945FF]'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-[#041E42] text-white'
                    : 'bg-white text-[#041E42] shadow-sm border border-[#E5E7EB]'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {message.text}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#4945FF] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-[#E5E7EB]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-[#E5E7EB] rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4945FF] focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-6 py-3 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}