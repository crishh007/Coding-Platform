import { useGetContest, useGetContestProblems, useRegisterForContest, useStartVirtualParticipation, getGetContestQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, TerminalSquare, AlertCircle, Play, ChevronRight, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function ContestDetail() {
  const { id } = useParams<{ id: string }>();
  const contestId = parseInt(id, 10);
  const { toast } = useToast();

  const { data: _contest, isLoading: contestLoading } = useGetContest(contestId, {
    query: { enabled: !!contestId, queryKey: getGetContestQueryKey(contestId) }
  });
  const contest = _contest as any;
  
  const { data: _problems, isLoading: problemsLoading } = useGetContestProblems(contestId, {
    query: { enabled: !!contestId, queryKey: ["contestProblems", contestId] as any }
  });
  const problems = _problems as unknown as any[];

  const registerMutation = useRegisterForContest();
  const virtualMutation = useStartVirtualParticipation();

  const handleRegister = () => {
    registerMutation.mutate({ id: contestId, data: { userId: 1 } }, {
      onSuccess: () => {
        toast({ title: "Registered successfully", description: "You are now registered for this contest." });
      },
      onError: (err) => {
        toast({ title: "Registration failed", description: String(err), variant: "destructive" });
      }
    });
  };

  const handleVirtual = () => {
    virtualMutation.mutate({ id: contestId, data: { userId: 1 } }, {
      onSuccess: () => {
        toast({ title: "Virtual contest started", description: "Good luck!" });
      },
      onError: (err) => {
        toast({ title: "Failed to start virtual", description: String(err), variant: "destructive" });
      }
    });
  };

  if (contestLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-card/30 max-w-3xl mx-auto">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Contest Not Found</h3>
        <p className="text-muted-foreground mb-6">The contest you are looking for does not exist or has been removed.</p>
        <Link href="/contests"><Button>Back to Contests</Button></Link>
      </div>
    );
  }

  const isUpcoming = contest.status === 'upcoming';
  const isActive = contest.status === 'active';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header Card */}
      <Card className="border-border bg-card/50 backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TerminalSquare className="w-48 h-48" />
        </div>
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={
                  isActive ? "bg-primary/20 text-primary hover:bg-primary/30 border-primary/30" : 
                  isUpcoming ? "text-blue-400 border-blue-400/30" : 
                  "bg-muted text-muted-foreground"
                } variant={isActive ? "default" : isUpcoming ? "outline" : "secondary"}>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse"/>}
                  {contest.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{contest.type}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{contest.title}</h1>
              {contest.description && <p className="text-muted-foreground max-w-2xl">{contest.description}</p>}
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              {isUpcoming ? (
                <Button 
                  size="lg" 
                  className="w-full font-bold" 
                  disabled={contest.isRegistered || registerMutation.isPending}
                  onClick={handleRegister}
                >
                  {contest.isRegistered ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Registered</> : "Register Now"}
                </Button>
              ) : isActive ? (
                <Link 
                  href={problems && problems.length > 0 ? `/contests/${contest.id}/problems/${problems[0].id}` : "#"} 
                  onClick={(e) => {
                    if (!problems || problems.length === 0) {
                      e.preventDefault();
                      toast({ title: "No problems", description: "This contest has no problems available.", variant: "destructive" });
                    }
                  }}
                >
                  <Button size="lg" className="w-full font-bold" disabled={!problems || problems.length === 0}>Enter Arena</Button>
                </Link>
              ) : (
                contest.virtualAllowed && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full font-bold border-primary text-primary hover:bg-primary/10"
                    onClick={handleVirtual}
                    disabled={virtualMutation.isPending}
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Virtual
                  </Button>
                )
              )}
              <Link href={`/contests/${contest.id}/leaderboard`}>
                <Button size="lg" variant="secondary" className="w-full">View Leaderboard</Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/50">
            <div>
              <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Start Time</div>
              <div className="font-mono text-white text-sm">
                {new Date(contest.startTime).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> End Time</div>
              <div className="font-mono text-white text-sm">
                {new Date(contest.endTime).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><TerminalSquare className="w-3 h-3"/> Duration</div>
              <div className="font-mono text-white text-sm">{contest.duration} minutes</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Participants</div>
              <div className="font-mono text-white text-sm">{contest.participantCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problems List */}
      <Card className="border-border bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Problems</CardTitle>
          <CardDescription>
            {isUpcoming ? "Problems will be revealed when the contest starts." : "Solve problems to earn points and climb the leaderboard."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUpcoming ? (
            <div className="py-12 text-center border border-dashed border-border/50 rounded-lg">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-mono">WAITING_FOR_CONTEST_START</p>
            </div>
          ) : problemsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : !problems || problems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No problems found for this contest.</div>
          ) : (
            <div className="space-y-2">
              {problems.map((problem, index) => (
                <Link key={problem.id} href={`/contests/${contest.id}/problems/${problem.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-mono font-bold text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{problem.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <span className={
                            problem.difficulty === 'easy' ? 'text-green-400' :
                            problem.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                          }>{problem.difficulty.toUpperCase()}</span>
                          <span>•</span>
                          <span>{problem.points || 0} pts</span>
                          <span>•</span>
                          <span>{problem.timeLimit}ms</span>
                          <span>•</span>
                          <span>{problem.memoryLimit}MB</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-muted-foreground mb-0.5">Acceptance</div>
                        <div className="font-mono text-sm text-white">{(problem.acceptanceRate * 100).toFixed(1)}%</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
