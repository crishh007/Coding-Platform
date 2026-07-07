import { useListContests } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export function Schedule() {
  const { data: contests, isLoading } = useListContests({ status: "upcoming" });

  // Group by month
  const groupedContests = contests?.reduce((acc: any, contest) => {
    const date = new Date(contest.startTime);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(contest);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Contest Schedule</h1>
        <p className="text-muted-foreground">Upcoming events and competitions. Plan your training.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 mb-6" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : contests?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
          <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">No upcoming contests</h3>
          <p className="text-muted-foreground">Check back later for new events.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedContests || {}).map(([month, monthContests]: [string, any]) => (
            <div key={month}>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-border/50 pb-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {month}
              </h2>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {monthContests.map((contest: any) => {
                  const date = new Date(contest.startTime);
                  return (
                    <div key={contest.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:border-primary/50 transition-colors">
                        <span className="font-bold text-sm text-primary">{date.getDate()}</span>
                      </div>
                      
                      <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-mono text-sm text-muted-foreground flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase border-border">{contest.type}</Badge>
                          </div>
                          <h4 className="font-bold text-lg text-white mb-2">{contest.title}</h4>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground">{contest.duration} mins</span>
                            {contest.difficulty && (
                              <>
                                <span className="text-border">•</span>
                                <span className="uppercase text-xs tracking-wider font-medium text-blue-400">{contest.difficulty}</span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
