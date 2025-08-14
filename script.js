// --- ESTADO GLOBAL E CONFIGURAÇÕES ---
const state = {
    questions: [], costParameters: {}, answers: {},
    currentUser: null, processHistory: [], allUsers: []
};

// --- DADOS PADRÃO ---
const defaultUsers = [
    { name: 'Sandro Sousa dos Anjos', username: 'sandro.anjos', role: 'admin', password: null },
    { name: 'Alisson Rafael Siliprandi Haubert', username: 'alisson.haubert', role: 'user', password: null },
    { name: 'Lucas William Garstka', username: 'lucas.garstka', role: 'user', password: null },
    { name: 'Marcelo Goulart Rodrigues', username: 'marcelo.goulart', role: 'user', password: null },
    { name: 'Rafael Shono', username: 'rafael.shono', role: 'user', password: null },
    { name: 'Thais Aparecida Lourenco', username: 'thais.lourenco', role: 'user', password: null },
    { name: 'Marco Antonio Raspini da Silva', username: 'marco.raspini', role: 'user', password: null },
    { name: 'Marcos Paulo Macedo', username: 'marcos.macedo', role: 'user', password: null },
    { name: 'Mateus Mattielo Nickhorn', username: 'mateus.mattielo', role: 'user', password: null }
];

const defaultQuestions = [
    { id: 1, category: 'Potencial e Adequação', targetScore: 'adequacao', type: 'multiple_choice', text: 'O processo é operacional/repetitivo ou estratégico/analítico?', options: [{ text: 'Totalmente operacional', weight: 10 }, { text: 'Misto', weight: 6 }, { text: 'Estratégico', weight: 3 }] },
    { id: 2, category: 'Potencial e Adequação', targetScore: 'adequacao', type: 'multiple_choice', text: 'Qual o volume de transações manuais por dia?', options: [{ text: 'Muito Alto (500+)', weight: 10 }, { text: 'Alto (100-500)', weight: 8 }, { text: 'Médio (20-100)', weight: 5 }, { text: 'Baixo (1-20)', weight: 2 }] },
    { id: 4, category: 'Potencial e Adequação', type: 'numeric', text: 'Tempo total gasto no processo (Horas por Ano)', key: 'total_time_as_is', unit: 'h/ano' },
    { id: 5, category: 'Potencial e Adequação', type: 'cost', text: 'Custo anual do processo (COMO ESTÁ)', key: 'annual_cost_as_is', unit: 'R$' },
    { id: 6, category: 'Facilidade e Prontidão', targetScore: 'prontidao', type: 'multiple_choice', text: 'Os dados de entrada são estruturados e digitais?', options: [{ text: 'Sim, 100% estruturados', weight: 10 }, { text: 'Maioria estruturados', weight: 7 }, { text: 'Não estruturados (PDF, imagem)', weight: 2 }] },
    { id: 8, category: 'Facilidade e Prontidão', targetScore: 'prontidao', type: 'multiple_choice', text: 'As regras do processo são bem definidas e estáveis?', options: [{ text: 'Sim, totalmente baseadas em regras', weight: 10 }, { text: 'Maioria baseada em regras', weight: 7 }, { text: 'Exige muito julgamento humano', weight: 1 }] },
    { id: 10, category: 'Informações para Custo', type: 'numeric', text: 'Horas de desenvolvimento estimadas', key: 'dev_hours', unit: 'horas' },
    { id: 11, category: 'Informações para Custo', type: 'multiple_choice', text: 'Tecnologia principal', key: 'tech', options: [{ text: 'UiPath', weight: 0 }, { text: 'Python', weight: 0 }] },
];

const defaultCostParameters = { devHourCost: 150, uipathLicenseCost: 10000, pythonLicenseCost: 0, infraCost: 5000 };

/**
 * Função centralizada para renderizar os ícones do Feather.
 */
function renderIcons() {
    setTimeout(() => feather.replace(), 0);
}

// --- LÓGICA DE INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = document.body.classList.contains('login-body');
    
    if (isLoginPage) {
        setupLoginEventListeners();
    } else {
        try {
            mainAppInit();
        } catch (error) {
            console.error("Erro CRÍTICO ao inicializar a aplicação:", error);
            document.body.innerHTML = `<div style="padding: 2rem; text-align: center;"><h1>Ocorreu um erro grave</h1><p>A aplicação não pôde ser carregada. Por favor, verifique o console do navegador (F12).</p></div>`;
        }
    }
});

/**
 * Inicializa a página principal (home.html)
 */
function mainAppInit() {
    checkLogin();
    loadData();
    setupHomeEventListeners();
    showPage('home-page');
    
    const loader = document.getElementById('loader');
    const appContent = document.getElementById('app-content');

    if (loader) {
        // CORREÇÃO: Torna o loader "não-clicável" imediatamente
        loader.style.pointerEvents = 'none';
        loader.style.opacity = '0';
        // Garante que o loader seja removido da tela após a animação
        setTimeout(() => {
            loader.style.display = 'none';
        }, 600); // 600ms é um tempo seguro para a transição de opacidade terminar
    }
    
    if (appContent) {
        appContent.classList.remove('hidden');
    }
}

function setupHomeEventListeners() {
    // Esta função foi deixada vazia pois os cliques são gerenciados pelo 'onclick' no HTML,
    // mas pode ser usada para outros eventos no futuro.
}

function setupLoginEventListeners() {
    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
    document.getElementById('create-password-btn')?.addEventListener('click', handleCreatePassword);
    document.getElementById('username')?.addEventListener('input', checkUserStatus);
    document.getElementById('new-password')?.addEventListener('input', checkPasswordStrength);
    checkUserStatus();
}

function checkUserStatus() {
    const users = getUsers();
    const usernameInput = document.getElementById('username');
    if (!usernameInput) return;

    const user = users.find(u => u.username === usernameInput.value.trim().toLowerCase());
    const createPassForm = document.getElementById('create-password-form');
    const loginForm = document.getElementById('login-form');
    const loginTitle = document.getElementById('login-title');
    const loginSubtitle = document.getElementById('login-subtitle');

    if (user && user.password === null) {
        loginTitle.textContent = `Olá, ${user.name.split(' ')[0]}`;
        loginSubtitle.textContent = "Como é seu primeiro acesso, crie uma senha.";
        loginForm.style.display = 'none';
        createPassForm.style.display = 'block';
    } else {
        loginTitle.textContent = "Plataforma de Automação";
        loginSubtitle.textContent = "Entre com seu usuário Cresol";
        loginForm.style.display = 'block';
        createPassForm.style.display = 'none';
    }
    renderIcons();
}

function handleLogin() {
    const users = getUsers();
    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const user = users.find(u => u.username === username);
    const errorMsg = document.getElementById('login-error-message');

    if (user && user.password === password) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'home.html';
    } else {
        errorMsg.textContent = "Usuário ou senha inválidos.";
        errorMsg.style.display = 'block';
    }
}

function handleCreatePassword() {
    const users = getUsers();
    const username = document.getElementById('username').value.trim().toLowerCase();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMsg = document.getElementById('login-error-message');

    if (newPassword.length < 4) {
        errorMsg.textContent = 'A senha deve ter pelo menos 4 caracteres.';
        errorMsg.style.display = 'block';
        return;
    }
    if (newPassword !== confirmPassword) {
        errorMsg.textContent = 'As senhas não coincidem.';
        errorMsg.style.display = 'block';
        return;
    }

    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        saveData('automationUsers', users);
        const user = users[userIndex];
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'home.html';
    }
}

function checkPasswordStrength() {
    const pass = document.getElementById('new-password').value;
    const strengthBar = document.getElementById('password-strength-fill');
    const strengthText = document.getElementById('password-strength-text');
    let strength = 0;
    if (pass.length > 5) strength++;
    if (pass.length > 7) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^a-zA-Z0-9]/)) strength++;

    strengthBar.style.width = (strength * 20) + '%';
    if (strength < 2) {
        strengthBar.style.backgroundColor = 'var(--danger-color)';
        strengthText.textContent = 'Senha Fraca';
        strengthText.style.color = 'var(--danger-color)';
    } else if (strength < 4) {
        strengthBar.style.backgroundColor = 'var(--warning-color)';
        strengthText.textContent = 'Senha Média';
        strengthText.style.color = 'var(--warning-color)';
    } else {
        strengthBar.style.backgroundColor = 'var(--success-color)';
        strengthText.textContent = 'Senha Forte';
        strengthText.style.color = 'var(--success-color)';
    }
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function checkLogin() {
    const userJson = sessionStorage.getItem('currentUser');
    if (!userJson) {
        window.location.href = 'login.html';
        throw new Error("Usuário não logado. Redirecionando...");
    }
    state.currentUser = JSON.parse(userJson);
    document.getElementById('logged-in-user').textContent = `Olá, ${state.currentUser.name.split(' ')[0]}`;
}

function getUsers() {
    const stored = localStorage.getItem('automationUsers');
    if (stored) {
        return JSON.parse(stored);
    }
    const initialUsers = JSON.parse(JSON.stringify(defaultUsers));
    saveData('automationUsers', initialUsers);
    return initialUsers;
}

function loadData() {
    state.allUsers = getUsers();
    let stored = localStorage.getItem('automationQuestions');
    if (stored && (!JSON.parse(stored)[0] || !JSON.parse(stored)[0].category)) {
        stored = null;
    }
    state.questions = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultQuestions));
    state.costParameters = localStorage.getItem('automationCostParams') ? JSON.parse(localStorage.getItem('automationCostParams')) : JSON.parse(JSON.stringify(defaultCostParameters));
    state.processHistory = localStorage.getItem('processHistory') ? JSON.parse(localStorage.getItem('processHistory')) : [];
}

function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const newPage = document.getElementById(pageId);
    if (newPage) {
        newPage.classList.add('active');
        if (pageId === 'calculator-page') renderCalculator();
        if (pageId === 'admin-page') renderAdminPage();
        if (pageId === 'home-page') renderHistory();
        renderIcons();
    }
}

function renderCalculator() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    state.answers = {};
    document.getElementById('processName').value = '';
    document.getElementById('parecer-input').value = '';

    const categories = [...new Set(state.questions.map(q => q.category))];
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'question-category card';
        categoryDiv.innerHTML = `<h3>${category}</h3>`;
        state.questions.filter(q => q.category === category).forEach(q => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            questionDiv.innerHTML = `<label>${q.text}</label>`;
            if (q.type === 'multiple_choice') {
                let optionsHtml = q.options.map(opt => `<button value="${opt.weight}" data-question-id="${q.id}">${opt.text}</button>`).join('');
                questionDiv.innerHTML += `<div class="options">${optionsHtml}</div>`;
            } else {
                questionDiv.innerHTML += `<div class="metric-input-group"><input type="number" data-question-id="${q.id}" placeholder="0"><span class="metric-unit">${q.unit || ''}</span></div>`;
            }
            categoryDiv.appendChild(questionDiv);
        });
        container.appendChild(categoryDiv);
    });
    // Adiciona os event listeners no container pai para melhor performance
    const qContainer = document.getElementById('questions-container');
    qContainer.removeEventListener('click', handleCalculatorInput); // Remove listener antigo para evitar duplicação
    qContainer.addEventListener('click', handleCalculatorInput);
    qContainer.removeEventListener('input', handleCalculatorInput);
    qContainer.addEventListener('input', handleCalculatorInput);
    
    document.getElementById('admin-actions-container').style.display = (state.currentUser.role === 'admin') ? 'block' : 'none';
    calculateScores();
}

function handleCalculatorInput(e) {
    const target = e.target;
    const qId = target.dataset.questionId;
    if (!qId) return;

    const question = state.questions.find(q => q.id == qId);
    if (!question) return;

    if (target.tagName === 'BUTTON') {
        // Desseleciona irmãos
        target.parentElement.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
        target.classList.add('selected');
        if (question.key === 'tech') {
            state.answers[question.key] = target.textContent;
        }
        state.answers[qId] = parseInt(target.value);
    } else if (target.tagName === 'INPUT') {
        state.answers[question.key] = target.value;
    }
    calculateScores();
}

function calculateScores() {
    let adequacaoScore = 0, maxAdequacao = 0, prontidaoScore = 0, maxProntidao = 0;
    state.questions.forEach(q => {
        if (q.type !== 'multiple_choice') return;
        const maxWeight = Math.max(...q.options.map(opt => opt.weight));
        if (maxWeight > 0) {
            const answerWeight = state.answers[q.id] || 0;
            if (q.targetScore === 'adequacao') { adequacaoScore += answerWeight; maxAdequacao += maxWeight; }
            else if (q.targetScore === 'prontidao') { prontidaoScore += answerWeight; maxProntidao += maxWeight; }
        }
    });
    const adequacaoPercent = maxAdequacao > 0 ? Math.round((adequacaoScore / maxAdequacao) * 100) : 0;
    const prontidaoPercent = maxProntidao > 0 ? Math.round((prontidaoScore / maxProntidao) * 100) : 0;
    const ideaScore = Math.round((adequacaoPercent * 0.6) + (prontidaoPercent * 0.4));
    renderResults(ideaScore, adequacaoPercent, prontidaoPercent);
    renderCosts();
}

function renderResults(idea, adequacao, prontidao) {
    const container = document.getElementById('results-container');
    container.innerHTML = `
        <div class="score-display"> <div class="score-value" id="idea-score">${idea}%</div> <div class="score-label">Pontuação da Ideia</div> <div class="score-description">Nota geral que indica o quão boa é a ideia para automação.</div> </div>
        <div class="score-display"> <div class="score-value" id="adeq-score">${adequacao}%</div> <div class="score-label">Adequação</div> <div class="score-description">Mede o potencial de automação e o impacto no negócio.</div> </div>
        <div class="score-display"> <div class="score-value" id="pront-score">${prontidao}%</div> <div class="score-label">Prontidão</div> <div class="score-description">Mostra o quão pronta uma ideia está para ser automatizada.</div> </div>`;

    const recommendationEl = document.getElementById('recommendation');
    applyColor(document.getElementById('idea-score'), idea, 50, 75);
    applyColor(document.getElementById('adeq-score'), adequacao, 50, 75);
    applyColor(document.getElementById('pront-score'), prontidao, 50, 75);

    const hasAnswers = Object.values(state.answers).some(answer => answer);
    if (hasAnswers) {
        if (idea >= 75) { recommendationEl.textContent = "Excelente candidato! Alta prioridade."; recommendationEl.className = 'recommendation-text positive'; }
        else if (idea >= 50) { recommendationEl.textContent = "Bom candidato. Análise recomendada."; recommendationEl.className = 'recommendation-text warning-color-text'; }
        else { recommendationEl.textContent = "Baixo potencial. Avaliar com cautela."; recommendationEl.className = 'recommendation-text negative'; }
    } else {
        recommendationEl.textContent = "Preencha os campos para ver a análise.";
        recommendationEl.className = 'recommendation-text';
    }
}

function renderCosts() {
    const container = document.getElementById('costs-container');
    const params = state.costParameters;
    const devHours = parseFloat(state.answers.dev_hours) || 0;
    const tech = state.answers.tech || 'UiPath';

    const costAsIs = parseFloat(state.answers.annual_cost_as_is) || 0;
    const devCost = devHours * params.devHourCost;
    const licenseCost = tech === 'UiPath' ? params.uipathLicenseCost : params.pythonLicenseCost;
    const annualCostToBe = licenseCost + params.infraCost;
    const annualSavings = costAsIs - annualCostToBe;

    container.innerHTML = `
        <div class="cost-item"><span>Custo do Projeto (Dev):</span> <strong>R$ ${devCost.toLocaleString('pt-BR')}</strong></div>
        <div class="cost-item"><span>Custo Anual (Pós-autom.):</span> <strong>R$ ${annualCostToBe.toLocaleString('pt-BR')}</strong></div>
        <hr>
        <div class="cost-item"><span>Economia Líquida Anual:</span> <strong id="savings-cost">R$ ${annualSavings.toLocaleString('pt-BR')}</strong></div>
    `;
    applyColor(document.getElementById('savings-cost'), annualSavings, 0, 1, true);
}

function applyColor(element, value, threshold1, threshold2, isCost = false) {
    if (!element) return;
    element.classList.remove('positive', 'negative', 'warning-color-text');
    if (isCost) {
        if (value > 0) element.classList.add('positive');
        else if (value < 0) element.classList.add('negative');
    } else {
        if (value >= threshold2) element.classList.add('positive');
        else if (value >= threshold1) element.classList.add('warning-color-text');
        else if (value > 0) element.classList.add('negative');
    }
}

function showFeedback(button, success = true, message = 'Salvo!') {
    const originalContent = button.innerHTML;
    button.disabled = true;

    if (success) {
        button.innerHTML = `<i data-feather="check"></i> ${message}`;
        button.classList.add('success');
    } else {
        button.innerHTML = `<i data-feather="x"></i> Erro!`;
        button.classList.add('error');
    }
    renderIcons();

    setTimeout(() => {
        button.innerHTML = originalContent;
        button.disabled = false;
        button.classList.remove('success', 'error');
        renderIcons();
    }, 2000);
}

function handleAdminDecision(status, button) {
    const processName = document.getElementById('processName').value;
    const parecer = document.getElementById('parecer-input').value;
    const score = document.getElementById('idea-score').textContent;

    if (!processName) { 
        alert('Por favor, insira o nome do processo/ideia.'); 
        return; 
    }
    if ((status === 'Reprovado' || status === 'Solicitar Melhoria') && !parecer) { 
        alert('É obrigatório fornecer um parecer para esta ação.'); 
        return; 
    }

    const decision = {
        processName,
        status,
        parecer,
        score: parseInt(score),
        evaluator: state.currentUser.name
    };

    fetch('https://SEU_BACKEND.onrender.com/api/save-decision', { // coloque a URL do Render
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            if (status === 'Aprovado') {
                window.open('sdd_padrao.html', '_blank'); // Abre SDD
            }
            showFeedback(button);
            setTimeout(() => { showPage('home-page'); }, 1000);
        } else {
            alert('Erro ao salvar no banco.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Erro de conexão com o servidor.');
    });
}


function renderHistory() {
    const container = document.getElementById('history-container');
    if (!container) return;

    container.innerHTML = '';
    if (state.processHistory.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 2rem 0;">Nenhum processo avaliado ainda.</p>';
    } else {
        state.processHistory.forEach(item => {
            const iconClass = item.status.replace(/\s+/g, '-');
            const iconName = { 'Aprovado': 'check-circle', 'Reprovado': 'x-circle', 'Solicitar-Melhoria': 'edit' }[iconClass] || 'help-circle';

            const itemDiv = document.createElement('div');
            itemDiv.className = 'history-item';
            itemDiv.innerHTML = `
                <div class="history-icon ${iconClass}"><i data-feather="${iconName}"></i></div>
                <div class="history-details"><strong>${item.processName}</strong><small>Avaliador: ${item.evaluator} em ${item.date}</small></div>
                <div class="history-status"><strong>${item.score}</strong> - ${item.status}</div>
                ${item.parecer ? `<div class="history-parecer"><strong>Parecer:</strong> ${item.parecer}</div>` : ''}
            `;
            container.appendChild(itemDiv);
        });
    }
}

// --- PÁGINA DE CONFIGURAÇÕES (ADMIN) ---
function renderAdminPage() {
    const container = document.getElementById('admin-content');
    if (state.currentUser.role !== 'admin') {
        container.innerHTML = `<div class="card"><p>Você não tem permissão para acessar esta página.</p></div>`;
        return;
    }
    container.innerHTML = `
        <div class="admin-container">
            <div>
                <div class="card">
                    <h3><i data-feather="dollar-sign"></i> Parâmetros de Custo Global</h3>
                    <div class="form-group"><label>Custo da Hora de Desenvolvimento (R$)</label><input type="number" id="param-devHourCost" value="${state.costParameters.devHourCost}"></div>
                    <div class="form-group"><label>Custo Anual Licença UiPath (R$)</label><input type="number" id="param-uipathLicenseCost" value="${state.costParameters.uipathLicenseCost}"></div>
                    <div class="form-group"><label>Custo Anual Licença Python (R$)</label><input type="number" id="param-pythonLicenseCost" value="${state.costParameters.pythonLicenseCost}"></div>
                    <div class="form-group"><label>Custo Anual Infraestrutura/VM (R$)</label><input type="number" id="param-infraCost" value="${state.costParameters.infraCost}"></div>
                    <button id="save-params-btn" class="action-button"><i data-feather="save"></i> Salvar Parâmetros</button>
                </div>
                <div class="card">
                    <h3><i data-feather="help-circle"></i> Perguntas da Calculadora</h3>
                    <div id="current-questions-list"></div>
                    <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                       <button id="add-question-btn" class="action-button" style="flex-grow: 1;"><i data-feather="plus"></i> Adicionar Pergunta</button>
                       <button id="reset-questions-btn" class="danger-button"><i data-feather="refresh-cw"></i></button>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3><i data-feather="users"></i> Gerenciar Usuários</h3>
                <div id="user-management-list"></div>
            </div>
        </div>

        <div id="question-modal" class="modal-backdrop hidden">
            <div class="modal-content">
                <h3 id="admin-form-title">Adicionar Nova Pergunta</h3>
                <input type="hidden" id="editing-question-id">
                <div class="form-group"><label>Texto da Pergunta</label><input type="text" id="admin-q-text"></div>
                <div class="form-group"><label>Categoria</label><input type="text" id="admin-q-category" placeholder="Ex: Potencial e Adequação"></div>
                <div class="form-group">
                    <label>Tipo de Pergunta</label>
                    <div class="select-wrapper"><select id="admin-q-type"><option value="multiple_choice">Múltipla Escolha</option><option value="numeric">Numérica</option><option value="cost">Custo (R$)</option></select><i data-feather="chevron-down"></i></div>
                </div>
                <div id="admin-type-specific"></div>
                <div class="modal-actions">
                    <button id="cancel-edit-btn" class="secondary-button"><i data-feather="x"></i> Cancelar</button>
                    <button id="save-question-btn" class="action-button approve"><i data-feather="check"></i> Salvar Pergunta</button>
                </div>
            </div>
        </div>`;

    renderAdminList();
    renderUserManagement();
    setupAdminEventListeners();
}

function saveCostParams(button) {
    state.costParameters = {
        devHourCost: parseFloat(document.getElementById('param-devHourCost').value) || 0,
        uipathLicenseCost: parseFloat(document.getElementById('param-uipathLicenseCost').value) || 0,
        pythonLicenseCost: parseFloat(document.getElementById('param-pythonLicenseCost').value) || 0,
        infraCost: parseFloat(document.getElementById('param-infraCost').value) || 0
    };
    saveData('automationCostParams', state.costParameters);
    showFeedback(button);
}

function setupAdminEventListeners() {
    document.getElementById('save-params-btn').addEventListener('click', (e) => saveCostParams(e.target));
    document.getElementById('add-question-btn').addEventListener('click', () => showQuestionModal());
    document.getElementById('reset-questions-btn').addEventListener('click', resetQuestions);
    
    const modal = document.getElementById('question-modal');
    document.getElementById('cancel-edit-btn').addEventListener('click', hideQuestionModal);
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'question-modal') hideQuestionModal();
    });
    document.getElementById('save-question-btn').addEventListener('click', (e) => saveAdminQuestion(e.target));
    document.getElementById('admin-q-type').addEventListener('change', renderAdminTypeSpecific);
}

function renderAdminList() {
    const listContainer = document.getElementById('current-questions-list');
    listContainer.innerHTML = '';
    state.questions.forEach(q => {
        listContainer.innerHTML += `
            <div class="question-item">
                <span>${q.text} <strong>(${q.category})</strong></span>
                <div class="question-item-actions">
                    <button onclick="editQuestion(${q.id})"><i data-feather="edit-2"></i></button>
                    <button onclick="deleteQuestion(${q.id})"><i data-feather="trash-2"></i></button>
                </div>
            </div>`;
    });
}

function showQuestionModal() {
    document.getElementById('editing-question-id').value = '';
    document.getElementById('admin-form-title').textContent = 'Adicionar Nova Pergunta';
    document.getElementById('admin-q-text').value = '';
    document.getElementById('admin-q-category').value = '';
    document.getElementById('admin-q-type').value = 'multiple_choice';
    renderAdminTypeSpecific();
    document.getElementById('question-modal').classList.remove('hidden');
    renderIcons();
}

function hideQuestionModal() {
    document.getElementById('question-modal').classList.add('hidden');
}

function renderAdminTypeSpecific() {
    const type = document.getElementById('admin-q-type').value;
    const container = document.getElementById('admin-type-specific');
    if (type === 'multiple_choice') {
        container.innerHTML = `
            <div class="form-group"><label>Pontuação Alvo</label><div class="select-wrapper"><select id="admin-q-target"><option value="adequacao">Adequação</option><option value="prontidao">Prontidão</option></select><i data-feather="chevron-down"></i></div></div>
            <h4>Opções de Resposta</h4><div id="admin-options-container"></div>
            <button id="add-option-btn" class="secondary-button" type="button"><i data-feather="plus"></i> Adicionar Opção</button>`;
        document.getElementById('add-option-btn').addEventListener('click', () => addAdminOptionInput());
        addAdminOptionInput(); addAdminOptionInput();
    } else {
        container.innerHTML = `<div class="form-group"><label>Unidade (ex: h/ano, %)</label><input type="text" id="admin-q-unit"></div>`;
    }
    renderIcons();
}

function addAdminOptionInput(text = '', weight = '') {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-input-group';
    optionDiv.innerHTML = `
        <input type="text" class="admin-opt-text" placeholder="Texto da opção" value="${text}">
        <input type="number" class="admin-opt-weight" placeholder="Peso" value="${weight}">
        <button type="button" class="remove-option-btn"><i data-feather="x-circle"></i></button>`;
    optionDiv.querySelector('.remove-option-btn').addEventListener('click', () => optionDiv.remove());
    document.getElementById('admin-options-container').appendChild(optionDiv);
    renderIcons();
}

function saveAdminQuestion(button) {
    const id = document.getElementById('editing-question-id').value;
    const newQuestion = {
        id: id ? parseInt(id) : Date.now(),
        text: document.getElementById('admin-q-text').value,
        category: document.getElementById('admin-q-category').value,
        type: document.getElementById('admin-q-type').value
    };
    if (!newQuestion.text || !newQuestion.category) { alert('Texto e Categoria são obrigatórios.'); return; }

    if (newQuestion.type === 'multiple_choice') {
        newQuestion.targetScore = document.getElementById('admin-q-target').value;
        newQuestion.options = [];
        document.querySelectorAll('.option-input-group').forEach(opt => {
            const text = opt.querySelector('.admin-opt-text').value;
            const weight = parseInt(opt.querySelector('.admin-opt-weight').value);
            if (text && !isNaN(weight)) newQuestion.options.push({ text, weight });
        });
        if (newQuestion.options.length < 2) { alert('Adicione pelo menos 2 opções válidas.'); return; }
    } else {
        newQuestion.unit = document.getElementById('admin-q-unit').value;
        newQuestion.key = newQuestion.text.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
    }

    if (id) {
        const index = state.questions.findIndex(q => q.id == id);
        if (index > -1) state.questions[index] = newQuestion;
    } else {
        state.questions.push(newQuestion);
    }

    saveData('automationQuestions', state.questions);
    renderAdminList();
    showFeedback(button);
    setTimeout(hideQuestionModal, 1000);
}

function editQuestion(id) {
    const q = state.questions.find(q => q.id == id);
    if (!q) return;

    showQuestionModal();
    document.getElementById('admin-form-title').textContent = 'Editando Pergunta';
    document.getElementById('editing-question-id').value = q.id;
    document.getElementById('admin-q-text').value = q.text;
    document.getElementById('admin-q-category').value = q.category;
    document.getElementById('admin-q-type').value = q.type;
    renderAdminTypeSpecific();
    if (q.type === 'multiple_choice') {
        document.getElementById('admin-q-target').value = q.targetScore;
        const optionsContainer = document.getElementById('admin-options-container');
        optionsContainer.innerHTML = '';
        q.options.forEach(opt => addAdminOptionInput(opt.text, opt.weight));
    } else {
        document.getElementById('admin-q-unit').value = q.unit || '';
    }
}

function deleteQuestion(id) {
    if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
        state.questions = state.questions.filter(q => q.id != id);
        saveData('automationQuestions', state.questions);
        renderAdminList();
        renderIcons();
    }
}

function resetQuestions() {
    if (confirm('Tem certeza que deseja resetar todas as perguntas para o padrão? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('automationQuestions');
        loadData();
        renderAdminList();
        renderIcons();
    }
}

// --- NOVAS FUNÇÕES DE GESTÃO DE USUÁRIOS ---

/**
 * Renderiza a lista de usuários na página de admin.
 */
function renderUserManagement() {
    const listContainer = document.getElementById('user-management-list');
    listContainer.innerHTML = '';
    state.allUsers.forEach(user => {
        if (user.username === state.currentUser.username) return;

        listContainer.innerHTML += `
            <div class="user-item">
                <div class="user-details">
                    <span>${user.name}</span>
                    <small>${user.username} - ${user.role}</small>
                </div>
                <button class="secondary-button" onclick="resetUserPassword('${user.username}', this)">
                    <i data-feather="key"></i> Redefinir Senha
                </button>
            </div>`;
    });
    renderIcons();
}

/**
 * Reseta a senha de um usuário específico.
 * @param {string} username O username do usuário a ser resetado.
 * @param {HTMLElement} button O botão que foi clicado.
 */
function resetUserPassword(username, button) {
    if (confirm(`Tem certeza que deseja redefinir a senha de ${username}? O usuário precisará criar uma nova senha no próximo login.`)) {
        const userIndex = state.allUsers.findIndex(u => u.username === username);
        if (userIndex !== -1) {
            state.allUsers[userIndex].password = null;
            saveData('automationUsers', state.allUsers);
            showFeedback(button, true, 'Redefinida!');
        } else {
            showFeedback(button, false, 'Erro!');
            alert('Usuário não encontrado.');
        }
    }
}