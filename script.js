// ============================================
// GLOBAL STATE
// ============================================
let currentUser = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    age: '24',
    location: 'San Francisco, CA',
    bio: '✨ Wellness enthusiast | 🧘‍♀️ Meditation lover | 📚 Avid reader | Living my best life one mood at a time 🌈',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&size=150&background=A3D9B1&color=fff&bold=true'
};
let currentMood = null;
let currentPlaylistUrl = "https://open.spotify.com/playlist/37i9dQZF1DX0FOF1IUWK1W"; // Default to calm

// --- START: NEW HABIT STATE ---
const defaultHabits = [
    { text: 'Drink 8 glasses of water', icon: '💧' },
    { text: 'Read for 30 minutes', icon: '📚' },
    { text: 'Meditate for 10 minutes', icon: '🧘' },
    { text: 'Exercise for 20 minutes', icon: '🏃' }
];
let userHabits = [];
// --- END: NEW HABIT STATE ---

// --- START: MODIFICATION (To track daily completion) ---
// This will hold the completion status in memory
let todaysCompletions = {};
// --- END: MODIFICATION ---


// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Load saved data from localStorage
    loadUserData();
    
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        handleLogin();
    }
}

// ============================================
// LOGIN FUNCTIONALITY
// ============================================
function handleLogin() {
    // Load user data from localStorage if exists
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(currentUser));

    // Hide login screen, show main app
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('chatbotToggle').classList.remove('hidden');

    // Update profile display
    updateProfileDisplay();

    // --- START: MODIFICATION ---
    loadCompletionData();    // Load today's checked habits
    loadHabitsFromStorage(); // Load the list of habits
    renderHabitList();       // Draw the list (now with checks)
    applySavedMood();        // Re-apply the last selected mood
    // --- END: MODIFICATION ---

    // Play success sound (optional)
    playSound('login');
}

// ============================================
// NAVIGATION
// ============================================
function showScreen(screenName) {
    // Hide all screens
    const screens = ['dashboard', 'profile', 'moodCheck', 'music', 'connect'];
    screens.forEach(screen => {
        const element = document.getElementById(screen + 'Screen');
        if (element) {
            element.classList.add('hidden');
        }
    });

    // Show selected screen
    const selectedScreen = document.getElementById(screenName + 'Screen');
    if (selectedScreen) {
        selectedScreen.classList.remove('hidden');
    }

    // Update nav active state
    document.querySelectorAll('.nav-menu li').forEach(li => {
        li.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ============================================
// PROFILE EDIT FUNCTIONALITY
// ============================================
function openEditProfile() {
    // Show modal
    const modal = document.getElementById('editProfileModal');
    modal.classList.remove('hidden');

    // Populate form with current data
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editAge').value = currentUser.age;
    document.getElementById('editLocation').value = currentUser.location;
    document.getElementById('editBio').value = currentUser.bio;

    playSound('click');
}

function closeEditProfile() {
    const modal = document.getElementById('editProfileModal');
    modal.classList.add('hidden');
}

function saveProfile() {
    // Get form values
    const newName = document.getElementById('editName').value.trim();
    const newAge = document.getElementById('editAge').value.trim();
    const newLocation = document.getElementById('editLocation').value.trim();
    const newBio = document.getElementById('editBio').value.trim();

    // Validate
    if (!newName) {
        alert('Name is required!');
        return;
    }

    // Update user data
    currentUser.name = newName;
    currentUser.age = newAge;
    currentUser.location = newLocation;
    currentUser.bio = newBio;

    // Update avatar URL with new name
    currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&size=150&background=A3D9B1&color=fff&bold=true`;

    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(currentUser));

    // Update UI
    updateProfileDisplay();

    // Close modal
    closeEditProfile();

    // Show success message
    alert('✨ Profile updated successfully!');
    playSound('success');
}

function updateProfileDisplay() {
    // Update profile photo
    const photoElement = document.getElementById('profilePhoto');
    if (photoElement) {
        photoElement.src = currentUser.avatar;
    }

    // Update name
    const nameElement = document.getElementById('userName');
    if (nameElement) {
        nameElement.textContent = currentUser.name;
    }

    // Update details
    const detailsElement = document.getElementById('userDetails');
    if (detailsElement) {
        detailsElement.textContent = `🎂 Age: ${currentUser.age} | 📍 ${currentUser.location}`;
    }

    // Update bio
    const bioElement = document.getElementById('userBio');
    if (bioElement) {
        bioElement.textContent = currentUser.bio;
    }

    // Update dashboard greeting
    const greetingElement = document.querySelector('#dashboardScreen h2');
    if (greetingElement) {
        greetingElement.textContent = `Welcome back, ${currentUser.name.split(' ')[0]}! 👋`;
    }
}

function changeProfilePhoto() {
    // In a real app, this would open file picker
    const colors = ['A3D9B1', 'F5D76E', '4A90E2', 'F2994A', 'F28BBD'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&size=150&background=${randomColor}&color=fff&bold=true`;
    
    localStorage.setItem('userData', JSON.stringify(currentUser));
    updateProfileDisplay();
    playSound('success');
}

// ============================================
// MOOD SELECTION & THEME CHANGE
// ============================================
function selectMood(button) {
    // Remove selection from all mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Mark selected mood
    button.classList.add('selected');
    
    const mood = button.dataset.mood;
    const color = button.dataset.color;
    
    currentMood = mood;

    // --- START: MODIFICATION ---
    // Save the selected mood so it persists on refresh
    localStorage.setItem('lastMood', mood);
    // --- END: MODIFICATION ---
    
    // Change theme based on mood
    changeTheme(color);
    
    // Update music suggestion
    updateMusicSuggestion(mood);
    
    // Play mood sound
    playSound('mood');
}

function changeTheme(primaryColor) {
    // Calculate complementary colors
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    
    // Smooth transition
    document.body.style.transition = 'background 0.8s ease';
    
    // Update gradient based on mood color
    const colors = {
        '#4A90E2': ['#4A90E2', '#7EB6E8'],
        '#F5D76E': ['#F5D76E', '#F9E79F'],
        '#A3D9B1': ['#A3D9B1', '#C8E6C9'],
        '#F2994A': ['#F2994A', '#F5A962'],
        '#F28BBD': ['#F28BBD', '#F5A9D0']
    };
    
    const gradient = colors[primaryColor] || [primaryColor, '#FFFFFF'];
    document.body.style.background = `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`;
}

// --- START: MODIFICATION (New Function) ---
// This function re-applies the mood styling when the page loads
function applySavedMood() {
    // currentMood is loaded from localStorage by loadUserData()
    if (currentMood) {
        const savedMoodButton = document.querySelector(`.mood-btn[data-mood="${currentMood}"]`);
        if (savedMoodButton) {
            // We don't call selectMood() because that would play the sound
            // We just apply the styles
            savedMoodButton.classList.add('selected');
            changeTheme(savedMoodButton.dataset.color);
            updateMusicSuggestion(currentMood);
        }
    }
}
// --- END: MODIFICATION ---

// ============================================
// HABIT TRACKING
// ============================================

// --- START: MODIFICATION (New Functions) ---
// Loads today's completion data from localStorage
function loadCompletionData() {
    const today = new Date().toISOString().split('T')[0];
    const savedData = JSON.parse(localStorage.getItem('completedHabitsToday'));

    if (savedData && savedData.date === today) {
        todaysCompletions = savedData.habits;
    } else {
        // It's a new day or no data, so clear it
        localStorage.removeItem('completedHabitsToday');
        todaysCompletions = {};
    }
}

// Saves the current completion state to localStorage
function saveCompletionData() {
    const today = new Date().toISOString().split('T')[0];
    const dataToSave = { date: today, habits: todaysCompletions };
    localStorage.setItem('completedHabitsToday', JSON.stringify(dataToSave));
}
// --- END: MODIFICATION ---


function loadHabitsFromStorage() {
    const savedHabits = localStorage.getItem('userHabitsList');
    if (savedHabits) {
        userHabits = JSON.parse(savedHabits);
    } else {
        // No habits saved, use the default list
        userHabits = [...defaultHabits]; // This copies the default array
    }
}

function saveHabitsToStorage() {
    localStorage.setItem('userHabitsList', JSON.stringify(userHabits));
}

// --- START: MODIFICATION (Function Updated) ---
function renderHabitList() {
    const container = document.getElementById('habitListContainer');
    if (!container) return; // Safety check

    container.innerHTML = ''; // Clear the list first

    if (!userHabits || userHabits.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light);">No habits added yet. Add one above!</p>';
        updateHabitProgress(); // Make sure progress shows 0%
        return;
    }

    userHabits.forEach(habit => {
        // Check if this habit was already completed today
        const isCompleted = todaysCompletions[habit.text] === true;
        const completedClass = isCompleted ? 'completed' : '';

        // Create the new habit item HTML
        const habitHTML = `
            <div class="habit-item ${completedClass}" onclick="toggleHabit(this)">
                <div class="habit-checkbox">
                    <i class="fas fa-check"></i>
                </div>
                <span class="habit-icon">${habit.icon || '🎯'}</span>
                <span class="habit-label">${habit.text}</span>
                <button class="delete-habit-btn" onclick="deleteHabit(event, '${habit.text}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        container.innerHTML += habitHTML;
    });

    // After rendering, update the progress circle
    updateHabitProgress();
}
// --- END: MODIFICATION ---

function addHabit() {
    const input = document.getElementById('newHabitInput');
    if (!input) return;

    const habitText = input.value.trim();
    if (habitText === "") {
        alert('Please enter a habit!');
        return;
    }

    // Check for duplicates (not case-sensitive)
    if (userHabits.some(habit => habit.text.toLowerCase() === habitText.toLowerCase())) {
        alert('That habit already exists!');
        return;
    }

    // Get a random icon (simple way)
    const icons = ['🎯', '🧠', '💪', '🚶', '🌱', '☀️', '🌙', '✍️'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    // Add the new habit to our list
    userHabits.push({ text: habitText, icon: randomIcon });
    
    saveHabitsToStorage(); // Save the new list
    renderHabitList();    // Re-draw the list on the page

    input.value = ''; // Clear input field
    playSound('success');
}

function deleteHabit(event, habitText) {
    // This is CRITICAL. It stops the 'toggleHabit' click from firing on the parent div.
    event.stopPropagation(); 

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete this habit:\n"${habitText}"?`)) {
        return;
    }

    // Filter the habit out of the list
    userHabits = userHabits.filter(habit => habit.text !== habitText);
    
    // --- START: MODIFICATION ---
    // Also remove it from today's completions
    delete todaysCompletions[habitText];
    saveCompletionData();
    // --- END: MODIFICATION ---
    
    saveHabitsToStorage(); // Save the modified list
    renderHabitList();    // Re-draw the list
    playSound('click'); // or a 'delete' sound
}


// --- START: MODIFICATION (Function Updated) ---
function toggleHabit(habitItem) {
    // Get the habit's name (text)
    const labelElement = habitItem.querySelector('.habit-label');
    if (!labelElement) return;
    const habitText = labelElement.textContent;

    // Toggle the visual class
    habitItem.classList.toggle('completed');
    
    // Check the new status
    const isNowCompleted = habitItem.classList.contains('completed');

    // Update our completion state object
    todaysCompletions[habitText] = isNowCompleted;

    // Save this new state to localStorage
    saveCompletionData();
    
    // Update completed habits count
    updateHabitProgress();
    
    // Play check sound
    playSound('check');
}
// --- END: MODIFICATION ---

function updateHabitProgress() {
    // --- START: MODIFICATION (Logic simplified) ---
    // We can now read directly from our 'userHabits' and 'todaysCompletions'
    // This is more reliable than reading from the DOM
    
    const totalHabits = userHabits.length;
    const completedCount = Object.values(todaysCompletions).filter(val => val === true).length;
    
    const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
    // --- END: MODIFICATION ---
    
    // Update progress ring
    const circle = document.getElementById('habitProgress');
    const percentageText = document.getElementById('habitPercentage');
    
    if (circle && percentageText) {
        const circumference = 2 * Math.PI * 65; // r = 65
        // Calculate offset, ensuring it's never NaN
        const offset = circumference - (percentage / 100) * circumference || circumference;
        circle.style.strokeDashoffset = offset;
        percentageText.textContent = percentage + '%';
    }
}

// --- START: MODIFICATION (Function Updated) ---
function saveMoodAndHabits() {
    if (!currentMood) {
        alert('Please select your mood first! 💭');
        return;
    }

    // Save to localStorage
    const today = new Date().toISOString().split('T')[0];
    
    // Read from our state object, not the DOM
    const completedHabitsArray = Object.keys(todaysCompletions)
        .filter(key => todaysCompletions[key] === true);
    
    const checkIn = {
        date: today,
        mood: currentMood,
        habits: completedHabitsArray
    };

    // Save to localStorage
    let checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    // Prevent duplicate check-ins for the same day
    checkIns = checkIns.filter(ci => ci.date !== today);
    checkIns.push(checkIn);
    localStorage.setItem('checkIns', JSON.stringify(checkIns));

    // Show success message
    alert('✨ Check-in saved! Keep up the great work! 🎉');
    playSound('success');
}
// --- END: MODIFICATION ---

// ============================================
// MUSIC SUGGESTIONS
// ============================================
const musicSuggestions = {
    sad: {
        title: 'Comfort & Healing',
        artist: 'Relaxing Piano Music',
        image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&h=300&fit=crop',
        playlist: 'https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634' // Added your link
    },
    happy: {
        title: 'Feel Good Vibes',
        artist: 'Happy Pop Hits',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=300&fit=crop',
        playlist: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC' // Added your link
    },
    calm: {
        title: 'Peaceful Piano',
        artist: 'Ambient & Chill',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=300&fit=crop',
        playlist: 'https://open.spotify.com/playlist/37i9dQZF1DX0FOF1IUWK1W' // Added your link
    },
    energetic: {
        title: 'Power Workout',
        artist: 'High Energy Mix',
        image: 'https://images.unsplash.com/photo-1571609370705-6caa50d1c1b4?w=500&h=300&fit=crop',
        playlist: 'https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh' // Added your link
    },
    romantic: {
        title: 'Love Songs',
        artist: 'Romantic Ballads',
        image: 'https://images.unsplash.com/photo-1518972734183-c5e7b08e4d62?w=500&h=300&fit=crop',
        playlist: 'https://open.spotify.com/playlist/37i9dQZF1DWXb9I5xoXLjp' // Added your link
    }
};

function updateMusicSuggestion(mood) {
    const suggestion = musicSuggestions[mood] || musicSuggestions.calm;
    
    document.getElementById('songTitle').textContent = suggestion.title;
    document.getElementById('songArtist').textContent = suggestion.artist + ' • Perfect for your ' + mood + ' mood';
    document.getElementById('albumArt').src = suggestion.image;
    
    // This updates the global variable with the correct playlist
    currentPlaylistUrl = suggestion.playlist;
}

function refreshMusic() {
    const moods = ['sad', 'happy', 'calm', 'energetic', 'romantic'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    updateMusicSuggestion(randomMood);
    playSound('refresh');
}

function openSpotify() {
    // This now opens the correct link in a new tab
    if (currentPlaylistUrl) {
        window.open(currentPlaylistUrl, '_blank');
    } else {
        // Fallback in case a mood hasn't been selected
        alert('Please select a mood from the Mood tab first! 💭');
    }
    playSound('click');
}

// ============================================
// PROFILE FUNCTIONALITY
// ============================================
function shareProfile() {
    const url = 'https://vibra.app/profile/' + currentUser.name.replace(/\s+/g, '').toLowerCase();
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
        alert('✨ Profile link copied to clipboard!\n' + url);
        playSound('success');
    }).catch(() => {
        alert('Profile link: ' + url);
    });
}

// ============================================
// CHATBOT FUNCTIONALITY
// ============================================

// --- START: NEW CHATBOT LOGIC ---
const habitSuggestions = [
    "Drink a glass of water 💧",
    "Take 5 deep breaths 🌬️",
    "Stretch for 2 minutes 🧘",
    "Go for a short walk 🚶‍♀️",
    "Write down 3 good things 📝",
    "Listen to calming music 🎵",
    "Avoid your phone for 10 minutes 📵",
    "Say something kind to yourself 💜",
];

function toggleChatbot() {
    const chatWindow = document.getElementById('chatbotWindow');
    chatWindow.classList.toggle('hidden');
    
    if (!chatWindow.classList.contains('hidden')) {
        document.getElementById('chatInput').focus();
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Get bot response
    setTimeout(() => {
        const response = chatBotResponse(message); // Calls the new function
        addMessage(response, 'bot');
        playSound('message');
    }, 500);
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + sender;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function chatBotResponse(userMessage) {
    let reply = "I'm listening 👂 Tell me more.";
    const msg = userMessage.toLowerCase();

    if (msg.includes("happy") || msg.includes("great")) {
        reply = "That’s awesome! 🌞 Keep smiling — maybe some upbeat tunes to match your vibe?";
    } else if (msg.includes("sad") || msg.includes("down")) {
        reply = "I’m sorry you’re feeling low 💙. Music can really help. Want to try something soothing?";
    } else if (msg.includes("calm") || msg.includes("relaxed")) {
        reply = "Perfect. Peaceful mind, peaceful day 🌿";
    } else if (msg.includes("energetic") || msg.includes("excited")) {
        reply = "Nice! ⚡ Let’s keep that energy going!";
    } else if (msg.includes("romantic") || msg.includes("love")) {
        reply = "Awww 💖 Love is beautiful! Here’s something soft and romantic for you.";
    } else if (msg.includes("focus") || msg.includes("study")) {
        reply = "Let’s get productive 🧠 Try this focus playlist to stay in the zone.";
    } else if (msg.includes("stress") || msg.includes("anxious")) {
        reply = "Breathe with me 🫁 Inhale… Exhale… You’re doing great. Try taking a short break or a walk outside 🌿.";
    } else if (msg.includes("tired")) {
        reply = "You sound tired 😴 Maybe you need a short nap or stretch break. Hydrate and rest your eyes for a bit 👀.";
    } else if (msg.includes("lonely")) {
        reply = "You’re not alone 💜 It’s okay to feel lonely sometimes. Try calling a friend or journaling your thoughts.";
    } else if (msg.includes("bored")) {
        reply = "Feeling bored? Try learning a small skill, doodling, or stepping outside for fresh air 🌞.";
    } else if (msg.includes("habit")) {
        const habit = habitSuggestions[Math.floor(Math.random() * habitSuggestions.length)];
        reply = `Here’s a healthy habit to try today: ${habit}`;
    } else if (msg.includes("motivate") || msg.includes("motivation")) {
        reply = "You’ve got this 💪 Every small effort matters! Want me to give you one small action you can do now?";
    } else if (msg.includes("yes")) {
        // This is a follow-up to "Want me to give you one small action?"
        const habit = habitSuggestions[Math.floor(Math.random() * habitSuggestions.length)];
        reply = `Awesome! Try this: ${habit}`;
    } else if (msg.includes("hello") || msg.includes("hi")) {
        reply = "Hey there 👋 How are you feeling today?";
    } else if (msg.includes("who are you")) {
        reply = "I’m Vibra 🤖, your personal wellness companion — here to track your mood, habits & keep you positive 💫.";
    } else if (msg.includes("thank")) {
        reply = "You’re very welcome 💜 Always here to help!";
    } else if (msg.includes("bye")) {
        reply = "Bye for now 👋 Remember — your well-being matters!";
    } else if (msg.includes("time")) {
        reply = `Right now it's ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ⏰`;
    } else if (msg.includes("date")) {
        reply = `Today is ${new Date().toLocaleDateString()} 📅`;
    } else {
        reply = "Hmm 🤔 I didn’t quite get that. Try saying ‘I’m stressed’, ‘Motivate me’, or ‘Suggest a habit’.";
    }

    return reply;
}
// --- END: NEW CHATBOT LOGIC ---

// ============================================
// CONNECT SCREEN
// ============================================
function sendMotivation() {
    const textarea = document.querySelector('.share-motivation textarea');
    const message = textarea.value.trim();
    
    if (!message) {
        alert('Please write a message first! 💌');
        return;
    }
    
    alert('✨ Your motivational message has been sent to Sarah! 💌');
    textarea.value = '';
    playSound('success');
}

// ============================================
// DATA PERSISTENCE
// ============================================
function loadUserData() {
    // Load from localStorage
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }

    const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    
    // --- START: MODIFICATION ---
    // This line loads the mood so 'applySavedMood' can use it
    const lastMood = localStorage.getItem('lastMood');
    // --- END: MODIFICATION ---
    
    if (lastMood) {
        currentMood = lastMood;
    }
}

// ============================================
// SOUND EFFECTS (Optional)
// ============================================
function playSound(soundType) {
    // In a real app, you would play actual sound files
    // For demo purposes, this is a placeholder
    
    // Example: new Audio('sounds/' + soundType + '.mp3').play();
    
    // You can use Web Audio API or simple Audio objects
    console.log('🔊 Playing sound: ' + soundType);
}

// ============================================
// DASHBOARD UPDATES
// ============================================
function updateDashboard() {
    // This would analyze localStorage data and update charts
    // For now, we're using static mock data
    
    // Animate progress rings on load
    setTimeout(() => {
        updateHabitProgress();
    }, 100);
}

// ============================================
// INITIALIZE APP ON LOAD
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Add subtle entrance animations
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
    });
});

// ============================================
// BONUS: Background mood bubbles animation
// ============================================
function createMoodBubbles() {
    const colors = ['#4A90E2', '#F5D76E', '#A3D9B1', '#F2994A', '#F28BBD'];
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.style.position = 'fixed';
            bubble.style.width = Math.random() * 100 + 50 + 'px';
            bubble.style.height = bubble.style.width;
            bubble.style.borderRadius = '50%';
            bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
            bubble.style.opacity = '0.1';
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.top = '100%';
            bubble.style.pointerEvents = 'none';
            bubble.style.zIndex = '0';
            bubble.style.animation = `float ${Math.random() * 10 + 15}s ease-in-out infinite`;
            
            document.body.appendChild(bubble);
        }, i * 1000);
    }
}

// Uncomment to enable floating bubbles
createMoodBubbles();
