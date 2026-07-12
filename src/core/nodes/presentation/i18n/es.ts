import type { NodesDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

const dict = {
  nav: 'Dispositivos',
  title: 'Dispositivos',
  subtitle: 'Bridges y nodos sensores conectados a este espacio',
  claim: {
    trigger: 'Vincular bridge',
    title: 'Vincular un bridge',
    bridgeId: 'Id del bridge',
    bridgeIdPlaceholder: 'UUID mostrado por el bridge',
    bridgeIdRequired: 'El id del bridge es obligatorio',
    pairingCode: 'Código de emparejamiento',
    pairingCodePlaceholder: 'GRDN-XXXX',
    pairingCodeRequired: 'El código de emparejamiento es obligatorio',
    cancel: 'Cancelar',
    submit: 'Vincular',
    submitting: 'Vinculando…',
    error: 'No se ha podido vincular el bridge. Revisa el id y el código.',
  },
  list: {
    bridgesHeading: 'Bridges',
    bridgesEmpty: 'Todavía no hay bridges vinculados. Vincula uno con su código de emparejamiento.',
    nodesHeading: 'Nodos',
    nodesEmpty: 'Todavía no hay nodos reportando datos.',
    lastSeen: 'Visto por última vez',
    neverSeen: 'Nunca visto',
  },
} satisfies WidenStringLiterals<NodesDict>;

export default dict;
