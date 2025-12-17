import React from 'react';

interface AvatarProps {
    src?: string;
    alt?: string;
    fallback: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, size = 'md', className = '' }) => {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg"
    };

    return (
        <div className={`relative inline-block rounded-full overflow-hidden bg-slate-100 border border-slate-200 ${sizes[size]} ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt || fallback}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 uppercase">
                    {fallback.substring(0, 2)}
                </div>
            )}
        </div>
    );
};
