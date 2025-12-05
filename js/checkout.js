const tbody = document.querySelector("#tabla-carrito");
const subtotalElement = document.querySelector("#subtotal-precio");
const totalElement = document.querySelector("#total-compra");
const btnWhatsApp = document.querySelector("#btn-whatsapp");
const mensajeVacio = document.querySelector("#mensaje-vacio");
const tablaHeader = document.querySelector(".cart-table thead");

// Recuperamos el carrito
let carritoPC = JSON.parse(localStorage.getItem('carritoFrutas')) || [];

const cargarResumen = () => {
    tbody.innerHTML = "";
    let total = 0;

    if (carritoPC.length === 0) {
        tablaHeader.style.display = 'none'; // Ocultar cabecera si no hay nada
        mensajeVacio.style.display = 'block';
        actualizarTotales(0);
        return;
    }

    tablaHeader.style.display = 'table-header-group';
    mensajeVacio.style.display = 'none';

    carritoPC.forEach((producto, index) => {
        total += producto.precio;
        
        // Etiqueta visual
        const esPC = producto.origen === 'PC Armada';
        const etiquetaHTML = esPC 
            ? '<span class="badge-pc">🛠️ PC ARMADA</span>' 
            : '<span class="badge-suelto">📦 PRODUCTO SUELTO</span>';

        const fila = `
            <tr>
                <td data-label="Imagen">
                    <img src="${producto.imagen}" width="60" style="border-radius:5px;">
                </td>
                <td data-label="Producto">
                    ${etiquetaHTML}
                    <div style="font-weight:bold; margin-top:5px;">${producto.nombre}</div>
                    <small style="color:#888;">${producto.categoria.toUpperCase()}</small>
                </td>
                <td data-label="Precio">
                    $${producto.precio.toLocaleString()}
                </td>
                <td data-label="Acción">
                    <button class="button-delete button-small" onclick="eliminarItem(${index})" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        tbody.innerHTML += fila;
    });

    actualizarTotales(total);
    configurarBotonWhatsApp(total);
};

const actualizarTotales = (total) => {
    subtotalElement.innerText = `$${total.toLocaleString()}`;
    totalElement.innerText = `$${total.toLocaleString()}`;
    // Actualizar contador del header si existe
    const cartCount = document.getElementById('cart-count');
    if(cartCount) cartCount.innerText = carritoPC.length;
};

const configurarBotonWhatsApp = (total) => {
    const numeroTienda = "541155631088"; // Tu número aquí
    let mensaje = "Hola HardTec! 👋 Quiero realizar el siguiente pedido:%0A%0A";
    
    // Agrupar items
    const itemsPC = carritoPC.filter(p => p.origen === 'PC Armada');
    const itemsSueltos = carritoPC.filter(p => p.origen !== 'PC Armada');

    if (itemsPC.length > 0) {
        mensaje += "*💻 MI CONFIGURACIÓN DE PC:*%0A";
        itemsPC.forEach(p => mensaje += `• ${p.nombre} ($${p.precio})%0A`);
        mensaje += "%0A";
    }

    if (itemsSueltos.length > 0) {
        mensaje += "*📦 PRODUCTOS INDIVIDUALES:*%0A";
        itemsSueltos.forEach(p => mensaje += `• ${p.nombre} ($${p.precio})%0A`);
        mensaje += "%0A";
    }
    
    mensaje += `*💰 TOTAL A PAGAR: $${total.toLocaleString()}*`;
    
    btnWhatsApp.onclick = () => {
        window.open(`https://wa.me/${numeroTienda}?text=${mensaje}`, '_blank');
    };
};

const eliminarItem = (index) => {
    if(confirm("¿Quitar este producto?")) {
        carritoPC.splice(index, 1);
        localStorage.setItem('carritoFrutas', JSON.stringify(carritoPC));
        cargarResumen();
    }
};

const vaciarCarrito = () => {
    if(confirm("¿Estás seguro de vaciar TODO el carrito?")) {
        localStorage.removeItem('carritoFrutas');
        carritoPC = [];
        cargarResumen();
    }
};

cargarResumen();