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
            className={`bg-white rounded-[2rem] border border-transparent hover:border-gray-100 shadow-sm p-8 transition-colors duration-300 ${className}`}
        >
            {children}
        </div>
    );
};
