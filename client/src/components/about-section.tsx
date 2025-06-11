import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, BookOpen, Calendar, HandHeart, Lock, CheckCircle } from "lucide-react";

export default function AboutSection() {
  const features = [
    {
      icon: Shield,
      title: "Threat Intelligence",
      description: "Stay updated with the latest cybersecurity threats, vulnerabilities, and defensive strategies shared by industry professionals.",
      color: "bg-norsec-primary"
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "Connect with fellow security enthusiasts, students, and professionals to share knowledge and grow together.",
      color: "bg-norsec-green"
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Access tutorials, certifications guidance, study materials, and mentorship from experienced cybersecurity experts.",
      color: "bg-purple-500"
    },
    {
      icon: Calendar,
      title: "Regular Workshops",
      description: "Participate in hands-on workshops, CTF challenges, and security discussions to enhance your practical skills.",
      color: "bg-yellow-500"
    },
    {
      icon: HandHeart,
      title: "Career Support",
      description: "Get career advice, job opportunities, and networking support from the Norwegian cybersecurity community.",
      color: "bg-red-500"
    },
    {
      icon: Lock,
      title: "Secure Environment",
      description: "A safe, moderated space where everyone can learn and share without judgment, regardless of experience level.",
      color: "bg-indigo-500"
    }
  ];

  const guidelines = [
    {
      title: "Be Respectful",
      description: "Treat all members with kindness and respect"
    },
    {
      title: "Stay On Topic",
      description: "Keep discussions relevant to channel purposes"
    },
    {
      title: "No Spam",
      description: "Avoid excessive posting or promotional content"
    },
    {
      title: "Help Others",
      description: "Share knowledge and assist fellow members"
    }
  ];

  return (
    <section id="about" className="py-20 bg-norsec-darker">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">What Makes Us Special</h2>
          <p className="text-xl text-norsec-light max-w-3xl mx-auto">
            Norsec isn't just another Discord server - we're a carefully curated Norwegian cybersecurity community focused on learning, networking, and professional growth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="bg-norsec-dark border-none card-hover">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center mb-6`}>
                    <IconComponent className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                  <p className="text-norsec-light leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Server Rules Preview */}
        <div className="mt-20 bg-norsec-dark rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-white">Community Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map((guideline, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="text-norsec-green mt-1" size={20} />
                <div>
                  <h4 className="font-semibold mb-1 text-white">{guideline.title}</h4>
                  <p className="text-norsec-light text-sm">{guideline.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
