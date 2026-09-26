// Mock Provider Data for Provider Portal Screens
export interface MockReview {
  id: string;
  customerName: string;
  customerAvatar?: string;
  vehicleTag: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
  reply?: {
    text: string;
    repliedAt: string;
  };
}

export interface MockDaySchedule {
  day: string;
  shortDay: string;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  isEmergencyNightShift?: boolean;
}

export interface MockTimeSlot {
  id: string;
  time: string;
  isBooked: boolean;
  customerName?: string;
  vehicleModel?: string;
  service?: string;
}

export interface MockTransaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'platform_fee';
  description: string;
  vehicle?: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  paymentMethod: 'KHQR' | 'CASH' | 'CARD';
  date: string;
  status: 'completed' | 'pending' | 'processing';
}

export interface MockService {
  id: string;
  name: string;
  category: 'Maintenance' | 'Inspection' | 'Diagnostics' | 'Brakes' | 'Tires' | 'Electric/Hybrid' | 'Engine';
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export const INITIAL_MOCK_REVIEWS: MockReview[] = [
  {
    id: '1',
    customerName: 'Dara Chan',
    vehicleTag: 'Luxury SUV (2024)',
    rating: 5,
    comment: 'Fastest emergency roadside dispatch! Arrived at Tuol Kork in 12 minutes with a heavy hydraulic jack and repaired my puncture safely.',
    date: '2026-09-18',
    service: 'Emergency Tire Puncture',
    reply: {
      text: 'Glad we could get you back on the road safely, Dara! Always keep our 24/7 hotline saved.',
      repliedAt: '2026-09-18',
    },
  },
  {
    id: '2',
    customerName: 'Sophea Pich',
    vehicleTag: '4WD SUV',
    rating: 5,
    comment: 'Top tier OBD-II computer diagnostic and alternator check. Transparent pricing and no hidden fees.',
    date: '2026-09-15',
    service: 'Engine & ECU Diagnostics',
  },
  {
    id: '3',
    customerName: 'Michael Seng',
    vehicleTag: 'EV Crossover',
    rating: 4,
    comment: 'Very knowledgeable on EV 12V auxiliary battery replacement and high-voltage coolant flush. minor wait for parts.',
    date: '2026-09-12',
    service: 'EV High-Voltage Coolant Flush',
    reply: {
      text: 'Thanks for trusting us with your EV, Michael! We are expanding our dedicated EV parts inventory.',
      repliedAt: '2026-09-13',
    },
  },
  {
    id: '4',
    customerName: 'Channary Voeun',
    vehicleTag: 'Pickup Truck 4x4',
    rating: 5,
    comment: 'Complete ceramic brake pad upgrade before our Siem Reap road trip. Super clean workshop.',
    date: '2026-09-08',
    service: 'Ceramic Brake Upgrade',
  },
  {
    id: '5',
    customerName: 'Veasna Lim',
    vehicleTag: 'Sedan Hybrid',
    rating: 4,
    comment: 'Quick synthetic oil change and tire rotation. Highly recommended.',
    date: '2026-09-02',
    service: 'Full Synthetic Oil Change',
  },
];

export const INITIAL_WEEKLY_SCHEDULE: MockDaySchedule[] = [
  { day: 'Monday', shortDay: 'Mon', isEnabled: true, startTime: '08:00', endTime: '18:00', isEmergencyNightShift: true },
  { day: 'Tuesday', shortDay: 'Tue', isEnabled: true, startTime: '08:00', endTime: '18:00', isEmergencyNightShift: true },
  { day: 'Wednesday', shortDay: 'Wed', isEnabled: true, startTime: '08:00', endTime: '18:00', isEmergencyNightShift: true },
  { day: 'Thursday', shortDay: 'Thu', isEnabled: true, startTime: '08:00', endTime: '18:00', isEmergencyNightShift: true },
  { day: 'Friday', shortDay: 'Fri', isEnabled: true, startTime: '08:00', endTime: '18:00', isEmergencyNightShift: true },
  { day: 'Saturday', shortDay: 'Sat', isEnabled: true, startTime: '08:30', endTime: '16:00', isEmergencyNightShift: true },
  { day: 'Sunday', shortDay: 'Sun', isEnabled: false, startTime: '09:00', endTime: '14:00', isEmergencyNightShift: true },
];

export const INITIAL_TIME_SLOTS: MockTimeSlot[] = [
  { id: '1', time: '08:30 AM', isBooked: true, customerName: 'Dara Chan', vehicleModel: 'SUV', service: 'Oil & Filter Change' },
  { id: '2', time: '09:30 AM', isBooked: true, customerName: 'Sokha Meng', vehicleModel: 'Sedan', service: 'Brake Inspection' },
  { id: '3', time: '10:30 AM', isBooked: false },
  { id: '4', time: '11:30 AM', isBooked: true, customerName: 'Veasna Lim', vehicleModel: 'Truck', service: 'ECU Diagnostics' },
  { id: '5', time: '02:00 PM', isBooked: false },
  { id: '6', time: '03:30 PM', isBooked: true, customerName: 'Rithy Kheng', vehicleModel: 'EV', service: '12V Battery Check' },
  { id: '7', time: '04:30 PM', isBooked: false },
];

export const INITIAL_SERVICES: MockService[] = [
  {
    id: '1',
    name: 'Full Synthetic Oil & Filter',
    category: 'Maintenance',
    description: 'Mobil 1 / Castrol 5W-30 full synthetic oil change with OEM filter replacement and 20-point safety check',
    price: 45,
    durationMinutes: 40,
    isActive: true,
  },
  {
    id: '2',
    name: 'Brake Rotor & Ceramic Pad Service',
    category: 'Brakes',
    description: 'Comprehensive brake pad replacement, rotor resurfacing, caliper lubrication, and hydraulic bleed',
    price: 75,
    durationMinutes: 60,
    isActive: true,
  },
  {
    id: '3',
    name: 'OBD-II Computer Diagnostics',
    category: 'Diagnostics',
    description: 'Full ECU fault code scan, live sensor telemetry, ABS/Airbag diagnostics, and clearing of DTC error codes',
    price: 35,
    durationMinutes: 30,
    isActive: true,
  },
  {
    id: '4',
    name: 'Tire Balancing & Alignment',
    category: 'Tires',
    description: 'Laser wheel alignment, 4-wheel dynamic balancing, and tire tread depth inspection',
    price: 30,
    durationMinutes: 45,
    isActive: true,
  },
  {
    id: '5',
    name: 'EV Auxiliary 12V & Coolant Service',
    category: 'Electric/Hybrid',
    description: 'Electric vehicle low-voltage battery testing, inverter coolant condition test, and regenerative braking check',
    price: 85,
    durationMinutes: 50,
    isActive: true,
  },
  {
    id: '6',
    name: 'AC System Evacuate & Recharge',
    category: 'Inspection',
    description: 'R134a/R1234yf refrigerant recovery, vacuum leak test, compressor oil check, and vent chill test',
    price: 55,
    durationMinutes: 45,
    isActive: true,
  },
  {
    id: '7',
    name: 'Engine Timing Belt & Water Pump',
    category: 'Engine',
    description: 'Heavy engine maintenance, timing belt and tensioner replacement, and cooling water pump overhaul',
    price: 180,
    durationMinutes: 180,
    isActive: true,
  },
];

export const INITIAL_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'tx-101',
    type: 'earning',
    description: 'Emergency Roadside Tire Rescue',
    amount: 45.0,
    feeAmount: 4.5,
    netAmount: 40.5,
    paymentMethod: 'KHQR',
    date: '2026-09-18',
    status: 'completed',
  },
  {
    id: 'tx-102',
    type: 'earning',
    description: 'Ceramic Brake Upgrade Service',
    amount: 75.0,
    feeAmount: 7.5,
    netAmount: 67.5,
    paymentMethod: 'KHQR',
    date: '2026-09-17',
    status: 'completed',
  },
  {
    id: 'tx-103',
    type: 'withdrawal',
    description: 'Bakong Settlement Transfer',
    amount: 250.0,
    feeAmount: 0.0,
    netAmount: 250.0,
    paymentMethod: 'KHQR',
    date: '2026-09-16',
    status: 'completed',
  },
  {
    id: 'tx-104',
    type: 'earning',
    description: 'OBD-II Engine Diagnostics',
    amount: 35.0,
    feeAmount: 3.5,
    netAmount: 31.5,
    paymentMethod: 'CASH',
    date: '2026-09-15',
    status: 'completed',
  },
  {
    id: 'tx-105',
    type: 'earning',
    description: 'Full Synthetic Oil & Filter Service',
    amount: 45.0,
    feeAmount: 4.5,
    netAmount: 40.5,
    paymentMethod: 'KHQR',
    date: '2026-09-14',
    status: 'completed',
  },
];
