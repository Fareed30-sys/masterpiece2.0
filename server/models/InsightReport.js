import mongoose from 'mongoose';

const painPointSchema = new mongoose.Schema({
  issue: { type: String, required: true },
  frequency: { type: String, default: 'Frequent' },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  description: { type: String, required: true },
});

const churnDriverSchema = new mongoose.Schema({
  factor: { type: String, required: true },
  impact: { type: String, default: 'Moderate' },
  recommendation: { type: String, default: '' },
});

const recommendationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  action: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
  expectedOutcome: { type: String, default: '' },
});

const insightReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'OmniPulse CX Executive Intelligence Brief',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ticketsAnalyzedCount: {
      type: Number,
      default: 0,
    },
    overallHealthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 78,
    },
    executiveSummary: {
      type: String,
      default: '',
    },
    topPainPoints: [painPointSchema],
    churnDrivers: [churnDriverSchema],
    recommendations: [recommendationSchema],
    sentimentBreakdown: {
      positivePercent: { type: Number, default: 0 },
      neutralPercent: { type: Number, default: 0 },
      frustratedPercent: { type: Number, default: 0 },
      criticalPercent: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const InsightReport = mongoose.model('InsightReport', insightReportSchema);
export default InsightReport;
