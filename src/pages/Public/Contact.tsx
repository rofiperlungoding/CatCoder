import React, { useState } from 'react';
import {
    Mail,
    MapPin,
    Phone,
    Send
} from 'lucide-react';
import { Button, Input } from '../../components/ui';

export const ContactPage: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-xl shadow-black/20 overflow-hidden flex flex-col lg:flex-row animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards">
                {/* Info Side */}
                <div className="bg-[#050505] text-white p-12 lg:p-24 lg:w-2/5 flex flex-col justify-between relative overflow-hidden border-r border-white/5">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="relative z-10 space-y-12">
                        <div>
                            <h1 className="text-4xl font-bold mb-6">Get in touch</h1>
                            <p className="text-gray-400 text-lg">
                                Have questions about our courses, pricing, or platform? We're here to help.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Email</h3>
                                    <p className="text-gray-400">hello@catcoder.com</p>
                                    <p className="text-gray-400">support@catcoder.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Phone</h3>
                                    <p className="text-gray-400">+1 (555) 123-4567</p>
                                    <p className="text-gray-400">Mon-Fri 9am-6pm EST</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Office</h3>
                                    <p className="text-gray-400">123 Tech Boulevard</p>
                                    <p className="text-gray-400">San Francisco, CA 94105</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 bg-white/5 rounded-2xl p-6 border border-white/10">
                        <p className="text-sm font-medium text-gray-300 italic">
                            "The support team at CatCoder is phenomenal. They resolved my issue in minutes!"
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-lime-400"></div>
                            <div className="text-xs">
                                <p className="font-bold">Sarah Jenkins</p>
                                <p className="text-gray-500">Full Stack Developer</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-12 lg:p-24 lg:w-3/5 bg-[#0a0a0a]">
                    <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto lg:mx-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">First Name</label>
                                <Input placeholder="John" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:bg-white/10" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">Last Name</label>
                                <Input placeholder="Doe" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:bg-white/10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 ml-1">Email Address</label>
                            <Input type="email" placeholder="john@example.com" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:bg-white/10" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 ml-1">Subject</label>
                            <select className="w-full px-4 py-3 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-lime-500/20 [&>option]:bg-black">
                                <option>General Inquiry</option>
                                <option>Support</option>
                                <option>Billing</option>
                                <option>Partnership</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 ml-1">Message</label>
                            <textarea
                                rows={4}
                                placeholder="How can we help you?"
                                className="w-full px-6 py-4 rounded-[2rem] bg-white/5 border border-white/10 text-sm focus:outline-none focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-lime-500/20 text-white placeholder:text-gray-600 resize-none font-sans"
                            ></textarea>
                        </div>

                        <Button
                            className={`w-full h-12 rounded-full text-base transition-all duration-300 ${submitted ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-lime-400 text-black hover:bg-lime-300'}`}
                            disabled={submitted}
                        >
                            {submitted ? (
                                <span className="flex items-center gap-2">Message Sent! <Send size={18} /></span>
                            ) : (
                                "Send Message"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
