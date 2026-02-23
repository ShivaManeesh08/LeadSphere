import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Phone, Mail, Car, BadgeIndianRupee, Clock, Globe,
    PhoneCall, CalendarClock, MessageSquare, CheckCircle2, PenLine,
    Send, User, Zap, Lightbulb, Trash2, Shield, MoreHorizontal, Activity
} from 'lucide-react';
import { STATUSES, statusStyle, scoreColor, getInitials } from '../data/leads';
import { useLeads } from '../context/LeadContext';

const TL_CFG = {
    created: { icon: Zap, color: 'bg-jeton-orange/10 text-jeton-orange' },
    call: { icon: PhoneCall, color: 'bg-mint-light/10 text-mint-dark' },
    note: { icon: PenLine, color: 'bg-amber-light/10 text-amber' },
    status: { icon: CheckCircle2, color: 'bg-white/5 text-zinc-400' },
    email: { icon: Mail, color: 'bg-violet-light/10 text-violet' },
};

export default function LeadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { leads, updateLead, deleteLead, currentUser } = useLeads();
    const lead = leads.find(l => l.id === Number(id)) || (leads.length > 0 ? leads[0] : null);

    const [status, setStatus] = useState(lead?.status || 'New');
    const [noteText, setNoteText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!lead) return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-zinc-600 bg-jeton-black">
            <Zap className="w-12 h-12 mb-4 text-zinc-800" />
            <p className="font-bold uppercase tracking-widest text-xs">Record context lost or unavailable</p>
            <button onClick={() => navigate('/leads')} className="mt-6 btn-primary px-6 h-10 text-xs">Return to Leads</button>
        </div>
    );

    const isManager = currentUser.role === 'Business Manager';
    const ss = statusStyle(status);
    const sc = scoreColor(lead.qualityScore);

    const handleStatus = (v) => {
        setStatus(v);
        updateLead(lead.id, { status: v });
    };

    const handleDelete = () => {
        deleteLead(lead.id);
        navigate('/leads');
    };

    const recommendation = lead.qualityScore >= 80
        ? { action: `High-priority follow-up on ${lead.model}`, type: 'high' }
        : lead.qualityScore >= 50
            ? { action: `Schedule product demonstration`, type: 'medium' }
            : { action: 'Re-target with new arrivals brochure', type: 'low' };

    return (
        <div className="h-full overflow-auto p-8 bg-jeton-black fade-in space-y-8">

            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/leads')}
                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-jeton-orange font-bold uppercase tracking-widest transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Portfolio
                </button>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-xl bg-jeton-gray flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {isManager && (
                        <button onClick={() => setShowDeleteConfirm(true)}
                            className="bg-coral/10 text-coral hover:bg-coral hover:text-white h-10 px-4 rounded-xl text-xs font-bold uppercase transition-all">
                            Terminate Lead
                        </button>
                    )}
                </div>
            </div>

            {/* Main Profile Header */}
            <div className="flex items-start justify-between bg-jeton-gray p-8 rounded-[32px] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-jeton-orange/5 rounded-full -mr-32 -mt-32 blur-[80px]" />

                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-jeton-orange to-[#FFB800] flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-jeton-orange/30">
                        {getInitials(lead.name)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-white font-outfit tracking-tight">{lead.name}</h1>
                            {lead.isNew24h && (
                                <span className="bg-jeton-orange text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest animate-pulse">New</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tighter ${ss.bg}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} /> {status}
                            </span>
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                <Car className="w-4 h-4 text-jeton-orange" /> {lead.model}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">via {lead.source}</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 relative z-10">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Quality Score</p>
                    <div className="flex items-center gap-4">
                        <span className="text-5xl font-bold text-white font-outfit" style={{ color: sc }}>{lead.qualityScore}</span>
                        <div className="w-16 h-16 relative">
                            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#222" strokeWidth="4" />
                                <circle cx="18" cy="18" r="16" fill="none" stroke={sc} strokeWidth="4"
                                    strokeDasharray={`${lead.qualityScore} 100`} strokeLinecap="round" className="transition-all duration-1000" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-[1fr_380px] gap-8">

                {/* Left Content */}
                <div className="space-y-8">

                    {/* Info Matrix */}
                    <div className="bg-jeton-gray p-8 rounded-[32px] border border-white/5">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <User className="w-4 h-4 text-jeton-orange" /> Personal Profile
                        </h3>
                        <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                            <DetailItem icon={Phone} label="Contact Number" value={lead.phone} orange />
                            <DetailItem icon={Mail} label="Email Connection" value={lead.email} orange />
                            <DetailItem icon={BadgeIndianRupee} label="Expected Budget" value={lead.budget} />
                            <DetailItem icon={Clock} label="Window of Interest" value={lead.preferredTime} />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-jeton-gray p-8 rounded-[32px] border border-white/5">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Activity className="w-4 h-4 text-jeton-orange" /> Interaction Log
                        </h3>
                        <div className="relative border-l-2 border-zinc-800 ml-4 space-y-10">
                            {(lead.timeline || []).map((step, i) => {
                                const cfg = TL_CFG[step.type] || TL_CFG.status;
                                const Icon = cfg.icon;
                                return (
                                    <div key={i} className="ml-8 relative group">
                                        <div className={`absolute -left-[45px] top-0 w-8 h-8 rounded-xl ${cfg.color} flex items-center justify-center z-10 border-4 border-jeton-gray`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-white">{step.title}</p>
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{step.time}</p>
                                        </div>
                                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">{step.desc}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                                                {getInitials(step.user)}
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{step.user}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="space-y-6">

                    {/* Action Hub */}
                    <div className="bg-jeton-orange p-8 rounded-[32px] shadow-2xl shadow-jeton-orange/20">
                        <h3 className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mb-6">Strategic Recommendation</h3>
                        <div className="flex items-start gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
                                <Lightbulb className="w-6 h-6 text-jeton-orange" />
                            </div>
                            <p className="text-lg font-bold text-white leading-tight">
                                {recommendation.action}
                            </p>
                        </div>
                        <button className="w-full h-14 bg-white text-jeton-orange font-bold rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl">
                            Initiate Phase 2
                        </button>
                    </div>

                    {/* Owner assignment */}
                    <div className="bg-jeton-gray p-6 rounded-[32px] border border-white/5">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Portfolio Owner</p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-jeton-orange/10 flex items-center justify-center text-jeton-orange font-bold text-xs border border-jeton-orange/20">
                                {getInitials(lead.assignedTo)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{lead.assignedTo}</p>
                                <p className="text-[10px] font-bold text-jeton-orange uppercase tracking-widest mt-0.5">Assigned to {lead.assignedTo === currentUser.name ? 'You' : lead.assignedTo}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Controls */}
                    <div className="bg-jeton-gray p-6 rounded-[32px] border border-white/5 space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Update Stage</p>
                            <div className="grid grid-cols-1 gap-2">
                                {STATUSES.map(s => (
                                    <button key={s} onClick={() => handleStatus(s)}
                                        className={`h-11 rounded-xl text-xs font-bold uppercase transition-all flex items-center px-4 justify-between group
                      ${status === s ? 'bg-jeton-orange text-white shadow-lg shadow-jeton-orange/20' : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                                        {s}
                                        {status === s && <CheckCircle2 className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-jeton-dark rounded-[40px] border border-coral/20 w-full max-w-md p-10 text-center scale-in" onClick={e => e.stopPropagation()}>
                        <div className="w-20 h-20 rounded-3xl bg-coral/10 flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-10 h-10 text-coral" />
                        </div>
                        <h2 className="text-2xl font-bold text-white font-outfit mb-2">Confirm Termination</h2>
                        <p className="text-zinc-500 font-medium mb-10 leading-relaxed">This record will be permanently purged from the HSR Motors database. All activity logs will be lost.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-16 rounded-2xl text-white font-bold bg-white/5 hover:bg-white/10 transition-colors">Abort</button>
                            <button onClick={handleDelete} className="flex-1 h-16 rounded-2xl text-white font-bold bg-coral hover:bg-coral-dark shadow-xl shadow-coral/20 transition-all">Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailItem({ icon: Icon, label, value, orange }) {
    return (
        <div className="group">
            <p className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
                <Icon className={`w-3.5 h-3.5 ${orange ? 'text-jeton-orange' : 'text-zinc-700'}`} /> {label}
            </p>
            <p className={`text-lg font-bold tracking-tight transition-colors ${orange ? 'text-white hover:text-jeton-orange' : 'text-zinc-200'}`}>
                {value || 'Not Disclosed'}
            </p>
        </div>
    );
}
