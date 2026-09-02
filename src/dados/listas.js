// Textos fixos da interface: dias, meses, filtros e opções.

export const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const DIAS_CURTOS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const MESES_MIN = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export const AVISOS_BASE = [
    { id: 'a2', tipo: 'horario', titulo: 'Coleta de amanhã mudou', corpo: 'A Campina passa a ser coletada das 05:30 às 08:30.', quando: 'há 2 h' },
    { id: 'a3', tipo: 'aviso', titulo: 'Mutirão de recicláveis', corpo: 'Entrega voluntária na Praça da República, das 08:00 às 12:00.', quando: 'ontem' },
    { id: 'a4', tipo: 'caminhao', titulo: 'Coleta concluída na rua', corpo: 'O CT-104 finalizou a Trav. Campos Sales às 07:12 de hoje.', quando: 'ontem' },
    { id: 'a5', tipo: 'aviso', titulo: 'Círio de Nazaré altera a coleta', corpo: 'No fim de semana do Círio, o entorno da Basílica tem coleta reforçada à noite.', quando: 'há 3 dias' }
];

export const FILTROS = [
    { id: 'todos', nome: 'Todos' },
    { id: 'caminhao', nome: 'Caminhão' },
    { id: 'horario', nome: 'Horário' },
    { id: 'aviso', nome: 'Avisos' }
];

export const INTERRUPTORES = [
    { id: 'proximidade', titulo: 'Caminhão se aproximando', texto: 'Alerta quando o caminhão entra na sua rua' },
    { id: 'horario', titulo: 'Mudança de horário', texto: 'Antecipações, atrasos e feriados' },
    { id: 'prefeitura', titulo: 'Avisos da prefeitura', texto: 'Mutirões, campanhas e interrupções' },
    { id: 'resumo', titulo: 'Resumo semanal', texto: 'Um retrato das coletas do seu bairro' }
];

export const TIPOS_RELATO = [
    { id: 'nao-realizada', rotulo: 'Coleta não realizada' },
    { id: 'acumulo', rotulo: 'Lixo acumulado na via' },
    { id: 'fora-horario', rotulo: 'Passou fora do horário' },
    { id: 'outro', rotulo: 'Outro problema' }
];

export const DISTANCIAS = [200, 500, 1000];
export const HORAS_LEMBRETE = ['18:00', '20:00', '21:30'];
