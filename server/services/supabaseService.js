import { isSupabaseConfigured, getSupabase } from '../config/supabase.js';
import memoryStore from './memoryStore.js';

class SupabaseService {
  async findUserByEmail(email) {
    if (!isSupabaseConfigured()) {
      return memoryStore.findUserByEmail(email);
    }
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error || !data) {
        return memoryStore.findUserByEmail(email);
      }
      return {
        _id: data.id,
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        companyName: data.company_name,
      };
    } catch {
      return memoryStore.findUserByEmail(email);
    }
  }

  async findUserById(id) {
    if (!isSupabaseConfigured()) {
      return memoryStore.findUserById(id);
    }
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        return memoryStore.findUserById(id);
      }
      return {
        _id: data.id,
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        companyName: data.company_name,
      };
    } catch {
      return memoryStore.findUserById(id);
    }
  }

  async createUser({ name, email, password, role = 'customer', companyName = 'CloudScale Inc.' }) {
    const memUser = memoryStore.createUser({ name, email, password, role, companyName });
    if (!isSupabaseConfigured()) {
      return memUser;
    }
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: memUser._id,
            name,
            email: email.toLowerCase(),
            password,
            role,
            company_name: companyName,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return {
          _id: data.id,
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          companyName: data.company_name,
        };
      }
    } catch (err) {
      console.warn('[Supabase] Failed to write user to Supabase:', err.message);
    }
    return memUser;
  }

  async findTickets(filters = {}) {
    if (!isSupabaseConfigured()) {
      return memoryStore.findTickets(filters);
    }
    const supabase = getSupabase();
    try {
      let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });

      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return memoryStore.findTickets(filters);
      }

      return data.map((t) => ({
        _id: t.id,
        id: t.id,
        ticketNumber: t.ticket_number,
        customerId: t.customer_id,
        customerName: t.customer_name,
        customerEmail: t.customer_email,
        subject: t.subject,
        priority: t.priority,
        status: t.status,
        isVoiceMessage: t.is_voice_message,
        audioDuration: t.audio_duration,
        aiAnalysis: t.ai_analysis || {},
        messages: t.messages || [],
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
    } catch {
      return memoryStore.findTickets(filters);
    }
  }

  async findTicketById(id) {
    if (!isSupabaseConfigured()) {
      return memoryStore.findTicketById(id);
    }
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        return memoryStore.findTicketById(id);
      }

      return {
        _id: data.id,
        id: data.id,
        ticketNumber: data.ticket_number,
        customerId: data.customer_id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        subject: data.subject,
        priority: data.priority,
        status: data.status,
        isVoiceMessage: data.is_voice_message,
        audioDuration: data.audio_duration,
        aiAnalysis: data.ai_analysis || {},
        messages: data.messages || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch {
      return memoryStore.findTicketById(id);
    }
  }

  async createTicket(ticketData) {
    const memTicket = memoryStore.createTicket(ticketData);
    if (!isSupabaseConfigured()) {
      return memTicket;
    }
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            id: memTicket._id,
            ticket_number: memTicket.ticketNumber,
            customer_id: memTicket.customerId,
            customer_name: memTicket.customerName,
            customer_email: memTicket.customerEmail,
            subject: memTicket.subject,
            priority: memTicket.priority,
            status: memTicket.status,
            is_voice_message: memTicket.isVoiceMessage || false,
            audio_duration: memTicket.audioDuration || 0,
            ai_analysis: memTicket.aiAnalysis || {},
            messages: memTicket.messages || [],
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return memTicket;
      }
    } catch (err) {
      console.warn('[Supabase] Failed to write ticket to Supabase:', err.message);
    }
    return memTicket;
  }

  async updateTicket(id, updates) {
    const memUpdated = memoryStore.updateTicket(id, updates);
    if (!isSupabaseConfigured()) {
      return memUpdated;
    }
    const supabase = getSupabase();
    try {
      const dbUpdates = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.assignedAgentId) dbUpdates.assigned_agent_id = updates.assignedAgentId;
      if (updates.aiAnalysis) dbUpdates.ai_analysis = updates.aiAnalysis;
      if (updates.messages) dbUpdates.messages = updates.messages;
      dbUpdates.updated_at = new Date();

      await supabase.from('tickets').update(dbUpdates).eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Failed to update ticket in Supabase:', err.message);
    }
    return memUpdated;
  }

  async addMessage(ticketId, message) {
    const memUpdated = memoryStore.addMessage(ticketId, message);
    if (!isSupabaseConfigured()) {
      return memUpdated;
    }
    const supabase = getSupabase();
    try {
      if (memUpdated) {
        await supabase
          .from('tickets')
          .update({ messages: memUpdated.messages, updated_at: new Date() })
          .eq('id', ticketId);
      }
    } catch (err) {
      console.warn('[Supabase] Failed to append message in Supabase:', err.message);
    }
    return memUpdated;
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
