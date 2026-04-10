let skills = [];

// 1. Add Skill Logic (Pills)
function addSkill(skill) {
    const cleanSkill = skill.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
        skills.push(cleanSkill);
        renderPills();
    }
    document.getElementById('skillInput').value = '';
}

// Support Enter key for adding skills manually
document.getElementById('skillInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addSkill(e.target.value);
    }
});

function renderPills() {
    const container = document.getElementById('pillsContainer');
    container.innerHTML = skills.map((skill, index) => `
        <div class="pill">
            ${skill} <span onclick="removeSkill(${index})">&times;</span>
        </div>
    `).join('');
}

function removeSkill(index) {
    skills.splice(index, 1);
    renderPills();
}

// 2. Generate Diary (The AI Connection)
async function generate() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const output = document.getElementById('output');
    const btn = document.querySelector('.generate-btn');

    if (!start || !end || skills.length === 0) {
        alert("Please select dates and add at least one skill.");
        return;
    }

    // UI Feedback: Start Loading
    btn.innerText = "Generating Daily Entries...";
    btn.disabled = true;
    output.innerHTML = '<div class="day-card">AI is writing your diary (skipping Sundays)...</div>';

    try {
        // Using relative path '/generate' so it works on any laptop
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                startDate: start, 
                endDate: end, 
                skills: skills 
            })
        });

        const data = await response.json();

        if (data.result) {
            formatOutput(data.result);
        } else {
            output.innerHTML = `<div class="day-card" style="color: red;">Error: ${data.error || "Server issue. Please wait 1 minute."}</div>`;
        }
    } catch (err) {
        output.innerHTML = `<div class="day-card" style="color: red;">Cannot reach server. It might be waking up—try again in 30 seconds!</div>`;
    } finally {
        btn.innerText = "Generate Professional Diary";
        btn.disabled = false;
    }
}

// 3. NEW: Format AI Response into Clean Cards
function formatOutput(text) {
    const output = document.getElementById('output');
    
    // Split the text whenever it finds a date between double asterisks
    const sections = text.split(/(?=\*\*\d{4}-\d{2}-\d{2}\*\*)/g);

    output.innerHTML = sections.map(section => {
        // Skip small chunks or the intro sentence
        if (section.trim().length < 20 || !section.includes('**')) return ''; 

        // Clean up markdown bolding for the UI
        let cleanText = section.replace(/\*\*/g, '');

        return `
            <div class="day-card" style="animation: fadeIn 0.6s ease-out;">
                <div class="day-header">Daily Log Entry</div>
                <div class="content-row">
                    <div class="text-wrap">${cleanText.replace(/\n/g, '<br>')}</div>
                    <button class="copy-small" onclick="copyText(this)">Copy Text</button>
                </div>
            </div>
        `;
    }).join('');
}

// 4. Copy Feature
function copyText(btn) {
    const textContainer = btn.previousElementSibling;
    // We get the text and remove the <br> tags for a clean clipboard paste
    const text = textContainer.innerHTML.replace(/<br>/g, '\n');
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.background = "#28a745";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "#6c757d";
        }, 2000);
    }).catch(err => {
        alert("Oops, couldn't copy. Try selecting the text manually.");
    });
}
