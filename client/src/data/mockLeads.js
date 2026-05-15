const ROUTES = [
  "Call",
  "Chat",
  "Email",
  "Walk-in",
  "Other",
  "Social Media",
  "Referral",
  "Website Form"
];

const FIRST_NAMES = [
  "Klanna",
  "Kobe",
  "Kenton",
  "Jayson",
  "Maddox",
  "Jaron",
  "Jettie",
  "Liana",
  "Brennan",
  "Darryl"
];

const LAST_NAMES = [
  "Lawrence",
  "Burks",
  "Hackett",
  "Ledger",
  "Gill",
  "Locklear",
  "Nixon",
  "Merritt",
  "Calloway",
  "Bates"
];

function pad(num, len = 4) {
  const s = String(num);
  return s.length >= len ? s : `${"0".repeat(len - s.length)}${s}`;
}

function randomPhone(seed) {
  const a = 200 + ((seed * 37) % 700);
  const b = 100 + ((seed * 53) % 900);
  const c = 1000 + ((seed * 91) % 9000);
  return `(${a}) ${b}-${c}`;
}

export function getMockLeads(count = 10) {
  const baseDate = new Date("2021-02-21T15:05:00.000Z").getTime();
  return Array.from({ length: count }).map((_, idx) => {
    const idNum = 8573 + idx * 385;
    const fullName = `${FIRST_NAMES[idx % FIRST_NAMES.length]} ${
      LAST_NAMES[idx % LAST_NAMES.length]
    }`;
    const created = new Date(baseDate + idx * 60_000).toISOString();
    const route = ROUTES[idx % ROUTES.length];

    return {
      id: `L-${pad(idNum, 4)}`,
      name: fullName,
      phone: randomPhone(idx + 1),
      altPhone: randomPhone(idx + 11),
      route,
      createdAt: created,
      action: idx % 4 === 1 ? "View" : "Convert"
    };
  });
}

