import React, { useState } from 'react';
import {
    Flame,
    Code2,
    BookOpen,
    MapPin,
    Settings,
    Edit2,
    Check
} from 'lucide-react';
import { Avatar, ProgressBar, Button } from '../../components/ui';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ContributionGraph } from '../../components/profile/ContributionGraph';
import { useUserStore, useProgressStore, useUIStore } from '../../stores';
import { calculateLevelProgress } from '../../lib/utils';

export const ProfilePage: React.FC = () => {
    const { user } = useUserStore();
    const { completedLessons, completedProblems } = useProgressStore();
    const { addToast } = useUIStore();
    const { updateEmail } = useUserStore();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

    if (!user) return null;

    const levelProgress = calculateLevelProgress(user.xp);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            addToast('success', 'Profile link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="space-y-8">
            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

            {/* Cover & Profile Header - Bento Style */}
            <div className="bg-white dark:bg-card rounded-[2.5rem] p-0 overflow-hidden shadow-sm border border-gray-100 dark:border-border">
                {/* Dark Minimalist Banner */}
                <div className="h-64 bg-zinc-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-lime-500/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

                    <Button variant="ghost" className="absolute top-8 right-8 text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2 h-auto transition-colors">
                        <Settings size={22} />
                    </Button>
                </div>

                <div className="px-10 pb-10 relative">
                    <div className="flex flex-col md:flex-row items-end gap-6 -mt-20">
                        {/* Avatar Container */}
                        <div className="p-2 bg-white dark:bg-card rounded-[2.5rem] shadow-xl shadow-black/5">
                            <Avatar
                                src={user.avatarUrl}
                                fallback={user.username[0]}
                                size="xl"
                                className="w-36 h-36 !rounded-[2rem] bg-gray-50 dark:bg-muted text-3xl font-bold text-slate-700 dark:text-slate-300"
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 mb-3">
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{user.username}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                                <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                    <MapPin size={16} /> Global
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                <span className="text-gray-500 dark:text-gray-400">Joined Dec 2024</span>
                                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-muted/50 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-border uppercase tracking-wide">
                                    Pro Member
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto mt-6 md:mt-0">
                            <Button
                                variant="secondary"
                                onClick={handleShare}
                                className="px-6 py-2.5 rounded-full border-gray-200 dark:border-border bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-muted text-gray-700 dark:text-white font-bold h-auto shadow-sm flex items-center gap-2"
                            >
                                {copied ? <Check size={16} className="text-lime-500" /> : null}
                                {copied ? 'Copied' : 'Share Profile'}
                            </Button>
                            <Button
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-6 py-2.5 rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold h-auto shadow-lg shadow-black/20 dark:shadow-white/5 flex items-center gap-2"
                            >
                                <Edit2 size={16} />
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col: Stats */}
                <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-border h-full flex flex-col gap-8">
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-lg font-bold text-primary dark:text-white">Level {user.level}</span>
                            <span className="text-xs font-bold text-lime-600 bg-lime-50 dark:bg-lime-900/30 dark:text-lime-400 px-2 py-1 rounded-full">{levelProgress.current} XP / {levelProgress.required} XP</span>
                        </div>
                        <ProgressBar value={levelProgress.percentage} max={100} size="md" className="h-3" />
                        <p className="text-xs text-muted-foreground mt-3 font-medium">
                            {levelProgress.required - levelProgress.current} XP needed for Level {user.level + 1}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-5 bg-gray-50 dark:bg-muted/50 rounded-[1.5rem] flex items-center justify-between group hover:bg-gray-100/80 dark:hover:bg-muted transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white dark:bg-card rounded-xl shadow-sm text-primary dark:text-white group-hover:scale-110 transition-transform"><Code2 size={20} /></div>
                                <span className="text-sm font-bold text-muted-foreground">Problems</span>
                            </div>
                            <span className="font-bold text-xl text-primary dark:text-white">{completedProblems.size}</span>
                        </div>
                        <div className="p-5 bg-gray-50 dark:bg-muted/50 rounded-[1.5rem] flex items-center justify-between group hover:bg-gray-100/80 dark:hover:bg-muted transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white dark:bg-card rounded-xl shadow-sm text-lime-600 dark:text-lime-400 group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
                                <span className="text-sm font-bold text-muted-foreground">Lessons</span>
                            </div>
                            <span className="font-bold text-xl text-primary dark:text-white">{completedLessons.size}</span>
                        </div>
                        <div className="p-5 bg-gray-50 dark:bg-muted/50 rounded-[1.5rem] flex items-center justify-between group hover:bg-gray-100/80 dark:hover:bg-muted transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white dark:bg-card rounded-xl shadow-sm text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform"><Flame size={20} /></div>
                                <span className="text-sm font-bold text-muted-foreground">Streak</span>
                            </div>
                            <span className="font-bold text-xl text-primary dark:text-white">{user.streakCurrent} days</span>
                        </div>
                    </div>
                </div>

                {/* Right Col: Activity Graph */}
                <div className="md:col-span-2 bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-border h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-primary dark:text-white">Contribution Graph</h3>
                        <div className="text-sm text-muted-foreground font-medium">Last 12 Months</div>
                    </div>

                    <ContributionGraph className="flex-1 flex flex-col justify-center" />
                </div>
            </div>

            {/* Account Settings Section */}
            <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-border">
                <h3 className="font-bold text-lg text-primary dark:text-white mb-6">Account Settings</h3>

                <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground">Change Email Address</label>
                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="new.email@example.com"
                                className="flex-1 bg-gray-50 dark:bg-muted/50 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                            />
                            <Button
                                onClick={async () => {
                                    if (!newEmail) return;
                                    setIsUpdatingEmail(true);
                                    await updateEmail(newEmail);
                                    setIsUpdatingEmail(false);
                                    setNewEmail('');
                                }}
                                disabled={isUpdatingEmail || !newEmail}
                                className="whitespace-nowrap"
                            >
                                {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You will receive a confirmation link at your new email address.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
