"use client";

import { SpaceMembersList } from "@/core/spaces/presentation/components/space-members-list/space-members-list.component";
import { SpaceWeatherWidget } from "@/core/spaces/presentation/components/space-weather-widget/space-weather-widget.component";
import { useSpaceSettings } from "@/core/spaces/presentation/hooks/use-space-settings/useSpaceSettings.hook";
import { ScreenHeader } from "@/shared/presentation/components/screen-header/screen-header";
import { Alert } from "@/shared/presentation/components/ui/alert/alert";
import { Button } from "@/shared/presentation/components/ui/button/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card/card";
import { Input } from "@/shared/presentation/components/ui/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/presentation/components/ui/select/select";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";
import { Check, Copy } from "lucide-react";
import Image from "next/image";

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
    copied,
    copy,
    inviteLink,
    invForm,
    addForm,
    removeForm,
    geoForm,
    onCreateInvitation,
    onAddMember,
    onRemoveMember,
    onUpdateGeolocation,
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
    updateGeolocation: {
      isPending: geoPending,
      error: geoError,
      isSuccess: geoSuccess,
    },
  } = useSpaceSettings(lang);

  const hasGeolocation = !!(space?.latitude != null && space?.longitude != null);

  return (
    <div className="flex flex-col">
      <ScreenHeader title={dict.title} />

      <div className="p-6 flex flex-col gap-6 max-w-2xl">
        {/* Details */}
        <Card>
          <CardContent className="pt-6 flex flex-col gap-3">
            <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {dict.details.title}
            </p>
            {isLoading && (
              <div className="flex flex-col gap-2">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
            )}
            {isError && (
              <Alert variant="error" message={dict.errors.loadFailed} />
            )}
            {space && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{dict.details.name}</dt>
                <dd data-testid="space-name" className="font-medium">
                  {space.name}
                </dd>
                <dt className="text-muted-foreground">{dict.details.owner}</dt>
                <dd data-testid="space-owner" className="font-mono text-xs">
                  {space.ownerId}
                </dd>
                <dt className="text-muted-foreground">
                  {dict.details.createdAt}
                </dt>
                <dd data-testid="space-created-at">
                  {new Date(space.createdAt).toLocaleDateString()}
                </dd>
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Weather */}
        {space && (
          <SpaceWeatherWidget
            spaceId={space.id}
            hasGeolocation={hasGeolocation}
            weatherDict={weatherDict}
          />
        )}

        {/* Geolocation — owner only */}
        {isOwner && (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.geolocation.title}
              </p>
              <p className="text-sm text-muted-foreground">{dict.geolocation.hint}</p>
              <form
                onSubmit={geoForm.handleSubmit(onUpdateGeolocation)}
                className="flex flex-col gap-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">
                      {dict.geolocation.latitudeLabel}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      placeholder={dict.geolocation.latitudePlaceholder}
                      data-testid="geolocation-latitude-input"
                      {...geoForm.register("latitude")}
                    />
                    {geoForm.formState.errors.latitude && (
                      <span className="text-destructive text-xs">
                        {geoForm.formState.errors.latitude.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">
                      {dict.geolocation.longitudeLabel}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      placeholder={dict.geolocation.longitudePlaceholder}
                      data-testid="geolocation-longitude-input"
                      {...geoForm.register("longitude")}
                    />
                    {geoForm.formState.errors.longitude && (
                      <span className="text-destructive text-xs">
                        {geoForm.formState.errors.longitude.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">
                    {dict.geolocation.environmentLabel}
                  </label>
                  <Select
                    value={geoForm.watch("environment") ?? ""}
                    onValueChange={(v) =>
                      geoForm.setValue(
                        "environment",
                        v === "" ? null : (v as "INDOOR" | "OUTDOOR" | "MIXED"),
                      )
                    }
                  >
                    <SelectTrigger data-testid="geolocation-environment-select">
                      <SelectValue placeholder={dict.geolocation.environmentNone} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDOOR">{dict.geolocation.environmentIndoor}</SelectItem>
                      <SelectItem value="OUTDOOR">{dict.geolocation.environmentOutdoor}</SelectItem>
                      <SelectItem value="MIXED">{dict.geolocation.environmentMixed}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {geoError && (
                  <Alert variant="error" message={dict.geolocation.saveError} />
                )}
                {geoSuccess && (
                  <Alert variant="success" message={dict.geolocation.saveSuccess} />
                )}
                <Button
                  type="submit"
                  disabled={geoPending}
                  data-testid="geolocation-save-submit"
                >
                  {geoPending ? dict.geolocation.saving : dict.geolocation.save}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Invitation — owner only */}
        {isOwner && (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.invitation.title}
              </p>
              <form
                onSubmit={invForm.handleSubmit(onCreateInvitation)}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">
                    {dict.invitation.roleLabel}
                  </label>
                  <Select
                    defaultValue="member"
                    onValueChange={(v) =>
                      invForm.setValue("role", v as "owner" | "member")
                    }
                  >
                    <SelectTrigger data-testid="invitation-role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">
                        {dict.invitation.roleMember}
                      </SelectItem>
                      <SelectItem value="owner">
                        {dict.invitation.roleOwner}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">
                    {dict.invitation.expiresLabel}
                  </label>
                  <Input
                    type="datetime-local"
                    data-testid="invitation-expires-input"
                    {...invForm.register("expiresAt")}
                  />
                </div>
                {invError && (
                  <Alert
                    variant="error"
                    message={dict.errors.invitationFailed}
                  />
                )}
                <Button
                  type="submit"
                  disabled={invPending}
                  data-testid="invitation-submit"
                >
                  {invPending
                    ? dict.invitation.submitting
                    : dict.invitation.submit}
                </Button>
              </form>

              {invitation && (
                <div
                  data-testid="invitation-result"
                  className="flex flex-col gap-3 pt-2 border-t border-[var(--rule)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {dict.invitation.code}:
                    </span>
                    <code
                      data-testid="invitation-display-code"
                      className="font-mono text-sm font-semibold"
                    >
                      {invitation.displayCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="copy-code-btn"
                      onClick={() => copy(invitation.code, "code")}
                    >
                      {copied === "code" ? (
                        <>
                          <Check className="w-3 h-3" />{" "}
                          {dict.invitation.codeCopied}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />{" "}
                          {dict.invitation.copyCode}
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="copy-link-btn"
                      onClick={() => copy(inviteLink(invitation), "link")}
                    >
                      {copied === "link" ? (
                        <>
                          <Check className="w-3 h-3" />{" "}
                          {dict.invitation.linkCopied}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />{" "}
                          {dict.invitation.copyLink}
                        </>
                      )}
                    </Button>
                  </div>
                  {invitation.qrId && (
                    <div className="flex flex-col gap-2">
                      <Image
                        data-testid="invitation-qr"
                        src={`/api/qrs/${invitation.qrId}/image`}
                        alt={dict.invitation.qrAlt}
                        width={128}
                        height={128}
                        unoptimized
                        className="border border-[var(--rule)] rounded-md"
                      />
                      <p className="text-xs text-muted-foreground">
                        {dict.invitation.qrHint}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Members */}
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {dict.members.title}
            </p>
            <SpaceMembersList dict={memberListDict} />

            {isOwner && (
              <div className="flex flex-col gap-6 pt-2 border-t border-[var(--rule)]">
                {/* Add member */}
                <form
                  onSubmit={addForm.handleSubmit(onAddMember)}
                  className="flex flex-col gap-2"
                >
                  <p className="text-sm font-medium">{dict.members.addTitle}</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder={dict.members.addUserIdPlaceholder}
                      data-testid="add-member-input"
                      {...addForm.register("targetUserId")}
                    />
                    <Button
                      type="submit"
                      disabled={addPending}
                      data-testid="add-member-submit"
                    >
                      {addPending
                        ? dict.members.addSubmitting
                        : dict.members.addSubmit}
                    </Button>
                  </div>
                  {addForm.formState.errors.targetUserId && (
                    <span className="text-destructive text-xs">
                      {addForm.formState.errors.targetUserId.message}
                    </span>
                  )}
                  {addError && (
                    <Alert variant="error" message={dict.errors.addFailed} />
                  )}
                  {addSuccess && (
                    <Alert
                      variant="success"
                      message={dict.members.addSuccess}
                    />
                  )}
                </form>

                {/* Remove member */}
                <form
                  onSubmit={removeForm.handleSubmit(onRemoveMember)}
                  className="flex flex-col gap-2"
                >
                  <p className="text-sm font-medium">
                    {dict.members.removeTitle}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder={dict.members.removeUserIdPlaceholder}
                      data-testid="remove-member-input"
                      {...removeForm.register("targetUserId")}
                    />
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={removePending}
                      data-testid="remove-member-submit"
                    >
                      {removePending
                        ? dict.members.removeSubmitting
                        : dict.members.removeSubmit}
                    </Button>
                  </div>
                  {removeForm.formState.errors.targetUserId && (
                    <span className="text-destructive text-xs">
                      {removeForm.formState.errors.targetUserId.message}
                    </span>
                  )}
                  {removeError && (
                    <Alert variant="error" message={dict.errors.removeFailed} />
                  )}
                  {removeSuccess && (
                    <Alert
                      variant="success"
                      message={dict.members.removeSuccess}
                    />
                  )}
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
