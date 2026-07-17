
import { ProfileEditor } from "@/components/control-panel/profile-editor";
import { SocialMediaEditor } from "@/components/control-panel/social-editor";
import { ProfileLayoutSelector } from "@/components/control-panel/profile-layout-selector";
import { LinkCardEditor } from "@/components/control-panel/link-card-editor";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

interface ProfileTabProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export function ProfileTab({ profile, onUpdate }: ProfileTabProps) {
  return (
    <div className="space-y-2 px-3 pb-4">
      <div className="px-2 pb-2">
        <ProfileEditor profile={profile} onUpdate={onUpdate} />
      </div>

      <div className="px-2 pb-2">
        <ProfileLayoutSelector profile={profile} onUpdate={onUpdate} />
      </div>
      <div className="px-2 pb-2">
        <LinkCardEditor profile={profile} onUpdate={onUpdate} />
      </div>

      <SocialMediaEditor profile={profile} onUpdate={onUpdate} />
    </div>
  );
}
