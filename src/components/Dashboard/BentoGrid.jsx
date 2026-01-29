import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Video, Database } from 'lucide-react';

const BentoGrid = () => {
    const [stats, setStats] = useState([
        { title: 'Total Videos', value: 'Loading...', icon: Video, color: 'text-cyan-400', bg: 'bg-cyan-950/30' },
        { title: 'Active Users', value: 'Loading...', icon: Users, color: 'text-purple-400', bg: 'bg-purple-950/30' },
        { title: 'Storage Used', value: '2.4 TB', icon: Database, color: 'text-blue-400', bg: 'bg-blue-950/30' },
        { title: 'System Health', value: '100%', icon: Activity, color: 'text-green-400', bg: 'bg-green-950/30' },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch videos count
                const vidRes = await fetch('/api/videos');
                const vidData = await vidRes.json();
                const videoCount = vidData.videos ? vidData.videos.length : (vidData.length || 0);

                // Try fetching users (might fail if not admin, so fallback)
                let userCount = '---';
                try {
                    const userRes = await fetch('/api/users');
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        userCount = userData.users ? userData.users.length : (userData.length || 0);
                    } else {
                        userCount = 'Admin Only';
                    }
                } catch (e) { console.error(e); }

                setStats([
                    { title: 'Total Videos', value: videoCount.toString(), icon: Video, color: 'text-cyan-400', bg: 'bg-cyan-950/30' },
                    { title: 'Active Users', value: userCount.toString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-950/30' },
                    { title: 'Storage Used', value: '2.4 TB', icon: Database, color: 'text-blue-400', bg: 'bg-blue-950/30' },
                    { title: 'System Health', value: '100%', icon: Activity, color: 'text-green-400', bg: 'bg-green-950/30' },
                ]);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container mx-auto px-4 -mt-20 relative z-20 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-[#161b22]/80 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:border-cyan-500/30 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.statColor || stat.color}`} />
                            </div>
                            <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">+12%</span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-3xl font-bold text-white tracking-tight group-hover:text-cyan-50 transition-colors">
                            {stat.value}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default BentoGrid;
