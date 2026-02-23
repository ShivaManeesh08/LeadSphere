import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Plus, SlidersHorizontal, RotateCcw, ChevronDown, Eye, Zap,
    Phone, Mail, Target, Trash2, ArrowRightCircle,
    Download, CheckSquare, Square, X, Search, Filter
} from 'lucide-react';
import { STATUSES, SOURCES, TEAM, PRIORITIES, statusStyle, priorityStyle, scoreColor, getInitials } from '../data/leads';
import { useLeads } from '../context/LeadContext';

const ALL = 'All';

export default function LeadListing() {
    const navigate = useNavigate();
    const [sp] = useSearchParams();
    const q = (sp.get('q') || '').toLowerCase();
    const { leads, currentUser, addLead, bulkDelete, bulkStatusUpdate, loading } = useLeads();

    const [fStatus, setFStatus] = useState(ALL);
    const [fSource, setFSource] = useState(ALL);
    const [fPriority, setFPriority] = useState(ALL);
    const [modal, setModal] = useState(false);
    const [selected, setSelected] = useState([]);
    const [bulkAction, setBulkAction] = useState(null);
    const [sortBy, setSortBy] = useState('qualityScore');
    const [sortDir, setSortDir] = useState('desc');

    const isManager = currentUser.role === 'Business Manager';
    const hotCount = leads.filter(l => l.qualityScore >= 80).length;

    const rows = useMemo(() => {
        let result = leads.filter(l => {
            const mq = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q) || l.model.toLowerCase().includes(q);
            return mq
                && (fStatus === ALL || l.status === fStatus)
                && (fSource === ALL || l.source === fSource)
                && (fPriority === ALL || l.priority === fPriority);
        });

        result.sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            if (sortBy === 'qualityScore') return (a.qualityScore - b.qualityScore) * dir;
            if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
            if (sortBy === 'createdAt') return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
            return 0;
        });

        return result;
    }, [leads, q, fStatus, fSource, fPriority, sortBy, sortDir]);

    const reset = () => { setFStatus(ALL); setFSource(ALL); setFPriority(ALL); };
    const dirty = fStatus !== ALL || fSource !== ALL || fPriority !== ALL;

    const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    const toggleAll = () => setSelected(selected.length === rows.length ? [] : rows.map(r => r.id));

    const handleBulkDelete = () => {
        bulkDelete(selected);
        setSelected([]);
    };

    const handleBulkStatus = (status) => {
        bulkStatusUpdate(selected, status);
        setSelected([]);
        setBulkAction(null);
    };

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    return (
        <div className="h-full flex flex-col p-8 gap-6 fade-in">

            {/* Header */}
            <div className="flex items-start justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white font-outfit tracking-tight">
                        {isManager ? 'Leads Portfolio' : 'My Personal Pipeline'}
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium">Manage and optimize follow-up sequences</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-jeton-gray border border-white/5 text-sm">
                        <Zap className="w-4 h-4 text-jeton-orange" />
                        <span className="font-bold text-zinc-300">Hot Prospects:</span>
                        <span className="font-bold text-white">{hotCount}</span>
                    </div>

                    <button onClick={() => setModal(true)}
                        className="btn-primary h-11 px-6 flex items-center gap-3 text-sm">
                        <Plus className="w-4 h-4" /> Add Lead
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="h-10 px-4 bg-jeton-gray border border-white/5 rounded-xl flex items-center gap-2.5 text-zinc-400">
                    <Filter className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest mr-2">Filters</span>
                    <Sel label="Status" val={fStatus} set={setFStatus} opts={[ALL, ...STATUSES]} />
                    <Sel label="Source" val={fSource} set={setFSource} opts={[ALL, ...SOURCES]} />
                    <Sel label="Priority" val={fPriority} set={setFPriority} opts={[ALL, ...PRIORITIES]} />
                    {dirty && (
                        <button onClick={reset} className="text-jeton-orange hover:text-white transition-colors">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Bulk actions */}
                {selected.length > 0 && (
                    <div className="flex items-center gap-3 animate-in slide-in-from-left duration-200">
                        <span className="text-xs font-bold text-jeton-orange pl-2">{selected.length} selected</span>
                        <div className="relative">
                            <button onClick={() => setBulkAction(bulkAction ? null : 'status')}
                                className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-jeton-gray border border-white/10 hover:border-jeton-orange/30 transition-all flex items-center gap-2">
                                <ArrowRightCircle className="w-4 h-4" /> Move Stage <ChevronDown className="w-3 h-3" />
                            </button>
                            {bulkAction === 'status' && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setBulkAction(null)} />
                                    <div className="absolute top-full mt-2 left-0 bg-jeton-gray border border-white/5 rounded-2xl shadow-2xl z-50 py-2 w-48 overflow-hidden">
                                        {STATUSES.map(s => (
                                            <button key={s} onClick={() => handleBulkStatus(s)}
                                                className="w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:bg-jeton-orange hover:text-white transition-colors font-bold uppercase tracking-tighter">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <button onClick={handleBulkDelete}
                            className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-coral/20 border border-coral/30 hover:bg-coral hover:border-transparent transition-all flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                )}

                {!loading && <span className="ml-auto text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{rows.length} total entries</span>}
            </div>

            {/* Table Container */}
            <div className="flex-1 card-jeton overflow-hidden flex flex-col min-h-0">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-zinc-900/30">
                                <th className="px-6 py-4 w-12">
                                    <button onClick={toggleAll} className="text-zinc-600 hover:text-jeton-orange">
                                        {selected.length === rows.length && rows.length > 0 ? <CheckSquare className="w-5 h-5 text-jeton-orange" /> : <Square className="w-5 h-5" />}
                                    </button>
                                </th>
                                <Th label="Lead Name" sort="name" cur={sortBy} dir={sortDir} onSort={handleSort} />
                                <Th label="Quality" sort="qualityScore" cur={sortBy} dir={sortDir} onSort={handleSort} />
                                <th className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-6 py-4">Contact Detail</th>
                                <th className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-6 py-4">Source</th>
                                <th className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-6 py-4">Stage</th>
                                {isManager && <th className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-6 py-4">Assigned To</th>}
                                <th className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-6 py-4">Priority</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rows.map((lead) => {
                                const ss = statusStyle(lead.status);
                                const sc = scoreColor(lead.qualityScore);
                                const isSel = selected.includes(lead.id);
                                return (
                                    <tr key={lead.id}
                                        className={`group hover:bg-white/[0.02] transition-colors duration-150 cursor-pointer ${isSel ? 'bg-jeton-orange/[0.03]' : ''}`}
                                        onClick={() => navigate(`/leads/${lead.id}`)}>
                                        <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id); }}>
                                            <button className="text-zinc-700 hover:text-jeton-orange group-hover:text-zinc-500">
                                                {isSel ? <CheckSquare className="w-5 h-5 text-jeton-orange" /> : <Square className="w-5 h-5" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:bg-jeton-orange group-hover:text-white transition-colors duration-300">
                                                    {getInitials(lead.name)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-jeton-orange transition-colors">{lead.name}</p>
                                                    <p className="text-xs text-zinc-500 mt-1">{lead.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-jeton-orange rounded-full transition-all duration-1000" style={{ width: `${lead.qualityScore}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-white">{lead.qualityScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 font-medium">{lead.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-zinc-500 border border-white/10 px-2 py-1 rounded-lg uppercase tracking-tighter">{lead.source}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tighter ${ss.bg}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                                {lead.status}
                                            </span>
                                        </td>
                                        {isManager && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 italic">
                                                        {getInitials(lead.assignedTo)}
                                                    </div>
                                                    <span className="text-xs font-bold text-zinc-400">{lead.assignedTo}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest ${priorityStyle(lead.priority)}`}>
                                                {lead.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-jeton-orange hover:bg-jeton-orange/10 transition-all opacity-0 group-hover:opacity-100">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {rows.length === 0 && !loading && (
                                <tr><td colSpan={10} className="px-6 py-20 text-center text-zinc-600 font-medium">No records found matching your current context.</td></tr>
                            )}
                            {loading && (
                                <tr><td colSpan={10} className="px-6 py-20 text-center text-jeton-orange animate-pulse font-bold tracking-widest">SYNCING DATABASE...</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && <AddModal close={() => setModal(false)} onAdd={addLead} />}
        </div>
    );
}

function Th({ label, sort, cur, dir, onSort }) {
    const active = cur === sort;
    return (
        <th className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-6 py-4 cursor-pointer hover:text-white transition-colors"
            onClick={() => onSort(sort)}>
            <div className="flex items-center gap-2">
                {label}
                {active && <span className="text-jeton-orange">{dir === 'asc' ? '↑' : '↓'}</span>}
            </div>
        </th>
    );
}

function Sel({ label, val, set, opts }) {
    return (
        <div className="relative group">
            <select value={val} onChange={e => set(e.target.value)}
                className="h-8 pl-0 pr-6 text-[11px] font-bold text-white bg-transparent outline-none cursor-pointer appearance-none group-hover:text-jeton-orange transition-colors">
                {opts.map(o => <option key={o} value={o} className="bg-jeton-gray">{o === ALL ? `${label}` : o}</option>)}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 group-hover:text-jeton-orange transition-colors pointer-events-none" />
        </div>
    );
}

function AddModal({ close, onAdd }) {
    const [form, setForm] = useState({ name: '', phone: '', email: '', model: '', budget: '', source: 'Website', priority: 'Warm' });

    const handleSubmit = () => {
        if (!form.name.trim() || !form.phone.trim()) return;
        onAdd(form);
        close();
    };

    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={close}>
            <div className="bg-jeton-dark rounded-[32px] border border-white/5 w-full max-w-xl p-10 fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-outfit">Capture New Lead</h2>
                        <p className="text-zinc-500 mt-1 font-medium">System will auto-calculate quality score and assign owner.</p>
                    </div>
                    <button onClick={close} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Field label="Full Name *" val={form.name} set={v => update('name', v)} placeholder="John Doe" colSpan />
                    <Field label="Phone Number *" val={form.phone} set={v => update('phone', v)} placeholder="+91 XXXXX XXXXX" />
                    <Field label="Email Address" val={form.email} set={v => update('email', v)} placeholder="john@example.com" />
                    <Field label="Interested Car Model" val={form.model} set={v => update('model', v)} placeholder="e.g. Defender 110" />
                    <Field label="Budget Range" val={form.budget} set={v => update('budget', v)} placeholder="e.g. ₹15L - ₹20L" />
                </div>

                <div className="flex gap-4 mt-12">
                    <button onClick={close} className="flex-1 h-14 rounded-2xl text-white font-bold hover:bg-white/5 transition-colors border border-white/10">Discard</button>
                    <button onClick={handleSubmit} className="flex-1 btn-primary h-14">Confirm Record</button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, val, set, placeholder, colSpan }) {
    return (
        <div className={colSpan ? 'col-span-2' : ''}>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{label}</label>
            <input type="text" value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                className="w-full h-12 bg-zinc-900 border border-white/5 rounded-xl px-4 text-sm text-white outline-none focus:border-jeton-orange/40 transition-all placeholder:text-zinc-700" />
        </div>
    );
}
