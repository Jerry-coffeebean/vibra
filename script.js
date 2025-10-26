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
let completedHabits = new Set();

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

// ============================================
// HABIT TRACKING
// ============================================
function toggleHabit(habitItem) {
    habitItem.classList.toggle('completed');
    
    // Update completed habits count
    updateHabitProgress();
    
    // Play check sound
    playSound('check');
}

function updateHabitProgress() {
    const totalHabits = document.querySelectorAll('.habit-item').length;
    const completedCount = document.querySelectorAll('.habit-item.completed').length;
    const percentage = Math.round((completedCount / totalHabits) * 100);
    
    // Update progress ring
    const circle = document.getElementById('habitProgress');
    const percentageText = document.getElementById('habitPercentage');
    
    if (circle && percentageText) {
        const circumference = 2 * Math.PI * 65; // r = 65
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        percentageText.textContent = percentage + '%';
    }
}

function saveMoodAndHabits() {
    if (!currentMood) {
        alert('Please select your mood first! 💭');
        return;
    }

    // Save to localStorage
    const today = new Date().toISOString().split('T')[0];
    const completedHabitsArray = Array.from(document.querySelectorAll('.habit-item.completed'))
        .map(item => item.querySelector('.habit-label').textContent);
    
    const checkIn = {
        date: today,
        mood: currentMood,
        habits: completedHabitsArray
    };

    // Save to localStorage
    let checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    checkIns.push(checkIn);
    localStorage.setItem('checkIns', JSON.stringify(checkIns));

    // Show success message
    alert('✨ Check-in saved! Keep up the great work! 🎉');
    playSound('success');
}

// ============================================
// MUSIC SUGGESTIONS
// ============================================
const musicSuggestions = {
    sad: {
        title: 'Comfort & Healing',
        artist: 'Relaxing Piano Music',
        image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&h=300&fit=crop'
    },
    happy: {
        title: 'Feel Good Vibes',
        artist: 'Happy Pop Hits',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=300&fit=crop'
    },
    calm: {
        title: 'Peaceful Piano',
        artist: 'Ambient & Chill',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=300&fit=crop'
    },
    energetic: {
        title: 'Power Workout',
        artist: 'High Energy Mix',
        image: 'https://images.unsplash.com/photo-1571609370705-6caa50d1c1b4?w=500&h=300&fit=crop'
    },
    romantic: {
        title: 'Love Songs',
        artist: 'Romantic Ballads',
        image: 'https://images.unsplash.com/photo-1518972734183-c5e7b08e4d62?w=500&h=300&fit=crop'
    }
};

function updateMusicSuggestion(mood) {
    const suggestion = musicSuggestions[mood] || musicSuggestions.calm;
    
    document.getElementById('songTitle').textContent = suggestion.title;
    document.getElementById('songArtist').textContent = suggestion.artist + ' • Perfect for your ' + mood + ' mood';
    document.getElementById('albumArt').src = suggestion.image;
}

function refreshMusic() {
    const moods = ['sad', 'happy', 'calm', 'energetic', 'romantic'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    updateMusicSuggestion(randomMood);
    playSound('refresh');
}

function openSpotify() {
    alert('🎵 Opening in Spotify... (Mock feature)');
    playSound('click');
}

function openYouTube() {
    alert('🎵 Opening in YouTube Music... (Mock feature)');
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
        const response = chatBotResponse(message);
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
    const message = userMessage.toLowerCase();
    
    // Keyword-based responses
    if (message.includes('stress') || message.includes('anxious') || message.includes('worried')) {
        return "I hear you. 💙 Try taking 5 deep breaths. I recommend listening to some calm music. Would you like a peaceful playlist?";
    } else if (message.includes('sad') || message.includes('down') || message.includes('depressed')) {
        return "I'm sorry you're feeling this way. 🤗 Remember, it's okay to have difficult days. Try journaling or talking to a friend. I'm here for you!";
    } else if (message.includes('happy') || message.includes('great') || message.includes('good')) {
        return "That's wonderful! 🎉 Keep riding that positive energy! Maybe celebrate with your favorite song or share your joy with a friend?";
    } else if (message.includes('tired') || message.includes('exhausted')) {
        return "Rest is important! 😴 Make sure you're getting enough sleep. How about some gentle meditation music to help you relax?";
    } else if (message.includes('music') || message.includes('song')) {
        return "🎵 I have the perfect playlist for your mood! Check out the Music tab for personalized suggestions.";
    } else if (message.includes('help')) {
        return "I'm here to support your wellness journey! You can:\n• Track your daily mood\n• Build healthy habits\n• Get music suggestions\n• Connect with friends\nWhat would you like to focus on?";
    } else {
        return "I understand. 💚 Remember to take care of yourself today. Small steps matter! Is there anything specific I can help you with?";
    }
}

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
    const lastMood = localStorage.getItem('lastMood');
    
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
// createMoodBubbles();
