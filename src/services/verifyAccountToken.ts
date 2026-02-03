import { MercadoPagoConfig, User } from "mercadopago";

const verifyAccountToken = async (token: string): Promise<boolean> => {
    // Configuração de conta do mercado pago
    const account = new MercadoPagoConfig({ accessToken: token });

    // Instanciação do serviço de usuário
    const userAPI = new User(account);

    try {
        // Tentativa de obter os dados do usuário
        const userInfo = await userAPI.get();

        // Verificação se o ID do usuário foi obtido
        return userInfo.id !== undefined;
    }catch(error){
        // Em caso de erro, retorna falso
        return false;
    }
}

export default verifyAccountToken;