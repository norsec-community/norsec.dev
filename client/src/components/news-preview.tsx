import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";

export default function NewsPreview() {
  const newsItems = [
    {
      id: 1,
      title: "Cybersecurity Workshop: Advanced Threat Hunting",
      excerpt: "Join our hands-on workshop covering advanced threat hunting techniques and tools used by Norwegian security professionals.",
      date: "December 15, 2024",
      gradient: "from-norsec-primary to-norsec-secondary"
    },
    {
      id: 2,
      title: "New CTF Challenge Platform Launched",
      excerpt: "We've launched our own Capture The Flag platform with beginner-friendly challenges designed by Norwegian security experts.",
      date: "December 12, 2024",
      gradient: "from-norsec-green to-green-600"
    },
    {
      id: 3,
      title: "Community Milestone: 500+ Security Enthusiasts!",
      excerpt: "We've reached an incredible milestone! Thank you to all our amazing community members for making this possible.",
      date: "December 10, 2024",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="py-20 bg-norsec-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Latest News</h2>
            <p className="text-norsec-light">Stay updated with the latest happenings in our community</p>
          </div>
          <Link href="/news">
            <Button className="btn-norsec px-6 py-3 rounded-lg font-medium">
              View All News
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item) => (
            <Card key={item.id} className="bg-norsec-darker border-none overflow-hidden card-hover">
              <div className={`h-48 bg-gradient-to-br ${item.gradient}`}></div>
              <CardContent className="p-6">
                <div className="flex items-center text-sm text-norsec-light mb-3">
                  <Calendar className="mr-2" size={16} />
                  <span>{item.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                <p className="text-norsec-light mb-4">{item.excerpt}</p>
                <Link href="/news">
                  <a className="text-norsec-primary hover:text-blue-300 font-medium">Read More →</a>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
