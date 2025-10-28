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

// --- HABIT STATE ---
const defaultHabits = [
    { text: 'Drink 8 glasses of water', icon: '💧' },
    { text: 'Read for 30 minutes', icon: '📚' },
    { text: 'Meditate for 10 minutes', icon: '🧘' },
    { text: 'Exercise for 20 minutes', icon: '🏃' }
];
let userHabits = [];
let todaysCompletions = {};
// --- END HABIT STATE ---

// --- START: NEW CONNECT CHAT STATE ---
let isConnected = false;
let currentPartner = "";
let connectMessages = [];
const randomNames = [
    "Arya", "Ravi", "Nia", "Mira", "Kian", "Tara", "Leo", "Isha", "Aarav", "Sana"
];
const partnerReplies = [
    "That’s interesting! Tell me more 😊",
    "I totally get that 💬",
    "Haha that’s funny 😂",
    "I’ve felt that way too sometimes 🌸",
    "Music always helps me relax 🎵",
    "Same here! What kind of songs do you like?",
    "Aww that’s sweet 💖",
    "That sounds amazing! 🌟",
    "Yeah, taking a walk really clears my mind 🚶‍♀️",
    "Self-care is so important 💜",
    "Sometimes just breathing helps 🫁",
    "You sound like a really positive person 😄",
    "I love that mindset 💪",
    "I’m having fun chatting with you 🫶",
    "Do you like coffee or tea more? ☕",
    "That’s a great hobby! I should try that too 👀",
    "Ooo that sounds cozy 🌙",
    "I think balance is key, right? ⚖️",
    "Let’s both stay positive 🌈",
    "You’ve got a great vibe ✨"
];
// --- END: NEW CONNECT CHAT STATE ---

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

    // Load habits and mood
    loadCompletionData();
    loadHabitsFromStorage();
    renderHabitList();
    applySavedMood();

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
    // Find the correct nav item based on screenName
    const activeNavItem = document.querySelector(`.nav-menu li[onclick="showScreen('${screenName}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
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

    // --- START: MODIFICATION ---
    // Update avatar URL only if it's the default ui-avatars one
    if (currentUser.avatar && currentUser.avatar.includes('ui-avatars.com')) {
         currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&size=150&background=A3D9B1&color=fff&bold=true`;
    }
    // --- END: MODIFICATION ---

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
        // --- START: MODIFICATION ---
        // Use saved avatar or a default if none exists
        photoElement.src = currentUser.avatar || `https://ui-avatars.com/api/?name=?&size=150&background=E0E0E0&color=fff`;
        // --- END: MODIFICATION ---
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

// --- START: MODIFIED PROFILE PHOTO FUNCTIONS ---
function triggerPhotoUpload() {
    document.getElementById('photoUploadInput').click();
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // e.target.result contains the Base64 Data URL
            currentUser.avatar = e.target.result;
            localStorage.setItem('userData', JSON.stringify(currentUser));
            updateProfileDisplay();
            playSound('success');
        }
        
        reader.readAsDataURL(file); // Read the file as a Data URL
    } else {
        alert('Please select a valid image file (jpg, png, gif, etc.).');
    }
}

// Modified this function just to trigger the upload input
function changeProfilePhoto() {
    triggerPhotoUpload();
}

function removeProfilePhoto() {
    if (!confirm('Are you sure you want to remove your profile photo?')) {
        return;
    }

    // Set to a generic, gray placeholder avatar based on current name
    currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&size=150&background=E0E0E0&color=fff`;
    
    // Save the change and update the UI
    localStorage.setItem('userData', JSON.stringify(currentUser));
    updateProfileDisplay();
    playSound('click');
}
// --- END: MODIFIED PROFILE PHOTO FUNCTIONS ---

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
    localStorage.setItem('lastMood', mood);
    
    changeTheme(color);
    updateMusicSuggestion(mood);
    playSound('mood');
}

function changeTheme(primaryColor) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    document.body.style.transition = 'background 0.8s ease';
    
    const colors = {
        '#4A90E2': ['#4A90E2', '#7EB6E8'], '#F5D76E': ['#F5D76E', '#F9E79F'],
        '#A3D9B1': ['#A3D9B1', '#C8E6C9'], '#F2994A': ['#F2994A', '#F5A962'],
        '#F28BBD': ['#F28BBD', '#F5A9D0']
    };
    const gradient = colors[primaryColor] || [primaryColor, '#FFFFFF'];
    document.body.style.background = `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`;
}

function applySavedMood() {
    if (currentMood) {
        const savedMoodButton = document.querySelector(`.mood-btn[data-mood="${currentMood}"]`);
        if (savedMoodButton) {
            savedMoodButton.classList.add('selected');
            changeTheme(savedMoodButton.dataset.color);
            updateMusicSuggestion(currentMood);
        }
    }
}

// ============================================
// HABIT TRACKING
// ============================================

function loadCompletionData() {
    const today = new Date().toISOString().split('T')[0];
    const savedData = JSON.parse(localStorage.getItem('completedHabitsToday'));

    if (savedData && savedData.date === today) {
        todaysCompletions = savedData.habits;
    } else {
        localStorage.removeItem('completedHabitsToday');
        todaysCompletions = {};
    }
}

function saveCompletionData() {
    const today = new Date().toISOString().split('T')[0];
    const dataToSave = { date: today, habits: todaysCompletions };
    localStorage.setItem('completedHabitsToday', JSON.stringify(dataToSave));
}

function loadHabitsFromStorage() {
    const savedHabits = localStorage.getItem('userHabitsList');
    if (savedHabits) {
        userHabits = JSON.parse(savedHabits);
    } else {
        userHabits = [...defaultHabits];
    }
}

function saveHabitsToStorage() {
    localStorage.setItem('userHabitsList', JSON.stringify(userHabits));
}

function renderHabitList() {
    const container = document.getElementById('habitListContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!userHabits || userHabits.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light);">No habits added yet. Add one above!</p>';
        updateHabitProgress();
        return;
    }

    userHabits.forEach(habit => {
        const isCompleted = todaysCompletions[habit.text] === true;
        const completedClass = isCompleted ? 'completed' : '';
        const habitHTML = `
            <div class="habit-item ${completedClass}" onclick="toggleHabit(this)">
                <div class="habit-checkbox"><i class="fas fa-check"></i></div>
                <span class="habit-icon">${habit.icon || '🎯'}</span>
                <span class="habit-label">${habit.text}</span>
                <button class="delete-habit-btn" onclick="deleteHabit(event, '${habit.text}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>`;
        container.innerHTML += habitHTML;
    });

    updateHabitProgress();
}

function addHabit() {
    const input = document.getElementById('newHabitInput');
    if (!input) return;
    const habitText = input.value.trim();
    if (habitText === "") return alert('Please enter a habit!');
    if (userHabits.some(h => h.text.toLowerCase() === habitText.toLowerCase())) return alert('That habit already exists!');

    const icons = ['🎯', '🧠', '💪', '🚶', '🌱', '☀️', '🌙', '✍️'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    userHabits.push({ text: habitText, icon: randomIcon });
    
    saveHabitsToStorage();
    renderHabitList();
    input.value = '';
    playSound('success');
}

function deleteHabit(event, habitText) {
    event.stopPropagation(); 
    if (!confirm(`Are you sure you want to delete this habit:\n"${habitText}"?`)) return;

    userHabits = userHabits.filter(h => h.text !== habitText);
    delete todaysCompletions[habitText];
    saveCompletionData();
    saveHabitsToStorage();
    renderHabitList();
    playSound('click');
}

function toggleHabit(habitItem) {
    const labelElement = habitItem.querySelector('.habit-label');
    if (!labelElement) return;
    const habitText = labelElement.textContent;

    habitItem.classList.toggle('completed');
    const isNowCompleted = habitItem.classList.contains('completed');
    todaysCompletions[habitText] = isNowCompleted;

    saveCompletionData();
    updateHabitProgress();
    playSound('check');
}

function updateHabitProgress() {
    const totalHabits = userHabits.length;
    const completedCount = Object.values(todaysCompletions).filter(val => val === true).length;
    const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
    
    const circle = document.getElementById('habitProgress');
    const percentageText = document.getElementById('habitPercentage');
    
    if (circle && percentageText) {
        const circumference = 2 * Math.PI * 65;
        const offset = circumference - (percentage / 100) * circumference || circumference;
        circle.style.strokeDashoffset = offset;
        percentageText.textContent = percentage + '%';
    }
}

function saveMoodAndHabits() {
    if (!currentMood) return alert('Please select your mood first! 💭');

    const today = new Date().toISOString().split('T')[0];
    const completedHabitsArray = Object.keys(todaysCompletions).filter(key => todaysCompletions[key] === true);
    const checkIn = { date: today, mood: currentMood, habits: completedHabitsArray };

    let checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    checkIns = checkIns.filter(ci => ci.date !== today);
    checkIns.push(checkIn);
    localStorage.setItem('checkIns', JSON.stringify(checkIns));

    alert('✨ Check-in saved! Keep up the great work! 🎉');
    playSound('success');
}
// ============================================
// MUSIC SUGGESTIONS
// ============================================
const musicSuggestions = {
    sad: { title: 'Comfort & Healing', artist: 'Relaxing Piano Music', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&h=300&fit=crop', playlist: 'https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634' },
    happy: { title: 'Feel Good Vibes', artist: 'Happy Pop Hits', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=300&fit=crop', playlist: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC' },
    calm: { title: 'Peaceful Piano', artist: 'Ambient & Chill', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=300&fit=crop', playlist: 'https://open.spotify.com/playlist/37i9dQZF1DX0FOF1IUWK1W' },
    energetic: { title: 'Power Workout', artist: 'High Energy Mix', image: 'https://images.unsplash.com/photo-1571609370705-6caa50d1c1b4?w=500&h=300&fit=crop', playlist: 'https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh' },
    romantic: { title: 'Love Songs', artist: 'Romantic Ballads', image: 'https://images.unsplash.com/photo-1518972734183-c5e7b08e4d62?w=500&h=300&fit=crop', playlist: 'https://open.spotify.com/playlist/37i9dQZF1DWXb9I5xoXLjp' }
};

function updateMusicSuggestion(mood) {
    const suggestion = musicSuggestions[mood] || musicSuggestions.calm;
    document.getElementById('songTitle').textContent = suggestion.title;
    document.getElementById('songArtist').textContent = suggestion.artist + ' • Perfect for your ' + mood + ' mood';
    document.getElementById('albumArt').src = suggestion.image;
    currentPlaylistUrl = suggestion.playlist;
}

function refreshMusic() {
    const moods = ['sad', 'happy', 'calm', 'energetic', 'romantic'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    updateMusicSuggestion(randomMood);
    playSound('refresh');
}

function openSpotify() {
    if (currentPlaylistUrl) { window.open(currentPlaylistUrl, '_blank'); } 
    else { alert('Please select a mood from the Mood tab first! 💭'); }
    playSound('click');
}

// ============================================
// PROFILE FUNCTIONALITY (Share only)
// ============================================
function shareProfile() {
    const url = 'https://vibra.app/profile/' + currentUser.name.replace(/\s+/g, '').toLowerCase();
    navigator.clipboard.writeText(url).then(() => {
        alert('✨ Profile link copied to clipboard!\n' + url); playSound('success');
    }).catch(() => alert('Profile link: ' + url));
}

// ============================================
// CHATBOT FUNCTIONALITY
// ============================================
const habitSuggestions = [
    "Drink a glass of water 💧", "Take 5 deep breaths 🌬️", "Stretch for 2 minutes 🧘",
    "Go for a short walk 🚶‍♀️", "Write down 3 good things 📝", "Listen to calming music 🎵",
    "Avoid your phone for 10 minutes 📵", "Say something kind to yourself 💜",
];

function toggleChatbot() {
    const chatWindow = document.getElementById('chatbotWindow');
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) document.getElementById('chatInput').focus();
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    addMessage(message, 'user');
    input.value = '';
    setTimeout(() => { const response = chatBotResponse(message); addMessage(response, 'bot'); playSound('message'); }, 500);
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
    let reply = "I'm listening 👂 Tell me more."; const msg = userMessage.toLowerCase();
    if (msg.includes("happy") || msg.includes("great")) reply = "That’s awesome! 🌞 Keep smiling — maybe some upbeat tunes to match your vibe?";
    else if (msg.includes("sad") || msg.includes("down")) reply = "I’m sorry you’re feeling low 💙. Music can really help. Want to try something soothing?";
    else if (msg.includes("calm") || msg.includes("relaxed")) reply = "Perfect. Peaceful mind, peaceful day 🌿";
    else if (msg.includes("energetic") || msg.includes("excited")) reply = "Nice! ⚡ Let’s keep that energy going!";
    else if (msg.includes("romantic") || msg.includes("love")) reply = "Awww 💖 Love is beautiful! Here’s something soft and romantic for you.";
    else if (msg.includes("focus") || msg.includes("study")) reply = "Let’s get productive 🧠 Try this focus playlist to stay in the zone.";
    else if (msg.includes("stress") || msg.includes("anxious")) reply = "Breathe with me 🫁 Inhale… Exhale… You’re doing great. Try taking a short break or a walk outside 🌿.";
    else if (msg.includes("tired")) reply = "You sound tired 😴 Maybe you need a short nap or stretch break. Hydrate and rest your eyes for a bit 👀.";
    else if (msg.includes("lonely")) reply = "You’re not alone 💜 It’s okay to feel lonely sometimes. Try calling a friend or journaling your thoughts.";
    else if (msg.includes("bored")) reply = "Feeling bored? Try learning a small skill, doodling, or stepping outside for fresh air 🌞.";
    else if (msg.includes("habit")) { const habit = habitSuggestions[Math.floor(Math.random() * habitSuggestions.length)]; reply = `Here’s a healthy habit to try today: ${habit}`; }
    else if (msg.includes("motivate") || msg.includes("motivation")) reply = "You’ve got this 💪 Every small effort matters! Want me to give you one small action you can do now?";
    else if (msg.includes("yes")) { const habit = habitSuggestions[Math.floor(Math.random() * habitSuggestions.length)]; reply = `Awesome! Try this: ${habit}`; }
    else if (msg.includes("hello") || msg.includes("hi")) reply = "Hey there 👋 How are you feeling today?";
    else if (msg.includes("who are you")) reply = "I’m Vibra 🤖, your personal wellness companion — here to track your mood, habits & keep you positive 💫.";
    else if (msg.includes("thank")) reply = "You’re very welcome 💜 Always here to help!";
    else if (msg.includes("bye")) reply = "Bye for now 👋 Remember — your well-being matters!";
    else if (msg.includes("time")) reply = `Right now it's ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ⏰`;
    else if (msg.includes("date")) reply = `Today is ${new Date().toLocaleDateString()} 📅`;
    else reply = "Hmm 🤔 I didn’t quite get that. Try saying ‘I’m stressed’, ‘Motivate me’, or ‘Suggest a habit’.";
    return reply;
}

// ============================================
// CONNECT SCREEN - NEW LOGIC
// ============================================

// 🧠 Context-aware replies (copied from React)
function generateSmartReply(message) {
  const msg = message.toLowerCase();
  if (msg.includes("hi") || msg.includes("hello")) return "Hey there 👋 How’s your day going?";
  if (msg.includes("how are you")) return "I’m feeling good, thanks! How about you?";
  if (msg.includes("sad") || msg.includes("down")) return "Aww 😢 Sorry to hear that. Want to talk about it?";
  if (msg.includes("happy")) return "Yay! That makes me smile too 😄 What made you happy today?";
  if (msg.includes("tired")) return "Same 😴 Maybe a short nap or music break could help?";
  if (msg.includes("music")) return "I love music too! 🎧 What’s your favorite song right now?";
  if (msg.includes("movie")) return "I’m a big movie fan too 🍿 Any recent favorites?";
  if (msg.includes("book")) return "Books are amazing 📚 I love stories that calm the mind.";
  if (msg.includes("friend")) return "Friends make life beautiful 🫶 What’s your best memory with yours?";
  if (msg.includes("stress") || msg.includes("anxious")) return "Let’s take a deep breath together 🧘 You’ve got this.";
  if (msg.includes("hobby")) return "Ooo that’s cool! I love hearing about people’s hobbies 🎨";
  if (msg.includes("love")) return "Aww 💖 That’s beautiful — love makes everything brighter.";
  if (msg.includes("bye")) return "It was nice talking to you! Hope to chat again soon 👋";
  if (msg.includes("food")) return "Yum 😋 I could talk about food all day! What’s your favorite?";
  if (msg.includes("weather")) return "The weather totally affects the mood 🌤️ How’s it there?";
  if (msg.includes("work") || msg.includes("study")) return "That can be tiring 😅 Remember to take short breaks!";
  if (msg.includes("lol") || msg.includes("haha")) return "😂 You’ve got a fun sense of humor!";
  if (msg.includes("thank")) return "Aww that’s sweet 💕 Glad we’re chatting!";
  if (msg.includes("bored")) return "Same sometimes 😅 Try doing something creative or chill music?";
  if (msg.includes("relax")) return "Relaxing sounds perfect 🌙 Maybe some lo-fi beats?";
  return partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
}

function connectNewPerson() {
    currentPartner = randomNames[Math.floor(Math.random() * randomNames.length)];
    isConnected = true;
    connectMessages = [
        { sender: "system", text: `✨ You are now connected with ${currentPartner}. Say hi and share good vibes! 💫` }
    ];

    // Update UI
    document.getElementById('connectInitialView').classList.add('hidden');
    document.getElementById('connectChatView').classList.remove('hidden');
    document.getElementById('partnerName').textContent = currentPartner;
    renderConnectMessages();
}

function handleConnectSend(event) {
    event.preventDefault(); // Prevent form submission page reload
    const inputElement = document.getElementById('connectInput');
    const messageText = inputElement.value.trim();

    if (!messageText) return;

    // Add user message
    addConnectMessage(messageText, 'you');
    inputElement.value = ''; // Clear input

    // Simulate partner reply
    setTimeout(() => {
        const replyText = generateSmartReply(messageText);
        addConnectMessage(replyText, currentPartner); // Use partner's name as sender
    }, 1200);
}

function addConnectMessage(text, sender) {
    connectMessages.push({ sender, text });
    renderConnectMessages();
}

function renderConnectMessages() {
    const messagesContainer = document.getElementById('connectMessages');
    messagesContainer.innerHTML = ''; // Clear previous messages

    connectMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = msg.text;
        
        // Add classes for styling
        messageDiv.classList.add('connect-message');
        if (msg.sender === 'you') {
            messageDiv.classList.add('you');
        } else if (msg.sender === 'system') {
            messageDiv.classList.add('system');
        } else {
            messageDiv.classList.add('partner');
        }
        
        messagesContainer.appendChild(messageDiv);
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function disconnectAndFindNew() {
    isConnected = false;
    currentPartner = "";
    connectMessages = [];

    // Update UI
    document.getElementById('connectChatView').classList.add('hidden');
    document.getElementById('connectInitialView').classList.remove('hidden');
    // Clear message container just in case
    document.getElementById('connectMessages').innerHTML = ''; 
}

// Remove the old sendMotivation function - it is replaced by handleConnectSend
/* function sendMotivation() { ... } 
*/


// ============================================
// DATA PERSISTENCE
// ============================================
function loadUserData() {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) currentUser = JSON.parse(savedUser);
    const lastMood = localStorage.getItem('lastMood');
    if (lastMood) currentMood = lastMood;
}

// ============================================
// SOUND EFFECTS (Optional)
// ============================================
function playSound(soundType) { console.log('🔊 Playing sound: ' + soundType); }

// ============================================
// DASHBOARD UPDATES
// ============================================
function updateDashboard() { /* Update dashboard charts based on localStorage data */ setTimeout(updateHabitProgress, 100); }

// ============================================
// INITIALIZE APP ON LOAD
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    init();
    document.querySelectorAll('.card').forEach((card, index) => card.style.animationDelay = (index * 0.1) + 's');
});

// ============================================
// BONUS: Background mood bubbles animation
// ============================================
function createMoodBubbles() {
    const colors = ['#4A90E2', '#F5D76E', '#A3D9B1', '#F2994A', '#F28BBD'];
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            Object.assign(bubble.style, {
                position: 'fixed', width: `${Math.random() * 100 + 50}px`, 
                height: bubble.style.width, borderRadius: '50%',
                background: colors[Math.floor(Math.random() * colors.length)],
                opacity: '0.1', left: `${Math.random() * 100}%`, top: '100%',
                pointerEvents: 'none', zIndex: '0',
                animation: `float ${Math.random() * 10 + 15}s ease-in-out infinite`
            });
            document.body.appendChild(bubble);
        }, i * 1000);
    }
}
createMoodBubbles(); // Enable floating bubbles
