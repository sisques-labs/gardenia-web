'use client';

import { SpaceMembersList } from '@/core/spaces/presentation/components/space-members-list/space-members-list.component';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Card, CardContent } from '@/shared/presentation/components/ui/card/card';
import { Input } from '@/shared/presentation/components/ui/input/input';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import type { UseFormReturn } from 'react-hook-form';
import type { AddMemberFormValues } from '@/core/spaces/presentation/schemas/add-member.schema';

interface SpaceMembersCardProps {
  dict: AppDict['spaces']['settings'];
  memberListDict: AppDict['spaces']['members']['list'];
  isOwner: boolean;
  addForm: UseFormReturn<AddMemberFormValues>;
  removeForm: UseFormReturn<AddMemberFormValues>;
  onAddMember: (values: AddMemberFormValues) => void;
  onRemoveMember: (values: AddMemberFormValues) => void;
  addPending: boolean;
  addError: unknown;
  addSuccess: boolean;
  removePending: boolean;
  removeError: unknown;
  removeSuccess: boolean;
}

export function SpaceMembersCard({
  dict,
  memberListDict,
  isOwner,
  addForm,
  removeForm,
  onAddMember,
  onRemoveMember,
  addPending,
  addError,
  addSuccess,
  removePending,
  removeError,
  removeSuccess,
}: SpaceMembersCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4">
        <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {dict.members.title}
        </p>
        <SpaceMembersList dict={memberListDict} />

        {isOwner && (
          <div className="flex flex-col gap-6 pt-2 border-t border-[var(--rule)]">
            <form onSubmit={addForm.handleSubmit(onAddMember)} className="flex flex-col gap-2">
              <p className="text-sm font-medium">{dict.members.addTitle}</p>
              <div className="flex gap-2">
                <Input
                  placeholder={dict.members.addUserIdPlaceholder}
                  data-testid="add-member-input"
                  {...addForm.register('targetUserId')}
                />
                <Button type="submit" disabled={addPending} data-testid="add-member-submit">
                  {addPending ? dict.members.addSubmitting : dict.members.addSubmit}
                </Button>
              </div>
              {addForm.formState.errors.targetUserId && (
                <span className="text-destructive text-xs">
                  {addForm.formState.errors.targetUserId.message}
                </span>
              )}
              {!!addError && <Alert variant="error" message={dict.errors.addFailed} />}
              {addSuccess && <Alert variant="success" message={dict.members.addSuccess} />}
            </form>

            <form onSubmit={removeForm.handleSubmit(onRemoveMember)} className="flex flex-col gap-2">
              <p className="text-sm font-medium">{dict.members.removeTitle}</p>
              <div className="flex gap-2">
                <Input
                  placeholder={dict.members.removeUserIdPlaceholder}
                  data-testid="remove-member-input"
                  {...removeForm.register('targetUserId')}
                />
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={removePending}
                  data-testid="remove-member-submit"
                >
                  {removePending ? dict.members.removeSubmitting : dict.members.removeSubmit}
                </Button>
              </div>
              {removeForm.formState.errors.targetUserId && (
                <span className="text-destructive text-xs">
                  {removeForm.formState.errors.targetUserId.message}
                </span>
              )}
              {!!removeError && <Alert variant="error" message={dict.errors.removeFailed} />}
              {removeSuccess && <Alert variant="success" message={dict.members.removeSuccess} />}
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
