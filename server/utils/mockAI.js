/**
 * Mock AI Fallback Generator
 * Generates realistic structured responses when GEMINI_API_KEY is not configured
 * or when Gemini API encounters network/quota limits.
 */

export const mockTicketTriage = (subject, message) => {
  const text = `${subject} ${message}`.toLowerCase();

  let category = 'Technical Issue';
  let sentiment = 'Neutral';
  let sentimentScore = 65;
  let churnRisk = 'Low';
  let churnRiskReason = 'Customer is asking a standard informational question with no negative churn intent.';

  if (text.includes('refund') || text.includes('charged') || text.includes('invoice') || text.includes('billing') || text.includes('credit card') || text.includes('price')) {
    category = 'Billing';
    sentiment = 'Frustrated';
    sentimentScore = 38;
    churnRisk = 'Medium';
    churnRiskReason = 'Unexpected charges or billing discrepancies directly correlate with immediate subscription cancellation.';
  } else if (text.includes('cancel') || text.includes('leave') || text.includes('terrible') || text.includes('angry') || text.includes('worst') || text.includes('disaster')) {
    sentiment = 'Critical';
    sentimentScore = 15;
    churnRisk = 'High';
    churnRiskReason = 'Explicit churn intent signaled through strong negative sentiment and cancellation keywords.';
  } else if (text.includes('great') || text.includes('love') || text.includes('thank') || text.includes('awesome') || text.includes('helpful')) {
    sentiment = 'Positive';
    sentimentScore = 92;
    churnRisk = 'Low';
    churnRiskReason = 'Customer expresses high satisfaction and affinity with the platform.';
  } else if (text.includes('feature') || text.includes('add') || text.includes('would like') || text.includes('integration') || text.includes('can you support')) {
    category = 'Feature Request';
    sentiment = 'Neutral';
    sentimentScore = 70;
    churnRisk = 'Low';
    churnRiskReason = 'Constructive product expansion inquiry reflecting ongoing product usage.';
  } else if (text.includes('package') || text.includes('shipping') || text.includes('delivery') || text.includes('tracking') || text.includes('arrived') || text.includes('order')) {
    category = 'Shipping/Delivery';
    sentiment = 'Frustrated';
    sentimentScore = 45;
    churnRisk = 'Medium';
    churnRiskReason = 'Logistics delays create frustration if delivery timelines are exceeded.';
  } else if (text.includes('password') || text.includes('login') || text.includes('account') || text.includes('locked') || text.includes('2fa')) {
    category = 'Account';
    sentiment = 'Frustrated';
    sentimentScore = 40;
    churnRisk = 'Medium';
    churnRiskReason = 'Account lockout blocks workflow and requires prompt remediation.';
  }

  const summary = `The customer is requesting assistance regarding "${subject}". Primary concern involves ${category.toLowerCase()} inquiries needing structured team verification.`;

  const suggestedReply = `Hello there,

Thank you for reaching out to OmniPulse Support. I understand your inquiry regarding "${subject}" and I would be glad to help you resolve this as quickly as possible.

Our engineering and customer success teams are already looking into this matter. Could you please confirm if this issue is impacting all team members or specific workflows? 

We will follow up shortly with a complete update. Thank you for your patience!

Warm regards,
OmniPulse Customer Experience Team`;

  return {
    sentiment,
    sentimentScore,
    churnRisk,
    churnRiskReason,
    category,
    summary,
    suggestedReply,
  };
};

export const mockDraftRegeneration = (ticket, tone, customInstruction) => {
  const customerName = ticket.customerName || 'Valued Customer';
  const subject = ticket.subject || 'your support request';

  switch (tone) {
    case 'Concise':
      return `Hi ${customerName},

We're on it. Your issue regarding "${subject}" has been reviewed by our specialist team. We've applied a corrective configuration to your account. 

Please refresh your dashboard and let us know if you encounter any further blockers.

Best,
OmniPulse Support`;

    case 'Formal':
      return `Dear ${customerName},

Thank you for contacting OmniPulse AI Enterprise Support regarding "${subject}".

We have conducted a thorough investigation into the telemetry logs associated with your inquiry. Corrective measures have been initiated in accordance with our standard service level agreements.

Please do not hesitate to contact us should you require further clarification or escalation.

Sincerely,
OmniPulse Technical Operations`;

    case 'Apologetic + Offer Discount':
      return `Dear ${customerName},

Please accept our deepest apologies for the disruption caused regarding "${subject}". We know how critical uninterrupted service is to your daily operations, and we fell short of our standard of excellence today.

To make things right, we have credited your next billing cycle with a 20% courtesy discount. Furthermore, our senior technical leads have resolved the underlying trigger.

Thank you for being a valued partner with OmniPulse. Please let us know if there is anything else we can do to support you.

Warmest regards,
OmniPulse Leadership & Support Team`;

    case 'Empathetic':
    default:
      return `Hi ${customerName},

Thank you so much for bringing "${subject}" to our attention. I completely understand how frustrating it is when things don't work smoothly, and I want to personally assure you that we are prioritizing this.

I have notified our dedicated support specialists, and we are working to ensure this is permanently ironed out. In the meantime, please feel free to reach out directly if anything else comes up.

With care and appreciation,
OmniPulse Support Team`;
  }
};

export const mockChatbotResolution = (customerMessage, history, knowledgeItems = []) => {
  const query = customerMessage.toLowerCase();

  // Search in knowledge base
  const matched = knowledgeItems.find(
    (item) =>
      query.includes(item.category.toLowerCase()) ||
      query.includes(item.question.toLowerCase().split(' ')[0]) ||
      (item.tags && item.tags.some((tag) => query.includes(tag.toLowerCase())))
  );

  if (matched) {
    return {
      text: `Hello! Based on our OmniPulse Knowledge Base: **${matched.title}**\n\n${matched.answer}\n\n*Did this fully resolve your question? If not, feel free to reply or tap "Escalate to Human Agent" above.*`,
      resolved: true,
      escalateRecommended: false,
    };
  }

  if (query.includes('refund') || query.includes('billing') || query.includes('credit card')) {
    return {
      text: `I understand you have a question regarding billing or refunds. In accordance with OmniPulse policy, billing inquiries are protected and handled securely. You can view your latest invoice under **Settings > Billing & Invoices**.\n\nIf you require a manual charge review or prorated adjustment, I can immediately route this to our billing specialist team for priority review. Would you like me to open an expedited ticket?`,
      resolved: false,
      escalateRecommended: true,
    };
  }

  if (query.includes('human') || query.includes('agent') || query.includes('representative') || query.includes('escalate')) {
    return {
      text: `Certainly! I have marked your inquiry for human escalation. You can also click the **"Create Support Ticket"** button to have an OmniPulse Customer Experience agent review your history and reply directly.`,
      resolved: false,
      escalateRecommended: true,
    };
  }

  return {
    text: `Thanks for reaching out! OmniPulse AI Support is here to help. I have analyzed your question regarding "${customerMessage}".\n\nTo troubleshoot, please check your network connection, ensure you are running the latest version of the dashboard, and clear your browser cache.\n\nIf the issue persists, our human engineering copilot is ready to step in. Would you like to create an official support ticket?`,
    resolved: false,
    escalateRecommended: false,
  };
};

export const mockExecutiveReport = (ticketList) => {
  const total = ticketList.length || 15;
  const criticalCount = ticketList.filter((t) => t.aiAnalysis?.sentiment === 'Critical' || t.aiAnalysis?.churnRisk === 'High').length;
  const healthScore = Math.max(45, Math.min(95, Math.round(100 - (criticalCount / (total || 1)) * 50)));

  return {
    title: 'OmniPulse CX Executive Intelligence Brief',
    overallHealthScore: healthScore,
    executiveSummary:
      'Overall customer sentiment remains stable, but recurring friction in enterprise invoice reconciliation and webhook delivery timeouts is generating preventable churn risk in Mid-Market accounts. Immediate product refinement is recommended.',
    ticketsAnalyzedCount: total,
    topPainPoints: [
      {
        issue: 'Payment Gateway Webhook Retries & Invoicing Mismatch',
        frequency: 'High (34% of technical tickets)',
        severity: 'High',
        description: 'Customers report delayed receipt generation and intermittent Stripe 3D Secure verification timeouts during renewal periods.',
      },
      {
        issue: 'Role-Based Access Control Granularity',
        frequency: 'Medium (26% of tickets)',
        severity: 'Medium',
        description: 'Enterprise teams request custom sub-agent permissions to prevent read-only users from modifying triage tags.',
      },
      {
        issue: 'Analytics Export Latency (CSV / PDF)',
        frequency: 'Low-to-Medium (18% of tickets)',
        severity: 'Low',
        description: 'Reports with more than 5,000 data rows take over 15 seconds to download during peak morning hours.',
      },
    ],
    churnDrivers: [
      {
        factor: 'Unresolved Billing Disputes beyond 48 hours',
        impact: 'High',
        recommendation: 'Empower front-line agents with automatic approval for instant credits under $50.',
      },
      {
        factor: 'Integration Documentation Gaps for Custom REST Webhooks',
        impact: 'Medium',
        recommendation: 'Deploy interactive cURL & Postman recipes in developer docs.',
      },
      {
        factor: 'Mobile Responsive Navigation on Agent Inbox',
        impact: 'Low',
        recommendation: 'Optimize mobile viewport touch targets for on-call triage.',
      },
    ],
    recommendations: [
      {
        title: 'Deploy Automated Self-Serve Billing Diagnostics',
        action: 'Integrate Stripe Webhook Health Monitor into Customer Portal to resolve 70% of payment status questions without agent involvement.',
        priority: 'High',
        expectedOutcome: 'Reduce billing-related churn risk by 28% in 30 days.',
      },
      {
        title: 'Launch Proactive Churn Intervention Workflow',
        action: 'Trigger automatic CX agent alerts whenever a customer submits two negative tickets within 14 days.',
        priority: 'High',
        expectedOutcome: 'Retain an estimated 15-20 at-risk enterprise accounts per quarter.',
      },
      {
        title: 'Enhance Copilot Suggested Replies with Token Variables',
        action: 'Enable one-click macro responses that pre-populate order numbers, tracking URLs, and SLA timestamps.',
        priority: 'Medium',
        expectedOutcome: 'Cut Average Handling Time (AHT) from 14 minutes to under 4 minutes.',
      },
    ],
  };
};
