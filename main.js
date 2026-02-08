// --- BASE DE DATOS DE PRODUCTOS ---
const products = [
    { id: 1, name: "BBC Micro:bit V2 Club Pack (10 und)", price: 1370129, image: "img/microbit-pack.jpg" },
    { id: 2, name: "Carro Robótico Arduino Kit", price: 166960, image: "img/carro-arduino.jpg" },
    { id: 3, name: "Kit Micro:bit Construcción STEM", price: 199900, image: "img/kit-stem.jpg" },
    { id: 4, name: "Tarjeta Expansión Micro:bit Io Bit", price: 42382, image: "img/expansion-iobit.jpg" },
    { id: 5, name: "Sensor Humedad Suelo Capacitivo", price: 10000, image: "img/sensor-humedad.jpg" },
    { id: 6, name: "Módulo Relé 1 Canal 5V/10A", price: 10000, image: "img/rele-1canal.jpg" },
    { id: 7, name: "Set Destornilladores Precisión", price: 13856, image: "img/destornilladores.jpg" },
    { id: 8, name: "Multitoma Regleta 6 Puertos", price: 10240, image: "img/multitoma.jpg" },
    { id: 9, name: "Extensión Eléctrica 5 Metros", price: 10147, image: "img/extension.jpg" },
    { id: 10, name: "Kit Soldador Regulable", price: 29266, image: "img/soldador.jpg" },
    { id: 11, name: "Pilas Recargables AAA x4", price: 33606, image: "img/pilas-aaa.jpg" },
    { id: 12, name: "Cargador Inteligente 8 Ranuras", price: 68920, image: "img/cargador.jpg" },
    { id: 13, name: "Cables Jumper Dupont x10", price: 5290, image: "img/jumpers.jpg" }
];

// --- LÓGICA DEL CARRITO ---
let cart = [];

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

// Renderizado con imagen por defecto si falla la carga
function renderProducts(productList = products) {
    const container = document.getElementById('productsContainer');
    
    if(productList.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 1.2rem; color: #888;">No encontramos productos con ese nombre 😕</p>';
        return;
    }

    container.innerHTML = productList.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300?text=Sin+Foto'">
            
            <div>
                <h3>${p.name}</h3>
                <span class="price">${formatPrice(p.price)}</span>
            </div>
            <button class="btn" onclick="addToCart(${p.id})">➕ Agregar al Carrito</button>
        </div>
    `).join('');
}

function filterProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    renderProducts(filtered);
}

// --- FUNCIONES DEL CARRITO ---
function addToCart(id) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ id: id, qty: 1 });
    }
    updateCartUI();
    
    // Animación burbuja
    const btnFloat = document.querySelector('.cart-float');
    btnFloat.style.transform = 'scale(1.2)';
    setTimeout(() => btnFloat.style.transform = 'scale(1)', 200);
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartCount').textContent = totalItems;
    
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    let totalPrice = 0;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; margin-top: 20px; color: #999;">Tu canasta está vacía</p>';
    } else {
        container.innerHTML = cart.map(item => {
            const productInfo = products.find(p => p.id === item.id);
            const subtotal = productInfo.price * item.qty;
            totalPrice += subtotal;

            return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${productInfo.name}</h4>
                    <span class="cart-item-total">${formatPrice(productInfo.price)} x ${item.qty} = ${formatPrice(subtotal)}</span>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
            `;
        }).join('');
    }
    totalEl.textContent = formatPrice(totalPrice);
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert("Agrega productos primero");
        return;
    }

    let message = "Hola InnovaBot, quiero realizar el siguiente pedido:\n\n";
    let total = 0;

    cart.forEach(item => {
        const productInfo = products.find(p => p.id === item.id);
        const subtotal = productInfo.price * item.qty;
        total += subtotal;
        message += `▪️ (${item.qty}) x ${productInfo.name}\n`;
    });

    message += `\n💰 *TOTAL A PAGAR: ${formatPrice(total)}*`;
    message += `\n\nQuedo atento a los datos de pago y envío.`;

    window.open(`https://wa.me/573022399995?text=${encodeURIComponent(message)}`, '_blank');
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('cartModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Inicializar la tienda
renderProducts();