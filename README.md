# Webová platforma pro vyhledávání přepravních zakázek (Logistics SaaS Platform)

A Full-Stack web application built from scratch designed to connect transport customers (shippers) and carriers. This platform digitalizes key logistics processes, simplifies real-time communication, and introduces an agile confirmation system. 

Developed as my final bachelor thesis at Palacký University Olomouc.

## 🚀 Key Features

* **Multi-Tenant Corporate Structure:** Supports registration for Shippers, Carriers, and Forwarders (Spedice) with specific access control lists (ACL) and internal roles (Admin, Dispatcher, Driver).
* **Bidding System:** Shippers can publish freight offers, and carriers can submit custom pricing bids for specific orders.
* **QR-Code Verification Ecosystem:** Eliminates total dependency on paper documents by generating unique QR codes for cargo pickup (loading) and delivery (unloading), instantly updating order states via the driver's mobile UI.
* **Geographical Radius Search:** Integrated map layout utilizing OpenStreetMap and Leaflet on the frontend, powered by PostGIS database extensions backend-side to filter logistics orders within specified geographical ranges.
* **Contextual Real-Time Chat:** A Socket.io-driven messaging module bound strictly to individual orders, preserving full negotiation history for disputation prevention.
* **Rating & Reputation System:** Post-delivery evaluation mechanism allowing transparent feedback and rating exchange between partners.

---

## 🛠️ Tech Stack

* **Frontend:** React (SPA, Hooks), shadcn/ui, Tailwind CSS, Leaflet & OpenStreetMap.
* **Backend:** Node.js, Express.js (Asynchronous I/O architecture), Socket.io (WebSocket protocol).
* **Database:** PostgreSQL (30+ relational tables, raw SQL querying for integrity), PostGIS extension.
* **Security & Communications:** JWT for stateless user authentication, Nodemailer for HTML verifications and QR distribution.
* **Infra:** Docker, Docker Compose, Git.

---

## 📊 Database Design & System Architecture

The application is built around a classic **Three-Tier Architecture** (Client, Application Server, Persistent Data Store). 

To maximize performance and maintain complete control over the execution plans, the backend communicates with PostgreSQL via direct optimized queries rather than using heavy ORMs. 
* Designed across **30+ normalized tables** (aiming for 3NF alignment) ensuring high data integrity via strict foreign keys and constraints.
* Handles advanced vehicle configurations, supporting modular setups (Euro Combi / Scandinavian long-combination vehicles) via explicit composition mapping tables.

---

## 📦 Local Development

### Prerequisites
* Node.js (v20.x recommended)
* PostgreSQL with PostGIS extension installed 

### Setup
1. Clone the repository:
   ```bash
   git clone [https://github.com/yakuya00/A-web-based-platform-for-searching-transport-orders.git](https://github.com/yakuya00/A-web-based-platform-for-searching-transport-orders.git)
   cd A-web-based-platform-for-searching-transport-orders
2. Setup backend environment variables (create a /backend/.env file)
3. ```bash
   docker-compose up --build
