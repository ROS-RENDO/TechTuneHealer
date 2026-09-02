import { prisma } from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🗑️  Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  console.log('✅ Cleared all data');

  const hashed = await bcrypt.hash('password123', 10);

  // ── 1. CUSTOMER ──────────────────────────────────────────────────────────────
  const customer = await prisma.user.create({
    data: {
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '+85511111111',
      password: hashed,
      role: 'CUSTOMER',
      vehicles: {
        create: [
          { make: 'Toyota', model: 'Camry', year: 2020, plateNumber: '2A-1234', color: 'White' },
          { make: 'Honda',  model: 'Civic', year: 2019, plateNumber: '3B-5678', color: 'Silver' },
        ],
      },
    },
  });
  console.log(`✅ Customer: ${customer.email} / password123`);

  // ── 2. PROVIDERS (6 mechanics) ────────────────────────────────────────────────
  const mechanicData = [
    {
      name: 'Sokha Chan',    email: 'sokha@test.com',   phone: '+85522000001',
      business: 'Speedy Auto Fix',        address: 'Olympic Stadium Area, Phnom Penh',
      desc: 'Expert in all kinds of engine repairs and diagnostics. Fast and reliable.',
      lat: 11.5600, lng: 104.9100, emergency: true, rating: 4.8, reviews: 124,
      services: [
        { name: 'Oil Change',         price: 25,  description: 'Premium synthetic oil change' },
        { name: 'Brake Inspection',   price: 30,  description: 'Full brake system check & pad replacement' },
        { name: 'Tire Rotation',      price: 15,  description: 'Balance and rotate all four tires' },
        { name: 'Battery Jump Start', price: 20,  description: 'Emergency dead battery jump start' },
      ],
    },
    {
      name: 'Dara Pich',    email: 'dara@test.com',    phone: '+85522000002',
      business: 'Dara Speed Garage',      address: 'Toul Kork Area, Phnom Penh',
      desc: 'Specialist in engine performance tuning and exhaust systems.',
      lat: 11.5700, lng: 104.8900, emergency: false, rating: 4.6, reviews: 88,
      services: [
        { name: 'Engine Tune-Up',     price: 80,  description: 'Complete performance tune-up' },
        { name: 'Exhaust Repair',     price: 60,  description: 'Muffler and exhaust pipe repair' },
        { name: 'Air Filter Change',  price: 18,  description: 'OEM replacement air filter' },
        { name: 'Spark Plug Replace', price: 35,  description: 'Iridium spark plugs (set of 4)' },
      ],
    },
    {
      name: 'Sreymom Ly',   email: 'sreymom@test.com', phone: '+85522000003',
      business: 'Mekong Auto Center',     address: 'Toul Sleng Area, Phnom Penh',
      desc: 'Toyota & Honda certified. AC repair and diagnostics specialist.',
      lat: 11.5500, lng: 104.9150, emergency: true, rating: 4.9, reviews: 214,
      services: [
        { name: 'AC Recharge',        price: 45,  description: 'Freon refill & system check' },
        { name: 'AC Compressor Fix',  price: 150, description: 'Compressor diagnosis & repair' },
        { name: 'Computer Scan',      price: 25,  description: 'OBD2 full vehicle diagnostic scan' },
        { name: 'Coolant Flush',      price: 40,  description: 'Full radiator flush and refill' },
      ],
    },
    {
      name: 'Vuthy Kem',    email: 'vuthy@test.com',   phone: '+85522000004',
      business: 'KV Tire & Wheel',        address: 'Russian Market Area, Phnom Penh',
      desc: '24/7 emergency tire and wheel specialist.',
      lat: 11.5350, lng: 104.9150, emergency: true, rating: 4.7, reviews: 302,
      services: [
        { name: 'Flat Tire Repair',   price: 10,  description: 'Patch puncture or replace tube' },
        { name: 'Tire Replacement',   price: 20,  description: 'Mount new tire per wheel' },
        { name: 'Wheel Alignment',    price: 35,  description: '4-wheel computerized alignment' },
        { name: 'Tire Balancing',     price: 12,  description: 'Dynamic balance all four wheels' },
      ],
    },
    {
      name: 'Chanra Nop',   email: 'chanra@test.com',  phone: '+85522000005',
      business: 'City Center Electric Auto', address: 'BKK1 Area, Phnom Penh',
      desc: 'EV and hybrid vehicle specialist. Battery and electrical systems.',
      lat: 11.5550, lng: 104.9200, emergency: false, rating: 4.5, reviews: 56,
      services: [
        { name: 'EV Battery Check',   price: 50,  description: 'Hybrid/EV battery health scan' },
        { name: 'Alternator Repair',  price: 90,  description: 'Alternator test and replace' },
        { name: 'Starter Motor Fix',  price: 70,  description: 'Starter motor diagnosis' },
        { name: 'Wiring Inspection',  price: 40,  description: 'Full electrical wiring audit' },
      ],
    },
    {
      name: 'Borin Sorn',   email: 'borin@test.com',   phone: '+85522000006',
      business: 'Golden Star Auto Spa',   address: '77 Street 310, Boeung Keng Kang',
      desc: 'Premium detailing, paint correction, and suspension service.',
      lat: 11.5650, lng: 104.9100, emergency: false, rating: 4.8, reviews: 174,
      services: [
        { name: 'Full Car Detailing', price: 60,  description: 'Interior + exterior premium clean' },
        { name: 'Paint Correction',   price: 120, description: '2-stage machine polish' },
        { name: 'Suspension Check',   price: 35,  description: 'Shocks and struts inspection' },
        { name: 'Ceramic Coating',    price: 200, description: '3-year ceramic paint protection' },
      ],
    },
  ];

  for (const m of mechanicData) {
    const user = await prisma.user.create({
      data: { name: m.name, email: m.email, phone: m.phone, password: hashed, role: 'PROVIDER' },
    });
    await prisma.serviceProvider.create({
      data: {
        userId: user.id,
        businessName: m.business,
        description: m.desc,
        address: m.address,
        lat: m.lat, lng: m.lng,
        isEmergency: m.emergency,
        rating: m.rating,
        totalReviews: m.reviews,
        services: { create: m.services },
      },
    });
    console.log(`✅ Mechanic: ${m.business}`);
  }

  // ── 3. PRODUCT CATEGORIES & PRODUCTS ─────────────────────────────────────────
  const categories = [
    { name: 'Fluids',      description: 'Engine oils, coolants, and fluids' },
    { name: 'Brakes',      description: 'Brake pads, discs, and fluids' },
    { name: 'Tires',       description: 'All-season and performance tires' },
    { name: 'Electrical',  description: 'Batteries, alternators, and wiring' },
    { name: 'Filters',     description: 'Air, oil, and cabin filters' },
    { name: 'Ignition',    description: 'Spark plugs and ignition parts' },
    { name: 'Wipers',      description: 'Windshield wiper blades' },
    { name: 'Suspension',  description: 'Shocks, struts, and suspension parts' },
    { name: 'Diagnostics', description: 'OBD scanners and diagnostic tools' },
    { name: 'Accessories', description: 'Dash cams, covers, and car accessories' },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.productCategory.create({ data: cat });
    catMap[cat.name] = c.id;
    console.log(`✅ Category: ${cat.name}`);
  }

  const BASE = 'http://localhost:4000';

  const products = [
    {
      name: 'Mobil 1 Full Synthetic 5W-30 (1L)',    price: 29.99, stock: 80,  cat: 'Fluids',
      desc: 'Top-rated full synthetic motor oil for modern engines. Excellent cold-start protection.',
      img: '/images/oil_bottle.png',
    },
    {
      name: 'Castrol GTX 10W-40 Semi Synthetic (1L)',price: 18.99, stock: 120, cat: 'Fluids',
      desc: 'Dependable semi-synthetic for high-mileage engines. Extended drain intervals.',
      img: '/images/oil_bottle.png',
    },
    {
      name: 'Radiator Coolant / Antifreeze 1L',      price: 9.99,  stock: 200, cat: 'Fluids',
      desc: 'Ready-to-use coolant compatible with all metal types. Prevents overheating.',
      img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    },
    {
      name: 'Brembo Brake Pads Front Set',           price: 55.00, stock: 40,  cat: 'Brakes',
      desc: 'OEM-quality ceramic pads. Low dust, silent braking. Fits most sedans and SUVs.',
      img: '/images/brake_pads.png',
    },
    {
      name: 'Bosch Disc Brake Rotor (Single)',       price: 49.99, stock: 30,  cat: 'Brakes',
      desc: 'Vented front rotor with anti-corrosion coating. Direct OEM replacement.',
      img: '/images/brake_pads.png',
    },
    {
      name: 'All-Season Tire 205/55R16',             price: 110.00,stock: 24,  cat: 'Tires',
      desc: 'Balanced performance in wet and dry conditions. 50,000 km tread warranty.',
      img: '/images/car_tire.png',
    },
    {
      name: 'AGM Car Battery 12V 60Ah',              price: 89.99, stock: 35,  cat: 'Electrical',
      desc: 'Maintenance-free AGM battery. High cold cranking amps. 3-year warranty.',
      img: '/images/car_battery.png',
    },
    {
      name: 'LED Headlight Bulbs H7 Pair',           price: 35.00, stock: 90,  cat: 'Electrical',
      desc: '6000K ultra-white LED. 3x brighter than halogen. Plug-and-play installation.',
      img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
    },
    {
      name: 'Air Filter K&N Performance',            price: 34.99, stock: 60,  cat: 'Filters',
      desc: 'Washable and reusable high-flow air filter. Improves throttle response.',
      img: '/images/air_filter.png',
    },
    {
      name: 'Cabin Air Filter (Carbon)',             price: 14.99, stock: 150, cat: 'Filters',
      desc: 'Activated carbon cabin filter removes odors, pollen, and fine dust.',
      img: '/images/air_filter.png',
    },
    {
      name: 'NGK Iridium Spark Plugs (Set of 4)',    price: 28.00, stock: 70,  cat: 'Ignition',
      desc: 'Long-life iridium tip. Better ignition, improved fuel economy.',
      img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    },
    {
      name: 'Bosch Aerotwin Wiper Blades (Pair)',    price: 19.99, stock: 100, cat: 'Wipers',
      desc: 'Frameless beam design for even pressure. Fits most B and D clip arms.',
      img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    },
    {
      name: 'Monroe Shock Absorber Front Pair',      price: 149.00,stock: 18,  cat: 'Suspension',
      desc: 'OEM-specification gas-charged shock absorbers. Restores original ride comfort.',
      img: '/images/shock_absorber.png',
    },
    {
      name: 'LAUNCH CRP129E OBD2 Scanner',          price: 79.99, stock: 25,  cat: 'Diagnostics',
      desc: 'Reads and clears all OBD2 codes. ABS, SRS, transmission live data.',
      img: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
    },
    {
      name: '4K Dash Cam with Night Vision',         price: 69.99, stock: 40,  cat: 'Accessories',
      desc: 'Ultra HD 4K front camera, 140° wide angle, loop recording. App control.',
      img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    },
    {
      name: 'Car Vacuum Cleaner 12V 120W',           price: 24.99, stock: 55,  cat: 'Accessories',
      desc: 'Powerful handheld wet/dry vacuum. Long 4m cord. Fits all 12V sockets.',
      img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.desc,
        price: p.price,
        stock: p.stock,
        imageUrl: p.img,
        categoryId: catMap[p.cat],
      },
    });
  }
  console.log(`✅ Seeded ${products.length} products`);

  // ── 4. SAMPLE BOOKING ─────────────────────────────────────────────────────────
  const vehicle = await prisma.vehicle.findFirst({ where: { userId: customer.id } });
  const provider = await prisma.serviceProvider.findFirst();
  if (vehicle && provider) {
    await prisma.booking.create({
      data: {
        customerId: customer.id,
        providerId: provider.id,
        vehicleId: vehicle.id,
        serviceType: 'Oil Change',
        scheduledDate: new Date('2026-06-15T10:00:00Z'),
        scheduledTime: '10:00 AM',
        status: 'ACCEPTED',
        notes: 'Please check tire pressure as well.',
      },
    });
    console.log('✅ Sample booking created');
  }

  // ── 5. NOTIFICATIONS ──────────────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId: customer.id,
      type: 'SYSTEM',
      title: 'Welcome to TechTune Healer! 🚗',
      body: 'Find nearby mechanics, shop for parts, and get emergency roadside help.',
    },
  });

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────────────');
  console.log('  CUSTOMER  → customer@test.com   / password123');
  console.log('  PROVIDER  → sokha@test.com      / password123');
  console.log('  (+ 5 more mechanic providers seeded)');
  console.log(`  PRODUCTS  → ${products.length} products in ${categories.length} categories`);
  console.log('─────────────────────────────────────────────────');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
