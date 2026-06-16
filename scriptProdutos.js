async function renderizarProdutos(){
    const tabela = document.getElementById('tabelaProdutos');
    if (!tabela) return;
    try{
        const result = await dbProdutos.allDocs({ include_docs: true });
        
        const produtos = result.rows
            .map(row => row.doc)
            .filter(doc => doc._id !== 'contador_id');

        tabela.innerHTML = '';

        produtos.forEach(produto => {
            tabela.innerHTML += `
                <tr class="hover:bg-gray-50 transition">
                    <td class="p-2 border border-gray-300 text-center w-20">
                        <div class="bg-slate-200 rounded-md p-1">
                            <img src="${produto.imagem}" alt="${produto.nome}" class="h-10 w-full object-contain">
                        </div>
                    </td>
                    <td class="p-3 border border-gray-300 text-sm font-bold">${produto.nome}</td>
                    <td class="p-3 border border-gray-300 text-sm text-green-600 font-bold">R$ ${produto.preco}</td>
                    <td class="p-3 border border-gray-300 text-sm capitalize">${produto.geracao}</td>
                    <td class="p-3 border border-gray-300 text-center">
                        <button onclick="deletarProduto('${produto._id}')" class="bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded-md text-xs transition">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch(error){
        console.log("Erro ao carregar tabela de produtos:", error);
    }
}

async function cadastrarProduto(){
    const nome = document.getElementById('nomeProduto').value;
    const preco = document.getElementById('precoProduto').value;
    const geracao = document.getElementById('geracaoProduto').value;
    const imagem = document.getElementById('imagemProduto').value;
    const descricao = document.getElementById('descricaoProduto').value;

    if (!nome || !preco){
        alert("Nome e Preço são obrigatórios!");
        return;
    }

    try{
        const novoId = await gerarId(dbProdutos); 
        await dbProdutos.put({
            _id: novoId,
            nome: nome,
            preco: preco,
            geracao: geracao,
            imagem: imagem,
            descricao: descricao
        });
        
        alert("Produto cadastrado!");
        document.getElementById('nomeProduto').value = '';
        document.getElementById('precoProduto').value = '';
        document.getElementById('geracaoProduto').value = 'plastico';
        document.getElementById('imagemProduto').value = '';
        document.getElementById('descricaoProduto').value = '';

        renderizarProdutos();
    } catch (error){
        console.log("Erro ao salvar o produto:", error);
    }
}

async function deletarProduto(id){
    if (confirm("Quer deletar o produto?")){
        try{
            const produto = await dbProdutos.get(id);
            await dbProdutos.remove(produto);
            renderizarProdutos();
        } catch(error){
            console.log("Erro ao excluir produto:", error);
        }
    }
}

const btnSalvarProduto = document.getElementById('btnSalvarProduto');
if (btnSalvarProduto){
    btnSalvarProduto.onclick = cadastrarProduto;
}

renderizarProdutos();

function abrirDetalhesProduto(idProduto){
    localStorage.setItem('produtoSelecionado', idProduto);
    location.href = 'detalhesProdutos.html';
}

async function renderizarHome(categoria = 'todas'){
    const gridDestaques = document.getElementById('gridDestaques');
    const gridTodos = document.getElementById('gridTodos');
    const tituloOutros = document.getElementById('tituloOutros');
    //if (!gridDestaques) return;

    try{
        const result = await dbProdutos.allDocs({ include_docs: true });
        let produtos = result.rows
            .map(row => row.doc)
            .filter(doc => doc._id !== 'contador_id');

        if (categoria !== 'todas'){
            produtos = produtos.filter(p => p.geracao === categoria);
            document.getElementById('tituloDestaque').innerText = `Produtos de categoria ${categoria}`;
        } else{
            document.getElementById('tituloDestaque').innerText = 'Produtos em destaque';
        }

        gridDestaques.innerHTML = '';
        if (gridTodos) gridTodos.innerHTML = '';

        if (produtos.length === 0){
            gridDestaques.innerHTML = '<p class="text-gray-300">Nenhum produto cadastrado</p>';
            return;
        }
        const destaques = produtos.slice(0, 4);
        const outros = produtos.slice(4);

        const criarCardHTML = (produto) => `
            <div class="bg-white rounded-xl p-4 shadow-lg text-black flex flex-col">
                <div class="bg-slate-200 rounded-lg w-full h-32 flex items-center justify-center mb-3">
                    <img src="${produto.imagem}" alt="${produto.nome}" class="object-contain h-full">
                </div>
                <h3 class="text-xl font-bold capitalize">${produto.nome}</h3>
                <p class="text-gray-600 text-sm mb-2">Geração: <span class="capitalize">${produto.geracao}</span></p>
                <p class="text-xl font-bold text-green-600 mb-3 mt-auto">R$ ${produto.preco}</p>
                <button onclick="abrirDetalhesProduto('${produto._id}')" class="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-4 py-2 transition">Ver Detalhes</button>
            </div>
        `;

        destaques.forEach(produto => {
            gridDestaques.innerHTML += criarCardHTML(produto);
        });

        if (outros.length > 0){
            tituloOutros.classList.remove('hidden');
            outros.forEach(produto => {
                gridTodos.innerHTML += criarCardHTML(produto);
            });
        } else{
            tituloOutros.classList.add('hidden');
        }

    } catch(error){
        console.log("Erro ao carregar a Home:", error);
    }
}

renderizarHome();

async function carregarDetalhesProduto(){
    const nomeEl = document.getElementById('detalheNome');
    if (!nomeEl) return;
    const idProduto = localStorage.getItem('produtoSelecionado');

    try{
        const produto = await dbProdutos.get(idProduto);

        document.getElementById('detalheImagem').src = produto.imagem;
        document.getElementById('detalheImagem').alt = produto.nome;
        nomeEl.innerText = produto.nome;
        document.getElementById('detalheGeracao').innerText = produto.geracao;
        document.getElementById('detalheDescricao').innerText = produto.descricao;
        document.getElementById('detalhePreco').innerText = `R$ ${produto.preco}`;

    } catch (error){
        console.log("Erro ao carregar os detalhes:", error);
        alert("Ops! Este equipamento não foi encontrado ou foi removido do estoque.");
        location.href = 'index.html';
    }
}

carregarDetalhesProduto();