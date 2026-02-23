import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Plus, MoreHorizontal,
    Search, Filter, Users, Zap, ShieldAlert, ChevronRight
} from 'lucide-react';
import { STATUSES, statusStyle, scoreColor, getInitials } from '../data/leads';
import { useLeads } from '../context/LeadContext';

export default function LeadManagement() {
    const navigate = useNavigate();
    const { leads, updateLead, currentUser, loading } = useLeads();

    if (currentUser.role !== 'Business Manager') return (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
            <div className="w-20 h-20 rounded-[32px] bg-coral/10 flex items-center justify-center text-coral shadow-2xl shadow-coral/10 border border-coral/20">
                <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white font-outfit">Governance Access Required</h1>
                <p className="text-zinc-500 mt-2 font-medium max-w-sm mx-auto">Pipeline management and multi-agent tracking are restricted to Business Manager roles only.</p>
            </div>
            <button onClick={() => navigate('/leads')} className="btn-primary h-12 px-8 flex items-center gap-2">
                Return to My Leads <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );

    const onDragStart = (e, id) => {
        e.dataTransfer.setData('leadId', id);
    };

    const onDrop = (e, newStatus) => {
        const id = Number(e.dataTransfer.getData('leadId'));
        updateLead(id, { status: newStatus });
    };

    const onDragOver = (e) => e.preventDefault();

    return (
        <div className="h-full flex flex-col p-8 gap-6 fade-in">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-outfit tracking-tight">Governance Pipeline</h1>
                    <p className="text-zinc-500 mt-1 font-medium">Real-time status tracking across entire lead portfolio</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-600 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-2">
                        <Users className="w-4 h-4" /> {leads.length} Records in motion
                    </span>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 flex gap-5 overflow-x-auto pb-4 custom-scrollbar">
                {STATUSES.map(status => {
                    const columnLeads = leads.filter(l => l.status === status);
                    const ss = statusStyle(status);

                    return (
                        <div key={status}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, status)}
                            className="flex flex-col w-[320px] shrink-0">

                            {/* Column Header */}
                            <div className="flex items-center justify-between px-3 py-4 mb-2 bg-jeton-gray rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${ss.dot}`} />
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">{status}</h3>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-lg">{columnLeads.length}</span>
                            </div>

                            {/* Column Body */}
                            <div className="flex-1 space-y-3 p-1 overflow-y-auto">
                                {columnLeads.map(lead => (
                                    <BoardCard
                                        key={lead.id}
                                        lead={lead}
                                        onDragStart={onDragStart}
                                        onClick={() => navigate(`/leads/${lead.id}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function BoardCard({ lead, onDragStart, onClick }) {
    const sc = scoreColor(lead.qualityScore);

    return (
        <div draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            onClick={onClick}
            className="card-jeton p-5 bg-jeton-gray border border-white/5 hover:border-jeton-orange/30 transition-all cursor-grab active:cursor-grabbing group">

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:bg-jeton-orange group-hover:text-white transition-colors">
                        {getInitials(lead.name)}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-jeton-orange transition-colors duration-200 truncate w-32">{lead.name}</h4>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight mt-0.5">{lead.model}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Quality</p>
                    <p className="text-xs font-bold" style={{ color: sc }}>{lead.qualityScore}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 border-2 border-jeton-gray flex items-center justify-center text-[8px] font-bold text-zinc-500 italic">
                        {getInitials(lead.assignedTo)}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{lead.source}</span>
                    {lead.qualityScore >= 85 && <Zap className="w-3.5 h-3.5 text-jeton-orange animate-pulse" />}
                </div>
            </div>
        </div>
    );
}
