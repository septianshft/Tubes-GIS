# Diagram Arsitektur LaundryMap

```plantuml
@startuml LaundryMapArchitecture

!theme plain
skinparam backgroundColor White
skinparam componentBackgroundColor LightBlue
skinparam componentBorderColor Navy
skinparam componentFontColor Black

' Definisi tier arsitektur
package "Tier Antarmuka Pengguna" as presentation {
  component "HTML5 Interface" as html {
    [Responsive UI]
    [PWA Capabilities]
    [Dark/Light Theme]
  }
  
  component "JavaScript Frontend" as frontend {
    [LaundryMap Core (script.js)]
    [Analytics Module (analytics.js)]
    [Enhancements Module (enhancements.js)]
    [Leaflet.js Mapping]
    [Service Workers]
  }
}

package "Tier Server Aplikasi" as application {
  component "Express.js Server" as server {
    [Main Server (server.js)]
    [Enhanced API (server-enhancements.js)]
    [Route Handlers]
    [Middleware]
  }
  
  component "API Endpoints" as api {
    [GET /api/laundries]
    [GET /api/search]
    [POST /api/analytics]
    [GET /api/directions]
    [GET /api/nearby]
    [GET /api/filters]
    [POST /api/feedback]
    [GET /api/admin]
  }
}

package "Tier Penyimpanan Data" as data {
  component "SQLite Database" as db {
    [Laundries Table]
    [Analytics Table]
    [User Sessions]
    [Feedback Table]
  }
  
  component "External Services" as external {
    [OpenRouteService API]
    [Geolocation API]
    [Browser Storage]
  }
}

package "Dukungan Sistem" as infra {
  component "Static Assets" as assets {
    [CSS Stylesheets]
    [Images/Icons]
    [Offline Cache]
  }
  
  component "Development Tools" as devtools {
    [Node.js Runtime]
    [NPM Dependencies]
    [Local Development Server]
  }
}

' Hubungan antar komponen
presentation --> application : "HTTPS Requests"
application --> data : "SQL Queries"
frontend --> external : "API Calls"
server --> db : "Database Operations"
html --> assets : "Resource Loading"
api --> external : "External API Calls"

' Catatan arsitektur
note right of frontend
  JavaScript sisi klien menangani:
  - Visualisasi peta interaktif
  - Pencarian real-time
  - Layanan geolokasi
  - Pelacakan analitik
  - Fungsionalitas offline
end note

note right of server
  Backend Express.js menyediakan:
  - RESTful API endpoints
  - Abstraksi database
  - Pengumpulan data analitik
  - Fitur-fitur tambahan
end note

note bottom of db
  Database SQLite menyimpan:
  - 35+ lokasi laundry
  - Data analitik pengguna
  - Informasi sesi
  - Feedback pengguna
end note
@enduml
```

## Gambaran Umum Arsitektur

Aplikasi LaundryMap menggunakan arsitektur 3-tier yang terdiri dari:

### 1. Tier Antarmuka Pengguna (Frontend)
- **HTML5 Interface**: Tampilan web responsif dengan kemampuan PWA
- **JavaScript Frontend**: Logika sisi klien yang modular dengan fitur pemetaan
- **Leaflet.js**: Peta interaktif dan operasi geospasial

### 2. Tier Server Aplikasi (Backend)
- **Express.js Server**: Server API RESTful untuk logika bisnis
- **API Endpoints**: 8+ endpoint untuk data laundry, pencarian, dan analitik
- **Middleware**: Pemrosesan request, CORS, dan serving file statis

### 3. Tier Penyimpanan Data (Database)
- **SQLite Database**: Database ringan untuk data laundry dan analitik
- **External APIs**: Integrasi dengan OpenRouteService untuk navigasi
- **Browser Storage**: Cache di browser untuk mode offline

### Prinsip Arsitektur Utama
- **Separation of Concerns**: Pemisahan jelas antara tampilan, logika bisnis, dan data
- **RESTful Design**: API stateless mengikuti standar REST
- **Progressive Web App**: Pendekatan offline-first dengan service workers
- **Modular Frontend**: Modul terpisah untuk fitur inti, analitik, dan enhancement