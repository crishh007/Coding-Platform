import { useGetContestViolations, useListContests, getGetContestViolationsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function Violations() {
  const { data: contests } = useListContests({ status: "all" });
  const [selectedContest, setSelectedContest] = useState<string>("");

  // Default to first contest if available and none selected
  const activeContestId = selectedContest ? parseInt(selectedContest) : (contests?.[0]?.id || 0);

  const { data: violations, isLoading } = useGetContestViolations(activeContestId, {
    query: { enabled: !!activeContestId, queryKey: getGetContestViolationsQueryKey(activeContestId) }
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive" className="uppercase text-[10px] font-bold">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 hover:bg-orange-500/30 uppercase text-[10px] font-bold" variant="outline">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30 uppercase text-[10px]" variant="outline">Medium</Badge>;
      case 'low': return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 hover:bg-blue-500/30 uppercase text-[10px]" variant="outline">Low</Badge>;
      default: return <Badge variant="outline" className="uppercase text-[10px]">{severity}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'confirmed': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'dismissed': return <CheckCircle className="w-4 h-4 text-green-500 opacity-50" />;
      default: return null;
    }
  };

  const formatType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-destructive" /> Anti-Cheat System
          </h1>
          <p className="text-muted-foreground">Automated monitoring and violation detection logs.</p>
        </div>
        
        <div className="w-full md:w-72">
          <Select 
            value={selectedContest || (contests?.[0]?.id.toString() || "")} 
            onValueChange={setSelectedContest}
            disabled={!contests || contests.length === 0}
          >
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Select Contest" />
            </SelectTrigger>
            <SelectContent>
              {contests?.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4 bg-muted/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Detected Violations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Severity</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4"><Skeleton className="h-8 w-full" /></td>
                    </tr>
                  ))
                ) : !violations || violations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <ShieldAlert className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-1">System Secure</h3>
                      <p className="text-muted-foreground">No violations detected for this contest.</p>
                    </td>
                  </tr>
                ) : violations.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                      {new Date(v.detectedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {v.username}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{formatType(v.type)}</span>
                      {v.description && <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate" title={v.description}>{v.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {getSeverityBadge(v.severity)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        {getStatusIcon(v.status || 'pending')}
                        {v.status || 'Pending'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted transition-colors">Review</Badge>
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
