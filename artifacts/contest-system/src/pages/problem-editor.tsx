import { useGetProblem, useGetContest, useGetContestProblems, useListSubmissions, useCreateSubmission, getGetProblemQueryKey, getGetContestQueryKey, getListSubmissionsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, RotateCcw, Clock, HardDrive, CheckCircle2, XCircle, BookOpen, Tag } from "lucide-react";
import { getStatusColor, formatStatus } from "@/lib/utils-cp";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/code-editor";
import { ContestTimer } from "@/components/contest-timer";

const LANGUAGES = [
  { value: "c",          label: "C (GCC 11)",      ext: "c"   },
  { value: "cpp",        label: "C++ (GCC 11)",     ext: "cpp" },
  { value: "python",     label: "Python 3.10",      ext: "py"  },
  { value: "java",       label: "Java 17",          ext: "java"},
  { value: "javascript", label: "Node.js 18",       ext: "js"  },
  { value: "rust",       label: "Rust 1.68",        ext: "rs"  },
  { value: "go",         label: "Go 1.21",          ext: "go"  },
  { value: "css",        label: "CSS3",             ext: "css" },
];

const DEFAULT_TEMPLATES: Record<string, string> = {
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Read input
    
    // Write your solution here
    
    // Print output
    
    return 0;
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Read input
    
    // Write your solution here
    
    // Print output
    
    return 0;
}`,
  python: `import sys
input = sys.stdin.readline

def solve():
    # Read input
    
    # Write your solution here
    pass

solve()`,
  java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        // Read input
        
        // Write your solution here
        
    }
}`,
  javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    // Read input from lines[]
    
    // Write your solution here
    
});`,
  rust: `use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    
    // Read input
    
    // Write your solution here
    
}`,
  go: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    _ = reader
    
    // Write your solution here
    
    fmt.Println()
}`,
  css: `/* Write your CSS solution here */
body {
    margin: 0;
    padding: 0;
}`
};

export function ProblemEditor() {
  const { id, problemId } = useParams<{ id: string, problemId: string }>();
  const pId = parseInt(problemId, 10);
  const cId = parseInt(id, 10);
  const { toast } = useToast();

  const [language, setLanguage] = useState("cpp");
  const [codeByLang, setCodeByLang] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);

  const code = codeByLang[language] ?? DEFAULT_TEMPLATES[language] ?? "";

  const setCode = (val: string) => {
    setCodeByLang(prev => ({ ...prev, [language]: val }));
  };

  const handleLangChange = (lang: string) => {
    setLanguage(lang);
  };

  const handleExpire = useCallback(() => {
    setLocked(true);
    toast({ title: "⏰ Contest Ended", description: "Submissions are now locked.", variant: "destructive" });
  }, [toast]);

  const { data: _contest } = useGetContest(cId, {
    query: { enabled: !!cId, queryKey: getGetContestQueryKey(cId) }
  });
  const contest = _contest as any;

  const { data: _problems } = useGetContestProblems(cId, {
    query: { enabled: !!cId, queryKey: ["contestProblems", cId] as any }
  });
  const problems = _problems as unknown as any[];

  const { data: _problem, isLoading: problemLoading } = useGetProblem(pId, {
    query: { enabled: !!pId, queryKey: getGetProblemQueryKey(pId) }
  });
  const problem = _problem as any;

  const { data: _submissions, refetch: refetchSubmissions } = useListSubmissions(
    { problemId: pId, contestId: cId, userId: 1 },
    { query: { enabled: !!pId, queryKey: getListSubmissionsQueryKey({ problemId: pId, contestId: cId, userId: 1 }) } }
  );
  const submissions = _submissions as unknown as any[];

  const submitMutation = useCreateSubmission();

  const handleSubmit = () => {
    if (!code.trim()) {
      toast({ title: "Empty code", description: "Please write some code before submitting.", variant: "destructive" });
      return;
    }
    submitMutation.mutate({
      data: { problemId: pId, contestId: cId, userId: 1, language, code } as any
    }, {
      onSuccess: () => {
        toast({ title: "Submission Sent", description: "Your code is being evaluated." });
        refetchSubmissions();
      },
      onError: (err) => {
        toast({ title: "Submission Failed", description: String(err), variant: "destructive" });
      }
    });
  };

  if (problemLoading) {
    return <div className="p-8 space-y-4 max-w-6xl mx-auto"><Skeleton className="h-[800px] rounded-xl" /></div>;
  }

  if (!problem) return <div className="p-8 text-center text-red-500">Problem not found</div>;

  const diffColor = problem.difficulty === 'easy'
    ? 'text-green-400 border-green-400/30 bg-green-400/10'
    : problem.difficulty === 'medium'
    ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
    : 'text-red-400 border-red-400/30 bg-red-400/10';

  return (
    <div className="h-[calc(100vh-8rem)] animate-in fade-in duration-500 flex flex-col lg:flex-row gap-4 max-w-[1600px] mx-auto">

      {/* ── Sidebar (Question List) ── */}
      <Card className="shrink-0 flex flex-col border-border bg-card/50 backdrop-blur overflow-hidden hidden lg:flex lg:w-[70px] xl:w-64">
        <div className="p-3 border-b border-border/50 bg-muted/20 shrink-0">
          <h3 className="font-bold text-sm text-white hidden xl:block">Problems</h3>
          <div className="xl:hidden text-center text-xs font-bold text-muted-foreground uppercase">Q's</div>
        </div>
        <div className="flex-1 overflow-y-auto py-3 custom-scrollbar space-y-1.5 px-2">
          {problems?.map((prob, index) => {
            const letter = String.fromCharCode(65 + index);
            const isActive = prob.id === pId;
            return (
              <Link key={prob.id} href={`/contests/${cId}/problems/${prob.id}`}>
                <div className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all ${isActive ? 'bg-primary/20 border border-primary/30' : 'hover:bg-muted/50 border border-transparent'}`} title={prob.title}>
                  <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded font-mono font-bold text-sm ${isActive ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,255,128,0.3)]' : 'bg-muted text-muted-foreground'}`}>
                    {letter}
                  </div>
                  <div className="hidden xl:block min-w-0 flex-1">
                    <div className={`truncate text-sm font-bold ${isActive ? 'text-primary' : 'text-white'}`}>{prob.title}</div>
                    <div className={`text-[10px] uppercase mt-0.5 ${prob.difficulty === 'easy' ? 'text-green-400' : prob.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {prob.difficulty}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* ── Problem Statement Panel ── */}
      <Card className="flex-1 lg:w-1/2 flex flex-col border-border bg-card/50 backdrop-blur overflow-hidden">
        <CardHeader className="border-b border-border/50 py-4 bg-muted/20 shrink-0">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <CardTitle className="text-xl font-bold text-white mb-2 leading-tight">{problem.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className={diffColor}>
                  {problem.difficulty.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  <Clock className="w-3 h-3" /> {problem.timeLimit} ms
                </div>
                <div className="flex items-center gap-1 text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  <HardDrive className="w-3 h-3" /> {problem.memoryLimit} MB
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 bg-muted/30 px-3 py-2 rounded-lg border border-border/50">
              <div className="text-muted-foreground mb-0.5 text-[10px] uppercase tracking-wider">Acceptance</div>
              <div className="font-mono font-bold text-white text-sm">{(problem.acceptanceRate * 100).toFixed(1)}%</div>
            </div>
          </div>

          {problem.tags && problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/30">
              <Tag className="w-3 h-3 text-muted-foreground mt-0.5" />
              {problem.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
          <div
            className="problem-statement p-6"
            dangerouslySetInnerHTML={{ __html: problem.description || "<p class='text-muted-foreground'>No description provided.</p>" }}
          />
        </CardContent>
      </Card>

      {/* ── Editor Panel ── */}
      <Card className="flex-1 lg:w-1/2 flex flex-col border-border bg-[#0f111a] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-2 border-b border-border/50 bg-card shrink-0">
          <div className="flex items-center gap-2 px-2">
            <Select value={language} onValueChange={handleLangChange} disabled={locked}>
              <SelectTrigger className="w-[150px] h-8 text-xs bg-muted/30 border-border/50 focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-white"
              onClick={() => setCodeByLang(prev => ({ ...prev, [language]: DEFAULT_TEMPLATES[language] ?? "" }))}
              title="Reset to template"
              disabled={locked}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 px-2">
            {contest?.endTime && (
              <ContestTimer endTime={contest.endTime} onExpire={handleExpire} />
            )}
            <Button
              size="sm"
              variant="secondary"
              className="font-bold h-8 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => toast({ title: "Running tests...", description: "Testing against sample cases. (Simulated)" })}
              disabled={locked}
            >
              <Play className="w-3 h-3" />
              Run
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-8 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={submitMutation.isPending || locked}
            >
              <CheckCircle2 className="w-3 h-3" />
              {submitMutation.isPending ? "Judging..." : locked ? "Locked" : "Submit Code"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="editor" className="flex-1 flex flex-col min-h-0">
          <div className="px-4 border-b border-border/50 bg-card/50 shrink-0">
            <TabsList className="bg-transparent h-10 w-full justify-start gap-4 p-0">
              <TabsTrigger value="editor" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 h-full text-xs uppercase tracking-wider">
                Editor
              </TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 h-full text-xs uppercase tracking-wider">
                My Submissions {submissions && submissions.length > 0 && <span className="ml-1.5 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">{submissions.length}</span>}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex-1 p-0 m-0 border-0 outline-none flex flex-col min-h-0 data-[state=inactive]:hidden">
            <div className="flex-1 min-h-0">
              <CodeEditor value={code} onChange={setCode} language={language} />
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="flex-1 p-0 m-0 border-0 outline-none overflow-y-auto data-[state=inactive]:hidden custom-scrollbar bg-card">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/20 sticky top-0 backdrop-blur z-10">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Runtime</th>
                  <th className="px-4 py-3 font-medium">Memory</th>
                  <th className="px-4 py-3 font-medium">Lang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {submissions?.map(sub => (
                  <tr key={sub.id} className="hover:bg-muted/10">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {new Date(sub.createdAt).toLocaleTimeString()}
                    </td>
                    <td className={`px-4 py-3 font-bold ${getStatusColor(sub.status)}`}>
                      <div className="flex items-center gap-1.5">
                        {sub.status === 'accepted' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {formatStatus(sub.status)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{sub.executionTime ? `${sub.executionTime}ms` : '-'}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{sub.memoryUsed ? `${(sub.memoryUsed / 1024).toFixed(1)}MB` : '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{sub.language}</td>
                  </tr>
                ))}
                {(!submissions || submissions.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                      <p className="text-muted-foreground text-sm">No submissions yet. Write and submit your solution!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
