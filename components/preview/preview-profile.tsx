import Image from "next/image";

interface PreviewProfileProps {
  profile: {
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    layout: string;
  };
  isFullBio?: boolean;
}

export function PreviewProfile({ profile, isFullBio }: PreviewProfileProps) {
  return (
    <div className={`mb-8 flex w-full gap-4 transition-all duration-300 ${profile.layout === "center" ? "flex-col items-center text-center" : profile.layout === "left_stack" ? "flex-col items-start text-left" : "items-center  text-left"}`}>
      <div className="size-20 shrink-0 overflow-hidden rounded-full shadow-lg border-2 border-white/10 relative">
        {profile.avatarUrl ? (
          <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" priority sizes="96px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-2xl font-bold text-white tracking-tighter">{profile.displayName?.charAt(0).toUpperCase() || "B"}</div>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <h2 className="text-xl font-bold mb-0.5" style={{ color: "var(--foreground)" }}>
          {profile.displayName || "Your Name"}
        </h2>
        <p className={`text-sm font-medium ${!isFullBio && "line-clamp-2"}`} style={{ color: "var(--accent)" }}>
          {profile.bio || "Add your bio here"}
        </p>
      </div>
    </div>
  );
}
