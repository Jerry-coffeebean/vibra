🌈 Vibra – Personal Wellness & Mood Companion
Vibra is an all-in-one personal wellness tracker built with plain HTML, CSS, and JavaScript. It helps you track your moods, build healthy habits, and stay motivated on your wellness journey, all while adapting its color scheme to match your vibe.

  Deployed Link -  https://vibramindtracker.netlify.app/

✨ Core Features
Dynamic Mood Tracking: Select your daily mood (Happy, Sad, Calm, etc.) and watch the entire app's color theme dynamically change to match.

Customizable Habit Tracker: Add your own wellness goals, check them off as you complete them, and delete habits you no longer want to track.

Full Data Persistence: Your profile, custom habits, and daily completions are all saved in your browser's localStorage. Refresh the page or come back tomorrow—your progress is still there!

Personal Dashboard: A central hub showing your mood streak, daily habit completion percentage, and (mock) weekly mood trends.

Mood-Based Music: Get Spotify playlist suggestions that automatically update based on your selected mood.

Editable Profile: Update your name, age, location, and bio, all saved locally.

AI Wellness Assistant: A built-in, rule-based chatbot that offers motivation and suggests new habits to try.

Connect (Mock): A mock "Wellness Buddy" screen to simulate social motivation and encouragement.

🛠️ Tech Stack
HTML5: For the core structure and content.

CSS3: For all custom styling, animations, and responsive design (including CSS Variables for theming).

JavaScript (ES6+): For all application logic, including DOM manipulation, event handling, and localStorage management.

Font Awesome: For icons.

Google Fonts: For typography.

🚀 How to Run Locally
No build steps or dependencies are required! This is a pure HTML, CSS, and JS project.

Clone or download this repository.

Open the project folder.

Double-click the index.html file to open it directly in your web browser.

💡 Key Code Features
localStorage Management: The app uses localStorage to save and retrieve all user data. This includes:

userData: Stores the user's profile object.

userHabitsList: Stores the user's list of custom habit strings.

completedHabitsToday: Stores which habits have been checked today. It automatically resets if the date changes.

lastMood: Remembers the last mood selected for theme persistence.

Dynamic DOM Rendering: The habit list is not hard-coded in HTML. The renderHabitList() function in script.js dynamically generates the HTML for each habit from the userHabits array, including its completion state.

CSS Variables for Theming: The app's theme is controlled by a CSS variable (--primary-color). The changeTheme() JavaScript function updates this variable based on the selected mood, and all other colors in the CSS update automatically.

Rule-Based Chatbot: The chatBotResponse() function uses simple keyword matching to provide helpful and contextual responses without needing an external AI API.
