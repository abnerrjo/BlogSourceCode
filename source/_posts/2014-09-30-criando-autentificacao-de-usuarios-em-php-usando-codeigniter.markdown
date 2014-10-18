---
layout: post
title: "Criando autentificação de usuários em PHP usando CodeIgniter"
date: 2014-09-30 07:45:45 -0300
comments: true
categories: [PHP, Tutoriais]
---
Sou um completo novato em PHP. Já tentei desenvolver sites sem o uso de frameworks, e até tive algum sucesso, mas a experiência foi um tanto traumatizante, pra dizer o mínimo. Precisava de um framework que me ajudasse nessa tarefa, mas que também não fosse preciso passar mais tempo aprendendo a manipulá-lo do que aprendendo a própria linguagem em si. 

CodeIgniter é esse framework! Ele é totalmente *clean* e intuitivo, contém apenas as funcionalidades realmente básicas. Hoje aprenderemos a criar autentificação de usuários (cadastrar e logar) usando ele! *Let's rock, baby!*

** Sem paciência pra ler? [Clique aqui para baixar o exemplo completo]({{ root_url }}/downloads/code/auth.zip) **

<!-- more -->

Tentei projetar este tutorial para uma pessoa totalmente leiga neste framework, portanto, se você já sabe um pouco, peço desculpa pela redundância de informações.

E como pré-requisito básico pressuponho que você já tenha um servidor local instalado que suporte PHP. Se não tiver, não se preocupe, é fácilimo de instalar [com algum software LAMP](https://www.apachefriends.org/pt_br/index.html). 

## "Instalando" o framework 

Vamos baixar o CodeIgniter agora! :D <br/>
Acesse o [site do CodeIgniter](https://ellislab.com/codeigniter) e clique em download.

Para criar um novo projeto com esse framework, basta copiar e colar a pasta do CodeIgniter. Mais simples impossível! 

## Configurando o banco de dados 

E antes de mais nada, vamos montar as tabelas do nosso banco de dados. Nosso simples usuário terá apenas nome, login e senha, por isso nosso banco de dados terá uma única tabela, e ela é bem simples:

``` SQL
CREATE TABLE IF NOT EXISTS `User` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(30) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
```

Para linkar nosso banco de dados ao CodeIgniter, vá à pasta do projeto > application > config > database.php

Nas linhas 52 à 54, você encontrará o seguinte trecho de código:

``` PHP
$db['default']['username'] = '';
$db['default']['password'] = '';
$db['default']['database'] = '';
``` 

Basta preencher com as informações referentes ao seu banco de dados. 

## Criando as views

CodeIgniter segue o padrão MVC: Ele separa a visualização dos dados (views: HTML, CSS...) da lógica de negócio (models: PHP em si, incluindo pesquisas ao banco de dados) e tem um controlador que faz a comunicação entre os dois (controller). 

Vamos começar criando as views, depois os models e por último colar tudo usando um controller. 

Para criar uma nova view, vá até a pasta do projeto > views e crie um novo arquivo HTML ou PHP lá dentro. Por motivos de organização, é legal organizar suas views em subpastas. Crie as telas de logar e cadastrar numa subpasta chamada "*auth*".

Dentro dessa subpasta crie quatro arquivos: *login.php*, *register.php*, *success.php* e *fail.php*. A princípio, alguém seria tentado a criar algo assim em um deles:

``` HTML
<!DOCTYPE HTML>
<html>
<head>
...
</head>
</html>
``` 

Mas não faz sentido repetir o *header* em vários arquivos HTML! Não agora que temos um framework para nos auxiliar nessa tarefa! :D

Portanto, crie o header em outro arquivo separado chamado *header.php*. Também crie um arquivo chamado *footer.php* para lá colocar todo o rodapé da página, incluindo fechamento de tags.

Com isto, meu arquivo header ficou dessa maneira:

``` PHP header.php
<!DOCTYPE HTML>
<html>
	<head>
		<meta charset="utf-8">
		<title>Autentificação no CodeIgniter</title>
	</head>
	<body>
```

E meu arquivo footer, desta maneira:

``` PHP footer.php
	</body>
</html>
```

E assim nossos arquivos HTML terão apenas o necessário. 

O arquivo de login poderia bem ser dessa maneira:

``` PHP login.php
<?php echo form_open('login'); ?>
	<input type="text" name="login" placeholder="Digite seu login" required />
	<input type="password" name="password" placeholder="Digite sua senha" required />
	<button type="submit">Entrar</button>
</form>		
<a href="<?php echo base_url(); ?>index.php/register">Não possuí conta? Clique aqui para se cadastrar!</a>	
```

Considerando que a rota para logar seja **login**. Falaremos mais sobre isso mais a frente. Como você pode ver, é um form dos mais simples, o que há de diferente é o método "form_open". Ele é um método utilitário do CodeIgniter que cria um form já com o roteamento correto para nós.

E o arquivo register poderia ser dessa maneira:

``` PHP register.php
<?php echo form_open('new_register'); ?>
	<input type="text" name="name" placeholder="Digite seu nome" required maxlength="100" autofocus /> 
	<input type="text" name="login" placeholder="Digite seu login" required maxlength="30" />
	<input type="password" name="password" placeholder="Digite sua senha" required maxlength="30" />
	<button type="submit">Cadastrar</button>
</form>
```

Considerando que a rota para cadastrar seja **new_register**. Perceba que coloquei alguns atributos adicionais nos campos como "maxlength". Isso foi apenas para coincidir com as *constraints* que defini lá no banco de dados. Não é essencial.

E, por fim, o arquivos sucess e fail, que irão mostrar mensagens ao usuário dependendo de seu sucesso em logar. Esses não têm muito mistério:

``` PHP fail.php
Falha ao logar. <a href="index">Tente novamente.</a>
```

``` PHP success.php
Olá, <?php echo $usuario; ?>. Você logou com sucesso!
<a href="logout">Clique aqui para deslogar.</a>
``` 

Ops! Uma pegadinha no arquivo *success*: De onde vem essa variável "$usuario"? Ahá! Isso que é legal. Você pode usar alguns dados externos para montar suas views, no meu caso usei a variável "$usuario", que eu imagino que deva armazenar o nome do usuário logado, mas quem irá se encarregar de mandar esses dados é o controller. Veremos isso mais a frente. 

Perceba também que usamos a rota **logout** para o usuário se deslogar.

Com isto terminamos as views. Apenas conferindo os arquivos criados:

+ views
	+ auth
		+ header.php
		+ footer.php
		+ login.php
		+ register.php
		+ fail.php
		+ success.php


## Criando os models

Os models, no CodeIgniter, ficam em application > models. PHP em si é *stateless*, portanto, a noção de models é um pouco diferente do usual. 

Ele não é como Java, onde você tem uma classe com vários atributos, carrega esses atributos do banco de dados e passa a acessá-los da memória.

Em PHP, as classes têm poucos atributos, sendo que a maioria deles são acessados diretamente do banco de dados. 

É importante manter isso em mente. 

Vamos criar então nosso model! Vamos necessitar apenas de um, que é o usuário em si. Crie um arquivo chamado **usermodel.php**. Todo model no CodeIgniter tem essa estrutura básica:

``` PHP
<?php
class NOME extends CI_Model {

}?>
``` 

Para o nosso caso, seria assim:

``` PHP usermodel.php
<?php
class UserModel extends CI_Model {

}?>
``` 

Outra coisa importante é que podemos e devemos inicializar nosso banco de dados já no construtor da classe. Isso pode ser feito da seguinte maneira:

``` PHP usermodel.php
<?php
class UserModel extends CI_Model {

	public function __construct() {
		$this->load->database();
	}

}?>
``` 

Nosso singelo model terá apenas dois métodos: login e register.

``` PHP usermodel.php
<?php
class UserModel extends CI_Model {

	public function __construct() {
		$this->load->database();
	}

	function login($login, $password) {
		
	}
	
	function register($name, $login, $password) {
		
	}
	
}?>
```

O que eles fazem é, por incŕivel que pareça, logar e registrar! hehe

Vamos começar pelo método de logar. O que ele faz é simples: Vasculha o banco de dados por um usuário que possuam o login e a senha informados. Caso seja encontrado, retorna true. 

E aqui, devo ressaltar a importância de não colocar a senha no banco de dados da forma original que ela é, né. Use pelo menos uma forma de encriptação. Irei user o [MD5](http://pt.wikipedia.org/wiki/MD5).

Agora nos concentremos no banco de dados. Isto é trivial usando o [Active Record](https://ellislab.com/codeigniter/user-guide/database/active_record.html). 

``` PHP usermodel.php
function login($login, $password) {
	$this->db->select("*");
	$this->db->from("User");
	$this->db->where("login", $login);
	$this->db->where("password", md5($password));
}
``` 

O que o código acima está fazendo? Simplesmente está fazendo um SELECT no banco de dados na tabela indicada pelo método "from" e com duas cláusulas WHERE. Em outras palavras, selecionando um usuário que possua o mesmo login e a mesma senha (encriptografada) passada. 

Vamos agora executar a query usando o método "get" e verificando se alguma linha foi retornada usando o método "num_rows".

``` PHP usermodel.php
function login($login, $password) {
	$this->db->select("*");
	$this->db->from("User");
	$this->db->where("login", $login);
	$this->db->where("password", md5($password));
	$query = $this->db->get();
	return $query->num_rows() > 0;
}
```

E assim o método login está pronto! Fácil, não é? 

Vamos para o método register agora. Ele funciona de maneira semelhante, só que agora não estamos preocupados em selecionar usuários, mas sim em inserí-los. Felizmente, também existe um método mágico para esta tarefa:

``` PHP usermodel.php
private function exists($login) {
	$this->db->select("*");
	$this->db->from("User");
	$this->db->where("login", $login);
	$query = $this->db->get();
	return $query->num_rows() > 0;
}

function register($name, $login, $password) {
	if ($this->exists($login)) return;
	$this->db->insert('User', array(
		'name' => $name,
		'login' => $login,
		'password' => md5($password)
	));
}
```

E aí foi criado um método auxiliar chamado "exists" para verificar se um dado login já está sendo usado. Ele é quase igualzinho ao login, só que desta vez não leva em consideração a senha. 

O método register é ridiculamente fácil: Se não existir, ele insere no banco de dados. No método "db->insert" é passando o nome da tabela e uma array associativa, onde as chaves são os nomes das colunas e os valores serão os valores dessas colunas. 

Nossa classe por completo está assim:

``` PHP usermodel.php
<?php
class UserModel extends CI_Model {

	public function __construct() {
		$this->load->database();
	}

	function login($login, $password) {
		$this->db->select("*");
		$this->db->from("User");
		$this->db->where("login", $login);
		$this->db->where("password", md5($password));
		$query = $this->db->get();
		return $query->num_rows() > 0;
	}
	
	private function exists($login) {
		$this->db->select("*");
		$this->db->from("User");
		$this->db->where("login", $login);
		$query = $this->db->get();
		return $query->num_rows() > 0;
	}

	function register($name, $login, $password) {
		if ($this->exists($login)) return;
		$this->db->insert('User', array(
			'name' => $name,
			'login' => $login,
			'password' => md5($password)
		));
	}
	
}?>
```

E com isso terminamos nosso model.

## Criando o controller

E agora vamos juntar tudo através de um controller. Controller é uma classe como qualquer outra, que tem seus métodos. Vamos começar criando um novo arquivo em application > controllers chamado **usuario.php**. 

Esse arquivo tem a seguinte estrutura:

``` PHP user.php
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends CI_Controller {

	public function __construct() {
		parent::__construct();
	    }

}
```

Que, aliás, é a estrutura básica de todo controller. Todos eles devem herdar de CI_Controller.

Também podemos e devemos especificar que models iremos usar. Isto deve ser feito no construtor da classe do controller da seguinte maneira:

``` PHP user.php
public function __construct() {
	parent::__construct();	
	$this->load->model("usermodel");
}
```

Se precisar de mais models, basta criar mais linhas como essa, substituindo user_model pelo nome da classe do model em minúscula.

Também precisamos carregar alguns utilitários:

``` PHP user.php
public function __construct() {
	parent::__construct();
        $this->load->helper(array('url', 'form'));
        $this->load->model("usermodel");
}
```

Agora vamos criar o método "view", que irá receber uma página da views e renderizará ela na tela. O CodeIgniter nos proporciona um método interessante para esta tarefa, chamado "load->view". 

``` PHP user.php
private function view($page) {
	$this->load->view("auth/header");
	$this->load->view($page);
	$this->load->view("auth/footer");
}
``` 

E aí nos aproveitamos para não só mostrar a página indicada, mas encapsulá-la entre o "header" e o "footer" criados anteriormente. É dessa maneira que reutilizamos código HTML no CodeIgniter. :)

Agora que temos um método para visualização, vamos criar mais um método, o index, que irá mostrar a página inicial da nossa aplicação.

``` PHP user.php
public function index() {
	$this->view("auth/login");
}
```

Também precisamos de métodos para mostrar as páginas de registrar, sucesso e falha:

``` PHP user.php
public function register() {
	$this->view("auth/register");
}

public function fail() {
	$this->view("auth/fail");
}

public function success() {
	$this->view("auth/success");
}
```

Esses métodos estão bacanas, mas como iremos acessá-los? Chegou a hora de falar sobre rotamento. Roteamento, neste contexto, é o processo de associar uma URL à um método do controller. 

Por padrão, cada método público do controller é acessível através da seguinte url:

``` HTML
<url_base>/index.php/<nome_do_controller>/<nome_do_metodo>
```

Para o nosso controller User, queremos reduzir essa URL para: 

``` HTML
<url_base>/index.php/<nome_do_metodo>
```

Para quando o usuário digitar: <url_base>/, ele seja redirecionado automaticamente para o método "index" de User. Para isto, vá até o arquivo application > config > routes.php

Na linha 41, mude "default_controller" para user.

``` PHP routes.php
$route['default_controller'] = "user";
```

E agora vamos criar as rotas pros métodos já existentes no Controller:

``` PHP routes.php
$route['index'] = "user/index";
$route['success'] = "user/success";
$route['fail'] = "user/fail";
$route['register'] = "user/register";
```

A síntaxe descrita ali encima é a seguinte: 

``` PHP
$route['<rota>'] = "<nome_do_controller>/<nome_do_metodo>";
```

Precisamos também definir as rotas que falamos anteriormente, que são: **login** (método que irá permitir logar), **logout** (método que irá permitir deslogar) e **new_register** (método que irá permitir registrar um novo usuário).

``` PHP routes.php
$route['login'] = "user/login";
$route['logout'] = "user/logout";
$route['new_register'] = "user/new_register";
```

Claro, ainda não temos os métodos "login", "logout" e "new_register". Vamos então criá-los!

Primeiro o de login. Sabemos que o form irá mandar uma requisição POST para este método. Precisamos pegar as informações desta requisições. Isso pode ser feito da seguinte maneira:

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
}
```

Com isto estamos pegando os valores dos campos de nome "login" e "password" e atribuindo às suas respectivas variáveis. Com esses valores em mãos, vamos chamar o método do model "usermodel" que irá permitir logar:

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	if ($this->usermodel->login($login, $password)) {

	} else {

	}
}
```

Interessante aqui é que não criamos uma instância do model (pelo menos não de forma explicita). Quando importamos o model no construtor, todos os seus métodos são acessíveis através de $this->(nome do model). 

Sabendo disso, chamamos o método login, e lembrando que ele retorna true caso o login seja efetuado com sucesso, colocamos a chamada de método dentro de um condicional.

Precisamos agora criar uma nova **seção**, um local onde iremos colocar pequenas informações que indiquem que usuário está logado naquele momento, um pouco parecido com cookies. 

Para poder utilizá-la, primeiro importe a seguinte biblioteca no construtor do controller:

``` PHP user.php
public function __construct() {
	...
	$this->load->library('session');
}
``` 

Vá até o arquivo application > config > config.php, e na linha 227 defina o valor da variável **$config['encription_key']** para qualquer número aleatório realmente grande.

Agora volte para nosso controller, e adicione a seguinte linha de código ao método "login":

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	if ($this->usermodel->login($login, $password)) {
		$this->session->set_userdata("user", $login);
	} else {

	}
}
``` 

Feito isto, agora podemos acessar a informação do usuário que está logado naquele momento através do método:

``` PHP
$this->session->userdata("user");
``` 

Você pode definir mais informações caso queira, basta nomeá-las com uma chave diferente de "user". 

Agora que criamos essa seção, vamos redirecionar o usuário para a tela de sucesso. 

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	if ($this->usermodel->login($login, $password)) {
		$this->session->set_userdata("user", $login);
		redirect("success", "refresh");
	} else {

	}
}
``` 

O primeiro argumento do método "redirect" é a URL. O roteamento irá redirecionar pro método do controller equivalente. :)

E caso o usuário não tenha conseguido logar, vamos redirecioná-lo para tela de falha.

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	if ($this->usermodel->login($login, $password)) {
		$this->session->set_userdata("user", $login);
		redirect("success", "refresh");
	} else {
		redirect("fail", "refresh");
	}
}
```

Agora você se lembra que no arquivo "success.php" havia uma pegadinha, onde usávamos uma variável chamada $usuario e que eu disse que quem iria definir quem ela é seria o controller? Pois bem, chegou a hora. 

Modifique o método "view", aquele responsável por renderizar a página, para receber um parâmetro opcional: $data, e faça com que as chamas de "load->view" passem esse parâmetro também.

``` PHP user.php
private function view($page, $data=false) {
	$this->load->view("auth/header.php", $data);
	$this->load->view($page, $data);
	$this->load->view("auth/footer.php", $data);
}
``` 

Agora no método "success", adicione a seguinte linha antes de chamar o método "view": 

``` PHP user.php
$data["usuario"] = $this->session->userdata("user");
```

E passe essa variável quando for chamar o "view":

``` PHP user.php
$this->load->view($page, $data);
```

Com isto, a array $data é passada para as views, só que lá dentro os valores dessa array são acessíveis através de variáveis independentes. Exemplo: $data["usuario"] torna-se $usuario. :)

Agora vamos fazer com que, se logado, o usuário seja redirecionado para a tela de sucesso automaticamente. Para isto, basta criar a seguinte condição no método "index":

``` PHP user.php
public function index() {
	if ($this->session->userdata("user")) {
		redirect("success", "refresh");
		return;
	}
	$this->view("auth/login");
}
``` 

Com isso terminamos a ação de logar! Falta-nos o de deslogar e o de registrar. Vamos pelo de registrar.

Registrar é muito parecido com o de logar, veja:

``` PHP user.php
public function new_register() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	$password = $this->input->post("name");
	$this->usermodel->register($name, $login, $password);
	redirect("index", "refresh");
}
``` 

Acho que não há nada de novo aqui em relação ao método "login". 

E, por último, o método de deslogar:

``` PHP user.php
public function logout() {
	$this->session->unset_userdata('user');
	session_destroy();
	redirect('index', 'refresh');
}
```

Basicamente, ele está destruindo a seção e redirecionando para tela inicial.

Com isso, nossa classe, por completo, está assim:

``` PHP user.php
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends CI_Controller {

	public function __construct() {
        parent::__construct();
        $this->load->helper(array('url', 'form'));
        $this->load->model("usermodel");
        $this->load->library('session');
    }
    
	private function view($page, $data=false) {
		$this->load->view("auth/header.php");
		$this->load->view($page, $data);
		$this->load->view("auth/footer.php");
	}
	
	public function index() {
		if ($this->session->userdata("user")) {
			redirect("success", "refresh");
			return;
		}
		$this->view("auth/login");
	}
	
	public function register() {
		$this->view("auth/register");
	}

	public function fail() {
		$this->view("auth/fail");
	}

	public function success() {
		$data["usuario"] = $this->session->userdata("user");
		$this->view("auth/success", $data);
	}
	
	public function login() {
		$login = $this->input->post("login");
		$password = $this->input->post("password");
		if ($this->usermodel->login($login, $password)) {
			$this->session->set_userdata("user", $login);
			redirect("success", "refresh");
		} else {
			redirect("fail", "refresh");
		}
	}
	
	public function new_register() {
		$login = $this->input->post("login");
		$password = $this->input->post("password");
		$name = $this->input->post("name");
		$this->usermodel->register($name, $login, $password);
		redirect("index", "refresh");
	}
	
	 public function logout() {
    	$this->session->unset_userdata('user');
    	session_destroy();
    	redirect('index', 'refresh');
    }
    
}
``` 

**Uhuuu!!** E concluímos nossa aplicação! Se você rodar agora, verá que está tudo rodando perfeitamente (assim espero hehe). 

-> ![]({{ root_url }}/images/posts/igniter-auth-1.png) <-

-> ![]({{ root_url }}/images/posts/igniter-auth-2.png) <-

-> [Clique aqui para baixar o exemplo completo]({{ root_url }}/downloads/code/auth.zip) <-
