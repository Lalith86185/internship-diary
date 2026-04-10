let skills = [];

// 1. Skill Pill Logic
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

// 2. Main Generation Function
async function generate() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const output = document.getElementById('output');
    const btn = document.querySelector('.generate-btn');

    if (!start || !end || skills.length === 0) {
        alert("Please select dates and add skills.");
        return;
    }

    btn.innerText = "Organizing Sections...";
    btn.disabled = true;
    output.innerHTML = '<div class="day-card">AI is generating and highlighting your entries...</div>';

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
            output.innerHTML = "Error: Ensure your API key is set in Render.";
        }
    } catch (err) {
        output.innerHTML = "Backend is sleeping. Please wait 1 minute and refresh.";
    } finally {
        btn.innerText = "Generate Professional Diary";
        btn.disabled = false;
    }
}

// 3. Formatting Logic (Highlights & Separate Buttons)
function formatOutput(text) {
    const output = document.getElementById('output');
    
    // Split text by the date pattern **YYYY-MM-DD**
    const days = text.split(/(?=\*\*\d{4}-\d{2}-\d{2}\*\*)/g);

    output.innerHTML = days.map(day => {
        if (day.trim().length < 20) return '';

        // Extract Date String
        const dateMatch = day.match(/\*\*(.*?)\*\*/);
        const dateStr = dateMatch ? dateMatch[1] : "Entry Log";

        // Extract Work Summary Section
        // Looks for text between "Work Summary:**" and "Learning/Outcome:**"
        const workMatch = day.match(/Work Summary:\*\*(.*?)(?=Learning\/Outcome:|$)/s);
        let workText = workMatch ? workMatch[1].trim() : "No summary generated.";

        // Extract Learning/Outcome Section
        // Looks for text after "Learning/Outcome:**"
        const learnMatch = day.match(/Learning\/Outcome:\*\*(.*?)$/s);
        let learnText = learnMatch ? learnMatch[1].trim() : "No outcome generated.";

        return `
            <div class="day-card" style="border-top: 5px solid #007bff; margin-bottom: 25px;">
                <div style="font-size: 1.1rem; font-weight: bold; color: #007bff; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    📅 ${dateStr}
                </div>
                
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 0.8rem; font-weight: bold; color: #555; margin-bottom: 5px;">🛠 WORK SUMMARY</div>
                    <div class="text-wrap" style="background: #f0f7ff; padding: 12px; border-radius: 8px; border-left: 5px solid #007bff; color: #333;">
                        ${workText.replace(/\n/g, '<br>')}
                    </div>
                    <button class="copy-small" style="width: 100%; margin-top: 8px; background: #007bff;" onclick="copySection(this)">Copy Work Summary</button>
                </div>

                <div>
                    <div style="font-size: 0.8rem; font-weight: bold; color: #555; margin-bottom: 5px;">💡 LEARNING & OUTCOME</div>
                    <div class="text-wrap" style="background: #f2fcf2; padding: 12px; border-radius: 8px; border-left: 5px solid #28a745; color: #333;">
                        ${learnText.replace(/\n/g, '<br>')}
                    </div>
                    <button class="copy-small" style="width: 100%; margin-top: 8px; background: #28a745;" onclick="copySection(this)">Copy Learning/Outcome</button>
                </div>
            </div>
        `;
    }).join('');
}

// 4. Enhanced Copy Logic
function copySection(btn) {
    const textBlock = btn.previousElementSibling;
    // Get text but clean up the <br> tags for clean pasting
    const textToCopy = textBlock.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.innerText;
        const originalBg = btn.style.background;
        
        btn.innerText = "✅ Successfully Copied!";
        btn.style.background = "#333";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = originalBg;
        }, 2000);
    }).catch(err => {
        console.error('Copy failed', err);
    });
}
