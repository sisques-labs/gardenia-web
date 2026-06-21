import type { InventoryDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type InventoryDictTranslated = WidenStringLiterals<InventoryDict>;

const dict = {
  list: {
    title: 'Inventario',
    empty: 'Todavía no hay suministros',
    newItem: 'Nuevo artículo',
    lowStockBadge: 'Stock bajo',
    expiringBadge: 'Caduca pronto',
    statusColumn: 'Estado',
    actionsColumn: 'Acciones',
    deleteConfirm: '¿Seguro que quieres eliminar este artículo?',
  },
  filters: {
    searchPlaceholder: 'Buscar por nombre...',
    allTypes: 'Todos los tipos',
    lowStockOnly: 'Stock bajo',
    expiringSoon: 'Caduca pronto',
  },
  form: {
    title: 'Nuevo artículo',
    editTitle: 'Editar artículo',
    submitting: 'Guardando...',
    submit: 'Guardar',
    cancel: 'Cancelar',
    itemType: 'Tipo',
    name: 'Nombre',
    brand: 'Marca',
    notes: 'Notas',
    quantity: 'Cantidad',
    unit: 'Unidad',
    lowStockThreshold: 'Umbral de stock bajo',
    acquiredAt: 'Adquirido el',
    expiresAt: 'Caduca el',
  },
  adjust: {
    title: 'Ajustar cantidad',
    currentQuantity: 'Cantidad actual',
    delta: 'Ajuste (+ reponer / − consumir)',
    reason: 'Motivo',
    submit: 'Aplicar',
    submitting: 'Aplicando...',
    cancel: 'Cancelar',
  },
  row: {
    edit: 'Editar',
    adjust: 'Ajustar',
    delete: 'Eliminar',
  },
  types: {
    SEEDS: 'Semillas',
    FERTILIZER: 'Fertilizante',
    SUBSTRATE: 'Sustrato',
    PHYTOSANITARY: 'Fitosanitario',
    OTHER: 'Otro',
  },
  units: {
    UNITS: 'unidades',
    G: 'g',
    KG: 'kg',
    ML: 'ml',
    L: 'l',
    PACKETS: 'sobres',
  },
  errors: {
    loadFailed: 'No se pudo cargar el inventario. Inténtalo de nuevo.',
    createFailed: 'No se pudo crear el artículo. Inténtalo de nuevo.',
    updateFailed: 'No se pudo actualizar el artículo. Inténtalo de nuevo.',
    deleteFailed: 'No se pudo eliminar el artículo. Inténtalo de nuevo.',
    adjustFailed: 'No se pudo ajustar la cantidad. Inténtalo de nuevo.',
  },
} as const satisfies InventoryDictTranslated;

export default dict;
