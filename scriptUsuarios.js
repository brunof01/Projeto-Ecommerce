async function validarUsuario(){
    const emailDigitado = document.getElementById('emailLogin').value;
    const senhaDigitada = document.getElementById('senhaLogin').value;
    try{
        const result = await dbUsuarios.allDocs({ include_docs: true});
        const usuarios = result.rows.map(row => row.doc);
        const usuarioEncontrado = usuarios.find(
            u => u.login === emailDigitado && u.senha === senhaDigitada
        );
        console.log(usuarioEncontrado.tipo);
        if (usuarioEncontrado){
            if (usuarioEncontrado.tipo === 'administrador')
                location.href = 'admin.html';
            else
                location.href = 'index.html';
        } else{
            alert("E-mail ou senha inválidos, tente novamente!");
        }
        
    } catch(error){
        alert("E-mail ou senha inválidos, tente novamente!");
        console.log("Erro ao encontrar login", error);
    }
    esconderBotão();
}

function esconderBotão(){
    const login = document.getElementById('login');
    login.classList.add('hidden');
    console.log("botão pressionado");
}

const btnLogar = document.getElementById('logar');
if (btnLogar){
    btnLogar.onclick = validarUsuario;
}

async function destruirDb(){
    if(confirm("Apagar tudo patrão?")){
        await dbUsuarios.destroy();
        await dbProdutos.destroy();
        console.log("Bancos resetados!");
    }
}

const btnDestruir = document.getElementById('destruir');
if (btnDestruir){
    btnDestruir.onclick = destruirDb;
}

async function renderizarUsuarios(){
    const tabela = document.getElementById('tabelaUsuarios');
    if (!tabela) return;
    try{
        const result = await dbUsuarios.allDocs({ include_docs: true });
        
        const usuarios = result.rows
            .map(row => row.doc)
            .filter(doc => doc._id !== 'contador_id'); 

        tabela.innerHTML = '';

        usuarios.forEach(usuario => {
            const btnExcluir = (usuario._id === 'admin') 
                ? `<button disabled class="bg-gray-300 text-gray-500 font-semibold px-2.5 py-1 rounded-md text-xs cursor-not-allowed">Protegido</button>`
                : `<button onclick="deletarUsuario('${usuario._id}')" class="bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded-md text-xs transition">Excluir</button>`;
            tabela.innerHTML += `
                <tr class="hover:bg-gray-50 transition">
                    <td class="p-3 border border-gray-300 text-sm">${usuario.nome || 'N/A'}</td>
                    <td class="p-3 border border-gray-300 text-sm">${usuario.login}</td>
                    <td class="p-3 border border-gray-300 text-sm capitalize">${usuario.tipo}</td>
                    <td class="p-3 border border-gray-300 text-center">
                        <button onclick="prepararEdicaoUsuario('${usuario._id}')" class="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-2.5 py-1 rounded-md text-xs mr-1 transition">Editar</button>
                        ${btnExcluir}
                    </td>
                </tr>
            `;
        });
    } catch(error){
        console.log("Erro ao carregar tabela de usuários:", error);
    }
}

async function manipularUsuario(){
    const idEdicao = document.getElementById('idEdicaoUsuario').value;
    const nome = document.getElementById('nomeUsuario').value;
    const email = document.getElementById('emailUsuario').value;
    const senha = document.getElementById('senhaUsuario').value;
    const tipo = document.getElementById('tipoUsuario').value;
    if (!email || (!senha && !idEdicao)){
        alert("E-mail e Senha são obrigatórios para novos usuários!");
        return;
    }
    try{
        if (idEdicao){
            const usuario = await dbUsuarios.get(idEdicao);
            usuario.nome = nome;
            usuario.login = email;
            usuario.tipo = tipo;
            if (senha) usuario.senha = senha;
            await dbUsuarios.put(usuario);
            alert("Usuário atualizado com sucesso!");
        } else{
            const novoId = await gerarId(dbUsuarios);
            await dbUsuarios.put({
                _id: novoId,
                nome: nome,
                login: email,
                senha: senha,
                tipo: tipo
            });
            alert("Novo usuário adicionado ao sistema!");
        }
        document.getElementById('idEdicaoUsuario').value = '';
        document.getElementById('nomeUsuario').value = '';
        document.getElementById('emailUsuario').value = '';
        document.getElementById('senhaUsuario').value = '';
        document.getElementById('tipoUsuario').value = 'cliente';
        
        const btnSalvar = document.getElementById('btnSalvarUsuario');
        btnSalvar.innerText = 'Adicionar';
        btnSalvar.classList.replace('bg-green-600', 'bg-blue-700');

        renderizarUsuarios();
    } catch(error){
        console.log("Erro ao salvar usuário", error);
    }
}

async function prepararEdicaoUsuario(id){
    try{
        const usuario = await dbUsuarios.get(id);
        document.getElementById('idEdicaoUsuario').value = usuario._id;
        document.getElementById('nomeUsuario').value = usuario.nome || '';
        document.getElementById('emailUsuario').value = usuario.login;
        document.getElementById('senhaUsuario').value = '';
        document.getElementById('tipoUsuario').value = usuario.tipo;

        const btnSalvar = document.getElementById('btnSalvarUsuario');
        btnSalvar.innerText = 'Atualizar Cadastro';
        btnSalvar.classList.replace('bg-blue-700', 'bg-green-600');
    } catch(error){
        console.log("Erro ao preparar edição:", error);
    }
}

async function deletarUsuario(id) {
    if (confirm("Essa ação não pode ser desfeita. Excluir usuário?")) {
        try {
            const usuario = await dbUsuarios.get(id);
            await dbUsuarios.remove(usuario);
            renderizarUsuarios();
        } catch(error) {
            console.log("Erro ao excluir usuário:", error);
        }
    }
}

const btnSalvarUsuario = document.getElementById('btnSalvarUsuario');
if (btnSalvarUsuario) {
    btnSalvarUsuario.onclick = manipularUsuario;
}

renderizarUsuarios();