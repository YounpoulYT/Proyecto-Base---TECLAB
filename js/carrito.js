const agregarAlCarrito = (frutaid) => {
    if (frutaid > 0) {
        let productoEncontrado = productos.find((producto) => producto.id === parseInt(frutaid))
        if (productoEncontrado !== undefined) {
            carritoFrutas.push(productoEncontrado)
            almacenarCarrito()
        }
    }
}

const almacenarCarrito = () => {
    carritoFrutas.length > 0 && localStorage.setItem('carritoFrutas', JSON.stringify(carritoFrutas))
}

const recuperarCarrito = () => {
    return JSON.parse(localStorage.getItem('carritoFrutas')) || []
}

const carritoFrutas = recuperarCarrito ()