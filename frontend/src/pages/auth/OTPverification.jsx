import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/button.jsx'
import { X, RefreshCw, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { verifyOtp } from '../../services/authApi.jsx'
import { resendOtp } from '../../services/authApi.jsx'

const OTPverification = ({ isOpen = true }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(300)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) navigate('/signup')
  }, [email, navigate])

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, isOpen])

  useEffect(() => {
    if (isOpen) inputRefs.current[0]?.focus()
  }, [isOpen])

  const handleInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      toast.error('Enter all 6 digits')
      return
    }

    setLoading(true)
    try {
      await verifyOtp({ email, otp: otpCode })
      toast.success('Email verified successfully')
      navigate('/signin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true);
    try {
      await resendOtp({ email });
      toast.success("New OTP sent");
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(300);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const formatTime = (sec) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => navigate('/')}
        />

        <motion.div className="relative w-full max-w-md mx-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
            <div className="flex justify-between mb-6">
              <Button variant="ghost" size="sm" onClick={() => navigate('/signin')}>
                <ArrowLeft />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <X />
              </Button>
            </div>

            <h2 className="text-2xl font-bold text-center">Verify your email</h2>
            <p className="text-center text-sm mt-1">{email}</p>

            {/* OTP INPUTS */}
            <div className="flex justify-center space-x-2 mt-6">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => (inputRefs.current[i] = el)}
                  value={d}
                  onChange={e => handleInputChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg border rounded"
                />
              ))}
            </div>

            <p className="text-center text-sm mt-4">
              Code expires in {formatTime(timeLeft)}
            </p>

            <Button
              variant="link"
              disabled={timeLeft > 0 || resending}
              onClick={handleResendCode}
            >
              <RefreshCw className={resending ? 'animate-spin' : ''} />
              Resend code
            </Button>

            <Button
              className="w-full mt-4"
              disabled={otp.includes('') || loading}
              onClick={handleVerify}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default OTPverification
