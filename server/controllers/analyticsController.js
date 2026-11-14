import Ticket from '../models/Ticket.js';
import InsightReport from '../models/InsightReport.js';
import { generateExecutiveReport } from '../services/geminiService.js';
import { getIsConnected } from '../config/db.js';
import memoryStore from '../services/memoryStore.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const tickets = memoryStore.tickets;
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status === 'open').length;
    const inProgressTickets = tickets.filter((t) => t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;

    const sentimentMap = { Positive: 0, Neutral: 0, Frustrated: 0, Critical: 0 };
    let scoreSum = 0;
    tickets.forEach((t) => {
      const s = t.aiAnalysis?.sentiment || 'Neutral';
      if (sentimentMap[s] !== undefined) sentimentMap[s]++;
      scoreSum += t.aiAnalysis?.sentimentScore || 50;
    });

    const averageSatisfactionScore = totalTickets > 0 ? Math.round(scoreSum / totalTickets) : 74;

    const sentimentData = [
      { name: 'Positive', value: sentimentMap.Positive, color: '#10B981' },
      { name: 'Neutral', value: sentimentMap.Neutral, color: '#6366F1' },
      { name: 'Frustrated', value: sentimentMap.Frustrated, color: '#F59E0B' },
      { name: 'Critical', value: sentimentMap.Critical, color: '#EF4444' },
    ];

    const categoriesList = ['Billing', 'Technical Issue', 'Feature Request', 'Shipping/Delivery', 'Account'];
    const categoryData = categoriesList.map((cat) => ({
      category: cat,
      tickets: tickets.filter((t) => t.aiAnalysis?.category === cat).length,
    }));

    const churnMap = { High: 0, Medium: 0, Low: 0 };
    tickets.forEach((t) => {
      const c = t.aiAnalysis?.churnRisk || 'Low';
      if (churnMap[c] !== undefined) churnMap[c]++;
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trendData = days.map((day, idx) => {
      const base = 8 + (idx % 4) * 3;
      const resolved = Math.max(3, base - Math.floor(Math.random() * 3));
      return {
        day,
        newTickets: base,
        resolvedTickets: resolved,
        resolutionRate: Math.round((resolved / base) * 100),
      };
    });

    const resolutionRatePercent = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    res.status(200).json({
      success: true,
      kpis: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        resolutionRatePercent,
        averageSatisfactionScore,
        churnAtRiskCount: churnMap.High + churnMap.Medium,
        highChurnCount: churnMap.High,
      },
      sentimentData,
      categoryData,
      churnData: [
        { name: 'Low Risk', value: churnMap.Low, color: '#10B981' },
        { name: 'Medium Risk', value: churnMap.Medium, color: '#F59E0B' },
        { name: 'High Risk', value: churnMap.High, color: '#EF4444' },
      ],
      trendData,
    });
  } catch (error) {
    next(error);
  }
};

export const generateReport = async (req, res, next) => {
  try {
    const tickets = memoryStore.tickets.slice(0, 20);
    const aiReport = await generateExecutiveReport({ tickets });

    const reportDoc = memoryStore.createReport({
      title: aiReport.title || 'OmniPulse CX Executive Intelligence Brief',
      generatedBy: req.user.id,
      ticketsAnalyzedCount: tickets.length,
      overallHealthScore: aiReport.overallHealthScore || 78,
      executiveSummary: aiReport.executiveSummary || 'Customer support operations report generated.',
      topPainPoints: aiReport.topPainPoints || [],
      churnDrivers: aiReport.churnDrivers || [],
      recommendations: aiReport.recommendations || [],
    });

    res.status(201).json({
      success: true,
      message: 'Executive AI CX report generated successfully',
      report: reportDoc,
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestReport = async (req, res, next) => {
  try {
    const report = memoryStore.getLatestReport();
    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};
