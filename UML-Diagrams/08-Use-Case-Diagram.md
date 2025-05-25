# LaundryMap Use Case Diagram

```plantuml
@startuml LaundryMapUseCases

!theme plain
skinparam backgroundColor White
skinparam actorBackgroundColor LightBlue
skinparam usecaseBackgroundColor LightGreen
skinparam packageBackgroundColor LightGray

' Actors
actor "Student User" as student
actor "Admin User" as admin
actor "System Administrator" as sysadmin

' External Systems
actor "OpenRouteService API" as ors
actor "OpenStreetMap" as osm
actor "Browser Geolocation API" as geoapi

' Use Case Packages
package "Core Functionality" {
  usecase "View Laundry Map" as viewMap
  usecase "Search Laundries" as search
  usecase "Filter Laundries" as filter
  usecase "View Laundry Details" as viewDetails
  usecase "Get Directions" as getDirections
  usecase "Find Nearby Laundries" as findNearby
}

package "User Experience" {
  usecase "Switch Theme (Dark/Light)" as switchTheme
  usecase "Use Offline Mode" as offlineMode
  usecase "Install PWA" as installPWA
  usecase "Submit Feedback" as submitFeedback
  usecase "Rate Laundry" as rateLaundry
}

package "Analytics & Tracking" {
  usecase "Track User Behavior" as trackBehavior
  usecase "Generate Usage Reports" as generateReports
  usecase "View Analytics Dashboard" as viewDashboard
  usecase "Export Analytics Data" as exportData
  usecase "Monitor Performance" as monitorPerf
}

package "System Administration" {
  usecase "Manage Laundry Data" as manageLaundry
  usecase "Update System Configuration" as updateConfig
  usecase "Monitor System Health" as monitorHealth
  usecase "Backup Database" as backupDB
  usecase "Deploy Updates" as deployUpdates
}

package "Location Services" {
  usecase "Detect User Location" as detectLocation
  usecase "Calculate Routes" as calculateRoutes
  usecase "Load Map Tiles" as loadTiles
}

' Student User Relationships
student --> viewMap
student --> search
student --> filter
student --> viewDetails
student --> getDirections
student --> findNearby
student --> switchTheme
student --> offlineMode
student --> installPWA
student --> submitFeedback
student --> rateLaundry
student --> detectLocation

' Admin User Relationships
admin --> viewMap
admin --> search
admin --> viewDashboard
admin --> generateReports
admin --> exportData
admin --> trackBehavior
admin --> monitorPerf
admin --> manageLaundry

' System Administrator Relationships
sysadmin --> updateConfig
sysadmin --> monitorHealth
sysadmin --> backupDB
sysadmin --> deployUpdates
sysadmin --> manageLaundry

' External System Relationships
getDirections --> ors : "requests route"
calculateRoutes --> ors : "calculates path"
viewMap --> osm : "loads tiles"
loadTiles --> osm : "fetches map data"
findNearby --> geoapi : "gets location"
detectLocation --> geoapi : "accesses GPS"

' Use Case Dependencies
findNearby ..> detectLocation : "<<includes>>"
getDirections ..> detectLocation : "<<includes>>"
search ..> filter : "<<extends>>"
viewDetails ..> rateLaundry : "<<extends>>"
viewDetails ..> submitFeedback : "<<extends>>"
trackBehavior ..> generateReports : "<<includes>>"
offlineMode ..> installPWA : "<<extends>>"

' Use Case Descriptions
note right of viewMap
  **Primary Use Case**
  Display interactive map with
  all laundry locations marked
  and basic navigation controls
end note

note right of search
  **High Priority**
  Real-time search with
  autocomplete suggestions
  and fuzzy matching
end note

note right of findNearby
  **Location-Based**
  Uses GPS to find laundries
  within specified radius
  (default 5km)
end note

note right of getDirections
  **Navigation Feature**
  Provides turn-by-turn
  directions from user location
  to selected laundry
end note

note right of trackBehavior
  **Analytics Core**
  Automatically tracks user
  interactions for insights
  and system improvement
end note

note right of viewDashboard
  **Admin Feature**
  Comprehensive analytics
  with charts, metrics,
  and export capabilities
end note

note left of offlineMode
  **PWA Feature**
  Allows basic functionality
  without internet connection
  using cached data
end note

note left of switchTheme
  **Accessibility**
  Toggle between dark and
  light themes for better
  user experience
end note

' System Boundaries
rectangle "LaundryMap Web Application" {
  viewMap
  search
  filter
  viewDetails
  getDirections
  findNearby
  switchTheme
  offlineMode
  installPWA
  submitFeedback
  rateLaundry
  trackBehavior
  generateReports
  viewDashboard
  exportData
  monitorPerf
  manageLaundry
  detectLocation
}

rectangle "External Services" {
  calculateRoutes
  loadTiles
}

rectangle "System Management" {
  updateConfig
  monitorHealth
  backupDB
  deployUpdates
}

@enduml
```

## Use Case Analysis

### Primary Actors

#### Student User
- **Primary Role**: End user of the laundry finder system
- **Goals**: Find suitable laundries, get directions, access information
- **Technical Level**: Basic to intermediate technology users
- **Access**: Web browser on mobile/desktop devices

#### Admin User  
- **Primary Role**: System administrator and analyst
- **Goals**: Monitor usage, analyze patterns, manage content
- **Technical Level**: Advanced user with administrative privileges
- **Access**: Web interface with admin authentication

#### System Administrator
- **Primary Role**: Technical maintenance and system operations
- **Goals**: Ensure system reliability, performance, and security
- **Technical Level**: Advanced technical user
- **Access**: Server access and administrative tools

### Use Case Categories

#### Core Functionality (Essential Features)
1. **View Laundry Map** - Display interactive map with all locations
2. **Search Laundries** - Text-based search with real-time results
3. **Filter Laundries** - Category-based filtering (type, capacity, facilities)
4. **View Laundry Details** - Detailed information about specific locations
5. **Get Directions** - Navigation from user location to laundry
6. **Find Nearby Laundries** - Location-based proximity search

#### User Experience (Enhancement Features)
1. **Switch Theme** - Dark/light mode toggle for accessibility
2. **Use Offline Mode** - Basic functionality without internet
3. **Install PWA** - Progressive Web App installation
4. **Submit Feedback** - User reviews and comments
5. **Rate Laundry** - 5-star rating system for locations

#### Analytics & Tracking (Business Intelligence)
1. **Track User Behavior** - Automatic event tracking and metrics
2. **Generate Usage Reports** - Analytics data compilation
3. **View Analytics Dashboard** - Visual charts and insights
4. **Export Analytics Data** - Data export for further analysis
5. **Monitor Performance** - System performance tracking

#### System Administration (Technical Management)
1. **Manage Laundry Data** - CRUD operations for location data
2. **Update System Configuration** - System settings management
3. **Monitor System Health** - Server and database monitoring
4. **Backup Database** - Data backup and recovery procedures
5. **Deploy Updates** - Application update and maintenance

#### Location Services (External Integration)
1. **Detect User Location** - GPS-based location detection
2. **Calculate Routes** - Route planning via external APIs
3. **Load Map Tiles** - Map visualization data retrieval

### Use Case Relationships

#### Includes Relationships
- **Find Nearby Laundries** includes **Detect User Location**
- **Get Directions** includes **Detect User Location**
- **Track User Behavior** includes **Generate Usage Reports**

#### Extends Relationships
- **Search Laundries** extends **Filter Laundries**
- **View Laundry Details** extends **Rate Laundry**
- **View Laundry Details** extends **Submit Feedback**
- **Use Offline Mode** extends **Install PWA**

### Business Value Analysis

#### High Priority Use Cases
1. **View Laundry Map** - Core functionality, essential for all users
2. **Search Laundries** - Primary user interaction, drives engagement
3. **Find Nearby Laundries** - Location-based value proposition
4. **Get Directions** - Navigation assistance, key differentiator

#### Medium Priority Use Cases
1. **Filter Laundries** - Enhanced search capabilities
2. **View Laundry Details** - Information accessibility
3. **Switch Theme** - User experience improvement
4. **Track User Behavior** - Business intelligence foundation

#### Low Priority Use Cases
1. **Install PWA** - Progressive enhancement
2. **Submit Feedback** - Community engagement
3. **Use Offline Mode** - Reliability enhancement
4. **Export Analytics Data** - Advanced admin feature

### Success Metrics

#### User Engagement
- Map interaction frequency
- Search query volume
- Direction request count
- User session duration

#### System Performance
- Page load times
- API response times
- Error rates
- Uptime metrics

#### Business Impact
- User acquisition rate
- Feature adoption rate
- User satisfaction scores
- System usage growth