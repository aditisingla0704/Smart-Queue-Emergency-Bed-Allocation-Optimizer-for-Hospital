'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  List, 
  ClipboardPlus, 
  Bed, 
  ClipboardList, 
  Info, 
  FileBarChart, 
  GitCompare, 
  Activity, 
  Layers, 
  PlaySquare, 
  TrendingUp, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';

// In a real app, this would come from auth context or session
const MOCK_USER_ROLE = 'ADMIN';
const MOCK_USER_NAME = 'Admin User';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['ALL'] },
    { name: 'Queue', href: '/dashboard/queue', icon: List, roles: ['ALL'] },
    { name: 'Patients', href: '/dashboard/patients', icon: Users, roles: ['ALL'] },
    { name: 'Bed Board', href: '/dashboard/beds', icon: Bed, roles: ['ALL'] },
    { name: 'Patient Intake', href: '/dashboard/intake', icon: ClipboardPlus, roles: ['TRIAGE_NURSE', 'ADMIN'] },
    { name: 'Allocations', href: '/dashboard/allocations', icon: ClipboardList, roles: ['BED_MANAGER', 'ADMIN'] },
    { name: 'Wards', href: '/dashboard/wards', icon: Layers, roles: ['ADMIN'] },
    { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart, roles: ['ADMIN'] },
    { name: 'Audit Log', href: '/dashboard/audit', icon: Activity, roles: ['ADMIN'] },
    { name: 'Simulation', href: '/dashboard/simulation', icon: PlaySquare, roles: ['ADMIN'] },
    { name: 'Optimizer', href: '/dashboard/optimizer', icon: GitCompare, roles: ['ADMIN'] },
    { name: 'Surge', href: '/dashboard/surge', icon: TrendingUp, roles: ['ADMIN'] },
    { name: 'How Priority Works', href: '/dashboard/how-priority-works', icon: Info, roles: ['ALL'] },
  ];

  const filteredNav = navItems.filter(item => 
    item.roles.includes('ALL') || item.roles.includes(MOCK_USER_ROLE)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0D6E6E] text-white">
        <div className="font-bold text-lg">MedQueue</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-[#0D6E6E] text-white flex-shrink-0
      `}>
        <div className="p-4 hidden md:block border-b border-[#0A5555]">
          <h1 className="font-bold text-xl tracking-tight">MedQueue</h1>
        </div>
        
        <div className="p-4 border-b border-[#0A5555]">
          <div className="font-medium truncate">{MOCK_USER_NAME}</div>
          <div className="text-sm text-teal-100 mt-1 uppercase tracking-wider">{MOCK_USER_ROLE}</div>
        </div>

        <nav className="p-2 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-[#0F8A8A] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button className="flex items-center space-x-3 px-3 py-2 w-full rounded-md hover:bg-[#0A5555] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-white">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
