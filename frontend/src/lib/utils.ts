import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Product, DeliveryTimeSlot } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SUPREMO_LISTO_PRICE = 500
export const SHIPPING_COST = 3500
export const FREE_SHIPPING_THRESHOLD = 50000
export const TRANSFER_DISCOUNT_RATE = 0.05
export const QUANTITIES_KG = [0.5, 1, 1.5, 2, 2.5, 3]
export const CUTOFF_HOUR = 13

export const DELIVERY_SLOTS: { value: DeliveryTimeSlot; label: string }[] = [
  { value: 'morning', label: 'Mañana (9:00 - 13:00)' },
  { value: 'afternoon', label: 'Tarde (14:00 - 19:00)' },
]

export function getAvailableDeliveryDates(): Date[] {
  const now = new Date();
  const currentHour = now.getHours();
  const dates: Date[] = [];
  const startDate = new Date(now);

  if (currentHour >= CUTOFF_HOUR) {
    startDate.setDate(startDate.getDate() + 1);
  }

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d);
  }

  return dates;
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function formatDeliveryDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}

export function formatTimeSlotLabel(slot?: DeliveryTimeSlot): string {
  if (!slot) return '';
  const found = DELIVERY_SLOTS.find(s => s.value === slot);
  return found ? found.label : slot;
}

export function isBeforeCutoff(): boolean {
  return new Date().getHours() < CUTOFF_HOUR;
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getSalePrice(product: Product): number | null {
  if (product.isOnSale && product.discountPercentage && product.discountPercentage > 0) {
    return Number(product.basePrice) * (1 - product.discountPercentage / 100);
  }
  return null;
}

export function getEffectivePrice(product: Product, modifier: number = 0): number {
  const salePrice = getSalePrice(product);
  if (salePrice !== null) {
    return salePrice + Number(modifier);
  }
  return Number(product.basePrice) + Number(modifier);
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
