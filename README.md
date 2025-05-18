# 🎟️ Eventory

**Eventory** is a powerful and modern full-stack event booking platform built using Django REST Framework and React.js. It supports user authentication, event management, real-time seat booking, profile handling, and more — all styled with a sleek, responsive interface.

---

## 🚀 Features

- 🔐 Token-based authentication (`Dusty` prefix)
- 📅 Admin-managed event creation and updates
- 🎫 User-friendly event booking and cancellation
- 🧑‍💼 User profile management with image upload
- 🌗 Light/Dark mode toggle (localStorage synced)
- 🔔 Real-time notifications and friend request system (optional)
- ☁️ AWS S3 integration for media storage

---

## 🛠 Tech Stack

- **Backend:** Django, Django REST Framework, PostgreSQL
- **Frontend:** React.js, Tailwind CSS, Framer Motion
- **Authentication:** Custom Token Auth (`Dusty`)
- **Storage:** AWS S3
- **Database:** PostgreSQL
- **Styling & Animation:** Tailwind CSS, Framer Motion

---

## 📦 Project Structure

```
eventory/
├── backend/                  # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/                 # React frontend
│   ├── package.json
│   ├── src/
│   └── ...
├── .env                      # Environment variables
└── README.md
```

---

## 🧑‍💻 Getting Started

### ✅ Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- PostgreSQL
- AWS S3 account (for media storage)

---

### ⚙️ Backend Setup

1. **Create and activate a virtual environment**:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:

```bash
pip install -r requirements.txt
```

3. **Create a `.env` file** in the project root with the following variables:

```env
# AWS S3 Credentials
AWS_ACCESS_KEY_ID=''
AWS_SECRET_ACCESS_KEY=''
AWS_STORAGE_BUCKET_NAME=''
AWS_S3_REGION_NAME=''
AWS_S3_ADDRESSING_STYLE=

# PostgreSQL Database Config
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
```

4. **Apply migrations**:

```bash
python manage.py migrate
```

5. **Run the backend server**:

```bash
python manage.py runserver
```

---

### 💻 Frontend Setup

1. **Navigate to the frontend folder**:

```bash
cd frontend
```

2. **Install required packages**:

```bash
npm install
```

3. **Start the React development server**:

```bash
npm start
```

---

## 🌐 Environment Variables Summary

Make sure your `.env` file is configured as follows for both AWS and database integration:

```env
# AWS S3
AWS_ACCESS_KEY_ID=''
AWS_SECRET_ACCESS_KEY=''
AWS_STORAGE_BUCKET_NAME=''
AWS_S3_REGION_NAME='eu-north-1'
AWS_S3_ADDRESSING_STYLE=virtual

# PostgreSQL
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
```

---

## 👤 User Roles

- **Admin**
  - Can create, update, delete events
- **User**
  - Can browse and book events
  - Can update profile

---

## 🙌 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

## 📬 Contact

Developed by **Allem**  
📧 Email: [allemhamed98@gmail.com](mailto:allemhamed98@gmail.com)  
🔗 GitHub: [https://github.com/C4ll-0f-Du5ty](https://github.com/C4ll-0f-Du5ty)     
💼 Portfolio: [https://allem.pro/](https://allem.pro/)
