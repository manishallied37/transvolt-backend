const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
 
const todayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
  return { start, end };
};
const randomTodayTs = () => {
  const { start, end } = todayRange();
  return randInt(start, end);
};
 
// 1 = CRITICAL, 2 = WARN, 3 = DRIVERSTAR, 4 = NEUTRAL
const SEVERITY = {
  ALERT: { code: 1, text: "ALERT" },
  WARN: { code: 2, text: "WARN" },
  DRIVERSTAR: { code: 3, text: "DRIVERSTAR" },
  NEUTRAL: { code: 4, text: "NEUTRAL" },
};
 
// Your alert types:
const ALERT_TYPES = [
  "SIGN-VIOLATIONS",
  "DRIVER-DROWSINESS",
  "NO-TRUCKS-SIGN-VIOLATIONS",
  "ERROR-EVENTS",
  "RELATIVE-SPEEDING",
  "WEAVING",
  "RAILROAD-CROSSING",
  "DRIVER-DISTRACTION",
  "HARD-TURN",
  "COLLISION-WARNING",
  "CAMERA-OBSTRUCTION",
  "SPEEDING-VIOLATIONS",
  "SWERVE",
  "DRIVER-INITIATED",
  "FACE-MASK-COMPLIANCE",
  "TRAFFIC-LIGHT-VIOLATION",
  "HARD-BRAKING",
  "U-TURN",
  "SEATBELT-COMPLIANCE",
  "HARD-ACCELERATION",
];
 
// Map each alert type to a severity label
const ALERT_SEVERITY = new Map([
  // CRITICAL
  ["COLLISION-WARNING", "ALERT"],
  ["DRIVER-DROWSINESS", "ALERT"],
  ["TRAFFIC-LIGHT-VIOLATION", "ALERT"],
 
  // WARN
  ["SPEEDING-VIOLATIONS", "WARN"],
  ["RELATIVE-SPEEDING", "WARN"],
  ["HARD-BRAKING", "WARN"],
  ["HARD-TURN", "WARN"],
  ["HARD-ACCELERATION", "WARN"],
  ["SWERVE", "WARN"],
  ["WEAVING", "WARN"],
  ["SIGN-VIOLATIONS", "WARN"],
  ["NO-TRUCKS-SIGN-VIOLATIONS", "WARN"],
  ["RAILROAD-CROSSING", "WARN"],
  ["DRIVER-DISTRACTION", "WARN"],
  ["CAMERA-OBSTRUCTION", "WARN"],
  ["U-TURN", "WARN"],
 
  // DRIVERSTAR (positive/compliance)
  ["SEATBELT-COMPLIANCE", "DRIVERSTAR"],
  ["FACE-MASK-COMPLIANCE", "DRIVERSTAR"],
 
  // NEUTRAL (system/meta/uncategorized)
  ["DRIVER-INITIATED", "NEUTRAL"],
  ["ERROR-EVENTS", "NEUTRAL"],
]);
 
// Stable typeId mapping (index + 1)
const TYPE_ID = ALERT_TYPES.reduce((acc, t, i) => {
  acc[t] = i + 1;
  return acc;
}, {});
 
const generateGpsData = ({ baseLat = 19.2183, baseLng = 72.9781, count = 3 } = {}) => {
  const points = [];
  let t = randomTodayTs();
  for (let i = 0; i < count; i++) {
    points.push({
      latitude: +(baseLat + (Math.random() - 0.5) * 0.005).toFixed(6),
      longitude: +(baseLng + (Math.random() - 0.5) * 0.005).toFixed(6),
      timestamp: t,
    });
    t += randInt(2_000, 15_000);
  }
  return points;
};
 
const generateVideos = (count = 8) => {
  const baseId = 13107312000 + randInt(100, 999);
  const ts = randomTodayTs();
  return Array.from({ length: count }, (_, i) => ({
    id: baseId + i,
    position: i,
    status: pick([1, 1, 1, 2]), // mostly 1, sometimes 2
    timestamp: ts,
  }));
};
 
const generateDriver = () => {
  const firstNames = ["Amit", "Neha", "Rahul", "Priya", "Vikram", "Sara", "Imran", "Kunal"];
  const lastNames = ["Sharma", "Patel", "Khan", "Iyer", "Singh", "Mehta", "Das", "Roy"];
  return {
    firstName: pick(firstNames),
    lastName: pick(lastNames),
    driverId: `DRV-${randInt(10000, 99999)}`,
  };
};
 
const generateVehicle = () => {
  const states = ["MH", "DL", "KA", "GJ", "TN", "RJ", "PB"];
  const plate = `${pick(states)}${String(randInt(1, 99)).padStart(2, "0")}-${String.fromCharCode(randInt(65, 90))}${String.fromCharCode(randInt(65, 90))}-${randInt(1000, 9999)}`;
  const vin = `VIN${randInt(10000000, 99999999)}`;
  return { vehicleNumber: plate, vin };
};
 
const generateLocation = () => {
  const cities = [
    { city: "Mumbai", state: "MH", postalCode: "400001", country: "India" },
    { city: "Thane", state: "MH", postalCode: "400601", country: "India" },
    { city: "Pune", state: "MH", postalCode: "411001", country: "India" },
    { city: "Bengaluru", state: "KA", postalCode: "560001", country: "India" },
    { city: "Delhi", state: "DL", postalCode: "110001", country: "India" },
  ];
  const c = pick(cities);
  return {
    address: `${randInt(1, 250)}, ${pick(["MG Road", "Station Road", "Link Road", "Park Street", "Main Street"])}`,
    city: c.city,
    state: c.state,
    postalCode: c.postalCode,
    country: c.country,
  };
};
 
const computeSeverityForType = (alertType) => {
  const label = ALERT_SEVERITY.get(alertType) || "NEUTRAL";
  return SEVERITY[label];
};
 
const tunedMetricsForType = (alertType, severityCode) => {
  let maxG, speed, impact;
 
  switch (alertType) {
    case "COLLISION-WARNING":
      maxG = +(Math.random() * 2.0 + 1.0).toFixed(2);
      speed = randInt(30, 100);
      impact = pick(["Front-Left", "Front-Right", "Front", "Rear"]);
      break;
    case "HARD-BRAKING":
      maxG = +(Math.random() * 1.2 + 0.8).toFixed(2);
      speed = randInt(25, 80);
      impact = pick(["Front", "Front-Left", "Front-Right"]);
      break;
    case "HARD-TURN":
    case "SWERVE":
    case "WEAVING":
      maxG = +(Math.random() * 1.0 + 0.6).toFixed(2);
      speed = randInt(20, 70);
      impact = pick(["Left", "Right"]);
      break;
    case "HARD-ACCELERATION":
      maxG = +(Math.random() * 0.9 + 0.5).toFixed(2);
      speed = randInt(20, 60);
      impact = "Rear";
      break;
    case "SPEEDING-VIOLATIONS":
    case "RELATIVE-SPEEDING":
      maxG = +(Math.random() * 0.6 + 0.3).toFixed(2);
      speed = randInt(60, 140);
      impact = "None";
      break;
    default:
      maxG = +(Math.random() * 0.8 + 0.3).toFixed(2);
      speed = randInt(10, 90);
      impact = pick(["None", "Front", "Rear", "Left", "Right"]);
  }
 
  if (severityCode === 1) {
    maxG = +(Math.min(3.0, maxG + 0.4)).toFixed(2);
    speed = Math.min(160, speed + randInt(5, 20));
  } else if (severityCode === 2) {
    maxG = +(Math.min(2.5, maxG + 0.2)).toFixed(2);
  }
 
  return { maxGForce: maxG, maxVehicleSpeed: speed, pointOfImpact: impact };
};

function generateAlert(overrides = {}) {
  const alertType = overrides.alertType && ALERT_TYPES.includes(overrides.alertType)
    ? overrides.alertType
    : pick(ALERT_TYPES);
 
  const severityObj = computeSeverityForType(alertType);
  const typeId = TYPE_ID[alertType];
 
  const nowTs = Date.now();
 
  const tuned = tunedMetricsForType(alertType, severityObj.code);
 
  const details = {
    severity: severityObj.code,                        
    severityDescription: severityObj.text,             
    confidence: +Math.max(0.5, Math.random()).toFixed(2),
    cause: pick([1, 2, 3]),
    typeId: typeId,
    typeDescription: alertType,                        
    alertVideoStatus: pick([1, 2]),                    
    category: severityObj.code === 1 ? 2 : 1,          
    categoryDescription: severityObj.code === 1 ? "Critical Alert" : "Regular Alert",
    subTypeDescription: pick([
      "Moderate Impact",
      "Harsh Braking",
      "Sharp Turn",
      "Sudden Acceleration",
      "Lane Drift",
      "Signal Violation",
      "Speed Threshold Exceeded",
      "Distraction Detected",
    ]),
    weatherPrediction: pick(["Clear", "Cloudy", "Light Rain", "Heavy Rain", "Haze", "Fog"]),
    location: generateLocation(),
    maxGForce: tuned.maxGForce,
    maxVehicleSpeed: tuned.maxVehicleSpeed,
    pointOfImpact: tuned.pointOfImpact,
  };
 
  const payload = {
    gpsData: generateGpsData({ count: randInt(2, 5) }),
    videos: generateVideos(8),
    updatedOn: nowTs,
    vehicle: generateVehicle(),
    webhookType: "alert",
    duration: randInt(1, 4),
    tenantName: "NETRADYNE",
    driver: generateDriver(),
    details,
    id: randInt(1, 999999),
    camera: { id: `16300${randInt(100000, 999999)}` },
    timestamp: nowTs,
    status: pick(["CONFIRMED", "REVIEW", "OPEN", "ACKNOWLEDGED"]),
  };
  return { ...payload, ...overrides };
}
 
if (require.main === module) {
  console.log("\nRandom alert payload:");
  console.log(JSON.stringify(generateAlert(), null, 2));
 
  console.log("\nForced alertType = COLLISION-WARNING:");
  console.log(JSON.stringify(generateAlert({ alertType: "COLLISION-WARNING" }), null, 2));
}
 
module.exports = {
  generateAlert,
  ALERT_TYPES,
  ALERT_SEVERITY,
  SEVERITY,
};