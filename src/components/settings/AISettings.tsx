import { useEffect, useState } from 'react';
import { Sparkles, Info, Activity } from 'lucide-react';
import { openaiClient } from '../../services/ai/openaiClient';

export default function AISettings() {
    const [enabled] = useState(() => openaiClient.isEnabled());
    const [usage, setUsage] = useState(() => ({
        used: openaiClient.getRequestCount(),
        remaining: openaiClient.getRemainingRequests(),
    }));

    useEffect(() => {
        // Simple poll to update usage if it changes elsewhere
        const interval = setInterval(() => {
            setUsage({
                used: openaiClient.getRequestCount(),
                remaining: openaiClient.getRemainingRequests(),
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const percentage = Math.min(100, (usage.used / (usage.used + usage.remaining)) * 100);
    const color = percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Features
                </h2>
            </div>

            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                                AI Service Status
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {enabled ? 'Active & Ready' : 'Disabled (Check configuration)'}
                            </p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {enabled ? 'ENABLED' : 'DISABLED'}
                    </div>
                </div>

                {enabled && (
                    <div className="space-y-2 mt-6">
                        <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                            <span>Session API Usage</span>
                            <span>{usage.used} / {usage.used + usage.remaining} requests</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${color}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Limits reset locally when you refresh the page.
                        </p>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-3">
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">
                            What AI features are enabled?
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Smart Hint System (Gentle nudges to solutions)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Intelligent Code Review (Feedback on your solutions)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Learning Analytics (Insights into your progress)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
