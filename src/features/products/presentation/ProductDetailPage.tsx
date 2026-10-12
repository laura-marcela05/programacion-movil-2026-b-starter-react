import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { ApiError, getErrorMessage } from "../data/api-error";
import { deleteProduct, getProduct } from "../data/products-api";
import { toProductView } from "../domain/product";
import type { Product } from "../domain/product";

/**
 * Pantalla: detalle de un producto (ruta /productos/:id).
 * Estados: cargando, cargado, error con «Reintentar», no encontrado (404) y confirmación
 * de eliminar en pantalla (una variable booleana, sin modal ni alert).
 */
type LoadStatus = "loading" | "ready" | "error" | "notFound";

const ProductDetailPage: React.FC = () => {
  const history = useHistory();
  const productId = Number(useParams<{ id: string }>().id);

  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const isLoadingRef = useRef(false);

  const loadProduct = useCallback(async () => {
    if (isLoadingRef.current) return; // evita pedir el producto dos veces a la vez
    isLoadingRef.current = true;
    setStatus("loading");
    setIsConfirmingDelete(false);
    setDeleteError("");
    try {
      setProduct(await getProduct(productId));
      setStatus("ready");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus(
        error instanceof ApiError && error.status === 404
          ? "notFound"
          : "error",
      );
    } finally {
      isLoadingRef.current = false;
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  useIonViewWillEnter(() => {
    void loadProduct();
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteProduct(productId);
      history.push("/productos");
    } catch (error) {
      setDeleteError(getErrorMessage(error));
      setIsConfirmingDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const view = product ? toProductView(product) : null;
  const stockColor = view?.isOutOfStock
    ? "danger"
    : view?.isLowStock
      ? "warning"
      : "success";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>Detalle del producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {status === "loading" && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
            <p>Cargando producto...</p>
          </div>
        )}

        {status === "error" && (
          <div className="ion-padding">
            <IonText color="danger">
              <p>{errorMessage}</p>
            </IonText>
            <IonButton onClick={() => void loadProduct()}>Reintentar</IonButton>
          </div>
        )}

        {status === "notFound" && (
          <div className="ion-padding">
            <IonText color="danger">
              <p>{errorMessage}</p>
            </IonText>
          </div>
        )}

        {status === "ready" && view && (
          <>
            <IonList>
              <IonItem>
                <IonLabel>Id</IonLabel>
                <IonNote slot="end">{view.id}</IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>Nombre</IonLabel>
                <IonNote slot="end">{view.name}</IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>Precio</IonLabel>
                <IonNote slot="end">{view.priceLabel}</IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>Categoría</IonLabel>
                <IonNote slot="end">{view.category}</IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>Stock</IonLabel>
                <IonNote slot="end" className="ion-margin-end">
                  {view.stock}
                </IonNote>
                <IonBadge slot="end" color={stockColor}>
                  {view.stockLabel}
                </IonBadge>
              </IonItem>
            </IonList>

            <div className="ion-padding-top">
              <IonButton routerLink={`/productos/${productId}/editar`}>
                Editar
              </IonButton>
              <IonButton
                color="danger"
                onClick={() => {
                  setDeleteError("");
                  setIsConfirmingDelete(true);
                }}
              >
                Eliminar
              </IonButton>
            </div>

            {isConfirmingDelete && (
              <div className="ion-padding-top">
                <IonText>
                  <p>¿Eliminar este producto?</p>
                </IonText>
                <IonButton
                  color="danger"
                  disabled={isDeleting}
                  onClick={() => void handleDelete()}
                >
                  Confirmar
                </IonButton>
                <IonButton
                  fill="outline"
                  disabled={isDeleting}
                  onClick={() => setIsConfirmingDelete(false)}
                >
                  Cancelar
                </IonButton>
              </div>
            )}

            {deleteError && (
              <IonText color="danger">
                <p>{deleteError}</p>
              </IonText>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductDetailPage;
