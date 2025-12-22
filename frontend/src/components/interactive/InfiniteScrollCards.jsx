import { motion } from 'framer-motion'
import { Star, Github, Users, Zap } from 'lucide-react'

const InfiniteScrollCards = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer at TechCorp",
      avatar: "SC",
      rating: 5,
      text: "DevCollab's AI suggestions have improved our code quality by 40%. The real-time collaboration is seamless!",
      company: "TechCorp",
      metric: "40% improvement"
    },
    {
      name: "Marcus Rodriguez",
      role: "Team Lead at StartupXYZ",
      avatar: "MR",
      rating: 5,
      text: "The GitHub integration is flawless. We can now work on complex projects with multiple developers effortlessly.",
      company: "StartupXYZ",
      metric: "5x faster reviews"
    },
    {
      name: "Emily Watson",
      role: "Full Stack Developer",
      avatar: "EW",
      rating: 5,
      text: "AI-powered code optimization saved us weeks of manual refactoring. This tool is a game-changer!",
      company: "InnovateLab",
      metric: "3 weeks saved"
    },
    {
      name: "David Kim",
      role: "CTO at CloudTech",
      avatar: "DK",
      rating: 5,
      text: "The collaborative workspace feels like having the entire team in one room. Productivity has skyrocketed!",
      company: "CloudTech",
      metric: "200% productivity"
    },
    {
      name: "Lisa Johnson",
      role: "DevOps Engineer",
      avatar: "LJ",
      rating: 5,
      text: "Repository management and AI summaries make documentation effortless. Our team loves the PDF exports!",
      company: "DataFlow",
      metric: "Zero doc debt"
    },
    {
      name: "Alex Thompson",
      role: "Software Architect",
      avatar: "AT",
      rating: 5,
      text: "The AI code analysis catches issues we would have missed. It's like having a senior developer reviewing every line.",
      company: "BuildRight",
      metric: "90% fewer bugs"
    }
  ]

  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <div className="w-full overflow-hidden py-8">
      <motion.div
        className="flex space-x-6"
        animate={{
          x: [0, -100 * testimonials.length]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
        style={{ width: `${200 * testimonials.length}%` }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <motion.div
            key={`${testimonial.name}-${index}`}
            className="flex-shrink-0 w-80 bg-card border border-border rounded-lg p-6 shadow-lg"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>

            {/* Content */}
            <blockquote className="text-foreground mb-4 italic">
              "{testimonial.text}"
            </blockquote>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{testimonial.company}</span>
              </div>
              <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
                <Zap className="h-3 w-3" />
                <span className="text-xs font-medium">{testimonial.metric}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default InfiniteScrollCards

