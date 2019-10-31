import { Kafka, CompressionTypes } from 'kafkajs';
import { KafkaMessage } from '../domain/KafkaMessage';
import { login } from './UsuarioService';
import { Usuario } from '../domain/Usuario';
import { KafkaQuery } from '../domain/KafkaQuery';

const topic = 'Usuario-Topic';

const kafka = new Kafka({
    clientId: 'venda_usuario_id',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'usuario-group-receiver' });

export const startConsumer = async () => {
    await consumer.connect();

    await consumer.subscribe({ topic: topic });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const payload = JSON.parse(message.value.toString());
            const pessoa = await login(payload.message.value);
            await prepareMessage(pessoa, payload.emitter);
        }
    });
};

const prepareMessage = async (usuario: Usuario, receiver: string) => {
    const query = new KafkaQuery("usuario", usuario);
    const kafkaMessage = new KafkaMessage(query, topic, receiver);
    console.log(kafkaMessage);
    // await sendMessage(kafkaMessage);
};
//TODO fazer o teste desta função quando tiver outro módulo criado
const sendMessage = async (obj: KafkaMessage) => {
    await producer.connect();
    await producer.send({
        compression: CompressionTypes.GZIP,
        topic: obj.receiver,
        messages: [
            { value: JSON.stringify(obj) }
        ]
    });
    await producer.disconnect();
};
