import { type ClassValue, clsx } from 'clsx';

// Combine class names conditionally
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

// Format XP number with commas
export function formatXP(xp: number): string {
    return new Intl.NumberFormat('en-US').format(xp);
}

// Calculate level from XP
export function calculateLevel(xp: number): number {
    // Each level requires progressively more XP
    // Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
    let level = 1;
    let requiredXP = 100;
    let totalXP = 0;

    while (totalXP + requiredXP <= xp) {
        totalXP += requiredXP;
        level++;
        requiredXP = Math.floor(requiredXP * 1.5);
    }

    return level;
}

// Calculate XP progress to next level
export function calculateLevelProgress(xp: number): { current: number; required: number; percentage: number } {
    let requiredXP = 100;
    let totalXP = 0;

    while (totalXP + requiredXP <= xp) {
        totalXP += requiredXP;
        requiredXP = Math.floor(requiredXP * 1.5);
    }

    const currentProgress = xp - totalXP;
    const percentage = Math.floor((currentProgress / requiredXP) * 100);

    return {
        current: currentProgress,
        required: requiredXP,
        percentage
    };
}

// Get rank from XP
export function getRank(xp: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
    if (xp >= 30000) return 'diamond';
    if (xp >= 15000) return 'platinum';
    if (xp >= 5000) return 'gold';
    if (xp >= 1000) return 'silver';
    return 'bronze';
}

// Get rank display name
export function getRankDisplayName(rank: string): string {
    const names: Record<string, string> = {
        bronze: 'Bronze Kitten',
        silver: 'Silver Cat',
        gold: 'Gold Panther',
        platinum: 'Platinum Lynx',
        diamond: 'Diamond Tiger'
    };
    return names[rank] || 'Bronze Kitten';
}

// Get rank color
export function getRankColor(rank: string): string {
    const colors: Record<string, string> = {
        bronze: 'text-[#cd7f32]',
        silver: 'text-[#c0c0c0]',
        gold: 'text-[#ffd700]',
        platinum: 'text-[#a3e4d7]',
        diamond: 'text-[#b9f2ff]'
    };
    return colors[rank] || 'text-[#cd7f32]';
}

// Get tier name
export function getTierName(tier: number): string {
    const names: Record<number, string> = {
        1: 'Seedling',
        2: 'Sprout',
        3: 'Growing',
        4: 'Mature',
        5: 'Expert'
    };
    return names[tier] || 'Seedling';
}

// Get tier icon/emoji
export function getTierIcon(tier: number): string {
    const icons: Record<number, string> = {
        1: '🌱',
        2: '🌿',
        3: '🌳',
        4: '🌲',
        5: '🏔️'
    };
    return icons[tier] || '🌱';
}

// Get difficulty color
export function getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
        easy: 'text-green-500',
        medium: 'text-yellow-500',
        hard: 'text-red-500'
    };
    return colors[difficulty] || 'text-gray-500';
}

// Format time (seconds to MM:SS or HH:MM:SS)
export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return then.toLocaleDateString();
}

// Generate random avatar URL (placeholder)
export function generateAvatarUrl(username: string): string {
    return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(username)}`;
}

// Local storage helpers
export function getLocalStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

export function setLocalStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), wait);
    };
}
