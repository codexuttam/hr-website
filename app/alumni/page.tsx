'use client';
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Alumni Success Story Card Component
interface AlumniCardProps {
    name: string;
    batch: string;
    currentRole: string;
    company: string;
    image: string;
    achievement: string;
    linkedIn?: string;
}

const AlumniCard: React.FC<AlumniCardProps> = ({ name, batch, currentRole, company, image, achievement, linkedIn }) => (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700">
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-4xl font-bold text-indigo-600 dark:text-indigo-400 shadow-xl">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
            </div>
            <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {batch}
            </div>
        </div>
        <div className="p-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{name}</h3>
            <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{currentRole}</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{company}</p>
            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{achievement}"</p>
            </div>
            {linkedIn && (
                <a
                    href={linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    Connect on LinkedIn
                </a>
            )}
        </div>
    </div>
);

// Company Logo Component
interface CompanyLogoProps {
    name: string;
    count: number;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ name, count }) => (
    <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">{name.substring(0, 2)}</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white text-center">{name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{count} Alumni</p>
        </div>
    </div>
);

// Testimonial Component
interface TestimonialProps {
    quote: string;
    author: string;
    role: string;
    company: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role, company }) => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start mb-4">
            <svg className="w-10 h-10 text-indigo-500 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">{quote}</p>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="font-bold text-slate-900 dark:text-white">{author}</p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">{role}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{company}</p>
        </div>
    </div>
);

// Event Card Component
interface EventCardProps {
    title: string;
    date: string;
    time: string;
    location: string;
    type: 'online' | 'offline';
    description: string;
}

const EventCard: React.FC<EventCardProps> = ({ title, date, time, location, type, description }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold uppercase tracking-wide">{type}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${type === 'online' ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {type === 'online' ? '🌐 Virtual' : '📍 In-Person'}
                </span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <div className="flex items-center space-x-4 text-sm">
                <span>📅 {date}</span>
                <span>🕐 {time}</span>
            </div>
        </div>
        <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{location}</span>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Register Now
            </button>
        </div>
    </div>
);

// Main Alumni Page Component
export default function AlumniPage() {
    const [selectedBatch, setSelectedBatch] = useState<string>('all');

    const alumniStories: AlumniCardProps[] = [
        {
            name: "Priya Sharma",
            batch: "Batch 2020",
            currentRole: "Senior Software Engineer",
            company: "Google",
            image: "/alumni/priya.jpg",
            achievement: "Led the development of a critical feature that improved user engagement by 40%. Grateful for the strong foundation I received!",
            linkedIn: "#"
        },
        {
            name: "Rahul Verma",
            batch: "Batch 2019",
            currentRole: "Product Manager",
            company: "Microsoft",
            image: "/alumni/rahul.jpg",
            achievement: "Managing a team of 15+ engineers on Azure cloud services. The placement prep here was instrumental in my success.",
            linkedIn: "#"
        },
        {
            name: "Ananya Patel",
            batch: "Batch 2021",
            currentRole: "Data Scientist",
            company: "Amazon",
            image: "/alumni/ananya.jpg",
            achievement: "Working on ML models that power recommendation systems. The coding practice platform here gave me a huge advantage.",
            linkedIn: "#"
        },
        {
            name: "Vikram Singh",
            batch: "Batch 2018",
            currentRole: "Tech Lead",
            company: "Meta",
            image: "/alumni/vikram.jpg",
            achievement: "Leading Instagram's infrastructure team. The mock interviews and resume building tools were game-changers for me.",
            linkedIn: "#"
        },
        {
            name: "Sneha Reddy",
            batch: "Batch 2020",
            currentRole: "Full Stack Developer",
            company: "Netflix",
            image: "/alumni/sneha.jpg",
            achievement: "Contributing to the streaming platform used by millions. The comprehensive curriculum prepared me for real-world challenges.",
            linkedIn: "#"
        },
        {
            name: "Arjun Mehta",
            batch: "Batch 2019",
            currentRole: "DevOps Engineer",
            company: "Apple",
            image: "/alumni/arjun.jpg",
            achievement: "Optimizing cloud infrastructure for Apple services. The hands-on projects here built my confidence tremendously.",
            linkedIn: "#"
        }
    ];

    const companies: CompanyLogoProps[] = [
        { name: "Google", count: 45 },
        { name: "Microsoft", count: 38 },
        { name: "Amazon", count: 52 },
        { name: "Meta", count: 28 },
        { name: "Apple", count: 22 },
        { name: "Netflix", count: 15 },
        { name: "Adobe", count: 31 },
        { name: "Salesforce", count: 19 },
        { name: "Oracle", count: 27 },
        { name: "IBM", count: 33 },
        { name: "Intel", count: 18 },
        { name: "Cisco", count: 24 }
    ];

    const testimonials: TestimonialProps[] = [
        {
            quote: "The platform's AI-powered resume builder and mock interviews were instrumental in landing my dream job. The personalized feedback helped me improve significantly.",
            author: "Kavya Krishnan",
            role: "Software Engineer",
            company: "Google"
        },
        {
            quote: "From coding practice to placement preparation, everything I needed was in one place. The community support and mentorship made all the difference.",
            author: "Aditya Gupta",
            role: "Data Analyst",
            company: "Amazon"
        },
        {
            quote: "The ATS optimization tools helped my resume get noticed. Within weeks, I had multiple interview calls from top companies. Highly recommend!",
            author: "Meera Nair",
            role: "Product Designer",
            company: "Microsoft"
        }
    ];

    const events: EventCardProps[] = [
        {
            title: "Annual Alumni Reunion 2025",
            date: "March 15, 2025",
            time: "6:00 PM - 9:00 PM",
            location: "Grand Ballroom, City Center",
            type: "offline",
            description: "Join us for an evening of networking, nostalgia, and celebration. Reconnect with old friends and make new connections!"
        },
        {
            title: "Career Growth Webinar",
            date: "February 20, 2025",
            time: "7:00 PM - 8:30 PM",
            location: "Zoom Virtual Event",
            type: "online",
            description: "Learn from industry leaders about career advancement strategies, skill development, and navigating the tech industry."
        },
        {
            title: "Alumni Mentorship Program Launch",
            date: "January 30, 2025",
            time: "5:00 PM - 7:00 PM",
            location: "Campus Auditorium",
            type: "offline",
            description: "Be part of our new mentorship initiative. Share your experience and guide the next generation of students."
        }
    ];

    const stats = [
        { value: '5000+', label: 'Alumni Network', icon: '👥' },
        { value: '250+', label: 'Companies', icon: '🏢' },
        { value: '₹12L', label: 'Avg. Package', icon: '💰' },
        { value: '98%', label: 'Placement Rate', icon: '📈' }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
                <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20">
                    <div className="blur-[106px] h-56 bg-gradient-to-br from-indigo-600 to-purple-500"></div>
                    <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Alumni Network</span>
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                        Celebrating the success stories of our graduates who are making an impact across the globe.
                        Join a thriving community of professionals shaping the future of technology.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#success-stories"
                            className="w-full sm:w-auto inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            Explore Success Stories
                        </a>
                        <a
                            href="#get-involved"
                            className="w-full sm:w-auto inline-block bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400 font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            Join the Network
                        </a>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-5xl mb-2">{stat.icon}</div>
                                <p className="text-4xl lg:text-5xl font-extrabold text-white mb-2">{stat.value}</p>
                                <p className="text-lg text-indigo-100">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories Section */}
            <section id="success-stories" className="py-20 sm:py-24 bg-gray-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                            Alumni Success Stories
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                            Meet some of our outstanding alumni who are excelling in their careers at top tech companies worldwide.
                        </p>
                    </div>

                    {/* Batch Filter */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-800">
                            {['all', '2021', '2020', '2019', '2018'].map((batch) => (
                                <button
                                    key={batch}
                                    onClick={() => setSelectedBatch(batch)}
                                    className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${selectedBatch === batch
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {alumniStories.map((alumni, index) => (
                            <AlumniCard key={index} {...alumni} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Companies Section */}
            <section className="py-20 sm:py-24 bg-white dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                            Where Our Alumni Work
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                            Our graduates are making their mark at leading companies across the globe.
                        </p>
                    </div>
                    <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {companies.map((company, index) => (
                            <CompanyLogo key={index} {...company} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 sm:py-24 bg-gray-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                            What Alumni Say
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                            Hear from our alumni about their journey and how the platform helped them succeed.
                        </p>
                    </div>
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <Testimonial key={index} {...testimonial} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section className="py-20 sm:py-24 bg-white dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                            Upcoming Events
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                            Stay connected with exclusive alumni events, networking opportunities, and reunions.
                        </p>
                    </div>
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event, index) => (
                            <EventCard key={index} {...event} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Get Involved Section */}
            <section id="get-involved" className="py-20 sm:py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
                        Stay Connected with the Alumni Network
                    </h2>
                    <p className="text-xl text-indigo-100 mb-10">
                        Join our vibrant alumni community. Share your experiences, mentor students, and grow your professional network.
                    </p>
                    <div className="grid gap-6 md:grid-cols-3 mb-10">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                            <div className="text-4xl mb-3">🤝</div>
                            <h3 className="text-xl font-bold mb-2">Mentor Students</h3>
                            <p className="text-indigo-100">Guide the next generation with your expertise</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                            <div className="text-4xl mb-3">🌐</div>
                            <h3 className="text-xl font-bold mb-2">Network & Grow</h3>
                            <p className="text-indigo-100">Connect with fellow alumni worldwide</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                            <div className="text-4xl mb-3">📢</div>
                            <h3 className="text-xl font-bold mb-2">Share Your Story</h3>
                            <p className="text-indigo-100">Inspire others with your journey</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#"
                            className="inline-block bg-white text-indigo-600 font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            Register as Alumni
                        </a>
                        <a
                            href="#"
                            className="inline-block bg-transparent border-2 border-white text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:bg-white hover:text-indigo-600 transition-all duration-300"
                        >
                            Update Your Profile
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
