export const getTierColor = (tier?: string) => {
  if (!tier) return "text-gray-500 bg-gray-500/10 border-gray-500/20";
  
  switch (tier.toLowerCase()) {
    case "legendary":
      return "text-red-500 bg-red-500/10 border-red-500/20 font-bold";
    case "grandmaster":
      return "text-red-500 bg-red-500/10 border-red-500/20";
    case "master":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "candidate_master":
      return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    case "expert":
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case "specialist":
      return "text-cyan-500 bg-cyan-500/10 border-cyan-500/20";
    case "pupil":
      return "text-green-500 bg-green-500/10 border-green-500/20";
    case "newbie":
    default:
      return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
};

export const getStatusColor = (status?: string) => {
  if (!status) return "";
  
  switch (status.toLowerCase()) {
    case "accepted":
    case "ac":
      return "text-green-500";
    case "wrong_answer":
    case "wa":
      return "text-red-500";
    case "time_limit_exceeded":
    case "tle":
      return "text-orange-500";
    case "memory_limit_exceeded":
    case "mle":
      return "text-orange-500";
    case "runtime_error":
    case "re":
      return "text-yellow-500";
    case "compilation_error":
    case "ce":
      return "text-purple-500";
    default:
      return "text-muted-foreground";
  }
};

export const formatStatus = (status?: string) => {
  if (!status) return "-";
  switch (status.toLowerCase()) {
    case "accepted": return "AC";
    case "wrong_answer": return "WA";
    case "time_limit_exceeded": return "TLE";
    case "memory_limit_exceeded": return "MLE";
    case "runtime_error": return "RE";
    case "compilation_error": return "CE";
    case "pending": return "PENDING";
    default: return status.toUpperCase();
  }
};
