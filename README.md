# Webová platforma pro vyhledávání přepravních zakázek (Logistics SaaS Platform)

[cite_start]A Full-Stack web application built from scratch designed to connect transport customers (shippers) and carriers[cite: 55, 60]. [cite_start]This platform digitalizes key logistics processes, simplifies real-time communication, and introduces an agile confirmation system[cite: 83, 147]. 

[cite_start]Developed as my final bachelor thesis at Palacký University Olomouc[cite: 3, 40].

## 🚀 Key Features

* [cite_start]**Multi-Tenant Corporate Structure:** Supports registration for Shippers, Carriers, and Forwarders (Spedice) with specific access control lists (ACL) and internal roles (Admin, Dispatcher, Driver)[cite: 86, 161, 162, 210, 211, 214, 216].
* [cite_start]**Bidding System:** Shippers can publish freight offers, and carriers can submit custom pricing bids for specific orders[cite: 166, 168, 774].
* [cite_start]**QR-Code Verification Ecosystem:** Eliminates total dependency on paper documents by generating unique QR codes for cargo pickup (loading) and delivery (unloading), instantly updating order states via the driver's mobile UI[cite: 143, 171, 193, 194].
* [cite_start]**Geographical Radius Search:** Integrated map layout utilizing OpenStreetMap and Leaflet on the frontend [cite: 88, 273][cite_start], powered by PostGIS database extensions backend-side to filter logistics orders within specified geographical ranges[cite: 303, 304].
* [cite_start]**Contextual Real-Time Chat:** A Socket.io-driven messaging module bound strictly to individual orders, preserving full negotiation history for disputation prevention[cite: 131, 183, 187, 188, 295].
* [cite_start]**Rating & Reputation System:** Post-delivery evaluation mechanism allowing transparent feedback and rating exchange between partners[cite: 88, 131, 868].

---

## 🛠️ Tech Stack

* [cite_start]**Frontend:** React (SPA, Hooks) [cite: 56, 232, 255][cite_start], shadcn/ui [cite: 258][cite_start], Tailwind CSS [cite: 261][cite_start], Leaflet & OpenStreetMap[cite: 273].
* [cite_start]**Backend:** Node.js, Express.js (Asynchronous I/O architecture) [cite: 56, 278, 279][cite_start], Socket.io (WebSocket protocol)[cite: 201, 291, 292].
* [cite_start]**Database:** PostgreSQL (30+ relational tables, raw SQL querying for integrity) [cite: 234, 301, 311][cite_start], PostGIS extension[cite: 303].
* [cite_start]**Security & Communications:** JWT for stateless user authentication [cite: 283, 285][cite_start], Nodemailer for HTML verifications and QR distribution[cite: 287, 288].
* [cite_start]**Infra:** Docker, Docker Compose, Git[cite: 591, 635].

---

## 📊 Database Design & System Architecture

[cite_start]The application is built around a classic **Three-Tier Architecture** (Client, Application Server, Persistent Data Store)[cite: 228]. 

[cite_start]To maximize performance and maintain complete control over the execution plans, the backend communicates with PostgreSQL via direct optimized queries rather than using heavy ORMs[cite: 234]. 
* [cite_start]Designed across **30+ normalized tables** (aiming for 3NF alignment) ensuring high data integrity via strict foreign keys and constraints[cite: 301, 311].
* [cite_start]Handles advanced vehicle configurations, supporting modular setups (Euro Combi / Scandinavian long-combination vehicles) via explicit composition mapping tables[cite: 517, 519, 520].

---

## 📦 Local Development

### Prerequisites
* [cite_start]Node.js (v20.x recommended) [cite: 929]
* [cite_start]PostgreSQL with PostGIS extension installed [cite: 299, 303]

### Setup
1. Clone the repository:
   ```bash
   git clone [https://github.com/yakuya00/A-web-based-platform-for-searching-transport-orders.git](https://github.com/yakuya00/A-web-based-platform-for-searching-transport-orders.git)
   cd A-web-based-platform-for-searching-transport-orders
