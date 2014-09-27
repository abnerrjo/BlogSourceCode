---
layout: post
title: "(Python 2.7) PyPac"
date: 2014-09-19 10:04:09 -0300
comments: true
categories: [Python, Games]
---
E lá vai mais um jogo criado no Python 2.7, desta vez um clone do eterno clássico Pacman!

->![]({{ root_url }}/images/posts/pypac.png)<-

<center><a href="https://gist.githubusercontent.com/PicoleDeLimao/892bf12a4a185721485f/raw/22189a1fd7443e29256bef4f2ea2f6dd6a7c9f23/PyPac.py" download="PyPac.py">Click here to download</a></center>

<!-- more -->

As novidades da implementação deste jogo em relação ao PySnake foi a introdução à tiles, onde é possível classificá-los como "atravessáveis" e "não-atravessáveis" e um pouco de Geometria para compor a IA dos fantasmas (o movimento deles é determinado pelo arcotangente dos vetores das posição dos fantasmas e do Pacman).

Divirtam-se! O código-fonte encontra-se abaixo:

<center><input id="spoiler" type="button" value="Ver código-fonte" onclick="toggle_visibility('code');"></center>
<div id="code">
{% gist 892bf12a4a185721485f PyPac.py %}
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