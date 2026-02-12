import { Feather } from "lucide-react";

export function PoultrySenseLogo() {
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <Feather className="h-6 w-6" />
      </div>
      <span className="font-bold text-lg text-primary">PoultrySense AI</span>
    </div>
  );
}
