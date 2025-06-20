// Para salvar o paciente localStorage
function salvarPacientes(pacientes) {
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
}

// Para carregar
function carregarPacientes() {
    let dados = localStorage.getItem('pacientes');
    if (dados) {
        return JSON.parse(dados);
    } else {
        return [];
    }
}
// Para gerar numero da ficha
function gerarFicha() {
    let numero = localStorage.getItem('contadorFicha');

    if (numero == null) {
        numero = 1;
    } else {
        numero = parseInt(numero) + 1;
    }

    localStorage.setItem('contadorFicha', numero);

    return 'F' + numero;
}
// cadastro
if (document.getElementById('patientForm')) {
    let form = document.getElementById('patientForm');

    form.onsubmit = function (e) {
        e.preventDefault();

        let nome = document.getElementById('nome').value;
        let idade = document.getElementById('idade').value;
        let sexo = document.getElementById('sexo').value;
        let prioridade = document.getElementById('prioridade').value;

        let pacientes = carregarPacientes();

        let novo = {
            ficha: gerarFicha(),
            nome: nome,
            idade: idade,
            sexo: sexo,
            prioridade: prioridade,
            status: 'aguardando'
        };

        pacientes.push(novo);
        salvarPacientes(pacientes);
        
        alert('Paciente cadastrado!');
        form.reset();
    }
}
//atendimento

if (document.getElementById('queueTableBody')) {
    let filaTabela = document.getElementById('queueTableBody');
    let historicoTabela = document.getElementById('historyTableBody');

    function exibirAtendimento() {
        let pacientes = carregarPacientes();
        let fila = organizarFila(pacientes);

        filaTabela.innerHTML = '';
        historicoTabela.innerHTML = '';

        if (fila.length == 0) {
            filaTabela.innerHTML = '<tr><td colspan="6">Nenhum paciente aguardando.</td></tr>';
        } else {
            fila.forEach(function (p) {
                let linha = `<tr>
                    <td>${p.ficha}</td>
                    <td>${p.nome}</td>
                    <td>${p.idade}</td>
                    <td>${p.prioridade}</td>
                    <td>Aguardando</td>
                    <td><button onclick="atender('${p.ficha}')">Atender</button></td>
                </tr>`;
                filaTabela.innerHTML += linha;
            });
        }

        let atendidos = pacientes.filter(p => p.status == 'atendido');

        if (atendidos.length == 0) {
            historicoTabela.innerHTML = '<tr><td colspan="5">Nenhum atendimento feito.</td></tr>';
        } else {
            atendidos.forEach(function (p) {
                let linha = `<tr>
                    <td>${p.ficha}</td>
                    <td>${p.nome}</td>
                    <td>${p.prioridade}</td>
                    <td>Atendido</td>                  
                </tr>`;
                historicoTabela.innerHTML += linha;
            });
        }
    }

    function organizarFila(lista) {
        let ordem = { 'emergencia': 1, 'muito-urgente': 2, 'urgente': 3, 'pouco-urgente': 4, 'nao-urgente': 5 };
        return lista.filter(p => p.status == 'aguardando').sort(function (a, b) {
            return ordem[a.prioridade] - ordem[b.prioridade];
        });
    }

    window.atender = function (ficha) {
        let pacientes = carregarPacientes();
        let paciente = pacientes.find(p => p.ficha == ficha);
        if (paciente) {
            paciente.status = 'atendido';
            salvarPacientes(pacientes);
            exibirAtendimento();
        }
    }

    document.getElementById('callNextPatientBtn').onclick = function () {
        let fila = organizarFila(carregarPacientes());
        if (fila.length > 0) {
            atender(fila[0].ficha);
        } else {
            alert('Nenhum paciente na fila.');
        }
    }

    exibirAtendimento();
}

//  Triagem

const $ = (id) => document.getElementById(id);

        const corpoTabelaTriagem = $('patientTableBody');
        const corpoTabelaMedico = $('medicoQueueTableBody');
        const estadoVazioMedico = $('medicoQueueEmptyState');
        const botaoChamarProximo = $('callNextPatientBtn');
        const estadoVazio = $('emptyState');
        const caixaPacienteTriagem = $('patientInTriageBox');
        const nomePacienteAtual = $('currentPatientNameDisplay');
        const fichaPacienteAtual = $('currentPatientFichaDisplay');
        const seletorPrioridadeTriagem = $('triagePatientPrioritySelect');
        const botaoConcluirTriagem = $('concluirTriagemBtn');

        const armazenamento = {
            salvar(pacientes) {
                localStorage.setItem('pacientes', JSON.stringify(pacientes));
            },
            carregar() {
                return JSON.parse(localStorage.getItem('pacientes')) || [];
            }
        };

        function atualizarPaciente(ficha, novosDados) {
            const pacientes = armazenamento.carregar();
            const indice = pacientes.findIndex(p => p.ficha === ficha);
            if (indice !== -1) {
                Object.assign(pacientes[indice], novosDados);
                armazenamento.salvar(pacientes);
                renderizarTudo();
            }
        }

        function renderizarPacienteEmTriagem() {
            const paciente = armazenamento.carregar().find(p => p.status === 'em_triagem');
            if (paciente) {
                caixaPacienteTriagem.style.display = 'flex';
                nomePacienteAtual.textContent = paciente.nome;
                fichaPacienteAtual.textContent = paciente.ficha;
                seletorPrioridadeTriagem.value = paciente.prioridade;
                botaoConcluirTriagem.onclick = () => concluirTriagem(paciente.ficha);
                botaoChamarProximo.disabled = true;
            } else {
                caixaPacienteTriagem.style.display = 'none';
                nomePacienteAtual.textContent = 'Nenhum';
                fichaPacienteAtual.textContent = 'N/A';
                botaoChamarProximo.disabled = false;
            }
        }

        function criarLinhaPaciente(paciente) {
            const linha = document.createElement('tr');
            linha.setAttribute('data-patient-ficha', paciente.ficha);
            const prioridade = paciente.prioridade.replace('-', ' ');
            const status = paciente.status.replace('_', ' ');

            linha.innerHTML = `
        <td data-label="Ficha">${paciente.ficha || 'N/A'}</td>
        <td data-label="Nome">${paciente.nome}</td>
        <td data-label="Idade">${paciente.idade}</td>
        <td data-label="Prioridade">
            <span class="priority-tag ${paciente.prioridade}">${prioridade}</span>
        </td>
        <td data-label="Status">
            <span class="status-tag ${paciente.status}" style="color: black;">${status}</span>
        </td>
        <td data-label="Ações" class="action-buttons">
            <select class="priority-select" data-patient-ficha="${paciente.ficha}">
                <option value="emergencia">Emergência</option>
                <option value="muito-urgente">Muito Urgente</option>
                <option value="urgente">Urgente</option>
                <option value="pouco-urgente">Pouco Urgente</option>
                <option value="nao-urgente">Não Urgente</option>
            </select>
            <button onclick="concluirTriagem('${paciente.ficha}')" style="margin-left: 10px;">Concluir Triagem</button>
        </td>`;

            return linha;
        }

        function renderizarFilaTriagem() {
            const pacientes = armazenamento.carregar().filter(p => p.status === 'aguardando');
            corpoTabelaTriagem.innerHTML = '';

            if (pacientes.length === 0) {
                estadoVazio.style.display = 'table-row';
                corpoTabelaTriagem.appendChild(estadoVazio);
                return;
            }
            estadoVazio.style.display = 'none';

            pacientes.forEach(p => {
                const linha = criarLinhaPaciente(p);
                corpoTabelaTriagem.appendChild(linha);
            });

            document.querySelectorAll('.priority-select').forEach(select => {
                select.addEventListener('change', ({ target }) => {
                    atualizarPaciente(target.dataset.patientFicha, { prioridade: target.value });
                });
            });
        }

        function renderizarFilaMedico() {
            const pacientes = armazenamento.carregar().filter(p => p.status === 'aguardando_medico');
            corpoTabelaMedico.innerHTML = '';

            if (pacientes.length === 0) {
                estadoVazioMedico.style.display = 'table-row';
                corpoTabelaMedico.appendChild(estadoVazioMedico);
                return;
            }
            estadoVazioMedico.style.display = 'none';

            pacientes.forEach(p => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
            <td data-label="Ficha">${p.ficha || 'N/A'}</td>
            <td data-label="Nome">${p.nome}</td>
            <td data-label="Prioridade">
                <span class="priority-tag ${p.prioridade}">${p.prioridade.replace('-', ' ')}</span>
            </td>
            <td data-label="Status">
                <span class="status-tag ${p.status}">${p.status.replace('_', ' ')}</span>
            </td>`;
                corpoTabelaMedico.appendChild(linha);
            });
        }

        function chamarProximo() {
            const aguardando = armazenamento.carregar().filter(p => p.status === 'aguardando' && !p.isCalled);
            if (aguardando.length === 0) return alert('Não há pacientes aguardando triagem.');
            atualizarPaciente(aguardando[0].ficha, { status: 'em_triagem' });
        }

        function concluirTriagem(ficha) {
            atualizarPaciente(ficha, { status: 'aguardando_medico' });
        }

        function mudarPrioridadeTriagem({ target }) {
            const paciente = armazenamento.carregar().find(p => p.status === 'em_triagem');
            if (paciente) atualizarPaciente(paciente.ficha, { prioridade: target.value });
        }

        function renderizarTudo() {
            renderizarPacienteEmTriagem();
            renderizarFilaTriagem();
            renderizarFilaMedico();
        }

        function adicionarPacientesExemplo() {
            let pacientes = armazenamento.carregar();
            if (pacientes.length > 0 && pacientes.some(p => p.status !== 'aguardando')) return;

            const exemplos = [
                            ];

            exemplos.forEach(p => pacientes.push({ ...p, sexo: '', motivo: '', isCalled: false }));
            armazenamento.salvar(pacientes);
        }

        function iniciar() {
            adicionarPacientesExemplo();
            renderizarTudo();
            seletorPrioridadeTriagem.addEventListener('change', mudarPrioridadeTriagem);
            botaoChamarProximo.addEventListener('click', chamarProximo);
        }

        document.addEventListener('DOMContentLoaded', iniciar);