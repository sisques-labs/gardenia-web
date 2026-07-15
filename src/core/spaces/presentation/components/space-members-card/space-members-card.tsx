'use client';

import { UserMinus, UserPlus, Users } from 'lucide-react';
import { SpaceMembersList } from '@/core/spaces/presentation/components/space-members-list/space-members-list';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Card, CardContent } from '@/shared/presentation/components/ui/card/card';
import { FormField } from '@/shared/presentation/components/ui/form-field/form-field';
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
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-bg text-forest"
          >
            <Users className="h-5 w-5" />
          </span>
          <p className="eyebrow">{dict.members.title}</p>
        </div>

        <SpaceMembersList dict={memberListDict} />

        {isOwner && (
          <div className="dashed-rule flex flex-col gap-6 pt-4">
            <form onSubmit={addForm.handleSubmit(onAddMember)} className="flex flex-col gap-2">
              <FormField
                label={
                  <span className="flex items-center gap-1.5">
                    <UserPlus className="h-3.5 w-3.5" aria-hidden /> {dict.members.addTitle}
                  </span>
                }
                error={addForm.formState.errors.targetUserId?.message}
              >
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder={dict.members.addUserIdPlaceholder}
                    data-testid="add-member-input"
                    {...addForm.register('targetUserId')}
                  />
                  <Button
                    type="submit"
                    disabled={addPending}
                    data-testid="add-member-submit"
                    className="sm:shrink-0"
                  >
                    {addPending ? dict.members.addSubmitting : dict.members.addSubmit}
                  </Button>
                </div>
              </FormField>
              {!!addError && <Alert variant="error" message={dict.errors.addFailed} />}
              {addSuccess && <Alert variant="success" message={dict.members.addSuccess} />}
            </form>

            <form onSubmit={removeForm.handleSubmit(onRemoveMember)} className="flex flex-col gap-2">
              <FormField
                label={
                  <span className="flex items-center gap-1.5">
                    <UserMinus className="h-3.5 w-3.5" aria-hidden /> {dict.members.removeTitle}
                  </span>
                }
                error={removeForm.formState.errors.targetUserId?.message}
              >
                <div className="flex flex-col gap-2 sm:flex-row">
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
                    className="sm:shrink-0"
                  >
                    {removePending ? dict.members.removeSubmitting : dict.members.removeSubmit}
                  </Button>
                </div>
              </FormField>
              {!!removeError && <Alert variant="error" message={dict.errors.removeFailed} />}
              {removeSuccess && <Alert variant="success" message={dict.members.removeSuccess} />}
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
