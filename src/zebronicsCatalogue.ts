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
    specifications: 'Intel B760 chipset, LGA1700 socket; supports 14th/13th/12th Gen Intel Core processors; 4 DDR5 DIMM slots, dual-channel; 2 PCIe 4.0 M.2 connectors; Wi-Fi 6E and 2.5GbE LAN. Check revision and CPU/RAM compatibility before order.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://static.gigabyte.com/StaticFile/Image/Global/38746857c457e1b5197902af9cdd1ba8/ProductRemoveBg/33475',
    createdAt: now,
  },
  {
    id: 'gigabyte-b760m-ds3h-ax-ddr4', name: 'GIGABYTE B760M DS3H AX DDR4 Motherboard',
    category: 'Desktop Computers', brand: 'GIGABYTE', model: 'B760M DS3H AX DDR4',
    specifications: 'Intel B760 chipset, LGA1700 socket; supports 14th/13th/12th Gen Intel Core processors; 4 DDR4 DIMM slots, dual-channel; PCIe 4.0 M.2 storage; Wi-Fi 6E and 2.5GbE LAN. Check revision and CPU/RAM compatibility before order.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://static.gigabyte.com/StaticFile/Image/Global/38746857c457e1b5197902af9cdd1ba8/ProductRemoveBg/33475',
    createdAt: now,
  },
  // Biometric attendance devices — official manufacturer specifications.
  {
    id: 'zkteco-mb20', name: 'ZKTeco MB20 Face & Fingerprint Attendance Machine',
    category: 'Biometric and Attendance Machines', brand: 'ZKTeco', model: 'MB20',
    specifications: 'Face, fingerprint, RFID card and password verification; up to 500 fingerprints, 1,000 cards/users and 50,000 records; 2.8-inch TFT display; TCP/IP, USB Host and optional Wi-Fi; access-control relay.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://zktecoua.com/files/MB20.png',
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
    specifications: 'Fingerprint time-attendance and access-control terminal with Wi-Fi; verify exact card, capacity and firmware variant with supplier.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://www.esslsecurity.com/storage/app/media/fingerprint/K90-Pro.jpg',
    createdAt: now,
  },
  // Network firewall appliances — quote-only catalogue listings.
  {
    id: 'fortinet-fortigate-40f', name: 'Fortinet FortiGate 40F Next-Generation Firewall',
    category: 'Firewall and Antivirus Software', brand: 'Fortinet', model: 'FG-40F',
    specifications: 'Next-generation firewall with integrated SD-WAN and FortiOS security; branch-office appliance; 1 Gbps firewall throughput, 800 Mbps IPS and 600 Mbps threat protection (datasheet figures; subscription/services sold separately).',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://www.fortinet.com/content/dam/fortinet/assets/images/products/fortigate-40f.png',
    createdAt: now,
  },
  {
    id: 'fortinet-fortigate-60f', name: 'Fortinet FortiGate 60F Next-Generation Firewall',
    category: 'Firewall and Antivirus Software', brand: 'Fortinet', model: 'FG-60F',
    specifications: 'Next-generation firewall appliance for business networks; security policies, VPN and network protection through FortiOS; FortiGuard subscriptions are separate and configuration-dependent.',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://www.fortinet.com/content/dam/fortinet/assets/images/products/fortigate-40f.png',
    createdAt: now,
  },
  {
    id: 'sophos-xgs-87', name: 'Sophos XGS 87 Firewall Appliance',
    category: 'Firewall and Antivirus Software', brand: 'Sophos', model: 'XGS 87',
    specifications: 'Desktop next-generation firewall; 4 x Gigabit Ethernet copper ports and 1 x SFP; firewall throughput up to 3,850 Mbps and IPS throughput up to 1,200 Mbps (manufacturer datasheet).',
    purchasePrice: 0, sellingPrice: 0, stockQuantity: 0, minStockAlert: 0, warrantyMonths: 0,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=450&fit=crop',
    createdAt: now,
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
