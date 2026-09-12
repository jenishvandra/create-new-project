import React, { useState } from 'react'
import type { ShopItem, InventoryItem, CustomReward, CharacterProfile } from '../types/rpg'
import { playGoldSound, playButtonClickSound } from '../utils/audio'

interface ShopAndInventoryProps {
  profile: CharacterProfile | null
  items: ShopItem[]
  inventory: InventoryItem[]
  customRewards: CustomReward[]
  onBuyItem: (itemId: string) => void
  onEquipItem: (itemId: string, type: string) => void
  onUseItem: (itemId: string) => void
  onCreateReward: (title: string, cost_gold: number) => void
  onClaimReward: (rewardId: number) => void
}

type Mode = 'shop' | 'inventory' | 'custom_rewards'

export default function ShopAndInventory({
  profile,
  items,
  inventory,
  customRewards,
  onBuyItem,
  onEquipItem,
  onUseItem,
  onCreateReward,
  onClaimReward
}: ShopAndInventoryProps) {
  const [activeTab, setActiveTab] = useState<Mode>('shop')
  const [shopFilter, setShopFilter] = useState<string>('all')

  // New Custom Reward state
  const [newRewardTitle, setNewRewardTitle] = useState('')
  const [newRewardCost, setNewRewardCost] = useState(100)
  const [showAddRewardModal, setShowAddRewardModal] = useState(false)

  const ownedItemIds = new Set(inventory.map((inv) => inv.item_id))

  const filteredShopItems = items.filter((item) => {
    if (shopFilter === 'all') return true
    return item.type === shopFilter
  })

  const handleAddRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRewardTitle.trim()) return
    onCreateReward(newRewardTitle.trim(), newRewardCost)
    setNewRewardTitle('')
    setNewRewardCost(100)
    setShowAddRewardModal(false)
    playButtonClickSound()
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#D6D6D6]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#F58F7C] font-bold text-xs uppercase tracking-wider mb-1">
            <span>🛒 Marketplace & Rewards Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Spend Earned Gold & Claim Rewards
          </h2>
          <p className="text-xs sm:text-sm text-[#D6D6D6] mt-1">
            Unlock new themes, titles, avatars, XP potions, or real-life treats using your quest gold.
          </p>
        </div>

        {/* User Balance */}
        {profile && (
          <div className="flex items-center gap-3 bg-[#4F4F51]/40 border border-[#D6D6D6]/15 rounded-2xl px-4 py-3 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-[#D6D6D6]/70">Available Vault</div>
              <div className="flex items-center gap-2">
                <span className="text-[#F58F7C] font-black text-lg">🪙 {profile.gold}</span>
                <span className="text-[#F2C4CE] font-black text-lg">💎 {profile.gems}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D6D6D6]/15 pb-3 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => {
            setActiveTab('shop')
            playButtonClickSound()
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'shop'
              ? 'bg-[#F58F7C]/25 text-[#F58F7C] border border-[#F58F7C]/40 shadow-sm'
              : 'text-[#D6D6D6]/70 hover:text-white'
          }`}
        >
          <span>🛍️ Item Store</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('inventory')
            playButtonClickSound()
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-[#F58F7C]/25 text-[#F58F7C] border border-[#F58F7C]/40 shadow-sm'
              : 'text-[#D6D6D6]/70 hover:text-white'
          }`}
        >
          <span>🎒 My Inventory ({inventory.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('custom_rewards')
            playButtonClickSound()
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'custom_rewards'
              ? 'bg-[#F58F7C]/25 text-[#F58F7C] border border-[#F58F7C]/40 shadow-sm'
              : 'text-[#D6D6D6]/70 hover:text-white'
          }`}
        >
          <span>🎁 Real-World Rewards</span>
        </button>
      </div>

      {/* SHOP VIEW */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          {/* Shop Filter Sub-pills */}
          <div className="flex items-center gap-2">
            {(['all', 'theme', 'avatar', 'title', 'potion'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setShopFilter(type)
                  playButtonClickSound()
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  shopFilter === type
                    ? 'bg-[#4F4F51] text-[#F58F7C] border border-[#D6D6D6]/15'
                    : 'text-[#D6D6D6]/60 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All Items' : `${type}s`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredShopItems.map((item) => {
              const isOwned = ownedItemIds.has(item.id)
              const canAfford =
                (profile?.gold || 0) >= item.cost_gold && (profile?.gems || 0) >= item.cost_gems

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-5 border border-[#D6D6D6]/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{item.icon === 'zap' ? '⚡' : item.icon === 'coffee' ? '☕' : item.icon === 'sword' ? '⚔️' : item.icon === 'moon' ? '🌙' : item.icon === 'feather' ? '🪶' : item.icon === 'user' ? '🤖' : item.icon === 'shield' ? '🛡️' : item.icon === 'sparkles' ? '🔮' : item.icon === 'book-open' ? '📚' : item.icon === 'star' ? '⭐' : item.icon === 'droplet' ? '🧪' : '🎁'}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#2C2B30] text-[#D6D6D6]/70 border border-[#D6D6D6]/10">
                        {item.type}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-[#D6D6D6]/70 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#D6D6D6]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {item.cost_gold > 0 && <span className="text-[#F58F7C]">🪙 {item.cost_gold}</span>}
                      {item.cost_gems > 0 && <span className="text-[#F2C4CE]">💎 {item.cost_gems}</span>}
                      {item.cost_gold === 0 && item.cost_gems === 0 && (
                        <span className="text-[#F2C4CE]">FREE</span>
                      )}
                    </div>

                    {isOwned && item.type !== 'potion' ? (
                      <span className="text-xs font-bold text-[#D6D6D6]/50 bg-[#2C2B30] px-3 py-1.5 rounded-xl border border-[#D6D6D6]/10">
                        Owned
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onBuyItem(item.id)
                          playGoldSound()
                        }}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-[#F58F7C] hover:bg-[#F58F7C]/90 text-[#2C2B30] shadow-md shadow-[#F58F7C]/20 active:scale-95'
                            : 'bg-[#4F4F51] text-[#D6D6D6]/40 cursor-not-allowed'
                        }`}
                      >
                        Buy Item
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* INVENTORY VIEW */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {inventory.length > 0 ? (
            inventory.map((inv) => (
              <div
                key={inv.id}
                className="glass-card rounded-2xl p-5 border border-[#D6D6D6]/10 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#2C2B30] text-[#D6D6D6]/70 border border-[#D6D6D6]/10">
                      {inv.item_type}
                    </span>
                    {inv.is_equipped === 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F58F7C]/20 text-[#F58F7C] border border-[#F58F7C]/30">
                        EQUIPPED
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">{inv.item_name}</h3>
                  {inv.quantity > 1 && (
                    <p className="text-xs font-mono text-[#F58F7C]">Quantity: x{inv.quantity}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#D6D6D6]/10">
                  {inv.item_type === 'potion' ? (
                    <button
                      onClick={() => {
                        onUseItem(inv.item_id)
                        playButtonClickSound()
                      }}
                      className="w-full py-2 rounded-xl bg-[#F2C4CE]/20 border border-[#F2C4CE]/40 text-[#F2C4CE] font-bold text-xs hover:bg-[#F2C4CE]/30 transition-colors"
                    >
                      Use Potion
                    </button>
                  ) : inv.is_equipped === 1 ? (
                    <div className="text-center py-1.5 text-xs font-bold text-[#F58F7C]">
                      Currently Active
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onEquipItem(inv.item_id, inv.item_type)
                        playButtonClickSound()
                      }}
                      className="w-full py-2 rounded-xl bg-[#F58F7C]/20 border border-[#F58F7C]/40 text-[#F58F7C] font-bold text-xs hover:bg-[#F58F7C]/30 transition-colors"
                    >
                      Equip Item
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full glass-panel rounded-3xl p-12 text-center border border-[#D6D6D6]/15">
              <div className="text-4xl mb-2">🎒</div>
              <h3 className="text-lg font-bold text-white">Your Inventory is Empty</h3>
              <p className="text-xs text-[#D6D6D6]/70 mt-1">Visit the Item Store to buy themes, avatars, and potions!</p>
            </div>
          )}
        </div>
      )}

      {/* CUSTOM REAL-WORLD REWARDS VIEW */}
      {activeTab === 'custom_rewards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-white">Custom Real-World Treat Redemptions</h3>
            <button
              onClick={() => setShowAddRewardModal(true)}
              className="px-4 py-2 rounded-xl bg-[#F58F7C]/20 border border-[#F58F7C]/40 text-[#F58F7C] text-xs font-bold hover:bg-[#F58F7C]/30 transition-colors flex items-center gap-1.5"
            >
              <span>+ Add Custom Reward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customRewards.map((reward) => {
              const canAfford = (profile?.gold || 0) >= reward.cost_gold
              return (
                <div
                  key={reward.id}
                  className="glass-card rounded-2xl p-5 border border-[#D6D6D6]/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F58F7C]/15 border border-[#F58F7C]/30 flex items-center justify-center text-xl">
                      🎁
                    </div>
                    <h4 className="text-base font-bold text-white">{reward.title}</h4>
                  </div>

                  <div className="pt-3 border-t border-[#D6D6D6]/10 flex items-center justify-between">
                    <span className="text-sm font-black text-[#F58F7C]">🪙 {reward.cost_gold} Gold</span>
                    <button
                      onClick={() => {
                        onClaimReward(reward.id)
                        playGoldSound()
                      }}
                      disabled={!canAfford}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        canAfford
                          ? 'bg-[#F58F7C] hover:bg-[#F58F7C]/90 text-[#2C2B30] shadow-md shadow-[#F58F7C]/20 active:scale-95'
                          : 'bg-[#4F4F51] text-[#D6D6D6]/40 cursor-not-allowed'
                      }`}
                    >
                      Redeem Reward
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add Reward Modal */}
          {showAddRewardModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2B30]/85 backdrop-blur-md">
              <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-[#D6D6D6]/20 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-1">Add Real-World Reward</h3>
                <p className="text-xs text-[#D6D6D6]/70 mb-4">Set a custom treat that you can buy with your hard-earned gold!</p>

                <form onSubmit={handleAddRewardSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#D6D6D6] mb-1">Reward Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Watch 1 Episode of Anime / Movie"
                      value={newRewardTitle}
                      onChange={(e) => setNewRewardTitle(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#D6D6D6] mb-1">Cost in Gold</label>
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={newRewardCost}
                      onChange={(e) => setNewRewardCost(Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRewardModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#D6D6D6]/70 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#F58F7C] text-[#2C2B30] font-black text-xs"
                    >
                      Create Reward
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
