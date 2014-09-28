---
layout: post
title: "(Python 2.7) PySnake"
date: 2014-09-17 22:26:50 -0300
comments: true
categories: [Python, Games]
---
Boa noite, leitores. Estou de férias! Uhuul! E para comemorar, voltei a fazer o que mais gosto de fazer, que é criar joguinhos, principalmente os de GUI mais tosca possível, como esse abaixo:

->![]({{ root_url }}/images/posts/pysnake.png)<-

<center><a href="https://gist.githubusercontent.com/PicoleDeLimao/300f93a9820c52e6a243/raw/">Click here to download</a></center>

<!-- more -->

O jogo foi desenvolvido usando Python 2.7 e me tomou cerca de 6 horas. 
O que mais me ajudou foi o uso do design pattern State para arquitetar as telas do jogo. 
Além disso, filas foram usadas para compor o movimento característico da cobra. Threads também foram usadas para permitir o uso do teclado enquanto que os elementos são visualizados na tela.

Nenhum framework específico foi usado.

Vocês podem conferir o código-fonte abaixo. Divirtam-se! 

<center><input id="spoiler" type="button" value="Ver código-fonte" onclick="toggle_visibility('code');"></center>
<div id="code">
{% gist 300f93a9820c52e6a243 PySnake.py %}
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