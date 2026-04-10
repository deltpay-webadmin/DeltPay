import { LensChatSimulator } from '@/app/components/LensChatSimulator';

const DEEP = '#03152E';

export function LensChatPage() {
  return (
    <div className="h-screen w-screen" style={{ backgroundColor: DEEP }}>
      <LensChatSimulator />
    </div>
  );
}
