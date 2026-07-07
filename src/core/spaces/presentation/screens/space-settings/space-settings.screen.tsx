"use client";

import { SpaceDetailsCard } from "@/core/spaces/presentation/components/space-details-card/space-details-card";
import { SpaceGeolocationCard } from "@/core/spaces/presentation/components/space-geolocation-card/space-geolocation-card";
import { SpaceInvitationCard } from "@/core/spaces/presentation/components/space-invitation-card/space-invitation-card";
import { SpaceMembersCard } from "@/core/spaces/presentation/components/space-members-card/space-members-card";
import { SpaceWeatherWidget } from "@/core/spaces/presentation/components/space-weather-widget/space-weather-widget";
import { useSpaceSettings } from "@/core/spaces/presentation/hooks/use-space-settings/use-space-settings.hook";
import { ScreenHeader } from "@/shared/presentation/components/screen-header/screen-header";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";

type Props = {
  dict: AppDict["spaces"]["settings"];
  weatherDict: AppDict["spaces"]["weather"];
  memberListDict: AppDict["spaces"]["members"]["list"];
  lang: string;
};

export function SpaceSettingsScreen({ dict, weatherDict, memberListDict, lang }: Props) {
  const {
    spaceDetail: { data: space, isLoading, isError },
    isOwner,
    hasGeolocation,
    copied,
    copy,
    inviteLink,
    invForm,
    addForm,
    removeForm,
    updateSpaceForm,
    onCreateInvitation,
    onAddMember,
    onRemoveMember,
    onUpdateSpace,
    createInvitation: {
      isPending: invPending,
      error: invError,
      data: invitation,
    },
    addMember: {
      isPending: addPending,
      error: addError,
      isSuccess: addSuccess,
    },
    removeMember: {
      isPending: removePending,
      error: removeError,
      isSuccess: removeSuccess,
    },
    updateSpace: {
      isPending: updatePending,
      error: updateError,
      isSuccess: updateSuccess,
    },
  } = useSpaceSettings(lang);

  return (
    <div className="flex flex-col">
      <ScreenHeader title={dict.title} breadcrumbs={[{ label: dict.title }]} />

      <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SpaceDetailsCard
              space={space}
              isLoading={isLoading}
              isError={isError}
              dict={dict}
            />

            {space && (
              <SpaceWeatherWidget
                spaceId={space.id}
                hasGeolocation={hasGeolocation}
                weatherDict={weatherDict}
              />
            )}

            {isOwner && (
              <SpaceGeolocationCard
                dict={dict}
                updateSpaceForm={updateSpaceForm}
                onSubmit={onUpdateSpace}
                isPending={updatePending}
                isError={!!updateError}
                isSuccess={updateSuccess}
              />
            )}
          </div>

          <div className="flex flex-col gap-6">
            {isOwner && (
              <SpaceInvitationCard
                dict={dict}
                invForm={invForm}
                onSubmit={onCreateInvitation}
                isPending={invPending}
                isError={!!invError}
                invitation={invitation}
                copied={copied}
                copy={copy}
                inviteLink={inviteLink}
              />
            )}

            <SpaceMembersCard
              dict={dict}
              memberListDict={memberListDict}
              isOwner={isOwner}
              addForm={addForm}
              removeForm={removeForm}
              onAddMember={onAddMember}
              onRemoveMember={onRemoveMember}
              addPending={addPending}
              addError={addError}
              addSuccess={addSuccess}
              removePending={removePending}
              removeError={removeError}
              removeSuccess={removeSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
