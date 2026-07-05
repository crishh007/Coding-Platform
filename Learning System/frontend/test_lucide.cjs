const lucide = require('lucide-react');
const icons = [
  'Users', 'Mic', 'Code2', 'BrainCircuit', 'Network', 'ArrowRight',
  'Lock', 'Layers', 'CheckCircle', 'Monitor', 'Smartphone', 'Server', 'Cloud', 'Shield', 'Database', 'Target', 'Award', 'Zap', 'FileText',
  'Play', 'Calendar', 'TrendingUp', 'Flame', 'ListChecks', 'Building2', 'Briefcase'
];
let missing = [];
for (let icon of icons) {
  if (!lucide[icon]) {
    missing.push(icon);
  }
}
console.log("Missing icons:", missing);
