# Dumpster — App Store Publishing & Monetization Guide

## Step 1: Apple Developer Account
1. Go to https://developer.apple.com/programs/
2. Click "Enroll" and sign in with your Apple ID
3. Pay the $99/year fee
4. Wait 24-48 hours for approval

## Step 2: Open the iOS Project in Xcode
On your Mac, in Terminal:
```bash
cd ~/Desktop/Projekts/thedumpster
git pull origin main
npm install
npm run build
npx cap sync ios
npx cap open ios
```
This opens the project in Xcode.

## Step 3: Configure Xcode Project
1. In Xcode, click on **App** in the left sidebar (the blue icon)
2. Under **Signing & Capabilities**:
   - Check "Automatically manage signing"
   - Select your Apple Developer Team
   - Bundle Identifier should be: `com.dumpster.app`
3. Under **General**:
   - Display Name: `Dumpster`
   - Version: `1.0.0`
   - Build: `1`
   - Deployment Target: `iOS 16.0`

## Step 4: App Icon
You need a 1024x1024 PNG app icon. Place it in:
`ios/App/App/Assets.xcassets/AppIcon.appiconset/`
Update the Contents.json to point to it. Xcode will generate all sizes.

## Step 5: Test on Your iPhone
1. Connect your iPhone via USB
2. Select your iPhone from the device dropdown in Xcode
3. Click the Play button (▶) to build and run
4. Trust the developer certificate on your iPhone: Settings → General → VPN & Device Management

## Step 6: Create App on App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: Dumpster
   - Primary Language: English (U.S.)
   - Bundle ID: com.dumpster.app
   - SKU: dumpster-app-001

## Step 7: App Store Metadata
Fill in these fields on App Store Connect:

**Subtitle:** Rate the worst movies ever made

**Description:**
Dumpster is the ultimate community for celebrating gloriously terrible cinema. Search any movie, rate how bad it is with our unique trashcan rating system, and join a community of fellow bad-movie enthusiasts.

Features:
- Search millions of movies powered by TMDB
- Rate movies on a 1-5 trashcan "shittiness" scale
- Read and write reviews with fellow trash connoisseurs
- Comment and discuss movies with the community
- Track your viewing history
- Discover the worst-rated movies on the Hall of Shame leaderboard
- Earn badges for your bad-movie expertise
- Go Pro for unlimited reviews, follower system, and premium badges

**Keywords:** bad movies, movie reviews, worst movies, movie ratings, movie community, trash cinema, B movies, so bad its good, movie database, film reviews

**Category:** Entertainment (Primary), Social Networking (Secondary)

**Age Rating:** 12+ (Infrequent Mild Profanity, Infrequent Mature/Suggestive Themes)

**Price:** Free (with in-app purchases)

## Step 8: Screenshots
You need screenshots for:
- iPhone 6.7" (1290 x 2796) — required
- iPhone 6.5" (1284 x 2778) — required
- iPad 12.9" (2048 x 2732) — optional but recommended

Take 5-8 screenshots showing: home feed, movie search, movie detail page, review submission, profile page, Go Pro upgrade.

## Step 9: Submit for Review
1. In Xcode: Product → Archive
2. Once archived, click "Distribute App" → "App Store Connect"
3. Upload to App Store Connect
4. In App Store Connect, select the build, fill in review notes
5. Click "Submit for Review"

**Review Notes for Apple:**
"Dumpster is a movie review and social community app. Users can search movies, write reviews, comment on movies, and follow other users. The app uses Supabase for authentication and data, TMDB API for movie data, and RevenueCat for subscription management. Test account: [create a test account and provide credentials]"

## Step 10: After Approval
Once Apple approves (usually 1-3 days):
- Your app goes live on the App Store
- Set up App Store Optimization (see monetization below)

---

# Monetization Strategy

## Revenue Stream 1: Dumpster Pro Subscription ($2.99/month)
Already set up with RevenueCat. Features:
- Unlimited reviews (free users get daily limits)
- See other users' reviews
- Follow other users
- Premium badges and golden profile

## Revenue Stream 2: Apple Search Ads
Once your app is on the App Store:
1. Go to https://searchads.apple.com
2. Set a small daily budget ($5-10/day to start)
3. Target keywords: "bad movies", "movie reviews", "worst movies", "B movies"
4. Apple Search Ads typically have the highest conversion rate of any mobile ad platform

## Revenue Stream 3: Social Media Marketing (Free)
- Create TikTok/Instagram Reels showing hilariously bad movies and your app's reviews
- Post on Reddit: r/badMovies, r/movies, r/MovieSuggestions
- Create a Twitter/X account @DumpsterApp and share the worst reviews
- Partner with bad-movie YouTube channels

## Revenue Stream 4: Referral/Viral Growth
Add a "Share" button that lets users share their reviews. Example: "I gave Birdemic a 5/5 trashcans on Dumpster 🗑️ [App Store link]"

---

# Marketing Checklist

- [ ] Create social media accounts (TikTok, Instagram, Twitter)
- [ ] Design a simple landing page at your custom domain
- [ ] Prepare a 30-second promo video showing the app
- [ ] Write a press kit with screenshots and description
- [ ] Reach out to 10 bad-movie YouTube/TikTok creators
- [ ] Post launch announcement on Reddit (r/badMovies, r/apps, r/iOSProgramming)
- [ ] Set up Apple Search Ads with $5/day budget
- [ ] Ask friends/family to download and leave 5-star reviews on Day 1
- [ ] Submit to ProductHunt on launch day

---

# Updating the App

Whenever you make changes:
```bash
cd ~/Desktop/Projekts/thedumpster
npm run build
npx cap sync ios
npx cap open ios
```
Then in Xcode: bump the Build number → Product → Archive → Distribute
