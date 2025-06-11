import { Button } from "@/components/ui/button";
import { ExternalLink, Newspaper } from "lucide-react";
import { Link } from "wouter";

export default function CTASection() {
  const handleJoinDiscord = () => {
    window.open("https://discord.gg/your-server-invite", "_blank");
  };

  return (
    <section className="gradient-bg py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Join Our Community?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Connect with Norwegian cybersecurity professionals, learn from experts, and advance your security career!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleJoinDiscord}
            className="bg-white text-norsec-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            <ExternalLink className="mr-3" size={20} />
            Join Discord Server
          </Button>
          <Link href="/news">
            <Button
              variant="outline"
              className="border-2 border-white hover:bg-white hover:text-norsec-primary px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 bg-transparent"
            >
              <Newspaper className="mr-3" size={20} />
              Browse News
            </Button>
          </Link>
        </div>
        
        {/* Online indicator */}
        <div className="mt-12 inline-flex items-center bg-black bg-opacity-20 rounded-full px-6 py-3">
          <div className="w-3 h-3 bg-norsec-green rounded-full pulse-animation mr-3"></div>
          <span className="text-sm font-medium text-white">85 members online now</span>
        </div>
      </div>
    </section>
  );
}
