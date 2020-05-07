import { Kafka, CompressionTypes } from 'kafkajs';
import { KafkaMessage } from '../domain/KafkaMessage';
import { deleteUsuarioByEmail, insertUsuario } from './UsuarioService';
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

            switch (payload.message.action) {
                case KafkaActions.INSERT:
                    const temp = new Usuario(payload.message.value.email, payload.message.value.senha);
                    const inserted = await insertUsuario(temp);
                    await prepareMessage(inserted, payload.emitter, payload.message.action);
                    break;

                case KafkaActions.DELETE:
                    const deleted = await deleteUsuarioByEmail(payload.message.value);
                    await prepareMessage(deleted, payload.emitter, payload.message.action);
                    break;

                case KafkaActions.LOGIN_CHECK:
                    const active = payload.message.value;
                    break;

                default:
                    const error = 'Action not supported';
                    await prepareMessage(error, payload.emitter, payload.message.action);
                    break;
            }
        }
    });
};

export const prepareMessage = async (message: any, action: KafkaActions, receiver?: string) => {
    const query = new KafkaQuery("usuario", message, action);
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
