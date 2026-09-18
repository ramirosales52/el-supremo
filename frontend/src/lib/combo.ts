import type {
  Combo,
  ComboComponent,
  ComboOption,
  ComboSelectionEntry,
  ComboSelectionGroup,
  ComboSelectionPayload,
} from '../types';

export type Sels = Record<number, number>;

export function getActiveOptions(group: ComboSelectionGroup): ComboOption[] {
  return group.options.filter(
    (o) => o.isActive && (o.productId == null || o.productAvailable !== false),
  );
}

export function getChildren(component: ComboComponent, parentOptionId: number | null): ComboSelectionGroup[] {
  return component.groups
    .filter((g) => g.parentOptionId === parentOptionId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getRootGroups(component: ComboComponent): ComboSelectionGroup[] {
  return getChildren(component, null);
}

export function collectGroups(component: ComboComponent): ComboSelectionGroup[] {
  const all: ComboSelectionGroup[] = [];
  const visit = (groups: ComboSelectionGroup[]) => {
    for (const g of groups) {
      all.push(g);
      for (const o of g.options) {
        visit(getChildren(component, o.id));
      }
    }
  };
  visit(getRootGroups(component));
  return all;
}

export function buildSelectionPayload(combo: Combo, selections: Sels): ComboSelectionPayload {
  const payload: ComboSelectionPayload = [];
  for (const comp of combo.components) {
    const entries: ComboSelectionEntry[] = [];
    for (const g of collectGroups(comp)) {
      const optionId = selections[g.id];
      if (optionId != null) entries.push({ groupId: g.id, optionId });
    }
    if (entries.length) payload.push({ componentId: comp.id, selections: entries });
  }
  return payload;
}

export function comboCartKey(comboId: number, options: ComboSelectionPayload): string {
  const sorted = options
    .map((c) => ({
      componentId: c.componentId,
      selections: [...c.selections].sort((a, b) => a.groupId - b.groupId),
    }))
    .sort((a, b) => a.componentId - b.componentId);
  return `combo:${comboId}:${JSON.stringify(sorted)}`;
}

function clearChildren(component: ComboComponent, selections: Sels, parentOptionId: number) {
  for (const kid of getChildren(component, parentOptionId)) {
    const chosen = selections[kid.id];
    if (chosen != null) {
      delete selections[kid.id];
      clearChildren(component, selections, chosen);
    }
  }
}

// Al cambiar la opción de un grupo, limpia las selecciones de los grupos
// hijos de la opción anterior (jerarquía tipo "Pollo -> Corte").
export function pruneSelections(
  combo: Combo,
  selections: Sels,
  changedGroupId: number,
  newOptionId: number | null,
): Sels {
  const next: Sels = { ...selections };
  for (const comp of combo.components) {
    if (!collectGroups(comp).some((g) => g.id === changedGroupId)) continue;
    const oldOptionId = next[changedGroupId];
    if (oldOptionId != null && oldOptionId !== newOptionId) {
      clearChildren(comp, next, oldOptionId);
    }
    if (newOptionId != null) next[changedGroupId] = newOptionId;
    else delete next[changedGroupId];
    break;
  }
  return next;
}

function missingInGroup(component: ComboComponent, group: ComboSelectionGroup, selections: Sels): number {
  const opts = getActiveOptions(group);
  if (opts.length === 0) return 0; // no hay opciones: el combo no es vendible, se expone aparte
  const chosen = selections[group.id];
  const opt = opts.find((o) => o.id === chosen);
  if (!opt) return 1;
  let missing = 0;
  for (const kid of getChildren(component, opt.id)) {
    missing += missingInGroup(component, kid, selections);
  }
  return missing;
}

export function countMissingSelections(combo: Combo, selections: Sels): number {
  let missing = 0;
  for (const comp of combo.components) {
    for (const g of getRootGroups(comp)) {
      missing += missingInGroup(comp, g, selections);
    }
  }
  return missing;
}

export interface ComboAvailability {
  sellable: boolean;
  reasons: { component: string; group: string }[];
}

export function getComboAvailability(combo: Combo): ComboAvailability {
  const reasons: ComboAvailability['reasons'] = [];
  for (const comp of combo.components) {
    const all = collectGroups(comp);
    if (all.length === 0 && comp.fixedProductId == null) {
      reasons.push({ component: comp.name, group: '' });
    }
    for (const g of all) {
      if (getActiveOptions(g).length === 0) {
        reasons.push({ component: comp.name, group: g.name });
      }
    }
  }
  return { sellable: reasons.length === 0, reasons };
}

export function formatComboQty(quantity: number, unit: string): string {
  if (unit === 'un') return `${Number(quantity)} un.`;
  if (Number(quantity) < 1) return `${Math.round(Number(quantity) * 1000)} g`;
  return `${Number(quantity)} kg`;
}