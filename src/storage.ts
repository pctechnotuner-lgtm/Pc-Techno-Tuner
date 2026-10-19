import {
  CompanyProfile,
  Product,
  Complaint,
  Customer,
  Invoice,
  Transaction,
} from './types';

const STORAGE_KEYS = {
  PROFILE: 'pctechno_profile_v1',
  PRODUCTS: 'pctechno_products_v1',
  COMPLAINTS: 'pctechno_complaints_v1',
  CUSTOMERS: 'pctechno_customers_v1',
  INVOICES: 'pctechno_invoices_v1',
  TRANSACTIONS: 'pctechno_transactions_v1',
  AUTH: 'pctechno_auth_session_v1',
  ADMIN_PASSWORD: 'pctechno_admin_pass_v1',
  LANGUAGE: 'pctechno_lang_v1',
};

export const DEFAULT_PROFILE: CompanyProfile = {
  name: 'PC TECHNO TUNER',
  tagline: 'IT Hardware, CCTV Surveillance, Laptop Repairs & AMC Solutions',
  location: 'Ahmedabad, Gujarat, India',
  address: 'Shop No. 12, Ground Floor, Technology Hub, Near C.G. Road',
  pincode: '382418',
  mobile: '7383871195',
  whatsapp: '917383871195',
  email: 'pctechnotuner@gmail.com',
  gstin: '24CGBPP3211M1ZJ',
  pan: 'CGBPP3211M',
  logoUrl: '',
  defaultGstRate: 18,
  bankName: 'State Bank of India (SBI)',
  accountNumber: '389201948201',
  ifscCode: 'SBIN0001248',
  upiId: '7383871195@okbizaxis',
  terms:
    '1. Goods once sold will be covered by respective manufacturer warranty.\n2. Please retain original invoice for claim verification.\n3. Physical damages or burns are not covered under warranty.',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Intel Core i5 12th Gen Business Desktop PC',
    category: 'Desktop Computers',
    brand: 'Custom Tuned / Intel',
    model: 'PTT-OFFICE-i5',
    specifications: 'Intel Core i5-12400 (6 Core), 16GB DDR4 RAM, 512GB NVMe SSD, H610 Motherboard, Zebronics Slim Cabinet with 450W SMPS, Windows 11 Pro',
    purchasePrice: 28500,
    sellingPrice: 34999,
    stockQuantity: 4,
    minStockAlert: 2,
    warrantyMonths: 36,
    imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&h=450&fit=crop',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'prod-002',
    name: 'Lenovo ThinkPad E14 Gen 5 Business Laptop',
    category: 'Laptops',
    brand: 'Lenovo',
    model: 'ThinkPad E14',
    specifications: 'AMD Ryzen 5 7530U, 16GB RAM, 512GB SSD, 14-inch WUXGA IPS Antiglare, Backlit Keyboard, Fingerprint Reader, 1.41kg, Win 11 Pro',
    purchasePrice: 47000,
    sellingPrice: 54500,
    stockQuantity: 3,
    minStockAlert: 2,
    warrantyMonths: 12,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=450&fit=crop',
    createdAt: '2026-03-05T11:30:00Z',
  },
  {
    id: 'prod-003',
    name: 'CP PLUS 4-Camera 2.4MP Full HD CCTV Surveillance Kit',
    category: 'CCTV Cameras and DVR/NVR',
    brand: 'CP PLUS',
    model: 'CP-UVR-0401E1-CS + 4 Bullet',
    specifications: '4 Channel 1080P DVR, 4x 2.4MP Outdoor Night Vision IR Bullet Cameras, 1TB Seagate Surveillance HDD, 4-Ch Power Supply, 90m 3+1 Cable & Connectors',
    purchasePrice: 7800,
    sellingPrice: 10999,
    stockQuantity: 6,
    minStockAlert: 2,
    warrantyMonths: 24,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=450&fit=crop',
    createdAt: '2026-03-08T09:15:00Z',
  },
  {
    id: 'prod-004',
    name: 'HP LaserJet Pro MFP M126nw All-in-One Wireless Printer',
    category: 'Printers and Scanners',
    brand: 'HP',
    model: 'M126nw',
    specifications: 'Print, Scan, Copy. Fast monochrome laser printing up to 20 ppm. Built-in Ethernet, Wi-Fi 802.11b/g/n, HP ePrint, Apple AirPrint, 150-sheet input tray',
    purchasePrice: 17200,
    sellingPrice: 20499,
    stockQuantity: 2,
    minStockAlert: 1,
    warrantyMonths: 12,
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=450&fit=crop',
    createdAt: '2026-03-10T14:20:00Z',
  },
  {
    id: 'prod-005',
    name: 'Logitech MK270r Wireless Keyboard & Mouse Combo',
    category: 'Computer Accessories',
    brand: 'Logitech',
    model: 'MK270r',
    specifications: '2.4GHz USB nano receiver, 10m wireless range, spill-resistant keyboard design, 8 multimedia hotkeys, 36-month keyboard and 12-month mouse battery life',
    purchasePrice: 1250,
    sellingPrice: 1650,
    stockQuantity: 14,
    minStockAlert: 4,
    warrantyMonths: 36,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=450&fit=crop',
    createdAt: '2026-03-12T16:00:00Z',
  },
  {
    id: 'prod-006',
    name: 'TP-Link Archer AX10 WiFi 6 Dual-Band Gigabit Router',
    category: 'Networking Products and Routers',
    brand: 'TP-Link',
    model: 'Archer AX10',
    specifications: 'Next-Gen 1.5 Gbps Speeds (1201 Mbps on 5 GHz + 300 Mbps on 2.4 GHz), Triple-Core 1.5GHz CPU, 4 Gigabit LAN ports, Beamforming & OFDMA tech',
    purchasePrice: 2800,
    sellingPrice: 3599,
    stockQuantity: 5,
    minStockAlert: 2,
    warrantyMonths: 36,
    imageUrl: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&h=450&fit=crop',
    createdAt: '2026-03-14T12:00:00Z',
  },
  {
    id: 'prod-007',
    name: 'Dell PowerEdge T150 Tower Server',
    category: 'Servers and Storage',
    brand: 'Dell Technologies',
    model: 'PowerEdge T150',
    specifications: 'Intel Xeon E-2314 (4 Cores), 32GB ECC DDR4 UDIMM RAM, 2x 2TB 7.2K SATA Enterprise HDD in RAID 1, iDRAC9 Basic, Dual Gigabit NIC, 300W Bronze PSU',
    purchasePrice: 85000,
    sellingPrice: 98900,
    stockQuantity: 1,
    minStockAlert: 1,
    warrantyMonths: 36,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=450&fit=crop',
    createdAt: '2026-03-15T15:30:00Z',
  },
  {
    id: 'prod-008',
    name: 'Quick Heal Total Security 2026 (1 User / 3 Years)',
    category: 'Firewall and Antivirus Software',
    brand: 'Quick Heal',
    model: 'Total Security 2026',
    specifications: 'Ransomware protection, advanced web security, parental control, banking protection, anti-phishing, safe banking & email security shield',
    purchasePrice: 1100,
    sellingPrice: 1650,
    stockQuantity: 20,
    minStockAlert: 5,
    warrantyMonths: 36,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=450&fit=crop',
    createdAt: '2026-03-16T10:10:00Z',
  },
  {
    id: 'prod-009',
    name: 'eSSL K90 Pro Fingerprint & RFID Time Attendance Machine',
    category: 'Biometric and Attendance Machines',
    brand: 'eSSL',
    model: 'K90 Pro with Battery',
    specifications: '800 Fingerprint capacity, 800 RFID Card capacity, 80,000 transaction log, built-in battery backup (4 hours), TCP/IP & USB Host, Excel report auto-export',
    purchasePrice: 4800,
    sellingPrice: 6499,
    stockQuantity: 3,
    minStockAlert: 1,
    warrantyMonths: 12,
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&h=450&fit=crop',
    createdAt: '2026-03-18T13:45:00Z',
  },
  {
    id: 'prod-010',
    name: 'Annual Maintenance Contract (AMC) - 10 Computers Package',
    category: 'Software and IT Services',
    brand: 'PC TECHNO TUNER AMC',
    model: 'AMC-BIZ-10',
    specifications: 'Comprehensive 12-month IT support for up to 10 computers: Monthly preventive maintenance, OS patching, virus removals, priority 2-hour on-site visit in Ahmedabad',
    purchasePrice: 4000,
    sellingPrice: 12000,
    stockQuantity: 99,
    minStockAlert: 0,
    warrantyMonths: 12,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=450&fit=crop',
    createdAt: '2026-03-20T17:00:00Z',
  },
  {
    id: 'prod-011',
    name: 'Microtek 1000VA / 600W Line Interactive UPS',
    category: 'Other Products',
    brand: 'Microtek',
    model: 'Legend 1000',
    specifications: 'Dual battery 12V 7Ah, auto voltage regulation (AVR), overload and short circuit protection, 30-40 mins backup for desktop and router during power cuts',
    purchasePrice: 4100,
    sellingPrice: 5199,
    stockQuantity: 4,
    minStockAlert: 2,
    warrantyMonths: 24,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=450&fit=crop',
    createdAt: '2026-03-22T08:30:00Z',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: 'Rajesh Patel',
    mobile: '9825012345',
    businessName: 'Patel Textiles & Fabrics',
    email: 'rajesh.patel@pateltextiles.in',
    address: 'B-304, Navrangpura Business Center, Ahmedabad — 380009',
    gstin: '24AAACP1234F1ZP',
    notes: 'Regular AMC client for office PCs and billing network.',
    createdAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'cust-002',
    name: 'Kiritbhai Shah',
    mobile: '9898054321',
    businessName: 'Shah Trading Corporation',
    email: 'kirit.shah@gmail.com',
    address: 'Near Maninagar Railway Station, Maninagar, Ahmedabad — 380008',
    notes: 'Installed 8 CP PLUS CCTV cameras at warehouse.',
    createdAt: '2026-02-02T14:20:00Z',
  },
  {
    id: 'cust-003',
    name: 'Hardik Mehta',
    mobile: '9727098765',
    businessName: 'Apex Graphic Studio',
    email: 'hardik@apexdesign.co',
    address: 'Shop 14, Vastrapur Lake Road, Vastrapur, Ahmedabad — 380015',
    notes: 'Purchased customized i7 editing rig and Dell UltraSharp monitors.',
    createdAt: '2026-02-18T10:15:00Z',
  },
  {
    id: 'cust-004',
    name: 'Pooja Varma',
    mobile: '7383871195',
    businessName: 'Varma Diagnostics Clinic',
    email: 'pooja.clinic@varmahealth.org',
    address: 'GIDC Vatva Phase 4, Ahmedabad — 382445',
    notes: 'Inquired about attendance machine and antivirus renewal.',
    createdAt: '2026-03-10T09:40:00Z',
  },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'PCT-COMP-2026-101',
    customerName: 'Rajesh Patel',
    mobile: '9825012345',
    businessName: 'Patel Textiles & Fabrics',
    category: 'Printers and Scanners',
    brandModel: 'HP LaserJet M126nw',
    serialNo: 'CNB9K45821',
    purchaseDate: '2025-08-10',
    warrantyStatus: 'Under Warranty',
    complaintType: 'Printer Problem',
    description: 'Printer shows paper jam error even when paper tray is empty, and network wireless connection keeps dropping frequently during invoice prints.',
    serviceLocation: 'B-304, Navrangpura Business Center, Ahmedabad — 380009',
    preferredDate: '2026-03-24',
    status: 'In Progress',
    assignedTechnician: 'Amit Parmar (Sr. Hardware Eng.)',
    visitDate: '2026-03-24',
    serviceCharges: 0,
    partsUsed: 'Roller kit cleaned',
    internalNotes: 'Under warranty replacement done for pickup roller. Wi-Fi IP assigned static in router DHCP.',
    createdAt: '2026-03-22T09:30:00Z',
    updatedAt: '2026-03-23T11:00:00Z',
  },
  {
    id: 'PCT-COMP-2026-102',
    customerName: 'Kiritbhai Shah',
    mobile: '9898054321',
    businessName: 'Shah Trading Corporation',
    category: 'CCTV Cameras and DVR/NVR',
    brandModel: 'CP PLUS 4CH DVR',
    serialNo: 'CP22081982',
    purchaseDate: '2025-04-12',
    warrantyStatus: 'Out of Warranty',
    complaintType: 'Camera Offline',
    description: 'Channel 3 camera in front gate is displaying black screen with video loss icon. Other 3 cameras are recording fine.',
    serviceLocation: 'Near Maninagar Railway Station, Maninagar, Ahmedabad — 380008',
    preferredDate: '2026-03-25',
    status: 'New',
    assignedTechnician: '',
    visitDate: '',
    serviceCharges: 350,
    partsUsed: '',
    internalNotes: 'Check 12V 2A power supply adapter or BNC copper line continuity.',
    createdAt: '2026-03-23T14:10:00Z',
    updatedAt: '2026-03-23T14:10:00Z',
  },
  {
    id: 'PCT-COMP-2026-100',
    customerName: 'Hardik Mehta',
    mobile: '9727098765',
    businessName: 'Apex Graphic Studio',
    category: 'Desktop Computers',
    brandModel: 'Asus Workstation Desktop',
    serialNo: 'AS7839210',
    purchaseDate: '2025-09-01',
    warrantyStatus: 'Under Warranty',
    complaintType: 'Hardware Problem',
    description: 'System automatically reboots after 20 minutes of rendering in Adobe Premiere. High fan noise.',
    serviceLocation: 'Shop 14, Vastrapur Lake Road, Vastrapur, Ahmedabad — 380015',
    preferredDate: '2026-03-19',
    status: 'Resolved',
    assignedTechnician: 'Dhaval Joshi',
    visitDate: '2026-03-20',
    serviceCharges: 500,
    partsUsed: 'Thermal Grizzly paste repaste & cabinet intake filter cleanup',
    internalNotes: 'CPU cooler pump cable was loose. Repasted thermal paste. Temperature now stable at 62C under 100% load.',
    createdAt: '2026-03-19T08:15:00Z',
    updatedAt: '2026-03-20T17:45:00Z',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNo: 'PCT-INV-2026-089',
    invoiceDate: '2026-03-15',
    customerName: 'Patel Textiles & Fabrics',
    customerMobile: '9825012345',
    customerBusiness: 'Patel Textiles & Fabrics',
    customerAddress: 'B-304, Navrangpura Business Center, Ahmedabad — 380009',
    customerGstin: '24AAACP1234F1ZP',
    items: [
      {
        productId: 'prod-001',
        description: 'Intel Core i5 12th Gen Business Desktop PC (PTT-OFFICE-i5)',
        category: 'Desktop Computers',
        quantity: 1,
        unitPrice: 29660.17, // before 18% GST = 34,999 total
        lineTotal: 29660.17,
      },
      {
        productId: 'prod-005',
        description: 'Logitech MK270r Wireless Keyboard & Mouse Combo',
        category: 'Computer Accessories',
        quantity: 1,
        unitPrice: 1398.31, // before 18% GST = 1,650 total
        lineTotal: 1398.31,
      },
    ],
    subtotal: 31058.48,
    taxRate: 18,
    taxAmount: 5590.52,
    discount: 0,
    totalAmount: 36649.0,
    amountPaid: 36649.0,
    balanceDue: 0.0,
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Delivered and configured on-site at Navrangpura office. 3 Year warranty on CPU.',
    createdAt: '2026-03-15T16:00:00Z',
  },
  {
    id: 'inv-002',
    invoiceNo: 'PCT-INV-2026-090',
    invoiceDate: '2026-03-18',
    customerName: 'Kiritbhai Shah',
    customerMobile: '9898054321',
    customerBusiness: 'Shah Trading Corporation',
    customerAddress: 'Near Maninagar Railway Station, Maninagar, Ahmedabad — 380008',
    items: [
      {
        productId: 'prod-003',
        description: 'CP PLUS 4-Camera 2.4MP Full HD CCTV Surveillance Kit with 1TB HDD',
        category: 'CCTV Cameras and DVR/NVR',
        quantity: 1,
        unitPrice: 9321.19, // before 18% = 10,999
        lineTotal: 9321.19,
      },
    ],
    subtotal: 9321.19,
    taxRate: 18,
    taxAmount: 1677.81,
    discount: 0,
    totalAmount: 10999.0,
    amountPaid: 6000.0,
    balanceDue: 4999.0,
    paymentStatus: 'Partial',
    paymentMethod: 'UPI',
    notes: 'Advance Rs 6,000 received via GPay. Balance Rs 4,999 to be paid after camera wiring completion.',
    createdAt: '2026-03-18T18:30:00Z',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tr-001',
    type: 'INCOME',
    category: 'Product sales',
    amount: 36649.0,
    date: '2026-03-15',
    paymentMethod: 'Bank Transfer',
    partyName: 'Patel Textiles & Fabrics',
    referenceId: 'PCT-INV-2026-089',
    notes: 'Full payment for Desktop PC + Wireless Combo',
    createdAt: '2026-03-15T16:05:00Z',
  },
  {
    id: 'tr-002',
    type: 'INCOME',
    category: 'CCTV installation and service income',
    amount: 6000.0,
    date: '2026-03-18',
    paymentMethod: 'UPI',
    partyName: 'Kiritbhai Shah',
    referenceId: 'PCT-INV-2026-090',
    notes: 'Advance payment for 4-Cam CCTV setup',
    createdAt: '2026-03-18T18:35:00Z',
  },
  {
    id: 'tr-003',
    type: 'INCOME',
    category: 'Computer and laptop repair income',
    amount: 500.0,
    date: '2026-03-20',
    paymentMethod: 'Cash',
    partyName: 'Hardik Mehta',
    referenceId: 'PCT-COMP-2026-100',
    notes: 'Service charges for workstation heating fix',
    createdAt: '2026-03-20T17:50:00Z',
  },
  {
    id: 'tr-004',
    type: 'EXPENSE',
    category: 'Product purchases',
    amount: 18500.0,
    date: '2026-03-10',
    paymentMethod: 'Bank Transfer',
    partyName: 'Redington India Ltd (Distributor)',
    referenceId: 'PO-RD-982',
    notes: 'Stock purchase: HP toner cartridges & Kingston SSDs',
    createdAt: '2026-03-10T11:00:00Z',
  },
  {
    id: 'tr-005',
    type: 'EXPENSE',
    category: 'Shop expenses',
    amount: 2800.0,
    date: '2026-03-12',
    paymentMethod: 'UPI',
    partyName: 'Stationery & Packaging Ahmedabad',
    notes: 'Bubble wrap, invoice paper rolls, packing tape',
    createdAt: '2026-03-12T13:30:00Z',
  },
  {
    id: 'tr-006',
    type: 'EXPENSE',
    category: 'Technician charges',
    amount: 4500.0,
    date: '2026-03-16',
    paymentMethod: 'UPI',
    partyName: 'Amit Parmar (Freelance CCTV tech)',
    notes: 'Cable pulling charges for Maninagar warehouse site',
    createdAt: '2026-03-16T19:00:00Z',
  },
  {
    id: 'tr-007',
    type: 'EXPENSE',
    category: 'Internet and electricity',
    amount: 2200.0,
    date: '2026-03-17',
    paymentMethod: 'UPI',
    partyName: 'Torrent Power Ahmedabad + GTPL Fiber',
    notes: 'Monthly utility bills for workshop',
    createdAt: '2026-03-17T10:00:00Z',
  },
];

// Helper to get from storage or seed defaults
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Storage Interface
export const storage = {
  getProfile: (): CompanyProfile => getStorageItem(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE),
  setProfile: (profile: CompanyProfile) => setStorageItem(STORAGE_KEYS.PROFILE, profile),

  getProducts: (): Product[] => getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  setProducts: (products: Product[]) => setStorageItem(STORAGE_KEYS.PRODUCTS, products),

  getComplaints: (): Complaint[] => getStorageItem(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS),
  setComplaints: (complaints: Complaint[]) => setStorageItem(STORAGE_KEYS.COMPLAINTS, complaints),

  getCustomers: (): Customer[] => getStorageItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  setCustomers: (customers: Customer[]) => setStorageItem(STORAGE_KEYS.CUSTOMERS, customers),

  getInvoices: (): Invoice[] => getStorageItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES),
  setInvoices: (invoices: Invoice[]) => setStorageItem(STORAGE_KEYS.INVOICES, invoices),

  getTransactions: (): Transaction[] => getStorageItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
  setTransactions: (transactions: Transaction[]) => setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions),

  getLanguage: (): 'en' | 'hi' | 'gu' => getStorageItem(STORAGE_KEYS.LANGUAGE, 'en'),
  setLanguage: (lang: 'en' | 'hi' | 'gu') => setStorageItem(STORAGE_KEYS.LANGUAGE, lang),

  isAdminLoggedIn: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },
  setAdminLoggedIn: (status: boolean) => {
    localStorage.setItem(STORAGE_KEYS.AUTH, status ? 'true' : 'false');
  },

  getAdminPassword: (): string => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || 'admin123';
  },
  setAdminPassword: (newPass: string) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPass);
  },

  exportBackupJson: () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      companyProfile: storage.getProfile(),
      products: storage.getProducts(),
      complaints: storage.getComplaints(),
      customers: storage.getCustomers(),
      invoices: storage.getInvoices(),
      transactions: storage.getTransactions(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `PC_TECHNO_TUNER_BACKUP_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  restoreBackupJson: (jsonData: any): boolean => {
    try {
      if (jsonData.companyProfile) storage.setProfile(jsonData.companyProfile);
      if (Array.isArray(jsonData.products)) storage.setProducts(jsonData.products);
      if (Array.isArray(jsonData.complaints)) storage.setComplaints(jsonData.complaints);
      if (Array.isArray(jsonData.customers)) storage.setCustomers(jsonData.customers);
      if (Array.isArray(jsonData.invoices)) storage.setInvoices(jsonData.invoices);
      if (Array.isArray(jsonData.transactions)) storage.setTransactions(jsonData.transactions);
      return true;
    } catch (err) {
      console.error('Backup restore failed:', err);
      return false;
    }
  },

  exportToCSV: (filename: string, rows: (string | number)[][]) => {
    const processRow = (row: (string | number)[]) => {
      let finalVal = '';
      for (let j = 0; j < row.length; j++) {
        let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) result = `"${result}"`;
        if (j > 0) finalVal += ',';
        finalVal += result;
      }
      return finalVal + '\n';
    };

    let csvFile = '';
    for (let i = 0; i < rows.length; i++) {
      csvFile += processRow(rows[i]);
    }

    const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
