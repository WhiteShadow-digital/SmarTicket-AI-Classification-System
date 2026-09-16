import { Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-crimson-gradient p-1.5 rounded-lg">
        <Scissors className="h-5 w-5 text-white" />
      </div>
      <h1 className="font-headline text-2xl font-bold text-primary tracking-tight">
        ELSSK
      </h1>
    </div>
  );
}
