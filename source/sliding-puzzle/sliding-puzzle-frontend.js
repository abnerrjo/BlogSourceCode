$(document).ready(function() {
	
	var DIMENSAO = parseInt($("#dimensao").val());
	var TAMANHO = parseInt($("#tamanho").val());
	var MARGEM = parseInt($("#margem").val());
	var VELOCIDADE = parseInt($("#velocidade").val());
	var NUM_EMBARALHOS = parseInt($("#embaralhos").val());
	
	init();
	
	function movimentar(id, direcao) {
		var bloco = $("#" + id);
		var distancia = TAMANHO + MARGEM;
		switch (direcao) {
			case Direcao.ESQUERDA:
				bloco.animate({
					left:"-=" + distancia + "px"
				}, VELOCIDADE);
				break;
			case Direcao.DIREITA:
				bloco.animate({
					left:"+=" + distancia + "px"
				},  VELOCIDADE);
				break;
			case Direcao.CIMA:
				bloco.animate({
					top:"-=" + distancia + "px"
				}, VELOCIDADE);
				break;
			case Direcao.BAIXO:
				bloco.animate({
					top:"+=" + distancia + "px"
				}, VELOCIDADE);
				break;
		}
	}

	function movimentarAleatoriamente(puzzle, ultimoASerMovimentado) {
		var movimentosPossiveis = puzzle.getMovimentosPossiveis();
		var rand;
		do {
			rand = Math.floor(Math.random() * movimentosPossiveis.length);
		} while (ultimoASerMovimentado == movimentosPossiveis[rand]);
		var blocoASeMovimentar = movimentosPossiveis[rand];
		var direcao = puzzle.move(blocoASeMovimentar);
		movimentar("c" + blocoASeMovimentar, direcao);
		return blocoASeMovimentar;
	}

	function embaralhar(puzzle, numeroVezes, callbackFunction, ultimoASerMovimentado) {
		if (numeroVezes <= 0) {
			callbackFunction();
			return;
		}
		var blocoMovimentado = movimentarAleatoriamente(puzzle, ultimoASerMovimentado);
		setTimeout(function() {
			embaralhar(puzzle, numeroVezes - 1, callbackFunction, blocoMovimentado);
		}, VELOCIDADE);
	}

	function resolver(puzzle, caminho, callbackFunction) {
		if (caminho.length == 0) {
			callbackFunction();
			return;
		}
		var blocoASeMovimentar = caminho.shift();
		var direcao = puzzle.move(blocoASeMovimentar);
		movimentar("c" + blocoASeMovimentar, direcao);
		setTimeout(function() {
			resolver(puzzle, caminho, callbackFunction);
		}, VELOCIDADE);
	}
	
	function desenharBlocos() {
		for (var i = 0; i < DIMENSAO; i++) {
			for (var j = 0; j < DIMENSAO; j++) {
				//diferente do ultimo elemento
				if (!(i == DIMENSAO - 1 && j == DIMENSAO - 1)) {
					var id = i * DIMENSAO + j + 1;
					$("#container").append("<div id='c" + id + "'>" + id + "</div>");
					var elemento = $("#c" + id);
					elemento.css("left", j * (TAMANHO + MARGEM));
					elemento.css("top", i * (TAMANHO + MARGEM));
					elemento.css("width", TAMANHO + "px");
					elemento.css("height", TAMANHO + "px");
					elemento.css("font-size", TAMANHO * 0.7);
				} 
			}
			$("#container").append("<br/>");
		}
		$("#container").css("width", (TAMANHO + MARGEM) * DIMENSAO);
		$("#container").css("height", (TAMANHO + MARGEM) * DIMENSAO);	
	}

	function init() {
		//inicia
		var puzzle = new Puzzle(DIMENSAO);
		desenharBlocos();
		//embaralha
		var funcaoEmbaralhar = function() {
			$("#embaralhar").attr("disabled", "disabled");
			$("#resolver").attr("disabled", "disabled");
			embaralhar(puzzle, NUM_EMBARALHOS, function() {
				$("#embaralhar").removeAttr("disabled");
				$("#resolver").removeAttr("disabled");
			});
		};
		$("#embaralhar").on("click", funcaoEmbaralhar);
		funcaoEmbaralhar();
		//resolve
		$("#resolver").on("click", function() {
			var caminho = puzzle.resolve();
			$("#embaralhar").attr("disabled", "disabled");
			$("#resolver").attr("disabled", "disabled");
			resolver(puzzle, caminho, function() {
				$("#embaralhar").removeAttr("disabled");
				$("#resolver").removeAttr("disabled");
			});
		});
		//move
		$("#container div").on("click", function() {
			var id = $(this).attr("id");
			var num = parseInt(id.slice(1));
			var direcao = puzzle.move(num);
			if (direcao != null) {
				movimentar(id, direcao);
			}
		});
	}
	
});
