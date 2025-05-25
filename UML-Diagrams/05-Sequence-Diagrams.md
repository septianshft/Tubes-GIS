# LaundryMap Sequence Diagrams

## 1. User Search Flow

```plantuml
@startuml UserSearchSequence

!theme plain
skinparam backgroundColor White
skinparam actorBackgroundColor LightBlue
skinparam participantBackgroundColor LightGreen
skinparam lifeline LightGray

actor User
participant "Frontend\n(script.js)" as Frontend
participant "Search Module\n(enhancements.js)" as Search
participant "Express Server\n(server.js)" as Server
database "SQLite DB" as DB
participant "Analytics\n(analytics.js)" as Analytics

User -> Frontend: Enter search query
activate Frontend

Frontend -> Search: processSearch(query)
activate Search

Search -> Analytics: trackEvent('search_started', {query})
activate Analytics
Analytics -> Analytics: Store event locally
deactivate Analytics

Search -> Server: GET /api/search?q=query
activate Server

Server -> DB: SELECT * FROM laundries WHERE name LIKE '%query%'
activate DB
DB --> Server: Return filtered results
deactivate DB

Server --> Search: JSON array of laundries
deactivate Server

Search -> Search: processResults(data)
Search -> Frontend: updateMapMarkers(results)
Search -> Frontend: updateSearchResults(results)

Search -> Analytics: trackEvent('search_completed', {resultsCount, timeToResults})
activate Analytics
Analytics -> Server: POST /api/analytics
Analytics -> Analytics: Update local metrics
deactivate Analytics

Frontend -> Frontend: Display results on map
Frontend --> User: Show search results
deactivate Search
deactivate Frontend

@enduml
```

## 2. Location-Based Discovery

```plantuml
@startuml LocationDiscoverySequence

!theme plain
skinparam backgroundColor White
skinparam actorBackgroundColor LightBlue
skinparam participantBackgroundColor LightGreen

actor User
participant "Frontend" as Frontend
participant "Geolocation API" as Geo
participant "Server" as Server
database "Database" as DB
participant "Map\n(Leaflet.js)" as Map

User -> Frontend: Click "Find Nearby"
activate Frontend

Frontend -> Geo: navigator.geolocation.getCurrentPosition()
activate Geo

Geo --> Frontend: Position {lat, lng, accuracy}
deactivate Geo

Frontend -> Server: GET /api/nearby?lat={lat}&lng={lng}&radius=5
activate Server

Server -> DB: Calculate distances using Haversine formula
activate DB
DB --> Server: Return sorted laundries by distance
deactivate DB

Server --> Frontend: JSON array with distances
deactivate Server

Frontend -> Map: clearMarkers()
Frontend -> Map: addMarkers(nearbyLaundries)
Frontend -> Map: centerMap(userLocation)
Frontend -> Map: addUserLocationMarker()

Frontend --> User: Display nearby laundries
deactivate Frontend

@enduml
```

## 3. Directions and Navigation

```plantuml
@startuml DirectionsSequence

!theme plain
skinparam backgroundColor White
skinparam actorBackgroundColor LightBlue
skinparam participantBackgroundColor LightGreen

actor User
participant "Frontend" as Frontend
participant "Enhancements\nModule" as Enhancements
participant "Server" as Server
participant "OpenRouteService\nAPI" as ORS
participant "Map" as Map

User -> Frontend: Click "Get Directions" on laundry
activate Frontend

Frontend -> Enhancements: getDirections(fromLat, fromLng, toLat, toLng)
activate Enhancements

Enhancements -> Server: GET /api/directions?fromLat={}&fromLng={}&toLat={}&toLng={}
activate Server

Server -> ORS: POST /v2/directions/driving-car
activate ORS
note right of ORS
  Request route between
  user location and laundry
end note

ORS --> Server: Route geometry and instructions
deactivate ORS

Server --> Enhancements: Route data with coordinates
deactivate Server

Enhancements -> Map: addRouteLayer(routeGeometry)
Enhancements -> Frontend: displayNavigationPanel(instructions)

Frontend -> Frontend: Show step-by-step directions
Frontend --> User: Display route on map + turn-by-turn instructions
deactivate Enhancements
deactivate Frontend

@enduml
```

## 4. Analytics Event Tracking

```plantuml
@startuml AnalyticsSequence

!theme plain
skinparam backgroundColor White
skinparam actorBackgroundColor LightBlue
skinparam participantBackgroundColor LightGreen

participant "User Action" as Action
participant "Analytics\n(analytics.js)" as Analytics
participant "Local Storage" as Storage
participant "Server" as Server
database "Analytics DB" as DB

Action -> Analytics: trackEvent(eventName, eventData)
activate Analytics

Analytics -> Analytics: generateTimestamp()
Analytics -> Analytics: addSessionContext()
Analytics -> Analytics: enrichEventData()

Analytics -> Storage: Store event locally
activate Storage
Storage --> Analytics: Confirm storage
deactivate Storage

alt Event buffer full OR critical event
    Analytics -> Server: POST /api/analytics (batch events)
    activate Server
    
    Server -> DB: INSERT INTO analytics_events
    activate DB
    DB --> Server: Confirm insertion
    deactivate DB
    
    Server --> Analytics: Success response
    deactivate Server
    
    Analytics -> Storage: Clear sent events
else
    Analytics -> Analytics: Keep in local buffer
end

Analytics -> Analytics: updateLocalMetrics()
deactivate Analytics

@enduml
```

## 5. Admin Dashboard Access

```plantuml
@startuml AdminDashboardSequence

!theme plain
skinparam backgroundColor White
skinparam actorBackgroundColor LightBlue
skinparam participantBackgroundColor LightGreen

actor Admin
participant "Frontend" as Frontend
participant "Analytics Module" as Analytics
participant "Server" as Server
database "Database" as DB

Admin -> Frontend: Access admin panel (URL parameter)
activate Frontend

Frontend -> Analytics: isAdmin()
activate Analytics

Analytics -> Analytics: Check localStorage for admin flag
Analytics --> Frontend: Return admin status
deactivate Analytics

alt Admin authenticated
    Frontend -> Analytics: createAdminDashboard()
    activate Analytics
    
    Analytics -> Server: GET /api/admin/dashboard
    activate Server
    
    Server -> DB: Aggregate analytics data
    activate DB
    note right of DB
      Calculate:
      - Total sessions
      - Popular searches
      - Usage patterns
      - Performance metrics
    end note
    
    DB --> Server: Aggregated metrics
    deactivate DB
    
    Server --> Analytics: Dashboard data
    deactivate Server
    
    Analytics -> Frontend: renderDashboard(data)
    Analytics -> Frontend: setupCharts()
    Analytics -> Frontend: addExportFunctionality()
    
    Frontend --> Admin: Display analytics dashboard
    deactivate Analytics
    
else Not admin
    Frontend --> Admin: Show regular interface
end

deactivate Frontend

@enduml
```

## Sequence Diagrams Overview

These sequence diagrams illustrate the key user interactions and system flows in the LaundryMap application:

### 1. User Search Flow
- Real-time search with autocomplete
- Analytics tracking for search behavior
- Results display on interactive map

### 2. Location-Based Discovery
- Geolocation API integration
- Distance calculation using Haversine formula
- Proximity-based laundry recommendations

### 3. Directions and Navigation
- Integration with OpenRouteService API
- Route visualization on map
- Turn-by-turn navigation instructions

### 4. Analytics Event Tracking
- Client-side event buffering
- Batch transmission to server
- Local storage for offline capability

### 5. Admin Dashboard Access
- Role-based access control
- Real-time analytics aggregation
- Data visualization and export functionality

Each sequence demonstrates the separation between frontend logic, server-side processing, and data persistence, following the application's three-tier architecture.