import { LensChatSimulator } from '@/app/components/LensChatSimulator';

const DEEP = '#041E42';

export function LensChatPage() {
  return (
    <div className="h-screen w-screen" style={{ backgroundColor: DEEP }}>
      <LensChatSimulator />
    </div>
  );
}
