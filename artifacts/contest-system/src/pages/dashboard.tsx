import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Activity, Users, FileCode2, Clock } from "lucide-react";

import { getTierColor, getStatusColor, formatStatus } from "@/lib/utils-cp";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export function Dashboard() {
  const { data: _stats, isLoading } = useGetDashboardStats();
  const stats = _stats as any;


  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Status</h1>
          <p className="text-muted-foreground mt-1">Live metrics and active contests overview.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-full text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-primary font-mono font-medium">{stats.onlineUsers} Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Contests" value={stats.activeContests} icon={Activity} color="text-primary" />
        <StatCard title="Upcoming Contests" value={stats.upcomingContests} icon={Clock} color="text-blue-400" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-purple-400" />
        <StatCard title="Total Submissions" value={stats.totalSubmissions.toLocaleString()} icon={FileCode2} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Live Submissions
            </CardTitle>
            <Link href="/contests">
              <div className="text-xs text-primary hover:underline cursor-pointer">View all</div>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Problem</th>
                    <th className="px-4 py-3 font-medium">Lang</th>
                    <th className="px-4 py-3 font-medium text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-mono">
                  {stats.recentSubmissions?.slice(0, 10).map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleTimeString([], { hour12: false })}
                      </td>
                      <td className="px-4 py-3 text-white">{sub.username}</td>
                      <td className="px-4 py-3 text-blue-400 hover:underline cursor-pointer">
                        <Link href={`/contests/${sub.contestId || 1}/problems/${sub.problemId}`}>
                          Prob-{sub.problemId}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{sub.language}</td>
                      <td className={`px-4 py-3 font-bold text-right ${getStatusColor(sub.status)}`}>
                        {formatStatus(sub.status)}
                      </td>
                    </tr>
                  ))}
                  {(!stats.recentSubmissions || stats.recentSubmissions.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No recent submissions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur flex flex-col">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Global Top Ranked
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-border/50">
              {stats.topRankedUsers?.slice(0, 10).map((user: any, i: number) => (
                <div key={user.userId} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono font-bold w-4 text-right">{i + 1}</span>
                    <div>
                      <div className={`font-bold ${getTierColor(user.tier).split(' ')[0]}`}>
                        {user.username}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {user.tier.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-white">{user.rating}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Rating</div>
                  </div>
                </div>
              ))}
              {(!stats.topRankedUsers || stats.topRankedUsers.length === 0) && (
                <div className="p-8 text-center text-muted-foreground">
                  No rankings available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white font-mono tracking-tight">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl bg-muted/50 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
