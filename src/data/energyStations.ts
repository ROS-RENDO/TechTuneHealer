export type EnergyStationType = "fuel" | "ev";

export interface EnergyStation {
  id: string;
  name: string;
  brand: string;
  type: EnergyStationType;
  address: string;
  province?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isOpen24Hours: boolean;
  rating: number;
  // For fuel stations
  fuelPrices?: {
    regular: number;
    premium: number;
    diesel: number;
  };
  fuelAmenities?: string[];
  // For EV stations
  evSpecs?: {
    powerKw: number;
    plugTypes: string[];
    availablePlugs: number;
    totalPlugs: number;
    pricePerKwh: number;
  };
  image?: string;
}

export const ENERGY_STATIONS: EnergyStation[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PHNOM PENH - FUEL STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fuel-ptt-monivong",
    name: "PTT Station Monivong",
    brand: "PTT",
    type: "fuel",
    address: "Preah Monivong Blvd, Boeung Keng Kang, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5510,
      longitude: 104.9215,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.05,
      premium: 1.16,
      diesel: 0.98,
    },
    fuelAmenities: ["Cafe Amazon", "7-Eleven", "Tire Air & Water", "ATM", "Clean Restrooms"],
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-total-norodom",
    name: "TotalEnergies Norodom Hub",
    brand: "TotalEnergies",
    type: "fuel",
    address: "Norodom Blvd, Daun Penh, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5620,
      longitude: 104.9290,
    },
    isOpen24Hours: true,
    rating: 4.9,
    fuelPrices: {
      regular: 1.06,
      premium: 1.22,
      diesel: 0.99,
    },
    fuelAmenities: ["Bonjour Mart", "Quartz Auto Lube", "Touchless Car Wash", "ATM"],
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-tela-russian",
    name: "Tela Russian Blvd Express",
    brand: "Tela",
    type: "fuel",
    address: "Russian Federation Blvd, Toul Kork, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5665,
      longitude: 104.8980,
    },
    isOpen24Hours: true,
    rating: 4.7,
    fuelPrices: {
      regular: 1.04,
      premium: 1.15,
      diesel: 0.97,
    },
    fuelAmenities: ["Tela Mart", "Quick Lube", "Air Pressure", "Coffee Kiosk"],
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-caltex-bokor",
    name: "Caltex Bokor Intersection",
    brand: "Caltex",
    type: "fuel",
    address: "Mao Tse Toung Blvd & St 63, Chamkarmon, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5420,
      longitude: 104.9180,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.05,
      premium: 1.17,
      diesel: 0.98,
    },
    fuelAmenities: ["Star Mart", "True Coffee", "Havoline LubeBay", "Tire Center"],
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-sokimex-chroy",
    name: "Sokimex Chroy Changvar Gateway",
    brand: "Sokimex",
    type: "fuel",
    address: "National Road 6A, Chroy Changvar, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5910,
      longitude: 104.9315,
    },
    isOpen24Hours: true,
    rating: 4.6,
    fuelPrices: {
      regular: 1.03,
      premium: 1.14,
      diesel: 0.96,
    },
    fuelAmenities: ["Sokimex Mart", "Rest Area", "Tire Service", "ATM"],
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-ptt-hun-sen-60m",
    name: "PTT Station Hun Sen 60M Blvd",
    brand: "PTT",
    type: "fuel",
    address: "Hun Sen Blvd (60M Road), Meanchey, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.4980,
      longitude: 104.9150,
    },
    isOpen24Hours: true,
    rating: 4.9,
    fuelPrices: {
      regular: 1.05,
      premium: 1.16,
      diesel: 0.98,
    },
    fuelAmenities: ["Cafe Amazon Mega", "7-Eleven", "Jiffy Mart", "Food Court", "Car Detailing"],
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-total-airport",
    name: "TotalEnergies Pochentong Airport",
    brand: "TotalEnergies",
    type: "fuel",
    address: "Russian Blvd opposite Phnom Penh Airport, Por Senchey",
    province: "Phnom Penh",
    location: {
      latitude: 11.5540,
      longitude: 104.8520,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.06,
      premium: 1.22,
      diesel: 0.99,
    },
    fuelAmenities: ["Bonjour Mart", "Quartz Lube Center", "24/7 ATM", "Tyre Inflation"],
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-tela-veng-sreng",
    name: "Tela Veng Sreng Industrial Highway",
    brand: "Tela",
    type: "fuel",
    address: "Veng Sreng Blvd, Steung Meanchey, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5280,
      longitude: 104.8720,
    },
    isOpen24Hours: true,
    rating: 4.5,
    fuelPrices: {
      regular: 1.04,
      premium: 1.15,
      diesel: 0.97,
    },
    fuelAmenities: ["Tela Mart", "Diesel Heavy Fill", "Truck Parking", "ATM"],
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PHNOM PENH - SIHANOUKVILLE EXPRESSWAY (E4) REST AREAS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fuel-expressway-kampong-speu",
    name: "PTT Expressway Rest Area (Km 40)",
    brand: "PTT",
    type: "fuel",
    address: "Phnom Penh - Sihanoukville Expressway (E4 Km 40), Kampong Speu",
    province: "Kampong Speu",
    location: {
      latitude: 11.4550,
      longitude: 104.5200,
    },
    isOpen24Hours: true,
    rating: 4.9,
    fuelPrices: {
      regular: 1.06,
      premium: 1.18,
      diesel: 0.99,
    },
    fuelAmenities: ["Cafe Amazon", "7-Eleven", "Expressway Food Plaza", "Prayer Room", "Tire Air & Water"],
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-expressway-kampong-seila",
    name: "TotalEnergies Expressway Oasis (Km 109)",
    brand: "TotalEnergies",
    type: "fuel",
    address: "Phnom Penh - Sihanoukville Expressway (E4 Km 109), Kampong Seila",
    province: "Preah Sihanouk",
    location: {
      latitude: 11.0800,
      longitude: 103.8800,
    },
    isOpen24Hours: true,
    rating: 4.9,
    fuelPrices: {
      regular: 1.07,
      premium: 1.23,
      diesel: 1.00,
    },
    fuelAmenities: ["Bonjour Mart", "Quartz Emergency Lube", "Food Court", "Cardiff Coffee", "Clean Facilities"],
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SIEM REAP / ANGKOR - FUEL STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fuel-ptt-siem-reap-nr6",
    name: "PTT Station Siem Reap NR6",
    brand: "PTT",
    type: "fuel",
    address: "National Road 6, Svay Dangkum, Siem Reap",
    province: "Siem Reap",
    location: {
      latitude: 13.3620,
      longitude: 103.8440,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.06,
      premium: 1.18,
      diesel: 0.99,
    },
    fuelAmenities: ["Cafe Amazon", "7-Eleven", "ATM", "Clean Restrooms", "Tour Bus Parking"],
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-total-angkor-heritage",
    name: "TotalEnergies Angkor Heritage Hub",
    brand: "TotalEnergies",
    type: "fuel",
    address: "Sivutha Blvd & St 08, Svay Dangkum, Siem Reap",
    province: "Siem Reap",
    location: {
      latitude: 13.3540,
      longitude: 103.8560,
    },
    isOpen24Hours: true,
    rating: 4.9,
    fuelPrices: {
      regular: 1.07,
      premium: 1.24,
      diesel: 1.00,
    },
    fuelAmenities: ["Bonjour Mart", "Quartz Auto Lube", "Car Wash", "Bicycle & Scooter Air"],
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-tela-siem-reap-psar-leu",
    name: "Tela Psar Leu Highway Terminal",
    brand: "Tela",
    type: "fuel",
    address: "National Road 6 East, Slorkram, Siem Reap",
    province: "Siem Reap",
    location: {
      latitude: 13.3680,
      longitude: 103.8760,
    },
    isOpen24Hours: true,
    rating: 4.7,
    fuelPrices: {
      regular: 1.05,
      premium: 1.16,
      diesel: 0.98,
    },
    fuelAmenities: ["Tela Mart", "Quick Lube", "Tire Air & Water", "Water Refill"],
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-caltex-siem-reap-airport",
    name: "Caltex Siem Reap Airport Corridor",
    brand: "Caltex",
    type: "fuel",
    address: "Airport Highway, Kouk Chak, Siem Reap",
    province: "Siem Reap",
    location: {
      latitude: 13.3850,
      longitude: 103.8180,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.06,
      premium: 1.19,
      diesel: 0.99,
    },
    fuelAmenities: ["Star Mart", "True Coffee", "Havoline Express", "Luggage Friendly"],
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. PREAH SIHANOUK (SIHANOUKVILLE) - FUEL STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fuel-total-sihanouk-port",
    name: "TotalEnergies Autonomous Port Gate",
    brand: "TotalEnergies",
    type: "fuel",
    address: "Port Road / Autonomous Harbor Area, Sihanoukville",
    province: "Preah Sihanouk",
    location: {
      latitude: 10.6420,
      longitude: 103.5180,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.06,
      premium: 1.23,
      diesel: 0.99,
    },
    fuelAmenities: ["Bonjour Mart", "High-Flow Diesel", "Quartz Lube", "Maritime Supply ATM"],
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-ptt-mittapheap-shv",
    name: "PTT Station Mittapheap Grand",
    brand: "PTT",
    type: "fuel",
    address: "Mittapheap Blvd (NR4 Entrance), Sangkat 4, Sihanoukville",
    province: "Preah Sihanouk",
    location: {
      latitude: 10.6350,
      longitude: 103.5410,
    },
    isOpen24Hours: true,
    rating: 4.9,
    fuelPrices: {
      regular: 1.05,
      premium: 1.17,
      diesel: 0.98,
    },
    fuelAmenities: ["Cafe Amazon", "7-Eleven", "Car Wash Bay", "Tire Air & Water", "ATM"],
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-tela-ekareach-shv",
    name: "Tela Ekareach Coastal Terminal",
    brand: "Tela",
    type: "fuel",
    address: "Ekareach Street, Sangkat 2, Sihanoukville",
    province: "Preah Sihanouk",
    location: {
      latitude: 10.6210,
      longitude: 103.5280,
    },
    isOpen24Hours: true,
    rating: 4.7,
    fuelPrices: {
      regular: 1.04,
      premium: 1.15,
      diesel: 0.97,
    },
    fuelAmenities: ["Tela Mart", "Quick Lube", "Beach Tourist Amenities", "ATM"],
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. BATTAMBANG - FUEL STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fuel-ptt-battambang-nr5",
    name: "PTT Station Battambang NR5",
    brand: "PTT",
    type: "fuel",
    address: "National Road 5, Svay Pao, Battambang",
    province: "Battambang",
    location: {
      latitude: 13.1020,
      longitude: 103.1980,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.05,
      premium: 1.17,
      diesel: 0.98,
    },
    fuelAmenities: ["Cafe Amazon", "7-Eleven", "Tire Air", "ATM", "Clean Restrooms"],
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-total-sangke-battambang",
    name: "TotalEnergies Sangke Riverfront",
    brand: "TotalEnergies",
    type: "fuel",
    address: "Riverfront Road 1, Chamkar Samraong, Battambang",
    province: "Battambang",
    location: {
      latitude: 13.0940,
      longitude: 103.2050,
    },
    isOpen24Hours: true,
    rating: 4.7,
    fuelPrices: {
      regular: 1.06,
      premium: 1.22,
      diesel: 0.99,
    },
    fuelAmenities: ["Bonjour Mart", "Quartz Lube", "Motorcycle Care", "ATM"],
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. KAMPOT & KEP - FUEL STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fuel-ptt-kampot-durian",
    name: "PTT Station Kampot Durian Roundabout",
    brand: "PTT",
    type: "fuel",
    address: "National Road 3 at Durian Roundabout, Kampot",
    province: "Kampot",
    location: {
      latitude: 10.6120,
      longitude: 104.1810,
    },
    isOpen24Hours: true,
    rating: 4.9,
    fuelPrices: {
      regular: 1.05,
      premium: 1.17,
      diesel: 0.98,
    },
    fuelAmenities: ["Cafe Amazon", "7-Eleven", "ATM", "Pepper Gift Corner", "Restrooms"],
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-total-kampot-riverside",
    name: "TotalEnergies Kampot Old Bridge",
    brand: "TotalEnergies",
    type: "fuel",
    address: "Riverside Road, Kampong Bay, Kampot",
    province: "Kampot",
    location: {
      latitude: 10.6010,
      longitude: 104.1750,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.06,
      premium: 1.22,
      diesel: 0.99,
    },
    fuelAmenities: ["Bonjour Mart", "Quartz Lube", "Tire Air & Water"],
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-caltex-kep-beach",
    name: "Caltex Kep Seaside Way",
    brand: "Caltex",
    type: "fuel",
    address: "Coastal Road 33A near Crab Market, Kep",
    province: "Kep",
    location: {
      latitude: 10.4860,
      longitude: 104.3050,
    },
    isOpen24Hours: true,
    rating: 4.7,
    fuelPrices: {
      regular: 1.06,
      premium: 1.18,
      diesel: 0.99,
    },
    fuelAmenities: ["Star Mart", "True Coffee", "Beach Visitor ATM"],
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. KAMPONG CHAM - FUEL STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fuel-ptt-kampong-cham-kizuna",
    name: "PTT Station Kizuna Bridge West",
    brand: "PTT",
    type: "fuel",
    address: "National Road 7, Kizuna Bridge Approach, Kampong Cham",
    province: "Kampong Cham",
    location: {
      latitude: 11.9920,
      longitude: 105.4580,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.05,
      premium: 1.16,
      diesel: 0.98,
    },
    fuelAmenities: ["Cafe Amazon", "7-Eleven", "Tire Air", "ATM", "Mekong Restroom"],
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-tela-kampong-cham-mekong",
    name: "Tela Mekong Riverside Station",
    brand: "Tela",
    type: "fuel",
    address: "Riverside Boulevard, Kampong Cham",
    province: "Kampong Cham",
    location: {
      latitude: 11.9840,
      longitude: 105.4650,
    },
    isOpen24Hours: true,
    rating: 4.6,
    fuelPrices: {
      regular: 1.04,
      premium: 1.15,
      diesel: 0.97,
    },
    fuelAmenities: ["Tela Mart", "Quick Lube", "Air Pressure"],
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. BORDER CROSSINGS & PROVINCIAL HIGHWAYS - FUEL STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fuel-tela-poipet-border",
    name: "Tela Poipet International Border Gateway",
    brand: "Tela",
    type: "fuel",
    address: "National Road 5, Poipet (Thailand-Cambodia Border)",
    province: "Banteay Meanchey",
    location: {
      latitude: 13.6580,
      longitude: 102.5720,
    },
    isOpen24Hours: true,
    rating: 4.7,
    fuelPrices: {
      regular: 1.06,
      premium: 1.18,
      diesel: 0.98,
    },
    fuelAmenities: ["Tela Mart", "Duty Free Exchange", "Transit Truck Parking", "ATM"],
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-total-bavet-border",
    name: "TotalEnergies Bavet International Gate",
    brand: "TotalEnergies",
    type: "fuel",
    address: "National Road 1, Bavet (Vietnam-Cambodia Border)",
    province: "Svay Rieng",
    location: {
      latitude: 11.0820,
      longitude: 106.1550,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.06,
      premium: 1.22,
      diesel: 0.99,
    },
    fuelAmenities: ["Bonjour Mart", "Cross-Border Rest Area", "Quartz Lube", "ATM"],
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-ptt-pursat-nr5",
    name: "PTT Station Pursat Town Center",
    brand: "PTT",
    type: "fuel",
    address: "National Road 5, Pursat Town",
    province: "Pursat",
    location: {
      latitude: 12.5360,
      longitude: 103.9210,
    },
    isOpen24Hours: true,
    rating: 4.8,
    fuelPrices: {
      regular: 1.05,
      premium: 1.17,
      diesel: 0.98,
    },
    fuelAmenities: ["Cafe Amazon", "7-Eleven", "Tire Air & Water", "ATM"],
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fuel-tela-koh-kong-border",
    name: "Tela Koh Kong Coastal Gateway",
    brand: "Tela",
    type: "fuel",
    address: "National Road 48, Cham Yeam Border Gate, Koh Kong",
    province: "Koh Kong",
    location: {
      latitude: 11.6250,
      longitude: 103.0120,
    },
    isOpen24Hours: true,
    rating: 4.7,
    fuelPrices: {
      regular: 1.06,
      premium: 1.18,
      diesel: 0.99,
    },
    fuelAmenities: ["Tela Mart", "Border Crossing Service", "Tire Air & Water", "ATM"],
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. PHNOM PENH - EV CHARGING STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ev-chargeplus-central",
    name: "Charge+ Central Supercharger",
    brand: "Charge+",
    type: "ev",
    address: "Vattanac Capital / St 106, Daun Penh, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5725,
      longitude: 104.9205,
    },
    isOpen24Hours: true,
    rating: 4.9,
    evSpecs: {
      powerKw: 120,
      plugTypes: ["CCS2", "Type 2"],
      availablePlugs: 3,
      totalPlugs: 4,
      pricePerKwh: 0.35,
    },
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-total-chamkarmon",
    name: "TotalEnergies EV Hub Chamkarmon",
    brand: "TotalEnergies EV",
    type: "ev",
    address: "Norodom Blvd & Mao Tse Toung, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5460,
      longitude: 104.9250,
    },
    isOpen24Hours: true,
    rating: 4.8,
    evSpecs: {
      powerKw: 60,
      plugTypes: ["CCS2", "CHAdeMO"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.32,
    },
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-aeon-sensok",
    name: "Aeon Mall Sen Sok EV Station",
    brand: "EV Cambodia",
    type: "ev",
    address: "Aeon Mall Sen Sok Ground Parking, Sen Sok, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5830,
      longitude: 104.8780,
    },
    isOpen24Hours: true,
    rating: 4.9,
    evSpecs: {
      powerKw: 50,
      plugTypes: ["CCS2", "Type 2", "GB/T"],
      availablePlugs: 5,
      totalPlugs: 6,
      pricePerKwh: 0.28,
    },
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-chipmong-271",
    name: "Chip Mong 271 Mega EV Terminal",
    brand: "Charge+",
    type: "ev",
    address: "Street 271 Mega Mall, Meanchey, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5300,
      longitude: 104.9120,
    },
    isOpen24Hours: true,
    rating: 4.9,
    evSpecs: {
      powerKw: 180,
      plugTypes: ["CCS2", "Type 2"],
      availablePlugs: 2,
      totalPlugs: 4,
      pricePerKwh: 0.36,
    },
    image: "https://images.unsplash.com/photo-1558441719-216999a07a0c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-aeon-meanchay-3",
    name: "Aeon Mall Mean Chey (Aeon 3) EV Hub",
    brand: "Charge+",
    type: "ev",
    address: "Hun Sen Blvd, Chak Angre Kraom, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.4920,
      longitude: 104.9260,
    },
    isOpen24Hours: true,
    rating: 4.9,
    evSpecs: {
      powerKw: 180,
      plugTypes: ["CCS2", "GB/T", "Type 2"],
      availablePlugs: 4,
      totalPlugs: 6,
      pricePerKwh: 0.34,
    },
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-byd-chroy-changvar",
    name: "BYD EV Supercharging Lounge",
    brand: "BYD EV",
    type: "ev",
    address: "National Road 6A, Chroy Changvar, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5980,
      longitude: 104.9350,
    },
    isOpen24Hours: true,
    rating: 4.8,
    evSpecs: {
      powerKw: 120,
      plugTypes: ["CCS2", "GB/T"],
      availablePlugs: 3,
      totalPlugs: 4,
      pricePerKwh: 0.30,
    },
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-tesla-destination-bkk1",
    name: "Tesla Destination Supercharger BKK1",
    brand: "Tesla",
    type: "ev",
    address: "Street 302 & St 57, Boeung Keng Kang 1, Phnom Penh",
    province: "Phnom Penh",
    location: {
      latitude: 11.5525,
      longitude: 104.9260,
    },
    isOpen24Hours: true,
    rating: 4.9,
    evSpecs: {
      powerKw: 120,
      plugTypes: ["Tesla / CCS2", "Type 2"],
      availablePlugs: 2,
      totalPlugs: 4,
      pricePerKwh: 0.38,
    },
    image: "https://images.unsplash.com/photo-1558441719-216999a07a0c?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. EXPRESSWAY (E4) EV CHARGING CORRIDOR
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ev-expressway-kampong-speu",
    name: "Charge+ Expressway Ultra-Fast 180kW Hub",
    brand: "Charge+",
    type: "ev",
    address: "PP-SHV Expressway Rest Area Km 40, Kampong Speu",
    province: "Kampong Speu",
    location: {
      latitude: 11.4560,
      longitude: 104.5215,
    },
    isOpen24Hours: true,
    rating: 4.9,
    evSpecs: {
      powerKw: 180,
      plugTypes: ["CCS2", "GB/T"],
      availablePlugs: 3,
      totalPlugs: 4,
      pricePerKwh: 0.38,
    },
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-expressway-kampong-seila",
    name: "EV Cambodia 120kW Fast Hub (Km 109)",
    brand: "EV Cambodia",
    type: "ev",
    address: "PP-SHV Expressway Rest Area Km 109, Kampong Seila",
    province: "Preah Sihanouk",
    location: {
      latitude: 11.0810,
      longitude: 103.8820,
    },
    isOpen24Hours: true,
    rating: 4.9,
    evSpecs: {
      powerKw: 120,
      plugTypes: ["CCS2", "Type 2", "CHAdeMO"],
      availablePlugs: 2,
      totalPlugs: 4,
      pricePerKwh: 0.36,
    },
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. SIEM REAP / ANGKOR - EV CHARGING STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ev-chargeplus-angkor-heritage",
    name: "Charge+ Angkor Supercharger (Heritage Walk)",
    brand: "Charge+",
    type: "ev",
    address: "The Heritage Walk, Sivutha Blvd, Siem Reap",
    province: "Siem Reap",
    location: {
      latitude: 13.3610,
      longitude: 103.8555,
    },
    isOpen24Hours: true,
    rating: 4.9,
    evSpecs: {
      powerKw: 150,
      plugTypes: ["CCS2", "Type 2"],
      availablePlugs: 4,
      totalPlugs: 4,
      pricePerKwh: 0.35,
    },
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-total-siem-reap",
    name: "TotalEnergies EV Hub Siem Reap NR6",
    brand: "TotalEnergies EV",
    type: "ev",
    address: "National Road 6 near Royal Residence, Siem Reap",
    province: "Siem Reap",
    location: {
      latitude: 13.3640,
      longitude: 103.8590,
    },
    isOpen24Hours: true,
    rating: 4.8,
    evSpecs: {
      powerKw: 60,
      plugTypes: ["CCS2", "CHAdeMO"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.32,
    },
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-byd-siem-reap-airport",
    name: "BYD EV Fast Station Angkor Highway",
    brand: "BYD EV",
    type: "ev",
    address: "Airport Road, Kouk Chak, Siem Reap",
    province: "Siem Reap",
    location: {
      latitude: 13.3820,
      longitude: 103.8240,
    },
    isOpen24Hours: true,
    rating: 4.8,
    evSpecs: {
      powerKw: 120,
      plugTypes: ["CCS2", "GB/T"],
      availablePlugs: 3,
      totalPlugs: 4,
      pricePerKwh: 0.30,
    },
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. PREAH SIHANOUK (SIHANOUKVILLE) - EV CHARGING STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ev-chargeplus-prince-mall",
    name: "Charge+ Sihanoukville Prince Mall Supercharger",
    brand: "Charge+",
    type: "ev",
    address: "Prince Mall Parking, 2 Thnou Street, Sihanoukville",
    province: "Preah Sihanouk",
    location: {
      latitude: 10.6180,
      longitude: 103.5240,
    },
    isOpen24Hours: true,
    rating: 4.9,
    evSpecs: {
      powerKw: 180,
      plugTypes: ["CCS2", "GB/T", "Type 2"],
      availablePlugs: 3,
      totalPlugs: 4,
      pricePerKwh: 0.36,
    },
    image: "https://images.unsplash.com/photo-1558441719-216999a07a0c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-total-sihanouk-port",
    name: "TotalEnergies EV Hub Sihanoukville Port",
    brand: "TotalEnergies EV",
    type: "ev",
    address: "Autonomous Harbor Entrance, Sihanoukville",
    province: "Preah Sihanouk",
    location: {
      latitude: 10.6410,
      longitude: 103.5190,
    },
    isOpen24Hours: true,
    rating: 4.8,
    evSpecs: {
      powerKw: 120,
      plugTypes: ["CCS2", "CHAdeMO"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.34,
    },
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-ochheuteal-beach",
    name: "EV Cambodia Ochheuteal Coastal Station",
    brand: "EV Cambodia",
    type: "ev",
    address: "Ochheuteal Beach Road, Sangkat 4, Sihanoukville",
    province: "Preah Sihanouk",
    location: {
      latitude: 10.6080,
      longitude: 103.5350,
    },
    isOpen24Hours: true,
    rating: 4.7,
    evSpecs: {
      powerKw: 60,
      plugTypes: ["CCS2", "Type 2"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.30,
    },
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&auto=format&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. REGIONAL HUBS - EV CHARGING STATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ev-battambang-provincial",
    name: "EV Cambodia Battambang Hub",
    brand: "EV Cambodia",
    type: "ev",
    address: "National Road 5 near Governor Residence, Battambang",
    province: "Battambang",
    location: {
      latitude: 13.0980,
      longitude: 103.2010,
    },
    isOpen24Hours: true,
    rating: 4.8,
    evSpecs: {
      powerKw: 60,
      plugTypes: ["CCS2", "GB/T", "Type 2"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.29,
    },
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-kampot-riverside",
    name: "Charge+ Kampot Riverside Station",
    brand: "Charge+",
    type: "ev",
    address: "Riverside Road, Kampong Bay, Kampot",
    province: "Kampot",
    location: {
      latitude: 10.6040,
      longitude: 104.1770,
    },
    isOpen24Hours: true,
    rating: 4.8,
    evSpecs: {
      powerKw: 60,
      plugTypes: ["CCS2", "Type 2"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.31,
    },
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-kampong-cham-kizuna",
    name: "EV Cambodia Kampong Cham Kizuna Terminal",
    brand: "EV Cambodia",
    type: "ev",
    address: "National Road 7, Kizuna Bridge West Approach, Kampong Cham",
    province: "Kampong Cham",
    location: {
      latitude: 11.9910,
      longitude: 105.4590,
    },
    isOpen24Hours: true,
    rating: 4.7,
    evSpecs: {
      powerKw: 50,
      plugTypes: ["CCS2", "Type 2"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.28,
    },
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-poipet-border",
    name: "Charge+ Poipet Border Transit EV Station",
    brand: "Charge+",
    type: "ev",
    address: "National Road 5, Border Gate Corridor, Poipet",
    province: "Banteay Meanchey",
    location: {
      latitude: 13.6590,
      longitude: 102.5740,
    },
    isOpen24Hours: true,
    rating: 4.8,
    evSpecs: {
      powerKw: 120,
      plugTypes: ["CCS2", "Type 2"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.35,
    },
    image: "https://images.unsplash.com/photo-1558441719-216999a07a0c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-bavet-border",
    name: "EV Cambodia Bavet Gateway Station",
    brand: "EV Cambodia",
    type: "ev",
    address: "National Road 1, Bavet Border Terminal",
    province: "Svay Rieng",
    location: {
      latitude: 11.0830,
      longitude: 106.1570,
    },
    isOpen24Hours: true,
    rating: 4.7,
    evSpecs: {
      powerKw: 60,
      plugTypes: ["CCS2", "Type 2"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.30,
    },
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-koh-kong-coastal",
    name: "Charge+ Koh Kong Coastal Hub",
    brand: "Charge+",
    type: "ev",
    address: "National Road 48, Koh Kong Town Center",
    province: "Koh Kong",
    location: {
      latitude: 11.6210,
      longitude: 103.0180,
    },
    isOpen24Hours: true,
    rating: 4.8,
    evSpecs: {
      powerKw: 60,
      plugTypes: ["CCS2", "Type 2"],
      availablePlugs: 2,
      totalPlugs: 2,
      pricePerKwh: 0.32,
    },
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&auto=format&fit=crop&q=80",
  },
];
