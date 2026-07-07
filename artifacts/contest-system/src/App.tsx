import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import { Dashboard } from "@/pages/dashboard";
import { Contests } from "@/pages/contests";
import { ContestDetail } from "@/pages/contest-detail";
import { Leaderboard } from "@/pages/leaderboard";
import { ProblemEditor } from "@/pages/problem-editor";
import { Schedule } from "@/pages/schedule";
import { Rankings } from "@/pages/rankings";
import { Teams } from "@/pages/teams";
import { TeamDetail } from "@/pages/team-detail";
import { Violations } from "@/pages/violations";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/contests" component={Contests} />
        <Route path="/contests/:id" component={ContestDetail} />
        <Route path="/contests/:id/leaderboard" component={Leaderboard} />
        <Route path="/contests/:id/problems/:problemId" component={ProblemEditor} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/rankings" component={Rankings} />
        <Route path="/teams" component={Teams} />
        <Route path="/teams/:id" component={TeamDetail} />
        <Route path="/violations" component={Violations} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
