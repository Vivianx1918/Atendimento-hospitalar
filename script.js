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