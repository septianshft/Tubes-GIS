// Script to refresh laundry data (similar to Laravel's migrate:fresh --seed)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Laundry locations to seed (same as in add-laundries.js)
const laundries = [
  // Sukabirus District
  {
    name: "dr. laundry",
    lat: -6.979154903931031,
    lng: 107.63073880080348,
    address: "Jl. Sukabirus No.8, Bojongsoang, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 5500,
    service_speed_days: 2,
    opening_hours: "09:00 - 21:00"
  },
  {
    name: "Key's Laundry",
    lat: -6.976835459475451,
    lng: 107.63264836635119,
    address: "Jl. Sukabirus No.101, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 5500,
    service_speed_days: 2,
    opening_hours: "08:00 - 22:00"
  },  
  {
    name: "O3 Coin Laundry",
    lat: -6.977080053470676,
    lng: 107.6329845485206,
    address: "Jl. Sukabirus No.64, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 6500,
    service_speed_days: 1,
    opening_hours: "07:00 - 20:00"
  },
  {
    name: "Bening Laundry",
    lat: -6.888154880055989,
    lng: 107.56718778594511,
    address: "Jl. Sukabirus No.107, Citeureup, Kec. Dayeuhkolot, Kota Bandung, Jawa Barat 40257",
    price_per_kg: 5000,
    service_speed_days: 2,
    opening_hours: "08:00 - 22:00"
  },
  {
    name: "Bubble Lab Laundry",
    lat: -6.97839965406895, 
    lng: 107.63225189538755,
    address: "Jalan Sukabirus Blok.E No.8, Citeureup, Dayeuhkolot, Citeureup, Kec. Dayeuhkolot, Kota Bandung, Jawa Barat 40257",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00 - 22:00"
  },
  {
    name: "Mamih Laundry (Gratis Antar Jemput)",
    lat: -6.979378219688298, 
    lng: 107.63125379424577,
    address: "Jl. Sukabirus No.16, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00 - 21:00"
  },
  {
    name: "D'Laundry Coin & self Service",
    lat: -6.981355904669862, 
    lng: 107.62923355544115,
    address: "Jl. Sukabirus, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00 - 22:00"
  },
  {
    name: "Berkah Laundry",
    lat: -6.971568,
    lng: 107.628769,
    address: "Jl. Sukabirus No.69, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40258",
    price_per_kg: 7000,
    service_speed_days: 1,
    opening_hours: "07:00 - 21:00"
  },
  {
    name: "LOKALIS LAUNDRY",
    lat: -6.974905819971454,
    lng: 107.63330064935303,
    address: "Jl. Sukabirus No.16, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 4000,
    service_speed_days: 1,
    opening_hours: "08:00 - 21:00"
  },
  {
    name: "laundry Icha",
    lat: -6.9756570355794665,
    lng: 107.63436179058483,
    address: "Jl. Sukabirus No.28, RT.03/RW.13, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 4000,
    service_speed_days: 1,
    opening_hours: "07:00 - 22:00"
  },
  {
    name: "LAUNDRYPEDIA - LAUNDRY TELKOM UNIVERSITY / UNIVERAITAS TELKOM / SUKABIRUS",
    lat: -6.978638508617035,
    lng:  107.62898030867885,
    address: "Griya Alifa, Jl. Sukabirus No.2, RT.02/RW.13, Citeureup, Dayeuhkolot, Bandung Regency, West Java 40257",
    price_per_kg: 5500,
    service_speed_days: 1,
    opening_hours: "06:00 - 00:00"
    },
    {
    name: "Bio Clean Laundry - Sukabirus",
    lat: -6.975312878361928,
    lng: 107.63339254935302,
    address: "Jl. Sukabirus, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 4000,
    service_speed_days: 1,
    opening_hours: "07:00 - 21:00"
  },
  {
    name: "Isbi loundry",
    lat: -6.979569990861112, 
    lng: 107.63143091993024,
    address: "Jl. Sukabirus GG selamat 1 No.A20, RT.01/RW.08, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40288",
    price_per_kg: 4000,
    service_speed_days: 1,
    opening_hours: "09:00 - 21:00"
  },
  {
    name: "Kinclong Laundry",
    lat: -6.979259116520187,
    lng: 107.62919403891954,
    address: "Jalan sukabirus, Rt 01 Rw 13 Kostan Salsabila, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40258",
    price_per_kg: 4000,
    service_speed_days: 1,
    opening_hours: "07:00 - 23:00"
  },
  {
    name: "Joss Laundry Telkom University",
    lat: -6.97663316209943,
    lng: 107.63309490092911,
    address: "Jl. Sukabirus No.88, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 4000,
    service_speed_days: 1,
    opening_hours: "09:00 - 22:00"
  },
  {
    name: "Sahabat Laundry SKB-88",
    lat: -6.979295244313274,
    lng: 107.62892652939358,
    address: "gg. H Atmawigena, Jl. Sukabirus No.RT.02/13, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 4000,
    service_speed_days: 1,
    opening_hours: "09:00 - 22:00"
  },
  {
    name: "On De Wey Laundry",
    lat: -6.978097939767555, 
    lng: 107.63247025061392,
    address: "Jl. Sukabirus No.E02, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00 - 22:00"
  },
  {
    name: "Mess Laundry",
    lat: -6.973862136605487,
    lng: 107.6327760219933,
    address: "Gg. PGA No.91, Lengkong, Kec. Bojongsoang, Kabupaten Bandung, Jawa Barat 40287",
    price_per_kg: 4000,
    service_speed_days: 1,
    opening_hours: "07:00 - 20:00"
  },
  {
    name: "Aminah Laundry",
    lat: -6.976644428001822,
    lng: 107.63456602894172,
    address: "Jl. H. Umayah II Jl. Sukabirus, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "07:00 - 21:00"
  },
  {
    name: "Nita Laundry",
    lat: -6.977938574294299,
    lng:   107.63240250898887,
    address: "Jl. Sukabirus No.40-17, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
  },
  {
    name: "Teras Laundry",
    lat: -6.972334727632216,
    lng: 107.63056048220177,
    address: "Jl. Telekomunikasi Gg. Miskar No.22, RT.02/RW.05, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40287",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00 - 20:00"
  },

  //entry baru
  {
    name: "Sunshine Laundry",
    lat: -6.972334727632216,
    lng: 107.63056048220177,
    address: "Jl. Telekomunikasi, Lengkong, Kec. Bojongsoang, Kabupaten Bandung, Jawa Barat 40287",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00-21:00"
  },
  {
    name: "Family Loundry",
    lat: -6.972128423278284,
    lng: 107.63637373286828,
    address: "Jl. Telekomunikasi No.2 B, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "07:00-22:00"
  },
  {
    name: "TRIAS Laundry",
    lat: -6.968702765803136,
    lng: 107.63614866560742,
    address: "Sukapura, Pondok Rafina, Kabupaten Bandung, Jawa Barat 40267",
    price_per_kg: 5000,
    service_speed_days: 1,
    opening_hours: "08:00-21:00"
  },
  {
    name: "Liquid Laundry",
    lat: -6.968549868244304,
    lng: 107.63469782058716,
    address: "Jl. Sukapura No.76, Sukapura, Kec. Dayeuhkolot, Kota Bandung, Jawa Barat 40267",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00-22:00"
  },
  {
    name: "POWCC Telkom Laundry gratis antar jemput",
    lat: -6.969750963956269,
    lng: 107.6349118508164,
    address: "Jl. Sukapura, RT.003/RW.002, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40267",
    price_per_kg: 5000,
    service_speed_days: 1,
    opening_hours: "08:00-22:00"
  },
  {
    name: "Adhyaksa Laundry",
    lat: -6.966622360223365,
    lng: 107.63633831163415,
    address: "Jl. Adhyaksa Raya No.11, Sukapura, Kec. Dayeuhkolot, Kota Bandung, Jawa Barat 40267",
    price_per_kg: 5000,
    service_speed_days: 1,
    opening_hours: "08:00-21:00"
  },
  {
    name: "Laundry Ikhsan",
    lat: -6.971221864018231,
    lng: 107.63501852807858,
    address: "Jl. Mangga Dua No.30 RT02, RW.01, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40267",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "09:00-22:00"
  },
  {
    name: "Seven Laundry",
    lat: -6.970359400002847,
    lng: 107.63290679274397,
    address: "Jl. Mangga Dua No.70, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40267",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00-22:00"
  },
  {
    name: "Laundry Club Telkom University (Laundry Express Antar dan Jemput)",
    lat: -6.970891876686462,
    lng: 107.63195192635901,
    address: "Jl. Mangga Dua No.74, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40267",
    price_per_kg: 5000,
    service_speed_days: 1,
    opening_hours: "07:00-20:00"
  },
  {
    name: "King Wash Laundry)",
    lat: -6.970316801842022,
    lng: 107.63210213005677,
    address: "Jl. Sukapura, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40267",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "07:00-21:00"
  },
  {
    name: "Laundry Express 63",
    lat: -6.969954717318661,
    lng: 107.63285314854564,
    address: "Jl. Sukapura No.58, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40267",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "09:00-19:00"
  },
  {
    name: "Kasuga Laundry Sukapura",
    lat: -6.9674840154578765,
    lng: 107.63461267757665,
    address: "Jl. Sukapura No.14, RT.03/RW.06, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40267",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00-21:00"
  },
  {
    name: "Seven Laundry 2",
    lat: -6.968527675591124,
    lng: 107.63396894744335,
    address: "Jalan Sukapura, Mengger, Bandung Kidul, Sukapura, Kec. Dayeuhkolot, Kota Bandung, Jawa Barat 40267",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00-22:00"
  },
  {
    name: "Buih Bersih Laundry",
    lat: -6.968548974753329,
    lng: 107.63336813265227,
    address: "Jl. Sukapura No.76, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    price_per_kg: 6000,
    service_speed_days: 1,
    opening_hours: "08:00-20:00"
  }
];

async function addLaundries() {
  console.log("Adding new laundry locations...");
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
        console.error(`❌ Error adding "${laundry.name}" - Server responded with ${response.status}: ${errorText}`); // Log server error
        throw new Error(`Server responded with ${response.status}: ${errorText}`); // Throw error to be caught by catch block
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

// Step 1: Clear all existing laundry data
console.log("===== STARTING REFRESH PROCESS (like migrate:fresh --seed) =====");
console.log("Step 1: Clearing all existing laundry data...");

const dbPath = path.join(__dirname, 'laundry.db');
const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
  
  console.log('Connected to the SQLite database.');
  
  try {
    // Clear the table using a Promise wrapper
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM laundries', function(err) {
        if (err) {
          console.error('Error clearing laundry data:', err.message);
          reject(err);
        } else {
          console.log(`Removed ${this.changes} existing laundry records.`);
          resolve();
        }
      });
    });
    
    // Step 2: Add new data
    console.log("\nStep 2: Adding new laundry locations...");
    await addLaundries();
    
  } catch (error) {
    console.error("Error during refresh process:", error);
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed.');
        console.log("===== REFRESH COMPLETE =====");
      }
    });
  }
});
