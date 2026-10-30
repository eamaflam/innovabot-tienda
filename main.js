// --- BASE DE DATOS DE PRODUCTOS ---
const products = [
    { 
        id: 15, 
        name: "Ultimate Starter Kit para BBC micro:bit (V2 incluido)", 
        price: 300000, 
        image: "img/caja.jpg",
        description: "Incluye micro:bit V2, tarjeta de expansión, sensor de humedad, temperatura, movimiento, ultrasónico, infrarrojo, servomotor, protoboard, cables jumper y de caimán, y 20 sensores más."
    },
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
    { id: 13, name: "Cables Jumper Dupont x10", price: 5290, image: "img/jumpers.jpg" },
    { id: 14, name: "Motor Reductor + Rueda Llanta 65mm", price: 12469, image: "img/motor-rueda.jpg" },

    // --- MATERIALES DEL PROYECTO (precios con IVA incluido) ---
    {
        id: 16,
        name: "Kit BBC micro:bit V2 Go (Placa, cable USB y portapilas)",
        price: 125000,
        image: "img/microbit-go.jpg",
        description: "Placa micro:bit V2, cable USB y portapilas. Ideal para programación visual por bloques (MakeCode) y lectura de variables del entorno."
    },
    {
        id: 17,
        name: "Chasis Carro Robot para micro:bit con Placa de Expansión",
        price: 115000,
        image: "img/chasis-microbit.jpg",
        description: "Kit completo: PCB controladora integrada, motores, ruedas y puertos para sensores. Para robótica móvil y evasión de obstáculos."
    },
    {
        id: 18,
        name: "Placa ESP32 (Wi-Fi + Bluetooth)",
        price: 32000,
        image: "img/esp32.jpg",
        description: "Microcontrolador avanzado para proyectos IoT ambientales, estaciones meteorológicas y monitoreo remoto."
    },
    {
        id: 19,
        name: "Sensor de Presión Barométrica y Altitud (BMP280 / BME280)",
        price: 22000,
        image: "img/bmp280.jpg",
        description: "Mide presión atmosférica, temperatura y estima altitud. Ideal para estaciones meteorológicas escolares."
    },
    {
        id: 20,
        name: "Sensor de Sismos y Vibración (SW-420 / ADXL345)",
        price: 18000,
        image: "img/sensor-vibracion.jpg",
        description: "Detección de movimientos telúricos o vibraciones mecánicas para proyectos de alerta temprana."
    },
    {
        id: 21,
        name: "Sensor de pH del Agua (PH-4502C con sonda)",
        price: 65000,
        image: "img/sensor-ph.jpg",
        description: "Módulo analógico con sonda y placa de interfaz. Monitoreo de acidez/alcalinidad en fuentes hídricas y huertas."
    },
    {
        id: 22,
        name: "Sensor de Calidad del Aire PM2.5 / PM10 (GP2Y1010AU0F / PMS5003)",
        price: 95000,
        image: "img/sensor-pm25.jpg",
        description: "Medidor de polvo y partículas suspendidas para análisis de calidad del aire en zonas rurales o de quema agrícola."
    },
    {
        id: 23,
        name: "Kit Sensores Ambientales Básicos (3 sensores)",
        price: 35000,
        image: "img/kit-sensores-ambientales.jpg",
        description: "Incluye sensor de humedad de suelo capacitivo, temperatura DHT11 y ultrasonido HC-SR04."
    },
    {
        id: 24,
        name: "Kit de Actuadores (Servo SG90 + Minibomba de agua + Relé)",
        price: 28000,
        image: "img/kit-actuadores.jpg",
        description: "1 servomotor SG90, 1 minibomba de agua sumergible con manguera y 1 relé. Para riego automatizado o compuertas."
    },
    {
        id: 25,
        name: "Kit de Electrónica Básica (Protoboard, jumpers, caimanes, LEDs y buzzer)",
        price: 32000,
        image: "img/kit-electronica.jpg",
        description: "Protoboard 400 pts, 40 jumpers M-H/H-H, 10 caimanes, LEDs y buzzer para circuitos básicos y alarmas."
    },
    {
        id: 26,
        name: "Impresora 3D FDM (Tipo Creality Ender 3 o equivalente)",
        price: 850000,
        image: "img/impresora-3d.jpg",
        description: "Impresora 3D económica para prototipado rápido y fabricación local de soportes, carcasas y piezas."
    },
    {
        id: 27,
        name: "Rollo de Filamento PLA 1 kg - 1.75 mm",
        price: 85000,
        image: "img/filamento-pla.jpg",
        description: "Insumo para impresión 3D de carcasas de sensores, adaptadores, maquetas y medallas."
    },
    {
        id: 28,
        name: "Kit de Energía Recargable (Cargador + 4 baterías AA/AAA)",
        price: 65000,
        image: "img/kit-energia.jpg",
        description: "Cargador con 4 baterías recargables de alta capacidad. Autonomía energética sin residuos de pilas desechables."
    },
    {
        id: 29,
        name: "Kit de Tintas Originales CMYK (4 botellas)",
        price: 190000,
        image: "img/tintas-cmyk.jpg",
        description: "Botellas Negro, Cian, Magenta y Amarillo para impresión de guías, manuales, tarjetas y certificados."
    },
    {
        id: 30,
        name: "Lote de Papelería para Material Pedagógico",
        price: 145000,
        image: "img/papeleria.jpg",
        description: "3 resmas de papel bond, 2 paquetes de opalina/cartulina y 1 paquete de bolsillos para laminar."
    },
    {
        id: 31,
        name: "Kit de Insumos Didácticos Desconectados",
        price: 95000,
        image: "img/insumos-didacticos.jpg",
        description: "Cintas de enmascarar, ligas de colores, marcadores borrables y permanentes, y silicona."
    },
    {
        id: 32,
        name: "Caja Organizadora Plástica tipo Herramienta (12\" a 15\")",
        price: 28000,
        image: "img/caja-organizadora.jpg",
        description: "Para almacenar, clasificar y proteger los kits de robótica a largo plazo."
    },
    {
        id: 33,
        name: "Pista Impresa en Lona/Banner 1.5 m x 1.5 m",
        price: 80000,
        image: "img/pista-lona.jpg",
        description: "Pista con retos de seguimiento de línea y desafíos contextualizados para torneos de robótica."
    }
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
            <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='img/placeholder.svg'">
            
            <div>
                <h3>${p.name}</h3>
                ${p.description ? `<p class="product-description">${p.description}</p>` : ''}
                <span class="price">${formatPrice(p.price)}</span>
                <small class="iva-label" style="display:block; color:#888; font-size:0.8rem;">IVA incluido</small>
            </div>
            <button class="btn" onclick="addToCart(${p.id})">▶ agregar al carrito</button>
        </div>
    `).join('');
}

function filterProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
    );
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

    message += `\n💰 *TOTAL A PAGAR: ${formatPrice(total)}* (IVA incluido)`;
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