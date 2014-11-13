---
layout: post
title: "Gerenciando sessões em PHP"
date: 2014-11-12 20:40:47 -0300
comments: true
categories: [Tutoriais, PHP]
---
HTTP é como uma velha com Alzheimer: Esquece tudo. Esquecer é legal às vezes, mas recordar é viver. Às vezes você simplesmente quer manter certos dados do usuário que está acessando a página naquele momento. Aí a natureza *stateless* do HTTP não ajuda, você precisa de outros artifícios. Na maioria das linguagens de backend, existem duas maneiras de persistir dados de maneira temporária:

- Cookies
- Sessions

Existem algumas diferenças substanciais entre as duas técnicas:

<!-- more -->
- Cookies permanecem no browser do usuário, enquanto que sessions permanecem no próprio servidor;
- Geralmente, cookies persistem por mais tempo do que sessions, que duram até o usuário fechar o navegador;
- Sessions suportam uma maior quantidade de dados.

Neste tutorial vamos nos focar em sessions.

## Iniciando uma sessão
Para iniciar uma sessão, use o método session_start().

``` PHP
<?php
session_start();
//$_SESSION diz: me use!!!
?>
```

Sessões são acessíveis através da variável super-global $_SESSION. Esta variável é uma array simples, e por baixo seus valores são persistidos através de um arquivo na máquina do servidor. Para identificar o usuário, sessões utilizam de um pequeno cookie carregando um ID único.

Geralmente sessões se iniciam automaticamente depois da primeira vez iniciada. Este comportamento está definido no parâmetro *session.auto_start*, no arquivo *php.ini*. Por isso, é uma boa prática sempre antes de iniciar a sessão verificar se ela já existe:

``` PHP
if (!isset($_SESSION)) {
	session_start();
}
```

A partir da versão 5.3, o PHP irá mostrar uma mensagem de erro caso tente iniciar uma sessão já iniciada.

## Criando variáveis
Criar variáveis de sessão é estupidamente simples. Basta definir o valor de uma chave do array. Exemplo:

``` PHP
<?php
if (!isset($_SESSION)) {
	session_start();
}
$_SESSION["nome"] = "Abner";
?>
```

## Acessando variáveis
Para acessar variáveis, antes você deve iniciar a sessão. Após a sessão ser iniciada, todas as variáveis de sessão estão acessíveis e você pode acessá-las do modo que você faria com uma array normal (o que de fato é! :-)).

``` PHP
<?php
echo $_SESSION["nome"]; //Abner
?>
```

## Modificando variáveis
Basta definir o valor. Caso aquela chave já exista, ela será sobreescrita.

``` PHP
<?php
$_SESSION["nome"] = "Ana"; //sobreescreveu o que havia antes
?>
```

## Deletando variáveis ou a sessão inteira
Para deletar uma variável de sessão, basta usar o método unset, como você faria para qualquer outra variável.

``` PHP
<?php
unset($_SESSION["nome"]); //variável é apagada da sessão
?>
```

Mas se você deseja remover todas as variáveis de uma vez, a maneira de se fazer isso é com o método session_unset.

``` PHP
<?php
session_unset();
?>
``` 

Note que este método está deprecated. A maneira moderna de se fazer isso é simplesmente setando $_SESSION para uma nova array.

``` PHP
<?php
$_SESSION = array();
?> 
```

E aí o Garbage Collector se encarregará de liberar as variáveis antigas.
 
E ainda, se você deseja realmente destruir a sessão, você pode usar session_destroy.

``` PHP
<?php
session_destroy();
?>
```

Enquanto que esse método destrói o arquivo correspondente à sessão do usuário, na mesma página as variáveis de sessão ainda são acessíveis. Por isso é recomendado que você primeiro delete todas as variáveis para depois destruir a sessão.

## Conclusão
Gerenciamento de sessões em PHP é estupidamente simples. Espero que vocês tenham gostado do tutorial :P

E lembrem-se: Não trate como cookie quem te trata como sessão. vlwflw
