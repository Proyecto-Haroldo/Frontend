import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Banknote,
  Wallet,
  PiggyBank,
  TrendingUp,
  IdCard,
  Building2,
  User,
  Phone,
  Globe,
} from "lucide-react";
import { register } from "../../api/authApi";
import { useAuth } from "../../shared/context/AuthContext";
import PasswordStrength from "../../shared/ui/validator/PasswordStrength";
import SelectCategories from "../../shared/ui/components/selects/SelectCategories";
import HFIsotype from '../../../public/assets/HFIsotype';
import ThemeToggle from "../../shared/ui/layout/theme/ThemeToggle";
import { categories } from "../../../public/assets/Categories";

const loadingIcons = [Banknote, Wallet, PiggyBank, TrendingUp];

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingIconIndex, setLoadingIconIndex] = useState(0);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    cedulaOrNIT: "",
    legalName: "",
    sector: "",
    phone: "",
    network: "",
    specialities: [
      {
        categoryId: 0,
        title: '',
        description: ''
      }
    ]
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    cedulaOrNIT?: string;
    legalName?: string;
    sector?: string;
    phone?: string;
    network?: string;
    categories?: string;
  }>({});

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    cedulaOrNIT: false,
    legalName: false,
    sector: false,
    phone: false,
    network: false,
    categories: false,
  });

  // Ensure auth page respects the last selected theme
  useEffect(() => {
    try {
      const storedTheme = (localStorage.getItem('theme') as 'default' | 'light' | 'dark') || 'default';
      document.documentElement.setAttribute('data-theme', storedTheme);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (!loading) return;
    setLoadingIconIndex(0);
    const interval = setInterval(() => {
      setLoadingIconIndex(prev => prev + 1);
    }, 400);
    return () => clearInterval(interval);
  }, [loading]);

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;

    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    return (passedChecks / 5) * 100;
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const passwordStrength = calculatePasswordStrength(form.password);

    if (!form.email) {
      setTouched((prev) => ({ ...prev, email: true }));
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Por favor ingrese un correo electrónico válido";
    }

    if (!form.password) {
      setTouched((prev) => ({ ...prev, password: true }));
    } else if (form.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (passwordStrength < 80) {
      errors.password = "La contraseña debe tener al menos 80% de seguridad";
    }

    if (!form.confirmPassword) {
      setTouched((prev) => ({ ...prev, confirmPassword: true }));
    } else if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!form.cedulaOrNIT) {
      setTouched((prev) => ({ ...prev, cedulaOrNIT: true }));
    } else if (form.cedulaOrNIT.length < 5) {
      errors.cedulaOrNIT = "Documento debe tener al menos 5 caracteres";
    }

    if (!form.legalName) {
      setTouched((prev) => ({ ...prev, legalName: true }));
    } else if (form.legalName.length < 2) {
      errors.legalName = "El nombre debe tener al menos 2 caracteres";
    }

    if (selectedCategories.length === 0) {
      errors.categories = "Selecciona al menos una especialidad";
    }

    setValidationErrors(errors);
    return (
      Object.keys(errors).length === 0 &&
      form.email &&
      form.password &&
      form.confirmPassword &&
      form.cedulaOrNIT &&
      form.legalName
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePasswordFocus = () => {
    setShowPasswordStrength(true);
  };

  const handlePasswordStrengthClose = () => {
    setShowPasswordStrength(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedFullCategories = categories.filter(cat =>
      selectedCategories.includes(cat.id)
    );

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await register({
        email: form.email,
        password: form.password,
        cedulaOrNIT: form.cedulaOrNIT,
        legalName: form.legalName,
        clientType: "PERSONA",
        role: { id: 2 },
        sector: form.sector,
        phone: form.phone,
        network: form.network,
        status: "AUTHORIZED",
        specialities: selectedFullCategories.map(cat => ({
          categoryId: cat.id,
          title: cat.name,
          description: cat.description,
        })),
      });

      setAuth(res.token, res.role.id, res.id);
      setSuccess("Usuario registrado con éxito");
      console.log(res.message);
      navigate("/c");
    } catch (err: unknown) {
      // Try to detect conflict (email or cedula/NIT already exists)
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof err.message === "string" &&
        (err.message.includes("409") ||
          err.message.includes("Correo ya registrado") ||
          err.message.includes("cedula"))
      ) {
        setError("El correo o la cédula/NIT ya están registrados.");
      } else {
        setError("Ocurrió un error. Por favor intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(form.password);
  const isPasswordValid = passwordStrength >= 80;

  return (
    <div className="min-h-dvh p-5 md:p-8 flex flex-col items-center justify-center bg-base-200 relative overflow-hidden font-family">
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
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Wallet className="w-32 h-32 text-primary" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          >
            <PiggyBank className="w-32 h-32 text-secondary" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          >
            <TrendingUp className="w-32 h-32 text-accent" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-base-100 rounded-xl shadow-2xl relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-4"
          >
            <HFIsotype className="w-16 h-16 mx-auto animate-pulse" />
          </motion.div>
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-base-content/80"
          >
            Registrarse
          </motion.h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-error shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-success shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
        >
          <div className="form-control">
            <label htmlFor="email" className="label">
              <span className="label-text text-base-content/70 mb-1">
                Correo Electrónico
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-base-content/50" />
              </div>
              <input
                type="email"
                name="email"
                title="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ingresa tu correo electrónico"
                className={`input input-bordered w-full pl-10 ${(touched.email && !form.email) || validationErrors.email ? "input-error" : ""}`}
                disabled={loading}
                required
              />
            </div>
            {validationErrors.email && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validationErrors.email}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="password" className="label">
              <span className="label-text text-base-content/70 mb-1">
                Contraseña
              </span>
            </label>
            <div className="join w-full">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-base-content/50" />
                </div>
                <input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  title="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={handlePasswordFocus}
                  className={`input input-bordered w-full pl-10 join-item ${(touched.password && !form.password) ||
                    validationErrors.password
                    ? "input-error"
                    : form.password && isPasswordValid
                      ? "input-success"
                      : ""
                    }`}
                  placeholder="Mínimo 8 caractéres"
                  disabled={loading}
                  required
                  minLength={8}
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
              <label htmlFor="password" className="label">
                <span className="label-text-alt text-error">
                  {validationErrors.password}
                </span>
              </label>
            )}

            {/* Password Strength Component */}
            <PasswordStrength
              password={form.password}
              isVisible={showPasswordStrength}
              inputRef={passwordInputRef}
              onClose={handlePasswordStrengthClose}
            />
          </div>

          <div className="form-control">
            <label htmlFor="confirmPassword" className="label">
              <span className="label-text text-base-content/70 mb-1">
                Confirmar Contraseña
              </span>
            </label>
            <div className="join w-full">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-base-content/50" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  title="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-10 join-item ${(touched.confirmPassword && !form.confirmPassword) ||
                    validationErrors.confirmPassword
                    ? "input-error"
                    : form.confirmPassword &&
                      form.confirmPassword === form.password &&
                      isPasswordValid
                      ? "input-success"
                      : ""
                    }`}
                  disabled={loading}
                  placeholder="Mínimo 8 caractéres"
                  required
                  minLength={8}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="btn btn-square join-item"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-base-content/50" />
                ) : (
                  <Eye className="h-5 w-5 text-base-content/50" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validationErrors.confirmPassword}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="legalName" className="label">
              <span className="label-text text-base-content/70 mb-1">
                Nombre Legal
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-base-content/50" />
              </div>
              <input
                type="text"
                title="legalName"
                name="legalName"
                value={form.legalName}
                onChange={handleChange}
                className={`input input-bordered w-full pl-10 ${(touched.legalName && !form.legalName) || validationErrors.legalName ? "input-error" : ""}`}
                disabled={loading}
                placeholder="Ej: John Doe"
                required
              />
            </div>
            {validationErrors.legalName && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validationErrors.legalName}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="cedulaOrNIT" className="label">
              <span className="label-text text-base-content/70 mb-1">
                Cédula o NIT
              </span>
            </label>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
                <IdCard className="h-5 w-5 text-base-content/50" />
              </div>
              <input
                type="text"
                title="cedulaOrNIT"
                name="cedulaOrNIT"
                value={form.cedulaOrNIT}
                onChange={handleChange}
                className={`input input-bordered w-full pl-10 ${(touched.cedulaOrNIT && !form.cedulaOrNIT) || validationErrors.cedulaOrNIT ? "input-error" : ""}`}
                disabled={loading}
                placeholder="Solo números"
                required
              />
            </div>
            {validationErrors.cedulaOrNIT && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validationErrors.cedulaOrNIT}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="sector" className="label">
              <span className="label-text text-base-content/70 mb-1">
                Sector
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-base-content/50" />
              </div>
              <input
                type="text"
                title="sector"
                name="sector"
                value={form.sector}
                onChange={handleChange}
                className={`input input-bordered w-full pl-10 ${(touched.sector && !form.sector) || validationErrors.sector ? "input-error" : ""}`}
                disabled={loading}
                placeholder="Ej: Educación"
                required
              />
            </div>
            {validationErrors.sector && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validationErrors.sector}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="network" className="label">
              <span className="label-text text-base-content/70 mb-1">
                LinkedIn
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-base-content/50" />
              </div>
              <input
                type="text"
                title="network"
                name="network"
                value={form.network}
                onChange={handleChange}
                className={`input input-bordered w-full pl-10 ${(touched.network && !form.network) || validationErrors.network ? "input-error" : ""}`}
                disabled={loading}
                placeholder="Ej: www.linkedin.com/in/usuario"
              />
            </div>
            {validationErrors.network && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validationErrors.network}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="phone" className="label">
              <span className="label-text text-base-content/70 mb-1">
                Teléfono
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-base-content/50" />
              </div>
              <input
                type="text"
                title="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`input input-bordered w-full pl-10 ${(touched.phone && !form.phone) || validationErrors.phone ? "input-error" : ""}`}
                disabled={loading}
                placeholder="Ej: 321 456 7890"
                required
              />
            </div>
            {validationErrors.phone && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validationErrors.phone}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="categories" className="label">
              <span className="label-text text-base-content/70 mb-1">
                Especialidades
              </span>
            </label>

            <SelectCategories
              name="categories"
              categories={categories}
              value={selectedCategories}
              onChange={(value) => {
                setSelectedCategories(value);
                setTouched(prev => ({ ...prev, categories: true }));
                setValidationErrors(prev => ({ ...prev, categories: undefined }));
              }}
            />

            {validationErrors.categories && touched.categories && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validationErrors.categories}
                </span>
              </label>
            )}
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`btn btn-primary w-full ${loading || !isPasswordValid ? "opacity-50" : ""}`}
              disabled={loading || !isPasswordValid}
            >
              {!loading && "Registrarse"}
            </motion.button>

            {loading && (
              <div className="absolute inset-0 overflow-hidden rounded-btn pointer-events-none">
                <AnimatePresence mode="sync">
                  {(() => {
                    const Icon = loadingIcons[loadingIconIndex % loadingIcons.length];
                    return (
                      <motion.div
                        key={loadingIconIndex}
                        initial={{ x: -40, opacity: 0, rotate: -10, scale: 0.8 }}
                        animate={{ x: 420, opacity: 1, rotate: 10, scale: 1.1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: 'linear' }}
                        className="absolute inset-y-0 left-0 flex items-center"
                      >
                        <Icon className="w-6 h-6 text-primary" />
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
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
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </motion.div>
      </motion.div>


      {/* Footer */}
      <footer className='text-base-content/50 w-full text-center flex flex-col items-center justify-center'>
        <div className="p-6 pb-4">
          <ThemeToggle />
        </div>
        <hr className="text-accent/30 w-[80%] max-w-100 m-0" />
        <div className='mt-6 mb-2 sm:mb-0 flex flex-col-reverse sm:flex-col gap-1'>
          <p className='text-xs sm:text-sm'>© {new Date().getFullYear()} Haroldo Finanzas. Todos los derechos reservados.</p>
          <p className='text-xs sm:text-sm'>Institución Universitaria ITM. Colombia.</p>
        </div>
      </footer>
    </div>
  );
};

export default SignUp;

