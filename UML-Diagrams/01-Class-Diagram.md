# LaundryMap Class Diagram (Conceptual Design)

```plantuml
@startuml LaundryMapConceptualDesign

' Style settings
!theme plain
skinparam backgroundColor White
skinparam classBackgroundColor LightBlue
skinparam classBorderColor Navy
skinparam classFontColor Black
skinparam classHeaderBackgroundColor Navy
skinparam classHeaderFontColor White

' Core Domain Classes
class LaundryMapApp {
    + initializeApp()
    + displayMap()
    + handleUserInteraction()
}

class Laundry {
    + id: Integer
    + name: String
    + location: Location
    + operatingHours: String
    + priceRange: String
    + services: List<String>
    + rating: Float
}

class Location {
    + latitude: Double
    + longitude: Double
    + address: String
    + getDistanceTo(other: Location): Double
}

class User {
    + currentLocation: Location
    + searchQuery: String
    + preferences: UserPreferences
    + searchLaundries(criteria: String): List<Laundry>
    + getDirections(destination: Laundry): Route
}

class UserPreferences {
    + maxDistance: Double
    + priceRange: String
    + preferredServices: List<String>
    + theme: String
}

class Map {
    + center: Location
    + zoomLevel: Integer
    + markers: List<Marker>
    + displayLaundries(laundries: List<Laundry>)
    + showRoute(route: Route)
    + centerOnLocation(location: Location)
}

class Route {
    + startPoint: Location
    + endPoint: Location
    + directions: List<String>
    + estimatedTime: Integer
    + distance: Double
}

class SearchService {
    + findNearbyLaundries(location: Location, radius: Double): List<Laundry>
    + searchByName(query: String): List<Laundry>
    + filterByServices(services: List<String>): List<Laundry>
}

class NavigationService {
    + calculateRoute(from: Location, to: Location): Route
    + getCurrentLocation(): Location
}

' Relationships
LaundryMapApp --> Map : displays
LaundryMapApp --> User : interacts with
LaundryMapApp --> SearchService : uses
LaundryMapApp --> NavigationService : uses

User --> UserPreferences : has
User --> Location : current location
User *-- SearchService : uses
User *-- NavigationService : uses

SearchService --> Laundry : finds
NavigationService --> Route : creates

Map --> Laundry : shows
Map --> Route : displays
Map --> Location : centers on

Laundry --> Location : located at
Route --> Location : connects

@enduml
```

## Class Diagram Overview

This simplified class diagram shows the **core domain concepts** for the LaundryMap project during the initial design phase.

### Core Domain Classes

#### LaundryMapApp
- **Purpose**: Main application controller
- **Responsibility**: Coordinate user interactions and system components
- **Role**: Entry point and orchestrator

#### Laundry
- **Purpose**: Core business entity representing a laundry service
- **Responsibility**: Store laundry location and service information
- **Role**: Primary data model

#### Location
- **Purpose**: Geographic position and address information
- **Responsibility**: Handle spatial calculations and location data
- **Role**: Supporting data model for geographic operations

#### User
- **Purpose**: Represent application user and their context
- **Responsibility**: Manage user state, preferences, and interactions
- **Role**: User context management

### Supporting Classes

#### UserPreferences
- **Purpose**: Store user's customization settings
- **Responsibility**: Maintain user preferences and settings
- **Role**: Configuration management

#### Map
- **Purpose**: Visual representation and interaction with geographic data
- **Responsibility**: Display laundries, routes, and user interface
- **Role**: Presentation layer for geographic data

#### Route
- **Purpose**: Navigation path between two locations
- **Responsibility**: Store direction information and travel estimates
- **Role**: Navigation data model

### Service Classes

#### SearchService
- **Purpose**: Handle laundry discovery and filtering
- **Responsibility**: Implement search algorithms and filtering logic
- **Role**: Business logic for discovery features

#### NavigationService
- **Purpose**: Provide routing and location services
- **Responsibility**: Calculate routes and manage geolocation
- **Role**: Geographic and navigation operations

## Design Principles

### 1. **Domain-Driven Design**
- Classes represent real-world concepts (Laundry, User, Location)
- Clear separation between domain models and services
- Business logic encapsulated in appropriate classes

### 2. **Single Responsibility**
- Each class has one clear purpose
- Services handle specific business operations
- Data models focus on data representation

### 3. **Loose Coupling**
- Classes interact through well-defined interfaces
- Services can be implemented independently
- Easy to modify or extend individual components

### 4. **Simple Relationships**
- Clear composition and association relationships
- No complex inheritance hierarchies
- Straightforward dependencies

This conceptual design provides a foundation for implementation while remaining simple enough for project planning and team communication.