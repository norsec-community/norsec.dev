import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, MapPin, ExternalLink, Clock, Copy, List, Grid3X3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConferenceEvent {
  name: string;
  date: string;
  location: string;
  website?: string;
  description?: string;
  type?: string;
  parsedDate?: Date | null;
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['/api/conferences'],
    enabled: true
  });

  // Parse and prepare event data - API now returns ISO dates only
  const processedEvents = (events as ConferenceEvent[] | undefined)?.map((event: ConferenceEvent) => {
    let parsedDate: Date | null = null;
    
    if (event.date && event.date.trim() !== '') {
      try {
        parsedDate = parseISO(event.date);
        if (!isValid(parsedDate)) {
          console.warn(`Invalid ISO date received from API: "${event.date}"`);
          parsedDate = null;
        }
      } catch (error) {
        console.error(`Failed to parse ISO date: "${event.date}"`, error);
        parsedDate = null;
      }
    }
    
    return {
      ...event,
      parsedDate
    };
  }) || [];

  // Get events for selected month
  const getEventsForMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    return processedEvents.filter(event => {
      if (!event.parsedDate) return false;
      return event.parsedDate >= monthStart && event.parsedDate <= monthEnd;
    });
  };

  // Get events for specific date
  const getEventsForDate = (date: Date) => {
    return processedEvents.filter(event => {
      if (!event.parsedDate) return false;
      return isSameDay(event.parsedDate, date);
    });
  };

  // Get dates that have events
  const getDatesWithEvents = () => {
    return processedEvents
      .filter(event => event.parsedDate)
      .map(event => event.parsedDate!);
  };

  const copyToClipboard = async (url: string, eventName: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: `${eventName} website link copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-norsec-light">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Cybersecurity Conference Calendar</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-700">
                Unable to load conference data. This feature requires access to the Google Sheets API.
                Please ensure the API is properly configured.
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-norsec-dark">Cybersecurity Conference Calendar</h1>
          <div className="text-lg text-gray-600 mb-6">
            <p className="mb-2">Primary maintainer: ZeroChill</p>
            <p>
              Original: <a 
                href="https://docs.google.com/spreadsheets/d/1i3ltEo2GhEiAFWdQOOqp7DY0LZ9GRwKknie5FKGdB3k/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-norsec-primary hover:text-norsec-secondary underline"
              >
                https://docs.google.com/spreadsheets/d/1i3ltEo2GhEiAFWdQOOqp7DY0LZ9GRwKknie5FKGdB3k/edit?usp=sharing
              </a>
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Calendar View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List View
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg w-80"></div>
            </div>
          </div>
        ) : events && Array.isArray(events) && events.length > 0 ? (
          <div className="space-y-8">
            {viewMode === 'calendar' ? (
              <div className="flex flex-col lg:flex-row gap-8 justify-center">
                {/* Calendar Component */}
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={{
                      hasEvents: getDatesWithEvents()
                    }}
                    modifiersClassNames={{
                      hasEvents: "bg-norsec-primary/20 font-semibold text-norsec-primary"
                    }}
                    className="rounded-md border shadow-md"
                  />
                </div>
                
                {/* Events for Selected Date */}
                {selectedDate && (
                  <div className="max-w-md">
                    <h3 className="text-lg font-semibold mb-4 text-norsec-dark">
                      Events for {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    {getEventsForDate(selectedDate).length > 0 ? (
                      <div className="space-y-3">
                        {getEventsForDate(selectedDate).map((event: ConferenceEvent, index: number) => (
                          <Card key={index} className="">
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-norsec-dark mb-2">{event.name}</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="mr-2 h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                                {event.description && (
                                  <p className="text-sm text-gray-600">{event.description}</p>
                                )}
                                {event.website && (
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={event.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-norsec-primary hover:text-norsec-secondary transition-colors"
                                    >
                                      <ExternalLink className="mr-1 h-3 w-3" />
                                      <span className="text-xs">Visit Website</span>
                                    </a>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyToClipboard(event.website!, event.name)}
                                      className="h-6 px-2"
                                    >
                                      <Copy className="h-2 w-2" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No events scheduled for this date.</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* List View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedEvents.map((event: ConferenceEvent, index: number) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-semibold text-norsec-dark line-clamp-2">
                          {event.name}
                        </h3>
                        {event.type && (
                          <span className="bg-norsec-primary text-white px-2 py-1 rounded text-xs">
                            {event.type}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span className="text-sm">
                            {event.parsedDate ? format(event.parsedDate, 'MMM d, yyyy') : event.date}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {event.description}
                          </p>
                        )}
                        
                        {event.website && (
                          <div className="flex items-center gap-2">
                            <a
                              href={event.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-norsec-primary hover:text-norsec-secondary transition-colors"
                            >
                              <ExternalLink className="mr-1 h-4 w-4" />
                              <span className="text-sm">Visit Website</span>
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(event.website!, event.name)}
                              className="h-7 px-2"
                            >
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Copy link</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600">
                No upcoming cybersecurity conferences are currently available.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}