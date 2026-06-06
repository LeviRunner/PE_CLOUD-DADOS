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
  const stat = document.getElementById('courseStat');
  const taskList = document.getElementById('taskList');
  const overviewList = document.getElementById('overviewList');

  if (heading) heading.textContent = `${currentCourse.name} — Dashboard`;
  if (sub) sub.textContent = `${currentCourse.focus} · ${currentCourse.duration}`;
  if (stat) stat.textContent = `${currentProgress}% completo`;

  if (taskList) {
    taskList.innerHTML = currentCourse.tasks.map((task) => `
      <article class="task-item">
        <input type="checkbox" ${task.status !== 'Planejado' ? 'checked' : ''}>
        <div>
          <strong>${task.title}</strong>
          <div class="task-pill">${task.status}</div>
        </div>
        <span class="tag">${task.status === 'Meta' ? 'Meta' : 'Curso'}</span>
      </article>
    `).join('');
  }

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

function init() {
  initMenu();
  renderCourseSelector();
  renderDashboard();
}

window.addEventListener('DOMContentLoaded', init);
