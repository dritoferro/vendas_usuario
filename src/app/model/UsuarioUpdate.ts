export class UsuarioUpdate {
    email: string;
    senhaAtual: string;
    senhaNova: string;

    constructor(email: string, senhaAtual: string, senhaNova: string) {
        this.email = email;
        this.senhaAtual = senhaAtual;
        this.senhaNova = senhaNova;
    }
}
