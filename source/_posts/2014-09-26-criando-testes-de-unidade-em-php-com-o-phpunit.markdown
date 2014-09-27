---
layout: post
title: "Criando testes de unidade em PHP com o PHPUnit"
date: 2014-09-26 19:04:37 -0300
comments: true
categories: [PHP, Tutoriais]
---
Olá, pessoas e alienígenas (estou na esperança de que este post seja preservado como tesouro histórico da humanidade e esteja sendo lido por outras civilizações extraterrestres neste momento).

Neste post aprenderemos a fazer algo que toooodo mundo gosta, é praticamente como comer bolo (existe alguém que não goste de bolo?!) do mundo da programação: TESTES! Uhuu! Me emocionei só de falar. 

Nosso foco, porém, são os testes em PHP usando a ferramente PHPUnit. É mamão com açúcar, acompanha comigo.

<!-- more -->

## Instalando a ferramenta

Instalar a ferramenta é fácil fácil... Se você usa Linux, é claro. ;) (Mas se não usa também!)

Estou presumindo aqui que você já tenha PHP instalado, juntamente com um servidor e blablabla. 

Para instalar o PHPUnit, usaremos o incrível **Composer**, um gerenciador de dependência bastante popular na comunidade PHP. 

Baixe o Composer através [desse site](https://getcomposer.org/download/) (lá embaixo, em Manual Download), e coloque-o dentro da pasta de seu projeto. 

Agora crie um arquivo dentro da pasta de seu projeto chamado **composer.json**, e coloque dentro dele o seguinte texto:

``` Javascript
{
    "require-dev": {
        "phpunit/phpunit": "4.2.*",
	"phpunit/php-invoker": "*"
    }
}

```

Explico! Para instalar as dependência (no nosso caso, o PHPUnit), o Composer recebe um arquivo no formato JSON, onde você simplesmente só precisa colocar o nome da dependência como *node* de "*require-dev*" e ele irá automagicamente instalá-lo pra você. Fantástico, não é? :D

Bem, feito isso, abra o terminal, vá até a pasta de seu projeto, e digite a seguinte linha de comando:

``` Bash
php composer.phar install
```

E pronto! O Composer vá se encarregar agora de instalar pra você.

Para rodar a ferramenta, basta digitar no terminal:

``` Bash
php ./vendor/bin/phpunit <Arquivo_De_Teste>
```

Mas como ainda não temos nenhum teste, nada de especial irá acontecer.

## Criando testes 

Agora a parte que nos interessa de fato. Criar testes também é muito fácil com o PHPUnit. Qualquer pessoa que já usou alguma ferramenta como o JUnit vai se sentir muito a vontade. Vamos lá!

> Mas, ô seu idiota, não temos nada o que testar!

Calma, jovem gafanhoto. Já me encarregarei disto. Por motivos didáticos, vamos testar essa simples classe escrita em PHP que representa um número em notação científica.

{% include_code ScientificNotation.php %}

Como você pode ver, esta é uma classe bem simples. Vamos lembrar um pouquinho de matemática de ensino médio para entender seu comportamento... ([Clique aqui](#tests) caso queira pular essa parte)

Primeiro, todo número em notação científica é composto por duas partes: A mantissa (a parte "literal" do número) e o exponente. Por exemplo, no número:
	
2,5 x 10^8

A mantissa é 2,5 e o exponente é 8. 

Segundo, na multiplicação entre números em notação científica, multiplicamos as mantissas e somamos os expoentes. Por exemplo:

(2,5 x 10^8) x (2,0 x 10^2) = (5,0 x 10^10)

E a divisão segue o mesmo princípio, divindo as mantissas e subtraindo os expoentes.

A adição e a subtração é um pouco problemática, porque ela só é permitida entre números que possuem o mesmo expoente. Neste caso, simplesmente somamos ou subtraímos as mantissas e mantemos os expoentes.

A normalização de um número em notação científica é transformar sua mantissa em um número de um digito. Ao fazer isso, incrementamos ou decrementamos seu expoente.

<div id="tests"></div>
**Done**! Agora vamos criar os testes.

Crie um arquivo chamado **ScientificNotationTest.php**. Este arquivo deve ter a seguinte estrutura:

``` PHP 
<?php
class ScientificNotationTest extends PHPUnit_Framework_TestCase {
	
}
?>
```

Essa é a estrutura padrão de um teste em PHP. Perceba que ele deve herdar da classe **PHPUnit_Framework_TestCase**. 

Além disso, é importante importar o arquivo onde está a classe que será testada. Isso geralmente é feita dentro do método **setUp**, um método especial que é chamado antes de cada teste. Nossa classe de teste então deve estar assim:

``` PHP 
<?php
class ScientificNotationTest extends PHPUnit_Framework_TestCase {

	public function setUp() {
		require_once 'ScientificNotation.php';
	}

}
?>
```

OK! Agora vamos criar os testes propriamente ditos. Os métodos que contém os testes devem *sempre* ter o prefixo **test**. Exemplo: testXXX, testXYZ, ...

O primeiro teste que vamos criar é para a multiplicação. Primeiro, criemos duas instâncias quaisquer da classe e chamemos o método *multiply*.

``` PHP 
public function testMultiply() {
	$number1 = new ScientificNotation(2.0, 3);
	$number2 = new ScientificNotation(4.0, 2);
	$number1->multiply($number2);
}
```

Agora vamos testar algumas asserções. As asserções que eu mais uso são: *testEquals* (testa de dois objetos são iguais), *assertTrue* (testa se uma condição é verdadeira) e *assertFalse*. Você pode ver uma lista completa [aqui](https://phpunit.de/manual/current/en/appendixes.assertions.html). Logo, nosso método ficou assim:

``` PHP 
public function testMultiply() {
	$number1 = new ScientificNotation(2.0, 3);
	$number2 = new ScientificNotation(4.0, 2);
	$number1->multiply($number2);
	$this->assertEquals(8.0, $number1->getMantissa());
	$this->assertEquals(5, $number1->getExponent());
}
```

Fácil, não é? :)

Vamos pular a divisão, que possuí uma lógica análoga ao da multiplicação, e vamos direto ao da adição.

O método da adição deve lançar uma exceção caso o número passado seja de uma base diferente do número atual. Como testar isso?

Simples! Encapsule a chamada de método em um try/catch, e faça com que o teste falhe caso o código *passe* do ponto onde deveria lançar exceção. Exemplo:

``` PHP
try {
	//should throw exception here
	$this->fail();
} catch(Exception $e) { } 
```

Com isso, nosso método de testar adição está assim:

``` PHP 
public function testAdd() {
	//must be ok
	$number1 = new ScientificNotation(2.0, 5);
	$number2 = new ScientificNotation(4.0, 5);
	$number1->add($number2);
	$this->assertEquals(6.0, $number1->getMantissa());
	$this->assertEquals(5, $number1->getExponent());
	//must throw exception
	$number1 = new ScientificNotation(3.0, 4);
	$number2 = new ScientificNotation(2.0, 3);
	try {
		$number1->add($number2);
		$this->fail();
	} catch(Exception $e) { } 
}
```

No final, éis nossa classe de testes completa:

{% include_code ScientificNotationTest.php %}

Para rodar o teste, digite no terminal:

``` Bash
php ./vendor/bin/phpunit ScientificNotationTest.php
```

## Criando uma suite de testes

O exemplo acima serve se quisermos rodar apenas um teste, mas e quando queremos rodar vários testes de uma só vez? Bem, você poderia criar uma pasta, colocar os testes lá e mandar o PHPUnit rodar a pasta como arquivo de teste. Entretanto, a maneira mais *elegante* de se fazer isso é com um arquivo de configuração.

É fácil! Na raiz do projeto, crie um arquivo chamado **phpunit.xml**. Este arquivo deve ter a seguinte estrutura:

``` XML
<?xml version="1.0" encoding="UTF-8" ?>
<phpunit>
    <testsuites>
		<testsuite name="">
		</testsuite>
  </testsuites>
</phpunit>
```

Para cada suite de testes, basta adicionar um novo nó do tipo "*testsuite*" ao nó "*testsuites*". É importante nomear as suites para que seja possível distinguí-las.
Para adicionar um arquivo à uma suite, basta adicionar um novo nó do tipo "*file*" ao nó "*testsuite*". Exemplo:

``` XML
<?xml version="1.0" encoding="UTF-8" ?>
<phpunit>
	<testsuites>
		<testsuite name="suite1">
			<file>ScientificNotationTest.php</file>
		</testsuite>
	</testsuites>
</phpunit>
```

Agora para rodar o test suite, basta digitar no terminal:

``` Bash
php ./vendor/bin/phpunit --testsuite <Nome>
```

Onde *`<Nome>`* é o nome do test suite. 

## Verificando a cobertura dos testes

Uma coisa interessante que gostaria de ressaltar também neste tutorial é a cobertura dos testes. Essa é uma informação importante, tanto para você quanto para seu chefe/cliente. Quanto maior a cobertura, maior a confiança que seus testes passam. 

Para rodar a ferramenta de cobertura de testes, é necessário instalar o **XDebug**. Se você usa o Windows, você pode instalá-lo facilmente através [desse link](http://www.xdebug.org/download.php). Caso use o Ubuntu, você pode instalá-lo de maneira ainda mais fácil:

``` Bash
sudo apt-get install php5-xdebug
```

Agora que você já tem o xDebug, para rodar a análise, simplesmente digite no terminal:

``` Bash
php ./vendor/bin/phpunit --coverage-<TIpo_De_Saida> <Arquivo_de_Saida>
``` 

O *`<Tipo_de_Saida>`* pode ser em vários formatos. Por exemplo: HTML, XML, PHP... É como você irá visualizar os resultados, e *`<Arquivo_de_Saida>`* é o... arquivo de saída! Exemplo:

``` Bash
php ./vendor/bin/phpunit --coverage-html resultado
``` 

Irá gerar uma página HTML com os resultados. Quando abro ela análise os testes que fiz acima, visualizo a seguinte análise:

![]({{ root_url }}/images/posts/phpunit-coverage.png)

:)