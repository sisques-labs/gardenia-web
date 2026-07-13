import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClaimBridge } from '@/core/nodes/presentation/hooks/use-claim-bridge/use-claim-bridge.hook';
import {
  claimBridgeSchema,
  type ClaimBridgeFormValues,
} from '@/core/nodes/presentation/schemas/claim-bridge.schema';

export function useClaimBridgeForm(onClose: () => void) {
  const { mutate: claimBridge, isPending, error } = useClaimBridge();

  const form = useForm<ClaimBridgeFormValues>({
    resolver: zodResolver(claimBridgeSchema),
  });

  const onSubmit = form.handleSubmit(({ bridgeId, pairingCode }) => {
    claimBridge({ bridgeId, pairingCode }, { onSuccess: onClose });
  });

  return { form, onSubmit, isPending, error };
}
