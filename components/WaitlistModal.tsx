"use client";

import React, { useState, useEffect } from "react";
import { submitWaitlist, UserSubmission } from "../lib/supabase";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSubmit?: () => void;
  projectId: string;
  projectName: string;
}

export default function WaitlistModal({
  isOpen,
  onClose,
  onSuccessSubmit,
  projectId,
  projectName,
}: WaitlistModalProps) {
  const [formData, setFormData] = useState<UserSubmission>({
    name: "",
    phone: "",
    gender: "",
    dob: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setFormData({
          name: "",
          phone: "",
          gender: "",
          dob: "",
        });
        setIsSuccess(false);
        setErrorMsg(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (cleanPhone: string): boolean => {
    // 1. Name validation
    const trimmedName = formData.name.trim();
    if (trimmedName.length < 2) {
      setErrorMsg("Please enter a valid name (at least 2 characters).");
      return false;
    }

    // 2. Indian Phone number validation
    // Clean phone must be exactly 10 digits and start with 6, 7, 8, or 9
    const indianMobileRegex = /^[6-9][0-9]{9}$/;
    if (!indianMobileRegex.test(cleanPhone)) {
      setErrorMsg(
        "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210, optionally starting with +91).",
      );
      return false;
    }

    // 3. Gender validation
    if (!formData.gender) {
      setErrorMsg("Please select your gender.");
      return false;
    }

    // 4. DOB validation (must be in the past and logical age)
    if (!formData.dob) {
      setErrorMsg("Please enter your date of birth.");
      return false;
    }
    const dobDate = new Date(formData.dob);
    const currentDate = new Date();
    if (dobDate >= currentDate) {
      setErrorMsg("Date of birth must be in the past.");
      return false;
    }
    const ageDiffMs = currentDate.getTime() - dobDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 5 || age > 110) {
      setErrorMsg("Please select a logical date of birth.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Clean and normalize Indian mobile phone number
    let cleanPhone = formData.phone.replace(/[\s\-()]/g, ""); // Remove spaces, hyphens, brackets
    if (cleanPhone.startsWith("+91")) {
      cleanPhone = cleanPhone.substring(3);
    } else if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.substring(2);
    } else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = cleanPhone.substring(1);
    }

    if (!validateForm(cleanPhone)) return;

    setIsSubmitting(true);

    const submissionPayload = {
      name: formData.name.trim(),
      phone: `+91${cleanPhone}`, // Store uniformly as +91XXXXXXXXXX
      gender: formData.gender,
      dob: formData.dob,
    };

    const result = await submitWaitlist(submissionPayload, projectId);

    setIsSubmitting(false);
    if (result.success) {
      setIsSuccess(true);
      if (onSuccessSubmit) {
        onSuccessSubmit();
      }
    } else {
      setErrorMsg(
        result.error ||
          "Verification failed. Please check your inputs and try again.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Centered Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 dark:bg-slate-900 light:bg-white text-gray-100 light:text-gray-900 border border-slate-800 light:border-gray-200 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 transform scale-100 opacity-100 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white light:hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-white/5 light:hover:bg-gray-100 focus:outline-none"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8 sm:p-10">
          {isSuccess ? (
            /* Interest Validation Success Display */
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 mb-6">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent mb-3">
                You&apos;re on the list! 🎉
              </h3>
              <p className="text-slate-400 dark:text-slate-400 light:text-gray-600 text-sm sm:text-base leading-relaxed mb-8">
                Thank you for showing interest in **{projectName}**! We have
                saved your spot, and we will reach out with early updates as
                soon as possible.
              </p>
              <button
                onClick={onClose}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 active:scale-[0.98]"
              >
                Close & Explore
              </button>
            </div>
          ) : (
            /* Waitlist Sign Up Form */
            <div>
              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  Get Early Access
                </h3>
                <p className="text-slate-400 dark:text-slate-400 light:text-gray-600 text-sm sm:text-base leading-relaxed">
                  Sign up to secure your spot for early access updates.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-sm flex items-start gap-2">
                  <svg
                    className="w-5 h-5 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-gray-500 mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-5 py-3.5 bg-slate-950/50 light:bg-gray-50 border border-slate-800 light:border-gray-200 rounded-2xl text-white light:text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-gray-500 mb-1.5"
                  >
                    Phone Number
                  </label>
                  <div className="flex rounded-2xl bg-slate-950/50 light:bg-gray-50 border border-slate-800 light:border-gray-200 overflow-hidden focus-within:border-purple-500/50 transition-all">
                    <span className="flex items-center pl-5 pr-3 text-sm font-semibold text-slate-500 dark:text-slate-400 light:text-gray-500 border-r border-slate-800 light:border-gray-200 bg-slate-950/20 light:bg-gray-100 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                      className="w-full px-4 py-3.5 bg-transparent text-white light:text-gray-900 placeholder-gray-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-gray-500 mb-2">
                      Gender
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, gender: "male" }))
                        }
                        className={`py-3 px-4 rounded-2xl border text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                          formData.gender === "male"
                            ? "bg-purple-500/10 border-purple-500 text-purple-400 dark:text-purple-400 light:text-purple-600 shadow-md shadow-purple-500/5"
                            : "bg-slate-950/50 light:bg-gray-50 border-slate-800 light:border-gray-200 text-slate-400 light:text-gray-600 hover:border-slate-700"
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, gender: "female" }))
                        }
                        className={`py-3 px-4 rounded-2xl border text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                          formData.gender === "female"
                            ? "bg-purple-500/10 border-purple-500 text-purple-400 dark:text-purple-400 light:text-purple-600 shadow-md shadow-purple-500/5"
                            : "bg-slate-950/50 light:bg-gray-50 border-slate-800 light:border-gray-200 text-slate-400 light:text-gray-600 hover:border-slate-700"
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="dob"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-gray-500 mb-2"
                    >
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3 bg-slate-950/50 light:bg-gray-50 border border-slate-800 light:border-gray-200 rounded-2xl text-white light:text-gray-900 focus:outline-none focus:border-purple-500/50 transition-all text-sm cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Submitting Interest...</span>
                    </>
                  ) : (
                    <span>Get Early Access</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
