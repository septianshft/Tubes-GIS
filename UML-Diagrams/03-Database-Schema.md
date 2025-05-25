# LaundryMap Database Schema

```plantuml
@startuml LaundryMapDatabaseSchema

!theme plain
skinparam backgroundColor White
skinparam entityBackgroundColor LightBlue
skinparam entityBorderColor Navy
skinparam entityFontColor Black

' Database tables
entity "laundries" as laundries {
  * id : INTEGER <<PK>>
  --
  * name : TEXT
  * address : TEXT
  * lat : REAL
  * lng : REAL
  * type : TEXT
  * capacity : INTEGER
  operating_hours : TEXT
  contact_phone : TEXT
  price_range : TEXT
  facilities : TEXT
  rating : REAL
  created_at : DATETIME
  updated_at : DATETIME
}

entity "analytics_events" as analytics {
  * id : INTEGER <<PK>>
  --
  * session_id : TEXT
  * event_name : TEXT
  * event_data : TEXT
  * timestamp : DATETIME
  user_agent : TEXT
  ip_address : TEXT
  device_type : TEXT
  browser_info : TEXT
}

entity "user_sessions" as sessions {
  * session_id : TEXT <<PK>>
  --
  * start_time : DATETIME
  * end_time : DATETIME
  page_views : INTEGER
  search_count : INTEGER
  location_requests : INTEGER
  directions_requests : INTEGER
  engagement_score : REAL
  device_type : TEXT
  last_activity : DATETIME
}

entity "feedback" as feedback {
  * id : INTEGER <<PK>>
  --
  * laundry_id : INTEGER <<FK>>
  * rating : INTEGER
  * comment : TEXT
  * timestamp : DATETIME
  session_id : TEXT
  helpful_votes : INTEGER
}

entity "search_queries" as searches {
  * id : INTEGER <<PK>>
  --
  * session_id : TEXT <<FK>>
  * query_text : TEXT
  * results_count : INTEGER
  * time_to_results : INTEGER
  * timestamp : DATETIME
  filters_applied : TEXT
}

entity "location_tracking" as locations {
  * id : INTEGER <<PK>>
  --
  * session_id : TEXT <<FK>>
  * latitude : REAL
  * longitude : REAL
  * accuracy : REAL
  * timestamp : DATETIME
  permission_granted : BOOLEAN
}

' Relationships
laundries ||--o{ feedback : "receives feedback"
sessions ||--o{ analytics : "generates events"
sessions ||--o{ searches : "performs searches"
sessions ||--o{ locations : "tracks location"
sessions ||--o{ feedback : "submits feedback"

' Indexes and constraints
note right of laundries
  Primary data table containing
  35+ laundry locations around
  Telkom University campus
  
  Indexes:
  - idx_location (lat, lng)
  - idx_type
  - idx_rating
end note

note right of analytics
  Event tracking table for
  user behavior analysis
  
  Indexes:
  - idx_session_timestamp
  - idx_event_name
end note

note right of sessions
  User session management
  for analytics and tracking
  
  Constraints:
  - start_time < end_time
  - engagement_score 0-100
end note

@enduml
```

## Database Schema Overview

The LaundryMap database uses SQLite and consists of 6 main tables:

### Core Tables

#### 1. laundries
- **Purpose**: Stores laundry location data
- **Key Features**: Geospatial coordinates, facility information, ratings
- **Size**: 35+ records covering Telkom University area

#### 2. analytics_events
- **Purpose**: Tracks user interactions and behavior
- **Key Features**: Event-based tracking, session correlation
- **Data Types**: Page views, searches, clicks, errors

#### 3. user_sessions
- **Purpose**: Manages user session data
- **Key Features**: Session duration, engagement metrics
- **Analytics**: Used for dashboard insights

### Supporting Tables

#### 4. feedback
- **Purpose**: User reviews and ratings for laundries
- **Key Features**: Rating system, comment storage
- **Relationship**: Links to specific laundries

#### 5. search_queries
- **Purpose**: Search behavior analysis
- **Key Features**: Query text, performance metrics
- **Analytics**: Search effectiveness tracking

#### 6. location_tracking
- **Purpose**: Geolocation usage patterns
- **Key Features**: GPS coordinates, accuracy data
- **Privacy**: Anonymous session-based tracking

### Key Database Features
- **Lightweight**: SQLite for simple deployment
- **Indexed**: Optimized for location-based queries
- **Analytics-Ready**: Structured for dashboard reporting
- **Privacy-Focused**: No personal data storage