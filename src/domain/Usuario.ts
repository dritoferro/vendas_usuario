export class Usuario {
    _id: string;
    email: string;
    senha: string;

    constructor(email: string, senha: string, id?: string) {
        this.email = email;
        this.senha = senha;
        this._id = id;
    }
}
