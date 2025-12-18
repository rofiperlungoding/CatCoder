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
            <div className="bg-background rounded-[3rem] shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/60">
                {/* Confetti Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-lime-50/50 via-white to-white opacity-50"></div>

                {/* Close Button */}
                <button
                    onClick={hideLevelUp}
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
                >
                    <X size={20} className="text-muted-foreground" />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center p-10 pt-14">
                    {/* Icon */}
                    <div className="w-28 h-28 bg-lime-100 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-lime-100/50 ring-8 ring-white">
                        <Trophy size={56} className="text-lime-600 fill-lime-300" />
                    </div>

                    {/* Content */}
                    <h2 className="text-3xl font-bold text-primary mb-3">Level Up!</h2>
                    <p className="text-muted-foreground mb-10 max-w-xs">
                        Congratulations! You've reached <span className="font-bold text-primary">Level {levelUpModal.level}</span>. Keep coding to unlock more rewards.
                    </p>

                    {/* Rewards Preview */}
                    <div className="w-full bg-white border border-gray-100 rounded-[2rem] p-5 mb-8 shadow-sm">
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 bg-lime-50 rounded-full text-lime-600">
                                <Star size={24} className="fill-lime-200" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-primary">New Tier Unlocked</p>
                                <p className="text-xs text-muted-foreground">Access Tier {Math.min(5, Math.ceil(levelUpModal.level / 5))} problems</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        fullWidth
                        onClick={hideLevelUp}
                        className="bg-primary hover:bg-black/90 text-white shadow-xl shadow-black/10 rounded-full"
                    >
                        Continue Learning <ArrowRight size={18} />
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
