import { RateLimiter, API_RATE_LIMITS } from '../middleware/rate-limiter';

interface Breach {
  organization: string;
  date: string;
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
    
    if (rows.length === 0) {
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
    
    // Validate and sanitize data
    const breaches: Breach[] = rows.slice(2)
      .map((row: string[]) => {
        const organization = (row[0] || "").trim();
        const date = (row[4] || "").trim();
        const type = (row[2] || "").trim();
        const rawSource = (row[9] || "").trim();
        
        // Validate required fields
        if (!organization) return null;
        
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
        
        return {
          organization,
          date,
          type,
          impact: "", // Not available in current sheet structure
          description: "", // Not available in current sheet structure
          source: validSource
        };
      })
      .filter((breach): breach is Breach => breach !== null)
      .sort((a, b) => {
        // Sort by date descending (most recent first)
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      });
    
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