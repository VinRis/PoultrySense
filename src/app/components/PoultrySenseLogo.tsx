import Image from "next/image";

export function PoultrySenseLogo() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Image src="/logo.svg" alt="PoultrySense AI Logo" width={32} height={32} />
      <span className="font-bold text-lg text-primary hidden md:inline">PoultrySense AI</span>
    </div>
  );
}
