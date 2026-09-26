export type Language = "en" | "km";

export interface TranslationDictionary {
  // Common & Actions
  search: string;
  cancel: string;
  confirm: string;
  save: string;
  back: string;
  close: string;
  viewAll: string;
  viewDetails: string;
  bookNow: string;
  accept: string;
  decline: string;
  call: string;
  chat: string;
  loading: string;
  error: string;
  success: string;
  online: string;
  offline: string;
  language: string;
  selectLanguage: string;
  english: string;
  khmer: string;
  later: string;
  filter: string;
  all: string;
  pending: string;
  accepted: string;
  inProgress: string;
  completed: string;
  cancelled: string;

  // Navigation & Tabs
  tabHome: string;
  tabSearch: string;
  tabBookings: string;
  tabServices: string;
  tabProfile: string;
  tabDashboard: string;
  tabSchedule: string;
  tabReviews: string;
  tabEarnings: string;

  // Home Screen
  greeting: string;
  driver: string;
  changeLocation: string;
  serviceInProgress: string;
  mechanicEnRoute: string;
  requestDispatched: string;
  trackLiveStatus: string;
  emergencySosTitle: string;
  emergencySosSub: string;
  dispatchNow: string;
  myGarage: string;
  manageVehicles: string;
  healthScore: string;
  viewDiagnostics: string;
  allSystemsNominal: string;
  attentionNeeded: string;
  quickServices: string;
  diagnosticsAi: string;
  breakdownRescue: string;
  oilLube: string;
  tiresWheels: string;
  batteryCare: string;
  fuelDelivery: string;
  evCharging: string;
  transmission: string;
  topRatedMechanics: string;
  nearbyPhnomPenh: string;
  recentBookings: string;
  noRecentBookings: string;
  browseServices: string;

  // Search Screen
  searchPlaceholder: string;
  allSpecialists: string;
  fuelEvStations: string;
  mechanicsNearby: string;
  matchedSpecialists: string;
  filterBy: string;
  distance: string;
  rating: string;
  price: string;
  gasFuelStations: string;
  evChargingStations: string;

  // Diagnostics & Results
  diagnosticsTitle: string;
  symptomsSub: string;
  runDiagnosis: string;
  matchedMechanicsFound: string;
  immediateAttention: string;
  possibleCauses: string;
  suggestedActions: string;
  bookMatchedSpecialist: string;
  viewAllOnMap: string;
  emergencyWarning: string;
  confidenceScore: string;
  estimatedFixTime: string;
  partsLikelyNeeded: string;

  // Garage Screen
  garageTitle: string;
  vehicleTelemetry: string;
  odometer: string;
  batteryHealth: string;
  engineStatus: string;
  tirePressure: string;
  oilLife: string;
  brakePads: string;
  telemetry: string;
  specs: string;
  history: string;
  addVehicle: string;
  selectActiveVehicle: string;
  vehicleDetails: string;
  nominal: string;
  warning: string;
  critical: string;

  // Emergency Screen
  emergencyTitle: string;
  emergencySub: string;
  sosSent: string;
  sosNotice: string;
  cancelSos: string;
  callHotline: string;
  requestTowTruck: string;
  jumpStart: string;
  flatTireFix: string;
  lockoutRescue: string;

  // Bookings Screen
  bookingsTitle: string;
  activeBookings: string;
  pastBookings: string;
  noBookings: string;
  bookingDetails: string;
  date: string;
  time: string;
  statusLabel: string;
  totalPrice: string;
  reschedule: string;
  cancelBooking: string;
  trackMechanic: string;
  leaveReview: string;
  serviceType: string;
  assignedMechanic: string;

  // Profile Screen
  profileTitle: string;
  editProfile: string;
  myVehicles: string;
  paymentMethods: string;
  languageRegion: string;
  supportHelp: string;
  privacySecurity: string;
  logout: string;
  logoutConfirm: string;
  version: string;
  garageHub: string;
  notifications: string;

  // Provider Dashboard
  providerDashboard: string;
  welcomeBack: string;
  dutyOnline: string;
  dutyOffline: string;
  dutySubtitle: string;
  dutyOfflineSubtitle: string;
  todayJobs: string;
  pendingJobs: string;
  monthRevenue: string;
  radarView: string;
  listView: string;
  acceptJob: string;
  declineJob: string;
  startNavigation: string;
  activeDispatches: string;
  jobAccepted: string;
  incomingRequestsInRange: string;
  tapPinToView: string;
  startGpsNavPrompt: string;
  enRouteCustomer: string;
  urgentBreakdown: string;
  scheduledDispatch: string;

  // Provider Settings & Schedule
  workingSchedule: string;
  serviceOfferings: string;
  customerReviews: string;
  earningsReport: string;
  dispatchRadius: string;
  emergencyOnCall: string;

  // Auth & Roles
  loginTitle: string;
  registerTitle: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  switchRole: string;

  // Extra Telemetry & Search
  findingMechanics: string;
  range: string;
  nextService: string;
  status: string;
  optimal: string;
  liveTelemetry: string;
  specifications: string;
  serviceLog: string;
  availableNow: string;

  // Diagnostics & Emergency extras
  severityLow: string;
  severityMedium: string;
  severityHigh: string;
  scheduleSoon: string;
  minorIssue: string;
  matchedMechanics: string;
  match: string;
  bookSpecialist: string;
  estimatedCost: string;
  recommendedService: string;
  flatTire: string;
  deadBattery: string;
  engineFault: string;
  refresh: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    // Common & Actions
    search: "Search",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    back: "Back",
    close: "Close",
    viewAll: "View All",
    viewDetails: "View Details",
    bookNow: "Book Now",
    accept: "Accept",
    decline: "Decline",
    call: "Call",
    chat: "Chat",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    online: "Online",
    offline: "Offline",
    language: "Language",
    selectLanguage: "Select Language",
    english: "English",
    khmer: "ភាសាខ្មែរ",
    later: "Later",
    filter: "Filter",
    all: "All",
    pending: "Pending",
    accepted: "Accepted",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",

    // Navigation & Tabs
    tabHome: "Home",
    tabSearch: "Search",
    tabBookings: "Bookings",
    tabServices: "Services",
    tabProfile: "Profile",
    tabDashboard: "Dashboard",
    tabSchedule: "Schedule",
    tabReviews: "Reviews",
    tabEarnings: "Earnings",

    // Home Screen
    greeting: "Hey",
    driver: "Driver",
    changeLocation: "Change Location",
    serviceInProgress: "SERVICE IN PROGRESS",
    mechanicEnRoute: "MECHANIC EN ROUTE",
    requestDispatched: "REQUEST DISPATCHED",
    trackLiveStatus: "Track Live Status",
    emergencySosTitle: "24/7 Roadside Rescue SOS",
    emergencySosSub: "Breakdown on road? Expert mobile mechanics arrive in 15 mins",
    dispatchNow: "Dispatch Now",
    myGarage: "My Garage",
    manageVehicles: "Manage",
    healthScore: "Health Score",
    viewDiagnostics: "View Diagnostics",
    allSystemsNominal: "All Systems Nominal",
    attentionNeeded: "Attention Needed",
    quickServices: "Quick Services",
    diagnosticsAi: "Diagnostics",
    breakdownRescue: "Rescue SOS",
    oilLube: "Oil & Lube",
    tiresWheels: "Tires",
    batteryCare: "Battery",
    fuelDelivery: "Fuel Pump",
    evCharging: "EV Charge",
    transmission: "Gearbox",
    topRatedMechanics: "Top-Rated Specialists",
    nearbyPhnomPenh: "Nearby in Phnom Penh",
    recentBookings: "Recent Bookings",
    noRecentBookings: "No recent bookings yet",
    browseServices: "Browse Services",

    // Search Screen
    searchPlaceholder: "Search mechanics, services or garages...",
    allSpecialists: "All Specialists",
    fuelEvStations: "Fuel & EV Stations",
    mechanicsNearby: "Mechanics Nearby",
    matchedSpecialists: "Matched Specialists",
    filterBy: "Filter by",
    distance: "Distance",
    rating: "Rating",
    price: "Price",
    gasFuelStations: "Fuel Stations",
    evChargingStations: "EV Chargers",

    // Diagnostics & Results
    diagnosticsTitle: "Car Diagnostics",
    symptomsSub: "Select symptoms you are experiencing",
    runDiagnosis: "Analyze Symptoms",
    matchedMechanicsFound: "Matched Mechanics Ready to Fix",
    immediateAttention: "Immediate Attention",
    possibleCauses: "Possible Causes",
    suggestedActions: "Suggested Actions",
    bookMatchedSpecialist: "Book Matched Specialist",
    viewAllOnMap: "View All on Map",
    emergencyWarning: "Urgent Warning",
    confidenceScore: "Confidence Score",
    estimatedFixTime: "Estimated Fix Time",
    partsLikelyNeeded: "Parts Likely Needed",

    // Garage Screen
    garageTitle: "Vehicle Garage",
    vehicleTelemetry: "Vehicle Telemetry",
    odometer: "Odometer",
    batteryHealth: "Battery Health",
    engineStatus: "Engine Status",
    tirePressure: "Tire Pressure",
    oilLife: "Oil Life",
    brakePads: "Brake Pads",
    telemetry: "Telemetry",
    specs: "Specs",
    history: "History",
    addVehicle: "Add Vehicle",
    selectActiveVehicle: "Select Active Vehicle",
    vehicleDetails: "Vehicle Details",
    nominal: "Good",
    warning: "Warning",
    critical: "Critical",

    // Emergency Screen
    emergencyTitle: "Roadside Emergency Assistance",
    emergencySub: "24/7 Immediate Help Across Phnom Penh",
    sosSent: "SOS Dispatched!",
    sosNotice: "Rescue team is en route to your location",
    cancelSos: "Cancel SOS",
    callHotline: "Call Emergency Hotline",
    requestTowTruck: "Tow Truck Rescue",
    jumpStart: "Battery Jump-Start",
    flatTireFix: "Flat Tire Replacement",
    lockoutRescue: "Lockout Rescue",

    // Bookings Screen
    bookingsTitle: "My Bookings",
    activeBookings: "Active",
    pastBookings: "History",
    noBookings: "No bookings found",
    bookingDetails: "Booking Details",
    date: "Date",
    time: "Time",
    statusLabel: "Status",
    totalPrice: "Total Price",
    reschedule: "Reschedule",
    cancelBooking: "Cancel Booking",
    trackMechanic: "Track Mechanic",
    leaveReview: "Leave Review",
    serviceType: "Service Type",
    assignedMechanic: "Assigned Specialist",

    // Profile Screen
    profileTitle: "My Profile",
    editProfile: "Edit Profile",
    myVehicles: "My Vehicles",
    paymentMethods: "Payment Methods",
    languageRegion: "Language & Region",
    supportHelp: "Help & Support",
    privacySecurity: "Privacy & Security",
    logout: "Sign Out",
    logoutConfirm: "Are you sure you want to sign out?",
    version: "Version",
    garageHub: "Garage & Telemetry",
    notifications: "Notifications",

    // Provider Dashboard
    providerDashboard: "Provider Dashboard",
    welcomeBack: "Welcome back,",
    dutyOnline: "Duty Online",
    dutyOffline: "Duty Offline",
    dutySubtitle: "You are receiving live roadside requests",
    dutyOfflineSubtitle: "Go online to start receiving job requests",
    todayJobs: "Today's Jobs",
    pendingJobs: "Pending Requests",
    monthRevenue: "This Month",
    radarView: "Radar Map",
    listView: "List View",
    acceptJob: "Accept Job",
    declineJob: "Decline",
    startNavigation: "Start Navigation",
    activeDispatches: "Active Dispatches",
    jobAccepted: "Job Accepted! 🚗",
    incomingRequestsInRange: "incoming requests in range · Tap a pin",
    tapPinToView: "Tap pin to view",
    startGpsNavPrompt: "Request moved to Active Dispatches. Would you like to start GPS dispatch navigation to the customer now?",
    enRouteCustomer: "En Route ·",
    urgentBreakdown: "🚨 Urgent Breakdown",
    scheduledDispatch: "Scheduled Dispatch",

    // Provider Settings & Schedule
    workingSchedule: "Working Schedule",
    serviceOfferings: "Service Offerings",
    customerReviews: "Customer Reviews",
    earningsReport: "Earnings Report",
    dispatchRadius: "Dispatch Radius",
    emergencyOnCall: "Emergency On-Call (24/7)",

    // Auth & Roles
    loginTitle: "Sign In",
    registerTitle: "Create Account",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    phone: "Phone Number",
    dontHaveAccount: "Don't have an account? Sign Up",
    alreadyHaveAccount: "Already have an account? Sign In",
    switchRole: "Switch Role",

    // Extra Telemetry & Search
    findingMechanics: "Finding nearby mechanics...",
    range: "RANGE",
    nextService: "NEXT SERVICE",
    status: "STATUS",
    optimal: "Optimal",
    liveTelemetry: "Live Telemetry",
    specifications: "Specifications",
    serviceLog: "Service Log",
    availableNow: "Available Now",

    // Diagnostics & Emergency extras
    severityLow: "Low Priority",
    severityMedium: "Medium Priority",
    severityHigh: "High Priority (Immediate)",
    scheduleSoon: "Schedule Service Soon",
    minorIssue: "Minor Issue Detected",
    matchedMechanics: "Specialists Matched for Your Issue",
    match: "Match",
    bookSpecialist: "Book Specialist",
    estimatedCost: "EST. COST",
    recommendedService: "RECOMMENDED SERVICE",
    flatTire: "Flat Tire",
    deadBattery: "Dead Battery",
    engineFault: "Engine Failure",
    refresh: "Refresh",
  },

  km: {
    // Common & Actions
    search: "ស្វែងរក",
    cancel: "បោះបង់",
    confirm: "បញ្ជាក់",
    save: "រក្សាទុក",
    back: "ត្រឡប់ក្រោយ",
    close: "បិទ",
    viewAll: "មើលទាំងអស់",
    viewDetails: "ព័ត៌មានលម្អិត",
    bookNow: "កក់ឥឡូវនេះ",
    accept: "ទទួលយក",
    decline: "បដិសេធ",
    call: "ទូរស័ព្ទ",
    chat: "ផ្ញើសារ",
    loading: "កំពុងដំណើរការ...",
    error: "មានបញ្ហា",
    success: "ជោគជ័យ",
    online: "បើកទទួលការងារ",
    offline: "បិទការងារ",
    language: "ភាសា",
    selectLanguage: "ជ្រើសរើសភាសា",
    english: "English",
    khmer: "ភាសាខ្មែរ",
    later: "ពេលក្រោយ",
    filter: "ចម្រោះ",
    all: "ទាំងអស់",
    pending: "រង់ចាំទទួល",
    accepted: "បានយល់ព្រម",
    inProgress: "កំពុងដំណើរការ",
    completed: "បានបញ្ចប់",
    cancelled: "បានបោះបង់",

    // Navigation & Tabs
    tabHome: "ទំព័រដើម",
    tabSearch: "ស្វែងរក",
    tabBookings: "ការកក់",
    tabServices: "សេវាកម្ម",
    tabProfile: "គណនី",
    tabDashboard: "ផ្ទាំងគ្រប់គ្រង",
    tabSchedule: "កាលវិភាគ",
    tabReviews: "ការវាយតម្លៃ",
    tabEarnings: "ចំណូល",

    // Home Screen
    greeting: "សួស្តី",
    driver: "អ្នកបើកបរ",
    changeLocation: "ប្តូរទីតាំង",
    serviceInProgress: "សេវាកម្មកំពុងដំណើរការ",
    mechanicEnRoute: "ជាងកំពុងធ្វើដំណើរមក",
    requestDispatched: "សំណើត្រូវបានបញ្ជូន",
    trackLiveStatus: "តាមដានស្ថានភាពផ្ទាល់",
    emergencySosTitle: "សង្គ្រោះបន្ទាន់លើដងផ្លូវ 24/7",
    emergencySosSub: "ខូចរថយន្តតាមផ្លូវ? ជាងជំនាញចល័តចុះទៅដល់ក្នុងរយៈពេល 15 នាទី",
    dispatchNow: "ហៅជាងបន្ទាន់",
    myGarage: "យានដ្ឋានរបស់ខ្ញុំ",
    manageVehicles: "គ្រប់គ្រង",
    healthScore: "ពិន្ទុស្ថានភាព",
    viewDiagnostics: "ពិនិត្យរោគវិនិច្ឆ័យ",
    allSystemsNominal: "ប្រព័ន្ធទាំងអស់ដំណើរការល្អ",
    attentionNeeded: "ត្រូវការត្រួតពិនិត្យ",
    quickServices: "សេវាកម្មរហ័ស",
    diagnosticsAi: "វិភាគ AI",
    breakdownRescue: "សង្គ្រោះបន្ទាន់",
    oilLube: "ប្រេងម៉ាស៊ីន",
    tiresWheels: "សំបកកង់",
    batteryCare: "អាគុយ",
    fuelDelivery: "ប្រេងឥន្ធនៈ",
    evCharging: "សាកភ្លើង EV",
    transmission: "ប្រអប់លេខ",
    topRatedMechanics: "ជាងជំនាញឆ្នើម",
    nearbyPhnomPenh: "នៅជិតអ្នកក្នុងរាជធានីភ្នំពេញ",
    recentBookings: "ការកក់ថ្មីៗ",
    noRecentBookings: "មិនទាន់មានការកក់នៅឡើយទេ",
    browseServices: "ស្វែងរកសេវាកម្ម",

    // Search Screen
    searchPlaceholder: "ស្វែងរកជាង, សេវាកម្ម ឬយានដ្ឋាន...",
    allSpecialists: "ជាងជំនាញទាំងអស់",
    fuelEvStations: "ស្ថានីយប្រេង & EV",
    mechanicsNearby: "ជាងជំនាញនៅជិតអ្នក",
    matchedSpecialists: "ជាងត្រូវតាមបញ្ហារថយន្ត",
    filterBy: "ចម្រោះតាម",
    distance: "ចម្ងាយ",
    rating: "ការវាយតម្លៃ",
    price: "តម្លៃ",
    gasFuelStations: "ស្ថានីយប្រេងឥន្ធនៈ",
    evChargingStations: "កន្លែងសាកភ្លើង EV",

    // Diagnostics & Results
    diagnosticsTitle: "ការវិនិច្ឆ័យរថយន្ត",
    symptomsSub: "ជ្រើសរើសរោគសញ្ញាដែលអ្នកកំពុងជួបប្រទះ",
    runDiagnosis: "ចាប់ផ្តើមវិភាគរោគសញ្ញា",
    matchedMechanicsFound: "ជាងជំនាញដែលផ្គូផ្គងរួចរាល់",
    immediateAttention: "ការយកចិត្តទុកដាក់បន្ទាន់",
    possibleCauses: "មូលហេតុដែលអាចកើតមាន",
    suggestedActions: "សកម្មភាពដែលបានណែនាំ",
    bookMatchedSpecialist: "កក់ជាងជំនាញនេះ",
    viewAllOnMap: "មើលទាំងអស់លើផែនទី",
    emergencyWarning: "ការព្រមានបន្ទាន់",
    confidenceScore: "កម្រិតទំនុកចិត្ត AI",
    estimatedFixTime: "រយៈពេលជួសជុលប៉ាន់ស្មាន",
    partsLikelyNeeded: "គ្រឿងបន្លាស់ដែលត្រូវការ",

    // Garage Screen
    garageTitle: "យានដ្ឋានយានយន្ត",
    vehicleTelemetry: "ទិន្នន័យរថយន្ត",
    odometer: "ចម្ងាយរត់បាន (km)",
    batteryHealth: "សុខភាពអាគុយ",
    engineStatus: "ស្ថានភាពម៉ាស៊ីន",
    tirePressure: "សម្ពាធកង់",
    oilLife: "អាយុកាលប្រេង",
    brakePads: "ស្បែកហ្វ្រាំង",
    telemetry: "ទិន្នន័យ",
    specs: "លក្ខណៈបច្ចេកទេស",
    history: "ប្រវត្តិ",
    addVehicle: "បន្ថែមរថយន្តថ្មី",
    selectActiveVehicle: "ជ្រើសរើសរថយន្តប្រើប្រាស់",
    vehicleDetails: "ព័ត៌មានលម្អិតរថយន្ត",
    nominal: "ល្អ",
    warning: "ព្រមាន",
    critical: "គ្រោះថ្នាក់",

    // Emergency Screen
    emergencyTitle: "សង្គ្រោះបន្ទាន់លើដងផ្លូវ",
    emergencySub: "ជំនួយបន្ទាន់ 24/7 ទូទាំងរាជធានីភ្នំពេញ",
    sosSent: "បានបញ្ជូនសញ្ញា SOS!",
    sosNotice: "ក្រុមសង្គ្រោះកំពុងធ្វើដំណើរមកកាន់ទីតាំងរបស់អ្នក",
    cancelSos: "បោះបង់ SOS",
    callHotline: "ទូរស័ព្ទទៅកាន់លេខបន្ទាន់",
    requestTowTruck: "ហៅឡានសណ្តោង",
    jumpStart: "ជំនួយសាកអាគុយ",
    flatTireFix: "ប្តូរសំបកកង់បែក",
    lockoutRescue: "ជំនួយបើកទ្វារចាក់សោ",

    // Bookings Screen
    bookingsTitle: "ការកក់របស់ខ្ញុំ",
    activeBookings: "សកម្ម",
    pastBookings: "ប្រវត្តិ",
    noBookings: "គ្មានការកក់ទេ",
    bookingDetails: "ព័ត៌មានលម្អិតនៃការកក់",
    date: "កាលបរិច្ឆេទ",
    time: "ពេលវេលា",
    statusLabel: "ស្ថានភាព",
    totalPrice: "តម្លៃសរុប",
    reschedule: "ពន្យារពេល",
    cancelBooking: "បោះបង់ការកក់",
    trackMechanic: "តាមដានជាង",
    leaveReview: "ផ្តល់ការវាយតម្លៃ",
    serviceType: "ប្រភេទសេវាកម្ម",
    assignedMechanic: "ជាងជំនាញទទួលបន្ទុក",

    // Profile Screen
    profileTitle: "គណនីរបស់ខ្ញុំ",
    editProfile: "កែប្រែគណនី",
    myVehicles: "រថយន្តរបស់ខ្ញុំ",
    paymentMethods: "វិធីសាស្រ្តទូទាត់",
    languageRegion: "ភាសា & តំបន់",
    supportHelp: "ជំនួយ & សេវាអតិថិជន",
    privacySecurity: "ភាពឯកជន & សុវត្ថិភាព",
    logout: "ចាកចេញពីគណនី",
    logoutConfirm: "តើអ្នកពិតជាចង់ចាកចេញមែនទេ?",
    version: "ជំនាន់កម្មវិធី",
    garageHub: "យានដ្ឋាន & ទិន្នន័យរថយន្ត",
    notifications: "ការជូនដំណឹង",

    // Provider Dashboard
    providerDashboard: "ផ្ទាំងគ្រប់គ្រងជាង",
    welcomeBack: "សូមស្វាគមន៍មកវិញ,",
    dutyOnline: "បើកទទួលការងារ",
    dutyOffline: "បិទការងារ",
    dutySubtitle: "អ្នកកំពុងទទួលការងារសង្គ្រោះបន្ទាន់ និងការកក់ថ្មីៗ",
    dutyOfflineSubtitle: "បើកដើម្បីចាប់ផ្តើមទទួលការងារពីអតិថិជន",
    todayJobs: "ការងារថ្ងៃនេះ",
    pendingJobs: "ការងាររង់ចាំទទួល",
    monthRevenue: "ចំណូលខែនេះ",
    radarView: "រ៉ាដាផែនទី",
    listView: "បញ្ជីការងារ",
    acceptJob: "ទទួលការងារ",
    declineJob: "បដិសេធ",
    startNavigation: "ចាប់ផ្តើមធ្វើដំណើរ",
    activeDispatches: "កំពុងដំណើរការទៅជួសជុល",
    jobAccepted: "បានទទួលការងារជោគជ័យ! 🚗",
    incomingRequestsInRange: "សំណើការងារក្នុងតំបន់ · ចុចលើម្ជុលផែនទី",
    tapPinToView: "ចុចម្ជុលដើម្បីមើល",
    startGpsNavPrompt: "ការងារត្រូវបានផ្លាស់ប្តូរទៅកាន់ផ្នែកកំពុងដំណើរការ។ តើអ្នកចង់ចាប់ផ្តើមរុករក GPS ទៅកាន់អតិថិជនឥឡូវនេះទេ?",
    enRouteCustomer: "កំពុងធ្វើដំណើរទៅជួប ·",
    urgentBreakdown: "🚨 ករណីខូចរថយន្តបន្ទាន់",
    scheduledDispatch: "ការណាត់ជួសជុល",

    // Provider Settings & Schedule
    workingSchedule: "កាលវិភាគធ្វើការ",
    serviceOfferings: "សេវាកម្មដែលផ្តល់ជូន",
    customerReviews: "ការវាយតម្លៃពីអតិថិជន",
    earningsReport: "របាយការណ៍ចំណូល",
    dispatchRadius: "កាំនៃការចុះជួសជុល",
    emergencyOnCall: "ត្រៀមសង្គ្រោះបន្ទាន់ (24/7)",

    // Auth & Roles
    loginTitle: "ចូលប្រើប្រាស់",
    registerTitle: "បង្កើតគណនីថ្មី",
    email: "អ៊ីមែល",
    password: "ពាក្យសម្ងាត់",
    fullName: "ឈ្មោះពេញ",
    phone: "លេខទូរស័ព្ទ",
    dontHaveAccount: "មិនទាន់មានគណនី? ចុះឈ្មោះ",
    alreadyHaveAccount: "មានគណនីរួចហើយ? ចូលប្រើ",
    switchRole: "ប្តូរតួនាទី",

    // Extra Telemetry & Search
    findingMechanics: "កំពុងស្វែងរកជាងជំនាញនៅក្បែរ...",
    range: "ចម្ងាយធ្វើដំណើរ",
    nextService: "សេវាបន្ទាប់",
    status: "ស្ថានភាព",
    optimal: "ល្អឥតខ្ចោះ",
    liveTelemetry: "ទិន្នន័យជាក់ស្តែង",
    specifications: "លក្ខណៈបច្ចេកទេស",
    serviceLog: "កំណត់ត្រាសេវាកម្ម",
    availableNow: "បើកដំណើរការឥឡូវនេះ",

    // Diagnostics & Emergency extras
    severityLow: "អាទិភាពទាប",
    severityMedium: "អាទិភាពមធ្យម",
    severityHigh: "អាទិភាពខ្ពស់ (បន្ទាន់)",
    scheduleSoon: "គួរកក់សេវាឆាប់ៗ",
    minorIssue: "បញ្ហាបន្តិចបន្តួច",
    matchedMechanics: "ជាងជំនាញដែលផ្គូផ្គងជាមួយបញ្ហារបស់អ្នក",
    match: "ផ្គូផ្គង",
    bookSpecialist: "កក់ជាងជំនាញ",
    estimatedCost: "តម្លៃប៉ាន់ស្មាន",
    recommendedService: "សេវាកម្មដែលណែនាំ",
    flatTire: "បែកកង់ឡាន",
    deadBattery: "អស់អាគុយ",
    engineFault: "ខូចម៉ាស៊ីន",
    refresh: "ផ្ទុកឡើងវិញ",
  },
};

export type TranslationKey = keyof TranslationDictionary;
