let skills = [];

function addSkill(skill) {
    const clean = skill.trim();
    if (clean && !skills.includes(clean)) {
        skills.push(clean);
        renderPills();
    }
    document.getElementById('skillInput').value = '';
}

function renderPills() {
    document.getElementById('pillsContainer').innerHTML = skills.map((s, i) => 
        `<div class="pill">${s} <span onclick="removeSkill(${i})" style="cursor:pointer;color:red;margin-left:8px;">&times;</span></div>`
    ).join('');
}

function removeSkill(i) { skills.splice(i, 1); renderPills(); }

async function generate() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const output = document.getElementById('output');
    const btn = document.querySelector('.generate-btn');

    if (!start || !end || skills.length === 0) return alert("Fill all fields!");

    btn.innerText = "Connecting to Gemini...";
    btn.disabled = true;
    output.innerHTML = '<div style="text-align:center; padding:20px;">AI is writing entries...</div>';

    try {
        const res = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: start, endDate: end, skills: skills })
        });
        
        const data = await res.json();
        
        if (data.error) {
            output.innerHTML = `
                <div style="color:red; text-align:center; padding:20px; border: 1.5px solid red; border-radius:15px; background:#fffafa;">
                    <strong>${data.error}</strong><br><small>Reason: ${data.details}</small>
                </div>`;
        } else {
            formatOutput(data.result);
        }
    } catch (e) {
        output.innerHTML = "Network Error. Check if Render is Live.";
    } finally {
        btn.innerText = "Generate Professional Diary";
        btn.disabled = false;
    }
}

function formatOutput(text) {
    const output = document.getElementById('output');
    const days = text.split(/DATE:/i);

    output.innerHTML = days.map(day => {
        if (day.trim().length < 15) return '';

        const lines = day.trim().split('\n');
        const dateStr = lines[0].replace(/\*/g, '').trim();

        let workText = "No summary found.";
        let learnText = "No outcome found.";

        const workSplit = day.split(/WORK:/i);
        if (workSplit.length > 1) {
            const learnSplit = workSplit[1].split(/LEARN:/i);
            workText = learnSplit[0].trim().replace(/\*\*/g, '');
            if (learnSplit.length > 1) {
                learnText = learnSplit[1].trim().replace(/\*\*/g, '');
            }
        }

        return `
            <div class="day-container">
                <div class="date-header">${dateStr}</div>
                <div class="sketch-card">
                    <div class="section-content"><span class="label">work summary:</span><br><span class="txt">${workText}</span></div>
                    <button class="centered-copy-btn" onclick="copyText(this)">COPY</button>
                </div>
                <div class="sketch-card">
                    <div class="section-content"><span class="label">learning/outcome:</span><br><span class="txt">${learnText}</span></div>
                    <button class="centered-copy-btn" onclick="copyText(this)">COPY</button>
                </div>
            </div>`;
    }).join('');
}

function copyText(btn) {
    const text = btn.previousElementSibling.querySelector('.txt').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const oldText = btn.innerText;
        btn.innerText = "COPIED!";
        setTimeout(() => btn.innerText = oldText, 2000);
    });
}
