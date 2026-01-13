# Admin Events Registration - Access Guide

## 🎯 How to Access Event Registrations

### Method 1: From Admin Events Page (Recommended)

1. **Navigate to Admin Dashboard**
   ```
   /admin/pages/events
   ```

2. **Look for Events with Registration Badge**
   - Events with internal registration show a **teal "Registration" badge** with a users icon
   - Example: "The NutriVibe Session" will have this badge

3. **Click the Users Icon**
   - In the actions column (right side of each event)
   - The **teal users icon** button opens the registrations dashboard
   - Only visible for events with internal registration enabled

4. **You'll be taken to:**
   ```
   /admin/pages/events/[event-id]/registrations
   ```

---

### Method 2: Direct URL

If you know the event ID, go directly to:
```
/admin/pages/events/[event-id]/registrations
```

**Example for NutriVibe:**
```
/admin/pages/events/[nutrivibe-event-id]/registrations
```

---

## 📊 What You'll See

### Registrations Dashboard

```
┌─────────────────────────────────────────────────────┐
│  The NutriVibe Session                              │
│  Manage event registrations and check-ins           │
├─────────────────────────────────────────────────────┤
│  [Total: 23]  [Completed: 20]  [Revenue: 126,000]  │
│  [Checked In: 5/20]                                 │
├─────────────────────────────────────────────────────┤
│  [Search...]  [Status ▼]  [Type ▼]  [Export CSV]  │
├─────────────────────────────────────────────────────┤
│  Registrations Table                                │
│  - Name, Email, Phone                               │
│  - Type, Amount, Status                             │
│  - Check-in Status                                  │
├─────────────────────────────────────────────────────┤
│  Quick Actions:                                     │
│  [Manage Pricing] [Interest Areas] [QR Scanner]    │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Visual Indicators on Events Page

### Event Card Badges

Each event card shows:

1. **Featured Badge** (Yellow)
   - Shows if event is featured
   - `Featured`

2. **Registration Badge** (Teal) ⭐ NEW
   - Shows if event has internal registration
   - Icon: 👥 Users
   - Text: `Registration`

3. **Status Badge** (Colored border)
   - `upcoming` - Green
   - `ongoing` - Blue
   - `completed` - Gray
   - `cancelled` - Red

### Action Buttons

For events **WITH** internal registration:
- 👥 **Users Icon** (Teal) - View Registrations ⭐ NEW
- 👁️ **Eye Icon** (Blue) - View Event Page
- ✏️ **Edit Icon** (Gray) - Edit Event
- 🗑️ **Trash Icon** (Red) - Delete Event

For events **WITHOUT** internal registration:
- 👁️ **Eye Icon** (Blue) - View Event Page
- ✏️ **Edit Icon** (Gray) - Edit Event
- 🗑️ **Trash Icon** (Red) - Delete Event

---

## 🎨 UI Preview

### Events List View

```
┌──────────────────────────────────────────────────────────┐
│  The NutriVibe Session                                   │
│  [Featured] [👥 Registration] [upcoming]                 │
│                                                           │
│  Join us for an exciting nutrition networking event...   │
│                                                           │
│  Date: Jan 15, 2026  Time: 10:00  Location: Nairobi     │
│  Attendees: 20 / 100  [████████░░░░░░░░░░] 20%         │
│                                                           │
│  Actions: [👥] [👁️] [✏️] [🗑️]                            │
└──────────────────────────────────────────────────────────┘
```

---

## 📱 Navigation Flow

```
Admin Dashboard
    ↓
Events & Announcements
    ↓
Events Tab
    ↓
Find Event with "Registration" Badge
    ↓
Click Users Icon (👥)
    ↓
Registrations Dashboard
    ↓
[View Stats] [Search] [Filter] [Export]
    ↓
Quick Actions:
├── Manage Pricing
├── Manage Interest Areas
└── QR Scanner Check-in
```

---

## ✅ Quick Checklist

Before accessing registrations, make sure:

- [ ] You're logged into admin dashboard
- [ ] Database migration has been run
- [ ] Event has `has_internal_registration = true`
- [ ] Event has `registration_type = 'internal'`
- [ ] You can see the teal "Registration" badge on the event

---

## 🎯 Quick Actions from Registrations Page

Once you're on the registrations dashboard, you can:

1. **View Statistics**
   - Total registrations
   - Completed payments
   - Total revenue
   - Check-in count

2. **Search & Filter**
   - Search by name, email, phone
   - Filter by payment status
   - Filter by participation type

3. **Export Data**
   - Download CSV of all registrations
   - Includes all details

4. **Manage Event Settings**
   - Click "Manage Pricing" → Edit pricing tiers
   - Click "Manage Interest Areas" → Edit interest areas (to be built)
   - Click "QR Scanner" → Check-in attendees (to be built)

---

## 🔗 Related Pages

- **Pricing Management:** `/admin/pages/events/[id]/pricing`
- **Interest Areas:** `/admin/pages/events/[id]/interest-areas` (coming soon)
- **QR Scanner:** `/admin/pages/events/[id]/check-in` (coming soon)

---

## 💡 Pro Tips

1. **Bookmark the Events Page**
   - `/admin/pages/events` is your main hub

2. **Look for the Badge**
   - The teal "Registration" badge tells you which events have registrations to manage

3. **Use the Users Icon**
   - Fastest way to access registrations dashboard

4. **Export Regularly**
   - Download CSV backups of registration data

5. **Check Statistics**
   - Dashboard shows real-time stats at a glance

---

## 🎉 You're All Set!

**To access registrations:**
1. Go to `/admin/pages/events`
2. Find event with teal "Registration" badge
3. Click the users icon (👥)
4. Manage registrations!

**Need help?** Check `ADMIN_EVENTS_SETUP.md` for detailed feature documentation.
