'use client';

import { useClaimBridgeForm } from '@/core/nodes/presentation/hooks/use-claim-bridge-form/use-claim-bridge-form.hook';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { resolveFieldError } from '@/shared/presentation/utils/resolve-field-error';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['nodes']['claim'];
  onClose: () => void;
};

export function ClaimBridgeDialog({ dict, onClose }: Props) {
  const { form, onSubmit, isPending, error } = useClaimBridgeForm(onClose);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <FormModal
      title={dict.title}
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      cancelLabel={dict.cancel}
      submitLabel={dict.submit}
      submittingLabel={dict.submitting}
      maxWidth="sm"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="claim-bridge-id" className="text-sm text-ink-2">
          {dict.bridgeId}
        </label>
        <Input id="claim-bridge-id" placeholder={dict.bridgeIdPlaceholder} {...register('bridgeId')} />
        {errors.bridgeId && (
          <span className="text-destructive text-xs">
            {resolveFieldError(errors.bridgeId.message, dict)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="claim-pairing-code" className="text-sm text-ink-2">
          {dict.pairingCode}
        </label>
        <Input
          id="claim-pairing-code"
          placeholder={dict.pairingCodePlaceholder}
          {...register('pairingCode')}
        />
        {errors.pairingCode && (
          <span className="text-destructive text-xs">
            {resolveFieldError(errors.pairingCode.message, dict)}
          </span>
        )}
      </div>

      {error && <span className="text-destructive text-xs">{error.message || dict.error}</span>}
    </FormModal>
  );
}
