// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { startTestServer } from "./test-server";

/**
 * Prueba de la API de EJEMPLO (ya viene dada). Patrón que se espera en las pruebas de la API:
 *  1. `startTestServer()` levanta la API en un puerto libre antes de cada prueba.
 *  2. `fetch` (el de Node, sin dependencias extra) llama a la API como lo haría la app.
 *  3. Se comprueba el código de estado y el cuerpo.
 *  4. `close()` cierra el servidor al terminar.
 */
let baseUrl = "";
let close: () => Promise<void>;

beforeEach(async () => {
  ({ baseUrl, close } = await startTestServer());
});

afterEach(async () => {
  await close();
});

describe("API de productos (ejemplo)", () => {
  it("arranca y responde 404 con el formato de error en una ruta desconocida", async () => {
    const response = await fetch(`${baseUrl}/api/no-existe`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: expect.any(String),
      details: expect.any(Array),
    });
  });
});

describe("API de productos", () => {
  it("postProduct_whenInvalid_returns400WithDetails", async () => {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "",
        price: "100",
        category: "Ropa",
        stock: -1,
      }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Datos inválidos");
    expect(body.details).toEqual([
      "name es obligatorio",
      "price debe ser un número mayor que 0",
      "category debe ser una de: Bebidas, Snacks, Aseo, Hogar",
      "stock debe ser un entero mayor o igual que 0",
    ]);
  });

  it("getProduct_whenIdDoesNotExist_returns404", async () => {
    const response = await fetch(`${baseUrl}/api/products/999`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: "Producto no encontrado",
      details: ["No existe un producto con id 999"],
    });
  });

  it("getProduct_whenIdNotNumeric_returns400", async () => {
    const response = await fetch(`${baseUrl}/api/products/abc`);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Id inválido",
      details: ["El id debe ser un número entero positivo"],
    });
  });

  // Parte 2: este 404 lo da el manejador de ruta desconocida que ya venía en el starter.
  it("unknownRoute_whenRequested_returns404FromGivenHandler", async () => {
    const response = await fetch(`${baseUrl}/api/ruta-que-no-existe`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Ruta no encontrada");
    expect(body.details).toContain("GET /api/ruta-que-no-existe");
  });
});
