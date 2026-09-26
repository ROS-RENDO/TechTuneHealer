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

  // ── 1. CUSTOMERS ─────────────────────────────────────────────────────────────
  const customer = await prisma.user.create({
    data: {
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '+85511111111',
      password: hashed,
      role: 'CUSTOMER',
      vehicles: {
        create: [
          { make: 'Toyota', model: 'Camry', year: 2020, plateNumber: '2A-1234', color: 'Super White' },
          { make: 'Honda',  model: 'Civic', year: 2019, plateNumber: '3B-5678', color: 'Silver' },
        ],
      },
    },
  });

  const customerDara = await prisma.user.create({
    data: {
      name: 'Dara Chan',
      email: 'dara.chan@test.com',
      phone: '+85512998877',
      password: hashed,
      role: 'CUSTOMER',
      vehicles: {
        create: [
          { make: 'Lexus', model: 'RX350 Luxury', year: 2024, plateNumber: '2A-8888', color: 'Sonic Titanium' },
        ],
      },
    },
  });

  const customerVannak = await prisma.user.create({
    data: {
      name: 'Vannak Chea',
      email: 'vannak.chea@test.com',
      phone: '+85577445566',
      password: hashed,
      role: 'CUSTOMER',
      vehicles: {
        create: [
          { make: 'Ford', model: 'Ranger Wildtrak 4x4', year: 2023, plateNumber: '2B-4455', color: 'Cyber Orange' },
        ],
      },
    },
  });

  const customerSreymom = await prisma.user.create({
    data: {
      name: 'Sreymom Ly',
      email: 'sreymom.customer@test.com',
      phone: '+85510334455',
      password: hashed,
      role: 'CUSTOMER',
      vehicles: {
        create: [
          { make: 'Mazda', model: 'CX-5 SkyActiv', year: 2022, plateNumber: '2Z-7788', color: 'Soul Red Crystal' },
        ],
      },
    },
  });

  const customerSophea = await prisma.user.create({
    data: {
      name: 'Sophea Pich',
      email: 'sophea.pich@test.com',
      phone: '+85598223344',
      password: hashed,
      role: 'CUSTOMER',
      vehicles: {
        create: [
          { make: 'Toyota', model: 'Land Cruiser 300', year: 2024, plateNumber: '2C-9999', color: 'Pearl White' },
        ],
      },
    },
  });

  const customerMichael = await prisma.user.create({
    data: {
      name: 'Michael Seng',
      email: 'michael.seng@test.com',
      phone: '+85577554433',
      password: hashed,
      role: 'CUSTOMER',
      vehicles: {
        create: [
          { make: 'Tesla', model: 'Model Y Dual Motor', year: 2024, plateNumber: '2E-7777', color: 'Deep Blue Metallic' },
        ],
      },
    },
  });
  console.log(`✅ Seeded 6 realistic motorist customers with vehicles`);

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

  let speedyProviderId = '';
  const providerMap: Record<string, string> = {};
  for (const m of mechanicData) {
    const user = await prisma.user.create({
      data: { name: m.name, email: m.email, phone: m.phone, password: hashed, role: 'PROVIDER' },
    });
    const sp = await prisma.serviceProvider.create({
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
    providerMap[m.email] = sp.id;
    if (m.email === 'sokha@test.com') {
      speedyProviderId = sp.id;
    }
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

  // ── 4. LIVE INCOMING & SCHEDULED BOOKINGS FOR SPEEDY AUTO FIX ────────────────
  const vehCamry = await prisma.vehicle.findFirst({ where: { userId: customer.id, make: 'Toyota' } });
  const vehLexus = await prisma.vehicle.findFirst({ where: { userId: customerDara.id } });
  const vehRanger = await prisma.vehicle.findFirst({ where: { userId: customerVannak.id } });
  const vehMazda = await prisma.vehicle.findFirst({ where: { userId: customerSreymom.id } });
  const vehLandCruiser = await prisma.vehicle.findFirst({ where: { userId: customerSophea.id } });
  const vehTesla = await prisma.vehicle.findFirst({ where: { userId: customerMichael.id } });

  const today = new Date();

  if (speedyProviderId) {
    // 1. SOS Emergency Flat Tire - PENDING (Tuol Kork)
    await prisma.booking.create({
      data: {
        customerId: customerDara.id,
        providerId: speedyProviderId,
        vehicleId: vehLexus?.id,
        serviceType: '🚨 24/7 Roadside Emergency Rescue',
        scheduledDate: today,
        scheduledTime: '10:30 AM',
        status: 'PENDING',
        notes: 'Flat tire on front left wheel, vehicle stopped near Tuol Kork antenna tower (St 598). Need urgent mobile tyre change.',
      },
    });

    // 2. SOS Dead Battery Jumpstart - PENDING (Aeon Mall Sen Sok)
    await prisma.booking.create({
      data: {
        customerId: customerVannak.id,
        providerId: speedyProviderId,
        vehicleId: vehRanger?.id,
        serviceType: '⚡ Dead Battery Jumpstart & Alternator Scan',
        scheduledDate: today,
        scheduledTime: '11:15 AM',
        status: 'PENDING',
        notes: 'Engine won\'t turn over at Aeon Mall Sen Sok B2 basement parking (Zone C). Rapid clicking noise from starter motor.',
      },
    });

    // 3. Ceramic Brake Pad Replacement - PENDING (BKK1)
    await prisma.booking.create({
      data: {
        customerId: customerSreymom.id,
        providerId: speedyProviderId,
        vehicleId: vehMazda?.id,
        serviceType: 'Ceramic Brake Pad Replacement',
        scheduledDate: today,
        scheduledTime: '02:30 PM',
        status: 'PENDING',
        notes: 'High-pitched squealing when decelerating from 40km/h. Customer requested premium Akebono ceramic pads at BKK1.',
      },
    });

    // 4. Overheating Engine Rescue - IN_PROGRESS (CamTech University, Chroy Changvar)
    await prisma.booking.create({
      data: {
        customerId: customer.id,
        providerId: speedyProviderId,
        vehicleId: vehCamry?.id,
        serviceType: '🚨 Emergency Engine Overheating Rescue',
        scheduledDate: today,
        scheduledTime: '09:45 AM',
        status: 'IN_PROGRESS',
        notes: 'Engine temperature gauge maxed out near CamTech University Campus, Chroy Changvar Satellite City. Steam emitting from radiator expansion tank.',
      },
    });

    // 5. Radiator Flush & Diagnostic - ACCEPTED (Riverside Sisowath Quay)
    await prisma.booking.create({
      data: {
        customerId: customerSophea.id,
        providerId: speedyProviderId,
        vehicleId: vehLandCruiser?.id,
        serviceType: 'Radiator Coolant Flush & Pressure Test',
        scheduledDate: today,
        scheduledTime: '04:00 PM',
        status: 'ACCEPTED',
        notes: 'Routine 40,000km cooling system flush and AC condenser inspection near Riverside Sisowath Quay.',
      },
    });

    // 6. Tesla High Voltage Diagnostics - COMPLETED (Olympic Stadium)
    const completedBooking1 = await prisma.booking.create({
      data: {
        customerId: customerMichael.id,
        providerId: speedyProviderId,
        vehicleId: vehTesla?.id,
        serviceType: 'Suspension Check & High Voltage Diagnostics',
        scheduledDate: new Date(Date.now() - 86400000),
        scheduledTime: '03:00 PM',
        status: 'COMPLETED',
        notes: 'Rear multi-link suspension bushings inspected and complete 96-cell high voltage battery health scan passed at 98.4% near Olympic Stadium Area.',
      },
    });

    await prisma.review.create({
      data: {
        bookingId: completedBooking1.id,
        customerId: customerMichael.id,
        providerId: speedyProviderId,
        rating: 5,
        comment: 'Outstanding mobile diagnostic service! Sokha arrived with specialized diagnostic tablets and resolved the error code quickly.',
        reply: 'Thank you Michael! Glad we could verify your Model Y battery health and suspension. Drive safely!',
        createdAt: new Date(Date.now() - 80000000),
      },
    });

    // 7. Emergency Roadside Tire Rescue - COMPLETED (Tuol Kork)
    const completedBooking2 = await prisma.booking.create({
      data: {
        customerId: customerDara.id,
        providerId: speedyProviderId,
        vehicleId: vehLexus?.id,
        serviceType: '🚨 24/7 Roadside Emergency Rescue',
        scheduledDate: new Date(Date.now() - 2 * 86400000),
        scheduledTime: '01:15 PM',
        status: 'COMPLETED',
        notes: 'Emergency tire replacement on front right wheel after sharp road debris near Tuol Kork roundabout.',
      },
    });

    await prisma.review.create({
      data: {
        bookingId: completedBooking2.id,
        customerId: customerDara.id,
        providerId: speedyProviderId,
        rating: 5,
        comment: 'Saved my day near Tuol Kork! Got a sidewall blowout on St 598 and Sokha arrived in 18 minutes with a hydraulic jack. Professional and fast.',
        reply: 'Always happy to assist Dara! Keep our 24/7 emergency dispatch on speed dial.',
        createdAt: new Date(Date.now() - 2 * 86400000 + 7200000),
      },
    });

    // 8. Dead Battery Jumpstart - COMPLETED (Aeon Sen Sok)
    const completedBooking3 = await prisma.booking.create({
      data: {
        customerId: customerVannak.id,
        providerId: speedyProviderId,
        vehicleId: vehRanger?.id,
        serviceType: '⚡ Dead Battery Jumpstart & Alternator Scan',
        scheduledDate: new Date(Date.now() - 3 * 86400000),
        scheduledTime: '11:00 AM',
        status: 'COMPLETED',
        notes: 'Basement parking rescue. 1000A booster pack started the 2.0L bi-turbo diesel immediately.',
      },
    });

    await prisma.review.create({
      data: {
        bookingId: completedBooking3.id,
        customerId: customerVannak.id,
        providerId: speedyProviderId,
        rating: 5,
        comment: 'Engine died in Aeon Sen Sok basement parking. Sokha brought heavy-duty booster cables and tested the alternator before leaving. Top mechanic in Phnom Penh!',
        reply: 'Much appreciated Vannak! Make sure to schedule an alternator brush inspection in 6 months.',
        createdAt: new Date(Date.now() - 3 * 86400000 + 3600000),
      },
    });

    // 9. Ceramic Brake Pad Replacement - COMPLETED (BKK1)
    const completedBooking4 = await prisma.booking.create({
      data: {
        customerId: customerSreymom.id,
        providerId: speedyProviderId,
        vehicleId: vehMazda?.id,
        serviceType: 'Ceramic Brake Pad Replacement',
        scheduledDate: new Date(Date.now() - 5 * 86400000),
        scheduledTime: '04:30 PM',
        status: 'COMPLETED',
        notes: 'Installed premium Akebono front ceramic pads and bled the hydraulic brake lines.',
      },
    });

    await prisma.review.create({
      data: {
        bookingId: completedBooking4.id,
        customerId: customerSreymom.id,
        providerId: speedyProviderId,
        rating: 4,
        comment: 'Clean workshop operation. Replaced front brake pads and flushed the brake fluid. Small wait during peak noon rush, but quality is unmistakable.',
        reply: "Thank you for the detailed feedback Sreymom! We've added an extra bay to reduce peak noon wait times.",
        createdAt: new Date(Date.now() - 5 * 86400000 + 10000000),
      },
    });

    // 10. Radiator Coolant Flush - COMPLETED (Riverside Sisowath Quay)
    const completedBooking5 = await prisma.booking.create({
      data: {
        customerId: customerSophea.id,
        providerId: speedyProviderId,
        vehicleId: vehLandCruiser?.id,
        serviceType: 'Radiator Coolant Flush & Pressure Test',
        scheduledDate: new Date(Date.now() - 7 * 86400000),
        scheduledTime: '10:00 AM',
        status: 'COMPLETED',
        notes: 'Full cooling system purge and OEM Toyota Super Long Life Coolant fill.',
      },
    });

    await prisma.review.create({
      data: {
        bookingId: completedBooking5.id,
        customerId: customerSophea.id,
        providerId: speedyProviderId,
        rating: 5,
        comment: 'Very thorough service for my Land Cruiser. Tested thermostat opening temperature and purged air bubbles completely. Highly recommended!',
        reply: 'Pleasure working on your LC300 Sophea. Enjoy your long drive to Siem Reap!',
        createdAt: new Date(Date.now() - 7 * 86400000 + 14000000),
      },
    });

    // 11. Synthetic Oil Change - COMPLETED (CamTech Campus Area)
    const completedBooking6 = await prisma.booking.create({
      data: {
        customerId: customer.id,
        providerId: speedyProviderId,
        vehicleId: vehCamry?.id,
        serviceType: 'Oil Change & Comprehensive Inspection',
        scheduledDate: new Date(Date.now() - 10 * 86400000),
        scheduledTime: '02:00 PM',
        status: 'COMPLETED',
        notes: 'Mobil 1 Full Synthetic 5W-30 fill with OEM filter change and 25-point visual check.',
      },
    });

    await prisma.review.create({
      data: {
        bookingId: completedBooking6.id,
        customerId: customer.id,
        providerId: speedyProviderId,
        rating: 5,
        comment: 'Affordable genuine Mobil 1 synthetic oil change. He even topped off the washer fluid and checked tire pressures without charging extra.',
        reply: 'You are welcome! Regular maintenance is the key to engine longevity.',
        createdAt: new Date(Date.now() - 10 * 86400000 + 8000000),
      },
    });

    // Recalculate rating and total reviews for Speedy Auto Fix
    const allSpeedyReviews = await prisma.review.findMany({ where: { providerId: speedyProviderId } });
    const speedyAvg = allSpeedyReviews.reduce((sum, r) => sum + r.rating, 0) / allSpeedyReviews.length;
    await prisma.serviceProvider.update({
      where: { id: speedyProviderId },
      data: {
        rating: Math.round(speedyAvg * 10) / 10,
        totalReviews: allSpeedyReviews.length,
      },
    });

    // Seed reviews for other providers as well
    if (providerMap['dara@test.com']) {
      const daraProvId = providerMap['dara@test.com'];
      const daraB1 = await prisma.booking.create({
        data: {
          customerId: customerDara.id,
          providerId: daraProvId,
          vehicleId: vehLexus?.id,
          serviceType: 'Exhaust Repair & Tuning',
          scheduledDate: new Date(Date.now() - 3 * 86400000),
          scheduledTime: '01:00 PM',
          status: 'COMPLETED',
          notes: 'Custom stainless steel exhaust installation.',
        },
      });
      await prisma.review.create({
        data: {
          bookingId: daraB1.id,
          customerId: customerDara.id,
          providerId: daraProvId,
          rating: 5,
          comment: 'Best performance exhaust tuning shop in Tuol Kork. Deep exhaust tone without any highway drone.',
          reply: 'Thanks Dara! Custom tig welds are guaranteed for 2 years.',
          createdAt: new Date(Date.now() - 3 * 86400000 + 5000000),
        },
      });
      await prisma.serviceProvider.update({
        where: { id: daraProvId },
        data: { rating: 4.8, totalReviews: 1 },
      });
    }

    if (providerMap['sreymom@test.com']) {
      const sreyProvId = providerMap['sreymom@test.com'];
      const sreyB1 = await prisma.booking.create({
        data: {
          customerId: customerVannak.id,
          providerId: sreyProvId,
          vehicleId: vehRanger?.id,
          serviceType: 'AC Recharge & Compressor Fix',
          scheduledDate: new Date(Date.now() - 4 * 86400000),
          scheduledTime: '10:30 AM',
          status: 'COMPLETED',
          notes: 'Compressor clutch rebuild and R134a refrigerant charge.',
        },
      });
      await prisma.review.create({
        data: {
          bookingId: sreyB1.id,
          customerId: customerVannak.id,
          providerId: sreyProvId,
          rating: 5,
          comment: 'AC was blowing warm air in Cambodia 38°C heat. Sreymom replaced the compressor O-rings and recharged R134a refrigerant. Freezing cold now!',
          reply: 'Stay cool Vannak! Our AC pressure warranty covers you for 6 months.',
          createdAt: new Date(Date.now() - 4 * 86400000 + 6000000),
        },
      });
      await prisma.serviceProvider.update({
        where: { id: sreyProvId },
        data: { rating: 5.0, totalReviews: 1 },
      });
    }

    console.log('✅ Seeded fresh realistic live incoming, today, and completed bookings + reviews for all providers');
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

  // ── ADMIN USER ────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@techtune.com' },
    update: {},
    create: {
      name: 'TechTune Admin',
      email: 'admin@techtune.com',
      phone: '+85500000000',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────────────');
  console.log('  CUSTOMER  → customer@test.com   / password123');
  console.log('  PROVIDER  → sokha@test.com      / password123');
  console.log('  (+ 5 more mechanic providers seeded)');
  console.log(`  PRODUCTS  → ${products.length} products in ${categories.length} categories`);
  console.log('  ADMIN     → admin@techtune.com  / admin123');
  console.log('─────────────────────────────────────────────────');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

