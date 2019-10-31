import {buildRoutes} from './api/UsuarioApi';
import { startConsumer } from './service/KafkaService';

// Run the server!
const startUp = async () => {
    await startConsumer();
    await buildRoutes();
};

startUp();
