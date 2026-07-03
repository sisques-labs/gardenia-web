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
  },
  delete: {
    confirmTitle: 'Eliminar artículo',
    confirmDescription: 'Esta acción no se puede deshacer. El artículo se eliminará del inventario de forma permanente.',
    confirm: 'Eliminar',
    cancel: 'Cancelar',
    error: 'No se pudo eliminar el artículo. Inténtalo de nuevo.',
  },
  filters: {
    searchPlaceholder: 'Buscar por nombre...',
    allTypes: 'Todos los tipos',
    lowStockOnly: 'Stock bajo',
    expiringSoon: 'Caduca pronto',
    searchChipLabel: 'Búsqueda',
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
    actionsMenu: 'Abrir menú de acciones',
    viewDetail: 'Ver detalle',
    edit: 'Editar',
    adjust: 'Ajustar',
    delete: 'Eliminar',
  },
  detail: {
    createdAt: 'Creado',
    updatedAt: 'Última actualización',
    noValue: '—',
  },
  bulk: {
    selectedSuffix: 'seleccionados',
    deleteSelected: 'Eliminar seleccionados',
    confirmTitle: 'Eliminar artículos seleccionados',
    confirmDescription: 'Esta acción no se puede deshacer. Los artículos seleccionados se eliminarán del inventario de forma permanente.',
    confirm: 'Eliminar',
    cancel: 'Cancelar',
    partialSuccess: '{deleted} de {total} artículos eliminados. El resto ya no existía.',
    error: 'No se pudieron eliminar los artículos seleccionados. Inténtalo de nuevo.',
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
    adjustFailed: 'No se pudo ajustar la cantidad. Inténtalo de nuevo.',
  },
} as const satisfies InventoryDictTranslated;

export default dict;
