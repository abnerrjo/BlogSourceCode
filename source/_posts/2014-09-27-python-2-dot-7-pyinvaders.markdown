---
layout: post
title: "(Python 2.7) PyInvaders"
date: 2014-09-27 12:16:32 -0300
comments: true
categories: [Python, Games]
---
E mais um joguinho feito, desta vez uma cópia do Space Invaders.

->![]({{ root_url }}/images/posts/pyinvaders.png)<-

<center><a href="https://gist.githubusercontent.com/PicoleDeLimao/05364c4b67d5ed265871/raw/78e0cbdb9579f7883cbc5fc41dce6e603e9989e9/PyInvaders.py" download="PyInvaders.py">Click here to download</a></center>

<!-- more -->

Não há nada de novo em relação aos outros joguinhos dessa série.
Ah! Uma coisa interessante adicionada à série é a multiplataforma. Agora os joguinhos rodam tanto em Linux quanto no Windows! :D
Estava usando as bibliotecas tty e termios para gerenciar os eventos do teclado, mas, infelizmente, essas bibliotecas não existem para Windows. Por isto, criei um módulo adicional que faz a mesma coisa usando o Tkinter. 

Vocês podem conferir o código-fonte abaixo. Divirtam-se! 

<center><input id="spoiler" type="button" value="Ver código-fonte" onclick="toggle_visibility('code');"></center>
<div id="code">
{% gist 05364c4b67d5ed265871 PyInvaders.py %}
</div>
</input>

<script type="text/javascript">
   document.getElementById('code').style.display = 'none';
   function toggle_visibility(id) {
       var e = document.getElementById(id);
       if(e.style.display == 'block')
          e.style.display = 'none';
       else
          e.style.display = 'block';
   }
</script>