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

export const ZEBRONICS_CATALOGUE: Product[] = entries.map(([name, brand, model, specifications, category], index) => ({
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
}));
