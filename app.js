// Customer data storage
let customers = [];
let filteredCustomers = [];

// Initialize dashboard
function init() {
    loadSampleData();
    renderCustomers(filteredCustomers);
    updateSummary();
    setupEventListeners();
}

// Load sample data
function loadSampleData() {
    customers = [
        { id: 1, name: "Acme Corporation", mrr: 5000, devices: 45, contractExpiry: "2026-08-15" },
        { id: 2, name: "TechStart Inc", mrr: 2500, devices: 20, contractExpiry: "2026-04-20" },
        { id: 3, name: "Global Solutions", mrr: 8500, devices: 120, contractExpiry: "2026-12-01" },
        { id: 4, name: "Innovation Labs", mrr: 3200, devices: 35, contractExpiry: "2026-03-10" },
        { id: 5, name: "Digital Dynamics", mrr: 6700, devices: 85, contractExpiry: "2026-09-25" },
        { id: 6, name: "Cloud Systems", mrr: 4100, devices: 52, contractExpiry: "2026-05-18" },
        { id: 7, name: "Data Corp", mrr: 9200, devices: 150, contractExpiry: "2026-11-30" },
        { id: 8, name: "Smart Tech", mrr: 1800, devices: 15, contractExpiry: "2026-03-05" }
    ];
    filteredCustomers = [...customers];
}

// Render customer table
function renderCustomers(data) {
    const tbody = document.getElementById('customerTableBody');
    tbody.innerHTML = '';
    
    data.forEach(customer => {
        const row = document.createElement('tr');
        const status = getContractStatus(customer.contractExpiry);
        
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>$${customer.mrr.toLocaleString()}</td>
            <td>${customer.devices}</td>
            <td>${formatDate(customer.contractExpiry)}</td>
            <td><span class="status-badge status-${status.class}">${status.text}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get contract status
function getContractStatus(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return { class: 'expired', text: 'Expired' };
    } else if (daysUntilExpiry <= 30) {
        return { class: 'expiring', text: 'Expiring Soon' };
    } else {
        return { class: 'active', text: 'Active' };
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Update summary cards
function updateSummary() {
    const totalCustomers = filteredCustomers.length;
    const totalMRR = filteredCustomers.reduce((sum, c) => sum + c.mrr, 0);
    const expiringSoon = filteredCustomers.filter(c => {
        const daysUntilExpiry = Math.floor((new Date(c.contractExpiry) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }).length;
    
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('totalMRR').textContent = `$${totalMRR.toLocaleString()}`;
    document.getElementById('expiringSoon').textContent = expiringSoon;
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredCustomers = customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm)
        );
        renderCustomers(filteredCustomers);
        updateSummary();
    });
    
    sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        
        filteredCustomers.sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'mrr') {
                return b.mrr - a.mrr;
            } else if (sortBy === 'expiry') {
                return new Date(a.contractExpiry) - new Date(b.contractExpiry);
            }
        });
        
        renderCustomers(filteredCustomers);
    });
    
    uploadBtn.addEventListener('click', handleFileUpload);
    clearDataBtn.addEventListener('click', clearData);
}

// Handle file upload
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const statusDiv = document.getElementById('uploadStatus');
    
    if (!file) {
        showStatus('Please select a file', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            let data;
            
            if (file.name.endsWith('.json')) {
                data = JSON.parse(content);
            } else if (file.name.endsWith('.csv')) {
                data = parseCSV(content);
            } else {
                showStatus('Unsupported file format', 'error');
                return;
            }
            
            if (!Array.isArray(data) || data.length === 0) {
                showStatus('Invalid data format', 'error');
                return;
            }
            
            customers = data.map((item, index) => ({
                id: item.id || index + 1,
                name: item.name || item.customerName || '',
                mrr: parseFloat(item.mrr) || 0,
                devices: parseInt(item.devices) || 0,
                contractExpiry: item.contractExpiry || item.expiry || ''
            }));
            
            filteredCustomers = [...customers];
            renderCustomers(filteredCustomers);
            updateSummary();
            showStatus(`Successfully loaded ${customers.length} customers`, 'success');
            
        } catch (error) {
            showStatus('Error parsing file: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// Parse CSV
function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj = {};
        
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        
        data.push(obj);
    }
    
    return data;
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = type;
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Clear data and reload sample
function clearData() {
    loadSampleData();
    renderCustomers(filteredCustomers);
    updateSummary();
    document.getElementById('fileInput').value = '';
    showStatus('Data cleared, sample data loaded', 'success');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
