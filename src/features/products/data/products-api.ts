/**
 * Capa DATA: cliente HTTP de la API de productos (server/app.js).
 *
 * `request` y `getProducts` vinieron resueltos como ejemplo del patrón; el resto de las
 * funciones (`getProduct`, `createProduct`, `updateProduct`, `deleteProduct`) lo replica.
 */
import type { Product, ProductInput } from "../domain/product";
import { ApiError } from "./api-error";
import { API_URL } from "./config";

/**
 * YA DADO. Hace una petición a la API y devuelve el cuerpo JSON ya convertido.
 *  1. Si `fetch` lanza una excepción, la API no respondió: ApiError de red (status null).
 *  2. Si la respuesta no es exitosa (`!response.ok`), se lee el cuerpo `{ error, details }`
 *     y se lanza un ApiError con el código que devolvió el servidor.
 *  3. El 204 (DELETE) no trae cuerpo: se devuelve undefined.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError("No fue posible conectar con el servidor.", null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      body?.error ?? `Error ${response.status}`,
      response.status,
      body?.details ?? [],
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export interface ProductQuery {
  search?: string;
  category?: string;
}

/** YA DADO (ejemplo): GET /api/products?search=&category= */
export async function getProducts(
  query: ProductQuery = {},
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  const queryString = params.toString();
  return request<Product[]>(
    `/api/products${queryString ? `?${queryString}` : ""}`,
  );
}

/** GET /api/products/:id */
export async function getProduct(id: number): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}

/** POST /api/products: cuerpo JSON con el producto (el id lo asigna el servidor). */
export async function createProduct(input: ProductInput): Promise<Product> {
  return request<Product>("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** PUT /api/products/:id: reemplaza el producto completo y conserva el id. */
export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<Product> {
  return request<Product>(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** DELETE /api/products/:id: responde 204 sin cuerpo (request devuelve undefined). */
export async function deleteProduct(id: number): Promise<void> {
  return request<void>(`/api/products/${id}`, { method: "DELETE" });
}
