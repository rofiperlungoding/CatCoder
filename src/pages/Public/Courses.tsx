import React, { useState } from 'react';
import {
    Search,
    Code,
    Terminal,
    Cpu,
    ArrowRight,
    Clock,
    BarChart,
    Star
} from 'lucide-react';
import { Badge, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

export const CoursesPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const courses = [
        {
            id: 'python',
            title: "Python Mastery",
            description: "From scripts to systems. Learn the most versatile language in the world. Perfect for data science, web dev, and automation.",
            icon: <Code size={32} />,
            level: "Beginner Friendly",
            duration: "40 Hours",
            rating: 4.9,
            students: "125k+",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            tags: ["Data Science", "Web Dev", "Scripting"]
        },
        {
            id: 'javascript',
            title: "Modern JavaScript",
            description: "Build the web. Master the language of the browser, from DOM manipulation to React and Node.js.",
            icon: <Terminal size={32} />,
            level: "Intermediate",
            duration: "55 Hours",
            rating: 4.8,
            students: "200k+",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            tags: ["Frontend", "Backend", "Fullstack"]
        },
        {
            id: 'cpp',
            title: "System C++",
            description: "Get close to the metal. Learn memory management, pointers, and high-performance computing.",
            icon: <Cpu size={32} />,
            level: "Advanced",
            duration: "60 Hours",
            rating: 4.7,
            students: "50k+",
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            tags: ["Systems", "Game Dev", "Performance"]
        }
    ];

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pt-32 pb-20 space-y-16 px-6 md:px-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
                <Badge className="bg-lime-500/10 text-lime-400 hover:bg-lime-500/20 border-lime-500/20">Catalog</Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards">
                    Explore our <span className="text-lime-400">Curriculum</span>.
                </h1>
                <p className="text-xl text-gray-400 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards">
                    Expertly crafted courses to take you from hello world to hero.
                </p>

                {/* Search Bar */}
                <div className="relative max-w-lg mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search for a skill or language..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-full border border-white/10 bg-white/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500/50 transition-all text-white placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="bg-[#0a0a0a] rounded-[2.5rem] p-8 border border-white/5 shadow-sm hover:border-white/10 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${course.bg} ${course.color} bg-opacity-50 border border-white/5`}>
                                {course.icon}
                            </div>
                            <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-gray-400 border border-white/5">
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                <span>{course.rating}</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3">{course.title}</h3>
                        <p className="text-gray-400 mb-6 line-clamp-3 text-sm leading-relaxed">
                            {course.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {course.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/5 text-gray-400 text-xs font-semibold rounded-full border border-white/5">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto space-y-6">
                            <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <BarChart size={14} />
                                    <span>{course.level}</span>
                                </div>
                            </div>

                            <Button className="w-full rounded-full group bg-lime-400 text-black hover:bg-lime-300" onClick={() => navigate('/learn')}>
                                Start Learning <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
