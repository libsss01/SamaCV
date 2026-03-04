const form = document.getElementById('cv-form');
const preview = document.getElementById('cv-preview');

window.addEventListener('DOMContentLoaded', () => {
    addEducation();
    addExperience();
});

function createSection(title, items) {
    let section = document.createElement('div');
    section.classList.add('preview-section');
    let h3 = document.createElement('h3');
    h3.textContent = title;
    section.appendChild(h3);
    items.forEach(item => {
        let p = document.createElement('p');
        p.innerHTML = item;
        section.appendChild(p);
    });
    return section;
}

form.addEventListener('submit', e => {
    e.preventDefault();
    preview.innerHTML = '';

    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const phone = form.querySelector('[name="phone"]').value;
    const address = form.querySelector('[name="address"]').value;

    let personal = document.createElement('div');
    personal.classList.add('preview-section');
    personal.innerHTML = `<h2>${name}</h2>
        <p>${email} | ${phone} | ${address}</p>`;
    preview.appendChild(personal);

    let educItems = [];
    document.querySelectorAll('.edu-entry').forEach(entry => {
        const degree = entry.querySelector('[name="degree"]').value;
        const institution = entry.querySelector('[name="institution"]').value;
        const years = entry.querySelector('[name="edu-years"]').value;
        if (degree || institution) {
            educItems.push(`<strong>${degree}</strong>, ${institution} (${years})`);
        }
    });
    if (educItems.length) {
        preview.appendChild(createSection('Éducation', educItems));
    }

    let expItems = [];
    document.querySelectorAll('.exp-entry').forEach(entry => {
        const role = entry.querySelector('[name="role"]').value;
        const company = entry.querySelector('[name="company"]').value;
        const expYears = entry.querySelector('[name="exp-years"]').value;
        const desc = entry.querySelector('[name="desc"]').value;
        if (role || company) {
            expItems.push(`<strong>${role}</strong> at ${company} (${expYears})<br>${desc}`);
        }
    });
    if (expItems.length) {
        preview.appendChild(createSection('Expérience Professionnelle', expItems));
    }

    const skills = form.querySelector('[name="skills"]').value;
    if (skills) {
        let skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
        if (skillList.length) {
            preview.appendChild(createSection('Compétences', skillList.map(s => `• ${s}`)));
        }
    }

    const interests = form.querySelector('[name="interests"]').value;
    if (interests) {
        let intList = interests.split(',').map(i => i.trim()).filter(Boolean);
        if (intList.length) {
            preview.appendChild(createSection('Centres d\'intérêt', intList.map(i => `• ${i}`)));
        }
    }
});

function addEducation() {
    const container = document.getElementById('education-container');
    const div = document.createElement('div');
    div.classList.add('edu-entry');
    div.innerHTML = `
        <input type="text" name="degree" placeholder="Diplôme / Titre">
        <input type="text" name="institution" placeholder="Établissement">
        <input type="text" name="edu-years" placeholder="Années (e.g., 2020-2023)">
    `;
    container.appendChild(div);
} 

function addExperience() {
    const container = document.getElementById('experience-container');
    const div = document.createElement('div');
    div.classList.add('exp-entry');
    div.innerHTML = `
        <input type="text" name="role" placeholder="Poste / Rôle">
        <input type="text" name="company" placeholder="Entreprise">
        <input type="text" name="exp-years" placeholder="Années (e.g., 2019-2022)">
        <textarea name="desc" placeholder="Description"></textarea>
    `;
    container.appendChild(div);
} 
