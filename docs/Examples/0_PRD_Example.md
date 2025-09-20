!!!!!! THIS IS A COMPLETELY DIFFERENT PROJECT, WHICH HAS NOTHING TO DO WITH OURS! THIS IS JUST AN EXAMPLE OF DOCUMENTATION, THE ARCHITECTURE OF WHICH CAN BE CONSULTED WHEN WRITING DOCUMENTATION FOR OUR PROJECT, BUT NO DETAILS OF THIS PROJECT RELATE TO OURS !!!!!!




# 📱 AI Toy Stories - Product Requirements Document (PRD)

## 📋 General Product Information

### Product Name
**AI Toy Stories** - Mobile application for creating videos with toys

### Target Platform
- **Primary Platform**: Android (EXPO React Native)
- **Future Platform**: iOS (after Android version completion)
- **Technology Stack**: EXPO React Native (without EAS services)
- **Project Location**: `/Users/atrantin/www/AI_ReactNative/rn_ai_toy_stories/ai-toy-stories/`

### Target Audience
- **Primary**: Children and their parents
- **Age Group**: 4-12 years (children), 25-45 years (parents)

### Core Product Value
The application allows children to "bring their toys to life" using AI technologies, creating personalized video stories.

---

## 🎯 Main User Scenario

### Simplified User Journey:
1. **Taking a photo of a toy** through the app camera
2. **Sending to server** and receiving taskId + scenario description
   - Server enriches the image with scenario via LLM integration
   - Sends image and generated prompt to third-party video generation services
   - Returns result to client
3. **Periodic polling of result** by task ID and displaying result (error or video playback)

---

## 🔄 Detailed User Journey

### Testing Environment:
- **Simulator**: API 35 (Pixel 9 Pro)
- **Physical Device**: Xiaomi Redmi Note 13 Pro

### 1. Splash Screen (on every cold start)

#### Functionality:
- **Analytics initialization** - connecting to analytics systems
- **Ads initialization** - preparing advertising SDKs
- **Subscription and purchase restoration** - checking active subscriptions
- **Other app initializations** - loading configurations, checking updates
- **On first launch**: saving `firstAppLaunch` variable with current timestamp to local storage

#### UI/UX Requirements:
- **App logo** in the center of the screen
- **Loading indicator** (spinner or progress bar)
- **Background color**: bright, child-friendly (e.g., blue gradient)
- **Display time**: minimum 2 seconds, maximum 10 seconds
- **Animation**: smooth logo appearance

#### Business Logic:
- Check for `firstAppLaunch` presence in local storage
- If absent → set current timestamp
- Check for `onboardingPassed` to determine next screen
- Restore user state (subscriptions, credits)

---

### 2. Onboarding Screens (only on first launch)

#### Display Condition:
- Absence of `onboardingPassed` variable in local storage

#### Structure: 3 screens with key value propositions

#### Screen 1: "Bring your toy friends to life"
- **Title**: "Make your toy friends come alive!"
- **Subtitle**: "Take a photo of your favorite toy and watch it come to life in a magical video"
- **SVG Animation**: teddy bear waving
- **Button**: "Next"

#### Screen 2: "Share with friends"
- **Title**: "Share the magic with friends!"
- **Subtitle**: "Create amazing videos and share them with family and friends"
- **SVG Animation**: several children watching video on phone
- **Button**: "Next"

#### Screen 3: "Delight your parents"
- **Title**: "Surprise your parents!"
- **Subtitle**: "Show mom and dad how your toys tell real stories"
- **SVG Animation**: family laughing while watching video
- **Button**: "Start the magic!"

#### UI/UX Requirements:
- **Navigation**: swipe left/right between screens
- **Progress indicators**: dots at bottom of screen (1/3, 2/3, 3/3)
- **"Skip" button** in top right corner on all screens
- **Animations**: smooth transitions between screens
- **Color scheme**: bright, child-friendly palette

#### Business Logic:
- Upon completion of last screen: save `onboardingPassed` with current timestamp
- Navigate to Paywall Screen

---

### 3. Paywall Screen

#### Display Condition:
- After onboarding completion
- When user has 0 credits and attempts to create video
- When user clicks "Get More Credits" from main screen

#### UI/UX Requirements:
- **Header**: "Create unlimited magical videos!"
- **Subscription options**:
  - **Weekly**: $4.99/week (3-day free trial)
  - **Monthly**: $9.99/month (7-day free trial)
  - **Yearly**: $59.99/year (7-day free trial) + "Most Popular" badge
- **Features list**:
  - ✅ Unlimited video creation
  - ✅ HD quality videos
  - ✅ No ads
  - ✅ Priority processing
- **Legal links**: Terms of Service, Privacy Policy, Restore Purchases
- **Close button** (X) in top right corner
- **Background**: magical, child-friendly design

#### Business Logic:
- Display current subscription status if active
- Handle subscription purchase through native store
- Upon successful purchase: update user credits to unlimited
- Save subscription status to local storage
- **Encryption Service**: All subscription keys and sensitive data must be decrypted using the native bridge to `/Users/atrantin/www/AI_ReactNative/rn_ai_toy_stories/modules/app-module/android/src/main/java/expo/modules/appmodule/AppModule.kt`

---

### 4. Main Screen (Home)

#### Display Condition:
- After successful onboarding completion
- Default screen for returning users

#### UI/UX Requirements:
- **Header section**:
  - App logo (top left)
  - Credits counter (top right): "Credits: X" or "Unlimited" for subscribers
  - Settings icon (top right corner)
- **Main content**:
  - Large "Create Magic Video" button (camera icon + text)
  - Recent videos grid (2x2 or 2x3 depending on screen size)
  - "Get More Credits" button (if user has limited credits)
- **Bottom navigation** (if needed for future features)

#### Business Logic:
- Check user subscription status
- Display appropriate credits counter
- Load recent videos from local storage
- **Analytics**: Track screen view and button interactions using `/Users/atrantin/www/AI_ReactNative/rn_ai_toy_stories/ai-toy-stories/core/analytics/` facade with `sendEvent` method

---

### 5. Camera Screen

#### Display Condition:
- User clicks "Create Magic Video" button
- User has available credits (>0) or active subscription

#### UI/UX Requirements:
- **Camera viewfinder**: full screen camera preview
- **Capture button**: large circular button at bottom center
- **Flash toggle**: top left corner
- **Back button**: top right corner (X) or "back button" on Android / left swipe on iOS
- **Instructions text**: "Point camera at your toy and tap to capture"

#### Business Logic:
- Request camera permissions on first use
- Validate that user has credits before allowing capture
- Capture high-quality image (minimum 1080p)
- **Analytics**: Track camera usage, capture events
- Navigate to Preview Screen after successful capture

---

### 6. Preview Screen

#### Display Condition:
- After successful photo capture

#### UI/UX Requirements:
- **Photo preview**: captured image displayed full screen
- **Action buttons**:
  - "Retake" button (left side)
  - "Create Video" button (right side, primary CTA)
- **Loading overlay**: when processing starts
- **Back button**: return to camera

#### Business Logic:
- Display captured image for user confirmation
- On "Create Video": deduct 400 credits (based on config variable "videoCreditsPrice") from user balance
- Send image to server API with API credentials
- Receive taskId and scenario description
- **Error handling**: if server returns credit refund error, restore user credits
- Navigate to Library Screen with taskId

---

### 7. Library Screen

#### Display Condition:
- After successful video creation request the task is added to the list on the Library screen to the rows with videos (probably at the top we should have quick tabs "Success", "In Progress", "Failed")

#### UI/UX Requirements:
- **Image preview**: sent image icon preview thumbnail
- **Progress indicator**: animated spinner or progress bar
- **Prompt text**: Will be provided by server API on task creation
- **Background animation**: magical sparkles or similar child-friendly animation

#### Business Logic:
- Poll server API every 5 seconds using taskId
- Handle three possible responses:
  - **In Progress**: continue polling
  - **Completed**: receive video URL, move to success state
  - **Failed**: show error message, restore credits if applicable
- **Timeout**: after 10 minutes, show timeout error
- **Analytics**: Track processing time, success/failure rates

#### Success videos
- if video is created succssfully we should have it inside the "Success" tab with video thumbnail preview and by click should open the "Video player screen"
---

### 8. Video Player Screen

#### Display Condition:
- After successful video generation they get into "Success" tab of the Library Screen and by click on the video thumbnail should open the "Video player screen"

#### UI/UX Requirements:
- **Video player**: full screen MP4 video player with standard controls (play/pause)
- **Action buttons**:
  - "Share" button: system share dialog
  - "Save to Gallery" button: save video to device
    - if user is not premium on "Share" we should show Interstitial ads and after closing the ads we should show the system share dialog
- **Back button**: return to main screen

#### Business Logic:
- Stream video from provided URL
- Handle video playback controls (play, pause)
- **Share functionality**: use system share dialog to share video
- **Save functionality**: download and save video to device gallery
- **Analytics**: Track video completion rates, share events

---

### 9. Shop Screen (Credits Store)

#### Display Condition:
- User clicks "+" button in main tabs
- Insufficient credits for video creation

#### Credit Packages:

**Small Package**
- **Amount**: 2,000 credits
- **Price**: $4.99
- **Description**: "For beginning wizards"

**Medium Package**
- **Amount**: 10,000 credits
- **Price**: $19.99
- **Description**: "For active creators"
- **Badge**: "Popular Choice"

**Mega Package**
- **Amount**: 30,000 credits
- **Price**: $49.99
- **Description**: "For true story masters"
- **Badge**: "Best Value"

#### UI Elements:
- **Header**: "Buy Credits"
- **Current balance**: display at top
- **Package cards**: with prices and descriptions
- **Purchase buttons**: for each package
- **Restore button**: restore previous purchases
- **Back button**: return to previous screen

---

## 💰 Monetization

### Credit System:
- **Video creation cost**: 400 credits (configurable)
- **Credit refund**: on failed video creation (server error status)

### Advertising:

#### Interstitial Ads:
- **Display frequency**: every 5th tap on:
  - Navigation tabs
  - Create new video button
- **Condition**: only for users without Premium subscription
- **Show condition**: if interstitial is ready to show - we show spinner overlay to block UI and then show Interstitial, if inter is not ready to show - we just skip it

#### Native Ads:
- **Placement**: on "Create New Video" and "Library" tabs
- **Integration**: natural content embedding
- **Condition**: only for users without Premium subscription

---

## 🔧 Technical Integration Requirements

### App Configuration:
- **Configuration File**: Static JSON configuration file for non-sensitive data
- **Update Mechanism**: Configuration updates delivered via app releases (no dynamic updates)
- **Configuration Data**:
  - AppMetrica API key
  - Video creation cost (credits)
  - Subscription prices and trial periods
  - Credit package prices and amounts
  - Ad display frequency settings
  - API endpoints and timeouts
- **Storage**: Bundled with app, accessible via configuration service
- **Security**: Only non-sensitive configuration data; sensitive keys handled via encryption service

### Internationalization (i18n):
- **Primary Language**: English (EN)
- **Implementation**: Strict i18n module usage required
- **Text Storage**: All static texts stored in translatable JSON/XML files
- **Framework**: Use React Native i18n library (react-i18next or similar)
- **Text Keys**: Descriptive keys for all UI text, error messages, and user-facing content
- **Future Support**: Architecture ready for additional languages
- **RTL Support**: Not required for MVP but architecture should not prevent future implementation

### Encryption Service Integration:
- **Native Bridge**: Implement decryption bridge in `/Users/atrantin/www/AI_ReactNative/rn_ai_toy_stories/modules/app-module/android/src/main/java/expo/modules/appmodule/AppModule.kt`
- **Encrypted Data Storage**: All API keys, AdUnit IDs, and sensitive configuration stored in `/Users/atrantin/www/AI_ReactNative/rn_ai_toy_stories/secrets/`
- **Decryption Service**: React Native service to decrypt sensitive data using native bridge
- **Usage**: All API calls and ad integrations must use decrypted keys

### Analytics Integration:
- **Analytics Facade**: Located at `/Users/atrantin/www/AI_ReactNative/rn_ai_toy_stories/ai-toy-stories/core/analytics/`
- **Primary Method**: `sendEvent(eventName: string, parameters?: object)` for all tracking
- **User Identification**: Internal userId (uuidv4) generated on first app start and persisted
- **Event Tracking Requirements**:
  - Screen views (all screens)
  - Button taps (all interactive elements)
  - Purchase events (subscriptions, credit packages)
  - Ad interactions (impressions, clicks)
  - Video creation flow (start, success, failure)
  - Error events (API failures, crashes)
- **Configuration**: AppMetrica KEY and other analytics keys stored in app configuration
- **Implementation**: Simple facade pattern - business logic only calls `sendEvent`, internal routing to analytics providers handled by facade

### Ads Integration:
- **Facade Location**: `/Users/atrantin/www/AI_ReactNative/rn_ai_toy_stories/ai-toy-stories/core/ads/`
- **Integration**: Reference ads facade for future implementation
- **Encrypted Keys**: All AdUnit IDs must be decrypted using encryption service

### Server API:
- **Base URL**: `https://api.aitoystoriesapp.com`

#### API Methods:

**POST /tasks/create**
- **Purpose**: create new video processing task
- **Parameters**: 
  ```json
  {
    "img": "{imgBase64}"
  }
  ```
- **Response**: taskId and scenario description (prompt)
- **Authentication**: signed requests (keys will be provided later)

**GET /tasks?id={taskId}**
- **Purpose**: get task status
- **Parameters**: taskId in query parameters
- **Response**: processing status, result or error
- **Authentication**: signed requests

### Local Storage:

#### Key Variables:
- `firstAppLaunch`: timestamp of first launch
- `onboardingPassed`: timestamp of onboarding completion
- `userCredits`: current user credit balance
- `premiumStatus`: Premium subscription status
- `videoLibrary`: array of created videos
- `processingTasks`: array of tasks in processing

---

## 🎨 UI/UX Requirements

### Color Palette:
- **Primary colors**: bright, child-friendly tones
- **Accent colors**: for buttons and important elements
- **Background colors**: soft gradients

### Typography:
- **Headers**: large, bold fonts
- **Body text**: readable, friendly fonts
- **Buttons**: clear, contrasting labels

### Animations:
- **Transitions**: smooth animations between screens
- **Loading**: progress indicators and spinners
- **Interactivity**: tap feedback

### Responsiveness:
- **Support for various screen sizes** of Android devices
- **Safe Area**: consideration of notches and system elements
- **Orientation**: portrait orientation support (primary)

---

## 📱 Навигация и пользовательский опыт

### Навигационная структура:
```
Splash Screen
    ↓
Onboarding (если первый запуск)
    ↓
Paywall (после онбординга)
    ↓
Main App (Tab Navigation)
    ├── Create New Video
    ├── Library
    └── DEV (только для разработки)
    
Shop Screen (модальное окно)
```

### Состояния приложения:

#### Первый запуск:
1. Splash Screen
2. Onboarding (3 экрана)
3. Paywall
4. Main App

#### Повторные запуски:
1. Splash Screen
2. Main App (если онбординг пройден)

#### Премиум пользователи:
- Отсутствие рекламы
- Увеличенные лимиты
- Приоритетная поддержка

---

## ✅ Acceptance Criteria

### Functional Requirements:
- [ ] Correct Splash Screen operation with initialization
- [ ] Onboarding display only on first launch
- [ ] Functional Paywall with payment integration
- [ ] Working navigation between tabs
- [ ] Camera integration for photography
- [ ] Correct data sending and receiving from server
- [ ] Credit system with proper deduction/refund
- [ ] Advertising integration according to requirements
- [ ] Application state saving and restoration

### Technical Requirements:
- [ ] Application works on Android devices
- [ ] Correct network error handling
- [ ] Optimized performance
- [ ] Secure user data storage
- [ ] Compliance with Google Play Store guidelines

### UX Requirements:
- [ ] Intuitive navigation
- [ ] Fast response time
- [ ] Clear error messages
- [ ] Attractive design for child audience
- [ ] Smooth animations and transitions

---

## 🚨 Potential Edge Cases and QA Logic

### "Sunny Day" Scenarios:
- Successful video creation and playback
- Correct payment and subscription operation
- Smooth navigation between screens
- Proper advertising display

### "Rainy Day" Scenarios:

#### Network Issues:
- No internet connection during video creation
- API request timeouts
- Server errors during image processing

#### Camera Issues:
- Camera access denial
- Poor quality or corrupted images
- Photo saving problems

#### Payment Issues:
- Failed transactions
- Purchase restoration problems
- Credit balance mismatch

#### Storage Issues:
- Insufficient device storage
- Local data corruption
- Lost saved videos

#### Performance:
- Slow processing on weak devices
- Memory issues when working with video
- Freezing when loading large files

### QA Checklist:

#### Functional Testing:
- [ ] Testing all user scenarios
- [ ] API integration correctness verification
- [ ] Credit system validation
- [ ] Payment function testing
- [ ] Advertising operation verification

#### Compatibility Testing:
- [ ] Different Android versions
- [ ] Different screen sizes
- [ ] Different device manufacturers
- [ ] Different language settings

#### Performance Testing:
- [ ] Application startup time
- [ ] Memory consumption
- [ ] Battery consumption
- [ ] Image processing speed

#### Security Testing:
- [ ] API key protection
- [ ] Secure user data storage
- [ ] Input data validation
- [ ] Unauthorized access protection

---

## 🔮 Future Features (Out of MVP Scope)

### Advanced Features:
- **Push Notifications**: Notify users when videos are ready for download
- **User Profiles**: OAuth sign-in via Google/Apple for account management
- **Dark Mode**: Alternative UI theme for better user experience
- **Sound Effects**: Audio feedback for interactions and app ambiance
- **Offline Mode**: Video caching for offline viewing and creation queue
- **Multiple Content Types**: Different video styles, effects, and content beyond toys
- **Social Features**: User communities, sharing platforms, comments, and likes
- **Referral Programs**: User acquisition incentives and friend invitation system
- **Promotional Campaigns**: Seasonal discounts, special offers, and marketing campaigns
- **Promo Codes**: Discount code system for marketing and partnerships
- **Bonus/Loyalty Programs**: Reward frequent users with credits and exclusive features

### Technical Enhancements:
- **Dynamic Pricing**: Real-time price updates and A/B testing for monetization
- **Advanced Analytics**: Detailed user behavior tracking beyond basic events
- **Performance Optimization**: Advanced caching, optimization, and background processing
- **Multi-language Support**: Full localization beyond English with RTL support
- **Advanced Error Handling**: Comprehensive error recovery and user guidance
- **A/B Testing Framework**: Feature experimentation and optimization platform

---

## 📋 Additional Considerations

### Security:
- **Data Encryption**: All sensitive data encrypted at rest and in transit via encryption service
- **API Security**: Signed requests with proper authentication
- **Child Safety**: No external links or unsafe content
- **Privacy Compliance**: COPPA and GDPR considerations for child-focused app

### Scalability:
- **Server Load**: Handle multiple concurrent video processing requests
- **Storage**: Efficient video storage and delivery via 3rd party services
- **Analytics**: Scalable event tracking infrastructure via facade pattern

### Maintenance:
- **App Updates**: Static configuration updates via app releases
- **Content Moderation**: Ensure appropriate content generation from 3rd party services
- **Support**: User support and feedback mechanisms
- **ASO Optimization**: Organic traffic targeting through App Store Optimization

---

## 🎯 Success Metrics

### User Engagement:
- **Daily Active Users (DAU)**
- **Session Duration**
- **Video Creation Rate**
- **Video Completion Rate**

### Revenue Metrics:
- **Subscription Conversion Rate**
- **Average Revenue Per User (ARPU)**
- **Credit Purchase Frequency**
- **Churn Rate**

### Technical Metrics:
- **App Crash Rate** (target: <1%)
- **API Success Rate** (target: >99%)
- **Video Generation Success Rate** (target: >95%)
- **App Store Rating** (target: >4.5 stars)

---

## 📝 Conclusion

This PRD defines complete requirements for the AI Toy Stories mobile application for Android platform. The document covers all aspects of user experience, technical implementation, monetization, and product quality.

**Key Technical Requirements:**
- EXPO React Native framework
- Analytics facade with simple `sendEvent` method
- Static app configuration for non-sensitive data
- Encryption service for sensitive data via native bridge
- Strict i18n implementation for future localization
- MP4 video format from 3rd party services
- Credit refund system on server errors
- Share functionality via system dialog
- ASO-focused organic traffic strategy

**MVP Scope Confirmed:**
- No push notifications, dark mode, sound effects
- No user profiles, referral programs, promo codes
- No offline mode, social features (except Share button)
- No promotional campaigns or loyalty programs
- English-only with i18n architecture
- Static pricing via app configuration updates

Next steps:
1. Requirements approval with stakeholders
2. Technical architecture creation
3. Iterative development planning
4. Detailed UI/UX design creation
5. MVP version development start

**Document version**: 2.0  
**Creation date**: Current date  
**Status**: Requirements finalized, ready for development planning