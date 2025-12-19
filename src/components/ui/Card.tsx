import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-gray-800 rounded-[2rem] border border-transparent hover:border-gray-100 dark:hover:border-gray-700 shadow-sm dark:shadow-gray-900/20 p-8 transition-colors duration-300 ${className}`}
        >
            {children}
        </div>
    );
};
