import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { ApiError, getErrorMessage } from "../data/api-error";
import { createProduct, getProduct, updateProduct } from "../data/products-api";
import { CATEGORIES, validateProduct } from "../domain/product";
import type { ProductInput } from "../domain/product";

/** Texto vacío no es 0: se convierte en NaN para que validateProduct lo rechace. */
const toNumber = (text: string): number =>
  text.trim() === "" ? NaN : Number(text);

interface ServerError {
  message: string;
  details: string[];
}

/**
 * Pantalla: formulario de producto. La misma pantalla sirve para dos rutas:
 *  - /productos/nuevo          → crear (no hay `id` en la ruta)
 *  - /productos/:id/editar     → editar (hay `id`; precarga los campos con getProduct)
 * Los campos guardan texto en el estado; al validar se convierten con Number.
 */
const ProductFormPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const isEditing = id !== undefined;
  const productId = Number(id);

  const [name, setName] = useState("");
  const [priceText, setPriceText] = useState("");
  const [category, setCategory] = useState(""); // '' = ninguna seleccionada
  const [stockText, setStockText] = useState("");

  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">(
    isEditing ? "loading" : "ready",
  );
  const [loadError, setLoadError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<ServerError | null>(null);

  // Modo editar: precarga los campos con el producto.
  useEffect(() => {
    if (!isEditing) return;
    const load = async () => {
      setLoadStatus("loading");
      try {
        const product = await getProduct(productId);
        setName(product.name);
        setPriceText(String(product.price));
        setCategory(product.category);
        setStockText(String(product.stock));
        setLoadStatus("ready");
      } catch (error) {
        setLoadError(getErrorMessage(error));
        setLoadStatus("error");
      }
    };
    void load();
  }, [isEditing, productId]);

  // Validación en línea: tras el primer intento de guardar, los mensajes se actualizan al escribir.
  const input: ProductInput = {
    name,
    price: toNumber(priceText),
    category,
    stock: toNumber(stockText),
  };
  const validation = validateProduct(input);
  const errors = submitted ? validation.errors : {};

  const handleSave = async () => {
    setSubmitted(true);
    setServerError(null);
    if (!validation.isValid) return;

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateProduct(productId, input);
      } else {
        await createProduct(input);
      }
      history.push("/productos");
    } catch (error) {
      setServerError({
        message: getErrorMessage(error),
        details: error instanceof ApiError ? error.details : [],
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loadStatus === "loading" && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
            <p>Cargando producto...</p>
          </div>
        )}

        {loadStatus === "error" && (
          <IonText color="danger">
            <p>{loadError}</p>
          </IonText>
        )}

        {loadStatus === "ready" && (
          <>
            <div className="ion-margin-bottom">
              <IonInput
                label="Nombre"
                labelPlacement="floating"
                fill="outline"
                value={name}
                onIonInput={(event) =>
                  setName(String(event.detail.value ?? ""))
                }
              />
              {errors.name && <IonNote color="danger">{errors.name}</IonNote>}
            </div>

            <div className="ion-margin-bottom">
              <IonInput
                label="Precio"
                labelPlacement="floating"
                fill="outline"
                type="number"
                value={priceText}
                onIonInput={(event) =>
                  setPriceText(String(event.detail.value ?? ""))
                }
              />
              {errors.price && <IonNote color="danger">{errors.price}</IonNote>}
            </div>

            <div className="ion-margin-bottom">
              <p>Categoría</p>
              {CATEGORIES.map((item) => (
                <IonButton
                  key={item}
                  size="small"
                  fill={category === item ? "solid" : "outline"}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </IonButton>
              ))}
              <div>
                {errors.category && (
                  <IonNote color="danger">{errors.category}</IonNote>
                )}
              </div>
            </div>

            <div className="ion-margin-bottom">
              <IonInput
                label="Stock"
                labelPlacement="floating"
                fill="outline"
                type="number"
                value={stockText}
                onIonInput={(event) =>
                  setStockText(String(event.detail.value ?? ""))
                }
              />
              {errors.stock && <IonNote color="danger">{errors.stock}</IonNote>}
            </div>

            {serverError && (
              <IonText color="danger">
                <p>{serverError.message}</p>
                {serverError.details.map((detail) => (
                  <p key={detail}>{detail}</p>
                ))}
              </IonText>
            )}

            <IonButton disabled={isSaving} onClick={() => void handleSave()}>
              Guardar
            </IonButton>
            <IonButton
              fill="outline"
              onClick={() => history.push("/productos")}
            >
              Cancelar
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductFormPage;
