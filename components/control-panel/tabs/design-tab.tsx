import BackgroundOptions from "@/components/control-panel/background-options";
import BackgroundPattern from "@/components/control-panel/background-pattern";
import BackgroundEffect from "@/components/control-panel/background-effect";
import { CardTextureSelector } from "@/components/control-panel/texture-selector";
import { ResetStylesIndicator } from "@/components/editor/reset-styles-indicator";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

interface DesignTabProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export function DesignTab({ profile, onUpdate }: DesignTabProps) {
  return (
    <div className="px-3 pb-4">
      <div className="space-y-6">
        <ResetStylesIndicator profile={profile} onUpdate={onUpdate} />

        <div className="w-full flex gap-x-2 justify-between items-center">
          <BackgroundPattern profile={profile} onUpdate={onUpdate} />
          <BackgroundEffect profile={profile} onUpdate={onUpdate} />
        </div>

        <div>
          <BackgroundOptions profile={profile} onUpdate={onUpdate} />
        </div>

        <div>
          <CardTextureSelector profile={profile} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  );
}

