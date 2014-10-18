---
layout: post
title: "Pequenas coisas que podem tornar seus programas em Java melhores"
date: 2014-10-18 11:17:45 -0300
comments: true
categories: [Java, Tutoriais]
---
Há alguns meses venho lendo o livro [Refactoring: Improving the design of existing code](http://www.amazon.com/Refactoring-Improving-Design-Existing-Code/dp/0201485672), de Martin Fowler.
O livro é clássico, e de certa forma mudou minha maneira de pensar em design de software, principalmente nas linguagens orientadas a objetos. 

No livro existem dezenas ou até centenas de exemplos e dicas. Eu aqui reuni **cinco** dicas que considero mais fáceis e simples de serem aplicadas mas que ainda assim possuam algum impacto sobre a qualidade do software. Essas dicas, embora tenham a influência do livro, também contam com minha própria experiência.

Usarei Java porque tanto é a linguagem usada como modelo no livro quanto é a que eu mais tenho familiaridade.

<!-- more -->

## 1. Não crie um método "set" para um atributo se você não vai alterá-lo
Essa dica parece ser besta, e é mesmo, mas muuuuitas pessoas acabam criando métodos "get" e "set" desnecessariamente. 
Embora isso não vá causar uma catástrofe à curto prazo, isso acaba violando um dos princípios do paradigma orientado a objetos, que é o controle da informação.

Quando você permite que seus dados sejam abertos à modificação sem necessidade, e que a alteração até cause algum mau-funcionamento, então você está deixando uma brecha para um possível bug no futuro.

## 2. Não permita classes modificarem coleções de outras
Essa dica parece ser contraditória e até errônea a princípio. Na verdade, classes podem e devem modificar coleções e dados de outra classe (dentro de um limite), o que não é *legal* é que essa modificação seja feita de maneira **direta**. Nada melhor do que um exemplo para ilustrar o que quero dizer.

``` Java Sistema.java
public class Sistema {

	private Set<Usuario> usuarios;
	
	public void setUsers(Set<Usuario> usuarios) {
		this.usuarios = usuarios;
	}
	
	public Set<Usuario> getUsuarios() {
		return this.usuarios;
	}
	
	...
	
}
```
``` Java InvasorDePrivacidade.java
public class InvasorDePrivacidade {

	private Sistema sistema;
	
	public boolean adicionaUsuario(String login, String senha) {
		return sistema.getUsuarios().add(new Usuario(login, senha));
	}
	
	public boolean removeUsuario(Usuario usuario) {
		return sistema.getUsuarios().remove(usuario);
	}
	
	...
	
}
``` 
Esse foi um exemplo bem simples. Qual o problema desse design?

O problema é que a classe "InvasorDePrivacidade" está adicionando e removendo elementos da coleção "usuarios" de Sistema de maneira direta. O que isso pode acarretar? Um grande decréscimo de **segurança**. Agora qualquer classe do programa pode remover ou adicionar usuários no sistema! Não existe mais controle ou "sentinela" do que é permitido ser adicionado ou removido.

Outro problema presente ali, desta vez um pouco mais sutil, é a criação do objeto do tipo "Usuario" dentro de um local inapropriado. Se formos espalhar a construção de objetos em vários pontos do nosso programa, o que acontecerá se quisermos alterar o construtor, adicionando ou removendo parâmetros? Usaríamos overload para usar o "novo" construtor nas novas chamadas? Procuraríamos e atualizariamos as chamadas antigas ao construtor um por um? E se o construtor lançar exceções? Também teríamos que tratar essas exceções em todos os pontos onde o construtor é chamado?

Tudo isso poderia ser resolvido se passarsemos a responsabilidade de adicionar ou remover usuários exclusivamente à classe "Sistema", proibindo outras classes de fazer isso. 

``` Java Sistema.java
public class Sistema {

	private Set<Usuario> usuarios;
	
	public void setUsers(Set<Usuario> usuarios) {
		this.usuarios = usuarios;
	}
	
	public Set<Usuario> getUsuarios() {
		return this.usuarios;
	}
	
	public boolean adicionaUsuario(String login, String senha) {
		return this.usuarios.add(new Usuario(login, senha));
	}
	
	public boolean removeUsuario(Usuario usuario) {
		return this.usuarios.remove(usuario);
	}
	
	...
	
}
```
``` Java InvasorDePrivacidade.java
public class InvasorDePrivacidade {

	private Sistema sistema;
	
	public boolean adicionaUsuario(String login, String senha) {
		return sistema.adicionaUsuario(login, senha);
	}
	
	public boolean removeUsuario(Usuario usuario) {
		return sistema.remove(usuario);
	}
	
	...
	
}
``` 
O problema de segurança foi resolvido na classe "InvasorDePrivacidade", mas a brecha ainda existe para outras classes através dos métodos "set" e "get" da classe "Sistema". 

O problema do "set" recai à dica #1 deste tutorial. Ele é realmente necessário? A resposta é **não**. Métodos "set" para coleções quase nunca são necessários.

O "get" realmente parece ser inevitável. Em uma hora ou outra teremos que acessar a lista de usuários. Porém, podemos minimizar o problema ao fazer com que a lista retornada pelo método "get" seja:

1. Uma cópia da original. Portanto, modificações feitas através do método get não irão afetar em nada.
2. Uma *unmodifiable collection*.

A segunda opção parece ser a mais elegante. Java permite o uso de uma *unmodifiable collection*, que basicamente é uma cópia da coleção original, com a diferença de que ele não apenas não permite que se altere a lista como lança exceção ao fazê-lo. Isso já é um grande auxílio na hora de debugar o programa.

Se você acessar a classe "Collections", verá vários métodos utilitários que tornam coleções do tipo "unmodifiable". Os métodos mais comuns são:

- Collections.unmodifiableList(listaOriginal);
- Collections.unmodifiableSet(setOriginal);
- Collections.unmodifiableMap(mapaOriginal);
- Collections.unmodifiableCollection(collectionOriginal);

Com isto nossa classe ficará assim:

``` Java Sistema.java
import java.util.Collections;

public class Sistema {

  private Set<Usuario> usuarios;
  
  public Set<Usuario> getUsuarios() {
      return Collections.unmodifiableSet(this.usuarios);
  }
  
  public boolean adicionaUsuario(String login, String senha) {
      return this.usuarios.add(new Usuario(login, senha));
  }
  
  public boolean removeUsuario(Usuario usuario) {
      return this.usuarios.remove(usuario);
  }
  
  ...
  
}
```

## 3. Marque um método como público apenas se for estritamente necessário
O valor de uma classe poderia ser definido como o valor de sua interface. Interface não representando uma estrutura de dados abstrata, mas o conjunto de métodos e atributos que compõe uma classe. Quanto mais significativa e simples essa interface, maiores são as chances dela ser reutilizada, o que é muito bom por si só.

Uma maneira de simplificar a interface das classes é esconder tudo que não é essencial para outras classes. 

Claro, métodos auxiliares são importantes, até para simplificar a lógica de outros métodos, mas eles só possuem razão de ser dentro daquela classe. Não há porque mostrar ao mundo que eles existem. 

Para esses casos, use "private" ou quando não for possível, "protected". 

## 4. Saiba quando usar Enum e quando usar herança
Enum é um grande aliado. Ele permite criar uma quantidade definida de constantes. Entretanto, é comum usar enum dentro de condicionais (geralmente um *switch case*) para variar um comportamento de um método. Aqui vai um exemplo:

``` Java Cargo.java
public enum Cargo {

	ESTAGIARIO, JUNIOR, EXPERT, PLENO
	
}
```
``` Java Desenvolvedor.java 
public class Desenvolvedor {
	
	private Cargo cargo;
	
	public double getSalario() {
		switch(this.cargo) {
			case ESTAGIARIO:
				return 500;
			case JUNIOR:
				return 1000;
			case EXPERT:
				return 2000;
			case PLENO:
				return 4000;
			default:
				throw new CargoException("Cargo inválido.");
		}
	}
	
	public boolean promove() {
		switch(this.cargo) {
			case ESTAGIARIO:
				this.cargo = Cargo.JUNIOR;
				break;
			case JUNIOR:
				this.cargo = Cargo.EXPERT;
				break;
			case EXPERT:
				this.cargo = Cargo.PLENO;
				break;
			default:
				return false;
		}
		return true;
	}
	
	... 
	 
} 
```

Esse problema poderia ser resolvido de maneira diferente usando herança e polimorfismo:

``` Java Cargo.java
public interface Cargo {

	public double getSalario();
	public boolean promove(Desenvolvedor contexto);
	
}
``` 
``` Java Estagiario.java
public class Estagiario implements Cargo {
	
	@Override
	public double getSalario() {
		return 500;
	}
	
	@Override
	public boolean promove(Desenvolvedor contexto) {
		contexto.setCargo(Cargo.JUNIOR);
		return true;
	}
	
}
``` 
``` Java Junior.java
public class Junior implements Cargo {
	
	@Override
	public double getSalario() {
		return 1000;
	}
	
	@Override
	public boolean promove(Desenvolvedor contexto) {
		contexto.setCargo(Cargo.EXPERT);
		return true;
	}
	
}
``` 
``` Java Expert.java
public class Expert implements Cargo {
	
	@Override
	public double getSalario() {
		return 2000;
	}
	
	@Override
	public boolean promove(Desenvolvedor contexto) {
		contexto.setCargo(Cargo.PLENO);
		return true;
	}
	
}
``` 
``` Java Pleno.java
public class Pleno implements Cargo {
	
	@Override
	public double getSalario() {
		return 4000;
	}
	
	@Override
	public boolean promove(Desenvolvedor contexto) {
		return false;
	}
	
}
``` 
``` Java Desenvolvedor.java
public class Desenvolvedor {

	private Cargo cargo;
	
	protected void setCargo(Cargo cargo) {
		this.cargo = cargo;
	}
	
	public double getSalario() {
		return this.cargo.getSalario();
	}
	
	public boolean promove() {
		return this.cargo.promove(this);
	}
	
}
```

Como você pode ver, este exemplo usa o *design pattern* **State** do Gang of Four. 
A maioria dos enums que implementam uma hierarquia podem ser convertidos para esse padrão, que em suma é composição + polimorfismo.

A questão é: Qual das duas soluções é a melhor?

A resposta é: **depende**. É verdade que a segunda solução deixou a classe "Desenvolvedor" mais simples, mas por outro lado aumentou o número de classes do sistema. O enum, embora mais enxulto, é menos flexível: Se você quiser adicionar mais uma constante, terá que alterar todas as condicionais que envolvam aquele enum. E isso é **muito** ruim. 

Portanto, um bom *rule of thumb* é o seguinte: Use enum quando você tiver **certeza** que as constantes daquele tipo não irão mudar. Caso contrário, polimorfismo é a melhor solução, pois para adicionar um novo valor, basta criar uma nova classe que implementa aquela interface, não afetando nenhum outro lugar.

## 5. Use afirmações ao invés de negações em condicionais
Essa dica é realmente muito simples. Ela não vai alterar diretamente a qualidade de seu código, mas vai torná-lo mais legível, o que é importante também! 

A questão aqui é que orações afirmativas são mais fáceis de se entender do que várias negativas coglomeradas. Exemplo:

	Não é o caso que eu não queira ir ao shopping.

Poderia ser reescrito da seguinte forma:

	Eu quero ir ao shopping.

Claro, ao custo de um pouco da perda de semântica, um efeito coleteral que não existe em linguagens de programação. Exemplo:

``` Java
public String getMensagemDeErro() {
	if (!(this.getPessoa() instanceof Programador)) {
		return "Estamos em manutenção. Volte em breve.";
	} else  {
		return "Erro 303. Linha 202. NullPointerException.";
	}
}
```

Poderia ser reescrito da seguinte forma:

``` Java
public String getMensagemDeErro() {
	if (this.getPessoa() instanceof Programador) {
		return "Erro 303. Linha 202. NullPointerException.";
	} else  {
		return "Estamos em manutenção. Volte em breve.";
	}
}
```
Obviamente o efeito é quase imperceptível, mas isso por minha falta de criatividade em pensar em exemplos mais elaborados. :)

## Conclusão
Algumas dicas foram bem óbvias e intuitivas, outras nem tanto. Eu também evitei extrair os exemplos diretamente do livro, queria misturar um pouco da minha experiência. O livro do Martin Fowler é fantástico, e recomendo fortamente que todos leiam. 

Até a próxima, e lembrem-se: Refatoramento hoje, refatoramento amanhã, refatoramento sempre!
