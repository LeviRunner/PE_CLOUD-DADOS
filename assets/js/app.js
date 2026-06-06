const COURSES = [
  { id: 'cloud', name: 'Cloud Computing', focus: 'Estudos, cursos e certificações em cloud', duration: '4-6 meses', tasks: [
    { id: 'cloud-aws', title: 'Fundamentos de AWS', status: 'Em andamento' },
    { id: 'cloud-azure', title: 'Introdução a Azure', status: 'Planejado' },
    { id: 'cloud-cert', title: 'Certificação Cloud Practitioner', status: 'Meta' }
  ]},
  { id: 'data', name: 'Ciência de Dados', focus: 'Estudos, cursos e certificações em dados', duration: '6-8 meses', tasks: [
    { id: 'data-python', title: 'Python para dados', status: 'Em andamento' },
    { id: 'data-sql', title: 'SQL e modelagem', status: 'Planejado' },
    { id: 'data-cert', title: 'Certificação Analytics', status: 'Meta' }
  ]},
  { id: 'infra', name: 'Infraestrutura', focus: 'Estudos, cursos e certificações em infra', duration: '4-6 meses', tasks: [
    { id: 'infra-linux', title: 'Linux e shell', status: 'Em andamento' },
    { id: 'infra-docker', title: 'Containers e Docker', status: 'Planejado' },
    { id: 'infra-cert', title: 'Certificação DevOps Essentials', status: 'Meta' }
  ]}
];

const STORAGE_KEY = 'study-tracker-selected-course';
const COURSE_PROGRESS_KEY = 'study-tracker-progress';

function initMenu() {
  const btn = document.getElementById('menuBtn');
  const panel = document.getElementById('mobileNav');
  if (!btn || !panel) return;
  btn.addEventListener('click', () => panel.classList.toggle('open'));
  panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => panel.classList.remove('open')));
}

function renderCourseSelector() {
  const select = document.getElementById('courseSelect');
  const chips = document.getElementById('courseChips');
  if (!select && !chips) return;

  const saved = localStorage.getItem(STORAGE_KEY) || COURSES[0].id;
  const courseOptions = COURSES.map((course) => `<option value="${course.id}" ${saved === course.id ? 'selected' : ''}>${course.name}</option>`).join('');
  if (select) select.innerHTML = courseOptions;
  if (chips) {
    chips.innerHTML = COURSES.map((course) => `<button class="chip ${saved === course.id ? 'active' : ''}" data-course="${course.id}">${course.name}</button>`).join('');
    chips.querySelectorAll('.chip').forEach((chip) => chip.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, chip.dataset.course);
      renderDashboard();
      renderCourseSelector();
    }));
  }
  if (select) {
    select.addEventListener('change', (event) => {
      localStorage.setItem(STORAGE_KEY, event.target.value);
      renderDashboard();
      renderCourseSelector();
    });
  }
}

function renderDashboard() {
  const selected = localStorage.getItem(STORAGE_KEY) || COURSES[0].id;
  const currentCourse = COURSES.find((course) => course.id === selected) || COURSES[0];
  const currentProgress = Math.round((currentCourse.tasks.filter((task) => task.status !== 'Planejado').length / currentCourse.tasks.length) * 100);

  const heading = document.getElementById('courseHeading');
  const sub = document.getElementById('courseSub');
  const overviewList = document.getElementById('overviewList');

  if (heading) heading.textContent = `${currentCourse.name} — Dashboard`;
  if (sub) sub.textContent = `${currentCourse.focus} · ${currentCourse.duration}`;

  if (overviewList) {
    overviewList.innerHTML = COURSES.map((course) => {
      const completion = Math.round((course.tasks.filter((task) => task.status !== 'Planejado').length / course.tasks.length) * 100);
      return `
        <article class="course-card ${course.id === selected ? 'active' : ''}">
          <div class="badge">${course.duration}</div>
          <h3>${course.name}</h3>
          <p class="muted">${course.focus}</p>
          <div class="progress-row"><strong>${completion}%</strong><span class="muted">${course.tasks.length} tarefas</span></div>
          <div class="progress-bar"><span style="width:${completion}%"></span></div>
        </article>`;
    }).join('');
  }
}

function updateCourseProgress() {
  const checkboxes = document.querySelectorAll('.task-checkbox');
  if (!checkboxes.length) return;

  const completed = Array.from(checkboxes).filter((checkbox) => checkbox.checked).length;
  const total = checkboxes.length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  const label = document.getElementById('courseProgressLabel');
  const bar = document.getElementById('courseProgressBar');

  if (label) label.textContent = `${completed}/${total} concluídos`;
  if (bar) bar.style.width = `${percentage}%`;
}

function loadCourseProgress() {
  const saved = JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY) || '{}');
  document.querySelectorAll('.task-checkbox').forEach((checkbox) => {
    checkbox.checked = Boolean(saved[checkbox.dataset.id]);
  });
  updateCourseProgress();
}

function saveCourseProgress(event) {
  const checkbox = event.target;
  const progress = JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY) || '{}');
  progress[checkbox.dataset.id] = checkbox.checked;
  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));
  updateCourseProgress();
}

function initCourseChecklist() {
  loadCourseProgress();
  document.querySelectorAll('.task-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', saveCourseProgress);
  });
}

function init() {
  initMenu();
  renderCourseSelector();
  renderDashboard();
  initCourseChecklist();
}

window.addEventListener('DOMContentLoaded', init);
