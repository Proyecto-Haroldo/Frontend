import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Check, X } from 'lucide-react';

export interface PasswordStrengthProps {
  password: string;
  isVisible: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ 
  password, 
  isVisible, 
  inputRef,
  onClose 
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const strengthRef = useRef<HTMLDivElement>(null);

  const strength = useMemo(() => {
    if (!password) return { 
      score: 0, 
      level: 0,
      checks: {
        length: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        special: false
      }
    };
    
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = (passedChecks / 5) * 100;
    
    let level = 0;
    if (score >= 80) level = 4;
    else if (score >= 60) level = 3;
    else if (score >= 40) level = 2;
    else if (score >= 20) level = 1;

    return { score, level, checks };
  }, [password]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isVisible) return;
      
      const target = event.target as Node;
      
      // Check if click is outside both the strength component and the password input
      const isOutsideStrength = strengthRef.current && !strengthRef.current.contains(target);
      const isOutsidePasswordInput = inputRef.current && !inputRef.current.contains(target);
      
      // Also check if it's not the eye toggle button
      const passwordContainer = inputRef.current?.parentElement;
      const eyeToggleButton = passwordContainer?.querySelector('button');
      const isEyeToggleButton = eyeToggleButton?.contains(target);
      
      if (isOutsideStrength && isOutsidePasswordInput && !isEyeToggleButton) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, inputRef, onClose]);

  // Update position when visible
  useEffect(() => {
    if (inputRef.current && isVisible) {
      const rect = inputRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      
      setPosition({
        top: rect.bottom + scrollY + 8,
        left: rect.left + scrollX,
        width: rect.width
      });
    }
  }, [isVisible, inputRef, password]);

  if (!isVisible || !password) return null;

  const requirements = [
    { key: 'length', label: 'Mínimo 8 caracteres', met: strength.checks.length },
    { key: 'lowercase', label: 'Una minúscula', met: strength.checks.lowercase },
    { key: 'uppercase', label: 'Una mayúscula', met: strength.checks.uppercase },
    { key: 'numbers', label: 'Un número', met: strength.checks.numbers },
    { key: 'special', label: 'Carácter especial', met: strength.checks.special }
  ];
  
  return (
    <div
      ref={strengthRef}
      className="fixed bg-base-100 border border-base-300 rounded-xl shadow-xl p-5 max-w-sm"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${Math.max(position.width, 300)}px`,
        zIndex: 9999
      }}
    >
      {/* Strength indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-base-content/80">Seguridad</span>
          <span className="text-xs text-base-content/60">{Math.round(strength.score)}%</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-base-300 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              strength.level >= 4 
                ? 'bg-success' 
                : strength.level >= 3 
                  ? 'bg-warning' 
                  : strength.level >= 2
                    ? 'bg-warning'
                    : strength.level >= 1
                      ? 'bg-error'
                      : 'bg-base-300'
            }`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>
      
      {/* Requirements */}
      <div className="space-y-2">
        {requirements.map((req) => (
          <div 
            key={req.key}
            className={`flex items-center gap-2 text-sm transition-all duration-200 ${
              req.met ? 'text-success' : 'text-base-content/50'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
              req.met ? 'bg-success text-success-content' : 'bg-neutral text-neutral-content'
            }`}>
              {req.met ? (
                <Check className="w-2.5 h-2.5" />
              ) : (
                <X className="w-2.5 h-2.5" />
              )}
            </div>
            <span className={req.met ? 'font-medium' : ''}>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;