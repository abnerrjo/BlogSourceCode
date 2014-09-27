---
layout: post
title: "Criando seu blog no Github"
date: 2014-09-16 23:32:43 -0300
comments: true
categories: [Tutoriais]
---
Olá, mundo! Sejam bem-vindos ao meu novíssimo blog (infelizmente, o antigo foi pro espaço...). Aqui vocês poderão encontrar tutoriais e dicas sobre programação em geral. E como não poderia deixar de ser, meu primeiro post tratará justamente de como criar seu blog no Github!

### Por que criar um blog no Github?

O Github é fantástico. Ele permite que você hospede páginas estáticas de graça. E utilizando poucas ferramentas, podemos criar um blog muito mais profissional e poderoso que o Blogger, ideal para compartilhar código. Claro, não chega a ser tão bom quanto o Wordpress, mas acho que para os propósitos de um programador cai bem.

### Estou interessado! Por onde começo?

Bem, eu penei bastante até conseguir dar deploy neste blog, mas depois algumas noites acabei descobrindo passos bem simples, que são esses que irei descrever agora.

<!-- more -->

**Requisitos necessários:**
- Linux (Sim. Infelizmente, ainda não há uma maneira simples de fazer isso no Windows...);
- Git instalado (Meio óbvio).

A primeira coisa a se fazer é criar um repositório no Github. Mas não basta ser qualquer repositório, deve ser um repositório que tenha a seguinte nomenclatura:

```
<Seu_Nick_No_Github>.github.io
```

Explico! Através do mecanismo **Github pages**, o Github permite a hospedagem de sites estáticos de graça, como bem falado anteriormente. O problema é que ele só permite uma página por usuário, e por padrão essa página deve estar em um repositório de mesmo nome do usuário, com adição do "*github.io*" que juntos representam o endereço do site.

Criado o repositório, precisamos de uma ferramenta que crie a estrutura básica de um blog e que nos permita criar postagens com facilidade. Essa ferramenta se chama **Jekyll**.

Podemos instalar o Jekyll e todas as suas dependências através de uma simples linha de comando:

``` Bash
gem install github-pages
``` 

Além do Jekyll, o comando acima tentará também instalar o Ruby, já que ele é construído sob essa linguagem. 

Mesmo assim, o Jekyll ainda é muito simples, e pode ser tedioso construir todo o template de seu blog manualmente. Por isso, usaremos mais uma ferramenta, chamada **Octopress**.

O Octopress existe para facilitar diversas operações. Através de seu Rake podemos criar posts, trocar temas, tudo com uma linha de comando.

Configurar o Octopress é bastante simples. Primeiro você deve clonar seu repositório.

``` Bash
git clone git://github.com/imathis/octopress.git octopress
cd octopress
```
Em seguida, instale suas dependências.

``` Bash
bundle install
```

E por fim configure-o para que ele possa dar deploy para o Github de maneira automática.

``` Bash
rake setup_github_pages
```

Pronto! Com isto já podemos começar a blogar! :D

Para criar seu primeiro post, digite o seguinte comando no terminal:

``` Bash
rake new_post["Titulo"] 
```

Com isto ele irá gerar um arquivo no formato markdown dentro da pasta source/_posts. Markdown é uma linguagem de marcação que serve como uma versão mais limpa e simples do HTML. Você pode obter mais informações sobre ele [aqui](http://en.wikipedia.org/wiki/Markdown). É simples, não demora muito pegar o jeito da coisa!

**Dica 1:**
Você pode configurar um <i>preview</i> do post (o famoso <i>"read more"</i>). Basta adicionar a linha

``` HTML
<!-- more -->
```

onde você quiser que acabe o preview.

**Dica 2:**
Claro, não poderia defender que o Octopress é uma ótima plataforma para programadores se não desse surporte à highlight de código. Atualmente ele suporte mais de 100 linguagens de programação. Adicionar um bloco de código é bem simples. Basta usar a seguinte síntaxe:

```
` ` ` [Linguagem]
    codigo2
` ` `
```
**PS:** Remova os espaços em branco entre os apóstrofos.

Exemplo:

```
` ` ` Java
public class HelloWorld {
	public static void main(String[] args) {
		System.out.println("Hello World");
	}
}
` ` `
```

Irá gerar o seguinte texto:

``` Java
public class HelloWorld {
	public static void main(String[] args) {
		System.out.println("Hello World");
	}
}
```
Que bonitinho. :-)

Existem outras maneiras legais, você pode até copiar o código-fonte de um arquivo. Para aprender mais, convido vocês a acessarem [esse link](http://octopress.org/docs/blogging/code/), é realmente interessante!

### Visualizando nosso blog

Visualizar nosso blog durante a produção é importante. O Jekyll nos fornece uma maneira de testar nosso blog através do <i>localhost</i>. Para isso, dentro da pasta do blog, digite o seguinte comando:

``` Bash
rake preview
```

E a partir daí basta acessar o endereço [http://localhost:4000](http://localhost:4000) e ver o blog rodando! :D

### Dando deploy no blog
Agora precisamos colocá-lo no ar! Para isso, basta dar o seguinte comando:

``` Bash
rake generate
rake deploy
```

Na primeira vez ele irá perguntar coisas como o link do seu repositório e sua conta, mas a partir daí ele irá commitar tudo de maneira automática.

### Aplicando temas
Por fim, acho importante destacar esta parte. Apesar de que o Octopress já venha com um belo tema, é possível instalar temas de terceiros, e é bem simples!

[Esse site](https://github.com/imathis/octopress/wiki/3rd-Party-Octopress-Themes) contém uma lista de vários temas para o Octopress. Instalá-los seguem uma metodologia semelhante:
Clone-os para dentro da pasta .theme, que existe dentro da pasta de seu blog. Exemplo:

```
git clone XXX .theme/XXX
```

Após ter feito isto, basta digitar:

``` Bash
rake install['XXX']
rake generate
```

Ele irá perguntar se você realmente deseja substituir os arquivos, o qual você dirá que sim (y). E a partir daí é só desfrutar do novo tema! :D


É muito simples, não é não?! 
Espero que tenham gostado desse tutorial. Aqui vai alguns links interessantes para aprofundar as coisas que falamos aqui.

+ [http://jekyllrb.com/docs/home/](http://jekyllrb.com/docs/home/)
+ [http://octopress.org/docs/](http://octopress.org/docs/)
+ [https://pages.github.com/](https://pages.github.com/)

Boa sorte com seu novo blog! Qualquer dúvida, caso algum passo tenha ficado obscura ou não tenha funcionado, os comentários estão sempre abertos!