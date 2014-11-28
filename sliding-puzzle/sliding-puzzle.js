Direcao = {
		ESQUERDA: "esquerda",
		DIREITA: "direita",
		CIMA: "cima",
		BAIXO: "baixo"
};

function Puzzle(dimensao) {
	this.tabuleiro = [];
	this.movimentos = [];
	this.dimensao = dimensao;
	this.movimentoAnterior = null;
	//preenche o array de acordo com a dimensao
	for (var i = 0; i < dimensao; i++) {
		this.tabuleiro.push([]);
		for (var j = 0; j < dimensao; j++) {
			//ultimo elemento
			if (i == this.dimensao - 1 && j == this.dimensao - 1) {
				this.tabuleiro[i].push(0);
			} else {
				this.tabuleiro[i].push(dimensao * i + j + 1);
			}
		}
	}
};

Puzzle.prototype.encontraEspacoVazio = function() {
	for (var i = 0; i < this.dimensao; i++) {
		for (var j = 0; j < this.dimensao; j++) {
			if (this.tabuleiro[i][j] == 0) {
				return [i, j];
			}
		}
	}
};

Puzzle.prototype.verificaMovimento = function(num) {
	var posicaoVazio = this.encontraEspacoVazio();
	var linha = posicaoVazio[0];
	var coluna = posicaoVazio[1];
	if (linha > 0 && num == this.tabuleiro[linha-1][coluna]) {
		return Direcao.BAIXO;
	} else if (linha < this.dimensao - 1 && num == this.tabuleiro[linha+1][coluna]) {
		return Direcao.CIMA;
	} else if (coluna > 0 && num == this.tabuleiro[linha][coluna-1]) {
		return Direcao.DIREITA;
	} else if (coluna < this.dimensao - 1 && num == this.tabuleiro[linha][coluna+1]) {
		return Direcao.ESQUERDA;
	}
};

Puzzle.prototype.swap = function(i1, j1, i2, j2) {
	var temp = this.tabuleiro[i1][j1];
	this.tabuleiro[i1][j1] = this.tabuleiro[i2][j2];
	this.tabuleiro[i2][j2] = temp;
}

Puzzle.prototype.move = function(num) {
	var movimento = this.verificaMovimento(num);
	if (movimento != null) {
		var posicaoVazio = this.encontraEspacoVazio();
		var linha = posicaoVazio[0];
		var coluna = posicaoVazio[1];
		switch (movimento) {
			case Direcao.ESQUERDA:
				this.swap(linha, coluna, linha, coluna + 1);
				break;
			case Direcao.DIREITA:
				this.swap(linha, coluna, linha, coluna - 1);
				break;
			case Direcao.CIMA:
				this.swap(linha, coluna, linha + 1, coluna);
				break;
			case Direcao.BAIXO:
				this.swap(linha, coluna, linha - 1, coluna);
				break;
		}
		if (movimento != null) {
			this.movimentos.push(num);
			this.movimentoAnterior = num;
		}
		return movimento;
	}
};

Puzzle.prototype.getMovimentosPossiveis = function() {
	var movimentosPossiveis = [];
	for (var i = 0; i < this.dimensao; i++) {
		for (var j = 0; j < this.dimensao; j++) {
			var num = this.tabuleiro[i][j];
			if (this.verificaMovimento(num) != null) {
				movimentosPossiveis.push(num);
			}
		}
	}
	return movimentosPossiveis;
};

Puzzle.prototype.calculaDistancia = function() {
	var distancia = 0;
	for (var i = 0; i < this.dimensao; i++) {
		for (var j = 0; j < this.dimensao; j++) {
			var num = this.tabuleiro[i][j];
			if (num != 0) {
				var linhaOriginal = Math.floor((num - 1) / this.dimensao);
				var colunaColuna = (num - 1) % this.dimensao;
				distancia += Math.abs(i - linhaOriginal) + Math.abs(j - colunaColuna);
			}
		}
	}
	return distancia;
};

Puzzle.prototype.getCopia = function() {
	var novoPuzzle = new Puzzle(this.dimensao);
	for (var i = 0; i < this.dimensao; i++) {
		for (var j = 0; j < this.dimensao; j++) {
			novoPuzzle.tabuleiro[i][j] = this.tabuleiro[i][j];
		}
	}
	for (var i = 0; i < this.movimentos.length; i++) {
		novoPuzzle.movimentos.push(this.movimentos[i]);
	}
	return novoPuzzle;
};

Puzzle.prototype.resolve = function() {
	var candidatos = new MinHeap(null, function(a, b) {
		return a.distancia - b.distancia;
	});
	var distanciaInicial = this.calculaDistancia();
	var puzzleInicial = this.getCopia();
	puzzleInicial.movimentos = [];
	candidatos.push({puzzle: puzzleInicial, distancia: distanciaInicial});
	while (candidatos.size() > 0) {
		var candidato = candidatos.pop().puzzle;
		var distancia = candidato.calculaDistancia();
		if (distancia == 0) {
			return candidato.movimentos;
		}
		var movimentosPossiveis = candidato.getMovimentosPossiveis();
		for (var i = 0; i < movimentosPossiveis.length; i++) {
			var numero = movimentosPossiveis[i];
			if (numero != candidato.movimentoAnterior) {
				var novoPuzzle = candidato.getCopia();
				novoPuzzle.move(numero);
				var novaDistancia = novoPuzzle.calculaDistancia() + novoPuzzle.movimentos.length;
				candidatos.push({puzzle: novoPuzzle, distancia: novaDistancia});
			}
		}
	}
};
