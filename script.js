const TEMPLATES = ['classic', 'split', 'timeline', 'cards'];
const TEMPLATE_STORAGE_KEY = 'samacv.template';

const form = document.getElementById('cv-form');
const preview = document.getElementById('cv-preview');
const templateSelect = document.getElementById('template-select');
const downloadBtn = document.getElementById('download-btn');

const templateAccent = {
    classic: [74, 144, 226],
    split: [124, 58, 237],
    timeline: [5, 150, 105],
    cards: [234, 88, 12]
};

window.addEventListener('DOMContentLoaded', () => {
    addEducation();
    addExperience();

    const savedTemplate = window.localStorage.getItem(TEMPLATE_STORAGE_KEY) || 'classic';
    setTemplate(savedTemplate);
    if (templateSelect) templateSelect.value = preview.dataset.template;

    renderPreview();
});

let renderTimer;

function scheduleRender() {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderPreview, 60);
}

function setTemplate(templateId) {
    const safe = TEMPLATES.includes(templateId) ? templateId : 'classic';
    preview.dataset.template = safe;
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
}

function sanitizeFileName(value) {
    const cleaned = String(value || '')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return (cleaned || 'SamaCV').slice(0, 60);
}

function valueOf(name) {
    const input = form.querySelector(`[name="${name}"]`);
    return (input?.value || '').trim();
}

function csvList(text) {
    return String(text || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

function readCvData() {
    const personal = {
        name: valueOf('name'),
        email: valueOf('email'),
        phone: valueOf('phone'),
        address: valueOf('address')
    };

    const education = [...form.querySelectorAll('.edu-entry')]
        .map(entry => ({
            degree: (entry.querySelector('[name="degree"]')?.value || '').trim(),
            institution: (entry.querySelector('[name="institution"]')?.value || '').trim(),
            years: (entry.querySelector('[name="edu-years"]')?.value || '').trim()
        }))
        .filter(e => e.degree || e.institution || e.years);

    const experience = [...form.querySelectorAll('.exp-entry')]
        .map(entry => ({
            role: (entry.querySelector('[name="role"]')?.value || '').trim(),
            company: (entry.querySelector('[name="company"]')?.value || '').trim(),
            years: (entry.querySelector('[name="exp-years"]')?.value || '').trim(),
            desc: (entry.querySelector('[name="desc"]')?.value || '').trim()
        }))
        .filter(e => e.role || e.company || e.years || e.desc);

    const skills = csvList(valueOf('skills'));
    const interests = csvList(valueOf('interests'));

    const hasAnyContent = Boolean(
        personal.name || personal.email || personal.phone || personal.address ||
        education.length || experience.length ||
        skills.length || interests.length
    );

    return { personal, education, experience, skills, interests, hasAnyContent };
}

function setDownloadEnabled(enabled) {
    if (downloadBtn) downloadBtn.disabled = !enabled;
}

function renderPreview() {
    preview.innerHTML = '';

    const data = readCvData();
    setDownloadEnabled(data.hasAnyContent);

    if (!data.hasAnyContent) {
        preview.appendChild(el('p', 'muted', 'Remplissez le formulaire à gauche pour générer votre CV ici.'));
        return;
    }

    const { personal, education, experience, skills, interests } = data;

    const doc = el('article', 'cv-document');
    doc.setAttribute('role', 'document');

    const header = el('header', 'cv-header');
    header.appendChild(el('div', 'cv-name', personal.name || 'Nom complet'));

    const contacts = [personal.email, personal.phone, personal.address].filter(Boolean);
    const chips = el('div', 'cv-contacts');
    contacts.forEach(c => chips.appendChild(el('span', 'cv-chip', c)));
    header.appendChild(chips);
    doc.appendChild(header);

    const content = el('div', 'cv-content');

    if (experience.length) {
        const section = el('section', 'cv-section');
        section.dataset.section = 'experience';
        section.appendChild(el('h3', 'cv-section-title', 'Expérience'));

        const items = el('div', 'cv-items');
        experience.forEach(x => {
            const item = el('div', 'cv-item');
            item.appendChild(el('div', 'cv-item-title', [x.role, x.company].filter(Boolean).join(' — ') || 'Expérience'));
            if (x.years) item.appendChild(el('div', 'cv-item-meta', x.years));
            if (x.desc) item.appendChild(el('div', 'cv-item-desc', x.desc));
            items.appendChild(item);
        });
        section.appendChild(items);
        content.appendChild(section);
    }

    if (education.length) {
        const section = el('section', 'cv-section');
        section.dataset.section = 'education';
        section.appendChild(el('h3', 'cv-section-title', 'Éducation'));

        const items = el('div', 'cv-items');
        education.forEach(x => {
            const item = el('div', 'cv-item');
            item.appendChild(el('div', 'cv-item-title', x.degree || 'Diplôme'));
            const meta = [x.institution, x.years].filter(Boolean).join(' · ');
            if (meta) item.appendChild(el('div', 'cv-item-meta', meta));
            items.appendChild(item);
        });
        section.appendChild(items);
        content.appendChild(section);
    }

    if (skills.length || interests.length) {
        const section = el('section', 'cv-section');
        section.dataset.section = 'sidebar';
        section.appendChild(el('h3', 'cv-section-title', 'Atouts'));

        function tagBlock(title, tags) {
            if (!tags.length) return;
            const block = el('div', 'cv-block');
            block.appendChild(el('div', 'cv-item-title', title));
            const wrap = el('div', 'cv-tags');
            tags.forEach(t => wrap.appendChild(el('span', 'cv-tag', t)));
            block.appendChild(wrap);
            section.appendChild(block);
        }

        tagBlock('Compétences', skills);
        tagBlock("Centres d'intérêt", interests);
        content.appendChild(section);
    }

    doc.appendChild(content);
    preview.appendChild(doc);
}

function downloadPdf() {
    const data = readCvData();
    if (!data.hasAnyContent) {
        window.alert('Remplissez le formulaire avant de télécharger.');
        return;
    }

    const jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPDF) {
        window.alert("jsPDF n'est pas disponible. Vérifiez votre connexion internet puis rechargez la page.");
        return;
    }

    const template = preview.dataset.template || 'classic';
    const accent = templateAccent[template] || templateAccent.classic;
    const filename = `CV-${sanitizeFileName(data.personal.name)}.pdf`;

    setDownloadEnabled(false);
    try {
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        renderPdf(pdf, data, accent);
        pdf.save(filename);
    } finally {
        setDownloadEnabled(true);
    }
}

function renderPdf(pdf, data, accent) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const maxWidth = pageWidth - margin * 2;

    let y = 16;

    function ensureSpace(needed) {
        if (y + needed > pageHeight - margin) {
            pdf.addPage();
            y = margin;
        }
    }

    function write(text, size, bold, color, lineGap) {
        if (!text) return;
        const gap = lineGap ?? 4.6;
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(size);
        if (color) pdf.setTextColor(color[0], color[1], color[2]);
        else pdf.setTextColor(31, 41, 55);

        const lines = pdf.splitTextToSize(text, maxWidth);
        for (let i = 0; i < lines.length; i++) {
            ensureSpace(gap + 1);
            pdf.text(lines[i], margin, y);
            y += gap;
        }
    }

    function sectionTitle(title) {
        ensureSpace(10);
        y += 2;
        pdf.setDrawColor(accent[0], accent[1], accent[2]);
        pdf.setLineWidth(0.8);
        pdf.line(margin, y - 3.5, margin + 10, y - 3.5);
        write(title.toUpperCase(), 11, true, accent, 5.2);
        y += 1;
    }

    // Header
    write(data.personal.name || 'Nom complet', 18, true, null, 6.4);
    const contacts = [data.personal.email, data.personal.phone, data.personal.address].filter(Boolean).join(' | ');
    if (contacts) write(contacts, 10, false, [107, 114, 128], 4.8);
    y += 2;

    if (data.experience.length) {
        sectionTitle('Expérience');
        data.experience.forEach(x => {
            write([x.role, x.company].filter(Boolean).join(' — ') || 'Expérience', 12, true, null, 5.2);
            if (x.years) write(x.years, 10, false, [107, 114, 128], 4.6);
            if (x.desc) write(x.desc, 10.5, false, [55, 65, 81], 4.6);
            y += 2;
        });
    }

    if (data.education.length) {
        sectionTitle('Éducation');
        data.education.forEach(x => {
            write(x.degree || 'Diplôme', 12, true, null, 5.2);
            const meta = [x.institution, x.years].filter(Boolean).join(' · ');
            if (meta) write(meta, 10, false, [107, 114, 128], 4.6);
            y += 2;
        });
    }

    if (data.skills.length || data.interests.length) {
        sectionTitle('Compétences & intérêts');
        if (data.skills.length) write('Compétences : ' + data.skills.join(', '), 10.5, false, null, 4.8);
        if (data.interests.length) write("Centres d'intérêt : " + data.interests.join(', '), 10.5, false, null, 4.8);
    }
}

form.addEventListener('submit', e => {
    e.preventDefault();
    renderPreview();
});
form.addEventListener('input', scheduleRender);
form.addEventListener('change', scheduleRender);

if (templateSelect) {
    templateSelect.addEventListener('change', () => {
        setTemplate(templateSelect.value);
        window.localStorage.setItem(TEMPLATE_STORAGE_KEY, preview.dataset.template);
        renderPreview();
    });
}

if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPdf);
}

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
    scheduleRender();
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
    scheduleRender();
} 
