import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xjbhipwzzvulfssvkars.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYmhpcHd6enZ1bGZzc3ZrYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzODg1NDYsImV4cCI6MjA1Nzk2NDU0Nn0.Gq8Jqt38f68gibMl9HsZlrWOsHoG3ItSepcUFv2qU8s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const storeEmailInSupabase = async (eventTable, email) => {
  try {
    // First, check if the email already exists
    const { data: existing, error: fetchError } = await supabase
      .from(eventTable)
      .select("email")
      .eq("email", email)
      .maybeSingle(); // Since email should be unique

    if (fetchError) {
      console.error(
        `❌ Error checking existing email in ${eventTable}:`,
        fetchError.message
      );
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
      console.error(
        `❌ Error inserting email into ${eventTable}:`,
        insertError.message
      );
      return false;
    }

    console.log(`✅ Stored email in ${eventTable}: ${email}`);
    return true;
  } catch (err) {
    console.error(
      `❌ Exception inserting email into ${eventTable}:`,
      err.message
    );
    return false;
  }
};

export const storeAllEmailInSupabase = async (
  eventTable,
  email,
  event_id,
  insert = false
) => {
  try {
    // First, check if the email already exists
    const { data: existing, error: fetchError } = await supabase
      .from(eventTable)
      .select("email")
      .eq("email", email)
      .eq("eventId", event_id)
      .maybeSingle(); // Since email should be unique

    if (fetchError) {
      console.error(
        `❌ Error checking existing email in ${eventTable}:`,
        fetchError.message
      );
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
      console.error(
        `❌ Error inserting email into ${eventTable}:`,
        insertError.message
      );
      return false;
    }
    //}

    console.log(`✅ Stored email in ${eventTable}: ${email}`);
    return true;
  } catch (err) {
    console.error(
      `❌ Exception inserting email into ${eventTable}:`,
      err.message
    );
    return false;
  }
};

export const logE2MError = async (logData) => {
  try {
    const { tt_event_id, e2m_event_id, email, error, status, e2m_payload } =
      logData;

    // Check if the combination of email, e2m_event_id, and tt_event_id already exists
    const { data: existing, error: fetchError } = await supabase
      .from("e2m_error_log")
      .select("*")
      .eq("email", email)
      .eq("e2m_event_id", e2m_event_id)
      .eq("tt_event_id", tt_event_id)
      .maybeSingle();

    if (fetchError) {
      console.error(
        `❌ Error checking existing email in e2m_error_log:`,
        fetchError.message
      );
      return false;
    }

    if (existing && existing.status < 1) {
      console.log(
        `⚠️ Record already exists in error log for email: ${email}, tt_event: ${tt_event_id}, e2m_event: ${e2m_event_id}`
      );
      return true; // Return true since it's already logged
    }

    // Insert new record
    const { error: insertError } = await supabase.from("e2m_error_log").insert([
      {
        tt_event_id,
        e2m_event_id,
        email,
        error,
        status,
        e2m_payload,
      },
    ]);

    if (insertError) {
      console.error(
        `❌ Error inserting into e2m_error_log:`,
        insertError.message
      );
      return false;
    }

    console.log(
      `✅ Logged error for: ${email} (tt_event: ${tt_event_id}, e2m_event: ${e2m_event_id})`
    );
    return true;
  } catch (err) {
    console.error(`❌ Exception logging error to e2m_error_log:`, err.message);
    return false;
  }
};

export const checkEmailExists = async (tableName, email) => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from(tableName)
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error(
        `❌ Error checking existing email in ${tableName}:`,
        fetchError.message
      );
      return false;
    }

    return !!existing;
  } catch (error) {
    console.error(
      `❌ Exception checking email in ${tableName}:`,
      error.message
    );
    return false;
  }
};

export const insertPayloadData = async (tableName, payload) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert({ payload: payload });

    if (error) {
      console.error("Supabase insert error:", JSON.stringify(error, null, 2));
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error inserting payload:", JSON.stringify(error, null, 2));
    return { success: false, error: error.message || JSON.stringify(error) };
  }
};

export const insertTicketOrder = async (
  email,
  e2mEventId,
  ttEventId,
  status,
  payload,
  errorMsg
) => {
  try {
    // Check if a record exists with the given key and status = '0'
    const { data: existingData, error: selectError } = await supabase
      .from('ticket_tailer_orders')
      .select('*')
      .eq('email', email)
      .eq('e2m_event_id', e2mEventId)
      .eq('tt_event_id', ttEventId)
      .eq('status', '0')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 means "no rows found", which is not an error for us
      console.error('❌ Error checking existing record:', selectError.message);
      return { success: false, error: selectError.message };
    }

    if (existingData) {
      // Record exists with status = '0', stop execution and return success
      console.log(`✅ Skipping insert: Record already exists with status '0' for email: ${email}, tt_event_id: ${ttEventId}, e2m_event_id: ${e2mEventId}`);
      return { success: false, data: existingData };
    }

    // If no record with status = '0', attempt to insert
    const { data, error } = await supabase
      .from('ticket_tailer_orders')
      .insert({
        email: email,
        e2m_event_id: e2mEventId,
        tt_event_id: ttEventId,
        status: status,
        payload: payload,
        error_msg: errorMsg || null,
        error_flag: errorMsg ? true : false,
      })
      .select();

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ Inserted ticket order for email: ${email}, tt_event_id: ${ttEventId}, e2m_event_id: ${e2mEventId}`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error inserting ticket order:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateTicketOrderStatus = async (email, e2mEventId, ttEventId, status, errorMsg = null) => {
  try {
    // If an external error message is provided (e.g., from registration API), treat it as an error case
    if (errorMsg) {
      const { data, error: updateError } = await supabase
        .from('ticket_tailer_orders')
        .update({
          status: status,
          error_flag: true,
          error_msg: { error: errorMsg }
        })
        .eq('email', email)
        .eq('e2m_event_id', e2mEventId)
        .eq('tt_event_id', ttEventId)
        .select();

      if (updateError) {
        console.error('❌ Error updating ticket_tailer_orders with error details:', updateError.message);
        return { success: false, error: updateError.message };
      }

      if (!data || data.length === 0) {
        console.error('❌ No record found for email:', email, 'tt_event_id:', ttEventId, 'e2m_event_id:', e2mEventId);
        return { success: false, error: 'No matching record found' };
      }

      console.log(`✅ Updated status to ${status} with error for email: ${email}, tt_event_id: ${ttEventId}, e2m_event_id: ${e2mEventId}`);
      return { success: true, data };
    }

    // Normal case: attempt to update status
    const { data, error } = await supabase
      .from('ticket_tailer_orders')
      .update({ status: status })
      .eq('email', email)
      .eq('e2m_event_id', e2mEventId)
      .eq('tt_event_id', ttEventId)
      .select();

    if (error) {
      console.error('❌ Error updating status in ticket_tailer_orders:', error.message);
      // Update status, error_flag, and error_msg on error
      const errorUpdate = await supabase
        .from('ticket_tailer_orders')
        .update({
          status: status,
          error_flag: true,
          error_msg: { error: error.message }
        })
        .eq('email', email)
        .eq('e2m_event_id', e2mEventId)
        .eq('tt_event_id', ttEventId)
        .select();

      if (errorUpdate.error) {
        console.error('❌ Failed to update error_flag and error_msg:', errorUpdate.error.message);
      }

      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error('❌ No record found for email:', email, 'tt_event_id:', ttEventId, 'e2m_event_id:', e2mEventId);
      // Update error_flag and error_msg for no record found
      const errorUpdate = await supabase
        .from('ticket_tailer_orders')
        .update({
          status: status,
          error_flag: true,
          error_msg: { error: 'No matching record found' }
        })
        .eq('email', email)
        .eq('e2m_event_id', e2mEventId)
        .eq('tt_event_id', ttEventId)
        .select();

      if (errorUpdate.error) {
        console.error('❌ Failed to update error_flag and error_msg:', errorUpdate.error.message);
      }

      return { success: false, error: 'No matching record found' };
    }

    console.log(`✅ Updated status to ${status} for email: ${email}, tt_event_id: ${ttEventId}, e2m_event_id: ${e2mEventId}`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception updating status in ticket_tailer_orders:', error.message);
    // Update status, error_flag, and error_msg on exception
    const errorUpdate = await supabase
      .from('ticket_tailer_orders')
      .update({
        status: status,
        error_flag: true,
        error_msg: { error: error.message }
      })
      .eq('email', email)
      .eq('e2m_event_id', e2mEventId)
      .eq('tt_event_id', ttEventId)
      .select();

    if (errorUpdate.error) {
      console.error('❌ Failed to update error_flag and error_msg:', errorUpdate.error.message);
    }

    return { success: false, error: error.message };
  }
};
