# POS System - Desktop Point of Sale Application

A full-featured desktop POS system built with **Next.js 16** and **Electron.js**.

## 📸 Screenshots

*Add screenshots here*

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
git clone https://github.com/yourusername/pos-system.git
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