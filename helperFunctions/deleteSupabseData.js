import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xjbhipwzzvulfssvkars.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYmhpcHd6enZ1bGZzc3ZrYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzODg1NDYsImV4cCI6MjA1Nzk2NDU0Nn0.Gq8Jqt38f68gibMl9HsZlrWOsHoG3ItSepcUFv2qU8s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const tableMap = {
  'ev_6337457': 'autumn_festival_sponsor',
  'ev_4733324' : "autumn_festival_sponsor_v1",
  'ev_6803153' : "autumn_festival_speaker" ,
  'ev_6286249' : "autumn_festival_attendee" ,

  'ev_6320483' : "retailx_brief_executive" ,
  'ev_6341249' : "retail_x_brief_executive_sponsor",

  'ev_5929701' : "mad_world",
  'ev_6098674' : "mad_world",
  'ev_6098679' : "mad_world",
  'ev_6098686' : "mad_world",
  'ev_6430233' : "mad_world",
};

export const deleteSupabaseData = async (req, res) => {
  try {
    // Extract single ttEventId and email from req.query params
    const { ttEventId, email } = req.query;

    if (!ttEventId || !email) {
      return res.status(400).json({ error: 'Missing required query params: ttEventId and email' });
    }

    const eventId = ttEventId; // Single value
    const emailValue = email; // Single value

    const results = {
      success: [],
      errors: []
    };

    const tableName = tableMap[eventId];
    if (!tableName) {
      results.errors.push(`No table mapped for tt_event_id: ${eventId}`);
      results.success.push(false);
    } else {
      try {
        // Delete record where email matches (table is event-specific, so no tt_event_id filter needed)
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('email', emailValue);  // Single email match; assumes 'email' column exists

        if (error) {
          throw error;
        }

        results.success.push(true);
      } catch (error) {
        results.errors.push(`Error deleting from table '${tableName}' for event '${eventId}': ${error.message}`);
        results.success.push(false);
      }
    }

    // Determine overall status (single operation)
    const totalOperations = results.success.length;
    const successfulOps = results.success.filter(Boolean).length;

    let statusCode = 200;
    let message = 'Deletion completed';
    if (successfulOps === 0) {
      statusCode = 500;
      message = 'Deletion failed';
    }

    return res.status(statusCode).json({
      message,
      data: {
        ...results,
        summary: {
          total: totalOperations,
          successful: successfulOps,
          failed: totalOperations - successfulOps
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error in deleteSupabaseData:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};