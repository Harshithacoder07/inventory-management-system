// --- DATABASE INITIALIZATION ---
let products = JSON.parse(localStorage.getItem('n_prod')) || [];
let suppliers = JSON.parse(localStorage.getItem('n_supp')) || [];
let logs = JSON.parse(localStorage.getItem('n_logs')) || [];

// --- LOGIN LOGIC ---
document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    refreshUI();
};

// --- NAVIGATION ---
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id + 'Page').classList.add('active');
    document.getElementById('pageTitle').innerText = id.charAt(0).toUpperCase() + id.slice(1);
    
    // Set Active button (Simplified logic)
    event.currentTarget.classList.add('active');
    refreshUI();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// --- MODAL CONTROLS ---
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- PRODUCT MANAGEMENT ---
function saveProduct() {
    const name = document.getElementById('pName').value;
    const cat = document.getElementById('pCat').value;
    const price = document.getElementById('pPrice').value;

    if(name && cat && price) {
        products.push({ id: Date.now(), name, cat, price, stock: 0 });
        sync();
        closeModal('pModal');
        addLog(`New product created: ${name}`);
    }
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    sync();
    addLog(`Product removed from database.`);
}

// --- SUPPLIER MANAGEMENT ---
function saveSupplier() {
    const name = document.getElementById('sName').value;
    const email = document.getElementById('sEmail').value;
    const phone = document.getElementById('sPhone').value;

    if(name && email) {
        suppliers.push({ id: Date.now(), name, email, phone });
        sync();
        closeModal('sModal');
        addLog(`Partner linked: ${name}`);
    }
}

// --- STOCK MOVEMENTS (IN/OUT) ---
function handleStockMove(type) {
    const pId = document.getElementById(type === 'IN' ? 'si-prod' : 'so-prod').value;
    const qty = parseInt(document.getElementById(type === 'IN' ? 'si-qty' : 'so-qty').value);
    
    const prod = products.find(p => p.id == pId);
    if(!prod) return alert("Select a product first.");
    if(isNaN(qty) || qty <= 0) return alert("Enter valid quantity.");

    if(type === 'IN') {
        prod.stock += qty;
        addLog(`Stock IN: +${qty} for ${prod.name}`);
    } else {
        if(prod.stock < qty) return alert("Insufficient Stock!");
        prod.stock -= qty;
        addLog(`Stock OUT: -${qty} for ${prod.name}`);
    }
    sync();
    alert("Transaction Successful");
}

// --- REFRESH / SYNC ---
function sync() {
    localStorage.setItem('n_prod', JSON.stringify(products));
    localStorage.setItem('n_supp', JSON.stringify(suppliers));
    localStorage.setItem('n_logs', JSON.stringify(logs));
    refreshUI();
}

function refreshUI() {
    // 1. Dashboard
    document.getElementById('dash-prod').innerText = products.length;
    document.getElementById('dash-supp').innerText = suppliers.length;
    document.getElementById('dash-low').innerText = products.filter(p => p.stock < 5).length;
    document.getElementById('dash-updates').innerText = logs.length;

    // 2. Product Table
    const pTable = document.getElementById('pTableBody');
    pTable.innerHTML = products.map((p, idx) => `
        <tr>
            <td class="p-4 rounded-l-lg text-gray-500">${idx+1}</td>
            <td class="font-bold">${p.name}</td>
            <td class="text-sm text-gray-400">${p.cat}</td>
            <td>$${p.price}</td>
            <td class="${p.stock < 5 ? 'text-rose-500' : 'text-[#1DB954]'} font-bold">${p.stock}</td>
            <td class="rounded-r-lg"><button onclick="deleteProduct(${p.id})"><i class="fas fa-trash hover:text-rose-500 transition"></i></button></td>
        </tr>
    `).join('');

    // 3. Supplier Grid
    const sGrid = document.getElementById('supplierGrid');
    sGrid.innerHTML = suppliers.map(s => `
        <div class="bg-[#181818] p-6 rounded-xl border border-transparent hover:border-[#282828] transition">
            <h5 class="text-lg font-bold mb-2">${s.name}</h5>
            <p class="text-xs text-gray-400 mb-1"><i class="fas fa-envelope mr-2"></i>${s.email}</p>
            <p class="text-xs text-gray-400"><i class="fas fa-phone mr-2"></i>${s.phone}</p>
        </div>
    `).join('');

    // 4. Fill Select Menus
    const pOptions = '<option value="">Select Product...</option>' + products.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`).join('');
    document.getElementById('si-prod').innerHTML = pOptions;
    document.getElementById('so-prod').innerHTML = pOptions;
    document.getElementById('si-supp').innerHTML = '<option value="">Select Supplier...</option>' + suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    // 5. Activity Log
    document.getElementById('activityLog').innerHTML = logs.slice(-5).reverse().map(l => `
        <div class="flex gap-3 items-center">
            <div class="w-2 h-2 rounded-full bg-[#1DB954]"></div>
            <p>${l.text} <span class="text-[10px] text-gray-600 ml-2">${l.time}</span></p>
        </div>
    `).join('');

    // 6. Reports
    document.getElementById('lowStockReport').innerHTML = products.filter(p => p.stock < 5).map(p => `
        <div class="flex justify-between p-3 bg-rose-500/10 rounded-lg text-xs">
            <span>${p.name}</span>
            <span class="font-bold">${p.stock} UNITS LEFT</span>
        </div>
    `).join('') || '<p class="text-xs text-gray-500">Inventory health is good.</p>';
}

function addLog(text) {
    logs.push({ text, time: new Date().toLocaleTimeString() });
    sync();
}

function clearDatabase() {
    if(confirm("Wipe all data? This cannot be undone.")) {
        localStorage.clear();
        location.reload();
    }
}

// Init
refreshUI();