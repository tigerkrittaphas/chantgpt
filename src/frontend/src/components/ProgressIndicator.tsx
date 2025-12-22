import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-500",
                isActive && "bg-primary text-primary-foreground shadow-gold scale-110",
                isCompleted && "bg-secondary text-secondary-foreground",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            {stepNumber < totalSteps && (
              <div
                className={cn(
                  "w-12 h-1 rounded-full transition-all duration-500",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;
