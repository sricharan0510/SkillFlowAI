import { useState, useEffect } from 'react'
import '../../App.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/button'
import InfiniteScrollCards from '../../components/interactive/InfiniteScrollCards'
import { FileText, Users, Moon, Eye, Shield, Sun, Menu, X, ChevronRight, Play, Brain, Sparkles, Rocket, Globe, TrendingUp, Award, Clock, ScrollText, PenTool, MessageSquare, ClipboardCheck, BookOpen, UserCheck, CreditCard, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom'

function HomePage() {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme')
        return savedTheme ? savedTheme === 'dark' : false
    })
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [isDark])

    const toggleTheme = () => {
        setIsDark(prev => !prev)
    }

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDark])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    }

    const featureVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                delay: 0.2
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        }
    }

    const features = [
        {
            icon: ClipboardCheck,
            title: "AI Exam Generation",
            description: "Upload PDFs or enter topics to instantly generate custom, domain-specific exams for optimal test preparation and knowledge assessment.",
            gradient: "from-blue-600 to-cyan-600",
            stats: "Relevant Questions Generation"
        },
        {
            icon: Brain,
            title: "AI Evaluation & Feedback",
            description: "Receive detailed, AI-generated feedback on your exam responses, highlighting strong areas and pinpointing weak concepts for targeted study.",
            gradient: "from-purple-600 to-pink-600",
            stats: "Personalised Feedback"
        },
        {
            icon: ScrollText,
            title: "AI Summaries & Flash Notes",
            description: "Generate comprehensive summaries and condensed flash notes from your uploaded study materials to enable lightning-fast and effective revision.",
            gradient: "from-green-600 to-emerald-600",
            stats: "Reduction in Study Time"
        },
        {
            icon: UserCheck,
            title: "Personalized Mock Interviews",
            description: "Practice with AI-based mock interviews, tailored to your resume and target job role, assessing technical, behavioral, and communication skills.",
            gradient: "from-yellow-600 to-orange-600",
            stats: "Tailored to your Resume"
        },
        {
            icon: BarChart,
            title: "Performance Analytics",
            description: "Track your progress with a comprehensive dashboard showing exam history, interview scores, and recommendations for improvement.",
            gradient: "from-red-600 to-pink-600",
            stats: "Real-time Progress Tracking"
        },
        {
            icon: CreditCard,
            title: "Scalable Learning Ecosystem",
            description: "A complete platform with usage-based credits, a flexible subscription system (powered by Razorpay), and full data history management.",
            gradient: "from-gray-600 to-gray-800",
            stats: "Razorpay Integrated"
        }
    ]

    const steps = [
        {
            step: "01",
            title: "Upload Study Material",
            description: "Submit your PDF notes, documents, or enter custom topics for the AI to analyze",
            icon: FileText,
            color: "from-gray-500 to-gray-700"
        },
        {
            step: "02",
            title: "Generate & Practice",
            description: "Instantly create domain-specific exams or start a personalized mock interview",
            icon: PenTool,
            color: "from-blue-500 to-purple-500"
        },
        {
            step: "03",
            title: "Get AI Evaluation",
            description: "The AI system evaluates your responses and generates adaptive feedback",
            icon: MessageSquare,
            color: "from-green-500 to-teal-500"
        },
        {
            step: "04",
            title: "Revise & Succeed",
            description: "Download AI summaries/notes, track your progress, and apply for jobs with confidence",
            icon: Rocket,
            color: "from-orange-500 to-red-500"
        }
    ]

    const PROJECT_NAME = "SkillFlow AI"

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className={`absolute top-20 left-10 w-72 h-72 ${isDark ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : 'bg-gradient-to-r from-blue-500/5 to-cyan-500/5'
                        } rounded-full blur-3xl`}
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                        x: [0, 100, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                <motion.div
                    className={`absolute bottom-20 right-10 w-96 h-96 ${isDark ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'bg-gradient-to-r from-purple-500/5 to-pink-500/5'
                        } rounded-full blur-3xl`}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0],
                        x: [0, -100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            {/* Navigation */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <motion.div
                            className="flex items-center space-x-2"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                                    {/* Updated Logo Icon: BookOpen for Learning */}
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                            </motion.div>
                            <span className="text-xl font-bold">{PROJECT_NAME}</span>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <motion.a
                                href="#features"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Features
                            </motion.a>
                            <motion.a
                                href="#how-it-works"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                How it works
                            </motion.a>
                            {/* <motion.a
                                href="#pricing"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Pricing
                            </motion.a> */}
                            <motion.a
                                href="#reviews"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Reviews
                            </motion.a>

                            {/* Theme Toggle */}
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                                    <AnimatePresence mode="wait">
                                        {isDark ? (
                                            <motion.div
                                                key="sun"
                                                initial={{ rotate: -90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Sun className="h-4 w-4" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="moon"
                                                initial={{ rotate: 90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: -90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Moon className="h-4 w-4" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </motion.div>
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-3">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/signin')}>
                                    Sign In
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    size="sm"
                                    onClick={() => navigate('/signup')}
                                    className="bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                                >
                                    Start Learning
                                </Button>
                            </motion.div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center space-x-2">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                                    <AnimatePresence mode="wait">
                                        {isDark ? (
                                            <motion.div
                                                key="sun"
                                                initial={{ rotate: -90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Sun className="h-4 w-4" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="moon"
                                                initial={{ rotate: 90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: -90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Moon className="h-4 w-4" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                    <AnimatePresence mode="wait">
                                        {isMenuOpen ? (
                                            <motion.div
                                                key="x"
                                                initial={{ rotate: -90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <X className="h-4 w-4" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="menu"
                                                initial={{ rotate: 90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: -90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Menu className="h-4 w-4" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="md:hidden border-t border-border"
                            >
                                <motion.div
                                    className="px-2 pt-2 pb-3 space-y-1"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.a
                                        href="#features"
                                        className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                                        variants={itemVariants}
                                    >
                                        Features
                                    </motion.a>
                                    <motion.a
                                        href="#how-it-works"
                                        className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                                        variants={itemVariants}
                                    >
                                        How it works
                                    </motion.a>
                                    {/* <motion.a
                                        href="#pricing"
                                        variants={itemVariants}
                                    >
                                        Pricing
                                    </motion.a> */}
                                    <motion.a
                                        href="#reviews"
                                        className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                                        variants={itemVariants}
                                    >
                                        Reviews
                                    </motion.a>
                                    <motion.div variants={itemVariants}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => navigate('/signin')}
                                        >
                                            Sign In
                                        </Button>
                                    </motion.div>
                                    <motion.div variants={itemVariants}>
                                        <Button
                                            size="sm"
                                            onClick={() => navigate('/signup')}
                                            className="w-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                                        >
                                            Start Learning
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto w-full">
                    <motion.div
                        className="text-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div
                            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-blue-600/20 border border-primary/30 text-primary text-sm mb-8"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(var(--primary), 0.3)" }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                            </motion.div>
                            Built for Smarter Exam & Interview Preparation
                            <motion.div
                                animate={{ rotate: [360, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Award className="h-4 w-4 ml-2" />
                            </motion.div>
                        </motion.div>

                        <motion.h1
                            className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8"
                            variants={itemVariants}
                        >
                            Smart Learning,
                            <br />
                            <motion.span
                                className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent"
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                style={{
                                    backgroundSize: "200% 200%"
                                }}
                            >
                                Adaptive Success
                            </motion.span>
                        </motion.h1>

                        <motion.p
                            className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed"
                            variants={itemVariants}
                        >
                            The ultimate AI-Powered Smart Learning and Evaluation System.
                            Instantly generate exams from your notes, get adaptive feedback, and
                            ace your interviews with personalized, AI-driven mock sessions.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
                            variants={itemVariants}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button size="lg" className="bg-black text-white dark:bg-white dark:text-black hover:bg-opacity-90 dark:hover:bg-opacity-90">
                                    <ClipboardCheck className="mr-3 h-6 w-6" />
                                    Start Free Exam
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-2 hover:bg-muted/50">
                                    <Play className="mr-3 h-5 w-5" />
                                    Watch Demo
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <motion.h2
                            className="text-4xl sm:text-5xl font-bold mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            AI-Driven Success in Academics & Placements
                        </motion.h2>
                        <motion.p
                            className="text-xl text-muted-foreground max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            Intelligent tools designed to boost your preparation, evaluation, and career readiness.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="group bg-card p-8 rounded-xl border border-border hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                                variants={featureVariants}
                                initial="hidden"
                                whileInView="visible"
                                whileHover="hover"
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* Background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <motion.div
                                            className={`p-4 bg-gradient-to-r ${feature.gradient} rounded-xl shadow-lg`}
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <feature.icon className="h-8 w-8 text-white" />
                                        </motion.div>
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Key Metric</div>
                                            <div className="font-bold text-primary">{feature.stats}</div>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>

                                    <motion.div
                                        className="mt-6 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        initial={{ x: -10 }}
                                        whileHover={{ x: 0 }}
                                    >
                                        <span className="text-sm font-medium">Learn more</span>
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <motion.h2
                            className="text-4xl sm:text-5xl font-bold mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Your Path to Academic & Career Mastery
                        </motion.h2>
                        <motion.p
                            className="text-xl text-muted-foreground max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            Our simple four-step process for smarter learning and evaluation
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="text-center group relative"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                            >
                                <motion.div
                                    className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${step.color} text-white rounded-full text-xl font-bold mb-6 relative`}
                                    whileHover={{
                                        scale: 1.1,
                                        rotate: 360
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        duration: 0.6
                                    }}
                                >
                                    <step.icon className="h-8 w-8" />
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-sm font-bold text-primary">
                                        {step.step}
                                    </div>
                                </motion.div>
                                <motion.h3
                                    className="text-xl font-bold mb-3 group-hover:text-primary transition-colors"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                                    viewport={{ once: true }}
                                >
                                    {step.title}
                                </motion.h3>
                                <motion.p
                                    className="text-muted-foreground"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                                    viewport={{ once: true }}
                                >
                                    {step.description}
                                </motion.p>
                                {index < steps.length - 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.2 + 0.7 }}
                                        viewport={{ once: true }}
                                        className="hidden lg:block absolute top-10 left-full transform -translate-x-1/2 translate-x-8"
                                    >
                                        <ChevronRight className="h-6 w-6 text-muted-foreground" />
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

{/* Trust & Credibility Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background/90">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 border-y border-border py-4 items-center justify-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <motion.div
                            className="flex items-center justify-center space-x-2 text-sm sm:text-base text-muted-foreground font-semibold"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Brain className="h-5 w-5 text-purple-500 flex-shrink-0" />
                            <span>Powered by AI</span>
                        </motion.div>
                        <motion.div
                            className="flex items-center justify-center space-x-2 text-sm sm:text-base text-muted-foreground font-semibold"
                            whileHover={{ scale: 1.05 }}
                        >
                            <CreditCard className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <span>Secure Payments</span>
                        </motion.div>
                        <motion.div
                            className="flex items-center justify-center space-x-2 text-sm sm:text-base text-muted-foreground font-semibold"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Shield className="h-5 w-5 mr-1 text-green-500 flex-shrink-0" />
                            <span>Data Protection (SSL)</span>
                        </motion.div>
                        <motion.div
                            className="flex items-center justify-center space-x-2 text-sm sm:text-base text-muted-foreground font-semibold"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Users className="h-5 w-5 text-orange-500 flex-shrink-0" />
                            <span>Designed for Students</span>
                        </motion.div>
                        <motion.div
                            className="flex items-center justify-center space-x-2 text-sm sm:text-base text-muted-foreground font-semibold col-span-2 sm:col-span-1 lg:col-span-1"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Eye className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <span>No Spam. No Ads.</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            {/* <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <motion.h2
                            className="text-4xl sm:text-5xl font-bold mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Start Learning for Free. Upgrade for Success.
                        </motion.h2>
                        <motion.p
                            className="text-xl text-muted-foreground max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            Choose the plan that fits your study needs. No credit card required to start!
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <motion.div
                            className="bg-card p-8 rounded-xl border-2 border-border/50 transition-all duration-300 hover:shadow-primary/20 hover:shadow-2xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-3xl font-bold mb-2">Free Plan</h3>
                            <p className="text-muted-foreground mb-6">Perfect for quick practice and basic revision.</p>
                            <div className="text-5xl font-extrabold mb-8">
                                ₹0
                                <span className="text-xl font-medium text-muted-foreground">/month</span>
                            </div>
                            <Button className="w-full text-lg py-6 bg-black text-white dark:bg-white dark:text-black hover:opacity-90" size="lg">
                                Get Started for Free
                            </Button>
                            <ul className="mt-8 space-y-4 text-left">
                                <li className="flex items-center">
                                    <ChevronRight className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>**Limited** AI Exam Generation (1 per day)</span>
                                </li>
                                <li className="flex items-center">
                                    <ChevronRight className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>AI Summaries & Flash Notes (1 document)</span>
                                </li>
                                <li className="flex items-center text-muted-foreground">
                                    <X className="h-5 w-5 mr-3 text-red-500 flex-shrink-0" />
                                    <span>No personalized Mock Interviews</span>
                                </li>
                                <li className="flex items-center text-muted-foreground">
                                    <X className="h-5 w-5 mr-3 text-red-500 flex-shrink-0" />
                                    <span>Limited performance analytics history</span>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            className="bg-card p-8 rounded-xl border-2 border-primary transition-all duration-300 shadow-xl shadow-primary/20"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-3xl font-bold text-primary">Premium Plan</h3>
                                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">Recommended</span>
                            </div>
                            <p className="text-muted-foreground mb-6">Unlock full power for placement success.</p>
                            <div className="text-5xl font-extrabold mb-8">
                                ₹49
                                <span className="text-xl font-medium text-muted-foreground">/month</span>
                            </div>
                            <Button className="w-full text-lg py-6 bg-primary hover:bg-primary/90" size="lg">
                                Upgrade Now (Razorpay)
                            </Button>
                            <ul className="mt-8 space-y-4 text-left">
                                <li className="flex items-center">
                                    <ChevronRight className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span className="font-semibold">**Unlimited** AI Exam Generation</span>
                                </li>
                                <li className="flex items-center">
                                    <ChevronRight className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span className="font-semibold">Unlimited AI Summaries & Notes</span>
                                </li>
                                <li className="flex items-center">
                                    <ChevronRight className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span className="font-semibold">Personalized Mock Interview Engine</span>
                                </li>
                                <li className="flex items-center">
                                    <ChevronRight className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span className="font-semibold">Full Analytics and progress history</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section> */}

            {/* Testimonials Section */}
            <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                            The preferred choice for career-driven students
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            See how {PROJECT_NAME} is helping users achieve their academic and placement goals
                        </p>
                    </motion.div>
                    <InfiniteScrollCards />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted text-foreground dark:bg-[#0e0e10] dark:text-white relative overflow-hidden">
                {/* Soft Background Accent */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-10 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.h2
                        className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        Ready to achieve your academic and career goals?
                    </motion.h2>
                    <motion.p
                        className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Join thousands of students and job seekers preparing smarter with {PROJECT_NAME}. Start your free trial and unlock your full potential.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-6 justify-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="lg"
                                className="text-lg px-8 py-4 bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                            >
                                <Brain className="mr-3 h-6 w-6" />
                                Start Free Trial
                                <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </motion.div>
                            </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-4 border border-foreground text-foreground hover:bg-muted/20"
                            >
                                <Play className="mr-3 h-5 w-5" />
                                Explore Demo
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t border-border">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <BookOpen className="h-8 w-8 text-primary" />
                                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    {PROJECT_NAME}
                                </span>
                            </div>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                The ultimate AI-Powered Smart Learning and Evaluation System.
                                Built for academic success and career readiness.
                            </p>
                            <div className="flex space-x-4">
                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                    <Globe className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                    <TrendingUp className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                    <BarChart className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                                </motion.div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><a href="#features" className="hover:text-foreground transition-colors">AI Features</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Subscription</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">API for Education</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Blog & Tips</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
                        <p>&copy; 2024 {PROJECT_NAME}. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default HomePage