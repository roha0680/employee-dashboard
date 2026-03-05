// Employee data storage
let employees = [];
let filteredEmployees = [];

// Initialize dashboard
function init() {
    loadDataFromJSON();
}

// Load data from JSON file
async function loadDataFromJSON() {
    try {
        const response = await fetch('employee-data.json');
        if (response.ok) {
            const data = await response.json();
            employees = data.map(item => ({
                employeeId: item.employeeId || item.EmployeeID || item['Employee ID'] || '',
                rackerName: item.rackerName || item.RackerName || item['Racker Name'] || '',
                manager: item.manager || item.Manager || '',
                jobProfile: item.jobProfile || item.JobProfile || item['Job Profile'] || '',
                podRacker: item.podRacker || item.PODRacker || item['POD Racker'] || '',
                tenure: parseFloat(item.tenure || item.Tenure) || 0,
                workShift: item.workShift || item.WorkShift || item['Work Shift'] || '',
                country: item.country || item.Country || '',
                legacyCompany: item.legacyCompany || item.LegacyCompany || item['Legacy Company'] || '',
                costCentre: item.costCentre || item.CostCentre || item['Cost Centre'] || '',
                basePay: parseFloat(String(item.basePay || item.BasePay || item['Base Pay (USD)'] || item['Base Pay'] || 0).replace(/[$,]/g, '')) || 0
            }));
            filteredEmployees = [...employees];
            renderEmployees(filteredEmployees);
            updateSummary();
            populateFilters();
            setupEventListeners();
        } else {
            console.log('No employee-data.json found, starting with empty data');
            loadSampleData();
            renderEmployees(filteredEmployees);
            updateSummary();
            populateFilters();
            setupEventListeners();
        }
    } catch (error) {
        console.log('Error loading employee-data.json:', error);
        loadSampleData();
        renderEmployees(filteredEmployees);
        updateSummary();
        populateFilters();
        setupEventListeners();
    }
}

// Load sample data
function loadSampleData() {
    employees = [];
    filteredEmployees = [];
}

// Render employee table
function renderEmployees(data) {
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 30px; color: #7f8c8d;">No employees found</td></tr>';
        return;
    }

    data.forEach(emp => {
        const row = document.createElement('tr');

        // Format base pay with K suffix
        let basePayDisplay;
        if (emp.basePay >= 1000) {
            basePayDisplay = `$${(emp.basePay / 1000).toFixed(0)}K`;
        } else {
            basePayDisplay = `$${emp.basePay}`;
        }

        row.innerHTML = `
            <td>${emp.employeeId}</td>
            <td>${emp.rackerName}</td>
            <td>${emp.manager}</td>
            <td>${emp.jobProfile}</td>
            <td>${emp.podRacker}</td>
            <td>${emp.tenure} years</td>
            <td>${emp.workShift}</td>
            <td>${emp.country}</td>
            <td>${emp.legacyCompany}</td>
            <td>${emp.costCentre}</td>
            <td>${basePayDisplay}</td>
        `;
        tbody.appendChild(row);
    });
}


// Update summary cards
function updateSummary() {
    const totalEmployees = filteredEmployees.length;
    const totalBasePay = filteredEmployees.reduce((sum, emp) => sum + emp.basePay, 0);
    
    // Display in millions if >= 1M, otherwise show full amount
    let totalBasePayDisplay;
    if (totalBasePay >= 1000000) {
        const totalBasePayInMillions = (totalBasePay / 1000000).toFixed(2);
        totalBasePayDisplay = `$${totalBasePayInMillions}M`;
    } else {
        totalBasePayDisplay = `$${totalBasePay.toLocaleString()}`;
    }
    
    const avgTenure = filteredEmployees.length > 0 
        ? (filteredEmployees.reduce((sum, emp) => sum + emp.tenure, 0) / filteredEmployees.length).toFixed(1)
        : 0;
    
    document.getElementById('totalEmployees').textContent = totalEmployees;
    document.getElementById('totalBasePay').textContent = totalBasePayDisplay;
    document.getElementById('avgTenure').textContent = `${avgTenure} years`;
}

// Populate filter dropdowns
function populateFilters() {
    const managers = [...new Set(employees.map(e => e.manager))].filter(Boolean).sort();
    const pods = [...new Set(employees.map(e => e.podRacker))].filter(Boolean).sort();
    const shifts = [...new Set(employees.map(e => e.workShift))].filter(Boolean).sort();
    const countries = [...new Set(employees.map(e => e.country))].filter(Boolean).sort();
    const legacyCompanies = [...new Set(employees.map(e => e.legacyCompany))].filter(Boolean).sort();
    const costCentres = [...new Set(employees.map(e => e.costCentre))].filter(Boolean).sort();
    
    populateSelect('managerFilter', managers);
    populateSelect('podFilter', pods);
    populateSelect('shiftFilter', shifts);
    populateSelect('countryFilter', countries);
    populateSelect('legacyFilter', legacyCompanies);
    populateSelect('costCentreFilter', costCentres);
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    const isMultiple = select.hasAttribute('multiple');
    
    if (isMultiple) {
        // For multiple select, preserve the original "All" text and selections
        const currentSelections = Array.from(select.selectedOptions).map(opt => opt.value);
        const originalAllText = select.options[0].textContent;
        
        select.innerHTML = `<option value="">${originalAllText}</option>`;
        
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            if (currentSelections.includes(option)) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
    } else {
        // For single select, keep current value
        const currentValue = select.value;
        select.innerHTML = select.options[0].outerHTML;
        
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
        
        select.value = currentValue;
    }
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const pod = document.getElementById('podFilter').value;
    const shift = document.getElementById('shiftFilter').value;
    const country = document.getElementById('countryFilter').value;
    const legacy = document.getElementById('legacyFilter').value;
    
    // Get selected managers (multiple selection)
    const managerSelect = document.getElementById('managerFilter');
    const selectedManagers = Array.from(managerSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== '');
    
    // Get selected cost centres (multiple selection)
    const costCentreSelect = document.getElementById('costCentreFilter');
    const selectedCostCentres = Array.from(costCentreSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== '');
    
    filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.rackerName.toLowerCase().includes(searchTerm) || 
                            emp.employeeId.toLowerCase().includes(searchTerm);
        const matchesManager = selectedManagers.length === 0 || selectedManagers.includes(emp.manager);
        const matchesPod = !pod || emp.podRacker === pod;
        const matchesShift = !shift || emp.workShift === shift;
        const matchesCountry = !country || emp.country === country;
        const matchesLegacy = !legacy || emp.legacyCompany === legacy;
        const matchesCostCentre = selectedCostCentres.length === 0 || selectedCostCentres.includes(emp.costCentre);
        
        return matchesSearch && matchesManager && matchesPod && matchesShift && 
               matchesCountry && matchesLegacy && matchesCostCentre;
    });
    
    renderEmployees(filteredEmployees);
    updateSummary();
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('managerFilter').value = '';
    document.getElementById('podFilter').value = '';
    document.getElementById('shiftFilter').value = '';
    document.getElementById('countryFilter').value = '';
    document.getElementById('legacyFilter').value = '';
    document.getElementById('costCentreFilter').value = '';
    
    filteredEmployees = [...employees];
    renderEmployees(filteredEmployees);
    updateSummary();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('managerFilter').addEventListener('change', applyFilters);
    document.getElementById('podFilter').addEventListener('change', applyFilters);
    document.getElementById('shiftFilter').addEventListener('change', applyFilters);
    document.getElementById('countryFilter').addEventListener('change', applyFilters);
    document.getElementById('legacyFilter').addEventListener('change', applyFilters);
    document.getElementById('costCentreFilter').addEventListener('change', applyFilters);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
    document.getElementById('uploadBtn').addEventListener('click', handleFileUpload);
    document.getElementById('clearDataBtn').addEventListener('click', clearData);
}

// Handle file upload
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
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
            
            employees = data.map(item => ({
                employeeId: item.employeeId || item.EmployeeID || item['Employee ID'] || '',
                rackerName: item.rackerName || item.RackerName || item['Racker Name'] || '',
                manager: item.manager || item.Manager || '',
                jobProfile: item.jobProfile || item.JobProfile || item['Job Profile'] || '',
                podRacker: item.podRacker || item.PODRacker || item['POD Racker'] || '',
                tenure: parseFloat(item.tenure || item.Tenure) || 0,
                workShift: item.workShift || item.WorkShift || item['Work Shift'] || '',
                country: item.country || item.Country || '',
                legacyCompany: item.legacyCompany || item.LegacyCompany || item['Legacy Company'] || '',
                costCentre: item.costCentre || item.CostCentre || item['Cost Centre'] || '',
                basePay: parseFloat(String(item.basePay || item.BasePay || item['Base Pay (USD)'] || item['Base Pay'] || 0).replace(/[$,]/g, '')) || 0
            }));
            
            filteredEmployees = [...employees];
            renderEmployees(filteredEmployees);
            updateSummary();
            populateFilters();
            showStatus(`Successfully loaded ${employees.length} employees`, 'success');
            
        } catch (error) {
            showStatus('Error parsing file: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// Parse CSV
function parseCSV(content) {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return [];
    
    // Parse CSV line handling quoted fields with commas
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = parseCSVLine(lines[i]);
        const obj = {};
        
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
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
    renderEmployees(filteredEmployees);
    updateSummary();
    populateFilters();
    resetFilters();
    document.getElementById('fileInput').value = '';
    showStatus('Data cleared, sample data loaded', 'success');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
