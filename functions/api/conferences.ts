export async function onRequest(context: any) {
  try {
    const spreadsheetId = "1i3ltEo2GhEiAFWdQOOqp7DY0LZ9GRwKknie5FKGdB3k";
    const range = "A:F";
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
      console.error("API Error Response:", errorText);
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    if (rows.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const conferences = rows.slice(1).map((row: string[]) => ({
      name: row[0] || "",
      date: row[3] || "",
      location: row[5] || "",
      website: row[1] || "",
      description: `${row[4] ? row[4] + ' days' : ''}${row[2] ? ' - ' + row[2] : ''}`.trim(),
      type: "Conference"
    })).filter((conf: any) => conf.name);
    
    return new Response(JSON.stringify(conferences), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching conferences:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch conference data",
      details: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}