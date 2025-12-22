import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Label } from '../../components/ui/label.jsx'
import { X, Mail, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { forgotPassword as forgotPasswordApi } from '../../services/authApi.jsx' 
const ForgotPassword = ({ isOpen = true }) => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error("Enter a valid email")
      return
    }

    setLoading(true)
    try {
      await forgotPasswordApi({ email })

      toast.success("Reset link sent to your email")
      navigate('/signin')
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Failed to send reset link"
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        
        {/* BACKDROP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => navigate('/')}
        />

        {/* MODAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md mx-4"
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => navigate('/signin')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <div>
                  <h2 className="text-2xl font-bold">Forgot password</h2>
                  <p className="text-muted-foreground">
                    Enter your email to receive a reset link
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => navigate('/')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* FORM */}
            <form className="space-y-4" onSubmit={handleSubmit}>

              <div className="space-y-2">
                <Label>Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ForgotPassword
