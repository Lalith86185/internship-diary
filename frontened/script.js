let selectedSkills = new Set();

function addSkill(skill) {
    skill = skill.trim();
    if (skill && !selectedSkills.has(skill)) {
        selectedSkills.add(skill);
        renderPills();
    }
    document.getElementById('skillInput').value = '';
}

function removeSkill(skill) {
    selectedSkills.delete(skill);
    renderPills();
}

function renderPills() {
    const container = document.getElementById('pillsContainer');
    container.innerHTML = '';
    selectedSkills.forEach(skill => {
        const pill = document.createElement('div');
        pill.className = 'pill';
        pill.innerHTML = `${skill} <span onclick="removeSkill('${skill}')">&times;</span>`;
        container.appendChild(pill);
    });
}

// Support for typing and pressing Enter
document.getElementById('skillInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addSkill(e.target.value);
    }
});

async function generate() {
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const outputDiv = document.getElementById("output");

    if (!start || !end || selectedSkills.size === 0) {
        alert("Please provide dates and skills!");
        return;
    }

    outputDiv.innerHTML = "<p>Generating Diary... ⏳</p>";

    try {
        const res = await fetch("http://localhost:5000/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                skills: Array.from(selectedSkills), 
                startDate: start, 
                endDate: end 
            })
        });
        const data = await res.json();
        renderOutput(data.result);
    } catch (e) {
        outputDiv.innerHTML = "<p style='color:red'>Server Error. Ensure backend is running.</p>";
    }
}

function renderOutput(text) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = "";
    const blocks = text.split(/\n(?=\d{4}-\d{2}-\d{2})/);

    blocks.forEach(block => {
        const card = document.createElement('div');
        card.className = "day-card";
        const lines = block.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim().replace(/\*/g, '');
            if (!trimmed) return;

            if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
                card.innerHTML += `<div class="day-header">${trimmed}</div>`;
            } else if (trimmed.includes(':')) {
                const parts = trimmed.split(':');
                const label = parts[0] + ":";
                const content = parts.slice(1).join(':').trim();

                const row = document.createElement('div');
                row.className = "content-row";
                row.innerHTML = `
                    <div class="text-wrap"><strong>${label}</strong> ${content}</div>
                    <button class="copy-small" onclick="copyText('${content}', this)">Copy</button>
                `;
                card.appendChild(row);
            }
        });
        outputDiv.appendChild(card);
    });
}

function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.background = "#28a745";
        setTimeout(() => {
            btn.innerText = original;
            btn.style.background = "#6c757d";
        }, 1200);
    });
}