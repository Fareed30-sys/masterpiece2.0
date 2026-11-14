import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SentimentBadge from '../components/SentimentBadge';
import ChurnBadge from '../components/ChurnBadge';
import CategoryBadge from '../components/CategoryBadge';
import {
  MessageSquare,
  PlusCircle,
  Sparkles,
  Send,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  RefreshCw,
  Search,
  Mic,
  MicOff,
  Radio,
  Volume2,
} from 'lucide-react';

export const CustomerPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tickets' | 'new-ticket'
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! I am the **OmniPulse AI Support Assistant**.\n\nI can answer questions regarding billing, webhooks, rate limits, hardware shipping, and account permissions instantly using our Knowledge Base. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const chatBottomRef = useRef(null);

  // New Ticket State
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'Technical Issue',
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  // Message reply in existing ticket
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Voice Recording & Speech-to-Text State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasVoiceClip, setHasVoiceClip] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const startVoiceRecording = (target = 'ticket') => {
    setIsRecording(true);
    setRecordingDuration(0);
    setHasVoiceClip(true);

    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let transcriptText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcriptText += event.results[i][0].transcript;
          }
          if (target === 'ticket') {
            setNewTicket((prev) => ({
              ...prev,
              message: (prev.message ? prev.message + ' ' : '') + transcriptText,
            }));
          } else {
            setChatInput((prev) => (prev ? prev + ' ' : '') + transcriptText);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {}
    } else {
      setTimeout(() => {
        if (target === 'ticket') {
          setNewTicket((prev) => ({
            ...prev,
            message: prev.message || "Hello, I am calling because our webhook ingest started failing with 504 errors on US-East since 8:30 AM, blocking our production sprint release. Please escalate this urgently.",
          }));
        } else {
          setChatInput("How do I configure custom retry policies for webhook deliveries?");
        }
      }, 2000);
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchKnowledgeBase();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.get('/tickets');
      setTickets(res.data.tickets || []);
      if (res.data.tickets?.length > 0 && !selectedTicket) {
        setSelectedTicket(res.data.tickets[0]);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchKnowledgeBase = async () => {
    try {
      const res = await api.get('/chat/knowledge-base');
      setKnowledgeBase(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch knowledge base', err);
    }
  };

  const handleSendChatMessage = async (overrideText) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setChatInput('');
    setChatLoading(true);

    try {
      const historyPayload = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post('/chat/message', {
        message: textToSend,
        history: historyPayload,
      });

      const aiMsg = {
        role: 'assistant',
        content: res.data.reply,
        resolved: res.data.resolved,
        escalateRecommended: res.data.escalateRecommended,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the AI engine. Please try again or open a support ticket.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;
    setSubmittingTicket(true);
    setTicketResult(null);

    try {
      const res = await api.post('/tickets', {
        ...newTicket,
        isVoiceMessage: hasVoiceClip,
        audioDuration: recordingDuration || 24,
      });
      setTicketResult(res.data.ticket);
      setNewTicket({ subject: '', message: '', category: 'Technical Issue' });
      setHasVoiceClip(false);
      setRecordingDuration(0);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);

    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/messages`, {
        text: replyText,
        sender: 'customer',
      });
      setSelectedTicket(res.data.ticket);
      setReplyText('');
      fetchTickets();
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Customer Support Portal</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
              Live AI Resolution
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Instant AI triage and self-service diagnostics for {user?.companyName || 'your organization'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Instant Assistant
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tickets'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            My Tickets ({tickets.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('new-ticket');
              setTicketResult(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'new-ticket'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Ticket
          </button>
        </div>
      </div>

      {/* TAB 1: AI Instant Resolution Chatbot */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Stream */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">OmniPulse Copilot</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Grounded with company knowledge base</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setNewTicket({
                    subject: 'Escalated from AI Chat Session',
                    message: chatMessages
                      .filter((m) => m.role === 'user')
                      .map((m) => m.content)
                      .join('\n\n') || '',
                    category: 'Technical Issue',
                  });
                  setActiveTab('new-ticket');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                Escalate to Human Agent
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">{msg.content}</div>

                    {msg.escalateRecommended && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Complex inquiry detected
                        </span>
                        <button
                          onClick={() => {
                            setNewTicket({
                              subject: 'Inquiry regarding ' + (chatMessages[idx - 1]?.content?.slice(0, 30) || 'support issue'),
                              message: chatMessages[idx - 1]?.content || '',
                              category: 'Billing',
                            });
                            setActiveTab('new-ticket');
                          }}
                          className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30 hover:bg-indigo-500/30"
                        >
                          Create Expedited Ticket
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></div>
                    <span>Consulting Knowledge Base & past context...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isRecording ? "Listening to your voice..." : "Ask a question (e.g. 'How do I update VAT ID?', 'Webhook retries?')..."}
                    className={`w-full bg-slate-900 border rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isRecording ? 'border-rose-500/80 bg-rose-950/20' : 'border-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => (isRecording ? stopVoiceRecording() : startVoiceRecording('chat'))}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Voice Dictate'}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ask AI
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Instant Knowledge Base & FAQs */}
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Suggested Self-Serve Solutions</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Click any topic below to test instant AI resolution grounded in company policies:
              </p>

              <div className="space-y-2">
                {knowledgeBase.map((kb) => (
                  <button
                    key={kb._id}
                    onClick={() => handleSendChatMessage(kb.question)}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                        {kb.category}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors">
                      {kb.question}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Past Context Widget */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs">
              <h4 className="font-semibold text-slate-200 mb-1">Your Account Context</h4>
              <p className="text-slate-400 mb-3">AI assistant has access to your past support interactions:</p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between p-2 rounded bg-slate-950/50 border border-slate-800">
                  <span className="text-slate-400">Total Tickets:</span>
                  <span className="text-white font-bold">{tickets.length}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/50 border border-slate-800">
                  <span className="text-slate-400">Organization:</span>
                  <span className="text-indigo-300 font-bold">{user?.companyName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: My Tickets & Conversation Thread */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl h-[650px] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Your Support Tickets</h3>
              <button
                onClick={fetchTickets}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingTickets ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No tickets found. Submit your first ticket using the "New Ticket" tab.
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedTicket?._id === t._id
                      ? 'bg-slate-800/90 border-indigo-500/60 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-indigo-400 font-semibold">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
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

                  <h4 className="text-xs font-semibold text-white line-clamp-1 mb-2">{t.subject}</h4>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <SentimentBadge sentiment={t.aiAnalysis?.sentiment} score={t.aiAnalysis?.sentimentScore} />
                    <CategoryBadge category={t.aiAnalysis?.category} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Details & Live Thread */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-xl overflow-hidden">
            {selectedTicket ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {selectedTicket.ticketNumber}
                      </span>
                      <span className="text-slate-600">•</span>
                      <CategoryBadge category={selectedTicket.aiAnalysis?.category} />
                      <SentimentBadge sentiment={selectedTicket.aiAnalysis?.sentiment} score={selectedTicket.aiAnalysis?.sentimentScore} />
                    </div>
                    <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                        selectedTicket.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : selectedTicket.status === 'in_progress'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* AI Executive Summary Callout */}
                {selectedTicket.aiAnalysis?.summary && (
                  <div className="px-4 py-2.5 bg-indigo-950/30 border-b border-indigo-900/40 text-xs text-indigo-200 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      <strong className="font-semibold text-white">AI Summary: </strong>
                      {selectedTicket.aiAnalysis.summary}
                    </span>
                  </div>
                )}

                {/* Messages Thread */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {selectedTicket.messages?.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        m.sender === 'customer' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">{m.senderName || m.sender}</span>
                        <span>•</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-line ${
                          m.sender === 'customer'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Reply in Ticket */}
                {selectedTicket.status !== 'resolved' ? (
                  <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
                    <form onSubmit={handleSendTicketReply} className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply to support agent..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim() || sendingReply}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/30 border-t border-emerald-900/40 text-center text-xs text-emerald-400 font-medium">
                    This ticket has been marked as resolved.
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Select a ticket to view conversation details
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: New Support Ticket (Feature 3: Automated AI Triage) */}
      {activeTab === 'new-ticket' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Submit New Support Ticket</h3>
                <p className="text-xs text-slate-400">
                  Powered by Gemini 2.5 Flash for instant automated sentiment & urgency triage
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ticket Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. Invoicing discrepancy on March renewal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Billing">Billing & Payments</option>
                  <option value="Technical Issue">Technical Issue & API</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Shipping/Delivery">Shipping & Hardware Delivery</option>
                  <option value="Account">Account Access & Security</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Detailed Description
                  </label>
                  
                  {/* Voice Dictation Trigger */}
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={() => startVoiceRecording('ticket')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      Dictate via Voice (Speech-to-Text)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30 cursor-pointer"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      Stop Dictating ({recordingDuration}s)
                    </button>
                  )}
                </div>

                {isRecording && (
                  <div className="mb-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between text-xs text-rose-300 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                      <span className="font-semibold">Transcribing speech in real-time...</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3 bg-rose-400 animate-pulse"></span>
                      <span className="w-1 h-5 bg-rose-400 animate-pulse [animation-delay:0.1s]"></span>
                      <span className="w-1 h-4 bg-rose-400 animate-pulse [animation-delay:0.2s]"></span>
                      <span className="w-1 h-6 bg-rose-400 animate-pulse [animation-delay:0.3s]"></span>
                      <span className="w-1 h-2 bg-rose-400 animate-pulse [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}

                {hasVoiceClip && !isRecording && (
                  <div className="mb-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between text-xs text-indigo-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      Voice Note Attached ({recordingDuration || 24}s audio clip transcribed)
                    </span>
                    <button
                      type="button"
                      onClick={() => setHasVoiceClip(false)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Remove clip
                    </button>
                  </div>
                )}

                <textarea
                  required
                  rows={4}
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Explain the issue in detail, or tap 'Dictate via Voice' above to speak..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingTicket}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {submittingTicket ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Gemini AI Triaging Ticket & Sentiment...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Submit Ticket with Automated AI Triage
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Instant AI Triage Result Display */}
          {ticketResult && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-white">Ticket Created & Triaged by AI</h4>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">
                    {ticketResult.ticketNumber}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTicket(ticketResult);
                    setActiveTab('tickets');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View in My Tickets →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Sentiment Score</span>
                  <div className="mt-1 flex items-center gap-2">
                    <SentimentBadge
                      sentiment={ticketResult.aiAnalysis?.sentiment}
                      score={ticketResult.aiAnalysis?.sentimentScore}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Urgency & Churn Risk</span>
                  <div className="mt-1">
                    <ChurnBadge churnRisk={ticketResult.aiAnalysis?.churnRisk} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Auto-Category</span>
                  <div className="mt-1">
                    <CategoryBadge category={ticketResult.aiAnalysis?.category} />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Executive Summary:
                </div>
                <p>{ticketResult.aiAnalysis?.summary}</p>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <strong>Churn Indicator Reason: </strong>
                  {ticketResult.aiAnalysis?.churnRiskReason}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
