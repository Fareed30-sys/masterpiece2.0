import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SentimentBadge from '../components/SentimentBadge';
import ChurnBadge from '../components/ChurnBadge';
import CategoryBadge from '../components/CategoryBadge';
import {
  Inbox,
  Sparkles,
  Send,
  User,
  Shield,
  Filter,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Flame,
  ChevronDown,
} from 'lucide-react';

export const AgentInbox = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Draft reply & Tone
  const [draftReply, setDraftReply] = useState('');
  const [selectedTone, setSelectedTone] = useState('Empathetic');
  const [regeneratingDraft, setRegeneratingDraft] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [threadSummary, setThreadSummary] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, urgencyFilter, categoryFilter, searchQuery]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (urgencyFilter !== 'all') params.urgency = urgencyFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (searchQuery.trim()) params.search = searchQuery;

      const res = await api.get('/tickets', { params });
      setTickets(res.data.tickets || []);

      if (res.data.tickets?.length > 0) {
        // If current selected ticket still exists in list, update it, else pick first
        if (selectedTicket) {
          const found = res.data.tickets.find((t) => t._id === selectedTicket._id);
          setSelectedTicket(found || res.data.tickets[0]);
          if (found) {
            setDraftReply(found.aiAnalysis?.suggestedReply || '');
            setThreadSummary(found.aiAnalysis?.summary || '');
          }
        } else {
          setSelectedTicket(res.data.tickets[0]);
          setDraftReply(res.data.tickets[0].aiAnalysis?.suggestedReply || '');
          setThreadSummary(res.data.tickets[0].aiAnalysis?.summary || '');
        }
      } else {
        setSelectedTicket(null);
        setDraftReply('');
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = (t) => {
    setSelectedTicket(t);
    setDraftReply(t.aiAnalysis?.suggestedReply || '');
    setThreadSummary(t.aiAnalysis?.summary || '');
  };

  const handleRegenerateDraft = async (tone) => {
    if (!selectedTicket) return;
    const toneToUse = tone || selectedTone;
    setRegeneratingDraft(true);

    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/regenerate-draft`, {
        tone: toneToUse,
      });
      setDraftReply(res.data.suggestedReply);
      setSelectedTone(toneToUse);

      // Update selected ticket in place
      setSelectedTicket((prev) => ({
        ...prev,
        aiAnalysis: {
          ...prev.aiAnalysis,
          suggestedReply: res.data.suggestedReply,
        },
      }));
    } catch (err) {
      alert('Failed to regenerate AI draft');
    } finally {
      setRegeneratingDraft(false);
    }
  };

  const handleSummarizeThread = async () => {
    if (!selectedTicket) return;
    setSummarizing(true);
    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/summarize`);
      setThreadSummary(res.data.summary);
      setSelectedTicket((prev) => ({
        ...prev,
        aiAnalysis: {
          ...prev.aiAnalysis,
          summary: res.data.summary,
        },
      }));
    } catch (err) {
      alert('Failed to summarize thread');
    } finally {
      setSummarizing(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !draftReply.trim()) return;
    setSendingReply(true);

    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/messages`, {
        text: draftReply,
        sender: 'agent',
      });
      setSelectedTicket(res.data.ticket);
      setDraftReply('');
      fetchTickets();
    } catch (err) {
      alert('Failed to send reply to customer');
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const res = await api.patch(`/tickets/${selectedTicket._id}`, {
        status: newStatus,
      });
      setSelectedTicket(res.data.ticket);
      fetchTickets();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const tonesList = ['Empathetic', 'Concise', 'Formal', 'Apologetic + Offer Discount'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">Agent Copilot Inbox</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              AI Triage & Tone Drafting
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized by Customer Urgency & Churn Probability (Gemini 2.5 Flash)
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets, customers, IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56 sm:w-64"
            />
          </div>
          <button
            onClick={fetchTickets}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
            title="Refresh tickets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 shrink-0 font-medium">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </div>

        {/* Churn Risk / Urgency */}
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">Urgency / Churn: All</option>
          <option value="High">🔥 High Churn Risk</option>
          <option value="Medium">⚠️ Medium Risk</option>
          <option value="Low">🛡️ Low Risk</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">Status: All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">Category: All</option>
          <option value="Billing">Billing</option>
          <option value="Technical Issue">Technical Issue</option>
          <option value="Feature Request">Feature Request</option>
          <option value="Shipping/Delivery">Shipping/Delivery</option>
          <option value="Account">Account</option>
        </select>

        <span className="text-slate-500 ml-auto shrink-0">
          Showing <strong className="text-white">{tickets.length}</strong> tickets
        </span>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Ticket Queue (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl h-[740px] overflow-y-auto space-y-2.5">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No tickets matching current filters.
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?._id === t._id;
              const isHighChurn = t.aiAnalysis?.churnRisk === 'High';

              return (
                <div
                  key={t._id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-800/95 border-indigo-500 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  {/* High Churn Indicator Stripe */}
                  {isHighChurn && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-rose-500 rounded-r"></div>
                  )}

                  <div className="flex items-center justify-between mb-1 pl-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {t.ticketNumber}
                      </span>
                      <span className="text-[11px] text-slate-300 font-semibold truncate max-w-[120px]">
                        {t.customerName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ChurnBadge churnRisk={t.aiAnalysis?.churnRisk} />
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold text-white line-clamp-1 mb-2 pl-1">
                    {t.subject}
                  </h3>

                  <div className="flex items-center justify-between pl-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <CategoryBadge category={t.aiAnalysis?.category} />
                      <SentimentBadge sentiment={t.aiAnalysis?.sentiment} score={t.aiAnalysis?.sentimentScore} />
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full font-mono uppercase text-[10px] ${
                        t.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : t.status === 'in_progress'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Copilot Details & One-Click AI Response (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-[740px] shadow-xl overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-300 font-semibold">
                      {selectedTicket.customerName}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      ({selectedTicket.customerEmail})
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-white">{selectedTicket.subject}</h2>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="open">Status: Open</option>
                    <option value="in_progress">Status: In Progress</option>
                    <option value="resolved">Status: Resolved</option>
                  </select>
                </div>
              </div>

              {/* AI TRIAGE BRIEF CARD (Feature 3 Highlights) */}
              <div className="p-3.5 bg-indigo-950/20 border-b border-indigo-900/40 text-xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      AI Automated Triage:
                    </span>
                    <SentimentBadge
                      sentiment={selectedTicket.aiAnalysis?.sentiment}
                      score={selectedTicket.aiAnalysis?.sentimentScore}
                    />
                    <ChurnBadge churnRisk={selectedTicket.aiAnalysis?.churnRisk} />
                    <CategoryBadge category={selectedTicket.aiAnalysis?.category} />
                  </div>

                  <button
                    onClick={handleSummarizeThread}
                    disabled={summarizing}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] border border-slate-700 flex items-center gap-1 transition-colors"
                  >
                    {summarizing ? (
                      <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FileText className="w-3 h-3 text-indigo-400" />
                    )}
                    Summarize Thread
                  </button>
                </div>

                {/* 2-line AI Summary & Churn Reason */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                  <p className="text-slate-200">
                    <strong className="text-white">Summary: </strong>
                    {threadSummary || selectedTicket.aiAnalysis?.summary}
                  </p>
                  {selectedTicket.aiAnalysis?.churnRiskReason && (
                    <p className="text-[11px] text-amber-300/90 font-mono">
                      <strong>Churn Vulnerability Factor: </strong>
                      {selectedTicket.aiAnalysis.churnRiskReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Message History Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/30">
                {selectedTicket.messages?.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.sender === 'agent' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">
                        {m.sender === 'agent' ? `Agent (${m.senderName || 'You'})` : m.senderName}
                      </span>
                      <span>•</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line ${
                        m.sender === 'agent'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* ONE-CLICK AI ACTIONS & SUGGESTED DRAFT REPLY */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
                {/* Tone Selector Toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Copilot Tone:</span>
                    <div className="flex items-center gap-1">
                      {tonesList.map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => handleRegenerateDraft(tone)}
                          disabled={regeneratingDraft}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                            selectedTone === tone
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRegenerateDraft()}
                    disabled={regeneratingDraft}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    {regeneratingDraft ? (
                      <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Regenerate AI Draft
                  </button>
                </div>

                {/* Draft Textarea */}
                <div className="relative">
                  <textarea
                    rows={4}
                    value={draftReply}
                    onChange={(e) => setDraftReply(e.target.value)}
                    placeholder="AI Suggested Reply will appear here. Edit or click Send in one click..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    💡 1-click personalized response ready to review and send
                  </span>

                  <button
                    onClick={handleSendReply}
                    disabled={!draftReply.trim() || sendingReply}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    {sendingReply ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Reply to Customer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs p-8 text-center">
              <Inbox className="w-12 h-12 text-slate-700 mb-3" />
              <p className="font-semibold text-slate-400">No ticket selected</p>
              <p className="text-slate-600 mt-1">Select a ticket from the left queue to launch Agent Copilot</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentInbox;
