/* =========================================================
   SKYCARE NAVIGATOR | DEMO DATA
   ---------------------------------------------------------
   Everything the prototype "knows" lives in this one file:
     1. DEMO TRIPS ....... Trip A FLL → IST → DXB,
                           Trip B MIA → LHR → CDG
     2. SCENARIO CLOCK ... the moments used during the demo
     3. DEMO MAP ......... fictional terminal layout + places
     4. ROUTES ........... walking routes and times
     5. AIRPORT PACKS .... offline pack contents (demo)
     6. PHRASES .......... language assistance phrase book
     7. CONNECTIVITY ..... (per trip) destination guide
     8. MEALS ............ (per trip) meal service options
     9. HUMAN SERVICES ... who SkyCare routes you to

   All data is fictional demonstration content. The carrier
   "Demo Air" is invented. Gates, times, bag tags, and the
   terminal layout are NOT real airline or airport data.

   To replace the demo, edit values here. No other file needs
   to change unless you add new categories.

   This file is plain JavaScript (not JSON) on purpose, so the
   site still works when index.html is opened directly from a
   folder, where browsers block loading JSON files.
   ========================================================= */

window.SKYCARE_DATA = {

  /* -------------------------------------------------------
     1. DEMO TRIPS
     Two sample tickets so the "New Trip" flow can be shown.
     Both use the same FICTIONAL transfer-terminal layout
     (section 3) with the connection airport's name on it.
     Trip-specific text (emergency numbers, destination
     connectivity, meal service) lives inside each trip.
     ------------------------------------------------------- */
  trips: [
    {
      id: "ist",
      label: "Trip A",
      passenger: "Demo Traveler",
      bookingRef: "SKY7Q2",
      reservationCodes: ["SKY7Q2"],
      carrier: "Demo Air",
      carrierNote: "Fictional carrier used for this prototype",
      route: ["FLL", "IST", "DXB"],
      cities: { FLL: "Fort Lauderdale", IST: "Istanbul", DXB: "Dubai" },
      flights: [
        {
          id: "f1",
          number: "DA 1784",
          from: "FLL", to: "IST",
          depart: "11:40 PM", departDate: "Tue, Oct 13",
          arrive: "5:40 PM", arriveDate: "Wed, Oct 14",
          departTerminal: "Terminal 4", departGate: "G5",
          arriveTerminal: "Main Terminal", arriveGate: "A4",
          seat: "23C", duration: "11h 00m"
        },
        {
          id: "f2",
          number: "DA 762",
          from: "IST", to: "DXB",
          depart: "7:40 PM", departDate: "Wed, Oct 14",
          arrive: "12:55 AM", arriveDate: "Thu, Oct 15",
          departTerminal: "Main Terminal", departGate: "B18",
          arriveTerminal: "Terminal 3", arriveGate: "C12",
          seat: "18A", duration: "4h 15m",
          boardingStarts: "7:00 PM", boardingCloses: "7:22 PM",
          boardingStartsMin: 19 * 60,
          boardingClosesMin: 19 * 60 + 22 /* minutes after midnight, connection-airport local time */
        }
      ],
      connection: { airport: "IST", name: "Istanbul Airport", scheduled: "2h 00m" },
      baggage: {
        pieces: 1,
        tag: "DA 482915",
        checkedTo: "DXB",
        status: "Transferred",
        statusDetail: "Transfer scan recorded at IST (demo)"
      },
      needs: "None requested",
      preferences: {
        languages: ["English", "Arabic"],
        meal: "halal",
        seat: "Window",
        alerts: "Push + vibration"
      },
      localLang: "tr",
      simHint: "a UAE option",
      friendFrom: { code: "LHR", city: "London" },
      emergency: {
        short: "112 in Türkiye",
        label: "112 (Türkiye)",
        list: [["Türkiye · all emergencies", "112"], ["UAE · ambulance", "998"], ["UAE · police", "999"]]
      },
      connectivity: {
        destination: "Dubai (DXB)",
        options: [
          { title: "Roaming", body: "Check with your home carrier before departure. Roaming prices vary widely by plan, so SkyCare reminds you to confirm them before you land." },
          { title: "Local SIM", body: "Airport shops and carrier counters usually sell tourist SIMs. You will typically need your passport, and your phone must be unlocked." },
          { title: "eSIM", body: "Travel eSIMs can be installed before the trip. Your phone must support eSIM and be unlocked. A production version would list authorized partners only." },
          { title: "Airport Wi-Fi", body: "Most major airports offer Wi-Fi. The airport pack stores the network name and login steps from the airport's official information, so you can find it without data." },
          { title: "Emergency calling", body: "Emergency numbers are stored offline in the airport pack. In the UAE: Police 999, Ambulance 998. 112 is also widely supported on mobile phones." }
        ]
      },
      meals: {
        flight: "DA 762 · IST → DXB",
        service: "Dinner service (demo)",
        cutoff: "Preorder closes 24 hours before departure (demo value; each airline sets its own)",
        options: [
          { id: "chicken", name: "Chicken", note: "Grilled chicken, rice, seasonal vegetables" },
          { id: "vegetarian", name: "Vegetarian", note: "Vegetable moussaka, bulgur pilaf" },
          { id: "halal", name: "Halal", note: "Saved preference · Lamb kofta, rice" },
          { id: "kosher", name: "Kosher", note: "Sealed certified meal" },
          { id: "special", name: "Special dietary request", note: "Allergies, gluten-free, diabetic, and more" }
        ]
      },
      placeLabels: {}
    },
    {
      id: "lhr",
      label: "Trip B",
      passenger: "Demo Traveler",
      bookingRef: "SKY4L9",
      reservationCodes: ["SKY4L9"],
      carrier: "Demo Air",
      carrierNote: "Fictional carrier used for this prototype",
      route: ["MIA", "LHR", "CDG"],
      cities: { MIA: "Miami", LHR: "London", CDG: "Paris" },
      flights: [
        {
          id: "f1",
          number: "DA 211",
          from: "MIA", to: "LHR",
          depart: "6:25 PM", departDate: "Tue, Oct 13",
          arrive: "8:10 AM", arriveDate: "Wed, Oct 14",
          departTerminal: "North Terminal", departGate: "D22",
          arriveTerminal: "Terminal 5", arriveGate: "A4",
          seat: "31D", duration: "8h 45m"
        },
        {
          id: "f2",
          number: "DA 318",
          from: "LHR", to: "CDG",
          depart: "10:10 AM", departDate: "Wed, Oct 14",
          arrive: "12:25 PM", arriveDate: "Wed, Oct 14",
          departTerminal: "Terminal 5", departGate: "B18",
          arriveTerminal: "Terminal 2E", arriveGate: "K40",
          seat: "7F", duration: "1h 15m",
          boardingStarts: "9:30 AM", boardingCloses: "9:52 AM",
          boardingStartsMin: 9 * 60 + 30,
          boardingClosesMin: 9 * 60 + 52
        }
      ],
      connection: { airport: "LHR", name: "London Heathrow", scheduled: "2h 00m" },
      baggage: {
        pieces: 2,
        tag: "DA 730461",
        checkedTo: "CDG",
        status: "Transferred",
        statusDetail: "Transfer scan recorded at LHR (demo)"
      },
      needs: "None requested",
      preferences: {
        languages: ["English", "Arabic"],
        meal: "halal",
        seat: "Aisle",
        alerts: "Push + vibration"
      },
      localLang: "fr",
      simHint: "a French or EU-wide option",
      friendFrom: { code: "MAD", city: "Madrid" },
      emergency: {
        short: "999 or 112 in the UK",
        label: "999 or 112 (UK)",
        list: [["UK · all emergencies", "999 / 112"], ["France · all emergencies", "112"], ["France · medical (SAMU)", "15"]]
      },
      connectivity: {
        destination: "Paris (CDG)",
        options: [
          { title: "Roaming", body: "Check with your home carrier before departure. Some plans include EU roaming and some charge daily fees, so SkyCare reminds you to confirm before you land." },
          { title: "Local SIM", body: "Shops and carrier counters usually sell prepaid SIMs. You will typically need your passport, and your phone must be unlocked." },
          { title: "eSIM", body: "Travel eSIMs covering France or the whole EU can be installed before the trip. Your phone must support eSIM and be unlocked. A production version would list authorized partners only." },
          { title: "Airport Wi-Fi", body: "Most major airports offer Wi-Fi. The airport pack stores the network name and login steps from the airport's official information, so you can find it without data." },
          { title: "Emergency calling", body: "Emergency numbers are stored offline in the airport pack. In France: 112 for all emergencies, 15 for medical (SAMU), 17 for police." }
        ]
      },
      meals: {
        flight: "DA 318 · LHR → CDG",
        service: "Light snack service (demo)",
        cutoff: "Preorder closes 24 hours before departure (demo value; each airline sets its own)",
        options: [
          { id: "chicken", name: "Chicken", note: "Chicken wrap, fruit" },
          { id: "vegetarian", name: "Vegetarian", note: "Cheese and tomato sandwich" },
          { id: "halal", name: "Halal", note: "Saved preference · Halal chicken wrap" },
          { id: "kosher", name: "Kosher", note: "Sealed certified snack box" },
          { id: "special", name: "Special dietary request", note: "Allergies, gluten-free, diabetic, and more" }
        ]
      },
      placeLabels: { halal: "Thames Grill (halal)" }
    }
  ],

  /* -------------------------------------------------------
     2. SCENARIO CLOCK
     The prototype does not use the real time of day. Instead
     the presenter picks a moment in the journey. SkyCare's
     advice changes based on the moment chosen.
     beforeClose = minutes before the connecting flight's
     boarding closes (clock times are worked out per trip).
     ------------------------------------------------------- */
  scenarios: [
    { id: "landed",  beforeClose: 90, title: "Landed on time",  note: "90 minutes before boarding closes" },
    { id: "walking", beforeClose: 28, title: "Walking to gate", note: "28 minutes before boarding closes" },
    { id: "late",    beforeClose: 18, title: "Delayed arrival", note: "18 minutes before boarding closes" },
    { id: "risk",    beforeClose: 8,  title: "Very late",       note: "8 minutes before boarding closes" }
  ],

  /* -------------------------------------------------------
     3. DEMO TRANSFER-TERMINAL MAP
     A FICTIONAL layout used only to demonstrate the concept.
     It is not a real Istanbul, Heathrow, or any other
     airport floor plan. Both demo trips reuse it.
     Coordinates are in a 1000 × 560 drawing space.
     ------------------------------------------------------- */
  map: {
    /* title and disclaimer are set per trip by script.js,
       e.g. "IST DEMO TERMINAL MAP" / "LHR DEMO TERMINAL MAP" */
    title: "DEMO TERMINAL MAP",
    disclaimer: "Fictional layout for demonstration. Not an official airport floor plan.",
    you: { x: 120, y: 480, label: "You · Arrival Gate A4" },
    zones: [
      { label: "Arrivals Hall", x: 40,  y: 40,  w: 200, h: 170, kind: "landside" },
      { label: "Pier A", x: 90,  y: 330, w: 60,  h: 205, kind: "pier" },
      { label: "Pier B", x: 270, y: 45,  w: 60,  h: 235, kind: "pier" },
      { label: "Transfer Plaza", x: 425, y: 195, w: 190, h: 210, kind: "plaza" },
      { label: "Pier E", x: 680, y: 45,  w: 60,  h: 235, kind: "pier" },
      { label: "Pier F", x: 830, y: 320, w: 60,  h: 215, kind: "pier" }
    ],
    spine: { x: 60, y: 272, w: 900, h: 56 },
    stairs: { x: 700, y: 300, label: "Level change (stairs)" },
    places: [
      { id: "gateA4", cat: "gate", label: "Gate A4", x: 120, y: 505 },
      { id: "gateB18", cat: "gate", label: "Gate B18", x: 300, y: 72 },
      { id: "gateF7", cat: "gate", label: "Gate F7", x: 860, y: 512 },

      { id: "wc1", cat: "restroom", label: "Restroom", x: 205, y: 300, access: true },
      { id: "wc2", cat: "restroom", label: "Restroom", x: 300, y: 175 },
      { id: "wc3", cat: "restroom", label: "Restroom", x: 770, y: 300 },
      { id: "wc4", cat: "restroom", label: "Accessible restroom", x: 735, y: 348, access: true },
      { id: "wc5", cat: "restroom", label: "Restroom", x: 860, y: 425, access: true },

      { id: "coffee", cat: "food", label: "Harbor Coffee", x: 400, y: 262, tags: ["coffee"] },
      { id: "seafood", cat: "food", label: "Seafood Kitchen", x: 560, y: 228, tags: ["seafood"] },
      { id: "halal", cat: "food", label: "Anatolia Grill (halal)", x: 470, y: 372, tags: ["halal"] },
      { id: "veg", cat: "food", label: "Green Table (vegetarian)", x: 575, y: 372, tags: ["vegetarian"] },

      { id: "infoC", cat: "help", label: "Information Desk C", x: 520, y: 300 },
      { id: "transfer", cat: "help", label: "Demo Air Transfer Desk", x: 240, y: 250 },
      { id: "baggage", cat: "help", label: "Baggage Services", x: 140, y: 105 },
      { id: "lostfound", cat: "help", label: "Lost & Found", x: 140, y: 165 },
      { id: "security", cat: "help", label: "Airport Security Office", x: 250, y: 350 },
      { id: "sim", cat: "help", label: "SIM & eSIM Desk", x: 385, y: 345 },

      { id: "medical", cat: "medical", label: "Medical Center", x: 640, y: 250 },
      { id: "aed1", cat: "medical", label: "AED", x: 175, y: 345 },
      { id: "aed2", cat: "medical", label: "AED", x: 800, y: 345 },
      { id: "pharmacy", cat: "medical", label: "Pharmacy", x: 475, y: 225 },

      { id: "elevator", cat: "access", label: "Elevator E2", x: 680, y: 348 },
      { id: "assist", cat: "access", label: "Accessibility Assistance", x: 150, y: 300 },
      { id: "wheelchair", cat: "access", label: "Wheelchair pickup", x: 860, y: 470 },

      { id: "meetC", cat: "meet", label: "Meeting Point C", x: 520, y: 340 },

      { id: "charge", cat: "other", label: "Charging station", x: 815, y: 300 },
      { id: "quiet", cat: "other", label: "Quiet / Prayer Room", x: 710, y: 125 },
      { id: "lounge", cat: "other", label: "Lounge", x: 710, y: 205 }
    ]
  },

  /* -------------------------------------------------------
     4. ROUTES
     Each route is a list of [x, y] points on the map, plus a
     walking time in minutes. Times are demo values.
     ------------------------------------------------------- */
  routes: {
    B18:            { pts: [[120,480],[120,300],[300,300],[300,78]], min: 6, via: "Main concourse, Pier B" },
    F7:             { pts: [[120,480],[120,300],[860,300],[860,505]], min: 13, via: "Main concourse, Pier F" },
    F7_fast:        { pts: [[120,480],[120,300],[860,300],[860,505]], min: 11, via: "Moving walkways, Pier F" },
    F7_accessible:  { pts: [[120,480],[120,300],[660,300],[680,348],[840,348],[860,370],[860,505]], min: 14, via: "Elevator E2, step-free" },
    B18_accessible: { pts: [[120,480],[120,300],[300,300],[300,78]], min: 8, via: "Step-free concourse" },
    F7_seafood:     { pts: [[120,480],[120,300],[545,300],[560,236],[578,300],[860,300],[860,505]], min: 18, via: "Stop at Seafood Kitchen" }
  },

  /* Extra minutes a stop adds to the walk (demo values) */
  detours: {
    seafood:    { place: "seafood",  name: "Seafood Kitchen",        off: 2, adds: 5,  dwell: 15 },
    coffee:     { place: "coffee",   name: "Harbor Coffee",          off: 0, adds: 1,  dwell: 5 },
    halal:      { place: "halal",    name: "Anatolia Grill (halal)", off: 2, adds: 4,  dwell: 15 },
    vegetarian: { place: "veg",      name: "Green Table (vegetarian)", off: 2, adds: 4, dwell: 15 },
    restroom:   { place: "wc1",      name: "Restroom",               off: 0, adds: 0.5, dwell: 3 },
    pharmacy:   { place: "pharmacy", name: "Pharmacy",               off: 1, adds: 3,  dwell: 5 },
    charge:     { place: "charge",   name: "Charging station",       off: 0, adds: 0,  dwell: 10 },
    quiet:      { place: "quiet",    name: "Quiet / Prayer Room",    off: 3, adds: 6,  dwell: 10 },
    lounge:     { place: "lounge",   name: "Lounge",                 off: 3, adds: 5,  dwell: 30 }
  },

  /* -------------------------------------------------------
     5. AIRPORT PACKS (offline)
     Device-level downloads, reusable across trips.
     Pack sizes are demo values, not measurements.
     ------------------------------------------------------- */
  packs: [
    { code: "FLL", name: "Fort Lauderdale", size: "12 MB", lang: "English, Spanish" },
    { code: "IST", name: "Istanbul",        size: "18 MB", lang: "Turkish, English" },
    { code: "DXB", name: "Dubai",           size: "16 MB", lang: "Arabic, English" },
    { code: "MIA", name: "Miami",           size: "14 MB", lang: "English, Spanish" },
    { code: "LHR", name: "London Heathrow", size: "19 MB", lang: "English" },
    { code: "CDG", name: "Paris Charles de Gaulle", size: "17 MB", lang: "French, English" }
  ],
  packContents: [
    "Terminal layout", "Saved gate zones", "Restrooms", "Medical locations",
    "Customer-service desks", "Baggage services", "Restaurants",
    "Accessible routes", "Important phone numbers", "Emergency instructions",
    "Translation phrases"
  ],

  /* -------------------------------------------------------
     6. PHRASES (language assistance)
     speech = BCP 47 code used by the browser voice, if any.
     ------------------------------------------------------- */
  languages: {
    en: { name: "English", speech: "en-US", dir: "ltr" },
    ar: { name: "Arabic (العربية)", speech: "ar-SA", dir: "rtl" },
    tr: { name: "Turkish (Türkçe)", speech: "tr-TR", dir: "ltr" },
    es: { name: "Spanish (Español)", speech: "es-ES", dir: "ltr" },
    fr: { name: "French (Français)", speech: "fr-FR", dir: "ltr" }
  },
  phrases: [
    { id: "gate", en: "Where is Gate F7?", ar: "أين البوابة F7؟", tr: "F7 kapısı nerede?", es: "¿Dónde está la puerta F7?", fr: "Où se trouve la porte F7 ?" },
    { id: "bag", en: "My bag did not arrive.", ar: "لم تصل حقيبتي.", tr: "Bavulum gelmedi.", es: "Mi maleta no llegó.", fr: "Mon bagage n'est pas arrivé." },
    { id: "medical", en: "I need medical assistance.", ar: "أحتاج إلى مساعدة طبية.", tr: "Tıbbi yardıma ihtiyacım var.", es: "Necesito asistencia médica.", fr: "J'ai besoin d'une assistance médicale." },
    { id: "wheelchair", en: "I need wheelchair assistance.", ar: "أحتاج إلى مساعدة بكرسي متحرك.", tr: "Tekerlekli sandalye yardımına ihtiyacım var.", es: "Necesito asistencia con silla de ruedas.", fr: "J'ai besoin d'une assistance en fauteuil roulant." },
    { id: "restroom", en: "Where is the restroom?", ar: "أين دورة المياه؟", tr: "Tuvalet nerede?", es: "¿Dónde está el baño?", fr: "Où sont les toilettes ?" },
    { id: "missed", en: "I missed my connecting flight.", ar: "فاتتني رحلتي الموصلة.", tr: "Aktarma uçuşumu kaçırdım.", es: "Perdí mi vuelo de conexión.", fr: "J'ai manqué ma correspondance." },
    { id: "sim", en: "Where can I buy a SIM card?", ar: "أين يمكنني شراء شريحة اتصال؟", tr: "Nereden SIM kart alabilirim?", es: "¿Dónde puedo comprar una tarjeta SIM?", fr: "Où puis-je acheter une carte SIM ?" }
  ],

  /* 7 + 8. CONNECTIVITY and MEALS now live inside each trip
     (trips[n].connectivity, trips[n].meals). script.js copies
     the active trip's values to SKYCARE_DATA.connectivity and
     SKYCARE_DATA.meals when a trip is loaded. */
  connectivity: null,
  meals: null,

  /* -------------------------------------------------------
     9. HUMAN SERVICES
     ------------------------------------------------------- */
  humans: [
    { id: "airline", name: "Airline Customer Service", place: "transfer", helps: "Rebooking, seats, missed connections, delays", ready: "Booking reference, boarding pass" },
    { id: "info", name: "Airport Information", place: "infoC", helps: "Directions, facilities, general questions", ready: "Your gate or destination" },
    { id: "baggage", name: "Baggage Services", place: "baggage", helps: "Delayed, damaged, or missing bags", ready: "Bag tag, boarding pass, ID" },
    { id: "access", name: "Accessibility Services", place: "assist", helps: "Wheelchair help, escorts, step-free routes", ready: "Flight number, type of help needed" },
    { id: "medical", name: "Medical Assistance", place: "medical", helps: "Illness, injury, medication problems", ready: "Symptoms, medications, allergies" },
    { id: "skycare", name: "SkyCare Support", place: "infoC", helps: "Problems with the SkyCare app itself", ready: "Nothing, we already have your trip" }
  ]
};

/* The trip shown before any ticket is loaded (preview only). */
window.SKYCARE_DATA.trip = window.SKYCARE_DATA.trips[0];
window.SKYCARE_DATA.connectivity = window.SKYCARE_DATA.trip.connectivity;
window.SKYCARE_DATA.meals = window.SKYCARE_DATA.trip.meals;
