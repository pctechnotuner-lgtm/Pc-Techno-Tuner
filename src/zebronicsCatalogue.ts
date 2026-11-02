import { Product } from './types';

// Zebronics models verified against Zebronics Support / official store listings.
// Stock and prices are intentionally zero: these are enquiry catalogue entries,
// not a claim that PC TECHNO TUNER currently holds inventory.
const image = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=450&fit=crop';
const now = '2026-11-02T00:00:00.000Z';

const entries: Array<[string, string, string, string, string]> = [
  ['Keyboard','Zebronics','K5002MW','Bluetooth multimedia keyboard; exact variant/color to be confirmed.','Computer Accessories'],
  ['Keyboard','Zebronics','K4001M Nitro Plus','Mechanical USB wired keyboard.','Computer Accessories'],
  ['Keyboard','Zebronics','K6000MW Nitro Pro','Mechanical USB wired keyboard.','Computer Accessories'],
  ['Keyboard','Zebronics','Max Ninja 104W','104-key mechanical keyboard; wireless/rechargeable.','Computer Accessories'],
  ['Keyboard','Zebronics','Magnus','Multimedia USB keyboard.','Computer Accessories'],
  ['Keyboard & Mouse Combo','Zebronics','Companion 202','Wireless keyboard and mouse combo; 2.4GHz.','Computer Accessories'],
  ['Keyboard & Mouse Combo','Zebronics','Companion 5002','Wireless keyboard and mouse combo; Bluetooth + 2.4GHz.','Computer Accessories'],
  ['Keyboard & Mouse Combo','Zebronics','Companion 500','Wireless keyboard and mouse combo.','Computer Accessories'],
  ['Mouse','Zebronics','Jaguar-V','2.4GHz wireless optical mouse.','Computer Accessories'],
  ['Mouse','Zebronics','Nexa','2.4GHz wireless optical mouse; color variant to confirm.','Computer Accessories'],
  ['Mouse','Zebronics','Panther','2.4GHz wireless optical mouse; color variant to confirm.','Computer Accessories'],
  ['Monitor','Zebronics','A27FHD 75HZ 27','27-inch Full HD monitor with HDMI; confirm exact panel/refresh variant.','Computer Accessories'],
  ['Gaming Monitor','Zebronics','N25A IGM 100','Gaming monitor; 180Hz series listing.','Computer Accessories'],
  ['Gaming Monitor','Zebronics','N24A IGM 101','Gaming monitor; 180Hz series listing.','Computer Accessories'],
  ['Gaming Monitor','Zebronics','N27A IGM 102','Gaming monitor; 180Hz series listing.','Computer Accessories'],
  ['Gaming Monitor','Zebronics','N27B IGM 103','Curved gaming monitor; 180Hz series listing.','Computer Accessories'],
  ['Gaming Cabinet','Zebronics','Argon 2','mATX / ITX gaming cabinet; confirm color and stock.','Computer Accessories'],
  ['Slim Cabinet','Zebronics','Trim','Slim cabinet; mATX / Mini-ITX support.','Computer Accessories'],
  ['UPS','Zebronics','U1205','Line-interactive UPS with AVR.','Other Products'],
  ['UPS','Zebronics','U1200','Line-interactive UPS.','Other Products'],
  ['UPS','Zebronics','U1201','Line-interactive UPS.','Other Products'],
  ['UPS','Zebronics','U725','Line-interactive UPS.','Other Products'],
  ['Micro Load UPS','Zebronics','MLS1255','Micro-load UPS; verify output/battery configuration.','Other Products'],
  ['Router UPS','Zebronics','Router UPS Series','Router backup power range; select exact model after supplier confirmation.','Other Products'],
  ['Motherboard','Zebronics','ZEB-G41','Intel G41 chipset motherboard; legacy model, availability confirmation required.','Desktop Computers'],
  ['Motherboard','Zebronics','ZEB-G41 D3','G41 DDR3 motherboard; legacy model, availability confirmation required.','Desktop Computers'],
  ['Motherboard','Zebronics','ZEB-H55 / ZEB-Z55','H55 chipset motherboard family; legacy model, availability confirmation required.','Desktop Computers'],
  ['Motherboard','Zebronics','ZEB-H61','H61 chipset motherboard family; exact revision/socket to confirm.','Desktop Computers'],
  ['Motherboard','Zebronics','ZEB-H81','H81 chipset motherboard family; exact revision/socket to confirm.','Desktop Computers'],
  ['Motherboard','Zebronics','ZEB-Z41 GM45','Z41 chipset motherboard; legacy model, availability confirmation required.','Desktop Computers'],
  ['Motherboard','Zebronics','H310 / H110 D4','H310 / H110 D4 motherboard family; exact model and stock to confirm.','Desktop Computers'],
  ['Motherboard','Zebronics','H510 / H610','H510 / H610 motherboard family; exact model and stock to confirm.','Desktop Computers'],
  ['RAM','Zebronics','Desktop Memory Module','Desktop RAM range; DDR generation/capacity to confirm.','Computer Accessories'],
  ['SSD','Zebronics','SSD Hard Disk Series','SSD range; capacity/interface to confirm.','Servers and Storage'],
  ['Power Supply (SMPS)','Zebronics','Power Supply Series','Desktop power supply range; wattage/connector configuration to confirm.','Computer Accessories'],
  ['Graphics Card','Zebronics','Graphics Card Series','Graphics card range; chipset and memory configuration to confirm.','Computer Accessories'],
  ['Webcam','Zebronics','Zeb Sharp','1080p Full HD webcam with autofocus and tripod support.','Computer Accessories'],
  ['USB Hub','Zebronics','USB Mini Hub Series','USB hub range; port count/interface to confirm.','Computer Accessories'],
];


const additionalProducts: Product[] = [
  // GIGABYTE motherboards — official model specifications / variants.
  {
    id: 'gigabyte-b760m-ds3h-ax-ddr5', name: 'GIGABYTE B760M DS3H AX DDR5 Motherboard',
    category: 'Desktop Computers', brand: 'GIGABYTE', model: 'B760M DS3H AX (DDR5)',
    specifications: 'Intel B760 chipset and LGA1700 socket; supports compatible 14th, 13th and 12th Gen Intel Core processors. DDR5 memory (4 DIMM slots), dual-channel; dual PCIe 4.0 M.2; Wi-Fi 6E and 2.5GbE LAN. Confirm board revision, BIOS and CPU compatibility before order.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://static.gigabyte.com/StaticFile/Image/Global/38746857c457e1b5197902af9cdd1ba8/ProductRemoveBg/33475',
    createdAt: now,
  },
  {
    id: 'gigabyte-b760m-ds3h-ax-ddr4', name: 'GIGABYTE B760M DS3H AX DDR4 Motherboard',
    category: 'Desktop Computers', brand: 'GIGABYTE', model: 'B760M DS3H AX DDR4',
    specifications: 'Intel B760 chipset and LGA1700 socket; supports compatible 14th, 13th and 12th Gen Intel Core processors. DDR4 memory (4 DIMM slots), dual-channel; PCIe 4.0 M.2 storage; Wi-Fi 6E and 2.5GbE LAN. Confirm board revision, BIOS and CPU compatibility before order.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/817ff8be-c933-4c34-a3e1-a69f4a9e890a.jpg',
    createdAt: now,
  },
  // Biometric attendance devices — official manufacturer specifications.
  {
    id: 'zkteco-mb20', name: 'ZKTeco MB20 Face & Fingerprint Attendance Machine',
    category: 'Biometric and Attendance Machines', brand: 'ZKTeco', model: 'MB20',
    specifications: 'Face, fingerprint, RFID card and password verification; up to 500 fingerprints, 1,000 cards/users and 50,000 records; 2.8-inch TFT display; TCP/IP, USB Host and optional Wi-Fi; access-control relay.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://images.openai.com/static-rsc-4/zf1VjO3dfq1C8KERaM0mIcwd8589dZ6xzoBvlk7bhaXyGMb4orfYmKlb4iv5EVu_6tv26Svt86UkiYyCzBFEvHCp_Bjizli890yB5zXbu5STOVXAqyRooGlMjiMplyUXUr7X6PDPYSJnjaWcb0MmSZaJqIUUcvu5wUCaD791D6k?purpose=inline',
    createdAt: now,
  },
  {
    id: 'essl-k90-pro', name: 'eSSL K90 Pro Fingerprint Attendance Machine',
    category: 'Biometric and Attendance Machines', brand: 'eSSL', model: 'K90 Pro',
    specifications: '800 fingerprint capacity, 800 card capacity, 80,000 transaction storage; TCP/IP and USB Host; inbuilt battery backup; 500 DPI optical sensor; eTimeTrackLite support.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://www.esslsecurity.com/storage/app/media/fingerprint/K90-Pro.jpg',
    createdAt: now,
  },
  {
    id: 'essl-f22-id-wifi', name: 'eSSL F22 ID Wi-Fi Attendance & Access Control',
    category: 'Biometric and Attendance Machines', brand: 'eSSL', model: 'F22 ID Wi-Fi',
    specifications: 'Fingerprint-based time-attendance and access-control terminal with Wi-Fi connectivity; supports attendance management and door access functions on supported configurations. Confirm fingerprint/card capacity, RFID format, communication options and firmware by exact F22 ID Wi-Fi variant.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://www.esslsecurity.com/storage/app/media/fingerprint/K90-Pro.jpg',
    createdAt: now,
  },
  // Network firewall appliances — quote-only catalogue listings.
  {
    id: 'fortinet-fortigate-40f', name: 'Fortinet FortiGate 40F Next-Generation Firewall',
    category: 'Firewall and Antivirus Software', brand: 'Fortinet', model: 'FG-40F',
    specifications: 'Next-generation firewall with FortiOS security, VPN (IPsec/SSL VPN subject to model/licensing), security policies, SD-WAN and network protection. Datasheet performance figures: up to 1 Gbps firewall throughput, 800 Mbps IPS and 600 Mbps threat protection. FortiGuard subscriptions and services are separate; confirm exact FG-40F variant.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://images.openai.com/static-rsc-4/-AC13FgfP6D1D339Hg3FR5oy-30NZGKMd0ZO2hbafEZkyQm7tQHd7GiNga1iJSGfxskv47d9H6DtWtTEPIB1uO3iPX7ePSssGB8q8gr6BI74oMs_GXA-kFIdDT_7GbHB1g4Mj2kXL5ukP38XPfFQbq-Rn4Hq1ezsGBqY55l--T0?purpose=inline',
    createdAt: now,
  },
  {
    id: 'fortinet-fortigate-60f', name: 'Fortinet FortiGate 60F Next-Generation Firewall',
    category: 'Firewall and Antivirus Software', brand: 'Fortinet', model: 'FG-60F',
    specifications: 'Next-generation firewall for business networks with FortiOS security policies, VPN, routing, SD-WAN and network protection features. Throughput and interfaces depend on exact hardware variant; FortiGuard subscriptions/services are separate. Confirm FG-60F SKU.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://www.fortinet.com/content/dam/fortinet/assets/images/products/fortigate-40f.png',
    createdAt: now,
  },
  {
    id: 'sophos-xgs-87', name: 'Sophos XGS 87 Firewall Appliance',
    category: 'Firewall and Antivirus Software', brand: 'Sophos', model: 'XGS 87',
    specifications: 'Desktop next-generation firewall; 4 x Gigabit Ethernet copper ports and 1 x SFP; firewall throughput up to 3,850 Mbps and IPS throughput up to 1,200 Mbps (manufacturer datasheet). Supports firewall policies, VPN and network security features; confirm subscription bundle and lifecycle/availability before order.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=450&fit=crop',
    createdAt: now,
  },
,

  // Printers — representative Canon, HP and Epson models; confirm regional variant.
  {
    id: 'canon-pixma-g3770', name: 'Canon PIXMA G3770 MegaTank Wi-Fi Printer', category: 'Printers and Scanners', brand: 'Canon', model: 'PIXMA G3770',
    specifications: 'Colour ink-tank all-in-one printer: print, scan and copy; Wi-Fi connectivity; suitable for home and small-office use. Confirm current regional bundle and ink compatibility.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'canon-lbp6030b', name: 'Canon imageCLASS LBP6030B Mono Laser Printer', category: 'Printers and Scanners', brand: 'Canon', model: 'LBP6030B',
    specifications: 'Monochrome laser single-function printer; USB connectivity; compact personal / small-office printing. Check operating-system and toner availability.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'canon-mf3010', name: 'Canon imageCLASS MF3010 Mono Laser MFP', category: 'Printers and Scanners', brand: 'Canon', model: 'MF3010',
    specifications: 'Monochrome laser all-in-one: print, scan and copy; USB connection. Confirm current availability and compatible cartridge.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'hp-smart-tank-585', name: 'HP Smart Tank 585 All-in-One Printer', category: 'Printers and Scanners', brand: 'HP', model: 'Smart Tank 585',
    specifications: 'Colour ink-tank all-in-one printer with print, scan and copy; Wi-Fi and mobile printing features. Confirm exact connectivity/region variant.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'hp-laserjet-mfp-m236sdw', name: 'HP LaserJet MFP M236sdw Mono Printer', category: 'Printers and Scanners', brand: 'HP', model: 'LaserJet MFP M236sdw',
    specifications: 'Monochrome laser multifunction printer with print, scan and copy; automatic two-sided printing and wireless/network connectivity. Verify exact SKU before order.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'epson-ecotank-l3250', name: 'Epson EcoTank L3250 Wi-Fi All-in-One Printer', category: 'Printers and Scanners', brand: 'Epson', model: 'EcoTank L3250',
    specifications: 'Colour ink-tank all-in-one printer: print, scan and copy; Wi-Fi and Wi-Fi Direct. Confirm regional variant and included ink set.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'epson-ecotank-l3210', name: 'Epson EcoTank L3210 All-in-One Printer', category: 'Printers and Scanners', brand: 'Epson', model: 'EcoTank L3210',
    specifications: 'Colour ink-tank all-in-one printer: print, scan and copy; USB connectivity. Confirm exact regional package and ink compatibility.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=450&fit=crop', createdAt: now,
  },

  // Laptop catalogue — configurations are selectable quote options, not live stock claims.
  {
    id: 'lenovo-v15-g4', name: 'Lenovo V15 G4 Business Laptop', category: 'Laptops', brand: 'Lenovo', model: 'V15 G4',
    specifications: 'Configuration options: Intel Core i3 / i5 or AMD Ryzen 3 / 5 (model-dependent); 8GB / 16GB RAM; 256GB / 512GB NVMe SSD; 15.6-inch Full HD display; Windows 11. Exact CPU, RAM upgradeability and ports depend on MTM.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'lenovo-thinkpad-e14-gen6', name: 'Lenovo ThinkPad E14 Gen 6 Business Laptop', category: 'Laptops', brand: 'Lenovo', model: 'ThinkPad E14 Gen 6',
    specifications: 'Configuration options vary by platform: Intel Core Ultra 5 / Ultra 7 or AMD Ryzen 5 / 7; 16GB / 32GB RAM; 512GB / 1TB SSD; 14-inch WUXGA display; Windows 11 Pro options. Confirm exact MTM.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'hp-15-fd-series', name: 'HP 15 Laptop (15-fd Series)', category: 'Laptops', brand: 'HP', model: '15-fd Series',
    specifications: 'Configuration options: Intel Core i3 / i5 / i7 depending on SKU; 8GB / 16GB RAM; 512GB SSD options; 15.6-inch Full HD display; Windows 11. Confirm processor generation, display and ports by product number.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'hp-probook-440-g11', name: 'HP ProBook 440 G11 Business Laptop', category: 'Laptops', brand: 'HP', model: 'ProBook 440 G11',
    specifications: 'Business configuration options: Intel Core Ultra 5 / Ultra 7; 16GB / 32GB RAM; 512GB / 1TB SSD; 14-inch WUXGA display; Windows 11 Pro options. Exact panel, memory and WWAN options depend on SKU.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'dell-inspiron-15-3530', name: 'Dell Inspiron 15 3530 Laptop', category: 'Laptops', brand: 'Dell', model: 'Inspiron 15 3530',
    specifications: 'Configuration options vary: Intel Core i3 / i5 / i7; 8GB / 16GB RAM; 512GB SSD options; 15.6-inch Full HD display; Windows 11. Confirm CPU generation and display refresh by SKU.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'dell-latitude-3450', name: 'Dell Latitude 3450 Business Laptop', category: 'Laptops', brand: 'Dell', model: 'Latitude 3450',
    specifications: 'Business configuration options: Intel Core i5 / i7 (SKU-dependent); 8GB / 16GB / 32GB RAM; 512GB / 1TB SSD; 14-inch Full HD display; Windows 11 Pro options. Confirm exact service tag configuration.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'asus-vivobook-15-x1504', name: 'ASUS Vivobook 15 Laptop', category: 'Laptops', brand: 'ASUS', model: 'Vivobook 15 X1504',
    specifications: 'Configuration options: Intel Core i3 / i5 / i7 depending on SKU; 8GB / 16GB RAM; 512GB SSD; 15.6-inch Full HD display; Windows 11. Confirm exact CPU suffix, RAM and display variant.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'acer-aspire-lite-al15', name: 'Acer Aspire Lite AL15 Laptop', category: 'Laptops', brand: 'Acer', model: 'Aspire Lite AL15 Series',
    specifications: 'Configuration options vary by SKU: Intel Core i3 / i5 or AMD Ryzen 5; 8GB / 16GB RAM; 512GB SSD; 15.6-inch Full HD display; Windows 11. Confirm processor generation and exact AL15 model number.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop', createdAt: now,
  },

  // Dell, HP and Logitech mouse options.
  {
    id: 'dell-ms116', name: 'Dell Optical Mouse', category: 'Computer Accessories', brand: 'Dell', model: 'MS116',
    specifications: 'Wired USB optical mouse; 1000 DPI; 3 buttons; ambidextrous design. Confirm color/packaging.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'hp-150-wired-mouse', name: 'HP 150 Wired Mouse', category: 'Computer Accessories', brand: 'HP', model: '150',
    specifications: 'Wired USB optical mouse; 3-button design with scroll wheel; check exact regional model and DPI specification.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'logitech-b100', name: 'Logitech B100 Optical USB Mouse', category: 'Computer Accessories', brand: 'Logitech', model: 'B100',
    specifications: 'Wired USB optical mouse; 800 DPI; 3 buttons; plug-and-play.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'logitech-m185', name: 'Logitech M185 Wireless Mouse', category: 'Computer Accessories', brand: 'Logitech', model: 'M185',
    specifications: '2.4GHz wireless optical mouse with USB nano receiver; compact ambidextrous shape; battery life depends on usage.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=450&fit=crop', createdAt: now,
  },

  // Lenovo ThinkSystem server range.
  {
    id: 'lenovo-thinksystem-st50-v3', name: 'Lenovo ThinkSystem ST50 V3 Tower Server', category: 'Servers and Storage', brand: 'Lenovo', model: 'ThinkSystem ST50 V3',
    specifications: 'Entry tower server platform; Intel Xeon E-2400 series / selected Intel Pentium processor options by configuration; ECC UDIMM memory options; SATA storage; RAID and drive-bay options depend on CTO configuration. Quote with exact CPU, RAM, disks and RAID.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'lenovo-thinksystem-st250-v3', name: 'Lenovo ThinkSystem ST250 V3 Tower Server', category: 'Servers and Storage', brand: 'Lenovo', model: 'ThinkSystem ST250 V3',
    specifications: 'Tower server platform for SMB workloads; Intel Xeon E-2400 family options; ECC memory; hot-swap / non-hot-swap drive-bay and RAID options depend on configuration. Confirm supported CPU, memory and drive kit by machine type.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'lenovo-thinksystem-sr250-v3', name: 'Lenovo ThinkSystem SR250 V3 Rack Server', category: 'Servers and Storage', brand: 'Lenovo', model: 'ThinkSystem SR250 V3',
    specifications: '1U rack server platform; Intel Xeon E-2400 family options; ECC memory; storage controller, drive-bay, RAID and power options depend on CTO configuration. Confirm machine type and supported components before quote.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=450&fit=crop', createdAt: now,
  },
  {
    id: 'lenovo-thinksystem-sr650-v3', name: 'Lenovo ThinkSystem SR650 V3 Rack Server', category: 'Servers and Storage', brand: 'Lenovo', model: 'ThinkSystem SR650 V3',
    specifications: '2U enterprise rack server platform; dual-socket 4th/5th Gen Intel Xeon Scalable processor options (platform/SKU dependent); DDR5 memory; NVMe/SAS/SATA storage and RAID options. Configure CPU, RAM, disks, network and support to requirement.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0, imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=450&fit=crop', createdAt: now,
  },

];

export const ZEBRONICS_CATALOGUE: Product[] = [...entries.map(([name, brand, model, specifications, category], index) => ({
  id: `zebronics-${String(index + 1).padStart(3, '0')}`,
  name: `Zebronics ${name}`,
  category: category as Product['category'],
  brand,
  model,
  specifications: `${specifications} Catalogue listing only — confirm current availability before order.`,
  purchasePrice: 0,
  sellingPrice: 0,
  stockQuantity: 0,
  minStockAlert: 0,
  warrantyMonths: 0,
  imageUrl: image,
  createdAt: now,
})), ...additionalProducts.map((product) => ({
  ...product,
  specifications: `${product.specifications} Catalogue listing only — confirm current availability before order.`,
}))];
