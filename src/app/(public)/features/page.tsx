import { Clock, Cpu, LayoutDashboard, ShieldCheck, BellRing, TestTube, ScrollText, BarChart3 } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      title: 'Priority Queue with Aging',
      description: 'Automatically adjust patient priority scores based on their initial triage level and time spent waiting.',
      icon: Clock
    },
    {
      title: 'Bed Allocation Optimizer',
      description: 'Uses matching algorithms to pair patients with appropriate beds, considering ward constraints and patient needs.',
      icon: Cpu
    },
    {
      title: 'Real-time Bed Board',
      description: 'Visual overview of hospital capacity, showing occupied, available, and out-of-service beds instantly.',
      icon: LayoutDashboard
    },
    {
      title: 'Role-based Access Control',
      description: 'Restrict actions and views based on user roles, such as Triage Nurse, Bed Manager, and Administrator.',
      icon: ShieldCheck
    },
    {
      title: 'Surge Capacity Alerts',
      description: 'Trigger notifications when hospital occupancy reaches critical thresholds, allowing for proactive response.',
      icon: BellRing
    },
    {
      title: 'Simulation Mode',
      description: 'Test hospital throughput and bed optimization strategies using sample data in a sandbox environment.',
      icon: TestTube
    },
    {
      title: 'Audit Logging',
      description: 'Maintain a secure, immutable record of all system actions, assignments, and manual overrides.',
      icon: ScrollText
    },
    {
      title: 'Reports and Analytics',
      description: 'Generate operational reports on wait times, bed utilization, and throughput to identify bottlenecks.',
      icon: BarChart3
    }
  ];

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">System Features</h1>
          <p className="text-xl text-gray-600">
            Comprehensive tools for managing patient flow and hospital capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[#0D6E6E]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
