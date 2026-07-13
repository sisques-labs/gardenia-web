import { z } from 'zod';

export const claimBridgeSchema = z.object({
  bridgeId: z.string().min(1, 'bridgeIdRequired'),
  pairingCode: z.string().min(1, 'pairingCodeRequired'),
});

export type ClaimBridgeFormValues = z.infer<typeof claimBridgeSchema>;
