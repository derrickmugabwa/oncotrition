# Events & Announcements - Quick Reference Card

## 🚀 Quick Start (3 Steps)

1. **Run Migrations:**
   ```bash
   supabase db push
   ```

2. **Access Admin:**
   - Go to `/admin`
   - Click "Events & Announcements" in sidebar

3. **View Frontend:**
   - Events page: `/events`
   - Announcement popup: Refresh homepage (appears after 1.5s)

---

## 📍 Important Locations

### **Frontend URLs:**
- Events listing: `http://localhost:3000/events`
- Event detail: `http://localhost:3000/events/[id]`

### **Admin URLs:**
- Admin dashboard: `http://localhost:3000/admin`
- Events management: `http://localhost:3000/admin/pages/events`

### **File Locations:**
```
Frontend:
- app/(site)/events/page.tsx
- app/(site)/events/[id]/page.tsx
- components/events/
- components/announcements/

Admin:
- app/admin/pages/events/page.tsx
- components/admin/events/
- components/admin/announcements/

Database:
- supabase/migrations/20250117_create_events_table.sql
- supabase/migrations/20250117_create_announcements_table.sql
- supabase/migrations/20250117_create_user_announcement_views_table.sql

Types:
- types/events.ts
```

---

## 🎯 Admin Quick Actions

### **Create Event:**
1. Admin → Events & Announcements → Events tab
2. Click "Create Event"
3. Fill form → Upload image → Save

### **Create Announcement:**
1. Admin → Events & Announcements → Announcements tab
2. Click "Create Announcement"
3. Fill form → Preview → Save

### **Toggle Announcement:**
- Click toggle icon (⚡) to activate/deactivate

### **Edit/Delete:**
- Click edit icon (✏️) to modify
- Click delete icon (🗑️) to remove

---

## 📊 Database Tables

### **events**
- Main table for all events
- Fields: title, description, date, time, location, status, attendees, etc.

### **announcements**
- Popup announcements
- Fields: title, message, type, CTA, dates, priority, frequency

### **user_announcement_views**
- Tracks which users saw which announcements
- Prevents duplicate displays

---

## 🎨 Component Overview

### **Frontend (User-Facing):**
- `EventsList` - Main events listing with filters
- `EventCard` - Individual event cards
- `EventDetail` - Full event information
- `EventDetailClient` - Share & calendar features
- `AnnouncementPopup` - Modal popup
- `AnnouncementManager` - Display logic

### **Admin (Management):**
- `EventsTab` - List and manage events
- `EventEditor` - Create/edit events
- `AnnouncementsTab` - List and manage announcements
- `AnnouncementEditor` - Create/edit announcements
- `EventsManagement` - Wrapper with tabs

---

## 🔧 Common Tasks

### **Change Popup Delay:**
Edit `components/announcements/AnnouncementManager.tsx` line ~75:
```typescript
setTimeout(() => {
  setCurrentAnnouncement(announcementQueue[0]);
}, 1500); // Change this value (milliseconds)
```

### **Add Sample Event (SQL):**
```sql
INSERT INTO events (title, description, event_date, event_time, location, status)
VALUES ('My Event', 'Description', '2025-12-31', '14:00:00', 'Location', 'upcoming');
```

### **Clear Announcement Views (localStorage):**
```javascript
localStorage.clear(); // In browser console
```

### **Test Announcement Popup:**
1. Create announcement in admin
2. Set start_date to today
3. Set end_date to future
4. Mark as active
5. Refresh homepage

---

## 🐛 Troubleshooting

### **Events page shows no events:**
- Check if migrations ran: `supabase db push`
- Verify events table exists in Supabase
- Check sample data was inserted

### **Announcement doesn't appear:**
- Verify announcement is active
- Check date range (start_date <= now <= end_date)
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors

### **Images not loading:**
- Verify Supabase Storage bucket `images` exists
- Check image URLs in database
- Ensure images uploaded successfully

### **Admin page not accessible:**
- Verify you're logged in
- Check `/admin/login` if redirected
- Verify admin routes exist

---

## 📱 Testing Checklist

**Frontend:**
- [ ] Events page loads
- [ ] Search works
- [ ] Filters work
- [ ] Event details open
- [ ] Add to calendar works
- [ ] Share buttons work
- [ ] Mobile responsive
- [ ] Announcement popup appears

**Admin:**
- [ ] Can create event
- [ ] Can edit event
- [ ] Can delete event
- [ ] Can upload image
- [ ] Can create announcement
- [ ] Can preview announcement
- [ ] Can toggle active/inactive
- [ ] Search and filters work

---

## 🎯 Key Features

### **Events:**
✅ Server-side rendering
✅ Search & filters
✅ Attendee tracking
✅ Featured events
✅ Status management
✅ Add to calendar
✅ Social sharing

### **Announcements:**
✅ Priority queue
✅ Display frequency (once, daily, always)
✅ Session tracking
✅ Type-based styling
✅ CTA buttons
✅ Live preview
✅ Date scheduling

---

## 📚 Documentation Files

1. **EVENTS_FEATURE_PLAN.md** - Full implementation plan
2. **EVENTS_PROGRESS.md** - Progress tracking
3. **EVENTS_IMPLEMENTATION_SUMMARY.md** - Technical details
4. **EVENTS_QUICKSTART.md** - 5-minute setup
5. **EVENTS_COMPLETE_SUMMARY.md** - Comprehensive overview
6. **EVENTS_QUICK_REFERENCE.md** - This file

---

## 💡 Pro Tips

1. **Featured Events** appear first in listing
2. **Priority 10** announcements show before priority 1
3. **Display frequency "once"** = show only once per user
4. **Display frequency "daily"** = show once per day
5. **Display frequency "always"** = show every visit
6. Use **relative paths** (/events) for internal links
7. Use **full URLs** (https://...) for external links
8. **Image size**: 1200x600px for events, 1200x800px for announcements
9. **Status "upcoming"** = shows on events page
10. **Status "cancelled"** = shows cancelled notice

---

## 🔗 Quick Links

- **Admin Dashboard:** `/admin`
- **Events Management:** `/admin/pages/events`
- **Events Page:** `/events`
- **Supabase Dashboard:** Your Supabase project URL
- **Documentation:** See files above

---

## ✨ Status: PRODUCTION READY ✅

All phases complete. System fully functional and integrated.

**Need help?** Check the documentation files or review the code comments.

**Happy managing! 🎉**
