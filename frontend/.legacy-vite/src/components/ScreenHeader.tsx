import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, back, right, className, onBack }: ScreenHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className={cn("flex items-center gap-3 px-5 pt-6 pb-3", className)}>
      {back && (
        <button
          aria-label="Go back"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary tap"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {title && <h1 className="font-display text-[22px] font-bold leading-tight truncate">{title}</h1>}
        {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
