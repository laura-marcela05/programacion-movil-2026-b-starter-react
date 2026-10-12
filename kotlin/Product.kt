// Ejercicio Kotlin del parcial (Parte 4): modelo Product, etiqueta de stock y descuento.

class Product(
    val id: Int,
    val name: String,
    var price: Double,
    val category: String,
    var stock: Int? // puede ser null: no se conoce el stock
)

// «Sin dato» si el stock es null; en los demás casos, las mismas etiquetas de la app.
fun stockLabel(stock: Int?): String {
    if (stock == null) return "Sin dato"
    return when {
        stock == 0 -> "Agotado"
        stock < 5 -> "Pocas unidades"
        else -> "Disponible"
    }
}

// Devuelve el precio después de restar el porcentaje de descuento.
fun applyDiscount(price: Double, percent: Int): Double {
    return price - (price * percent / 100.0)
}

fun main() {
    val water = Product(1, "Agua mineral 600 ml", 1800.0, "Bebidas", 120)
    val cookies = Product(5, "Galletas de avena x6", 2700.0, "Snacks", 0)
    val notebook = Product(9, "Cuaderno", 4500.0, "Hogar", null)

    println("${water.name} | ${stockLabel(water.stock)} | Precio con 10 % de descuento: ${applyDiscount(water.price, 10)}")
    println("${cookies.name} | ${stockLabel(cookies.stock)} | Precio con 10 % de descuento: ${applyDiscount(cookies.price, 10)}")
    println("${notebook.name} | ${stockLabel(notebook.stock)} | Precio con 10 % de descuento: ${applyDiscount(notebook.price, 10)}")
}