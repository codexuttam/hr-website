import React from 'react';

interface StatItemProps {
  value: string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label }) => (
  <div className="relative group text-center p-8 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md rounded-3xl border border-black/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-neutral-900/60 transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-1000/5 to-gray-1000/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <p className="relative text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-black dark:text-white to-gray-1000 dark:from-gray-500 dark:to-gray-500 drop-shadow-sm">{value}</p>
    <p className="relative mt-3 text-lg font-medium text-gray-700 dark:text-gray-300">{label}</p>
  </div>
);

const Stats: React.FC = () => {
  const stats = [
    { value: '10K+', label: 'Students Helped' },
    { value: '500+', label: 'Companies Covered' },
    { value: '95%', label: 'Success Rate' },
    { value: '24/7', label: 'AI Support' },
  ];

  return (
    <section className="py-24 sm:py-32 relative bg-neutral-50 dark:bg-black/80 backdrop-blur-xl/50">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <StatItem key={index} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;