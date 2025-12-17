import React from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Star, ArrowRight, X } from 'lucide-react';
import { useUIStore } from '../../stores';
import { Button } from './index';

export const LevelUpModal: React.FC = () => {
    const { levelUpModal, hideLevelUp } = useUIStore();

    if (!levelUpModal) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Confetti Background Effect (CSS only for now) */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-amber-50 opacity-50"></div>

                {/* Close Button */}
                <button
                    onClick={hideLevelUp}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-20"
                >
                    <X size={20} className="text-slate-400" />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center p-8 pt-12">
                    {/* Icon */}
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-100 ring-8 ring-white">
                        <Trophy size={48} className="text-amber-500 fill-amber-300" />
                    </div>

                    {/* Content */}
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Level Up!</h2>
                    <p className="text-slate-500 mb-8 max-w-xs">
                        Congratulations! You've reached <span className="font-bold text-indigo-600">Level {levelUpModal.level}</span>. Keep coding to unlock more rewards.
                    </p>

                    {/* Rewards Preview */}
                    <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 mb-8 shadow-sm">
                        <div className="flex items-center gap-3 text-left">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Star size={20} className="fill-indigo-200" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">New Tier Unlocked</p>
                                <p className="text-xs text-slate-400">Access Tier {Math.min(5, Math.ceil(levelUpModal.level / 5))} problems</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        fullWidth
                        onClick={hideLevelUp}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                    >
                        Continue Learning <ArrowRight size={18} />
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
