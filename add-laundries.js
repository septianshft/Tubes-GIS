// Script to add multiple laundry locations to the database
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Laundry locations spread across all districts
const laundries = [
  // Sukabirus District
  {
    name: "Fresh & Clean Laundry",
    lat: -6.981573,
    lng: 107.628108,
    address: "Jl. Sukabirus No. 18, Dayeuhkolot",
    price_per_kg: 6500,
    service_speed_days: 2,
    opening_hours: "07:00 - 21:00"
  },
  {
    name: "Sukabirus Express",
    lat: -6.983152,
    lng: 107.630105,
    address: "Jl. Sukabirus No. 42, Dayeuhkolot",
    price_per_kg: 8000,
    service_speed_days: 1,
    opening_hours: "08:00 - 22:00"
  },
  {
    name: "Student Wash",
    lat: -6.979542,
    lng: 107.632398,
    address: "Jl. Sukabirus Gg. Aman No. 3",
    price_per_kg: 5000,
    service_speed_days: 3,
    opening_hours: "08:00 - 19:00"
  },
  
  // Sukapura District
  {
    name: "Premium Laundry House",
    lat: -6.968575,
    lng: 107.630132,
    address: "Jl. Sukapura No. 15, Dayeuhkolot",
    price_per_kg: 9500,
    service_speed_days: 1,
    opening_hours: "07:00 - 20:00"
  },
  {
    name: "Budget Wash",
    lat: -6.967615,
    lng: 107.625843,
    address: "Jl. Sukapura Raya No. 7",
    price_per_kg: 4500,
    service_speed_days: 3,
    opening_hours: "06:00 - 18:00"
  },
  {
    name: "Quick & Clean",
    lat: -6.969458,
    lng: 107.627325,
    address: "Jl. Sukapura Gg. Saluyu No. 12",
    price_per_kg: 7000,
    service_speed_days: 1,
    opening_hours: "07:30 - 21:00"
  },
  
  // PGA District
  {
    name: "PGA Premium Cleaners",
    lat: -6.973923,
    lng: 107.634812,
    address: "Jl. PGA No. 25, Bandung",
    price_per_kg: 10000,
    service_speed_days: 1,
    opening_hours: "08:00 - 20:00"
  },
  {
    name: "24-Hour Laundry",
    lat: -6.976089,
    lng: 107.633487,
    address: "Jl. PGA Timur No. 8",
    price_per_kg: 8500,
    service_speed_days: 1,
    opening_hours: "00:00 - 24:00"
  },
  
  // Telkom Area
  {
    name: "Campus Clean",
    lat: -6.971568,
    lng: 107.628769,
    address: "Jl. Telekomunikasi No. 3",
    price_per_kg: 7000,
    service_speed_days: 2,
    opening_hours: "07:00 - 21:00"
  },
  {
    name: "Telkom Laundromat",
    lat: -6.974123,
    lng: 107.629556,
    address: "Jl. Telkom Raya No. 15",
    price_per_kg: 6000,
    service_speed_days: 2,
    opening_hours: "08:00 - 20:00"
  },
  {
    name: "Staff Cleaners",
    lat: -6.972586,
    lng: 107.631078,
    address: "Telkom Area Blok C No. 5",
    price_per_kg: 8000,
    service_speed_days: 1,
    opening_hours: "07:00 - 19:00"
  },
  
  // Ummayah District
  {
    name: "Ummayah Premium",
    lat: -6.976425,
    lng: 107.632815,
    address: "Jl. Ummayah No. 22, Bandung",
    price_per_kg: 9000,
    service_speed_days: 1,
    opening_hours: "07:00 - 22:00"
  },
  {
    name: "Eco Laundry",
    lat: -6.975218,
    lng: 107.634123,
    address: "Jl. Ummayah Timur No. 8",
    price_per_kg: 7500,
    service_speed_days: 1,
    opening_hours: "08:00 - 20:00"
  }
];

async function addLaundries() {
  console.log("Starting to add laundry locations...");
  let successCount = 0;
  let failCount = 0;
  
  for (const laundry of laundries) {
    try {
      console.log(`Adding "${laundry.name}"...`);
      const response = await fetch('http://localhost:3000/api/laundries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(laundry),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Added "${laundry.name}" at ${laundry.address}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error adding "${laundry.name}": ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n==== Summary ====`);
  console.log(`✅ Successfully added: ${successCount} laundry locations`);
  console.log(`❌ Failed to add: ${failCount} laundry locations`);
  console.log(`Total attempted: ${laundries.length} laundry locations`);
}

// Run the function
addLaundries().catch(err => {
  console.error("Fatal error:", err);
});
