let skills = [];

function addSkill(skill) {
    const cleanSkill = skill.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
        skills.push(cleanSkill);
        renderPills();
    }
    document.getElementById('skillInput').value = '';
}

document.getElementById('skillInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(e.target.value); }
});

function renderPills() {
    const container = document.getElementById('pillsContainer');
    container.innerHTML = skills.map((skill, index) => `
        <div class="pill">${skill} <span onclick="removeSkill(${index})">&times;</span></div>
    `).join('');
}

function removeSkill(index) {
    skills.splice(index, 1);
    renderPills();
}

async function generate() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const output = document.getElementById('output');
    const btn = document.querySelector('.generate-btn');

    if (!start || !end || skills.length === 0) {
        alert("Please select dates and add skills.");
        return;
    }

    btn.innerText = "Generating...";
    btn.disabled = true;
    output.innerHTML = '<div style="text-align:center;">Organizing your sketch cards...</div>';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: start, endDate: end, skills: skills })
        });

        const data = await response.json();
        if (data.result) {
            formatOutput(data.result);
        } else {
            output.innerHTML = "Error: Check your Render API Key.";
        }
    } catch (err) {
        output.innerHTML = "Server waking up. Refresh in 30 seconds.";
    } finally {
        btn.innerText = "Generate Professional Diary";
        btn.disabled = false;
    }
}

function formatOutput(text) {
    const output = document.getElementById('output');
    
    // Split text by the date pattern
    const days = text.split(/(?=\*\*\d{4}-\d{2}-\d{2}\*\*)/g);

    output.innerHTML = days.map(day => {
        if (day.trim().length < 20) return '';

        const dateMatch = day.match(/\*\*(.*?)\*\*/);
        const dateStr = dateMatch ? dateMatch[1] : "Entry";

        // --- NEW TOUGH LOGIC ---
        // We split the string by the names of the labels themselves
        let workText = "No summary found.";
        let learnText = "No outcome found.";

        const workSplit = day.split(/Work Summary:?/i);
        if (workSplit.length > 1) {
            const learnSplit = workSplit[1].split(/Learning\/Outcome:?/i);
            workText = learnSplit[0].trim();
            if (learnSplit.length > 1) {
                learnText = learnSplit[1].trim();
            }
        }

        // Remove any leftover AI bolding (**)
        workText = workText.replace(/\*\*/g, '').replace(/^\*/, '').trim();
        learnText = learnText.replace(/\*\*/g, '').replace(/^\*/, '').trim();

        return `
            <div class="day-container">
                <div class="date-header">${dateStr}</div>
                
                <div class="sketch-card">
                    <div class="section-content">
                        <span class="label">work summary:</span><br>
                        <span class="content-text">${workText.replace(/\n/g, '<br>')}</span>
                    </div>
                    <button class="centered-copy-btn" onclick="copySketchText(this)">COPY</button>
                </div>

                <div class="sketch-card">
                    <div class="section-content">
                        <span class="label">learning/outcome:</span><br>
                        <span class="content-text">${learnText.replace(/\n/g, '<br>')}</span>
                    </div>
                    <button class="centered-copy-btn" onclick="copySketchText(this)">COPY</button>
                </div>
            </div>
        `;
    }).join('');
}

function copySketchText(btn) {
    const card = btn.closest('.sketch-card');
    const textSpan = card.querySelector('.content-text');
    const textToCopy = textSpan.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "COPIED!";
        btn.style.background = "#28a745";
        btn.style.color = "#fff";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "#f8f9fa";
            btn.style.color = "#333";
        }, 2000);
    });
}
