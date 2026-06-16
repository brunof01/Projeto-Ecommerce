const dbProdutos = new PouchDB('beyblade_produtos');
const dbUsuarios = new PouchDB('beyblade_usuarios');

async function criarAdm(){
    try{
        await dbUsuarios.get('admin');
    } catch{
        await dbUsuarios.put({
            _id: 'admin',
            login: 'ADM',
            senha: 'ADM',
            tipo: 'administrador'
        });
    }
}

async function criarCliente(){
    try{
        await dbUsuarios.get('cliente');
    } catch{
        await dbUsuarios.put({
            _id: 'cliente',
            login: 'teste',
            senha: 'teste',
            tipo: 'cliente'
        });
    }
}

criarAdm();
criarCliente();

async function gerarId(db){
    try{
        const contador = await db.get('contador_id');
        contador.valor += 1;
        await db.put(contador);
        return contador.valor.toString();
    } catch{
        await db.put({ _id: 'contador_id', valor: 1});
        return "1";
    }
}