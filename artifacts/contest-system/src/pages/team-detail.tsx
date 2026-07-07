import { useGetTeam } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Trophy, Star, ArrowLeft, Crown, Shield } from "lucide-react";
import { getTierColor } from "@/lib/utils-cp";

export function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const teamId = parseInt(id, 10);
  const { data: team, isLoading } = useGetTeam(teamId, {
    query: { enabled: !!teamId },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-48 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Team not found.</p>
        <Link href="/teams">
          <Button variant="outline" className="mt-4">Back to Teams</Button>
        </Link>
      </div>
    );
  }

  const rankColors: Record<number, string> = {
    1: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    2: "text-slate-300 border-slate-300/30 bg-slate-300/10",
    3: "text-amber-600 border-amber-600/30 bg-amber-600/10",
  };
  const rankBadge = rankColors[team.rank ?? 99] ?? "text-muted-foreground border-border bg-muted/20";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/teams">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Teams
          </Button>
        </Link>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-primary" />
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <CardTitle className="text-3xl font-bold text-white">{team.name}</CardTitle>
                <Badge variant="outline" className={rankBadge}>Rank #{team.rank}</Badge>
              </div>
              {team.description && (
                <p className="text-muted-foreground mt-1">{team.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Team Rating", value: team.rating, icon: <Star className="w-4 h-4 text-yellow-400" /> },
              { label: "Members", value: `${team.memberCount}${team.maxMembers ? `/${team.maxMembers}` : ''}`, icon: <Users className="w-4 h-4 text-blue-400" /> },
              { label: "Contest Wins", value: team.contestsWon ?? 0, icon: <Trophy className="w-4 h-4 text-yellow-500" /> },
              { label: "Total Contests", value: team.totalContests ?? 0, icon: <Trophy className="w-4 h-4 text-muted-foreground" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/20 border border-border/50 gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase mb-1">
                  {icon} {label}
                </div>
                <div className="text-2xl font-mono font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(!team.members || team.members.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">No members yet.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {(team.members as any[]).map((member: any, idx: number) => (
                <div key={member.userId} className="flex items-center justify-between px-6 py-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <div className={`font-bold ${getTierColor(member.tier ?? 'newbie').split(' ')[0]}`}>
                        {member.username}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rating: <span className="font-mono text-white">{member.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "leader" && (
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10 gap-1">
                        <Crown className="w-3 h-3" /> Leader
                      </Badge>
                    )}
                    {member.role === "member" && (
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                        Member
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
