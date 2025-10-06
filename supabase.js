import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xjbhipwzzvulfssvkars.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYmhpcHd6enZ1bGZzc3ZrYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzODg1NDYsImV4cCI6MjA1Nzk2NDU0Nn0.Gq8Jqt38f68gibMl9HsZlrWOsHoG3ItSepcUFv2qU8s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);


export const storeEmailInSupabase = async (eventTable, email) => {
    try {
      // First, check if the email already exists
      const { data: existing, error: fetchError } = await supabase
        .from(eventTable)
        .select('email')
        .eq('email', email)
        .maybeSingle();  // Since email should be unique
  
      if (fetchError) {
        console.error(`❌ Error checking existing email in ${eventTable}:`, fetchError.message);
        return false;
      }
  
      if (existing) {
        console.log(`⚠️ Email already exists in ${eventTable}: ${email}`);
        return false;
      }
  
      // Insert only if not found
      const { error: insertError } = await supabase
        .from(eventTable)
        .insert([{ email }]);
  
      if (insertError) {
        console.error(`❌ Error inserting email into ${eventTable}:`, insertError.message);
        return false;
      }
  
      console.log(`✅ Stored email in ${eventTable}: ${email}`);
      return true;
    } catch (err) {
      console.error(`❌ Exception inserting email into ${eventTable}:`, err.message);
      return false;
    }
  };
  

  export const storeAllEmailInSupabase = async (eventTable, email, event_id, insert = false) => {
    try {
      // First, check if the email already exists
      const { data: existing, error: fetchError } = await supabase
        .from(eventTable)
        .select('email')
        .eq('email', email)
        .eq('eventId', event_id)
        .maybeSingle();  // Since email should be unique
  
      if (fetchError) {
        console.error(`❌ Error checking existing email in ${eventTable}:`, fetchError.message);
        return false;
      }
  
      if (existing) {
        console.log(`⚠️ Email already exists in ${eventTable}: ${email}`);
        return false;
      }
  
      // Insert only if not found
      //if (insert) {
      const { error: insertError } = await supabase
        .from(eventTable)
        .insert([{ email: email, eventId: event_id }]);
  
      if (insertError) {
        console.error(`❌ Error inserting email into ${eventTable}:`, insertError.message);
        return false;
      }
      //}
  
      console.log(`✅ Stored email in ${eventTable}: ${email}`);
      return true;
    } catch (err) {
      console.error(`❌ Exception inserting email into ${eventTable}:`, err.message);
      return false;
    }
  };

export const logE2MError = async (logData) => {
  try {
    const { tt_event_id, e2m_event_id, email, error, status, e2m_payload } = logData;

    // Check if the combination of email, e2m_event_id, and tt_event_id already exists
    const { data: existing, error: fetchError } = await supabase
      .from('e2m_error_log')
      .select('*')
      .eq('email', email)
      .eq('e2m_event_id', e2m_event_id)
      .eq('tt_event_id', tt_event_id)
      .maybeSingle();

    if (fetchError) {
      console.error(`❌ Error checking existing email in e2m_error_log:`, fetchError.message);
      return false;
    }

    if (existing && existing.status < 1 ) {
      console.log(`⚠️ Record already exists in error log for email: ${email}, tt_event: ${tt_event_id}, e2m_event: ${e2m_event_id}`);
      return true; // Return true since it's already logged
    }

    // Insert new record
    const { error: insertError } = await supabase
      .from('e2m_error_log')
      .insert([{
        tt_event_id,
        e2m_event_id,
        email,
        error,
        status,
        e2m_payload
      }]);

    if (insertError) {
      console.error(`❌ Error inserting into e2m_error_log:`, insertError.message);
      return false;
    }

    console.log(`✅ Logged error for: ${email} (tt_event: ${tt_event_id}, e2m_event: ${e2m_event_id})`);
    return true;
  } catch (err) {
    console.error(`❌ Exception logging error to e2m_error_log:`, err.message);
    return false;
  }
};

export const checkEmailExists = async (tableName,email) =>{
   try {
      const { data: existing, error: fetchError } = await supabase
        .from(tableName)
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (fetchError) {
        console.error(`❌ Error checking existing email in ${tableName}:`, fetchError.message);
        return false;
      }

      return !!existing;
    } catch (error) {
      console.error(`❌ Exception checking email in ${tableName}:`, error.message);
      return false;
    }
}

export const insertPayloadData = async (tableName, payload) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert({ payload: payload });

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inserting payload:', error);
    return { success: false, error: error.message };
  }
};

export const insertTicketOrder = async (email, e2mEventId, ttEventId, status , payload , errorMsg) => {
  try {
    const { data, error } = await supabase
      .from('ticket_tailer_orders')
      .insert({ 
        email: email,
        e2m_event_id: e2mEventId,
        tt_event_id: ttEventId,
        status: status ,
        payload : payload ,
        error : errorMsg
      });

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inserting ticket order:', error);
    return { success: false, error: error.message };
  }
};