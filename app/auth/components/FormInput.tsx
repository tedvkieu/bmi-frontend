"use client";
import React from "react";

interface FormInputProps {
    id: string;
    name: string;
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    icon?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
    id,
    name,
    label,
    type,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    icon,
}) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="text-gray-400">{icon}</div>
                    </div>
                )}
                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full text-black px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${icon ? "pl-10" : ""
                        } ${error
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormInput;
