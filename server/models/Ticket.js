import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['customer', 'agent', 'ai'],
    required: true,
  },
  senderName: {
    type: String,
    default: 'Customer',
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const aiAnalysisSchema = new mongoose.Schema({
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Frustrated', 'Critical'],
    default: 'Neutral',
  },
  sentimentScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 60,
  },
  churnRisk: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  churnRiskReason: {
    type: String,
    default: 'No immediate churn indicators detected.',
  },
  category: {
    type: String,
    enum: ['Billing', 'Technical Issue', 'Feature Request', 'Shipping/Delivery', 'Account'],
    default: 'Technical Issue',
  },
  summary: {
    type: String,
    default: '',
  },
  suggestedReply: {
    type: String,
    default: '',
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: 'Valued Customer',
    },
    customerEmail: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Ticket subject is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    messages: [messageSchema],
    aiAnalysis: {
      type: aiAnalysisSchema,
      default: () => ({}),
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate ticket number like TKT-1001
ticketSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${1000 + count + 1}`;
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
