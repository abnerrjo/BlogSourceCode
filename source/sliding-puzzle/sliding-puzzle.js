Direcao = {
		ESQUERDA: "esquerda",
		DIREITA: "direita",
		CIMA: "cima",
		BAIXO: "baixo"
};

function Puzzle(dimensao) {
	this.tabuleiro = [];
	this.dimensao = dimensao;
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
	var rand = Math.floor(Math.random() * movimentosPossiveis.length);
	return movimentosPossiveis[rand];
}
