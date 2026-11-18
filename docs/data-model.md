# Modèle de données — Vite & Gourmand

Ce document décrit le modèle relationnel (PostgreSQL) de l'application. Les noms des tables
et des colonnes sont en anglais, comme le reste du code.

MongoDB n'est utilisé que pour les **statistiques de commandes par menu** (voir plus bas).

## Diagramme entité-association

```mermaid
erDiagram
    ROLE ||--o{ APP_USER : "a"
    APP_USER ||--o{ PASSWORD_RESET_TOKEN : "demande"
    APP_USER ||--o{ CUSTOMER_ORDER : "passe"
    APP_USER ||--o{ REVIEW : "écrit"
    THEME ||--o{ MENU : "classe"
    DIET ||--o{ MENU : "classe"
    MENU ||--o{ MENU_IMAGE : "illustré par"
    MENU ||--o{ MENU_DISH : "contient"
    DISH ||--o{ MENU_DISH : "appartient à"
    DISH ||--o{ DISH_ALLERGEN : "contient"
    ALLERGEN ||--o{ DISH_ALLERGEN : "présent dans"
    MENU ||--o{ CUSTOMER_ORDER : "commandé dans"
    CUSTOMER_ORDER ||--o{ ORDER_STATUS_HISTORY : "historise"
    CUSTOMER_ORDER ||--o| REVIEW : "donne lieu à"

    ROLE {
        int role_id PK
        varchar label UK "user, employee, admin"
    }
    APP_USER {
        int user_id PK
        int role_id FK
        varchar email UK
        varchar password_hash
        varchar last_name
        varchar first_name
        varchar phone
        varchar address
        varchar postcode
        varchar city
        boolean is_active
        timestamptz gdpr_consent_at
        timestamptz created_at
    }
    PASSWORD_RESET_TOKEN {
        int token_id PK
        int user_id FK
        char token_hash UK
        timestamptz expires_at
        timestamptz used_at
    }
    THEME {
        int theme_id PK
        varchar label UK
    }
    DIET {
        int diet_id PK
        varchar label UK
    }
    ALLERGEN {
        int allergen_id PK
        varchar label UK
    }
    MENU {
        int menu_id PK
        int theme_id FK
        int diet_id FK
        varchar title
        text description
        int min_people
        numeric min_price "prix pour min_people personnes"
        text conditions
        int stock
        boolean is_active
    }
    MENU_IMAGE {
        int image_id PK
        int menu_id FK
        varchar url
        varchar alt_text
        smallint position
    }
    DISH {
        int dish_id PK
        varchar name
        varchar course "starter, main, dessert"
        text description
    }
    MENU_DISH {
        int menu_id PK,FK
        int dish_id PK,FK
    }
    DISH_ALLERGEN {
        int dish_id PK,FK
        int allergen_id PK,FK
    }
    CUSTOMER_ORDER {
        int order_id PK
        varchar order_number UK
        int user_id FK
        int menu_id FK
        int people
        varchar event_address
        date event_date
        time event_time
        numeric delivery_km
        numeric menu_price
        numeric discount
        numeric delivery_price
        numeric total_price
        varchar status
        boolean equipment_loan
        timestamptz created_at
    }
    ORDER_STATUS_HISTORY {
        int history_id PK
        int order_id FK
        varchar status
        timestamptz changed_at
        int changed_by FK
        varchar contact_method "phone, email"
        text reason
    }
    REVIEW {
        int review_id PK
        int order_id FK,UK
        int user_id FK
        smallint rating "1 à 5"
        text comment
        varchar status "pending, approved, rejected"
    }
    OPENING_HOURS {
        smallint day_of_week PK "1 = lundi ... 7 = dimanche"
        time open_time
        time close_time
        boolean is_closed
    }
```
