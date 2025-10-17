# Events & Announcements - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Run Database Migrations
```bash
# Navigate to your project directory
cd "c:\Users\Derrick Mugabwa\Desktop\dev center\oncotrition"

# Apply the migrations (creates tables with sample data)
supabase db push
```

### Step 2: Verify Tables Created
Check your Supabase dashboard to confirm these tables exist:
- ✅ `events`
- ✅ `announcements`
- ✅ `user_announcement_views`

### Step 3: Add Events to Navigation
1. Go to your admin dashboard
2. Navigate to Navigation Management
3. Add new navigation item:
   - **Name**: Events
   - **Href**: /events
   - **Type**: link
   - **Order**: (your preference)

### Step 4: Test the Events Page
1. Visit `http://localhost:3000/events`
2. You should see 4 sample events
3. Try the search and filters
4. Click on an event to see details
5. Test "Add to Calendar" and "Share" buttons

### Step 5: Test Announcements
1. Refresh your homepage
2. After 1.5 seconds, an announcement popup should appear
3. Test the "Don't show again" button
4. Clear localStorage and refresh to see it again

---

## 📝 Sample Data Included

### Events:
1. **Nutrition Workshop: Meal Planning for Cancer Patients** (Featured)
   - 15 days from today
   - 50 max attendees, 23 registered
   - In-person at Oncotrition Center

2. **Understanding Nutrition During Chemotherapy** (Featured)
   - 30 days from today
   - 100 max attendees, 45 registered
   - Virtual event

3. **Healthy Cooking Class: Anti-Cancer Recipes**
   - 45 days from today
   - 20 max attendees, 12 registered
   - Hands-on cooking class

4. **Nutrition Support Group Meeting**
   - 7 days from today
   - 30 max attendees, 8 registered
   - Monthly support group

### Announcements:
1. **New Workshop Alert** (Priority 10)
   - Links to first event
   - Display frequency: Daily
   - Active for 14 days

2. **Virtual Consultations** (Priority 5)
   - General announcement
   - Display frequency: Once
   - Active for 30 days

---

## 🎨 Customization

### Change Announcement Display Delay
Edit `components/announcements/AnnouncementManager.tsx`:
```typescript
// Line ~75
setTimeout(() => {
  setCurrentAnnouncement(announcementQueue[0]);
  markAsViewed(announcementQueue[0].id);
}, 1500); // Change this value (milliseconds)
```

### Change Colors
Edit the gradient colors in:
- `EventCard.tsx` - Event card styling
- `AnnouncementPopup.tsx` - Popup type colors
- `EventsList.tsx` - Page background

### Add More Sample Events
Run SQL in Supabase SQL Editor:
```sql
INSERT INTO events (title, description, event_date, event_time, location, status, is_featured)
VALUES (
  'Your Event Title',
  'Your event description',
  CURRENT_DATE + INTERVAL '20 days',
  '15:00:00',
  'Your Location',
  'upcoming',
  false
);
```

---

## 🐛 Troubleshooting

### Events Page Shows No Events
- Check if migrations ran successfully
- Verify `events` table exists in Supabase
- Check browser console for errors

### Announcement Doesn't Appear
- Check if `announcements` table has active records
- Verify dates: `start_date <= now` and `end_date >= now`
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors

### Images Not Loading
- Verify image URLs in database
- Check if images exist in Supabase Storage
- Use placeholder images for testing

### TypeScript Errors
- Run `npm install date-fns` (for date formatting)
- Restart TypeScript server in VS Code
- Check all imports are correct

---

## 📚 File Locations

### Pages:
- Events listing: `app/(site)/events/page.tsx`
- Event detail: `app/(site)/events/[id]/page.tsx`

### Components:
- Events: `components/events/`
- Announcements: `components/announcements/`

### Database:
- Migrations: `supabase/migrations/`
- Types: `types/events.ts`

### Documentation:
- Full plan: `EVENTS_FEATURE_PLAN.md`
- Progress: `EVENTS_PROGRESS.md`
- Summary: `EVENTS_IMPLEMENTATION_SUMMARY.md`

---

## 🎯 What's Next?

### Phase 4: Admin Interface (Optional)
Build admin components to manage events and announcements:
- EventsTab for CRUD operations
- EventEditor with image upload
- AnnouncementsTab for popup management
- AnnouncementEditor with preview

### Phase 5: API Routes (Optional)
Create API endpoints for admin operations:
- POST/PUT/DELETE for events
- POST/PUT/DELETE for announcements
- Authentication middleware

### Phase 6: Enhancements (Optional)
- Event registration form
- Email notifications
- Calendar view
- Google Maps integration
- Event categories
- Waitlist functionality

---

## ✅ Checklist

Before going live:
- [ ] Run database migrations
- [ ] Add Events to navigation
- [ ] Test events page on desktop
- [ ] Test events page on mobile
- [ ] Test event detail pages
- [ ] Test announcement popup
- [ ] Test search and filters
- [ ] Test social sharing
- [ ] Test add to calendar
- [ ] Replace sample data with real events
- [ ] Upload real event images
- [ ] Create real announcements
- [ ] Test on production

---

## 🆘 Need Help?

1. Check the comprehensive plan: `EVENTS_FEATURE_PLAN.md`
2. Review implementation details: `EVENTS_IMPLEMENTATION_SUMMARY.md`
3. Look at similar implementations: Blog, Mentorship, About pages
4. Check Supabase dashboard for data
5. Review browser console for errors

---

**You're all set! The Events and Announcements system is ready to use. 🎉**
