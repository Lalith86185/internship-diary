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

// Support Enter key for adding skills
document.getElementById('skillInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSkill(e.target.value);
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

    // Validation
    if (!start || !end || skills.length === 0) {
        alert("Please select dates and add at least one skill.");
        return;
    }

    // UI Feedback: Start Loading
    btn.innerText = "Generating Daily Entries...";
    btn.disabled = true;
    output.innerHTML = '<div class="day-card">AI is writing your diary (skipping Sundays)...</div>';

    try {
        // USE RELATIVE PATH '/generate' - This is the secret to making it work on all laptops
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
            output.innerHTML = `<div class="day-card" style="color: red;">Error: ${data.error || "Server issue. Please wait 1 minute and try again."}</div>`;
        }
    } catch (err) {
        console.error("Fetch error:", err);
        output.innerHTML = `<div class="day-card" style="color: red;">Cannot reach server. It might be waking up—please wait 30 seconds and try again!</div>`;
    } finally {
        // UI Feedback: Stop Loading
        btn.innerText = "Generate Professional Diary";
        btn.disabled = false;
    }
}

// 3. Format AI Response into Clean Cards
function formatOutput(text) {
    const output = document.getElementById('output');
    
    // Splits by "Date:" to create separate cards for each day
    const days = text.split(/(?=Date:)/g);

    output.innerHTML = days.map(day => {
        if (day.trim().length < 5) return ''; 

        return `
            <div class="day-card">
                <div class="day-header">Entry Log</div>
                <div class="content-row">
                    <div class="text-wrap">${day.replace(/\n/g, '<br>')}</div>
                    <button class="copy-small" onclick="copyText(this)">Copy Text</button>
                </div>
            </div>
        `;
    }).join('');
}

// 4. Copy Feature
function copyText(btn) {
    const text = btn.previousElementSibling.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.background = "#28a745";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "#6c757d";
        }, 2000);
    });
}
