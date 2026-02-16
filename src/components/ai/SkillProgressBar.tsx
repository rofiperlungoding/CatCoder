interface SkillProgressBarProps {
    skill: string;
    proficiency: number; // 0-100
    challenges: number;
}

export default function SkillProgressBar({ skill, proficiency, challenges }: SkillProgressBarProps) {
    const getBgColor = (p: number) => {
        if (p >= 80) return 'bg-green-500';
        if (p >= 60) return 'bg-blue-500';
        if (p >= 40) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const bgClass = getBgColor(proficiency);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-300">{skill}</span>
                <span className="text-gray-500 text-xs bg-white/5 px-2 py-0.5 rounded-full">{challenges} challenges</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                    className={`h-full rounded-full ${bgClass} shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                    style={{ width: `${proficiency}%` }}
                />
            </div>
            <div className="text-right text-xs font-semibold text-gray-500">
                {Math.round(proficiency)}%
            </div>
        </div>
    );
}
