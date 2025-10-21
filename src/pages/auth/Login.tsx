import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, KeyRound, Eye, EyeOff, Banknote, Wallet, PiggyBank, TrendingUp, BarChart } from 'lucide-react';
import { login } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      setTouched(prev => ({ ...prev, email: true }));
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Por favor ingrese un correo electrónico válido';
    }

    if (!password) {
      setTouched(prev => ({ ...prev, password: true }));
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0 && email && password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      setAuth(res.token, res.role.id);

      const role = res?.role.id;

      if (role === 1) {
        navigate("/m");
      } else if (role === 2) {
        navigate("/c");
      } else if (role === 3) {
        navigate("/a");
      } else {
        setError("Rol no reconocido.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ocurrió un error. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="grid grid-cols-2 gap-8">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Banknote className="w-32 h-32 text-success" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Wallet className="w-32 h-32 text-primary" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <PiggyBank className="w-32 h-32 text-secondary" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          >
            <TrendingUp className="w-32 h-32 text-accent" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-base-100 rounded-xl shadow-2xl relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-4"
          >
            <BarChart className="w-16 h-16 text-success mx-auto animate-pulse" />
          </motion.div>
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-base-content"
          >
            Iniciar Sesión
          </motion.h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-error shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
          noValidate
        >
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content/70">Correo Electrónico</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/50" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={`input input-bordered w-full pl-10 ${(touched.email && !email) || validationErrors.email ? 'input-error' : ''}`}
                  placeholder="Ingresa tu correo electrónico"
                  disabled={loading}
                  required
                />
              </div>
              {validationErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.email}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content/70">Contraseña</span>
              </label>
              <div className="join w-full">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setValidationErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={`input input-bordered w-full pl-10 join-item ${(touched.password && !password) || validationErrors.password ? 'input-error' : ''}`}
                    placeholder="Ingresa tu contraseña"
                    disabled={loading}
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-square join-item"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/50" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/50" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationErrors.password}</span>
                </label>
              )}
            </div>
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'opacity-50' : ''}`}
              disabled={loading}
            >
              {!loading && 'Iniciar Sesión'}
            </motion.button>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center">
                  <motion.div
                    initial={{ x: -100, opacity: 0, rotate: -10, scale: 0.8 }}
                    animate={{
                      x: 400,
                      opacity: 1,
                      rotate: 10,
                      scale: 1.1
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute left-0"
                  >
                    <Banknote className="w-6 h-6 text-primary" />
                  </motion.div>
                  <motion.div
                    initial={{ x: -100, opacity: 0, rotate: -10, scale: 0.8 }}
                    animate={{
                      x: 400,
                      opacity: 1,
                      rotate: 10,
                      scale: 1.1
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 1
                    }}
                    className="absolute left-0"
                  >
                    <Wallet className="w-6 h-6 text-primary" />
                  </motion.div>
                  <motion.div
                    initial={{ x: -100, opacity: 0, rotate: -10, scale: 0.8 }}
                    animate={{
                      x: 400,
                      opacity: 1,
                      rotate: 10,
                      scale: 1.1
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 2
                    }}
                    className="absolute left-0"
                  >
                    <PiggyBank className="w-6 h-6 text-primary" />
                  </motion.div>
                  <motion.div
                    initial={{ x: -100, opacity: 0, rotate: -10, scale: 0.8 }}
                    animate={{
                      x: 400,
                      opacity: 1,
                      rotate: 10,
                      scale: 1.1
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 3
                    }}
                    className="absolute left-0"
                  >
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </motion.div>
                  <motion.div
                    initial={{ x: -100, opacity: 0, rotate: -10, scale: 0.8 }}
                    animate={{
                      x: 400,
                      opacity: 1,
                      rotate: 10,
                      scale: 1.1
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 4
                    }}
                    className="absolute left-0"
                  >
                    <BarChart className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-base-content/70">
            ¿No tienes cuenta?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;