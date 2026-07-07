import { useListTeams, useCreateTeam } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Trophy, Shield, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function Teams() {
  const { data: teams, isLoading, refetch } = useListTeams();
  const createTeam = useCreateTeam();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", maxMembers: 3 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTeam.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Team created successfully" });
        setOpen(false);
        setFormData({ name: "", description: "", maxMembers: 3 });
        refetch();
      },
      onError: (err) => {
        toast({ title: "Failed to create team", description: String(err), variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" /> Teams
          </h1>
          <p className="text-muted-foreground">Form alliances, compete in team contests, and climb team rankings.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-muted/50 border-border focus-visible:ring-primary" 
                  placeholder="e.g. Code Ninjas" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea 
                  id="desc" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-muted/50 border-border focus-visible:ring-primary resize-none" 
                  placeholder="What is your team about?" 
                  rows={3} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxM">Max Members</Label>
                <Input 
                  id="maxM" 
                  type="number" 
                  min="2" max="10" 
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value) || 3})}
                  className="bg-muted/50 border-border focus-visible:ring-primary" 
                />
              </div>
              <Button type="submit" className="w-full font-bold" disabled={createTeam.isPending}>
                {createTeam.isPending ? "Creating..." : "Create Team"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : teams?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">No teams yet</h3>
          <p className="text-muted-foreground">Be the first to create a team and start competing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams?.map((team) => (
            <Card key={team.id} className="border-border bg-card/50 backdrop-blur hover:border-primary/50 transition-colors overflow-hidden group">
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-primary" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-colors">{team.name}</CardTitle>
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10">Rank #{team.rank}</Badge>
                </div>
                {team.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{team.description}</p>}
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
                  <div className="text-center">
                    <div className="text-white font-mono font-bold">{team.rating}</div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-1">Rating</div>
                  </div>
                  <div className="text-center border-l border-border/50">
                    <div className="text-white font-mono font-bold flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-blue-400" /> {team.memberCount}{team.maxMembers ? `/${team.maxMembers}` : ''}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-1">Members</div>
                  </div>
                  <div className="text-center border-l border-border/50">
                    <div className="text-white font-mono font-bold flex items-center justify-center gap-1">
                      <Trophy className="w-3 h-3 text-yellow-500" /> {team.contestsWon || 0}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-1">Wins</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="secondary" className="w-full font-bold" onClick={() => navigate(`/teams/${team.id}`)}>View Team</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
