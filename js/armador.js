const container = document.querySelector("#productos-container");
const resumenContainer = document.querySelector("#lista-seleccionados");
const precioTotalElement = document.querySelector("#precio-total");
const consumoTotalElement = document.querySelector("#consumo-total");
const tituloPaso = document.querySelector("#titulo-paso");
const btnAnterior = document.querySelector("#btn-anterior");
const btnSiguiente = document.querySelector("#btn-saltar");
const btnFinalizar = document.querySelector("#btn-finalizar");
const cartCountElement = document.querySelector('#cart-count');

let productos = [];
let carritoPC = {};
let pasoActualIndex = 0;

// CONFIGURACIÓN DE PASOS
const PASOS = [
  { id: "procesador", type: "procesador", nombre: "Procesador (CPU)", obligatorio: true, unico: true },
  { id: "placa_base", type: "placa_base", nombre: "Placa Madre", obligatorio: true, unico: true },
  { id: "memoria_ram", type: "memoria_ram", nombre: "Memoria RAM", obligatorio: true, unico: false },
  { id: "tarjeta_grafica", type: "tarjeta_grafica", nombre: "Tarjeta Gráfica", obligatorio: false, unico: true },
  { id: "almacenamiento", type: "almacenamiento", nombre: "Almacenamiento", obligatorio: true, unico: false },
  { id: "gabinete", type: "gabinete", nombre: "Gabinete", obligatorio: true, unico: true },
  { id: "refrigeracion", type: "refrigeracion", nombre: "Refrigeración", obligatorio: true, unico: true },
  { id: "fuente_poder", type: "fuente_poder", nombre: "Fuente de Poder", obligatorio: true, unico: true },
];

const obtenerProductos = () => {
  fetch("js/productos.json")
    .then((res) => res.json())
    .then((data) => {
      productos = data;
      actualizarContadorGlobal();
      renderizarPaso();
    });
};

const actualizarContadorGlobal = () => {
    let carritoSimple = JSON.parse(localStorage.getItem('carritoFrutas')) || [];
    if(cartCountElement) cartCountElement.innerText = carritoSimple.length;
}

// --- MOTOR DE NAVEGACIÓN ---

const renderizarPaso = () => {
  const pasoInfo = PASOS[pasoActualIndex];
  tituloPaso.innerHTML = `Paso ${pasoActualIndex + 1}: ${pasoInfo.nombre}`;
  btnAnterior.disabled = pasoActualIndex === 0;
  actualizarBotonSiguiente(pasoInfo);

  let productosAmostrar = productos.filter((p) => p.categoria === pasoInfo.type);

  // --- FILTROS DE COMPATIBILIDAD ---
  if (pasoInfo.type === "placa_base") {
    if (carritoPC.procesador) {
      productosAmostrar = productosAmostrar.filter((p) => p.specs.socket === carritoPC.procesador.specs.socket);
    }
  } else if (pasoInfo.type === "memoria_ram") {
    if (carritoPC.placa_base) {
      productosAmostrar = productosAmostrar.filter((p) => p.specs.tipo === carritoPC.placa_base.specs.tipo_memoria);
    }
  } else if (pasoInfo.type === "fuente_poder") {
    const consumo = calcularConsumoActual();
    productosAmostrar = productosAmostrar.filter((p) => p.specs.potencia_w > consumo + 50);
  } else if (pasoInfo.type === "gabinete") {
    if (carritoPC.tarjeta_grafica) {
      const largoGPU = carritoPC.tarjeta_grafica.specs.largo_mm || 0;
      productosAmostrar = productosAmostrar.filter((g) => !g.specs.soporte_gpu || g.specs.soporte_gpu >= largoGPU);
    }
  } else if (pasoInfo.type === "refrigeracion") {
    if (carritoPC.procesador) {
        const socket = carritoPC.procesador.specs.socket;
        productosAmostrar = productosAmostrar.filter(p => p.specs.socket_compatible.includes(socket));
    }
    if (carritoPC.gabinete) {
        const gab = carritoPC.gabinete.specs;
        productosAmostrar = productosAmostrar.filter(cooler => {
            if (cooler.specs.tipo === "Aire") return !gab.max_altura_cooler || cooler.specs.altura_mm <= gab.max_altura_cooler;
            if (cooler.specs.tipo === "Liquida") return !gab.max_radiador || cooler.specs.tamano_radiador <= gab.max_radiador;
            return true;
        });
    }
  }

  cargarProductosEnPantalla(productosAmostrar, pasoInfo);
  actualizarResumenVisual();
};

const cargarProductosEnPantalla = (lista, pasoInfo) => {
  container.innerHTML = "";

  // HEADER DE SLOTS RAM
  if (pasoInfo.id === "memoria_ram") {
      const mother = carritoPC.placa_base ? carritoPC.placa_base.specs : { cant_slots_ram: 4 };
      let slotsOcupados = 0;
      if (carritoPC.memoria_ram) {
          carritoPC.memoria_ram.forEach(m => slotsOcupados += (m.specs.cantidad_modulos || 1));
      }
      container.innerHTML += `<div class="info-slots">🧠 Slots RAM: ${slotsOcupados} / ${mother.cant_slots_ram}</div>`;
  }
  
  // HEADER DE ALMACENAMIENTO
  if (pasoInfo.id === "almacenamiento") {
      const mother = carritoPC.placa_base ? carritoPC.placa_base.specs : { cant_slots_m2: 2, cant_puertos_sata: 4 };
      const items = carritoPC.almacenamiento || [];
      const m2 = items.filter(p => p.specs.formato === "M.2").length;
      const sata = items.filter(p => p.specs.formato === "SATA").length;
      container.innerHTML += `<div class="info-slots">💾 M.2: ${m2}/${mother.cant_slots_m2} | SATA: ${sata}/${mother.cant_puertos_sata}</div>`;
  }

  if (lista.length === 0) {
    container.innerHTML += `<div class="card-error"><h3>⚠️ No hay componentes compatibles</h3><p>Intenta cambiar la selección anterior.</p></div>`;
    return;
  }

  lista.forEach((prod) => {
    let etiquetaHTML = "";
    if (pasoInfo.id === "memoria_ram") {
        const mods = prod.specs.cantidad_modulos || 1;
        if(mods > 1) etiquetaHTML = `<small class="etiqueta-gris">📦 Kit de ${mods}</small>`;
    } else if (pasoInfo.id === "almacenamiento") {
        const esM2 = prod.specs.formato === "M.2";
        etiquetaHTML = `<small style="background:${esM2 ? 'darkviolet' : 'gray'}; color:white; padding:2px 5px; border-radius:4px; font-size:10px;">${esM2 ? '⚡ NVMe' : '💿 HDD'}</small><br>`;
    }

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-image"><img src="${prod.imagen}" alt="${prod.nombre}"></div>
      <div class="card-name">${etiquetaHTML} ${prod.nombre}</div>
      <div class="card-price">$${prod.precio.toLocaleString()}</div>
      <div class="card-button"><button class="button button-outline button-add">Agregar</button></div>
    `;
    card.querySelector("button").addEventListener("click", () => seleccionarComponente(prod));
    container.appendChild(card);
  });
};

const seleccionarComponente = (producto) => {
  const pasoInfo = PASOS[pasoActualIndex];
  const pasoID = pasoInfo.id;

  if (pasoInfo.unico) {
    carritoPC[pasoID] = producto;
    irPasoSiguiente();
  } else {
    // ACUMULATIVO
    if (!carritoPC[pasoID]) carritoPC[pasoID] = [];

    if (pasoID === "memoria_ram") {
        const mother = carritoPC.placa_base ? carritoPC.placa_base.specs : { cant_slots_ram: 4 };
        let ocupados = 0;
        carritoPC[pasoID].forEach(m => ocupados += (m.specs.cantidad_modulos || 1));
        const nuevos = producto.specs.cantidad_modulos || 1;

        if (ocupados + nuevos <= mother.cant_slots_ram) {
            carritoPC[pasoID].push(producto);
            renderizarPaso();
            if (ocupados + nuevos === mother.cant_slots_ram) setTimeout(() => irPasoSiguiente(), 600);
        } else {
            alert(`⛔ ¡Espacio insuficiente!`);
        }
    } else if (pasoID === "almacenamiento") {
        const mother = carritoPC.placa_base ? carritoPC.placa_base.specs : { cant_slots_m2: 2, cant_puertos_sata: 4 };
        const tipo = producto.specs.formato;
        const yaTengo = carritoPC[pasoID].filter(p => p.specs.formato === tipo).length;
        const limite = tipo === "M.2" ? mother.cant_slots_m2 : mother.cant_puertos_sata;

        if (yaTengo < limite) {
            carritoPC[pasoID].push(producto);
            renderizarPaso();
        } else {
            alert(`⛔ ¡No quedan puertos ${tipo}!`);
        }
    }
  }
};

const irPasoSiguiente = () => {
  if (pasoActualIndex < PASOS.length - 1) {
    pasoActualIndex++;
    renderizarPaso();
  } else {
    finalizarUI();
  }
};

window.irPasoAnterior = () => {
  if (pasoActualIndex > 0) {
    pasoActualIndex--;
    renderizarPaso();
    container.style.display = "flex"; 
    btnFinalizar.disabled = true;
    btnFinalizar.classList.add("button-outline");
  }
};

const actualizarBotonSiguiente = (pasoInfo) => {
    const hayAlgo = carritoPC[pasoInfo.id] && (Array.isArray(carritoPC[pasoInfo.id]) ? carritoPC[pasoInfo.id].length > 0 : true);
    if (hayAlgo) {
        btnSiguiente.innerText = "Siguiente Paso ➡";
        btnSiguiente.classList.remove("button-clear");
        btnSiguiente.classList.add("button-outline");
        btnSiguiente.style.display = "block";
        btnSiguiente.onclick = () => irPasoSiguiente();
    } else {
        btnSiguiente.innerText = "Saltar este paso ➡";
        btnSiguiente.classList.add("button-clear");
        btnSiguiente.style.display = pasoInfo.obligatorio ? "none" : "block";
        btnSiguiente.onclick = () => irPasoSiguiente();
    }
};

const finalizarUI = () => {
  container.innerHTML = `<div style="text-align:center; padding: 50px;"><h2>¡Listo! 🚀</h2><p>Tu configuración está completa.</p></div>`;
  tituloPaso.innerText = "Resumen Final";
  btnSiguiente.style.display = "none";
  btnFinalizar.disabled = false;
  btnFinalizar.classList.remove("button-outline");
};

window.finalizarArmado = () => {
  let carritoGeneral = JSON.parse(localStorage.getItem("carritoFrutas")) || [];
  Object.values(carritoPC).forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach((sub) => { sub.origen = "PC Armada"; carritoGeneral.push(sub); });
    } else {
      item.origen = "PC Armada";
      carritoGeneral.push(item);
    }
  });
  localStorage.setItem("carritoFrutas", JSON.stringify(carritoGeneral));
  window.location.href = "checkout.html";
};

// --- GESTIÓN DE RESUMEN Y BORRADO ---

const calcularConsumoActual = () => {
  let total = 0;
  Object.values(carritoPC).forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach((sub) => { if (sub.specs.consumo_watts) total += sub.specs.consumo_watts; });
    } else if (item && item.specs.consumo_watts) total += item.specs.consumo_watts;
  });
  return total;
};

const actualizarResumenVisual = () => {
  resumenContainer.innerHTML = "";
  let totalPrecio = 0;

  PASOS.forEach((paso) => {
    const item = carritoPC[paso.id];
    if (item) {
      if (Array.isArray(item)) {
        item.forEach((sub, i) => {
          totalPrecio += sub.precio;
          // Pasamos ID del paso e Índice para borrar
          agregarItemResumen(`${paso.nombre} #${i + 1}`, sub, paso.id, i);
        });
      } else {
        totalPrecio += item.precio;
        // Pasamos ID del paso y null para borrar
        agregarItemResumen(paso.nombre, item, paso.id, null);
      }
    }
  });
  precioTotalElement.innerText = `$${totalPrecio.toLocaleString()}`;
  consumoTotalElement.innerText = calcularConsumoActual();
};

const agregarItemResumen = (titulo, prod, pasoId, index) => {
    // Función de borrado dinámica
    const funcionBorrar = index !== null 
        ? `eliminarDelArmado('${pasoId}', ${index})` 
        : `eliminarDelArmado('${pasoId}', null)`;

    resumenContainer.innerHTML += `
    <div class="item-resumen">
        <div style="width: 100%;">
            <small style="color:#888; font-size:10px;">${titulo.toUpperCase()}</small><br>
            <strong>${prod.nombre}</strong>
        </div>
        <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end;">
            <span>$${prod.precio.toLocaleString()}</span>
            <button class="button-delete button-small" style="padding: 0 8px; height: 24px; line-height: 24px; margin-top:5px; font-size:12px; background:red; border:none; color:white; border-radius:4px; cursor:pointer;" onclick="${funcionBorrar}" title="Eliminar">✕</button>
        </div>
    </div>`;
};

// NUEVA FUNCIÓN PARA BORRAR
window.eliminarDelArmado = (pasoId, index) => {
    if (index !== null) {
        // Es un array (RAM/Storage), borramos el elemento específico
        carritoPC[pasoId].splice(index, 1);
        // Si quedó vacío, borramos la clave para que la validación sepa que falta
        if (carritoPC[pasoId].length === 0) delete carritoPC[pasoId];
    } else {
        // Es ítem único, borramos la clave
        delete carritoPC[pasoId];
    }
    
    // Actualizamos todo
    actualizarResumenVisual();
    // Forzamos re-render del paso actual para actualizar contadores y botones
    renderizarPaso();
};

obtenerProductos();