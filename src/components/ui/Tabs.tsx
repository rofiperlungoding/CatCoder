import React from 'react';

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
    return (
        <div className={`flex p-1 bg-slate-100/80 rounded-xl w-fit ${className}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                            ${isActive
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
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
