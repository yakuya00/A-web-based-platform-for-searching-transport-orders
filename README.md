# Logistics & Transport Order Tracking Platform (Graduation Thesis)

A high-performance Full-Stack web application built from scratch to streamline logistics, transport order searching, and real-time cargo tracking. This project served as my final university graduation thesis, focusing heavily on robust database design and efficient query execution.

## 🚀 Key Features & Architecture

* **Database Core (30+ Tables):** Engineered a complex relational database schema utilizing pure PostgreSQL. Focuses on data integrity, strict relations, and avoidance of heavy ORM performance overhead.
* **Real-Time Communication:** Integrated WebSockets server-side to handle live order tracking updates and instant state changes between dispatchers and drivers.
* **Event-Driven Backend:** Built with Express.js to process asynchronous business logic, order matches, and logistics data pipelines.
* **Full-Stack Integration:** Developed a clean, responsive client-side interface seamlessly connected with the backend REST API.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js, WebSockets (ws)
* **Database:** PostgreSQL (Pure SQL queries, custom aggregations)
* **DevOps & Infra:** Docker, Docker Compose, Git
* **Frontend:** JavaScript, HTML5, CSS3

---

## 📊 Database Design Highlights

To maintain full control over the execution plan and query performance, this project intentionally avoids heavy ORMs. 
* Structured with **30+ interrelated tables** covering users, roles, transport vehicles, orders, routing points, and real-time status history.
* Utilizes explicit indexes, deep `JOIN` operations, and aggregated SQL logic tailored for logistics reporting.

---

## 📦 Local Development

### Prerequisites
* Node.js (v18+ recommended)
* PostgreSQL (or Docker installed)

### Setup
1. Clone the repository:
   ```bash
   git clone [https://github.com/yakuya00/A-web-based-platform-for-searching-transport-orders.git](https://github.com/yakuya00/A-web-based-platform-for-searching-transport-orders.git)
   cd A-web-based-platform-for-searching-transport-orders
