import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { ScrollReveal, StaggerChildren, staggerItemVariants } from './MicroInteractions';

export function CustomerStories() {
  const stories = [
    {
      name: "Sarah Chen",
      business: "Sana Psychological",
      quote: "My favorite thing about working with Delt is ",
      highlight: "the fees that I save every month,",
      rest: " as well as the customer service.",
      image: "https://images.unsplash.com/photo-1769636930016-5d9f0ca653aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwb3duZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAzMDYxMDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      color: "bg-white border-2 border-[#E5E7EB]",
      textColor: "text-[#041E42]",
      hasLink: true,
      linkColor: "text-[#4945FF]"
    },
    {
      name: "Marcus Rodriguez",
      business: "CPA",
      quote: "Delt keeps things simple. ",
      highlight: "It allows us to devote our time to other matters that are important.",
      rest: " That's why we like Delt.",
      image: "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBzbWlsaW5nJTIwYnVzaW5lc3MlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAzMDYxMDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      color: "bg-white border-2 border-[#E5E7EB]",
      textColor: "text-[#041E42]",
      hasLink: true,
      linkColor: "text-[#4945FF]",
      isVideo: false
    },
    {
      name: "Jamie Walsh",
      business: "Access Dental",
      quote: "With Delt it was easy ",
      highlight: "to sign up. I didn't fee like I was giving up too much of my business, or my time or my effort, and I feel appreciated.",
      rest: "",
      image: "https://images.unsplash.com/photo-1687422809069-0fa3546b8471?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwb3duZXIlMjBoYXBweXxlbnwxfHx8fDE3NzAzMDYxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      color: "bg-white border-2 border-[#E5E7EB]",
      textColor: "text-[#041E42]",
      hasLink: true,
      linkColor: "text-[#4945FF]"
    },
    {
      name: "Alex Thompson",
      business: "Retail Boutique",
      image: "https://images.unsplash.com/photo-1765648636178-60e73bcc865e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG93bmVyJTIwY2FzdWFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwMzA2MTA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      color: "bg-white border-2 border-[#E5E7EB]",
      textColor: "text-white",
      hasLink: false,
      isVideo: true
    },
    {
      name: "Diana Martinez",
      business: "Coffee Shop Owner",
      quote: "The ",
      highlight: "transparent pricing and no hidden fees",
      rest: " make budgeting so much easier. Delt has been a game-changer for my business.",
      image: "https://images.unsplash.com/photo-1737574821698-862e77f044c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjBwcm9mZXNzaW9uYWwlMjBwaG90b3xlbnwxfHx8fDE3NzAyNTIxMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      color: "bg-white border-2 border-[#E5E7EB]",
      textColor: "text-[#041E42]",
      hasLink: true,
      linkColor: "text-[#4945FF]"
    },
    {
      name: "Rachel Kim",
      business: "Kim's Bakery",
      quote: "The AI insights helped us ",
      highlight: "identify our best-selling hours and optimize staffing.",
      rest: " We increased profits by 23% in just two months.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzJTIwd29tYW4lMjBzbWlsaW5nfGVufDF8fHx8MTc3MDMwNjEwNnww&ixlib=rb-4.1.0&q=80&w=1080",
      color: "bg-white border-2 border-[#E5E7EB]",
      textColor: "text-[#041E42]",
      hasLink: true,
      linkColor: "text-[#4945FF]"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-[51px] sm:text-[61px] font-bold mb-4" style={{ fontFamily: '"Codec Pro", "Codec", Inter, sans-serif' }}>
            <span className="text-[#041E42]">Learn why small businesses </span>
            <span className="text-[#4945FF]">trust us.</span>
          </h2>
          <p className="text-lg text-[#6B7280] max-w-3xl mx-auto">
            Explore real Delt reviews from owners like you, affirming our promise to provide human, transparent, and affordable payment processing.
          </p>
        </ScrollReveal>

        {/* Testimonial Grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
          {stories.map((story, index) => (
            <motion.div
              key={index}
              variants={staggerItemVariants('up', 30)}
              className={`${story.color} rounded-2xl p-8 flex flex-col ${
                story.isVideo ? 'row-span-2' : ''
              } hover:shadow-xl hover:border-[#4945FF] transition-all duration-300 group`}
              whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
            >
              {/* Profile Header */}
              <div className="mb-6">
                <h3 className="font-bold text-[#041E42] text-lg">{story.name}</h3>
                <p className="text-sm text-[#6B7280]">{story.business}</p>
              </div>

              {/* Video Card Content */}
              {story.isVideo ? (
                <div className="flex-1 flex flex-col justify-center items-center relative">
                  <div className="relative w-full aspect-[4/3] mb-4 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={story.image}
                      alt={story.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <motion.button
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#4945FF] hover:bg-[#3730FF] text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span className="font-semibold">Watch video</span>
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Quote Content */
                <>
                  <div className="flex-1 mb-6">
                    <p className={`${story.textColor} leading-relaxed text-lg`}>
                      "{story.quote}
                      <span className="italic font-medium">{story.highlight}</span>
                      {story.rest}"
                    </p>
                  </div>

                  {/* Link */}
                  {story.hasLink && (
                    <a
                      href="#/case-studies"
                      className={`${story.linkColor} font-semibold flex items-center gap-2 transition-all duration-300 group/link`}
                    >
                      Read the full story
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </a>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}