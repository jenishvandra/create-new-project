import React from 'react'
import type { QuestLog } from '../types/rpg'

interface AnalyticsHistoryProps {
  logs: QuestLog[]
  completedCount: number
  totalXp: number
}

export default function AnalyticsHistory({ logs, completedCount, totalXp }: AnalyticsHistoryProps) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-3xl p-6 border border-[#D6D6D6]/15 space-y-1">
          <span className="text-2xl">🏆</span>
          <div className="text-2xl font-black text-white">{completedCount}</div>
          <div className="text-xs font-bold text-[#D6D6D6]/70 uppercase tracking-wider">Total Quests Completed</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-[#D6D6D6]/15 space-y-1">
          <span className="text-2xl">⚡</span>
          <div className="text-2xl font-black text-[#F58F7C]">{totalXp} XP</div>
          <div className="text-xs font-bold text-[#D6D6D6]/70 uppercase tracking-wider">Lifetime XP Accumulated</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-[#D6D6D6]/15 space-y-1">
          <span className="text-2xl">📜</span>
          <div className="text-2xl font-black text-[#F2C4CE]">{logs.length}</div>
          <div className="text-xs font-bold text-[#D6D6D6]/70 uppercase tracking-wider">Recorded History Entries</div>
        </div>
      </div>

      {/* Quest Completion Log Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#D6D6D6]/15 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>📜</span> Recent Quest Activity Logs
          </h3>
        </div>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D6D6D6]/15 text-[#D6D6D6]/70 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Quest Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">XP Gained</th>
                  <th className="py-3 px-4">Gold Gained</th>
                  <th className="py-3 px-4">Completed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6D6D6]/10">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#4F4F51]/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{log.quest_title}</td>
                    <td className="py-3 px-4 text-[#D6D6D6] font-medium">
                      <span className="px-2 py-0.5 rounded bg-[#4F4F51]/50 border border-[#D6D6D6]/10 text-[11px]">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#F58F7C]">+{log.xp_gained} XP</td>
                    <td className="py-3 px-4 font-bold text-[#F2C4CE]">+{log.gold_gained} Gold</td>
                    <td className="py-3 px-4 text-[#D6D6D6]/60 font-mono text-[11px]">
                      {new Date(log.completed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-[#D6D6D6]/60 text-xs">
            No activity logs found. Complete quests to record your journey!
          </div>
        )}
      </div>
    </div>
  )
}
