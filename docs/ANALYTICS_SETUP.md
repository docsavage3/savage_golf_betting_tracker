# Google Analytics 4 (GA4) Setup Guide

## 🎯 **Setup Instructions**

### **1. Get Your GA4 Measurement ID**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property for your golf app
3. Set up a **Web** data stream
4. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### **2. Configure Your App**

Replace `GA_MEASUREMENT_ID` in two places in `index.html`:

```html
<!-- Line 16: -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_MEASUREMENT_ID"></script>

<!-- Line 21: -->
gtag('config', 'YOUR_MEASUREMENT_ID', {
```

**Example:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
gtag('config', 'G-ABC123DEF4', {
```

### **3. Privacy Settings**

The analytics are configured with privacy-first settings:
- ✅ **Analytics storage**: Enabled (for game insights)
- ❌ **Ad storage**: Disabled (no advertising tracking)

---

## 📊 **What Gets Tracked**

### **🎮 Game Events**
- **Game Start**: Which games selected, player count, bet amounts
- **Game Actions**: Hole recordings (quick actions + modal actions)
- **Game Resume**: When users continue saved games

### **🧭 Navigation**
- **Page Views**: Which game pages users visit most
- **Navigation Flow**: How users move between sections

### **⚡ User Interactions**
- **Modal Usage**: Opening/closing game recording modals
- **Quick Actions**: Usage of the streamlined recording buttons
- **Feature Adoption**: Which features are most popular

### **📈 Key Metrics**
- **Session Duration**: How long users play
- **Game Completion Rate**: How many holes typically get played
- **Popular Games**: Murph vs Wolf vs Skins vs KP vs Snake
- **User Engagement**: Feature usage patterns

---

## 🔧 **Customization**

### **Add New Events**

Use the `AnalyticsUtils` class to track custom events:

```javascript
import { AnalyticsUtils } from './utils/analytics.js';

// Track custom game event
AnalyticsUtils.trackGameAction('new_game_type', 'action_type', holeNumber, {
    customData: 'value'
});

// Track feature usage
AnalyticsUtils.trackFeatureUsage('new_feature', {
    metadata: 'example'
});
```

### **Performance Tracking**

```javascript
// Track loading times
const startTime = performance.now();
// ... your code ...
const duration = performance.now() - startTime;
AnalyticsUtils.trackPerformance('page_load_time', duration);
```

---

## 🛡️ **Privacy & Compliance**

### **GDPR/CCPA Ready**
- No personal data is tracked (only anonymized game statistics)
- No cookies stored for advertising
- Users can opt-out via browser settings

### **Data Collected**
- ✅ Game types and bet amounts (anonymized)
- ✅ Navigation patterns and feature usage
- ✅ Session duration and completion rates
- ❌ No personal information
- ❌ No location data
- ❌ No advertising identifiers

---

## 📋 **Testing Your Setup**

1. **Real-time Testing**: Go to GA4 → Reports → Realtime
2. **Start a game** in your app
3. **Check events** appear in real-time view
4. **Verify custom events** are being tracked

### **Debug Mode** (for development)
Add this to your GA4 config for detailed debugging:

```javascript
gtag('config', 'YOUR_MEASUREMENT_ID', {
    debug_mode: true,  // Add this line for development
    privacy_flags: {
        analytics_storage: 'granted',
        ad_storage: 'denied'
    }
});
```

---

## 🎯 **Key Reports to Monitor**

1. **Popular Games**: Events → game_start (breakdown by game_type)
2. **User Engagement**: Events → quick_action_used vs modal_interaction
3. **Session Quality**: Engagement → Session duration + pages per session
4. **Feature Adoption**: Events → feature_usage

This setup gives you comprehensive insights into how golfers use your betting tracker! 🏌️📊
