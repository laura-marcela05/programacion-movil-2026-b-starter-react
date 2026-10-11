/**
 * Capa DOMAIN de la funcionalidad «Productos» (nombres de capa del framework:
 * `01-architecture/layers-and-state` → data / domain / presentation).
 *
 * Solo tipos, constantes y funciones puras: aquí no hay HTTP, ni React, ni Ionic
 * (regla de dependencias del framework: el dominio no depende de nada de afuera).
 *
 * Los tipos, las constantes y `formatCOP` ya vienen dados. Las tres funciones
 * `toProductView`, `validateProduct` y `filterProducts` son STUBS: se implementan
 * en la Parte 3 del TODO.md.
 */

/** Producto tal como lo entrega la API. */
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

/** Datos que captura el formulario (aún sin id). */
export interface ProductInput {
  name: string;
  price: number;
  category: string;
  stock: number;
}

/** Producto listo para mostrarse en la interfaz. */
export interface ProductView {
  id: number;
  name: string;
  /** Precio en pesos colombianos, p. ej. "$ 1.250.000". */
  priceLabel: string;
  category: string;
  stock: number;
  /** "Agotado" (0) · "Pocas unidades" (menos de LOW_STOCK_THRESHOLD) · "Disponible". */
  stockLabel: string;
  /** true cuando quedan entre 1 y LOW_STOCK_THRESHOLD - 1 unidades. */
  isLowStock: boolean;
  /** true cuando no quedan unidades (stock = 0). */
  isOutOfStock: boolean;
}

/** Campos del formulario que pueden tener un error de validación. */
export type ProductField = "name" | "price" | "category" | "stock";

/** Resultado de validar un `ProductInput`. */
export interface ValidationResult {
  isValid: boolean;
  /** Mensaje de error por campo. Vacío si `isValid` es true. */
  errors: Partial<Record<ProductField, string>>;
}

/** Filtros de la lista. `category` vacío significa «todas». */
export interface ProductFilters {
  search: string;
  category: string;
}

/** Categorías permitidas (las mismas que valida la API). */
export const CATEGORIES = ["Bebidas", "Snacks", "Aseo", "Hogar"] as const;

/** Longitud máxima del nombre. */
export const NAME_MAX_LENGTH = 60;

/** Umbral de «pocas unidades»: un stock menor que este valor (y mayor que 0). */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * YA DADO. Formatea un número como pesos colombianos con separador de miles «.»:
 * formatCOP(1250000) → "$ 1.250.000"; formatCOP(8500) → "$ 8.500".
 * (El separador se pone con una expresión regular sobre el número redondeado.)
 */
export function formatCOP(value: number): string {
  const digits = Math.round(value).toString();
  return `$ ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/**
 * Convierte un `Product` en un `ProductView`.
 *
 * Contrato:
 *  - `name`: sin espacios sobrantes al inicio ni al final.
 *  - `priceLabel`: el precio con `formatCOP` (p. ej. 1250000 → "$ 1.250.000").
 *  - `stockLabel`: «Agotado» si stock = 0 · «Pocas unidades» si stock < LOW_STOCK_THRESHOLD · «Disponible» en otro caso.
 *  - `isOutOfStock` e `isLowStock` coherentes con la etiqueta; `id`, `category` y `stock` pasan sin cambios.
 */

export function toProductView(product: Product): ProductView {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD;

  let stockLabel = "Disponible";
  if (isOutOfStock) {
    stockLabel = "Agotado";
  } else if (isLowStock) {
    stockLabel = "Pocas unidades";
  }

  return {
    id: product.id,
    name: product.name.trim(),
    priceLabel: formatCOP(product.price),
    category: product.category,
    stock: product.stock,
    stockLabel,
    isLowStock,
    isOutOfStock,
  };
}

/**
 * Valida los datos del formulario con las MISMAS reglas que la API.
 *
 * Contrato:
 *  - `name`: obligatorio (solo espacios cuenta como vacío) y de máximo NAME_MAX_LENGTH caracteres.
 *  - `price`: número finito mayor que 0.
 *  - `category`: obligatoria y una de CATEGORIES.
 *  - `stock`: entero mayor o igual que 0.
 *  - `errors` trae un mensaje por cada campo inválido; `isValid` es true solo si no hay errores.
 */
export function validateProduct(input: ProductInput): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (name === "") {
    errors.name = "name es obligatorio";
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = "name debe tener máximo 60 caracteres";
  }

  if (
    typeof input.price !== "number" ||
    !Number.isFinite(input.price) ||
    input.price <= 0
  ) {
    errors.price = "price debe ser un número mayor que 0";
  }

  if (!(CATEGORIES as readonly string[]).includes(input.category)) {
    errors.category = "category debe ser una de: Bebidas, Snacks, Aseo, Hogar";
  }

  if (!Number.isInteger(input.stock) || input.stock < 0) {
    errors.stock = "stock debe ser un entero mayor o igual que 0";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Filtra la lista en memoria.
 *
 * Contrato:
 *  - `search`: conserva los productos cuyo nombre CONTIENE el texto, sin distinguir mayúsculas
 *    (un texto vacío o de espacios no filtra).
 *  - `category`: conserva solo los de esa categoría exacta (vacío = todas).
 *  - Devuelve un arreglo nuevo; no modifica el original.
 */
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  const text = filters.search.trim().toLowerCase();

  return products.filter((item) => {
    const matchesSearch = text === "" || item.name.toLowerCase().includes(text);
    const matchesCategory =
      filters.category === "" || item.category === filters.category;
    return matchesSearch && matchesCategory;
  });
}
