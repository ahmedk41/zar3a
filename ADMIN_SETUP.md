# 🛡️ Admin System Setup - Agro-Expert Approval

## Overview

The Zar3a platform includes an admin system that allows administrators to review and approve agro-expert applications. When users register and choose the "Agro-Expert" role, their application goes into a pending state until approved by an admin.

## 🔄 Approval Workflow

```
1. User Registers → 2. Chooses "Agro-Expert" Role → 3. Completes Expert Profile
   ↓
4. Application goes to PENDING state
   ↓
5. Admin reviews in /admin panel
   ↓
6. Admin APPROVES or REJECTS
   ↓
7. User gets approved/rejected status
```

## 🛠️ Setup Instructions

### Step 1: Create Admin User

Run this command in the backend directory:

```bash
cd "zar3a-backend copy"
npm run create-admin
```

This creates an admin user with:
- **Email**: admin@zar3a.com
- **Password**: admin123
- **Role**: ADMIN

### Step 2: Start the Application

```bash
# In the root directory
npm run dev
```

### Step 3: Login as Admin

1. Go to http://localhost:5173/login
2. Login with:
   - Email: admin@zar3a.com
   - Password: admin123

### Step 4: Access Admin Panel

Once logged in as admin, you'll see an "Admin" link in the navigation. Click it to access the admin panel at `/admin`.

## 📋 Admin Panel Features

### Dashboard Stats
- **Pending Requests**: Number of agro-expert applications waiting approval
- **With Profiles**: Applications that have completed their expert profiles
- **Today's Date**: Current date for reference

### Pending Experts List
For each pending application, admins can see:
- **User Info**: Name, username, email, phone
- **Expert Profile**: Academic degree, experience years
- **CV Download**: Link to download uploaded CV (if provided)
- **Application Date**: When the application was submitted

### Actions Available
- **✅ Approve**: Approve the expert application
- **❌ Reject**: Reject the application (removes from pending list)

## 🔧 Technical Implementation

### Backend Changes

#### New Routes (Admin Only)
```javascript
GET  /auth/admin/pending-experts    // Get all pending experts
POST /auth/admin/approve-expert/:id // Approve specific expert
POST /auth/admin/promote/:id        // Promote user to admin
```

#### Database States
- **Regular Users**: `role: 'FARMER'|'BUYER'|'SUPPLIER'`, `isApproved: true`
- **Pending Experts**: `pendingRole: 'AGRO_EXPERT'`, `isApproved: false`
- **Approved Experts**: `role: 'AGRO_EXPERT'`, `isApproved: true`
- **Admins**: `role: 'ADMIN'`, `isApproved: true`

### Frontend Changes

#### New Components
- **Admin Page**: `/src/pages/Admin/Admin.jsx` - Main admin interface
- **Admin Route**: `/admin` - Protected admin route

#### AuthContext Updates
```javascript
// New admin functions
getPendingExperts()     // Fetch pending applications
approveExpert(userId)   // Approve an expert
promoteToAdmin(userId)  // Make user admin
```

#### Navigation Updates
- Admin link appears in navbar only for admin users
- Uses shield icon (LuShield) to indicate admin access

## 🧪 Testing the System

### Create Test Users

1. **Register a regular user** at http://localhost:5173/register
2. **Choose "Agro-Expert" role** during registration
3. **Complete expert profile** with degree and experience
4. **Login as admin** and check the admin panel
5. **Approve/reject** the application

### Verify States

**Before Approval:**
```sql
SELECT id, fullName, pendingRole, role, isApproved FROM users WHERE pendingRole = 'AGRO_EXPERT';
-- Should show: pendingRole: 'AGRO_EXPERT', role: null, isApproved: false
```

**After Approval:**
```sql
SELECT id, fullName, pendingRole, role, isApproved FROM users WHERE role = 'AGRO_EXPERT';
-- Should show: pendingRole: null, role: 'AGRO_EXPERT', isApproved: true
```

## 🔐 Security Features

### Admin-Only Access
- All admin routes require `authenticate` + `adminOnly` middleware
- `adminOnly` middleware checks `req.user.role === 'ADMIN'`
- Frontend conditionally shows admin navigation

### Expert Approval Process
- Experts must complete profile before admin can approve
- Admin can only approve users with `pendingRole: 'AGRO_EXPERT'`
- Approved experts get `role: 'AGRO_EXPERT'` and `isApproved: true`

## 📱 User Experience

### For Regular Users
- Register → Choose role → Complete profile
- If choosing "Agro-Expert", get message about pending approval
- Cannot access expert features until approved

### For Admins
- Dedicated admin panel with clean interface
- Real-time stats and pending request counts
- Easy approve/reject actions with loading states
- Success/error messages for all actions

## 🚨 Troubleshooting

### Admin Panel Not Showing
```bash
# Check user role in database
SELECT id, email, role FROM users WHERE email = 'admin@zar3a.com';
# Should show role: 'ADMIN'
```

### No Pending Experts Showing
```bash
# Check for pending experts
SELECT id, fullName, pendingRole FROM users WHERE pendingRole = 'AGRO_EXPERT';
# Should return results if there are pending applications
```

### Approval Not Working
- Check browser console for API errors
- Verify admin is logged in with correct token
- Check backend logs for server errors

### CV Download Not Working
- Verify file was uploaded during registration
- Check `uploads/cv/` directory exists
- Ensure file path is correct in database

## 🔄 Future Enhancements

### Potential Additions
- **Email Notifications**: Notify users when approved/rejected
- **Bulk Actions**: Approve/reject multiple applications
- **Expert Categories**: Different types of experts (soil, crops, etc.)
- **Review Comments**: Admins can add comments when approving/rejecting
- **Audit Log**: Track all admin actions
- **Expert Verification**: Additional verification steps

### Database Schema Extensions
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN admin_notes TEXT;
ALTER TABLE users ADD COLUMN approved_at DATETIME;
ALTER TABLE users ADD COLUMN approved_by INT;

-- Add expert categories
CREATE TABLE expert_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Link experts to categories
CREATE TABLE user_expert_categories (
  user_id INT,
  category_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES expert_categories(id)
);
```

## 📚 API Documentation

### Admin Endpoints

#### Get Pending Experts
```http
GET /auth/admin/pending-experts
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "id": 2,
    "fullName": "John Expert",
    "username": "johnexpert",
    "email": "john@example.com",
    "phone": "1234567890",
    "pendingRole": "AGRO_EXPERT",
    "AgroExpertProfile": {
      "academicDegree": "PhD in Agriculture",
      "experienceYears": 10,
      "cvFilePath": "uploads/cv/cv_123.pdf"
    }
  }
]
```

#### Approve Expert
```http
POST /auth/admin/approve-expert/2
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Expert approved successfully",
  "user": {
    "id": 2,
    "fullName": "John Expert",
    "role": "AGRO_EXPERT",
    "isApproved": true
  }
}
```

#### Promote to Admin
```http
POST /auth/admin/promote/1
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "User promoted to admin successfully",
  "user": {
    "id": 1,
    "role": "ADMIN"
  }
}
```

---

## 🎯 Quick Start Commands

```bash
# 1. Create admin user
cd "zar3a-backend copy"
npm run create-admin

# 2. Start both servers
cd ../..
npm run dev

# 3. Login as admin
# Email: admin@zar3a.com
# Password: admin123

# 4. Access admin panel
# http://localhost:5173/admin
```

---

**The admin system is now fully functional! 🌱**
