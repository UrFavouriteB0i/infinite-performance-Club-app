import { createPlayer } from '@/app/actions/playerAction';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#F0F0F2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#17171B] border border-[#2A2A34] rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <h1 className="font-bold text-xl text-[#F27A1A]">IP Club Admin</h1>
          <p className="text-xs text-[#A0A0AA] mt-0.5">Quick add player directly to live database</p>
        </div>

        <form action={createPlayer} className="space-y-4">
          {/* PIN Security Field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
              Admin Secret PIN
            </label>
            <input 
              type="password" 
              name="pin" 
              required 
              placeholder="Enter PIN"
              className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
            />
          </div>

          {/* Player Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
              Player Name
            </label>
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="e.g. Budi Santoso"
              className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
              Region
            </label>
            <select 
              name="region" 
              defaultValue="Tangerang"
              className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
            >
              <option value="Tangerang">Tangerang</option>
              <option value="DKI Jakarta">DKI Jakarta</option>
              <option value="Bogor">Bogor</option>
              <option value="Depok">Depok</option>
              <option value="Bekasi">Bekasi</option>
            </select>
          </div>

          {/* Starting Points */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
              Starting Points / Rating
            </label>
            <input 
              type="number" 
              name="points" 
              defaultValue={1000} 
              required 
              className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#F27A1A] hover:bg-[#FF8C2E] text-[#0F0F11] font-bold py-3 rounded-xl text-sm transition-colors mt-2"
          >
            Add Player
          </button>
        </form>
      </div>
    </div>
  );
}