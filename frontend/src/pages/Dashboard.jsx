import React, { useMemo } from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    Users, TrendingUp, CheckCircle, Clock,
    LayoutDashboard, Briefcase, Target, Zap,
    ArrowUpRight, ExternalLink, Lightbulb, Activity
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { scoreColor, statusStyle } from '../data/leads';

const tip = {
    contentStyle: { background: '#1E1E1E', border: '1px solid #333', borderRadius: '12px', fontSize: '12px', color: '#fff' },
    itemStyle: { color: '#FF5C00' },
    cursor: { stroke: '#FF5C00', strokeWidth: 1 }
};

export default function Dashboard() {
    const { leads, currentUser, activityLog, loading } = useLeads();

    const stats = useMemo(() => {
        const total = leads.length;
        const hot = leads.filter(l => l.qualityScore >= 80).length;
        const closed = leads.filter(l => l.status === 'Closed').length;
        const contacted = leads.filter(l => l.status === 'Contacted').length;

        const byStatus = [
            { name: 'New', value: leads.filter(l => l.status === 'New').length, color: '#333' },
            { name: 'Contacted', value: contacted, color: '#FF5C00' },
            { name: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length, color: '#10B981' },
            { name: 'Closed', value: closed, color: '#8B5CF6' },
        ].filter(s => s.value > 0);

        return { total, hot, closed, contacted, byStatus };
    }, [leads]);

    if (loading) return <div className="p-8 text-zinc-500 animate-pulse">Syncing personal performance dashboard...</div>;

    const isManager = currentUser.role === 'Business Manager';

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 fade-in">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-outfit tracking-tight">
                        {isManager ? 'Business Overview' : 'Sales Performance'}
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium">
                        {isManager ? 'Insights across all company lead channels' : `Personal performance tracking / ${currentUser.name}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-600 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Live Sync
                    </span>
                </div>
            </div>

            {/* Metrics */}
            <div className={`grid gap-4 ${isManager ? 'grid-cols-4' : 'grid-cols-2'}`}>
                <StatCard label={isManager ? "Total Portfolio" : "My Assigned Leads"} value={stats.total} icon={Briefcase} trend="+12%" />
                <StatCard label="High Quality Leads" value={stats.hot} icon={Zap} trend="+8%" orange />
                {isManager && <StatCard label="Team Conversion" value="24%" icon={Target} trend="+2%" />}
                {isManager && <StatCard label="Avg. Response" value="1.2 hrs" icon={Clock} trend="-15%" />}
                {!isManager && <StatCard label="Contacted Ratio" value={`${stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0}%`} icon={CheckCircle} />}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

                {/* Main Visual */}
                <div className="card-jeton p-6 bg-gradient-to-br from-jeton-gray to-jeton-black">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Leads Flow</h3>
                            <p className="text-lg font-bold text-white mt-1">Acquisition Velocity</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-jeton-orange" />
                                <span className="text-xs text-zinc-500 font-bold uppercase">Incoming</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={DUMMY_CHART} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF5C00" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF5C00" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11 }} />
                                <Tooltip {...tip} />
                                <Area type="monotone" dataKey="value" stroke="#FF5C00" strokeWidth={3} fillOpacity={1} fill="url(#colorO)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut */}
                <div className="card-jeton p-6 bg-jeton-gray">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Status Mix</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.byStatus}
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.byStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip {...tip} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-3">
                        {stats.byStatus.map((s, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-xs font-bold text-zinc-400">{s.name}</span>
                                </div>
                                <span className="text-sm font-bold text-white">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Personal Activity for Executives, Team Global for Managers */}
                <div className="card-jeton p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4" /> {isManager ? 'Team Live Feed' : 'Personal Activity'}
                        </h3>
                        {isManager && <button className="text-xs font-bold text-jeton-orange hover:underline">View All</button>}
                    </div>
                    <div className="space-y-4">
                        {activityLog.slice(0, 5).map((log, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                                    {log.avatar || log.user[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-300">
                                        <span className="font-bold text-white">{isManager ? log.user : 'You'}</span> {log.action}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-tighter">{log.time ? String(log.time).split('T')[1]?.slice(0, 5) ?? log.time : 'Recent'} · {log.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contextual Suggestions */}
                <div className="card-jeton p-6 bg-gradient-to-tr from-jeton-gray to-zinc-900 border-jeton-orange/10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-jeton-orange/20 flex items-center justify-center">
                            <Lightbulb className="w-4 h-4 text-jeton-orange" />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Growth Insights</h3>
                    </div>
                    <div className="space-y-4">
                        <InsightItem
                            title={isManager ? "Team Workload Alert" : "High Intent Follow-up"}
                            desc={isManager ? "Priya Mehta has 20% more active leads than average. Consider re-assignment." : "Rahul Sharma score increased to 92. Immediate touchpoint recommended."}
                        />
                        <InsightItem
                            title="Channel Optimization"
                            desc="Google Ads leads are converting 3x faster this week. Maintain current spend levels."
                        />
                        {!isManager && (
                            <div className="p-4 rounded-2xl bg-jeton-orange flex items-center justify-between shadow-lg shadow-jeton-orange/20 cursor-pointer hover:scale-[1.02] transition-transform">
                                <div>
                                    <p className="text-[10px] font-bold text-white/70 uppercase">Daily Goal</p>
                                    <p className="font-bold text-white">4/10 contacts made</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-bold">40%</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, trend, orange }) {
    return (
        <div className={`card-jeton p-6 ${orange ? 'bg-gradient-to-br from-jeton-gray to-[#2A1400] border-jeton-orange/20' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${orange ? 'bg-jeton-orange text-white' : 'bg-zinc-900 text-zinc-500'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 
            ${trend.startsWith('+') ? 'bg-mint-light text-mint-dark' : 'bg-coral-light text-coral'}`}>
                        {trend} {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : ''}
                    </span>
                )}
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-bold text-white font-outfit">{value}</p>
        </div>
    );
}

function InsightItem({ title, desc }) {
    return (
        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <p className="text-xs font-bold text-jeton-orange mb-1 uppercase tracking-tight">{title}</p>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}

const DUMMY_CHART = [
    { name: 'Mon', value: 34 }, { name: 'Tue', value: 45 }, { name: 'Wed', value: 30 },
    { name: 'Thu', value: 60 }, { name: 'Fri', value: 48 }, { name: 'Sat', value: 39 }, { name: 'Sun', value: 52 },
];
