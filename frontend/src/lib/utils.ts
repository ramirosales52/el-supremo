import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Product } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SUPREMO_LISTO_PRICE = 500
export const SHIPPING_COST = 3500
export const FREE_SHIPPING_THRESHOLD = 50000
export const TRANSFER_DISCOUNT_RATE = 0.05
export const QUANTITIES_KG = [0.5, 1, 1.5, 2, 2.5, 3]

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
