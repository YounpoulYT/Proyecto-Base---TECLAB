const container = document.querySelector('#productos-container');
const cartCountElement = document.querySelector('#cart-count');
const cantidadResultados = document.querySelector('#cantidad-resultados');
const contenedorMarcas = document.querySelector('#contenedor-marcas');
const contenedorDinamicos = document.querySelector('#filtros-dinamicos');

// Inputs fijos
const selectCategoria = document.getElementById('select-categoria');
const rangeMin = document.getElementById('range-min');
const rangeMax = document.getElementById('range-max');
const inputMin = document.getElementById('input-min');
const inputMax = document.getElementById('input-max');

let productos = [];
let carritoSimple = JSON.parse(localStorage.getItem('carritoFrutas')) || [];

// ESTADO GLOBAL DE FILTROS
let estadoFiltros = {
    categoria: 'todos',
    precioMin: 0,
    precioMax: 2000000,
    marcas: [],     
    extras: {}      // Aquí guardamos los filtros dinámicos (ej: sockets, watts)
};

// --- CONFIGURACIÓN DE FILTROS POR CATEGORÍA ---
// Esto define qué filtros aparecen para cada cosa.
const CONFIG_FILTROS = {
    memoria_ram: [
        { key: 'tipo', titulo: 'Tecnología' },          // DDR4, DDR5
        { key: 'capacidad_gb', titulo: 'Capacidad Total', unidad: 'GB' },
        { key: 'velocidad_mhz', titulo: 'Velocidad', unidad: 'MHz' }
    ],
    fuente_poder: [
        { key: 'potencia_w', titulo: 'Potencia', unidad: 'W' },
        { key: 'certificacion', titulo: 'Certificación 80+' }
    ],
    almacenamiento: [
        { key: 'formato', titulo: 'Formato' },          // M.2, SATA
        { key: 'capacidad', titulo: 'Capacidad' }
    ],
    tarjeta_grafica: [
        { key: 'marca', titulo: 'Chipset' },            // NVIDIA, AMD
        { key: 'vram_gb', titulo: 'Memoria de Video', unidad: 'GB' }
    ],
    monitor: [
        { key: 'tasa_refresco', titulo: 'Tasa de Refresco' },
        { key: 'resolucion', titulo: 'Resolución' },
        { key: 'panel', titulo: 'Tipo de Panel' }
    ],
    procesador: [
        { key: 'socket', titulo: 'Socket' },
        { key: 'graficos', titulo: 'Gráficos Integrados', booleano: true } // Especial para Si/No
    ],
    placa_base: [
        { key: 'socket', titulo: 'Socket' },
        { key: 'tipo_memoria', titulo: 'Memoria Soportada' },
        { key: 'formato', titulo: 'Formato' }
    ]
};

// INICIALIZACIÓN
fetch("js/productos.json")
    .then(res => res.json())
    .then(data => {
        productos = data;
        actualizarContador();
        cargarMarcasGlobales(); // Cargar todas las marcas al inicio
        setupPrecioEvents();

        // Leer URL (si viene del home)
        const params = new URLSearchParams(window.location.search);
        const catURL = params.get('filtro');
        if (catURL) {
            cambiarCategoria(catURL);
            selectCategoria.value = catURL;
        } else {
            aplicarFiltros();
        }
    });

// --- 1. GESTIÓN DE MARCAS ---
const cargarMarcasGlobales = () => {
    // Busca todas las marcas únicas en el JSON
    const marcas = [...new Set(productos.map(p => {
        // Si el producto tiene 'specs.marca', úsala. Si no, intenta sacarla del nombre.
        return p.specs.marca || p.nombre.split(" ")[0];
    }))].sort();
    
    renderizarCheckboxes(contenedorMarcas, marcas);
};

// --- 2. GESTIÓN DE FILTROS DINÁMICOS ---
window.cambiarCategoria = (categoria) => {
    estadoFiltros.categoria = categoria;
    estadoFiltros.extras = {}; // Reiniciar filtros extra
    contenedorDinamicos.innerHTML = ""; // Limpiar visualmente
    
    // Si la categoría tiene configuración especial, creamos los filtros
    if (CONFIG_FILTROS[categoria]) {
        CONFIG_FILTROS[categoria].forEach(config => {
            crearFiltroDinamico(categoria, config);
        });
    }
    
    aplicarFiltros();
};

const crearFiltroDinamico = (categoria, config) => {
    // Obtener valores únicos disponibles en los productos de esta categoría
    const prodsCategoria = productos.filter(p => p.categoria === categoria);
    
    let valoresUnicos;
    if (config.booleano) {
        valoresUnicos = ["Sí", "No"];
    } else {
        valoresUnicos = [...new Set(prodsCategoria.map(p => p.specs[config.key]))].sort();
    }

    if(valoresUnicos.length === 0 || valoresUnicos[0] === undefined) return; 

    // Crear el HTML del grupo de filtros
    const grupoDiv = document.createElement('div');
    grupoDiv.className = 'filtro-grupo';
    grupoDiv.innerHTML = `<span class="filtro-titulo">${config.titulo}</span>`;
    
    const listaDiv = document.createElement('div');
    listaDiv.className = 'lista-filtros';

    valoresUnicos.forEach(valor => {
        const div = document.createElement('div');
        const valorMostrar = config.unidad ? `${valor} ${config.unidad}` : valor;
        
        // El valor real para filtrar (si es booleano, convertimos Sí/No a true/false)
        let valorReal = valor;
        if(config.booleano) valorReal = (valor === "Sí");

        div.innerHTML = `
            <label style="display:flex; align-items:center;">
                <input type="checkbox" value="${valorReal}" data-key="${config.key}" onchange="toggleFiltroExtra(this)">
                ${valorMostrar}
            </label>
        `;
        listaDiv.appendChild(div);
    });

    grupoDiv.appendChild(listaDiv);
    contenedorDinamicos.appendChild(grupoDiv);
};

window.toggleFiltroExtra = (checkbox) => {
    const key = checkbox.getAttribute('data-key');
    let valor = checkbox.value;
    
    // Convertir a tipo correcto si es necesario (números o booleanos)
    if (valor === "true") valor = true;
    else if (valor === "false") valor = false;
    else if (!isNaN(valor)) valor = Number(valor); // Si es número, convertirlo

    if(!estadoFiltros.extras[key]) estadoFiltros.extras[key] = [];

    if(checkbox.checked) {
        estadoFiltros.extras[key].push(valor);
    } else {
        estadoFiltros.extras[key] = estadoFiltros.extras[key].filter(v => v !== valor);
        if(estadoFiltros.extras[key].length === 0) delete estadoFiltros.extras[key];
    }
    aplicarFiltros();
};

// --- 3. MOTOR DE FILTRADO ---
const aplicarFiltros = () => {
    const resultado = productos.filter(p => {
        // A. Categoría
        if (estadoFiltros.categoria !== 'todos' && p.categoria !== estadoFiltros.categoria) return false;

        // B. Precio
        if (p.precio < estadoFiltros.precioMin || p.precio > estadoFiltros.precioMax) return false;

        // C. Marcas
        if (estadoFiltros.marcas.length > 0) {
            const marcaProd = p.specs.marca || p.nombre.split(" ")[0];
            if (!estadoFiltros.marcas.includes(marcaProd)) return false;
        }

        // D. Filtros Dinámicos
        for (const [key, valoresAceptados] of Object.entries(estadoFiltros.extras)) {
            const valorProd = p.specs[key];
            if (!valoresAceptados.includes(valorProd)) return false;
        }

        return true;
    });

    renderizarProductos(resultado);
};

// --- UTILIDADES ---
const renderizarCheckboxes = (contenedor, lista) => {
    contenedor.innerHTML = "";
    lista.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label style="display:flex; align-items:center;">
                <input type="checkbox" value="${item}" onchange="toggleMarca(this)"> ${item}
            </label>`;
        contenedor.appendChild(div);
    });
};

window.toggleMarca = (checkbox) => {
    if(checkbox.checked) estadoFiltros.marcas.push(checkbox.value);
    else estadoFiltros.marcas = estadoFiltros.marcas.filter(m => m !== checkbox.value);
    aplicarFiltros();
};

const setupPrecioEvents = () => {
    rangeMin.addEventListener('input', (e) => { inputMin.value = e.target.value; estadoFiltros.precioMin = parseInt(e.target.value); aplicarFiltros(); });
    rangeMax.addEventListener('input', (e) => { inputMax.value = e.target.value; estadoFiltros.precioMax = parseInt(e.target.value); aplicarFiltros(); });
    inputMin.addEventListener('change', (e) => { rangeMin.value = e.target.value; estadoFiltros.precioMin = parseInt(e.target.value); aplicarFiltros(); });
    inputMax.addEventListener('change', (e) => { rangeMax.value = e.target.value; estadoFiltros.precioMax = parseInt(e.target.value); aplicarFiltros(); });
};

const renderizarProductos = (lista) => {
    container.innerHTML = "";
    cantidadResultados.innerText = `${lista.length} productos`;
    
    if (lista.length === 0) {
        container.innerHTML = "<div style='width:100%; text-align:center; padding:30px;'><h3>🔍 Sin resultados</h3><p>Intenta cambiar los filtros.</p></div>";
        return;
    }

    lista.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'card';
        const ofertaBadge = prod.oferta ? `<span style="position:absolute; top:10px; left:10px; background:#e91e63; color:white; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold;">OFERTA</span>` : '';
        
        card.innerHTML = `
            ${ofertaBadge}
            <div class="card-image"><img src="${prod.imagen}" alt="${prod.nombre}"></div>
            <div class="card-name">${prod.nombre}</div>
            <div class="card-price">$${prod.precio.toLocaleString()}</div>
            <div class="card-button">
                <button class="button button-outline button-add">AGREGAR AL CARRITO 🛒</button>
            </div>
        `;
        card.querySelector('button').addEventListener('click', () => agregarAlCarrito(prod));
        container.appendChild(card);
    });
};

const agregarAlCarrito = (producto) => {
    producto.origen = 'Tienda';
    carritoSimple.push(producto);
    localStorage.setItem('carritoFrutas', JSON.stringify(carritoSimple));
    actualizarContador();
    alert(`¡${producto.nombre} agregado!`);
};

const actualizarContador = () => {
    if(cartCountElement) cartCountElement.innerText = carritoSimple.length;
};

window.borrarFiltros = () => {
    estadoFiltros = { categoria: 'todos', precioMin: 0, precioMax: 2000000, marcas: [], extras: {} };
    selectCategoria.value = 'todos';
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    contenedorDinamicos.innerHTML = "";
    aplicarFiltros();
};