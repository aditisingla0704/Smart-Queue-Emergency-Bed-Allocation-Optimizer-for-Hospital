import React from 'react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Hospital Reports</h1>
        <select className="border border-gray-300 rounded-md text-sm py-1.5 px-3 bg-white text-gray-700">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Month</option>
          <option>Custom Range</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="text-gray-500 text-sm mb-1 flex items-center"><Clock size={16} className="mr-2"/> Avg Wait (L2)</div>
          <div className="text-2xl font-bold text-gray-900">42m</div>
          <div className="text-xs text-green-600 flex items-center mt-2">
            <TrendingUp size={12} className="mr-1" /> 12% improvement
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="text-gray-500 text-sm mb-1 flex items-center"><Users size={16} className="mr-2"/> Total Intake</div>
          <div className="text-2xl font-bold text-gray-900">1,248</div>
          <div className="text-xs text-gray-500 mt-2">patients this period</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="text-gray-500 text-sm mb-1 flex items-center"><BarChart3 size={16} className="mr-2"/> Peak Occupancy</div>
          <div className="text-2xl font-bold text-gray-900">94%</div>
          <div className="text-xs text-red-600 flex items-center mt-2">
            <TrendingUp size={12} className="mr-1" /> 2% increase
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="text-gray-500 text-sm mb-1">Manual Overrides</div>
          <div className="text-2xl font-bold text-gray-900">14</div>
          <div className="text-xs text-gray-500 mt-2">allocation rejections</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wait Times by Triage Level */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Average Wait Time by Triage Level</h3>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 py-2">Level</th>
                  <th className="text-right text-xs font-medium text-gray-500 py-2">Target</th>
                  <th className="text-right text-xs font-medium text-gray-500 py-2">Actual Avg</th>
                  <th className="text-right text-xs font-medium text-gray-500 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 text-sm text-gray-900 font-medium">Level 1</td>
                  <td className="py-3 text-sm text-gray-500 text-right">0 min</td>
                  <td className="py-3 text-sm text-gray-900 text-right">0 min</td>
                  <td className="py-3 text-right"><span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Met</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-sm text-gray-900 font-medium">Level 2</td>
                  <td className="py-3 text-sm text-gray-500 text-right">15 min</td>
                  <td className="py-3 text-sm text-gray-900 text-right">18 min</td>
                  <td className="py-3 text-right"><span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Missed</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-sm text-gray-900 font-medium">Level 3</td>
                  <td className="py-3 text-sm text-gray-500 text-right">30 min</td>
                  <td className="py-3 text-sm text-gray-900 text-right">42 min</td>
                  <td className="py-3 text-right"><span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Failed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Override Logs */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Recent Allocation Overrides</h3>
          </div>
          <div className="p-4">
            <div className="text-center py-8 text-gray-500 text-sm">
              <p>No recent overrides found for the selected period.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
