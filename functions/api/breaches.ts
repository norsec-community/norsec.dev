import { RateLimiter, API_RATE_LIMITS } from '../middleware/rate-limiter';

interface Breach {
  organization: string;
  date: string; // Always in ISO yyyy-MM-dd format
  type: string;
  impact: string;
  description: string;
  source: string;
}

interface ApiResponse<T> {
  data?: T[];
  error?: string;
  details?: string;
  cached?: boolean;
  timestamp?: number;
}

const CACHE_KEY = "breaches_data";
const CACHE_TTL = 1800; // 30 minutes in seconds (more frequent updates for security data)

// Date normalization function to convert various formats to ISO yyyy-MM-dd
function normalizeToISODate(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '';
  
  const trimmedDate = dateString.trim();
  
  // If already in ISO format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    return trimmedDate;
  }
  
  let parsedDate: Date | null = null;
  
  // Try various parsing approaches - prioritize EU format since that's common in Norwegian data
  try {
    // European dot format (primary): 22.06.2025 or 6.10.2025 (dd.MM.yyyy)
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(trimmedDate)) {
      const [day, month, year] = trimmedDate.split('.');
      parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // European slash format: 22/06/2025 or 6/10/2025 (dd/MM/yyyy)
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmedDate)) {
      const [day, month, year] = trimmedDate.split('/');
      parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // European dash format: 22-06-2025 or 6-10-2025 (dd-MM-yyyy)
    else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmedDate)) {
      const [day, month, year] = trimmedDate.split('-');
      parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // ISO with time: 2025-10-06T00:00:00 or 2025-10-06 00:00:00
    else if (/^\d{4}-\d{2}-\d{2}[T\s]/.test(trimmedDate)) {
      parsedDate = new Date(trimmedDate);
    }
    
    // Year only format: 2025
    else if (/^\d{4}$/.test(trimmedDate)) {
      parsedDate = new Date(parseInt(trimmedDate), 0, 1); // January 1st of that year
    }
    
    // US formats: Oct 6, 2025 or October 6, 2025
    else if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})$/i.test(trimmedDate)) {
      const usMonthMatch = trimmedDate.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})$/i);
      if (usMonthMatch) {
        parsedDate = new Date(`${usMonthMatch[1]} ${usMonthMatch[2]}, ${usMonthMatch[3]}`);
      }
    }
    
    // Try native Date constructor as fallback
    else {
      parsedDate = new Date(trimmedDate);
    }
    
    // Validate the parsed date
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      // Format as ISO date string (yyyy-MM-dd)
      return parsedDate.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error(`Failed to parse date: "${trimmedDate}"`, error);
  }
  
  // If all parsing fails, return empty string
  console.warn(`Unable to normalize date: "${trimmedDate}"`);
  return '';
}

export async function onRequest(context: any): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300" // 5 minutes browser cache
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Rate limiting
  const rateLimiter = new RateLimiter(API_RATE_LIMITS.standard, context.env.RATE_LIMIT_STORE);
  const rateLimitResult = await rateLimiter.isAllowed(context.request);
  
  if (!rateLimitResult.allowed) {
    return rateLimiter.createResponse(false, rateLimitResult.remaining, rateLimitResult.resetTime);
  }

  try {
    // Check cache first
    const cachedData = await context.env.BREACH_CACHE?.get(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const response: ApiResponse<Breach> = {
        data: parsed.data,
        cached: true,
        timestamp: parsed.timestamp
      };
      
      return new Response(JSON.stringify(response.data), {
        headers: { 
          ...corsHeaders, 
          "X-Cache": "HIT",
          "X-RateLimit-Limit": API_RATE_LIMITS.standard.maxRequests.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": Math.ceil(rateLimitResult.resetTime / 1000).toString()
        }
      });
    }

    const spreadsheetId = "1n5gJkgPVoGnyeUZAlmQUzv1dKtlwsKgG_DaRktTSuEs";
    const range = "Data%20Breach%20Tracker!A:J";
    const apiKey = context.env.GOOGLE_SHEETS_API_KEY;
    
    if (!apiKey) {
      const errorResponse: ApiResponse<Breach> = {
        error: "Configuration error",
        details: "Google Sheets API key not configured"
      };
      return new Response(JSON.stringify(errorResponse), { 
        status: 500,
        headers: corsHeaders
      });
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Norsec-Breach-API/1.0"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Sheets API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      const errorResponse: ApiResponse<Breach> = {
        error: "External API error",
        details: `Google Sheets API returned ${response.status}: ${response.statusText}`
      };
      
      return new Response(JSON.stringify(errorResponse), { 
        status: 502,
        headers: corsHeaders
      });
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    console.log(`Fetched ${rows.length} rows from 'Data Breach Tracker' sheet`);
    
    if (rows.length === 0) {
      console.warn("No data found in 'Data Breach Tracker' sheet");
      const emptyResponse: Breach[] = [];
      
      // Cache empty result for shorter time
      await context.env.BREACH_CACHE?.put(
        CACHE_KEY, 
        JSON.stringify({ data: emptyResponse, timestamp: Date.now() }), 
        { expirationTtl: 300 } // 5 minutes for empty results
      );
      
      return new Response(JSON.stringify(emptyResponse), {
        headers: { ...corsHeaders, "X-Cache": "MISS" }
      });
    }
    
    if (rows.length <= 2) {
      console.warn("Only header rows found in 'Data Breach Tracker' sheet");
    }
    
    // Log header rows for debugging
    if (rows.length > 0) {
      console.log("Header row 1:", rows[0]);
    }
    if (rows.length > 1) {
      console.log("Header row 2:", rows[1]);
    }
    
    // Validate and sanitize data
    const breaches: Breach[] = rows.slice(2)
      .map((row: string[], index: number) => {
        // Enhanced column mapping - let's explore more columns
        const organization = (row[0] || "").trim();
        const additionalInfo = (row[1] || "").trim(); // Might contain impact or description
        const type = (row[2] || "").trim();
        const possibleDescription = (row[3] || "").trim(); // Could be description
        const date = (row[4] || "").trim();
        const impact = (row[5] || "").trim(); // Potential impact column
        const col6 = (row[6] || "").trim(); // Additional data
        const col7 = (row[7] || "").trim(); // Additional data
        const col8 = (row[8] || "").trim(); // Additional data
        const rawSource = (row[9] || "").trim();
        
        // Log first few rows for debugging column structure
        if (index < 3) {
          console.log(`Row ${index + 3}:`, { 
            organization, additionalInfo, type, possibleDescription, 
            date, impact, col6, col7, col8, rawSource 
          });
        }
        
        // Validate required fields
        if (!organization) {
          if (index < 10) { // Only log first 10 empty rows to avoid spam
            console.log(`Skipping row ${index + 3}: missing organization name`);
          }
          return null;
        }
        
        // Sanitize source URL
        let validSource = "";
        if (rawSource) {
          if (rawSource.startsWith('http')) {
            try {
              const url = new URL(rawSource);
              validSource = url.toString();
            } catch {
              validSource = rawSource; // Keep original if URL parsing fails
            }
          } else {
            validSource = rawSource; // Non-URL source (e.g., news outlet name)
          }
        }
        
        // Build description from available fields
        const descriptionParts = [
          additionalInfo,
          possibleDescription,
          col6,
          col7,
          col8
        ].filter(part => part && part.length > 0);
        
        const description = descriptionParts.length > 0 ? descriptionParts.join(' | ') : '';
        
        return {
          organization,
          date: normalizeToISODate(date),
          type,
          impact: impact || '',
          description: description || '',
          source: validSource
        };
      })
      .filter((breach): breach is Breach => breach !== null)
      .sort((a, b) => {
        // Sort by date descending (most recent first) - now using normalized ISO dates
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        
        // With ISO format, string comparison works correctly
        return b.date.localeCompare(a.date);
      });
    
    console.log(`Successfully processed ${breaches.length} breaches from ${rows.length - 2} data rows`);
    
    // Cache the results
    const cacheData = {
      data: breaches,
      timestamp: Date.now()
    };
    
    await context.env.BREACH_CACHE?.put(
      CACHE_KEY, 
      JSON.stringify(cacheData), 
      { expirationTtl: CACHE_TTL }
    );
    
    return new Response(JSON.stringify(breaches), {
      headers: { 
        ...corsHeaders, 
        "X-Cache": "MISS",
        "X-RateLimit-Limit": API_RATE_LIMITS.standard.maxRequests.toString(),
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(rateLimitResult.resetTime / 1000).toString()
      }
    });
    
  } catch (error) {
    console.error("Unexpected error in breaches API:", error);
    
    const errorResponse: ApiResponse<Breach> = {
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    };
    
    return new Response(JSON.stringify(errorResponse), { 
      status: 500,
      headers: corsHeaders
    });
  }
}