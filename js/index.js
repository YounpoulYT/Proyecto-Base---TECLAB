const container = document.querySelector("#ofertas-container");
const cartCountElement = document.querySelector("#cart-count");
let carritoSimple = JSON.parse(localStorage.getItem("carritoFrutas")) || [];

fetch("js/productos.json")
  .then((res) => res.json())
  .then((data) => {
    // FILTRAMOS SOLO LAS OFERTAS
    const ofertas = data.filter((p) => p.oferta === true);
    actualizarContador();
    renderizarOfertas(ofertas);
  });

const renderizarOfertas = (lista) => {
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML =
      "<p>No hay ofertas destacadas hoy. Pero no te pierdas nuestro catálogo completo!</p>";
    return;
  }

  lista.forEach((prod) => {
    // Simulamos un precio anterior más caro para el efecto visual
    const precioAnterior = prod.precio * 1.15;

    const card = document.createElement("div");
    card.className = "card";
    // Agregamos una etiqueta visual de oferta
    card.innerHTML = `
        
            <div class="card-image">
                <span style="position:absolute;top:5px; background:red; color:white; padding:5px; border-radius:5px; font-size:12px; margin:5px;">🔥 15% OFF</span>
                <img src="${prod.imagen}" alt="${prod.nombre}">
            </div>
            <div class="card-name">${prod.nombre}</div>
            <div class="card-price">
                <small style="text-decoration: line-through; color: gray;">$${precioAnterior.toLocaleString()}</small><br>
                $${prod.precio.toLocaleString()}
            </div>
            <div class="card-button">
                <button class="button button-outline button-add">Agarrar</button>
            </div>
        `;
    card
      .querySelector("button")
      .addEventListener("click", () => agregarAlCarrito(prod));
    container.appendChild(card);
  });
};

const agregarAlCarrito = (producto) => {
  producto.origen = "Oferta";
  carritoSimple.push(producto);
  localStorage.setItem("carritoFrutas", JSON.stringify(carritoSimple));
  actualizarContador();
  alert("¡Oferta agregada al carrito!");
};

const actualizarContador = () => {
  if (cartCountElement) cartCountElement.innerText = carritoSimple.length;
};
