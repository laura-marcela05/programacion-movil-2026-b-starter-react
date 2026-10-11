import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { getErrorMessage } from "../data/api-error";
import { getProducts } from "../data/products-api";
import { CATEGORIES, filterProducts, toProductView } from "../domain/product";
import type { Product } from "../domain/product";
import EmptyState from "./EmptyState";
import ProductCard from "./ProductCard";

/**
 * Pantalla: lista de productos (ruta /productos).
 * Carga todo con getProducts() y filtra en memoria con filterProducts (ADR-001, ADR-002).
 * Estados: cargando, vacío (la API no tiene productos), sin resultados (los filtros no
 * encuentran nada), error con «Reintentar» y lista.
 */
type LoadStatus = "loading" | "ready" | "error";

const ProductListPage: React.FC = () => {
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(""); // '' = «Todas»
  const isLoadingRef = useRef(false);

  const loadProducts = useCallback(async () => {
    if (isLoadingRef.current) return; // evita pedir la lista dos veces a la vez
    isLoadingRef.current = true;
    setStatus("loading");
    try {
      setProducts(await getProducts());
      setStatus("ready");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus("error");
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useIonViewWillEnter(() => {
    void loadProducts();
  });

  const views = filterProducts(products, { search, category }).map(
    toProductView,
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Productos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {status === "loading" && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
            <p>Cargando productos...</p>
          </div>
        )}

        {status === "error" && (
          <EmptyState
            title="No se pudo cargar"
            message={errorMessage}
            actionLabel="Reintentar"
            onAction={() => void loadProducts()}
          />
        )}

        {status === "ready" && products.length === 0 && (
          <EmptyState
            title="No hay productos"
            message='Crea el primero con el botón "Nuevo producto".'
          />
        )}

        {status === "ready" && products.length > 0 && (
          <>
            <IonItem>
              <IonInput
                aria-label="Buscar producto"
                placeholder="Buscar producto"
                value={search}
                onIonInput={(event) =>
                  setSearch(String(event.detail.value ?? ""))
                }
              />
            </IonItem>

            <div className="ion-padding-horizontal ion-padding-top">
              <IonButton
                size="small"
                fill={category === "" ? "solid" : "outline"}
                onClick={() => setCategory("")}
              >
                Todas
              </IonButton>
              {CATEGORIES.map((name) => (
                <IonButton
                  key={name}
                  size="small"
                  fill={category === name ? "solid" : "outline"}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </IonButton>
              ))}
            </div>

            {views.length === 0 ? (
              <EmptyState
                title="Sin resultados"
                message="Ningún producto coincide con la búsqueda o la categoría."
              />
            ) : (
              <IonList>
                {views.map((view) => (
                  <ProductCard
                    key={view.id}
                    product={view}
                    onSelect={(id) => history.push(`/productos/${id}`)}
                  />
                ))}
              </IonList>
            )}
          </>
        )}

        <IonButton
          className="ion-margin"
          onClick={() => history.push("/productos/nuevo")}
        >
          Nuevo producto
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProductListPage;
