import { dbConn } from '../repository/DbConnection';
import { Usuario } from '../domain/Usuario';
import { ObjectId } from 'mongodb';
import { UsuarioUpdate } from '../domain/UsuarioUpdate';

//TODO o usuario será criado quando a pessoa for criada, então virá uma mensagem do Kafka com os dados para criar este usuário internamente.
//TODO implementar encriptação da senha antes de fazer a criação.
export const insertUsuario = async (usuario: Usuario) => {
    const db = await dbConn();
    const temp = new Usuario(usuario.email, usuario.senha);
    const obj = await db.insertOne(temp);
    return obj.ops;
}

export const getUsuarioByEmail = async (email: string) => {
    const db = await dbConn();
    return await db.findOne({ "email": email });
};

//TODO implementar encriptação da senha antes de fazer a consulta.
//TODO fazer uma consulta em pessoas para saber se a mesma está ativa antes de retornar
export const login = async (usuario: Usuario) => {
    const db = await dbConn();
    const user = await db.findOne({ "email": usuario.email, "senha:": usuario.senha });
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

//TODO implementar o recebimento de mensagem do service pessoa para deletar o usuario.
export const deleteUsuarioByEmail = async (email: string) => {
    const db = await dbConn();
    const temp = await getUsuarioByEmail(email);
    const obj = await db.deleteOne({ "_id": new ObjectId(temp.id) });
    return obj.deletedCount;
};
