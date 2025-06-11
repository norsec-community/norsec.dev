import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pin } from "lucide-react";

export default function News() {
  const announcements = [
    {
      id: 1,
      title: "Welcome to Norsec Community!",
      content: "We're excited to launch the official Norsec website. This is your hub for Norwegian cybersecurity resources, events, and community updates.",
      date: "January 15, 2025",
      type: "Welcome",
      pinned: true
    },
    {
      id: 2,
      title: "New Breach Tracker Available",
      content: "Our Norwegian cybersecurity incident tracker is now live! Track security breaches affecting Norwegian organizations with real-time data.",
      date: "January 12, 2025",
      type: "Feature"
    },
    {
      id: 3,
      title: "Calendar Integration Complete",
      content: "The cybersecurity conference calendar is now integrated with live data from our community-maintained spreadsheet. Stay updated on upcoming events!",
      date: "January 10, 2025",
      type: "Update"
    }
  ];

  const pinnedAnnouncements = announcements.filter(announcement => announcement.pinned);
  const regularAnnouncements = announcements.filter(announcement => !announcement.pinned);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-purple-100 text-purple-800';
      case 'alert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-norsec-light">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-norsec-dark">News & Announcements</h1>
          <p className="text-lg text-gray-600">
            Stay updated with the latest Norsec community news
          </p>
        </div>

        <div className="space-y-6">
          {/* Pinned Announcements */}
          {pinnedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="border-l-4 border-l-norsec-primary shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Pin className="w-5 h-5 text-norsec-primary" />
                    <div>
                      <CardTitle className="text-xl text-norsec-dark">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getTypeColor(announcement.type)}>
                          {announcement.type}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {announcement.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}

          {/* Regular Announcements */}
          {regularAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-norsec-dark">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {announcement.date}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No announcements yet. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  );
}