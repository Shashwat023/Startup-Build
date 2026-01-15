import { cn } from "@/lib/utils";

export const RadialGlowBackground = () => {
  return (
    <div className="min-h-screen w-full bg-[#020617] relative">
      {/* Orange Radial Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(249,115,22,0.4), transparent)`,
        }}
      />
      {/* Your Content/Components */}
    </div>
  );
};
