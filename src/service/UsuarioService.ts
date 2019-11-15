import { dbConn } from '../repository/DbConnection';
import { Usuario } from '../domain/Usuario';
import { ObjectId } from 'mongodb';
import { UsuarioUpdate } from '../domain/UsuarioUpdate';
import { prepareMessage } from './KafkaService';
import { genSalt, hash, compare } from 'bcrypt';

const saltRounds = 10;

export const insertUsuario = async (usuario: Usuario) => {
    const db = await dbConn();

    const stringPass = usuario.senha;
    const salt = await genSalt(saltRounds);
    const encrypted = await hash(stringPass, salt);

    const temp = new Usuario(usuario.email, encrypted);
    const obj = await db.insertOne(temp);

    return obj.ops;
}

const getUsuarioByEmail = async (email: string) => {
    const db = await dbConn();
    return await db.findOne({ "email": email });
};

//TODO A consulta foi feita, mas não sei como lidar com o retorno que vem em outra mensagem...
export const login = async (usuario: Usuario) => {
    const db = await dbConn();

    const user = await db.findOne({ "email": usuario.email });
    if (user) {

        const checkPass = await compare(usuario.senha, user.senha);

        if (checkPass) {
            await prepareMessage(usuario.email, 'CHECK_LOGIN');
        }
    }

    const ativo = true;
    if (ativo) {
        return user;
    } else {
        return ativo;
    }
};

export const updatePasswordByEmail = async (usuario: UsuarioUpdate) => {
    const db = await dbConn();

    const temp = await getUsuarioByEmail(usuario.email);
    const checkActual = await compare(usuario.senhaAtual, temp.senha);

    if (checkActual) {
        const stringPass = usuario.senhaNova;
        const salt = await genSalt(saltRounds);
        const encrypted = await hash(stringPass, salt);

        const userUpdated = new Usuario(usuario.email, encrypted);
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
