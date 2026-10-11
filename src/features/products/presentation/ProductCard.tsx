import { IonBadge, IonItem, IonLabel } from "@ionic/react";

import type { ProductView } from "../domain/product";

export interface ProductCardProps {
  /** Producto ya preparado para mostrarse (resultado de `toProductView`). */
  product: ProductView;
  /** Se invoca con el id del producto al tocar la tarjeta. */
  onSelect: (id: number) => void;
}

/** Color del aviso de stock: rojo si está agotado, amarillo si quedan pocas, verde si hay. */
function getStockColor(product: ProductView): "danger" | "warning" | "success" {
  if (product.isOutOfStock) return "danger";
  if (product.isLowStock) return "warning";
  return "success";
}

/**
 * Tarjeta de un producto en la lista. Solo muestra datos y avisa con `onSelect`,
 * sin saber de dónde vienen (mismo estilo que `EmptyState`).
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => (
  <IonItem button detail onClick={() => onSelect(product.id)}>
    <IonLabel>
      <h2>{product.name}</h2>
      <p>{product.category}</p>
      <p>{product.priceLabel}</p>
    </IonLabel>
    <IonBadge slot="end" color={getStockColor(product)}>
      {product.stockLabel}
    </IonBadge>
  </IonItem>
);

export default ProductCard;
