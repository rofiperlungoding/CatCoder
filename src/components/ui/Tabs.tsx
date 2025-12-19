import React, { useRef, useState, useEffect } from 'react';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
        const activeButton = buttonRefs.current[activeIndex];

        if (activeButton && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const buttonRect = activeButton.getBoundingClientRect();

            setPillStyle({
                left: buttonRect.left - containerRect.left,
                width: buttonRect.width,
                opacity: 1
            });
        }
    }, [activeTab, tabs]);

    return (
        <div
            ref={containerRef}
            className={`relative flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-full w-fit border border-gray-200/50 dark:border-white/5 ${className}`}
        >
            {/* Sliding Pill */}
            <div
                className="absolute top-1 bottom-1 bg-white dark:bg-white/10 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none"
                style={{
                    left: pillStyle.left,
                    width: pillStyle.width,
                    opacity: pillStyle.opacity
                }}
            />

            {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        ref={el => { buttonRefs.current[index] = el; }}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:focus-visible:ring-white/20
                            ${isActive
                                ? 'text-primary dark:text-white'
                                : 'text-muted-foreground hover:text-primary dark:hover:text-white'
                            }
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
