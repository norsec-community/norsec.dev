import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, ExternalLink, MessageCircle } from "lucide-react";

interface DiscordMember {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  status: string;
}

interface DiscordWidget {
  id: string;
  name: string;
  instant_invite: string | null;
  channels: Array<{
    id: string;
    name: string;
    position: number;
  }>;
  members: DiscordMember[];
  presence_count: number;
}

export default function DiscordWidget({ serverId }: { serverId: string }) {
  const [widget, setWidget] = useState<DiscordWidget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWidget = async () => {
      try {
        const response = await fetch(`https://discord.com/api/guilds/${serverId}/widget.json`);
        
        if (!response.ok) {
          throw new Error('Discord widget not available or server not found');
        }
        
        const data = await response.json();
        setWidget(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Discord widget');
        setWidget(null);
      } finally {
        setLoading(false);
      }
    };

    if (serverId) {
      fetchWidget();
      // Refresh every 5 minutes
      const interval = setInterval(fetchWidget, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [serverId]);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#5865F2]" />
            Discord Server
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !widget) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#5865F2]" />
            Norsec Discord
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Join our Norwegian cybersecurity community on Discord
          </p>
          <Button 
            asChild 
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
          >
            <a 
              href="https://discord.gg/norsec" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Join Discord Server <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const onlineMembers = widget.members.filter(member => 
    member.status === 'online' || member.status === 'idle' || member.status === 'dnd'
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#5865F2]" />
          {widget.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Server Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Total Members</span>
          </div>
          <Badge variant="secondary">{widget.presence_count}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Online Now</span>
          </div>
          <Badge className="bg-green-100 text-green-800">{onlineMembers.length}</Badge>
        </div>

        {/* Online Members Preview */}
        {onlineMembers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Online Members</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {onlineMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <div className="relative">
                    {member.avatar ? (
                      <img 
                        src={`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=32`}
                        alt={member.username}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-xs">
                        {member.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === 'online' ? 'bg-green-500' :
                      member.status === 'idle' ? 'bg-yellow-500' :
                      member.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <span className="text-sm text-gray-700">{member.username}</span>
                </div>
              ))}
              {onlineMembers.length > 5 && (
                <p className="text-xs text-gray-500">
                  +{onlineMembers.length - 5} more online
                </p>
              )}
            </div>
          </div>
        )}

        {/* Join Button */}
        {widget.instant_invite && (
          <Button 
            asChild 
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
          >
            <a 
              href={widget.instant_invite} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Join Server <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}