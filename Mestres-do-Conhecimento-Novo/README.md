# Mestres do Conhecimento

Jogo educativo de tela única, com uma aventura para cada matéria e perguntas servidas por uma API Java.

## Executar no computador

É necessário Java 17 ou mais recente. No PowerShell, dentro da pasta do projeto:

    New-Item -ItemType Directory -Force out
    javac -encoding UTF-8 -d out backend/Server.java
    java -cp out Server

Abra http://localhost:8080.

## Publicar no Render

Envie esta pasta para um repositório GitHub e crie no Render um serviço web usando Docker. O Render fornece a porta pública; o arquivo render.yaml já configura o serviço.

## Como a fase funciona

Cada mundo tem quatro monstros iniciais e um chefe. Cada monstro exige três acertos em perguntas fáceis; o chefe exige cinco acertos em perguntas médias. Entre os encontros, a equipe pode descansar para recuperar até 20 pontos de vida ou estudar para ganhar 25 XP. Os desafios comuns variam o tempo e podem oferecer XP extra ou recuperar vida. Cada chefe tem uma habilidade própria, apresentada antes da luta.

Cada matéria tem 16 perguntas fáceis e 9 médias na biblioteca da API Java. As perguntas já exibidas ficam registradas durante a fase, inclusive as erradas, e a API tenta sempre enviar uma pergunta inédita. Se o banco se esgotar, a fase é encerrada com um aviso, sem repetir questões. O herói também perde a fase se ficar sem vida. As respostas certas valem 50 XP nas fases comuns e 75 XP contra o chefe, antes dos bônus de desafio e das escolhas de jornada.

## Onde alterar o jogo

- Perguntas e alternativas: backend/Server.java, nos métodos createQuestions, add e addMedium.
- Heróis, monstros, cores e cenários: frontend/app.js, no catálogo WORLDS.
- Tela, textos e estrutura: frontend/index.html.
- Cores, cartões, animações e adaptação a celular: frontend/style.css.

Os heróis, monstros e ambientes usam SVG original criado no próprio projeto, sem recortes de referências, API de imagens ou chave externa. Cada mundo tem cinco variações visuais de cenário que acompanham a equipe até a arena do chefe.

## Comentários no código

As funções do JavaScript têm comentários logo acima da declaração: eles explicam telas ("show"), chamadas à API ("api"), desenhos ("figureSvg" e "sceneSvg"), lobby ("loadSubjects"), partida ("startSubject", "loadQuestion", "startTimer", "submitAnswer"), indicadores ("updateProgress"), resultado ("finish"), dicas ("useHint") e cliques da interface ("bindEvents"). Os métodos de Server.java também estão documentados antes de cada declaração, incluindo as rotas e os métodos que montam as perguntas.

## API

- GET /api/subjects lista as matérias e seus heróis.
- GET /api/question?subject=Matemática&difficulty=easy busca uma pergunta fácil.
- GET /api/question?subject=Matemática&difficulty=medium busca uma pergunta média. O parâmetro opcional exclude aceita IDs separados por vírgula para evitar perguntas já exibidas; se não houver perguntas inéditas, a API retorna HTTP 410 sem repetir.
- POST /api/answer recebe questionId e selectedOption e retorna se acertou, a experiência, o dano e o índice da resposta correta após o envio.

## Referência

O arquivo HTML original está preservado em referencia/Index.html2.html. O jogo editável está dentro de frontend/.
## Arquivos do projeto

- `backend/Server.java`: servidor Java, endpoints da API e banco de perguntas por matéria.
- `frontend/index.html`: estrutura das telas inicial, seleção de matéria, batalha e resultados.
- `frontend/style.css`: cores, layout, personagens, cenários, animações e adaptação para celular.
- `frontend/app.js`: navegação e regras do jogo, personagens e cenários em SVG, escolhas entre encontros, desafios variados, habilidades de chefes, controle de perguntas usadas e relatório final.
- `referencia/Index.html2.html`: cópia do HTML fornecido como referência.
- `Dockerfile`: compila e inicia o servidor Java em um contêiner.
- `render.yaml`: configuração do serviço web no Render.
- `.gitignore`: arquivos que o Git deve ignorar.
- `out/Server.class` e classes auxiliares: saída já compilada do Java; pode ser recriada pelos comandos de execução acima.
- `README.md`: instruções para executar, publicar e modificar o jogo.
