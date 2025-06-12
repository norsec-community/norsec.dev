import { RateLimiter, API_RATE_LIMITS } from '../middleware/rate-limiter';

interface Conference {
  name: string;
  date: string; // Always in ISO yyyy-MM-dd format
  location: string;
  website: string;
  description: string;
  type: string;
}

interface ApiResponse<T> {
  data?: T[];
  error?: string;
  details?: string;
  cached?: boolean;
  timestamp?: number;
}

const CACHE_KEY = "conferences_data";
const CACHE_TTL = 3600; // 1 hour in seconds

// Date normalization function to convert various formats to ISO yyyy-MM-dd
function normalizeToISODate(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '';
  
  const trimmedDate = dateString.trim();
  
  // If already in ISO format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    return trimmedDate;
  }
  
  let parsedDate: Date | null = null;
  
  // Try various parsing approaches
  try {
    // US formats: Oct 6, 2025 or October 6, 2025
    const usMonthMatch = trimmedDate.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})$/i);
    if (usMonthMatch) {
      parsedDate = new Date(`${usMonthMatch[1]} ${usMonthMatch[2]}, ${usMonthMatch[3]}`);
    }
    
    // European dot format: 22.06.2025 or 6.10.2025
    else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(trimmedDate)) {
      const [day, month, year] = trimmedDate.split('.');
      parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // European slash format: 22/06/2025 or 6/10/2025  
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmedDate)) {
      const [day, month, year] = trimmedDate.split('/');
      parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // US slash format: 10/06/2025 or 10/6/2025
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmedDate)) {
      // This is ambiguous - could be MM/dd/yyyy or dd/MM/yyyy
      // We'll assume MM/dd/yyyy for US format
      const [month, day, year] = trimmedDate.split('/');
      parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Dash formats: MM-dd-yyyy or dd-MM-yyyy
    else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmedDate)) {
      // Assume MM-dd-yyyy format
      const [month, day, year] = trimmedDate.split('-');
      parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // ISO with time: 2025-10-06T00:00:00 or 2025-10-06 00:00:00
    else if (/^\d{4}-\d{2}-\d{2}[T\s]/.test(trimmedDate)) {
      parsedDate = new Date(trimmedDate);
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
    const cachedData = await context.env.CONFERENCE_CACHE?.get(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const response: ApiResponse<Conference> = {
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

    const spreadsheetId = "1i3ltEo2GhEiAFWdQOOqp7DY0LZ9GRwKknie5FKGdB3k";
    const range = "A:F";
    const apiKey = context.env.GOOGLE_SHEETS_API_KEY;
    
    if (!apiKey) {
      const errorResponse: ApiResponse<Conference> = {
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
        "User-Agent": "Norsec-Conference-API/1.0"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Sheets API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      const errorResponse: ApiResponse<Conference> = {
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
    
    if (rows.length === 0) {
      const emptyResponse: Conference[] = [];
      
      // Cache empty result for shorter time
      await context.env.CONFERENCE_CACHE?.put(
        CACHE_KEY, 
        JSON.stringify({ data: emptyResponse, timestamp: Date.now() }), 
        { expirationTtl: 600 } // 10 minutes for empty results
      );
      
      return new Response(JSON.stringify(emptyResponse), {
        headers: { ...corsHeaders, "X-Cache": "MISS" }
      });
    }
    
    // Validate and sanitize data
    const conferences: Conference[] = rows.slice(1)
      .map((row: string[]) => {
        const name = (row[0] || "").trim();
        const website = (row[1] || "").trim();
        const date = (row[3] || "").trim();
        const location = (row[5] || "").trim();
        const duration = (row[4] || "").trim();
        const details = (row[2] || "").trim();
        
        // Validate required fields
        if (!name) return null;
        
        // Sanitize website URL
        let validWebsite = "";
        if (website) {
          try {
            const url = new URL(website.startsWith('http') ? website : `https://${website}`);
            validWebsite = url.toString();
          } catch {
            validWebsite = website; // Keep original if URL parsing fails
          }
        }
        
        return {
          name,
          date: normalizeToISODate(date),
          location,
          website: validWebsite,
          description: `${duration ? duration + ' days' : ''}${details ? ' - ' + details : ''}`.trim(),
          type: "Conference"
        };
      })
      .filter((conf): conf is Conference => conf !== null);
    
    // Cache the results
    const cacheData = {
      data: conferences,
      timestamp: Date.now()
    };
    
    await context.env.CONFERENCE_CACHE?.put(
      CACHE_KEY, 
      JSON.stringify(cacheData), 
      { expirationTtl: CACHE_TTL }
    );
    
    return new Response(JSON.stringify(conferences), {
      headers: { 
        ...corsHeaders, 
        "X-Cache": "MISS",
        "X-RateLimit-Limit": API_RATE_LIMITS.standard.maxRequests.toString(),
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(rateLimitResult.resetTime / 1000).toString()
      }
    });
    
  } catch (error) {
    console.error("Unexpected error in conferences API:", error);
    
    const errorResponse: ApiResponse<Conference> = {
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    };
    
    return new Response(JSON.stringify(errorResponse), { 
      status: 500,
      headers: corsHeaders
    });
  }
}