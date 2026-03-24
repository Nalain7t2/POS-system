# POS System - Desktop Point of Sale Application

A full-featured desktop POS system built with **Next.js 16** and **Electron.js**.

## 📸 Screenshots

<img width="1617" height="938" alt="Screenshot 2026-03-23 230057" src="https://github.com/user-attachments/assets/3b864e92-b51a-4687-b171-6c4fc246d17e" />
<img width="1553" height="938" alt="Screenshot 2026-03-23 230123" src="https://github.com/user-attachments/assets/ea3ba848-806a-4990-8bfb-53f1b8ecb3cb" />
<img width="1308" height="940" alt="Screenshot 2026-03-23 230447" src="https://github.com/user-attachments/assets/95f1c009-fd36-4061-9f9b-d05c4b9ec408" />
<img width="1910" height="937" alt="Screenshot 2026-03-23 230513" src="https://github.com/user-attachments/assets/57164505-9f9a-4603-8081-f6eb41605415" />





## ✨ Features

- 🏪 **Inventory Management** – Add, edit, delete products
- 🧾 **Billing System** – Add to cart, calculate totals
- 📊 **Dashboard** – Sales analytics, daily breakdown
- 🖨️ **Receipt Printing** – Printable receipts
- 🗑️ **Delete Receipt** – Remove wrong bills, restore stock
- 📦 **Stock Management** – Low stock alerts
- 🔍 **Search** – Find products quickly

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Frontend framework |
| React 19 | UI library |
| Electron.js | Desktop app wrapper |
| sql.js | SQLite database |
| CSS Modules | Styling |

## 🚀 Installation

### Development

```bash
cd pos-system
npm install
npm run dev
Open http://localhost:3000

Build Desktop App (Windows)
bash
npm run build:exe
The installer will be in dist/ folder.

📁 Project Structure
text
pos-system/
├── app/              # Next.js app router
│   ├── api/          # REST API routes
│   ├── billing/      # Billing page
│   ├── dashboard/    # Dashboard page
│   ├── products/     # Inventory page
│   └── receipt/      # Receipt page
├── database/         # SQLite configuration
├── public/           # Static assets
├── electron.js       # Electron main process
└── package.json      # Dependencies
