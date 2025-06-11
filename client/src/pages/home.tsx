import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import HeroSection from "@/components/hero-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
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
  const recentAnnouncements = announcements.filter(announcement => !announcement.pinned).slice(0, 2);

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
      <main>
        <HeroSection />
        
        {/* News & Announcements Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-norsec-dark">Latest News & Announcements</h2>
              <p className="text-lg text-gray-600">
                Stay updated with the latest Norsec community news
              </p>
            </div>

            <div className="space-y-6 mb-8">
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

              {/* Recent Announcements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div>
                        <CardTitle className="text-lg text-norsec-dark">{announcement.title}</CardTitle>
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
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">{announcement.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* View All News Button */}
            <div className="text-center">
              <Button asChild className="bg-norsec-primary hover:bg-norsec-secondary">
                <Link href="/news">
                  View All Announcements <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
