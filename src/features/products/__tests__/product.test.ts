import { describe, expect, it } from "vitest";
import seedProducts from "../../../../server/data/products.json";
import {
  CATEGORIES,
  filterProducts,
  formatCOP,
  LOW_STOCK_THRESHOLD,
  toProductView,
  validateProduct,
} from "../domain/product";
import type { Product } from "../domain/product";

/**
 * Pruebas unitarias de EJEMPLO (ya vienen dadas) para que `npm test` corra desde el inicio.
 * Muestran el estilo esperado: describe / it / expect, sin red ni pantallas.
 */
describe("datos semilla de la API (ejemplo)", () => {
  it("trae 8 productos con ids 1 a 8", () => {
    expect(seedProducts).toHaveLength(8);
    expect(seedProducts.map((item) => item.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("usa solo categorías permitidas y stock entero no negativo", () => {
    for (const item of seedProducts) {
      expect(CATEGORIES).toContain(item.category);
      expect(Number.isInteger(item.stock)).toBe(true);
      expect(item.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it("incluye productos agotados y con pocas unidades para probar las etiquetas", () => {
    expect(seedProducts.some((item) => item.stock === 0)).toBe(true);
    expect(
      seedProducts.some(
        (item) => item.stock > 0 && item.stock < LOW_STOCK_THRESHOLD,
      ),
    ).toBe(true);
  });
});

describe("formatCOP (ejemplo)", () => {
  it("separa los miles con punto y antepone el signo de pesos", () => {
    expect(formatCOP(1250000)).toBe("$ 1.250.000");
    expect(formatCOP(8500)).toBe("$ 8.500");
    expect(formatCOP(950)).toBe("$ 950");
  });
});

describe("validateProduct", () => {
  it("validateProduct_whenFieldsInvalid_returnsOneErrorPerField", () => {
    // Arrange: nombre solo con espacios, precio 0, categoría no permitida, stock decimal negativo
    const input = { name: "   ", price: 0, category: "Ropa", stock: -1.5 };

    // Act
    const result = validateProduct(input);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      name: "name es obligatorio",
      price: "price debe ser un número mayor que 0",
      category: "category debe ser una de: Bebidas, Snacks, Aseo, Hogar",
      stock: "stock debe ser un entero mayor o igual que 0",
    });
  });

  it("validateProduct_whenInputValid_returnsIsValid", () => {
    const input = {
      name: "Jabón líquido",
      price: 8900,
      category: "Aseo",
      stock: 20,
    };

    const result = validateProduct(input);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });
});

describe("toProductView", () => {
  it("toProductView_whenStockVaries_returnsLabelAndPrice", () => {
    // Arrange: mismo producto con stock 0, 4 y 5 (5 es el límite de «Disponible»)
    const base: Product = {
      id: 8,
      name: "  Set de ollas  ",
      price: 189900,
      category: "Hogar",
      stock: 0,
    };

    // Act
    const soldOut = toProductView({ ...base, stock: 0 });
    const low = toProductView({ ...base, stock: 4 });
    const available = toProductView({ ...base, stock: 5 });

    // Assert
    expect(soldOut.stockLabel).toBe("Agotado");
    expect(soldOut.isOutOfStock).toBe(true);
    expect(soldOut.isLowStock).toBe(false);
    expect(low.stockLabel).toBe("Pocas unidades");
    expect(low.isLowStock).toBe(true);
    expect(low.isOutOfStock).toBe(false);
    expect(available.stockLabel).toBe("Disponible");
    expect(available.isLowStock).toBe(false);
    expect(available.priceLabel).toBe("$ 189.900");
    expect(available.name).toBe("Set de ollas");
  });
});

describe("filterProducts", () => {
  it("filterProducts_whenSearchAndCategory_returnsMatches", () => {
    // Arrange
    const products: Product[] = [
      {
        id: 1,
        name: "Agua mineral 600 ml",
        price: 1800,
        category: "Bebidas",
        stock: 120,
      },
      {
        id: 2,
        name: "Jugo de naranja 1 L",
        price: 5200,
        category: "Bebidas",
        stock: 35,
      },
      {
        id: 4,
        name: "Papas fritas 150 g",
        price: 3900,
        category: "Snacks",
        stock: 60,
      },
    ];

    // Act
    const bySearch = filterProducts(products, { search: "AGUA", category: "" });
    const byCategory = filterProducts(products, {
      search: "",
      category: "Snacks",
    });
    const both = filterProducts(products, {
      search: "jugo",
      category: "Bebidas",
    });
    const none = filterProducts(products, {
      search: "jugo",
      category: "Snacks",
    });
    const all = filterProducts(products, { search: "   ", category: "" });

    // Assert
    expect(bySearch.map((item) => item.id)).toEqual([1]);
    expect(byCategory.map((item) => item.id)).toEqual([4]);
    expect(both.map((item) => item.id)).toEqual([2]);
    expect(none).toEqual([]);
    expect(all).toHaveLength(3);
    expect(all).not.toBe(products); // devuelve un arreglo nuevo
  });
});
