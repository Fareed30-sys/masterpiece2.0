export const demoUsers = [
  {
    name: 'Sarah Connor',
    email: 'agent@omnipulse.ai',
    password: 'password123',
    role: 'agent',
    companyName: 'OmniPulse CX Operations',
  },
  {
    name: 'Alex Rivera',
    email: 'alex.rivera@techcorp.io',
    password: 'password123',
    role: 'customer',
    companyName: 'TechCorp Solutions',
  },
  {
    name: 'Elena Rostova',
    email: 'elena@novaworks.com',
    password: 'password123',
    role: 'customer',
    companyName: 'NovaWorks LLC',
  },
];

export const demoKnowledgeItems = [
  {
    title: 'How to configure custom webhook retry policies',
    category: 'Technical Issue',
    question: 'How do I configure retry intervals for failing outgoing webhooks in OmniPulse?',
    answer: 'Navigate to **Project Settings > Webhooks > Retry Policies**. You can define exponential backoff schedules (1m, 5m, 15m, 1h) and attach a fallback Dead Letter Queue (DLQ) endpoint for critical payload preservation.',
    tags: ['webhooks', 'retry', 'api', 'dlq'],
  },
  {
    title: 'Managing enterprise billing, invoices and VAT IDs',
    category: 'Billing',
    question: 'Where can I download PDF receipts and update our European VAT registration number?',
    answer: 'Company administrators can update invoicing metadata under **Billing > Tax & VAT Details**. All past monthly cycle receipts are available as tamper-proof PDF downloads in the **Invoices** tab.',
    tags: ['billing', 'invoice', 'vat', 'tax', 'receipt'],
  },
  {
    title: 'Resetting Multi-Factor Authentication (2FA) for locked accounts',
    category: 'Account',
    question: 'What do I do if I lost my authenticator app and cannot complete 2FA login?',
    answer: 'If you have saved your emergency recovery codes, enter any 16-character backup code on the 2FA prompt. Alternatively, an Organization Admin can initiate a secure biometric identity verification reset from **Team > Members > Security Reset**.',
    tags: ['2fa', 'mfa', 'security', 'login', 'lockout'],
  },
  {
    title: 'API rate limits and quota tier upgrades',
    category: 'Technical Issue',
    question: 'What are the default rate limits for the OmniPulse REST API and how to request higher RPS?',
    answer: 'Standard plans include 1,200 requests/minute. Enterprise contracts can scale up to 15,000 RPS. To request burst capacity for product launches, open a Priority Ticket selecting category "Technical Issue".',
    tags: ['rate limit', 'api', 'rps', 'quota'],
  },
  {
    title: 'Shipping and physical hardware replacement delivery timelines',
    category: 'Shipping/Delivery',
    question: 'How long does it take for expedited replacement IoT telemetry gateway sensors to arrive?',
    answer: 'Warranty replacement orders submitted before 2:00 PM EST ship same-day via FedEx Priority Overnight. Standard ground replacements arrive within 2-3 business days across continental regions.',
    tags: ['shipping', 'delivery', 'hardware', 'tracking'],
  },
];

export const generateTickets = (agentUser, alexUser, elenaUser) => [
  {
    ticketNumber: 'TKT-1001',
    customerId: alexUser._id,
    customerName: alexUser.name,
    customerEmail: alexUser.email,
    subject: 'Double charge on March Enterprise subscription renewal',
    status: 'open',
    priority: 'urgent',
    messages: [
      {
        sender: 'customer',
        senderName: alexUser.name,
        text: 'Hi OmniPulse team, I just reviewed our corporate AMEX statement and noticed TechCorp was billed twice ($1,499 x 2) on March 1st. We only have one active workspace. We need this credited immediately or we will have to contest through American Express.',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Critical',
      sentimentScore: 18,
      churnRisk: 'High',
      churnRiskReason: 'Unresolved duplicate charges with immediate threat of credit card chargeback represent extreme churn vulnerability.',
      category: 'Billing',
      summary: 'TechCorp was double-billed $1,499 on their monthly enterprise renewal. Customer threatens credit card dispute if not refunded immediately.',
      suggestedReply: `Hi Alex,

I sincerely apologize for the duplicate charge on TechCorp's March billing statement. I know how alarming unexpected charges are, especially on corporate accounts.

I have already triggered a full reversal of the duplicate $1,499 transaction with our payment processor. You should see the credit reflected on your AMEX within 2-3 business days. In addition, I have verified your subscription configuration to ensure this cannot reoccur.

Please let me know if you would like me to issue an updated consolidated receipt for your finance department.

Warm regards,
OmniPulse Customer Experience Team`,
      analyzedAt: new Date(Date.now() - 36 * 3600 * 1000),
    },
    createdAt: new Date(Date.now() - 36 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1002',
    customerId: alexUser._id,
    customerName: alexUser.name,
    customerEmail: alexUser.email,
    subject: 'Webhook endpoint returns 504 Gateway Timeout during peak ingest',
    status: 'in_progress',
    priority: 'high',
    assignedAgentId: agentUser._id,
    messages: [
      {
        sender: 'customer',
        senderName: alexUser.name,
        text: 'Our server webhook ingest started dropping payload deliveries around 08:30 UTC today. We observed 142 failed deliveries with 504 status codes. Is there degradation on the US-East cluster?',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000),
      },
      {
        sender: 'agent',
        senderName: agentUser.name,
        text: 'Hi Alex, thank you for alerting us. Our infrastructure team identified a momentary routing bottleneck on the US-East ingest proxy. We have shifted traffic to secondary nodes and are monitoring queue drainage now.',
        timestamp: new Date(Date.now() - 22 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Frustrated',
      sentimentScore: 42,
      churnRisk: 'Medium',
      churnRiskReason: 'Data ingestion pipeline disruptions directly impact customer uptime and SLA compliance.',
      category: 'Technical Issue',
      summary: 'High-volume webhook ingestion experienced 504 Gateway Timeouts on US-East. Traffic rerouted; agent monitoring recovery.',
      suggestedReply: `Hi Alex,

Our telemetry confirms that queue latency has dropped back below 45ms and all queued payloads have been successfully delivered to your receiver endpoints.

Could you confirm on your end if error rates have returned to normal? We will keep this ticket open until you give the all-clear.

Best,
Sarah Connor | OmniPulse Senior Support`,
      analyzedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    createdAt: new Date(Date.now() - 24 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1003',
    customerId: elenaUser._id,
    customerName: elenaUser.name,
    customerEmail: elenaUser.email,
    subject: 'Inquiry regarding custom role permissions for contractor accounts',
    status: 'resolved',
    priority: 'low',
    assignedAgentId: agentUser._id,
    messages: [
      {
        sender: 'customer',
        senderName: elenaUser.name,
        text: 'Hello! We are onboarding 4 external marketing contractors next week. Can we grant them access to view analytics dashboards without letting them edit support tickets or read customer emails?',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000),
      },
      {
        sender: 'agent',
        senderName: agentUser.name,
        text: 'Hi Elena! Yes absolutely. You can navigate to Organization Settings > Roles > Create Custom Role. Set "Analytics: Read Only" and leave "Tickets" unchecked.',
        timestamp: new Date(Date.now() - 46 * 3600 * 1000),
      },
      {
        sender: 'customer',
        senderName: elenaUser.name,
        text: 'That worked perfectly! Thank you so much for the quick help Sarah!',
        timestamp: new Date(Date.now() - 44 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Positive',
      sentimentScore: 95,
      churnRisk: 'Low',
      churnRiskReason: 'Customer is expanding team adoption and expressed satisfaction with immediate resolution.',
      category: 'Account',
      summary: 'Customer requested configuration guidance for contractor RBAC permissions. Successfully resolved with custom role walkthrough.',
      suggestedReply: `Hi Elena,

You are very welcome! Don't hesitate to reach out if you need anything else as you onboard your marketing team. Have a wonderful rest of your week!

Warmly,
Sarah Connor`,
      analyzedAt: new Date(Date.now() - 48 * 3600 * 1000),
    },
    resolvedAt: new Date(Date.now() - 44 * 3600 * 1000),
    createdAt: new Date(Date.now() - 48 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1004',
    customerId: elenaUser._id,
    customerName: elenaUser.name,
    customerEmail: elenaUser.email,
    subject: 'Replacement telemetry gateway tracking number not updated',
    status: 'open',
    priority: 'medium',
    messages: [
      {
        sender: 'customer',
        senderName: elenaUser.name,
        text: 'Hi, we ordered a replacement OmniPulse IoT receiver unit on Tuesday under warranty RMA #4910. The status says shipped but the tracking link still shows "Label Created". Can you check with dispatch?',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Neutral',
      sentimentScore: 58,
      churnRisk: 'Low',
      churnRiskReason: 'Routine shipping status check with polite phrasing and no cancellation risk.',
      category: 'Shipping/Delivery',
      summary: 'Customer inquiring about tracking link lag for RMA replacement hardware unit #4910.',
      suggestedReply: `Hi Elena,

Thank you for checking in on RMA #4910. FedEx picked up the pallet from our Austin fulfillment center this morning, and package scans typically populate within 4-6 hours of transit departure.

I will personally monitor the tracking number and reply back here with the confirmed delivery ETA as soon as the first carrier scan registers.

Best regards,
OmniPulse Logistics Team`,
      analyzedAt: new Date(Date.now() - 18 * 3600 * 1000),
    },
    createdAt: new Date(Date.now() - 18 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1005',
    customerId: alexUser._id,
    customerName: alexUser.name,
    customerEmail: alexUser.email,
    subject: 'Request: Native Snowflake data share integration',
    status: 'open',
    priority: 'medium',
    messages: [
      {
        sender: 'customer',
        senderName: alexUser.name,
        text: 'Is there a timeline for native Snowflake Secure Data Sharing? Currently we pull CSVs via scheduled cron, but streaming CX metrics directly into our Snowflake warehouse would be a huge game-changer for our BI team.',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Positive',
      sentimentScore: 82,
      churnRisk: 'Low',
      churnRiskReason: 'Customer is enthusiastic about deepening technical integration with enterprise data warehouse.',
      category: 'Feature Request',
      summary: 'Enterprise customer requesting native Snowflake Secure Data Share connector to eliminate manual CSV cron exports.',
      suggestedReply: `Hi Alex,

Great to hear from you! Our product engineering team is currently running a private beta for the OmniPulse Snowflake Data Connector. 

I would be thrilled to nominate TechCorp for early access. Would your BI team be interested in a 20-minute sandbox walkthrough with our lead integration engineer this Thursday?

Cheers,
OmniPulse Product Team`,
      analyzedAt: new Date(Date.now() - 12 * 3600 * 1000),
    },
    createdAt: new Date(Date.now() - 12 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1006',
    customerId: alexUser._id,
    customerName: alexUser.name,
    customerEmail: alexUser.email,
    subject: 'Locked out due to SSO SAML cert expiration',
    status: 'in_progress',
    priority: 'urgent',
    assignedAgentId: agentUser._id,
    messages: [
      {
        sender: 'customer',
        senderName: alexUser.name,
        text: 'CRITICAL: Our entire product team of 45 engineers cannot log in via Okta SSO this morning. It displays "SAML Certificate Validation Failed". We have a major sprint release today, please fix this ASAP!',
        isVoiceMessage: true,
        audioDuration: 34,
        timestamp: new Date(Date.now() - 4 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Critical',
      sentimentScore: 12,
      churnRisk: 'High',
      churnRiskReason: 'Organization-wide lockout blocking 45 engineers on release day presents critical business impact.',
      category: 'Account',
      summary: 'Complete Okta SSO SAML lockout affecting 45 engineers at TechCorp due to certificate mismatch. Sprint release blocked.',
      suggestedReply: `Hi Alex,

I understand the extreme urgency with your sprint release today. I have immediately alerted our Identity Operations engineers, and we are updating TechCorp's Okta SAML signing cert in our directory now.

We are also temporarily enabling break-glass admin password access for your primary administrator account so you can continue working while the cert propagation finishes.

I will update you every 15 minutes until this is 100% resolved.

Urgently yours,
Sarah Connor | OmniPulse Senior Incident Lead`,
      analyzedAt: new Date(Date.now() - 4 * 3600 * 1000),
    },
    createdAt: new Date(Date.now() - 4 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1007',
    customerId: elenaUser._id,
    customerName: elenaUser.name,
    customerEmail: elenaUser.email,
    subject: 'VAT ID format rejected during European billing address update',
    status: 'open',
    priority: 'medium',
    messages: [
      {
        sender: 'customer',
        senderName: elenaUser.name,
        text: 'We are transferring our entity to NovaWorks Europe B.V. (Netherlands). When entering our VAT number NL854392810B01 the form throws "Invalid Tax Identifier Syntax".',
        timestamp: new Date(Date.now() - 14 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Frustrated',
      sentimentScore: 48,
      churnRisk: 'Medium',
      churnRiskReason: 'Billing validation bug blocking regulatory corporate entity transfer.',
      category: 'Billing',
      summary: 'Customer unable to save valid Dutch VAT identifier due to regex validation error in billing form.',
      suggestedReply: `Hi Elena,

Thank you for reporting this. Dutch VAT identifiers with 12 characters occasionally trigger a strict regex check in our legacy form.

I have manually validated your VAT number against the EU VIES registry and attached it directly to NovaWorks Europe B.V.'s profile. Your upcoming invoices will accurately display your tax-exempt status.

Warm regards,
OmniPulse Billing Operations`,
      analyzedAt: new Date(Date.now() - 14 * 3600 * 1000),
    },
    createdAt: new Date(Date.now() - 14 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1008',
    customerId: elenaUser._id,
    customerName: elenaUser.name,
    customerEmail: elenaUser.email,
    subject: 'Love the new AI Ticket Triage copilot!',
    status: 'resolved',
    priority: 'low',
    messages: [
      {
        sender: 'customer',
        senderName: elenaUser.name,
        text: 'Just wanted to drop a quick note to say how incredible the new OmniPulse AI Copilot is. It cut our internal first response time in half this week. Kudos to your product and engineering team!',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000),
      },
      {
        sender: 'agent',
        senderName: agentUser.name,
        text: 'Elena, this made our entire team’s day! Thank you so much for the wonderful feedback. We are rolling out custom sentiment thresholds next week which you will love too.',
        timestamp: new Date(Date.now() - 70 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Positive',
      sentimentScore: 98,
      churnRisk: 'Low',
      churnRiskReason: 'Customer is a passionate brand advocate with near-zero churn probability.',
      category: 'Feature Request',
      summary: 'Unsolicited customer appreciation praising the AI Copilot’s impact on first response times.',
      suggestedReply: `Hi Elena,

Thank you so much! Feedback like yours fuels everything we build. We are honored to partner with NovaWorks.

Warmest regards,
OmniPulse CX Team`,
      analyzedAt: new Date(Date.now() - 72 * 3600 * 1000),
    },
    resolvedAt: new Date(Date.now() - 70 * 3600 * 1000),
    createdAt: new Date(Date.now() - 72 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1009',
    customerId: alexUser._id,
    customerName: alexUser.name,
    customerEmail: alexUser.email,
    subject: 'API documentation for batch payload endpoint outdated',
    status: 'in_progress',
    priority: 'medium',
    assignedAgentId: agentUser._id,
    messages: [
      {
        sender: 'customer',
        senderName: alexUser.name,
        text: 'The documentation for POST /v2/events/batch mentions a maximum batch size of 500 items, but our requests return 413 Payload Too Large whenever we exceed 250 items. Which is the intended limit?',
        timestamp: new Date(Date.now() - 10 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Neutral',
      sentimentScore: 62,
      churnRisk: 'Low',
      churnRiskReason: 'Technical clarification request highlighting developer documentation discrepancy.',
      category: 'Technical Issue',
      summary: 'Customer noted contradiction between documentation (500 items) and server gateway limit (250 items) for batch API.',
      suggestedReply: `Hi Alex,

Thank you for spotting that. The v2 endpoint was adjusted to 250 items per payload during our recent gateway security hardening, and our docs page lagged behind.

We are updating the developer docs today, and I’ve logged an internal request to increase the max payload buffer for enterprise tiers.

Best regards,
OmniPulse Developer Relations`,
      analyzedAt: new Date(Date.now() - 10 * 3600 * 1000),
    },
    createdAt: new Date(Date.now() - 10 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1010',
    customerId: elenaUser._id,
    customerName: elenaUser.name,
    customerEmail: elenaUser.email,
    subject: 'Courier delivered water-damaged sensor packaging',
    status: 'open',
    priority: 'high',
    messages: [
      {
        sender: 'customer',
        senderName: elenaUser.name,
        text: 'Our replacement sensor arrived via DHL today but the exterior cardboard box was soaked through and torn. We are hesitant to power on electrical hardware in this state. Can you replace it immediately?',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Frustrated',
      sentimentScore: 35,
      churnRisk: 'Medium',
      churnRiskReason: 'Damaged physical hardware on arrival creates immediate operational delay and frustration.',
      category: 'Shipping/Delivery',
      summary: 'Replacement hardware box delivered with significant water damage. Customer requires immediate pristine replacement.',
      suggestedReply: `Hi Elena,

I am so sorry to see this. You are completely right not to power on water-damaged electronics.

I have already submitted a zero-cost overnight replacement order (Order #EXP-8821) with our Austin dispatch center, packaged with heavy weatherproof sealing. You do not need to ship the damaged box back.

I will send you the new courier tracking details as soon as it departs at 3:00 PM today.

Warm regards,
OmniPulse Logistics Team`,
      analyzedAt: new Date(Date.now() - 8 * 3600 * 1000),
    },
    createdAt: new Date(Date.now() - 8 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1011',
    customerId: alexUser._id,
    customerName: alexUser.name,
    customerEmail: alexUser.email,
    subject: 'Considering downgrading to Starter plan due to budget cuts',
    status: 'open',
    priority: 'urgent',
    messages: [
      {
        sender: 'customer',
        senderName: alexUser.name,
        text: 'Due to company-wide cost consolidation, TechCorp is evaluating whether to downgrade our OmniPulse Enterprise subscription down to the Starter tier next month. Who can we talk to about custom volume pricing?',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Neutral',
      sentimentScore: 50,
      churnRisk: 'High',
      churnRiskReason: 'Direct notification of planned tier downgrade driven by corporate budget contraction.',
      category: 'Billing',
      summary: 'TechCorp evaluating downgrade from Enterprise to Starter plan due to internal cost consolidation; requesting volume pricing discussion.',
      suggestedReply: `Hi Alex,

Thank you for reaching out transparently. We value TechCorp as a long-term enterprise partner and want to ensure you retain critical features like automated triage and data connectors without exceeding your budget.

I have looped in our Director of Customer Growth, Marcus Vance, who can review tailored volume concessions and annual restructuring options for you. 

Would you have 15 minutes for a brief call tomorrow afternoon?

Warm regards,
OmniPulse Executive Accounts`,
      analyzedAt: new Date(Date.now() - 6 * 3600 * 1000),
    },
    createdAt: new Date(Date.now() - 6 * 3600 * 1000),
  },
  {
    ticketNumber: 'TKT-1012',
    customerId: elenaUser._id,
    customerName: elenaUser.name,
    customerEmail: elenaUser.email,
    subject: 'Request: Dark mode theme preference persistence',
    status: 'resolved',
    priority: 'low',
    assignedAgentId: agentUser._id,
    messages: [
      {
        sender: 'customer',
        senderName: elenaUser.name,
        text: 'Quick UI question: every time I clear cookies the portal reverts to light mode. Can theme preference be stored on our user profile in the database?',
        timestamp: new Date(Date.now() - 90 * 3600 * 1000),
      },
      {
        sender: 'agent',
        senderName: agentUser.name,
        text: 'Hi Elena! We just pushed an update yesterday that syncs your theme preference to your cloud profile! You can toggle it once and it will stay persisted across all devices.',
        timestamp: new Date(Date.now() - 88 * 3600 * 1000),
      },
    ],
    aiAnalysis: {
      sentiment: 'Positive',
      sentimentScore: 88,
      churnRisk: 'Low',
      churnRiskReason: 'Minor UI preference with positive reception to recent platform improvements.',
      category: 'Feature Request',
      summary: 'User requested cloud profile persistence for dark mode preference. Successfully resolved with latest release update.',
      suggestedReply: `Hi Elena,

Awesome! Give it a spin and let us know if your settings stay locked in. Happy browsing!

Best,
OmniPulse Support`,
      analyzedAt: new Date(Date.now() - 90 * 3600 * 1000),
    },
    resolvedAt: new Date(Date.now() - 88 * 3600 * 1000),
    createdAt: new Date(Date.now() - 90 * 3600 * 1000),
  },
];
