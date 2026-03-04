import { motion } from 'motion/react';
import { ColorSemaforo } from '../types/analysis';

type StoplightProps = {
  color: ColorSemaforo;
  animated?: boolean;
};

const pulseVariants = {
  initial: { scale: 1, opacity: 0.7 },
  animate: {
    scale: [1, 1.6],
    opacity: [0.7, 0],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      repeatDelay: 0.6,
      ease: 'easeOut' as const
    }
  }
};

const pingVariants = {
  initial: { scale: 1, opacity: 0.35 },
  animate: {
    scale: [1, 1.9],
    opacity: [0.35, 0],
    transition: {
      duration: 1.4,
      repeat: Infinity,
      repeatDelay: 0.6,
      ease: 'easeOut' as const
    }
  }
};

export function Stoplight({ color, animated = true }: StoplightProps) {
  const isRed = color === 'rojo';
  const isYellow = color === 'amarillo';
  const isGreen = color === 'verde';

  const maybeAnimatedProps = animated
    ? {
        initial: 'initial' as const,
        animate: 'animate' as const
      }
    : {};

  return (
    <div className="relative">
      {/* Stoplight Housing */}
      <motion.div
        className="bg-neutral rounded-3xl p-6 shadow-2xl border-4 border-neutral-focus"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="flex flex-col space-y-5">
          {/* Red (TOP) */}
          <div className="relative flex justify-center">
            <div
              className={`w-20 h-20 rounded-full border-4 border-neutral-content/20 transition-all duration-700 ${
                isRed ? 'bg-red-500 shadow-xl shadow-red-500/60' : 'bg-neutral-content/10 shadow-inner'
              }`}
            >
              {isRed && animated && (
                <>
                  <motion.div
                    className="absolute inset-2 bg-red-400 rounded-full"
                    variants={pingVariants}
                    {...maybeAnimatedProps}
                  />
                  <motion.div
                    className="absolute inset-3 bg-gradient-to-br from-red-300 via-red-500 to-red-700 rounded-full"
                    variants={pulseVariants}
                    {...maybeAnimatedProps}
                  />
                  <div className="absolute top-3 left-3 w-4 h-4 bg-red-200 rounded-full blur-sm opacity-80" />
                </>
              )}
            </div>
          </div>

          {/* Yellow (MIDDLE) */}
          <div className="relative flex justify-center">
            <div
              className={`w-20 h-20 rounded-full border-4 border-neutral-content/20 transition-all duration-700 ${
                isYellow ? 'bg-yellow-400 shadow-xl shadow-yellow-400/60' : 'bg-neutral-content/10 shadow-inner'
              }`}
            >
              {isYellow && animated && (
                <>
                  <motion.div
                    className="absolute inset-2 bg-yellow-300 rounded-full"
                    variants={pingVariants}
                    {...maybeAnimatedProps}
                  />
                  <motion.div
                    className="absolute inset-3 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-full"
                    variants={pulseVariants}
                    {...maybeAnimatedProps}
                  />
                  <div className="absolute top-3 left-3 w-4 h-4 bg-yellow-100 rounded-full blur-sm opacity-80" />
                </>
              )}
            </div>
          </div>

          {/* Green (BOTTOM) */}
          <div className="relative flex justify-center">
            <div
              className={`w-20 h-20 rounded-full border-4 border-neutral-content/20 transition-all duration-700 ${
                isGreen ? 'bg-green-500 shadow-xl shadow-green-500/60' : 'bg-neutral-content/10 shadow-inner'
              }`}
            >
              {isGreen && animated && (
                <>
                  <motion.div
                    className="absolute inset-2 bg-green-400 rounded-full"
                    variants={pingVariants}
                    {...maybeAnimatedProps}
                  />
                  <motion.div
                    className="absolute inset-3 bg-gradient-to-br from-green-300 via-green-500 to-green-700 rounded-full"
                    variants={pulseVariants}
                    {...maybeAnimatedProps}
                  />
                  <div className="absolute top-3 left-3 w-4 h-4 bg-green-200 rounded-full blur-sm opacity-80" />
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subtle Glow Effect */}
      {isRed && (
        <motion.div
          className="absolute inset-0 bg-red-500/10 rounded-3xl blur-xl -z-10"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {isYellow && (
        <motion.div
          className="absolute inset-0 bg-yellow-400/10 rounded-3xl blur-xl -z-10"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {isGreen && (
        <motion.div
          className="absolute inset-0 bg-green-500/10 rounded-3xl blur-xl -z-10"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}

