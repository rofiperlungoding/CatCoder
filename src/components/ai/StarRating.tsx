import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number; // 1-5
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, maxRating = 5, size = 'md' }: StarRatingProps) {
    const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <Star
                    key={star}
                    className={`${sizeClasses[size]} ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                        } transition-colors duration-300`}
                />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                {rating}/{maxRating}
            </span>
        </div>
    );
}
