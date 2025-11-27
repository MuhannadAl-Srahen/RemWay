# PexFect User Manual

Welcome to PexFect! This guide will help you get the most out of the platform.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Browsing Challenges](#browsing-challenges)
3. [Completing a Challenge](#completing-a-challenge)
4. [Submitting Your Solution](#submitting-your-solution)
5. [Understanding Your Feedback](#understanding-your-feedback)
6. [Improving Your Score](#improving-your-score)
7. [Learning Paths](#learning-paths)
8. [Managing Your Profile](#managing-your-profile)
9. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Getting Started

### What is PexFect?

PexFect is a platform where you can:
- 🎯 **Practice** frontend development with real-world challenges
- 🤖 **Get AI feedback** on your code quality and design accuracy
- 📈 **Track your progress** through structured learning paths
- 🏆 **Build a portfolio** of completed projects

### Creating an Account

1. Click **"Sign In"** in the top-right corner
2. Click **"Sign In with GitHub"**
3. Authorize PexFect to access your GitHub profile
4. You're in! 🎉

> 💡 **Why GitHub?** We use GitHub to verify your identity and to ensure you're submitting your own code repositories.

---

## Browsing Challenges

### Finding Challenges

Navigate to the **Challenges** page from the main menu.

### Views

| View | Best For |
|------|----------|
| **Grid View** | Visual browsing with thumbnails |
| **List View** | Quick scanning of many challenges |

### Filtering

| Filter | Options | Use Case |
|--------|---------|----------|
| **Difficulty** | Beginner, Intermediate, Advanced | Match your skill level |
| **Category** | Components, Layouts, Forms, etc. | Focus on specific skills |
| **Search** | Any text | Find specific challenges |

### Saving Challenges

Click the **bookmark icon** (🔖) on any challenge to save it for later. Access your saved challenges from your Profile page.

---

## Completing a Challenge

### Step 1: Choose a Challenge

1. Browse the challenges page
2. Click on a challenge that interests you
3. Review the requirements

### Step 2: Understand the Requirements

On the challenge detail page, you'll find:

| Tab | Contains |
|-----|----------|
| **Overview** | Challenge description, learning outcomes, requirements |
| **Design** | Figma design to implement |
| **Resources** | Starter files, assets, helpful links |
| **Submit** | Form to submit your solution |

### Step 3: Access the Design

1. Click **"Open in Figma"** button
2. Study the design carefully:
   - Desktop layout
   - Mobile layout (if applicable)
   - Colors, fonts, spacing
   - Interactive states (hover, focus, etc.)

### Step 4: Build Your Solution

1. **Create a new GitHub repository** for your project
2. **Build the challenge** following the design
3. **Deploy your site** to a hosting platform

#### Recommended Hosting Platforms

| Platform | Best For | Free Tier |
|----------|----------|-----------|
| [Vercel](https://vercel.com) | React/Next.js projects | ✅ Yes |
| [Netlify](https://netlify.com) | Static sites | ✅ Yes |
| [GitHub Pages](https://pages.github.com) | HTML/CSS/JS | ✅ Yes |
| [Cloudflare Pages](https://pages.cloudflare.com) | Any frontend | ✅ Yes |

### Step 5: Make Your Repository Public

⚠️ **Important:** Your GitHub repository **must be public** for the AI to analyze your code.

To make a repository public:
1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Danger Zone**
4. Click **Change visibility** → **Make public**

---

## Submitting Your Solution

### Prerequisites Checklist

Before submitting, ensure you have:

- [ ] ✅ Signed in to PexFect with GitHub
- [ ] ✅ A **public** GitHub repository with your code
- [ ] ✅ A **deployed** live site URL
- [ ] ✅ The repository is **owned by your GitHub account**

### Submission Steps

1. **Go to the challenge page**
2. **Scroll to the Submit section** (or click Submit tab)
3. **Enter your GitHub Repository URL**
   ```
   Example: https://github.com/yourusername/challenge-project
   ```
4. **Enter your Live Site URL**
   ```
   Example: https://my-project.vercel.app
   ```
5. **(Optional) Upload a screenshot** of your completed project
6. **Click "Submit for AI Review"**

### What Happens Next

1. ⏳ **Validation** - System checks your URLs are valid
2. 🔍 **Repository Check** - System verifies your repo is public
3. 📤 **Submission Created** - Your submission is saved
4. 🚀 **Redirect** - You're taken to the feedback page
5. 🤖 **AI Analysis** - Typically takes 20-60 seconds
6. ✅ **Feedback Ready** - Page automatically updates with your feedback

---

## Understanding Your Feedback

### Overall Score (0-100)

Your score is calculated from four categories:

| Category | Max Points | What's Evaluated |
|----------|------------|------------------|
| 🎨 **Design** | 30 | Visual accuracy, responsiveness, UI/UX |
| 💻 **Code Quality** | 30 | Clean structure, naming, organization |
| ⚙️ **Functionality** | 25 | Features work, error handling |
| ♿ **Accessibility** | 15 | Semantic HTML, ARIA, keyboard navigation |

### Rating Levels

| Score | Rating | What It Means |
|-------|--------|---------------|
| 90-100 | 🌟 **Excellent** | Production-ready, follows all best practices |
| 75-89 | ✅ **Good** | Solid implementation, minor improvements possible |
| 60-74 | 📈 **Needs Improvement** | Core functionality works, notable issues |
| Below 60 | ⚠️ **Poor** | Significant problems to address |

### Feedback Sections

1. **What You Did Well** ✅
   - Positive aspects of your submission
   - Good practices you followed

2. **Areas for Improvement** 📝
   - Specific suggestions to improve
   - Actionable recommendations

3. **Design Comparison** 🎨
   - How well you matched the design
   - Visual accuracy notes

4. **Technical Analysis** 🔧
   - Best practices review
   - Code formatting feedback
   - Functionality assessment
   - Accessibility evaluation

5. **Recommendations** 📚
   - Next challenges to try
   - Learning resources to explore

### Warning Messages

| Warning | Meaning | Action |
|---------|---------|--------|
| ⚠️ **Wrong Project** | You submitted code for a different challenge | Resubmit with the correct repository |
| ⚠️ **Code Not Analyzed** | Couldn't fetch your GitHub code | Make sure your repository is public |

---

## Improving Your Score

### Resubmission Process

Made improvements? Here's how to resubmit:

1. **Update your code** on GitHub (commit and push)
2. **Go back to the challenge page**
3. **Submit again** with the same URLs
4. **Get new feedback** based on your updated code

### What You'll See

When you resubmit, your new feedback will include:

- **Previous Score vs New Score** - See your improvement
- **Issues Fixed** ✅ - Problems you addressed
- **Issues Remaining** ❌ - Still need attention

### Tips for Higher Scores

#### Design (30 points)
- Match the design exactly (colors, spacing, fonts)
- Implement responsive design for all screen sizes
- Pay attention to small details (shadows, borders, etc.)

#### Code Quality (30 points)
- Use consistent naming conventions
- Organize files logically
- Remove unused code and console.logs
- Add comments where helpful

#### Functionality (25 points)
- Test all interactive elements
- Handle edge cases
- Ensure smooth animations/transitions

#### Accessibility (15 points)
- Use semantic HTML (`<header>`, `<main>`, `<article>`, etc.)
- Add alt text to all images
- Ensure keyboard navigation works
- Use proper heading hierarchy (h1 → h2 → h3)
- Maintain good color contrast

---

## Learning Paths

### What Are Learning Paths?

Structured sequences of challenges designed to take you from beginner to advanced.

### Available Paths

| Path | Duration | Focus |
|------|----------|-------|
| 🌱 **Beginner** | 2-3 weeks | HTML, CSS, JavaScript basics |
| 🌿 **Intermediate** | 2-4 weeks | React, APIs, state management |
| 🌳 **Advanced** | 3-5 weeks | TypeScript, performance, architecture |

### Starting a Path

1. Go to **Roadmap** from the main menu
2. Choose a path that matches your level
3. Click **"Start This Path"**
4. Complete challenges in order

### Path Progression

- ✅ **Start** - First challenge unlocked
- 🔓 **Progress** - Complete a challenge to unlock the next
- 🏆 **Complete** - Finish all challenges in the path

### Can I Switch Paths?

Yes! You can start a different path at any time. Your progress on other paths is saved.

---

## Managing Your Profile

### Viewing Your Profile

Click your **avatar** in the top-right and select **Profile**, or navigate to `/profile`.

### Profile Information

| Section | Description |
|---------|-------------|
| **Stats** | Challenges completed, streak, points |
| **Activity** | Recent submissions and completions |
| **Saved Challenges** | Your bookmarked challenges |
| **Social Links** | Your connected accounts |

### Editing Your Profile

1. Go to **Settings** (click avatar → Settings)
2. Update your information:
   - Display name
   - Bio
   - Location
   - Website
   - Social links (Twitter, LinkedIn)
3. Click **Save Changes**

---

## FAQ & Troubleshooting

### Common Questions

#### Q: Why can't I submit my solution?

**A:** Check these requirements:
- ✅ You're signed in with GitHub
- ✅ Your repository is public
- ✅ The repository belongs to your GitHub account
- ✅ Your URLs are valid (start with https://)

#### Q: Why is my repository marked as private?

**A:** To change visibility:
1. Go to your repo on GitHub
2. Settings → Danger Zone → Change visibility → Make public

#### Q: Why is feedback taking so long?

**A:** AI analysis typically takes 20-60 seconds. If it takes more than 2 minutes:
1. Click **Retry** when prompted
2. Check if your repository is public
3. Try again during off-peak hours

#### Q: Why did my score change when I resubmitted?

**A:** If you updated your code, a new score is generated based on your changes. The AI uses deterministic settings, so:
- **Same code** = Same score
- **Updated code** = New score (could be higher or lower)

#### Q: Can I delete a submission?

**A:** Currently, submissions cannot be deleted. You can resubmit to improve your score.

#### Q: Why does it say "Wrong project submitted"?

**A:** The AI detected that your code doesn't match the challenge. Make sure you're submitting the correct repository for this specific challenge.

### Error Messages

| Error | Solution |
|-------|----------|
| "Repository must be public" | Change repo visibility in GitHub Settings |
| "You can only submit your own repositories" | Use a repository from your GitHub account |
| "URL already used for another challenge" | Use unique URLs for each challenge |
| "Cannot submit official solution" | Create your own project, don't submit the demo |
| "Invalid GitHub URL" | Use format: https://github.com/username/repo |

### Still Need Help?

- 📖 Check the [AI Feedback System documentation](./AI_FEEDBACK_SYSTEM.md)
- 💬 Open an issue on our GitHub repository
- 📧 Contact support

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search |
| `g` then `h` | Go to Home |
| `g` then `c` | Go to Challenges |
| `g` then `r` | Go to Roadmap |
| `g` then `p` | Go to Profile |

---

## Tips for Success

1. **Start with Beginner challenges** if you're new to frontend development
2. **Read the requirements carefully** before starting
3. **Study the Figma design** in detail - every pixel matters!
4. **Make your repo public before submitting** to avoid errors
5. **Use the feedback** to improve your next submission
6. **Follow a learning path** for structured progression
7. **Save interesting challenges** to revisit later
8. **Resubmit after improvements** to track your growth

---

Happy coding! 🚀

_Last updated: November 2025_
