import { useListContests } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users, TerminalSquare, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Contests() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "upcoming" | "ended">("all");
  const { data: _contests, isLoading } = useListContests({ status: statusFilter === "all" ? undefined : statusFilter as any });
  const contests = _contests as unknown as any[];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Contests Arena</h1>
          <p className="text-muted-foreground mt-1">Compete, solve problems, and climb the ranks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search contests..." 
              className="pl-9 bg-card border-border focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:text-primary">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ended">Past</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : contests?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-card/30">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No contests found</h3>
          <p className="text-muted-foreground max-w-md">There are no contests matching your current filters. Try selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {contests?.map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContestCard({ contest }: { contest: any }) {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30"><span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse"/> Active</Badge>;
      case 'upcoming': return <Badge variant="outline" className="text-blue-400 border-blue-400/30">Upcoming</Badge>;
      case 'ended': return <Badge variant="secondary" className="bg-muted text-muted-foreground">Ended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff?.toLowerCase()) {
      case 'beginner': return "text-green-400";
      case 'intermediate': return "text-blue-400";
      case 'advanced': return "text-purple-400";
      case 'expert': return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <Card className="flex flex-col border-border bg-card/50 backdrop-blur overflow-hidden hover:border-primary/50 transition-colors group">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          {getStatusBadge(contest.status)}
          <Badge variant="outline" className="border-border uppercase text-[10px] tracking-wider">
            {contest.type}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
          <Link href={`/contests/${contest.id}`}>
            {contest.title}
          </Link>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Start</div>
            <div className="font-mono text-white">
              {new Date(contest.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              <span className="text-muted-foreground ml-1">{new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><TerminalSquare className="w-3 h-3"/> Duration</div>
            <div className="font-mono text-white">{contest.duration} min</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{contest.participantCount} {contest.maxParticipants ? `/ ${contest.maxParticipants}` : ''}</span>
          </div>
          {contest.difficulty && (
            <div className={`font-medium text-xs uppercase tracking-wider ${getDifficultyColor(contest.difficulty)}`}>
              • {contest.difficulty}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/contests/${contest.id}`} className="w-full">
          <Button variant={contest.status === 'active' ? "default" : "secondary"} className="w-full font-bold">
            {contest.status === 'active' ? 'Enter Arena' : contest.status === 'upcoming' ? 'View Details' : 'Practice / Virtual'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
