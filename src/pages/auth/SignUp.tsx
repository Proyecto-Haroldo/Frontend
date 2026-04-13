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
  MapPin,
  User,
  Briefcase,
  Phone,
  Globe,
} from "lucide-react";
import { register } from "../../api/authApi";
import { useAuth } from "../../shared/context/AuthContext";
import PasswordStrength from "../../shared/ui/validator/PasswordStrength";
import SelectCategories from "../../shared/ui/components/selects/SelectCategories";
import HFIsotype from '../../../public/assets/HFIsotype';
import ThemeToggle from "../../shared/ui/layout/theme/ThemeToggle";
import useCategories from "../../shared/hooks/useCategories";

const loadingIcons = [Banknote, Wallet, PiggyBank, TrendingUp];

const SignUp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const { categories, isUsingFallback } = useCategories();
  const { setAuth } = useAuth();
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "Cliente",
    clientType: "persona",
    cedulaOrNIT: "",
    legalName: "",
    sector: "",
    location: "",
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
    role?: string;
    clientType?: string;
    cedulaOrNIT?: string;
    legalName?: string;
    sector?: string;
    location?: string;
    phone?: string;
    network?: string;
    specialities?: string;
  }>({});

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    role: false,
    clientType: false,
    cedulaOrNIT: false,
    legalName: false,
    sector: false,
    location: false,
    phone: false,
    network: false,
    specialities: false,
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

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    const passwordStrength = calculatePasswordStrength(form.password);

    switch (step) {
      case 1:
        if (!form.email) {
          errors.email = "El correo electrónico es requerido";
          setTouched((prev) => ({ ...prev, email: true }));
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
          errors.email = "Por favor ingrese un correo electrónico válido";
        }

        if (!form.password) {
          errors.password = "La contraseña es requerida";
          setTouched((prev) => ({ ...prev, password: true }));
        } else if (form.password.length < 8) {
          errors.password = "La contraseña debe tener al menos 8 caracteres";
        } else if (passwordStrength < 80) {
          errors.password = "La contraseña debe tener al menos 80% de seguridad";
        }

        if (!form.confirmPassword) {
          errors.confirmPassword = "Confirmar contraseña es requerido";
          setTouched((prev) => ({ ...prev, confirmPassword: true }));
        } else if (form.confirmPassword !== form.password) {
          errors.confirmPassword = "Las contraseñas no coinciden";
        }
        break;

      case 3:
        if (!form.cedulaOrNIT) {
          errors.cedulaOrNIT = "El documento es requerido";
          setTouched((prev) => ({ ...prev, cedulaOrNIT: true }));
        } else if (form.cedulaOrNIT.length < 5) {
          errors.cedulaOrNIT = "Documento debe tener al menos 5 caracteres";
        }

        // Nombre legal is required for both persona and empresa
        if (!form.legalName) {
          errors.legalName = "El nombre legal es requerido";
          setTouched((prev) => ({ ...prev, legalName: true }));
        } else if (form.legalName.length < 2) {
          errors.legalName = "El nombre debe tener al menos 2 caracteres";
        }

        // Sector is required for both persona and empresa now
        if (!form.sector) {
          errors.sector = "El sector es requerido";
          setTouched((prev) => ({ ...prev, sector: true }));
        }
        break;

      case 4:
        break;

      case 5:
        if (form.role === "Asesor" && selectedCategories.length === 0) {
          errors.specialities = "Debe seleccionar al menos una especialidad";
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForm = () => {
    const step1Valid = validateStep(1);
    const step3Valid = validateStep(3);
    const step4Valid = validateStep(4);
    const step5Valid = form.role === "Asesor" ? validateStep(5) : true;

    return step1Valid && step3Valid && step4Valid && step5Valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      return;
    }
  };

  const handleNext = () => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      const maxSteps = form.role === "Asesor" ? 5 : 4;
      if (currentStep < maxSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleManualSubmit = async () => {
    const mockEvent = {
      preventDefault: () => { }
    } as React.FormEvent;

    await handleSubmit(mockEvent, true);
  };

  const handlePasswordFocus = () => {
    setShowPasswordStrength(true);
  };

  const handlePasswordStrengthClose = () => {
    setShowPasswordStrength(false);
  };

  const handleSubmit = async (e: React.FormEvent, isManual: boolean = false) => {
    e.preventDefault();

    // Only allow submission if it was triggered manually by clicking the submit button
    if (!isManual) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const selectedFullCategories = (categories ?? []).filter(cat =>
      selectedCategories.includes(Number(cat.id))
    );

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const roleId = form.role === "Asesor" ? 3 : 2;
      const status = form.role === "Asesor" ? "UNAUTHORIZED" : "AUTHORIZED";
      const res = await register({
        email: form.email,
        password: form.password,
        cedulaOrNIT: form.cedulaOrNIT,
        legalName: form.legalName,
        clientType: form.clientType.toUpperCase(),
        role: { id: roleId },
        sector: form.sector,
        location: form.location,
        phone: form.phone,
        network: form.network,
        status: status,
        specialities: selectedFullCategories.map(cat => ({
          categoryId: cat.id,
          title: cat.name,
          description: cat.description,
        })),
      });

      setAuth(res.token, res.role.id, res.id, status);
      setSuccess("Usuario registrado con éxito");
      console.log(res.message);

      const role = res?.role.id;

      if (role === 2) {
        navigate("/c");
      } else if (role === 3) {
        navigate("/a");
      } else {
        setError("Rol no reconocido.");
      }
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

  const renderStepIndicator = () => {
    const totalSteps = form.role === "Asesor" ? 5 : 4;
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
    return (
      <div className="flex justify-center mb-6 px-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {steps.map((step) => (
            <React.Fragment key={step}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 ${currentStep >= step
                  ? "bg-primary text-primary-content shadow-sm"
                  : "bg-base-300 text-base-content/50"
                  }`}
              >
                {step}
              </div>
              {step < totalSteps && (
                <div
                  className={`w-4 sm:w-8 h-0.5 transition-all duration-300 ${currentStep > step ? "bg-primary" : "bg-base-300"
                    }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-center text-base-content/80">
        Información de cuenta
      </h2>

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
            onKeyDown={handleKeyDown}
            className={`input input-bordered w-full pl-10 ${(touched.email && !form.email) || validationErrors.email ? "input-error" : ""}`}
            disabled={loading}
            placeholder="Ej: usuario@dominio.com"
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

      <div className="form-control relative">
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
              onKeyDown={handleKeyDown}
              className={`input input-bordered w-full pl-10 join-item ${(touched.password && !form.password) ||
                validationErrors.password
                ? "input-error"
                : form.password && isPasswordValid
                  ? "input-success"
                  : ""
                }`}
              placeholder="Mínimo 8 caracteres"
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

        <div className="relative">
          <PasswordStrength
            password={form.password}
            isVisible={showPasswordStrength}
            inputRef={passwordInputRef}
            onClose={handlePasswordStrengthClose}
          />
        </div>
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
              onKeyDown={handleKeyDown}
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
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-center text-base-content/80">
        Tipo de cuenta
      </h2>

      <div className="form-control">
        <label className="label">
          <span className="label-text text-base-content/70">
            Rol
          </span>
        </label>
        <div className="relative bg-base-200 rounded-lg p-1">
          <div className="flex">
            <div className="relative flex-1">
              <label className="cursor-pointer block">
                <input
                  type="radio"
                  name="role"
                  value="Cliente"
                  checked={form.role === "Cliente"}
                  onChange={handleChange}
                  className="peer sr-only"
                  disabled={loading}
                />
                <div className="sm:h-20 relative flex items-center justify-center p-3 rounded-md transition-all duration-300 peer-checked:bg-white peer-checked:shadow-sm peer-checked:text-primary peer-hover:bg-base-300">
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center">
                    <User className="w-5 h-5 mr-2" />
                    <span className="font-medium">Cliente</span>
                  </div>
                </div>
              </label>
            </div>
            <div className="relative flex-1">
              <label className="cursor-pointer block">
                <input
                  type="radio"
                  name="role"
                  value="Asesor"
                  checked={form.role === "Asesor"}
                  onChange={handleChange}
                  className="peer sr-only"
                  disabled={loading}
                />
                <div className="sm:h-20 relative flex items-center justify-center p-3 rounded-md transition-all duration-300 peer-checked:bg-white peer-checked:shadow-sm peer-checked:text-primary peer-hover:bg-base-300">
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span className="font-medium">Asesor</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text text-base-content/70">
            Tipo de cliente
          </span>
        </label>
        <div className="relative bg-base-200 rounded-lg p-1">
          <div className="flex">
            <div className="relative flex-1">
              <label className="cursor-pointer block">
                <input
                  type="radio"
                  name="clientType"
                  value="persona"
                  checked={form.clientType === "persona"}
                  onChange={handleChange}
                  className="peer sr-only"
                  disabled={loading}
                />
                <div className="sm:h-20 relative flex items-center justify-center p-3 rounded-md transition-all duration-300 peer-checked:bg-white peer-checked:shadow-sm peer-checked:text-primary peer-hover:bg-base-300">
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center">
                    <User className="w-5 h-5 mr-2" />
                    <span className="font-medium">Persona</span>
                  </div>
                </div>
              </label>
            </div>
            <div className="relative flex-1">
              <label className="cursor-pointer block">
                <input
                  type="radio"
                  name="clientType"
                  value="empresa"
                  checked={form.clientType === "empresa"}
                  onChange={handleChange}
                  className="peer sr-only"
                  disabled={loading}
                />
                <div className="sm:h-20 relative flex items-center justify-center p-3 rounded-md transition-all duration-300 peer-checked:bg-white peer-checked:shadow-sm peer-checked:text-primary peer-hover:bg-base-300">
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    <span className="font-medium">Empresa</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-center text-base-content/80">
        Información {form.clientType === "persona" ? "personal" : "de la empresa"}
      </h2>

      <div className="form-control">
        <label htmlFor="cedulaOrNIT" className="label">
          <span className="label-text text-base-content/70 mb-1">
            {form.clientType === "persona" ? "Cédula" : "NIT"}
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
            onKeyDown={handleKeyDown}
            className={`input input-bordered w-full pl-10 ${(touched.cedulaOrNIT && !form.cedulaOrNIT) || validationErrors.cedulaOrNIT ? "input-error" : ""}`}
            disabled={loading}
            placeholder="Solo números y guiones"
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
            onKeyDown={handleKeyDown}
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
            onKeyDown={handleKeyDown}
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
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-center text-base-content/80">
        Información de contacto
      </h2>

      <div className="space-y-4">
        <div className="form-control">
          <label htmlFor="phone" className="label">
            <span className="label-text text-base-content/70 mb-1">
              Teléfono (Opcional)
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-base-content/50" />
            </div>
            <input
              type="tel"
              title="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="input input-bordered w-full pl-10"
              placeholder="Ej: 321 456 7890"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-control">
          <label htmlFor="location" className="label">
            <span className="label-text text-base-content/70 mb-1">
              Región (Opcional)
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-base-content/50" />
            </div>
            <input
              type="text"
              title="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="input input-bordered w-full pl-10"
              placeholder="Ej: Medellín, Colombia"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-control">
          <label htmlFor="network" className="label">
            <span className="label-text text-base-content/70 mb-1">
              LinkedIn (Opcional)
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-base-content/50" />
            </div>
            <input
              type="url"
              title="network"
              name="network"
              value={form.network}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="https://linkedin.com/in/..."
              className="input input-bordered w-full pl-10"
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-center text-base-content/80">
        Especialidades
      </h2>

      <div className="form-control">
        <label className="label">
          <span className="label-text text-base-content/70">
            Especialidades (seleccione una o más)
          </span>
        </label>
        <SelectCategories
          name="specialities"
          categories={categories || []}
          value={selectedCategories}
          onChange={(value) => {
            setSelectedCategories(value);
            setTouched(prev => ({ ...prev, specialities: true }));
            setValidationErrors(prev => ({ ...prev, specialities: undefined }));
          }}
        />

        {isUsingFallback && (
          <p className="text-xs text-base-content/50 mt-2">
            * Usando categorías por defecto
          </p>
        )}

        {validationErrors.specialities && (
          <label className="label">
            <span className="label-text-alt text-error">
              {validationErrors.specialities}
            </span>
          </label>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-dvh p-6 md:p-8 md:pb-6 flex flex-col items-center justify-center bg-base-200 relative overflow-hidden font-family">
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
            <PiggyBank className="w-32 h-32 text-primary" />
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
        className="w-full max-w-md p-8 space-y-4 bg-base-100 rounded-xl shadow-xl relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-4"
          >
            <HFIsotype className="w-16 h-16 mx-auto" />
          </motion.div>
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-base-content/80"
          >
            Registro
          </motion.h1>
        </div>

        {renderStepIndicator()}

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
          className="space-y-6"
          noValidate
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          <div className="flex justify-between space-x-4">
            {currentStep > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handlePrevious}
                className="btn btn-outline flex-1 border-0 bg-base-content/10"
                disabled={loading}
              >
                Anterior
              </motion.button>
            )}

            {currentStep < (form.role === "Asesor" ? 5 : 4) ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNext}
                className={`btn btn-primary flex-1 ${currentStep > 1 ? "ml-auto" : ""}`}
                disabled={loading}
              >
                Siguiente
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleManualSubmit}
                className={`btn btn-primary flex-1 ${currentStep > 1 ? "ml-auto" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <div>
                    <span>Registrando...</span>
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
                ) : (
                  "Registrarse"
                )}
              </motion.button>
            )}
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-2"
        >
          <p className="text-sm text-base-content/70">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className='text-base-content/70 w-full text-center flex flex-col items-center justify-center'>
        <div className="pt-6">
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default SignUp;
