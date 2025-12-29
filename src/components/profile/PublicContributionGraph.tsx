import React, { useEffect, useState, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface ContributionDay {
    date: string;
    count: number;
    dayOfWeek: number;
    month: number;
    year: number;
}

interface PublicContributionGraphProps {
    userId: string;
    className?: string;
}

export const PublicContributionGraph: React.FC<PublicContributionGraphProps> = ({ userId, className }) => {
    const [contributions, setContributions] = useState<Map<string, number>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Generate array of last 365 days
    const daysArray = useMemo(() => {
        const days: ContributionDay[] = [];
        const today = new Date();

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                count: 0,
                dayOfWeek: date.getDay(),
                month: date.getMonth(),
                year: date.getFullYear()
            });
        }
        return days;
    }, []);

    // Fetch contribution data
    useEffect(() => {
        const fetchContributions = async () => {
            if (!userId || !isSupabaseConfigured()) {
                setIsLoading(false);
                return;
            }

            try {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 365);

                const { data, error } = await supabase
                    .from('user_progress')
                    .select('completed_at')
                    .eq('user_id', userId)
                    .eq('status', 'completed')
                    .gte('completed_at', startDate.toISOString());

                if (error) {
                    console.error('Error fetching contributions:', error);
                    setIsLoading(false);
                    return;
                }

                const countMap = new Map<string, number>();
                (data || []).forEach((row: { completed_at: string }) => {
                    if (row.completed_at) {
                        const dateStr = row.completed_at.split('T')[0];
                        countMap.set(dateStr, (countMap.get(dateStr) || 0) + 1);
                    }
                });

                setContributions(countMap);
            } catch (err) {
                console.error('Error fetching contributions:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContributions();
    }, [userId]);

    // Merge contribution counts with days array
    const daysWithCounts = useMemo(() => {
        return daysArray.map(day => ({
            ...day,
            count: contributions.get(day.date) || 0
        }));
    }, [daysArray, contributions]);

    // Organize days into weeks
    const weeks = useMemo(() => {
        const result: ContributionDay[][] = [];
        let currentWeek: ContributionDay[] = [];

        const firstDayOfWeek = daysWithCounts[0]?.dayOfWeek || 0;
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push({
                date: '',
                count: -1,
                dayOfWeek: i,
                month: -1,
                year: -1
            });
        }

        daysWithCounts.forEach(day => {
            currentWeek.push(day);
            if (day.dayOfWeek === 6) {
                result.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            result.push(currentWeek);
        }

        return result;
    }, [daysWithCounts]);

    // Get month labels
    const monthLabels = useMemo(() => {
        const labels: { month: string; weekIndex: number }[] = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        let lastMonth = -1;

        weeks.forEach((week, weekIndex) => {
            const firstValidDay = week.find(d => d.date !== '' && d.count !== -1);
            if (firstValidDay && firstValidDay.month !== lastMonth) {
                labels.push({
                    month: monthNames[firstValidDay.month],
                    weekIndex
                });
                lastMonth = firstValidDay.month;
            }
        });

        return labels;
    }, [weeks]);

    const getColorClass = (count: number): string => {
        if (count === -1) return 'invisible';
        if (count === 0) return 'bg-gray-100 dark:bg-zinc-800/80';
        if (count <= 2) return 'bg-lime-200 dark:bg-lime-950 dark:border dark:border-lime-900';
        if (count <= 5) return 'bg-lime-300 dark:bg-lime-700';
        if (count <= 9) return 'bg-lime-400 dark:bg-lime-500';
        return 'bg-lime-500 dark:bg-lime-300';
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleMouseEnter = (day: ContributionDay, event: React.MouseEvent) => {
        if (day.date && day.count !== -1) {
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
            setHoveredDay(day);
        }
    };

    const handleMouseLeave = () => {
        setHoveredDay(null);
    };

    const weekdayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    if (isLoading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-32 bg-gray-100 dark:bg-muted rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 transition-colors">
                <div className="min-w-max">
                    {/* Month labels */}
                    <div className="flex relative h-5 mb-2 pl-9">
                        {monthLabels.map((label, idx) => (
                            <div
                                key={idx}
                                className="absolute text-xs font-medium text-muted-foreground"
                                style={{
                                    left: `${36 + label.weekIndex * 14}px`,
                                }}
                            >
                                {label.month}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-1 relative">
                        {/* Weekday labels */}
                        <div className="flex flex-col gap-[3px] mr-2 text-xs font-medium text-muted-foreground w-7 pt-[2px]">
                            {weekdayLabels.map((day, idx) => (
                                <div
                                    key={day}
                                    className="h-[10px] flex items-center justify-end w-full leading-none"
                                    style={{ fontSize: '10px' }}
                                >
                                    {idx === 1 || idx === 3 || idx === 5 ? day : ''}
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="flex gap-[2px]">
                            {weeks.map((week, weekIdx) => (
                                <div key={weekIdx} className="flex flex-col gap-[2px]">
                                    {week.map((day, dayIdx) => (
                                        <div
                                            key={`${weekIdx}-${dayIdx}`}
                                            className={`w-[10px] h-[10px] rounded-[2px] transition-all cursor-pointer hover:ring-1 hover:ring-lime-500 hover:ring-offset-1 dark:hover:ring-offset-zinc-900 ${getColorClass(day.count)}`}
                                            onMouseEnter={(e) => handleMouseEnter(day, e)}
                                            onMouseLeave={handleMouseLeave}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {hoveredDay && (
                <div
                    className="fixed z-50 px-3 py-2 bg-zinc-900 dark:bg-zinc-800 text-white text-xs rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 border border-zinc-700"
                    style={{
                        left: tooltipPos.x,
                        top: tooltipPos.y
                    }}
                >
                    <div className="font-bold whitespace-nowrap">
                        {hoveredDay.count} kontribusi pada {formatDate(hoveredDay.date)}
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-zinc-900 dark:bg-zinc-800 border-r border-b border-zinc-700 transform rotate-45"></div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-2 flex items-center justify-end text-xs font-medium text-muted-foreground gap-2">
                <span>Sedikit</span>
                <div className="flex gap-[2px]">
                    <div className="w-[10px] h-[10px] bg-gray-100 dark:bg-zinc-800/80 rounded-[2px]"></div>
                    <div className="w-[10px] h-[10px] bg-lime-200 dark:bg-lime-950 dark:border dark:border-lime-900 rounded-[2px]"></div>
                    <div className="w-[10px] h-[10px] bg-lime-300 dark:bg-lime-700 rounded-[2px]"></div>
                    <div className="w-[10px] h-[10px] bg-lime-400 dark:bg-lime-500 rounded-[2px]"></div>
                    <div className="w-[10px] h-[10px] bg-lime-500 dark:bg-lime-300 rounded-[2px]"></div>
                </div>
                <span>Banyak</span>
            </div>
        </div>
    );
};
