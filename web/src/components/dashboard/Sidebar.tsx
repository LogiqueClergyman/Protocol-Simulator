import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'decentralization', label: 'Decentralization', icon: TrendingUp },
  { id: 'distribution', label: 'Distribution', icon: PieChart },
  { id: 'survival', label: 'Survival', icon: Activity },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        'h-screen flex flex-col transition-all duration-300 bg-white border-r border-slate-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Branded Header */}
      <div className="h-16 flex items-center gap-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-white tracking-tight">
            Protocol Sim
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {!collapsed && 'Analytics'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => { onSectionChange(item.id); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 shrink-0 transition-colors',
                isActive ? 'text-emerald-600' : 'text-slate-400'
              )} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer with collapse toggle */}
      <div className="p-3 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setCollapsed(!collapsed); }}
          className="w-full justify-center text-slate-400 hover:text-slate-600"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
