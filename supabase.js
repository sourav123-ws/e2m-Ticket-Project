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

    // Check if email already exists in error log
    const { data: existing, error: fetchError } = await supabase
      .from('e2m_error_log')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.error(`❌ Error checking existing email in e2m_error_log:`, fetchError.message);
      return false;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('e2m_error_log')
        .update({
          tt_event_id,
          e2m_event_id,
          error,
          status,
          e2m_payload,
          created_at: new Date().toISOString() // Update timestamp
        })
        .eq('email', email);

      if (updateError) {
        console.error(`❌ Error updating e2m_error_log:`, updateError.message);
        return false;
      }

      console.log(`✅ Updated error log for: ${email}`);
      return true;
    }

    // Insert new record if not found
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

    console.log(`✅ Logged error for: ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ Exception logging error to e2m_error_log:`, err.message);
    return false;
  }
};