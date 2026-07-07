import { useGetRankings, getGetRankingsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { getTierColor } from "@/lib/utils-cp";

export function Rankings() {
  const { data: _rankings, isLoading } = useGetRankings({
    query: { queryKey: getGetRankingsQueryKey() }
  });
  const rankings = _rankings as unknown as any[];


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" /> Global Rankings
        </h1>
        <p className="text-muted-foreground">Top 100 coders across all tiers. Compete to reach Legendary Grandmaster.</p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium w-16 text-center">Rank</th>
                  <th className="px-6 py-4 font-medium">Coder</th>
                  <th className="px-6 py-4 font-medium text-right">Rating</th>
                  <th className="px-6 py-4 font-medium text-center">+/-</th>
                  <th className="px-6 py-4 font-medium text-center">Contests</th>
                  <th className="px-6 py-4 font-medium text-center">Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4"><Skeleton className="h-6 w-full" /></td>
                    </tr>
                  ))
                ) : rankings?.map((user) => (
                  <tr key={user.userId} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 text-center">
                      <span className={`font-mono text-lg font-bold ${user.rank <= 3 ? 'text-yellow-500' : 'text-muted-foreground group-hover:text-white'}`}>
                        {user.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-bold text-lg ${getTierColor(user.tier).split(' ')[0]}`}>
                          {user.username}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                          {user.tier.replace('_', ' ')} {user.country && `• ${user.country}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-xl font-bold text-white">{user.rating}</span>
                      <div className="text-[10px] text-muted-foreground uppercase">Max {user.maxRating || user.rating}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center font-mono text-sm">
                        {user.ratingChange && user.ratingChange > 0 ? (
                          <span className="text-green-500 flex items-center"><ChevronUp className="w-4 h-4" />{user.ratingChange}</span>
                        ) : user.ratingChange && user.ratingChange < 0 ? (
                          <span className="text-red-500 flex items-center"><ChevronDown className="w-4 h-4" />{Math.abs(user.ratingChange)}</span>
                        ) : (
                          <span className="text-muted-foreground flex items-center"><Minus className="w-4 h-4" /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-white">
                      {user.contestsParticipated}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-white">
                      {user.problemsSolved || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
