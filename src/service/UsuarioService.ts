import { dbConn } from '../repository/DbConnection';
import { Usuario } from '../domain/Usuario';
import { ObjectId } from 'mongodb';
import { UsuarioUpdate } from '../domain/UsuarioUpdate';
import { prepareMessage } from './KafkaService';

//TODO implementar encriptação da senha antes de fazer a criação.
export const insertUsuario = async (usuario: Usuario) => {
    const db = await dbConn();
    const temp = new Usuario(usuario.email, usuario.senha);
    const obj = await db.insertOne(temp);
    return obj.ops;
}

const getUsuarioByEmail = async (email: string) => {
    const db = await dbConn();
    return await db.findOne({ "email": email });
};

//TODO implementar encriptação da senha antes de fazer a consulta.
//TODO A consulta foi feita, mas não sei como lidar com o retorno que vem em outra mensagem...
export const login = async (usuario: Usuario) => {
    const db = await dbConn();
    const user = await db.findOne({ "email": usuario.email, "senha:": usuario.senha });
    if (user) {
        await prepareMessage(usuario.email, 'CHECK_LOGIN');
    }
    const ativo = true;
    if (ativo) {
        return user;
    } else {
        return ativo;
    }
};

//TODO implementar encriptação da senha antes de fazer a consulta.
export const updatePasswordByEmail = async (usuario: UsuarioUpdate) => {
    const db = await dbConn();
    const temp = await getUsuarioByEmail(usuario.email);
    if (temp.senha === usuario.senhaAtual) {
        const userUpdated = new Usuario(usuario.email, usuario.senhaNova);
        const obj = await db.replaceOne({ "_id": new ObjectId(temp.id) }, userUpdated);

        if (obj.modifiedCount) {
            return true;
        } else {
            return false;
        }

    } else {
        return false;
    }

};

export const deleteUsuarioByEmail = async (email: string) => {
    const db = await dbConn();
    const temp = await getUsuarioByEmail(email);
    const obj = await db.deleteOne({ "_id": new ObjectId(temp.id) });
    return obj.deletedCount;
};
