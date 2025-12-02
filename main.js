// importa os bibliotecas necessários
const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');

// constantes para configurações
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

// habilita ou desabilita a inserção de dados no banco de dados
const HABILITAR_OPERACAO_INSERIR = true;

// função para comunicação serial
const serial = async (
    valoresSensorDigital,
    valoresSensorDigital2,
    valoresSensorDigital3,
    valoresSensorDigital4,
    valoresSensorDigital5,
    valoresSensorDigital6,
    valoresSensorDigital7,
    valoresSensorDigital8,
    valoresSensorDigital9,
) => {

    // conexão com o banco de dados MySQL
    let poolBancoDados = mysql.createPool(
        {
            host: '10.212.83.5',// ip da maquina que hospeda o banco, mutavel
            user: 'smf_insert',
            password: 'Urubu#100',
            database: 'smf',
            port: 3307
        }
    ).promise();

    // lista as portas seriais disponíveis e procura pelo Arduino
    const portas = await serialport.SerialPort.list();
    console.log(portas);
    const portaArduino = portas.find((porta) => (porta.vendorId == 2341 && porta.productId == 43) || (porta.vendorId == '10C4' && porta.productId == 'EA60')); // Adicinado o arduino da Isa
    if (!portaArduino) {
        throw new Error('O arduino não foi encontrado em nenhuma porta serial');
    }

    // configura a porta serial com o baud rate especificado
    const arduino = new serialport.SerialPort(
        {
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        }
    );

    // evento quando a porta serial é aberta
    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });

    // processa os dados recebidos do Arduino
    arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
        console.log(data);
        const valores = data.split(';');
        const sensorDigital = parseInt(valores[0]);
        const sensorDigital2 = parseInt(valores[0]);
        const sensorDigital3 = parseInt(valores[0]);
        const sensorDigital4 = parseInt(valores[0]);
        const sensorDigital5 = parseInt(valores[0]);
        const sensorDigital6 = parseInt(valores[0]);
        const sensorDigital7 = parseInt(valores[0]);
        const sensorDigital8 = parseInt(valores[0]);
        const sensorDigital9 = parseInt(valores[0]);
        //const sensorAnalgico = parseFloat(valores[1]); //tirar -----------------------------------

        // armazena os valores dos sensores nos arrays correspondentes
        valoresSensorDigital.push(sensorDigital);
        valoresSensorDigital2.push(sensorDigital2);
        valoresSensorDigital3.push(sensorDigital3);
        valoresSensorDigital4.push(sensorDigital4);
        valoresSensorDigital5.push(sensorDigital5);
        valoresSensorDigital6.push(sensorDigital6);
        valoresSensorDigital7.push(sensorDigital7);
        valoresSensorDigital8.push(sensorDigital8);
        valoresSensorDigital9.push(sensorDigital9);


        // insere os dados no banco de dados (se habilitado)
        if (HABILITAR_OPERACAO_INSERIR) {

            // este insert irá inserir os dados na tabela "medida"
            await poolBancoDados.execute(
                `INSERT INTO SensorLeitura (fkSensor, leitura, dataLeitura) VALUES 
                (10, ${sensorDigital}, DEFAULT),
                (11, ${sensorDigital2}, DEFAULT),
                (12, ${sensorDigital3}, DEFAULT),
                (13, ${sensorDigital4}, DEFAULT),
                (14, ${sensorDigital5}, DEFAULT),
                (15, ${sensorDigital6}, DEFAULT),
                (16, ${sensorDigital7}, DEFAULT),
                (17, ${sensorDigital8}, DEFAULT),
                (18, ${sensorDigital9}, DEFAULT);`,
            );

            console.log("valores inseridos no banco: " + sensorDigital);
            console.log("valores inseridos no banco: " + sensorDigital2);
            console.log("valores inseridos no banco: " + sensorDigital3);
            console.log("valores inseridos no banco: " + sensorDigital4);
            console.log("valores inseridos no banco: " + sensorDigital5);
            console.log("valores inseridos no banco: " + sensorDigital6);
            console.log("valores inseridos no banco: " + sensorDigital7);
            console.log("valores inseridos no banco: " + sensorDigital8);
            console.log("valores inseridos no banco: " + sensorDigital9);

        }

    });

    // evento para lidar com erros na comunicação serial
    arduino.on('error', (mensagem) => {
        console.error(`Erro no arduino (Mensagem: ${mensagem}`)
    });
}

// função para criar e configurar o servidor web
const servidor = (
    valoresSensorDigital,
    valoresSensorDigital2,
    valoresSensorDigital3,
    valoresSensorDigital4,
    valoresSensorDigital5,
    valoresSensorDigital6,
    valoresSensorDigital7,
    valoresSensorDigital8,
    valoresSensorDigital9,

) => {
    const app = express();

    // configurações de requisição e resposta
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });

    // inicia o servidor na porta especificada
    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });

    // define os endpoints da API para cada tipo de sensor
    app.get('/sensores/digital', (_, response) => {
        return response.json(valoresSensorDigital), response.json(valoresSensorDigital2);
    });
}

// função principal assíncrona para iniciar a comunicação serial e o servidor web
(async () => {
    // arrays para armazenar os valores dos sensores
    const valoresSensorDigital = [];
    const valoresSensorDigital2 = [];
    const valoresSensorDigital3 = [];
    const valoresSensorDigital4 = [];
    const valoresSensorDigital5 = [];
    const valoresSensorDigital6 = [];
    const valoresSensorDigital7 = [];
    const valoresSensorDigital8 = [];
    const valoresSensorDigital9 = [];

    // inicia a comunicação serial
    await serial(
        valoresSensorDigital,
        valoresSensorDigital2,
        valoresSensorDigital3,
        valoresSensorDigital4,
        valoresSensorDigital5,
        valoresSensorDigital6,
        valoresSensorDigital7,
        valoresSensorDigital8,
        valoresSensorDigital9

    );

    // inicia o servidor web
    servidor(
        valoresSensorDigital,
        valoresSensorDigital2,
        valoresSensorDigital3,
        valoresSensorDigital4,
        valoresSensorDigital5,
        valoresSensorDigital6,
        valoresSensorDigital7,
        valoresSensorDigital8,
        valoresSensorDigital9,

    );
})();