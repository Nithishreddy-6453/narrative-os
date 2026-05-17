"use client";

import { motion } from "framer-motion";
import { ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { repositoryService } from "@/services";
import type { ValidationResult } from "@/types/repository";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);

interface RepoInputSectionProps {
  onScanStart: (url: string) => void;
  validationResult?: ValidationResult | null;
  error?: string | null;
}

export default function RepoInputSection({ onScanStart, validationResult, error }: RepoInputSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [localValidation, setLocalValidation] = useState<ValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced validation
  useEffect(() => {
    if (!inputValue.trim()) {
      setLocalValidation(null);
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(async () => {
      const result = await repositoryService.validateUrl(inputValue);
      setLocalValidation(result);
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleAnalyze = async () => {
    if (inputValue.trim() && localValidation?.valid) {
      setIsSubmitting(true);
      onScanStart(inputValue.trim());
    }
  };

  const displayValidation = validationResult || localValidation;
  const isValid = displayValidation?.valid && inputValue.trim().length > 0;
  const showError = error || (displayValidation && !displayValidation.valid && inputValue.trim().length > 0);

  return (
    <section className="relative py-32 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-medium tracking-tight mb-3">Initialize Intelligence</h2>
          <p className="text-text-secondary font-light">Paste a GitHub repository to begin the spatial analysis.</p>
        </div>

        <div className="relative group">
          {/* Animated Glow Border */}
          <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-blue opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-30 ${isFocused ? 'opacity-50' : ''}`}></div>
          
          <div className="relative flex items-center bg-surface-graphite border border-white/10 rounded-2xl p-2 transition-all duration-300">
            <div className="pl-4 pr-3 text-text-secondary flex items-center justify-center">
              <GithubIcon />
            </div>
            
            <input
              type="text"
              placeholder="https://github.com/facebook/react"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-lg py-3 font-light tracking-wide w-full"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isSubmitting}
            />
            
            {/* Validation Indicator */}
            {inputValue.trim() && (
              <div className="flex items-center gap-2 px-3">
                {isValidating ? (
                  <Loader2 className="w-4 h-4 text-text-secondary animate-spin" />
                ) : isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : showError ? (
                  <XCircle className="w-4 h-4 text-red-400" />
                ) : null}
              </div>
            )}
            
            <motion.button
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              onClick={handleAnalyze}
              disabled={!isValid || isSubmitting}
              className={`relative overflow-hidden bg-white text-black px-6 py-3 rounded-xl font-medium tracking-wide flex items-center gap-2 transition-transform active:scale-95 ${
                !isValid || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="relative z-10">{isSubmitting ? "Analyzing..." : "Analyze"}</span>
              {!isSubmitting && (
                <motion.div
                  animate={{ x: isHovered && isValid ? 4 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
              
              {/* Button Scan Effect */}
              {isHovered && isValid && !isSubmitting && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12"
                />
              )}
            </motion.button>
          </div>
        </div>

        {/* Status Messages */}
        <div className="mt-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-3 text-sm text-text-secondary font-mono opacity-60">
            <span className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-400' : 'bg-accent-violet'}`}></span>
            {isSubmitting ? "Initializing analysis..." :
             isValid ? "Repository validated. Ready to analyze." :
             inputValue.trim() ? "Validating repository..." :
             "Waiting for repository input..."}
          </div>
          
          {/* Error Message */}
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20"
            >
              {error || displayValidation?.error || "Invalid repository URL"}
            </motion.div>
          )}
          
          {/* Repository Type Indicator */}
          {isValid && displayValidation?.repoInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-accent-cyan bg-accent-cyan/10 px-4 py-2 rounded-lg border border-accent-cyan/20 flex items-center gap-2"
            >
              <CheckCircle className="w-3 h-3" />
              <span>
                {displayValidation.repoInfo.owner}/{displayValidation.repoInfo.name}
                {displayValidation.repoInfo.branch !== 'main' && ` (${displayValidation.repoInfo.branch})`}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
