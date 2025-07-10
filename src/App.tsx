import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Services from './pages/Services';
import Schedule from './pages/Schedule';
import Diagnostics from './pages/Diagnostics';
import Account from './pages/Account';
import Questionnaire from './pages/Questionnaire';
import DiagnosticReview from './pages/DiagnosticReview';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AuthProvider, useAuth } from './context/AuthContext';

// AnimatedRoutes component wraps the Routes with AnimatePresence
function AnimatedRoutes() {
  const location = useLocation();
  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20, when: "beforeChildren" }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/account" element={<Account />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/diagnostic-review" element={<DiagnosticReview />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// Protects children if user is authenticated, else redirects to /login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  // Used to prevent any animation on initial load
  const [isFirstMount, setIsFirstMount] = useState(true);
  useEffect(() => { setIsFirstMount(false); }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-base-200 flex flex-col md:flex-row font-geist">
                <Navbar />
                <main className="flex-1 p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
                  {isFirstMount ? (
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/diagnostics" element={<Diagnostics />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/questionnaire" element={<Questionnaire />} />
                      <Route path="/diagnostic-review" element={<DiagnosticReview />} />
                    </Routes>
                  ) : (
                    <AnimatedRoutes />
                  )}
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;