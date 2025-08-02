// ===== LANGUAGE TOGGLE FUNCTIONALITY ===== //
const translations = {
    en: {
        subtitle: "Upload photo/video → Detect if it's real or fake in 10 seconds!",
        detectBtn: "Start Detection",
        resultHeader: "Result:",
        resultDefault: "Please select a file...",
        checking: "Checking in progress... Please wait",
        confidenceValue: "Confidence: 0%",
        footerText: "⚠️ Note: This is a basic version (30s max video length)",
        authentic: "✅ Authentic media (confidence: ",
        fake: "⚠️ Warning: Likely fake (confidence: ",
        error: "Error: Detection failed"
    },
    hi: {
        subtitle: "फ़ोटो/वीडियो अपलोड करें → 10 सेकंड में पता करें असली है या नकली!",
        detectBtn: "जाँच शुरू करें",
        resultHeader: "परिणाम:",
        resultDefault: "कृपया फाइल चुनें...",
        checking: "जाँच चल रही है... कृपया प्रतीक्षा करें",
        confidenceValue: "विश्वास: 0%",
        footerText: "⚠️ सावधानी: यह बेसिक संस्करण है (30 सेकंड तक वीडियो)",
        authentic: "✅ असली मीडिया (विश्वास: ",
        fake: "⚠️ चेतावनी: संभावित नकली (विश्वास: ",
        error: "त्रुटि: जाँच असफल रही"
    }
};

let currentLang = 'hi';

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('subtitle').textContent = translations[lang].subtitle;
    document.getElementById('detectBtnText').textContent = translations[lang].detectBtn;
    document.getElementById('resultHeader').textContent = translations[lang].resultHeader;
    document.getElementById('confidenceValue').textContent = translations[lang].confidenceValue;
    document.getElementById('footerText').textContent = translations[lang].footerText;
    document.getElementById('loadingText').textContent = translations[lang].checking;
    
    // Update buttons
    document.getElementById('hindiBtn').classList.toggle('active', lang === 'hi');
    document.getElementById('englishBtn').classList.toggle('active', lang === 'en');
    
    // Reset result text
    document.getElementById('resultText').textContent = translations[lang].resultDefault;
}

// Setup language buttons
document.getElementById('hindiBtn').addEventListener('click', () => setLanguage('hi'));
document.getElementById('englishBtn').addEventListener('click', () => setLanguage('en'));

// Initialize with Hindi
setLanguage('hi');

// ===== ADD THIS INSIDE YOUR detectDeepfake FUNCTION ===== //
// Replace your result display code with this:

// Inside your detectDeepfake function after getting confidence score:
const isFake = confidence > 0.7;
const resultText = isFake ? 
    translations[currentLang].fake + Math.round(confidence*100) + '%)' : 
    translations[currentLang].authentic + Math.round((1-confidence)*100) + '%)';

document.getElementById('resultText').textContent = resultText;

// ===== UPDATE YOUR LOADING MESSAGES ===== //
// Replace all hardcoded Hindi text with translations[currentLang].*
// Example:
document.getElementById('resultText').textContent = translations[currentLang].checking;