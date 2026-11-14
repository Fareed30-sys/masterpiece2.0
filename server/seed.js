import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import KnowledgeItem from './models/KnowledgeItem.js';
import InsightReport from './models/InsightReport.js';
import { demoUsers, demoKnowledgeItems, generateTickets } from './utils/seedData.js';
import { mockExecutiveReport } from './utils/mockAI.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/omnipulse';

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await KnowledgeItem.deleteMany({});
    await InsightReport.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const createdUsers = [];
    for (const u of demoUsers) {
      const passwordHash = await User.hashPassword(u.password);
      const userDoc = await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        companyName: u.companyName,
      });
      createdUsers.push(userDoc);
      console.log(`  ✓ Created ${u.role.toUpperCase()}: ${u.name} (${u.email}) [password: password123]`);
    }

    const agentUser = createdUsers.find((u) => u.role === 'agent');
    const alexUser = createdUsers.find((u) => u.email === 'alex.rivera@techcorp.io');
    const elenaUser = createdUsers.find((u) => u.email === 'elena@novaworks.com');

    console.log('[Seed] Populating Knowledge Base FAQs...');
    for (const item of demoKnowledgeItems) {
      await KnowledgeItem.create(item);
    }
    console.log(`  ✓ Inserted ${demoKnowledgeItems.length} knowledge base articles.`);

    console.log('[Seed] Generating 12 realistic CX tickets...');
    const tickets = generateTickets(agentUser, alexUser, elenaUser);
    const createdTickets = [];
    for (const t of tickets) {
      const doc = await Ticket.create(t);
      createdTickets.push(doc);
    }
    console.log(`  ✓ Inserted ${createdTickets.length} triaged tickets across 5 categories.`);

    console.log('[Seed] Generating initial Executive CX Insight Report...');
    const initialReportData = mockExecutiveReport(createdTickets);
    await InsightReport.create({
      title: initialReportData.title,
      generatedBy: agentUser._id,
      ticketsAnalyzedCount: createdTickets.length,
      overallHealthScore: initialReportData.overallHealthScore,
      executiveSummary: initialReportData.executiveSummary,
      topPainPoints: initialReportData.topPainPoints,
      churnDrivers: initialReportData.churnDrivers,
      recommendations: initialReportData.recommendations,
    });
    console.log('  ✓ Pre-calculated executive insights and leadership recommendations.');

    console.log('\n====================================================');
    console.log('🎉 OmniPulse AI Database Seed Completed Successfully!');
    console.log('====================================================');
    console.log('Demo Credentials for Instant Testing:');
    console.log('1. Agent / Executive View:');
    console.log('   Email:    agent@omnipulse.ai');
    console.log('   Password: password123');
    console.log('2. Customer View (Enterprise):');
    console.log('   Email:    alex.rivera@techcorp.io');
    console.log('   Password: password123');
    console.log('3. Customer View (Growth):');
    console.log('   Email:    elena@novaworks.com');
    console.log('   Password: password123');
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
