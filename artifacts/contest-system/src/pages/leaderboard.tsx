import { useGetContestLeaderboard, useGetContest, getGetContestLeaderboardQueryKey, getGetContestQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTierColor } from "@/lib/utils-cp";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";

type LeaderboardEntry = {
  rank: number;
  userId: number;
  username: string;
  score: number;
  penalty: number;
  isVirtual: boolean;
  tier: string;
  teamName?: string | null;
  problemResults?: { solved: boolean; attempts: number; score: number }[];
};

function useWsLeaderboard(contestId: number, fallback: LeaderboardEntry[] | undefined) {
  const [liveData, setLiveData] = useState<LeaderboardEntry[] | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!contestId) return;
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${proto}//${window.location.host}/api/ws?contestId=${contestId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(() => connect(), 4000);
    };
    ws.onerror = () => ws.close();
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "leaderboard" && msg.contestId === contestId) {
          setLiveData(msg.entries);
          setLastUpdate(new Date());
        }
      } catch {}
    };
  }, [contestId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { data: liveData ?? fallback, connected, lastUpdate };
}

export function Leaderboard() {
  const { id } = useParams<{ id: string }>();
  const contestId = parseInt(id, 10);

  const { data: _contest } = useGetContest(contestId, {
    query: { enabled: !!contestId, queryKey: getGetContestQueryKey(contestId) }
  });
  const contest = _contest as any;

  const { data: _restData, isLoading, refetch, isFetching } = useGetContestLeaderboard(contestId, {
    query: { enabled: !!contestId, queryKey: getGetContestLeaderboardQueryKey(contestId) }
  });
  const restData = _restData as unknown as any[];

  const { data: leaderboard, connected, lastUpdate } = useWsLeaderboard(contestId, restData as LeaderboardEntry[] | undefined);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  const maxProblems = Math.max(...(leaderboard?.map((l: LeaderboardEntry) => l.problemResults?.length || 0) || [0]), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/50 border border-border backdrop-blur p-6 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Live Leaderboard</h1>
            {contest && (
              <Badge variant="outline" className="ml-2 border-primary/30 text-primary bg-primary/10">
                {contest.title}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground text-sm">Real-time standings pushed via WebSocket.</p>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {connected ? 'Live' : 'Reconnecting…'}
            </div>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/contests/${contestId}`}>
            <Button variant="outline" size="sm">Back to Contest</Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-32"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium w-16 text-center">#</th>
                  <th className="px-6 py-4 font-medium">Participant</th>
                  <th className="px-6 py-4 font-medium text-center">Score</th>
                  <th className="px-6 py-4 font-medium text-center">Penalty</th>
                  {Array.from({ length: maxProblems }).map((_, i) => (
                    <th key={i} className="px-6 py-4 font-medium text-center font-mono w-24">
                      {String.fromCharCode(65 + i)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {leaderboard?.map((entry: LeaderboardEntry, idx: number) => (
                  <tr
                    key={`${entry.userId}-${entry.isVirtual ? 'virtual' : 'real'}`}
                    className={`hover:bg-muted/10 transition-colors ${entry.isVirtual ? 'opacity-80' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center">
                        {idx === 0 ? <Trophy className="w-5 h-5 text-yellow-500" /> :
                         idx === 1 ? <Trophy className="w-5 h-5 text-gray-300" /> :
                         idx === 2 ? <Trophy className="w-5 h-5 text-amber-600" /> :
                         <span className="font-mono text-muted-foreground">{entry.rank}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold ${getTierColor(entry.tier).split(' ')[0]}`}>
                          {entry.username}
                        </span>
                        {entry.teamName && (
                          <span className="text-xs text-muted-foreground mt-0.5">{entry.teamName}</span>
                        )}
                        {entry.isVirtual && (
                          <Badge variant="outline" className="w-fit mt-1 text-[9px] px-1 py-0 h-4 border-dashed">VIRTUAL</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono font-bold text-white text-lg">{entry.score}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-muted-foreground">{entry.penalty}</span>
                    </td>
                    {entry.problemResults?.map((result, i) => (
                      <td key={i} className="px-6 py-4 text-center border-l border-border/30 bg-muted/5">
                        {result.solved ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-mono font-bold text-green-500">+{result.attempts > 1 ? result.attempts - 1 : ''}</span>
                            <span className="text-[10px] text-muted-foreground">{result.score}</span>
                          </div>
                        ) : result.attempts > 0 ? (
                          <span className="font-mono font-bold text-red-500">-{result.attempts}</span>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {(!leaderboard || leaderboard.length === 0) && (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">No leaderboard data available yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
