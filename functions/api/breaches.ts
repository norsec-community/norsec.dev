export async function onRequest(context: any) {
  try {
    const spreadsheetId = "1n5gJkgPVoGnyeUZAlmQUzv1dKtlwsKgG_DaRktTSuEs";
    const range = "Data%20Breach%20Tracker!A:J";
    const apiKey = context.env.GOOGLE_SHEETS_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "Google Sheets API key not configured" 
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Breach API Error Response:", errorText);
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    if (rows.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const breaches = rows.slice(2).map((row: string[]) => ({
      organization: row[0] || "",
      date: row[4] || "",
      type: row[2] || "",
      impact: "",
      description: "",
      source: row[9] || ""
    })).filter((breach: any) => breach.organization);
    
    return new Response(JSON.stringify(breaches), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching breaches:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch breach data",
      details: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}