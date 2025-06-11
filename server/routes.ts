import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Google Sheets API endpoint for conferences
  app.get("/api/conferences", async (req, res) => {
    try {
      const spreadsheetId = "1i3ltEo2GhEiAFWdQOOqp7DY0LZ9GRwKknie5FKGdB3k";
      const range = "A:F"; // Try without sheet name first
      const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Google Sheets API key not configured" 
        });
      }
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
      
      console.log("Attempting to fetch from URL:", url);
      console.log("API Key length:", apiKey ? apiKey.length : 'undefined');
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        console.error("Response status:", response.status);
        console.error("Response headers:", Object.fromEntries(response.headers.entries()));
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("API Response data:", data);
      
      const rows = data.values || [];
      
      if (rows.length === 0) {
        return res.json([]);
      }
      
      // Skip header row and map data based on your sheet structure
      // Columns: Name, Link, Usual time, Date start, Days, Country
      const conferences = rows.slice(1).map((row: string[]) => ({
        name: row[0] || "",
        date: row[3] || "", // Date start column
        location: row[5] || "", // Country column
        website: row[1] || "", // Link column
        description: `${row[4] ? row[4] + ' days' : ''}${row[2] ? ' - ' + row[2] : ''}`.trim(),
        type: "Conference"
      })).filter((conf: any) => conf.name); // Filter out empty rows
      
      res.json(conferences);
    } catch (error) {
      console.error("Error fetching conferences:", error);
      res.status(500).json({ 
        error: "Failed to fetch conference data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Norwegian Breach Tracker API endpoint
  app.get("/api/breaches", async (req, res) => {
    try {
      const spreadsheetId = "1n5gJkgPVoGnyeUZAlmQUzv1dKtlwsKgG_DaRktTSuEs";
      const range = "Data%20Breach%20Tracker!A:J"; // Fetch columns A through J to include source column
      const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Google Sheets API key not configured" 
        });
      }
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
      
      console.log("Attempting to fetch breach data from URL:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Breach API Error Response:", errorText);
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Breach API Response data:", data);
      
      const rows = data.values || [];
      
      if (rows.length === 0) {
        return res.json([]);
      }
      
      // Skip first 2 rows (headers) and map data starting from row 3
      // Columns: A=Company name, C=Incident type, E=Year, J=Source
      const breaches = rows.slice(2).map((row: string[]) => ({
        organization: row[0] || "", // Column A: Company name
        date: row[4] || "", // Column E: Year
        type: row[2] || "", // Column C: Incident type
        impact: "", // Not needed per user requirements
        description: "", // Not needed per user requirements
        source: row[9] || "" // Column J: Source (index 9 for column J)
      })).filter((breach: any) => breach.organization); // Filter out empty rows
      
      res.json(breaches);
    } catch (error) {
      console.error("Error fetching breaches:", error);
      res.status(500).json({ 
        error: "Failed to fetch breach data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
