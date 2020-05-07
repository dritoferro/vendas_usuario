import * as endpoint from 'fastify';
import { HTTPMethod } from 'fastify';
import * as ip from 'ip';
import * as service from '../service/UsuarioService';
import { Usuario } from '../domain/Usuario';
import { UsuarioUpdate } from '../domain/UsuarioUpdate';

const fast = endpoint({ logger: true });

const postMethod: HTTPMethod = 'POST';
const updateMethod: HTTPMethod = 'PUT';

const login = async (req, reply) => {
    const body = req.body;
    const temp = new Usuario(body.email, body.senha);
    const get = await service.login(temp);
    if (get) {
        reply.status(200);
        reply.send(get);
    } else {
        reply.status(401);
        reply.send({ message: 'Email ou senha incorretos' });
    }
};

const updatePassword = async (req, reply) => {
    const body: UsuarioUpdate = req.body;
    const usuario = new UsuarioUpdate(body.email, body.senhaAtual, body.senhaNova);
    const updated = await service.updatePasswordByEmail(usuario);
    if (updated) {
        reply.status(200);
        reply.send({ message: 'Senha atualizada com sucesso' });
    } else {
        reply.status(400);
        reply.send({ message: 'Não foi possível atualizar a senha' });
    }
};

const routes = [
    {
        method: postMethod,
        url: '/login',
        handler: login
    },
    {
        method: updateMethod,
        url: '/usuarios',
        handler: updatePassword
    }
];

routes.forEach(async (obj) => {
    fast.route(obj);
});

export const buildRoutes = async () => {
    console.log(ip.address());
    const addr = ip.address();
    await fast.listen({ port: 3000, host: addr });
};
