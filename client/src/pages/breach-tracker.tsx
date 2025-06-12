import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isValid } from "date-fns";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Calendar, Building, Copy, ExternalLink, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BreachEvent {
  organization: string;
  date: string;
  type: string;
  impact: string;
  description: string;
  source: string;
}

export default function BreachTracker() {
  const { toast } = useToast();
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("all");
  
  const { data: breaches, isLoading, error } = useQuery<BreachEvent[]>({
    queryKey: ['/api/breaches'],
    enabled: true
  });

  // Format date with appropriate precision based on likely original data
  const formatDateWithPrecision = (dateString: string): string => {
    try {
      const parsedDate = parseISO(dateString);
      if (!isValid(parsedDate)) return dateString;
      
      const day = parsedDate.getDate();
      const month = parsedDate.getMonth();
      
      // If July 1st, likely was year-only data - show just year
      if (month === 6 && day === 1) {
        return parsedDate.getFullYear().toString();
      }
      
      // If 1st of any month, likely was year-month data - show "Month Year"
      if (day === 1) {
        return format(parsedDate, 'MMM yyyy');
      }
      
      // Otherwise, show full date
      return format(parsedDate, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  // Extract unique incident types from the data
  const incidentTypes = useMemo(() => {
    if (!breaches || !Array.isArray(breaches)) return [];
    const types = breaches
      .map((breach: BreachEvent) => breach.type?.toLowerCase())
      .filter((type): type is string => Boolean(type))
      .reduce((acc, type) => {
        if (!acc.includes(type)) acc.push(type);
        return acc;
      }, [] as string[])
      .sort();
    return types;
  }, [breaches]);

  // Extract unique years from the data (now using ISO dates)
  const years = useMemo(() => {
    if (!breaches || !Array.isArray(breaches)) return [];
    const yearList = breaches
      .map((breach: BreachEvent) => {
        if (!breach.date) return null;
        try {
          const parsedDate = parseISO(breach.date);
          return isValid(parsedDate) ? parsedDate.getFullYear().toString() : null;
        } catch {
          return null;
        }
      })
      .filter((year): year is string => Boolean(year))
      .reduce((acc, year) => {
        if (!acc.includes(year)) acc.push(year);
        return acc;
      }, [] as string[])
      .sort((a, b) => b.localeCompare(a)); // Sort years descending
    return yearList;
  }, [breaches]);

  // Filter breaches based on selected filters
  const filteredBreaches = useMemo(() => {
    if (!breaches || !Array.isArray(breaches)) return [];
    
    return breaches.filter((breach: BreachEvent) => {
      const typeMatch = selectedTypeFilter === "all" || breach.type?.toLowerCase() === selectedTypeFilter;
      
      // Year filtering now works with ISO dates
      let yearMatch = selectedYearFilter === "all";
      if (!yearMatch && breach.date) {
        try {
          const parsedDate = parseISO(breach.date);
          if (isValid(parsedDate)) {
            yearMatch = parsedDate.getFullYear().toString() === selectedYearFilter;
          }
        } catch {
          // If parsing fails, don't match
        }
      }
      
      return typeMatch && yearMatch;
    });
  }, [breaches, selectedTypeFilter, selectedYearFilter]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (impact: string) => {
    const lowerImpact = impact.toLowerCase();
    if (lowerImpact.includes('high') || lowerImpact.includes('critical')) return 'destructive';
    if (lowerImpact.includes('medium') || lowerImpact.includes('moderate')) return 'default';
    return 'secondary';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-norsec-light">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Norwegian Cybersecurity Breach Tracker</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-700">
                Unable to load breach data. Please ensure the API is properly configured.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-norsec-light">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-norsec-dark">Norwegian Cybersecurity Breach Tracker</h1>
          <div className="text-lg text-gray-600">
            <p className="mb-2">Primary maintainers: precursor, Furdy</p>
            <p>
              Original: <a 
                href="https://docs.google.com/spreadsheets/d/1n5gJkgPVoGnyeUZAlmQUzv1dKtlwsKgG_DaRktTSuEs/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-norsec-primary hover:text-norsec-secondary underline"
              >
                https://docs.google.com/spreadsheets/d/1n5gJkgPVoGnyeUZAlmQUzv1dKtlwsKgG_DaRktTSuEs/edit?usp=sharing
              </a>
            </p>
          </div>
        </div>

        {/* Filter Section */}
        {!error && (
          <div className="mb-8 space-y-6">
            {/* Incident Type Filter */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter by incident type:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTypeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTypeFilter("all")}
                  className="h-8"
                >
                  All Types ({breaches && Array.isArray(breaches) ? breaches.length : 0})
                </Button>
                {incidentTypes.map((type) => {
                  const count = breaches && Array.isArray(breaches) ? breaches.filter((breach: BreachEvent) => 
                    breach.type?.toLowerCase() === type
                  ).length : 0;
                  
                  return (
                    <Button
                      key={type}
                      variant={selectedTypeFilter === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTypeFilter(type)}
                      className="h-8 capitalize"
                    >
                      {type} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter by year:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedYearFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedYearFilter("all")}
                  className="h-8"
                >
                  All Years ({breaches && Array.isArray(breaches) ? breaches.length : 0})
                </Button>
                {years.map((year) => {
                  const count = breaches && Array.isArray(breaches) ? breaches.filter((breach: BreachEvent) => {
                    if (!breach.date) return false;
                    try {
                      const parsedDate = parseISO(breach.date);
                      return isValid(parsedDate) && parsedDate.getFullYear().toString() === year;
                    } catch {
                      return false;
                    }
                  }).length : 0;
                  
                  return (
                    <Button
                      key={year}
                      variant={selectedYearFilter === year ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedYearFilter(year)}
                      className="h-8"
                    >
                      {year} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedTypeFilter !== "all" || selectedYearFilter !== "all") && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Active filters:</span>
                {selectedTypeFilter !== "all" && (
                  <Badge variant="secondary" className="capitalize">
                    Type: {selectedTypeFilter}
                  </Badge>
                )}
                {selectedYearFilter !== "all" && (
                  <Badge variant="secondary">
                    Year: {selectedYearFilter}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTypeFilter("all");
                    setSelectedYearFilter("all");
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBreaches && filteredBreaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBreaches.map((breach: BreachEvent, index: number) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-norsec-dark line-clamp-2">
                      {breach.organization}
                    </CardTitle>
                    {breach.impact && (
                      <Badge variant={getSeverityColor(breach.impact)}>
                        {breach.impact}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {breach.date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span className="text-sm">
                          {formatDateWithPrecision(breach.date)}
                        </span>
                      </div>
                    )}
                    
                    {breach.type && (
                      <div className="flex items-center text-gray-600">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span className="text-sm">{breach.type}</span>
                      </div>
                    )}
                    
                    {breach.description && breach.description.trim() !== '' && (
                      <div className="text-sm text-gray-600">
                        <p className="line-clamp-2">{breach.description}</p>
                      </div>
                    )}
                    
                    {breach.source && (
                      <div className="flex items-center gap-2">
                        {breach.source.startsWith('http') ? (
                          <a
                            href={breach.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-norsec-primary hover:text-norsec-secondary transition-colors"
                          >
                            <ExternalLink className="mr-1 h-4 w-4" />
                            <span className="text-sm">Source</span>
                          </a>
                        ) : breach.source ? (
                          <span className="text-sm text-gray-600">{breach.source}</span>
                        ) : null}
                        {breach.source && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(breach.source, "Source")}
                            className="h-7 px-2"
                          >
                            <Copy className="h-3 w-3" />
                            <span className="sr-only">Copy source</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Breach Data Found</h3>
              <p className="text-gray-600">
                No cybersecurity breach incidents are currently available.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}