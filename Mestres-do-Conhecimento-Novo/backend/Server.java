import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Server {

    /** Dados de uma pergunta, incluindo a resposta correta e sua dificuldade. */
    record Question(
        int id,
        String subject,
        String prompt,
        List<String> options,
        int answer,
        String hint,
        String difficulty
    ) {}

    /** Informações exibidas para cada matéria no lobby do jogo. */
    record Subject(String name, String hero, String role, String color, String icon) {}

    /** Perguntas disponíveis, agrupadas pelo nome de cada matéria. */
    private static final Map<String, List<Question>> BANK = new LinkedHashMap<>();
    /** Dados das matérias usados para construir os cartões do lobby. */
    private static final Map<String, Subject> SUBJECTS = new LinkedHashMap<>();

    /** Inicia o servidor HTTP e registra as rotas da API e dos arquivos do jogo. */
    public static void main(String[] args) throws Exception {
        createSubjects();
        createQuestions();

        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);

        server.createContext("/api/subjects", Server::subjects);
        server.createContext("/api/question", Server::question);
        server.createContext("/api/answer", Server::answer);
        server.createContext("/", Server::staticFile);
        server.start();

        System.out.println("Mestres do Conhecimento na porta " + port);
    }

    /** Registra uma matéria e cria o espaço onde suas perguntas serão armazenadas. */
    private static void addSubject(String name, String hero, String role, String color, String icon) {
        SUBJECTS.put(name, new Subject(name, hero, role, color, icon));
        BANK.put(name, new ArrayList<>());
    }

    /** Prepara as cinco matérias, seus heróis, funções, cores e ícones. */
    private static void createSubjects() {
        addSubject("Português", "Lira, Guardiã das Palavras", "MAGA DA BIBLIOTECA", "#bd5b48", "📚");
        addSubject("Matemática", "Gauss, Arquiteto dos Números", "MESTRE DA LÓGICA", "#477fd1", "➗");
        addSubject("Ciências", "Íris, Exploradora da Vida", "CIENTISTA ESTELAR", "#3c9b73", "🔬");
        addSubject("História", "Ayla, Cronista das Eras", "VIAJANTE DO TEMPO", "#bd8a3c", "🏛️");
        addSubject("Geografia", "Maia, Cartógrafa dos Mundos", "EXPLORADORA DO GLOBO", "#548b65", "🌎");
    }

    /** Adiciona pergunta fácil; answer é o índice correto entre as quatro opções. */
    private static void add(int id, String subject, String prompt, String hint, int answer, String... options) {
        BANK.get(subject).add(new Question(id, subject, prompt, List.of(options), answer, hint, "easy"));
    }

    /** Adiciona pergunta média; answer é o índice correto entre as quatro opções. */
    private static void addMedium(int id, String subject, String prompt, String hint, int answer, String... options) {
        BANK.get(subject).add(new Question(id, subject, prompt, List.of(options), answer, hint, "medium"));
    }

    /** Monta a biblioteca de perguntas e mantém cada matéria agrupada para facilitar alterações. */
    private static void createQuestions() {
        // Português: perguntas fáceis primeiro e perguntas médias depois.
        add(
            1,
            "Português",
            "Qual palavra é um substantivo próprio?",
            "Nomes de pessoas e lugares começam com letra maiúscula.",
            1,
            "cidade",
            "Brasil",
            "livro",
            "cachorro"
        );

        add(
            2,
            "Português",
            "Qual é o plural de 'animal'?",
            "Termina em -ais.",
            2,
            "animales",
            "animals",
            "animais",
            "animalis"
        );

        add(
            3,
            "Português",
            "Qual palavra é um verbo?",
            "Verbos indicam ação, estado ou fenômeno.",
            0,
            "correr",
            "azul",
            "mesa",
            "feliz"
        );

        add(
            31,
            "Português",
            "Qual é o antônimo de claro?",
            "Antônimos têm sentidos opostos.",
            1,
            "brilhante",
            "escuro",
            "iluminado",
            "transparente"
        );

        add(
            32,
            "Português",
            "Qual sinal encerra uma pergunta direta?",
            "Esse sinal aparece no final de uma pergunta.",
            2,
            "ponto final",
            "vírgula",
            "ponto de interrogação",
            "dois-pontos"
        );

        add(
            33,
            "Português",
            "Qual palavra é um substantivo feminino?",
            "Observe o gênero da palavra.",
            1,
            "caderno",
            "menina",
            "sapato",
            "relógio"
        );

        add(
            34,
            "Português",
            "Em As flores perfumam o jardim, qual palavra é um substantivo?",
            "Substantivos nomeiam seres, objetos, lugares e ideias.",
            1,
            "perfumam",
            "flores",
            "as",
            "o"
        );

        add(
            35,
            "Português",
            "Qual opção tem acento agudo?",
            "O acento agudo aparece em café.",
            0,
            "café",
            "livro",
            "janela",
            "papel"
        );

        add(
            36,
            "Português",
            "Qual é o diminutivo de casa?",
            "O diminutivo indica algo menor ou expressa carinho.",
            1,
            "casarão",
            "casinha",
            "casamento",
            "caseiro"
        );

        add(
            37,
            "Português",
            "Qual destas palavras é um pronome pessoal?",
            "Pronomes pessoais podem substituir nomes de pessoas.",
            2,
            "bonito",
            "correr",
            "ela",
            "mesa"
        );

        add(
            38,
            "Português",
            "Em Nós brincamos, qual palavra indica a ação?",
            "Verbos indicam ações, estados ou fenômenos.",
            1,
            "nós",
            "brincamos",
            "em",
            "o"
        );

        add(
            39,
            "Português",
            "Qual frase está no plural?",
            "No plural, o sujeito indica mais de um ser.",
            0,
            "Os gatos dormem.",
            "O gato dorme.",
            "A menina canta.",
            "O livro caiu."
        );

        add(
            86,
            "Português",
            "Qual é o aumentativo de casa?",
            "O sufixo -ão pode formar o aumentativo.",
            1,
            "casinha",
            "casarão",
            "casamento",
            "casebre"
        );

        add(
            87,
            "Português",
            "Qual palavra está escrita corretamente?",
            "A forma correta leva ç e til.",
            2,
            "excessão",
            "esceção",
            "exceção",
            "excessao"
        );

        add(
            88,
            "Português",
            "Na frase O cachorro latiu, qual palavra é um artigo?",
            "Artigos acompanham substantivos.",
            0,
            "O",
            "cachorro",
            "latiu",
            "na"
        );

        add(
            89,
            "Português",
            "Qual palavra é um adjetivo?",
            "Adjetivos atribuem características a substantivos.",
            1,
            "correr",
            "azul",
            "mesa",
            "rapidamente"
        );

        addMedium(
            16,
            "Português",
            "Na frase 'Embora estivesse cansada, Lúcia terminou o trabalho', a oração iniciada por 'Embora' expressa ideia de:",
            "A ação principal aconteceu apesar do cansaço.",
            1,
            "causa",
            "concessão",
            "consequência",
            "finalidade"
        );

        addMedium(
            17,
            "Português",
            "Qual alternativa emprega corretamente a crase?",
            "A crase aparece antes de palavra feminina quando há a junção de 'a' + 'a'.",
            0,
            "Entreguei o livro à professora.",
            "Chegamos à pé cedo.",
            "Refiro-me à pessoas atentas.",
            "O passeio começa à partir das oito."
        );

        addMedium(
            26,
            "Português",
            "Na frase 'Pedro estudou bastante, portanto foi bem', a palavra 'portanto' introduz uma ideia de:",
            "Ela conecta um fato a uma conclusão.",
            2,
            "oposição",
            "dúvida",
            "conclusão",
            "comparação"
        );

        addMedium(
            76,
            "Português",
            "Na frase Os alunos chegaram cedo, qual é o sujeito?",
            "O sujeito é quem pratica ou sofre a ação indicada pelo verbo.",
            0,
            "Os alunos",
            "chegaram",
            "cedo",
            "alunos chegaram"
        );

        addMedium(
            77,
            "Português",
            "Em A menina escreveu uma carta, qual expressão funciona como objeto direto?",
            "Pergunte ao verbo escreveu: escreveu o quê?",
            1,
            "A menina",
            "uma carta",
            "escreveu",
            "A menina escreveu"
        );

        addMedium(
            106,
            "Português",
            "Complete com a forma verbal adequada: Ontem, eles ___ ao museu.",
            "A palavra ontem indica uma ação já concluída.",
            2,
            "vai",
            "foram",
            "irão",
            "iam"
        );

        addMedium(
            107,
            "Português",
            "Em As crianças leram o livro, em qual tempo está o verbo leram?",
            "A ação foi concluída no passado.",
            1,
            "presente",
            "pretérito perfeito",
            "futuro do presente",
            "infinitivo"
        );

        addMedium(
            108,
            "Português",
            "Qual frase apresenta concordância verbal correta?",
            "O verbo deve concordar com o sujeito.",
            0,
            "Os estudantes chegaram cedo.",
            "Os estudantes chegou cedo.",
            "A turma chegaram cedo.",
            "Os estudante chegaram cedo."
        );

        addMedium(
            109,
            "Português",
            "Em O vento sussurrou entre as árvores, qual figura de linguagem aparece?",
            "A frase atribui uma ação humana a um elemento da natureza.",
            3,
            "hipérbole",
            "comparação",
            "metáfora",
            "personificação"
        );
        // Matemática: perguntas fáceis primeiro e perguntas médias depois.
        add(
            4,
            "Matemática",
            "Quanto é 15 + 27?",
            "Some as unidades e depois as dezenas.",
            1,
            "32",
            "42",
            "52",
            "62"
        );

        add(
            5,
            "Matemática",
            "Qual fração representa a metade?",
            "Uma de duas partes iguais.",
            0,
            "1/2",
            "1/3",
            "2/3",
            "3/4"
        );

        add(
            6,
            "Matemática",
            "Se x + 8 = 20, quanto vale x?",
            "Subtraia 8 dos dois lados.",
            1,
            "10",
            "12",
            "18",
            "28"
        );

        add(
            40,
            "Matemática",
            "Quanto é 8 × 7?",
            "Use a tabuada do oito.",
            1,
            "54",
            "56",
            "58",
            "64"
        );

        add(
            41,
            "Matemática",
            "Quanto é 100 − 37?",
            "Subtraia 30 e depois mais 7.",
            2,
            "53",
            "62",
            "63",
            "73"
        );

        add(
            42,
            "Matemática",
            "Qual é o perímetro de um quadrado com lado de 4 cm?",
            "Some os quatro lados iguais.",
            0,
            "16 cm",
            "12 cm",
            "8 cm",
            "20 cm"
        );

        add(
            43,
            "Matemática",
            "Qual número decimal corresponde a 3/4?",
            "Transforme a fração em centésimos ou divida 3 por 4.",
            2,
            "0,25",
            "0,5",
            "0,75",
            "1,25"
        );

        add(
            44,
            "Matemática",
            "Complete a sequência: 2, 4, 6, 8, __.",
            "A sequência aumenta sempre pela mesma quantidade.",
            1,
            "9",
            "10",
            "11",
            "12"
        );

        add(
            45,
            "Matemática",
            "Quanto é 45 ÷ 5?",
            "Pense em qual número multiplicado por 5 resulta em 45.",
            3,
            "8",
            "7",
            "10",
            "9"
        );

        add(
            46,
            "Matemática",
            "Quanto é 25% de 80?",
            "25% é a quarta parte.",
            1,
            "15",
            "20",
            "25",
            "40"
        );

        add(
            47,
            "Matemática",
            "Quantos lados tem um triângulo?",
            "O nome dessa forma dá uma pista.",
            2,
            "2",
            "4",
            "3",
            "5"
        );

        add(
            48,
            "Matemática",
            "Uma hora e meia tem quantos minutos?",
            "Uma hora tem 60 minutos; meia hora tem 30.",
            0,
            "90",
            "80",
            "100",
            "120"
        );

        add(
            90,
            "Matemática",
            "Quanto é 9 × 6?",
            "Use a tabuada do nove.",
            0,
            "54",
            "56",
            "63",
            "48"
        );

        add(
            91,
            "Matemática",
            "Quanto é 144 ÷ 12?",
            "Pense em qual número multiplicado por 12 resulta em 144.",
            2,
            "10",
            "11",
            "12",
            "14"
        );

        add(
            92,
            "Matemática",
            "Qual destes números é primo?",
            "Um número primo tem exatamente dois divisores positivos.",
            1,
            "15",
            "17",
            "21",
            "27"
        );

        add(
            93,
            "Matemática",
            "Qual é a metade de 3/4?",
            "Multiplique a fração por 1/2.",
            3,
            "3/2",
            "3/4",
            "1/4",
            "3/8"
        );

        addMedium(
            18,
            "Matemática",
            "Uma mochila custa R$ 160 e recebe desconto de 15%. Qual é o preço final?",
            "Calcule 15% de 160 e subtraia o desconto do preço.",
            1,
            "R$ 124",
            "R$ 136",
            "R$ 145",
            "R$ 152"
        );

        addMedium(
            19,
            "Matemática",
            "Resolva: 3(2x - 1) = 21.",
            "Divida por 3 e depois isole x.",
            2,
            "x = 5",
            "x = 3",
            "x = 4",
            "x = 7"
        );

        addMedium(
            27,
            "Matemática",
            "Uma receita para 4 pessoas usa 300 g de farinha. Mantendo a proporção, quanto será necessário para 6 pessoas?",
            "Cada pessoa corresponde à mesma quantidade de farinha.",
            2,
            "375 g",
            "400 g",
            "450 g",
            "600 g"
        );

        addMedium(
            78,
            "Matemática",
            "Um produto de R$ 200 recebeu desconto de 20%. Qual é o novo preço?",
            "Calcule 20% de 200 e subtraia o desconto.",
            2,
            "R$ 140",
            "R$ 150",
            "R$ 160",
            "R$ 180"
        );

        addMedium(
            79,
            "Matemática",
            "Qual é a área de um triângulo com base de 10 cm e altura de 6 cm?",
            "A área do triângulo é base vezes altura dividido por dois.",
            0,
            "30 cm²",
            "60 cm²",
            "16 cm²",
            "36 cm²"
        );

        addMedium(
            110,
            "Matemática",
            "Um ônibus percorre 180 km em 3 horas. Qual é sua velocidade média?",
            "Divida a distância total pelo tempo.",
            2,
            "30 km/h",
            "45 km/h",
            "60 km/h",
            "90 km/h"
        );

        addMedium(
            111,
            "Matemática",
            "Qual é o resultado de 2² + 3²?",
            "Calcule cada potência antes de somar.",
            1,
            "9",
            "13",
            "25",
            "36"
        );

        addMedium(
            112,
            "Matemática",
            "Uma caixa tem 5 fileiras com 8 lápis em cada uma. Quantos lápis há?",
            "Multiplique o número de fileiras pela quantidade em cada uma.",
            2,
            "13",
            "35",
            "40",
            "45"
        );

        addMedium(
            113,
            "Matemática",
            "Quatro cadernos custam R$ 28. Mantendo o mesmo preço por unidade, quanto custam sete cadernos?",
            "Descubra o preço de um caderno e multiplique por sete.",
            1,
            "R$ 42",
            "R$ 49",
            "R$ 56",
            "R$ 63"
        );
        // Ciências: perguntas fáceis primeiro e perguntas médias depois.
        add(
            7,
            "Ciências",
            "Qual órgão bombeia o sangue pelo corpo?",
            "Ele bate continuamente no tórax.",
            2,
            "Pulmão",
            "Cérebro",
            "Coração",
            "Estômago"
        );

        add(
            8,
            "Ciências",
            "Qual estado da água tem volume definido e forma variável?",
            "Toma a forma do recipiente.",
            1,
            "Sólido",
            "Líquido",
            "Gasoso",
            "Plasma"
        );

        add(
            9,
            "Ciências",
            "Qual processo permite às plantas produzir alimento usando luz?",
            "A clorofila capta energia solar.",
            2,
            "Respiração",
            "Fermentação",
            "Fotossíntese",
            "Digestão"
        );

        add(
            49,
            "Ciências",
            "Qual planeta é conhecido como Planeta Vermelho?",
            "Sua superfície rica em óxido de ferro parece avermelhada.",
            3,
            "Vênus",
            "Júpiter",
            "Saturno",
            "Marte"
        );

        add(
            50,
            "Ciências",
            "Qual fonte de energia vem do Sol?",
            "Painéis solares aproveitam essa fonte renovável.",
            0,
            "energia solar",
            "energia nuclear",
            "carvão mineral",
            "petróleo"
        );

        add(
            51,
            "Ciências",
            "Que órgão usamos principalmente para respirar?",
            "Eles ficam no tórax e participam das trocas gasosas.",
            2,
            "estômago",
            "cérebro",
            "pulmões",
            "rins"
        );

        add(
            52,
            "Ciências",
            "Qual destes animais é mamífero?",
            "Mamíferos alimentam os filhotes com leite.",
            1,
            "tubarão",
            "baleia",
            "sardinha",
            "polvo"
        );

        add(
            53,
            "Ciências",
            "Qual parte da planta absorve água do solo?",
            "Essa parte geralmente fica sob a terra.",
            2,
            "flor",
            "folha",
            "raiz",
            "fruto"
        );

        add(
            54,
            "Ciências",
            "A água congela aproximadamente a quantos graus Celsius?",
            "É a temperatura de congelamento da água pura ao nível do mar.",
            1,
            "10 °C",
            "0 °C",
            "32 °C",
            "100 °C"
        );

        add(
            55,
            "Ciências",
            "Qual sentido usamos para perceber sons?",
            "Esse sentido depende dos ouvidos.",
            0,
            "audição",
            "visão",
            "olfato",
            "paladar"
        );

        add(
            56,
            "Ciências",
            "Qual material é atraído por um ímã?",
            "Esse metal é usado em muitos objetos magnéticos.",
            2,
            "madeira",
            "plástico",
            "ferro",
            "papel"
        );

        add(
            57,
            "Ciências",
            "Qual destes é um estado físico da água?",
            "A água pode existir como gelo, líquido ou vapor.",
            1,
            "luminoso",
            "gasoso",
            "metálico",
            "elétrico"
        );

        add(
            94,
            "Ciências",
            "Qual gás as plantas absorvem da atmosfera durante a fotossíntese?",
            "As plantas usam esse gás e água para produzir açúcares.",
            2,
            "oxigênio",
            "nitrogênio",
            "dióxido de carbono",
            "hidrogênio"
        );

        add(
            95,
            "Ciências",
            "Qual vitamina a pele pode produzir com a ajuda da luz solar?",
            "Essa vitamina também é importante para a saúde dos ossos.",
            2,
            "vitamina B12",
            "vitamina C",
            "vitamina D",
            "vitamina E"
        );

        add(
            96,
            "Ciências",
            "Qual destes animais é invertebrado?",
            "Invertebrados não possuem coluna vertebral.",
            3,
            "sardinha",
            "sapo",
            "lagarto",
            "minhoca"
        );

        add(
            97,
            "Ciências",
            "Qual órgão filtra o sangue e produz urina?",
            "Normalmente temos dois desses órgãos.",
            0,
            "rins",
            "fígado",
            "pulmões",
            "estômago"
        );

        addMedium(
            20,
            "Ciências",
            "Se os produtores diminuem em uma cadeia alimentar, qual efeito tende a ocorrer primeiro?",
            "Pense nos organismos que se alimentam diretamente dos produtores.",
            1,
            "Aumenta imediatamente a energia disponível.",
            "Diminui o alimento disponível para os consumidores primários.",
            "Os decompositores deixam de existir.",
            "A cadeia alimentar não sofre alterações."
        );

        addMedium(
            21,
            "Ciências",
            "Em um circuito simples, o que ocorre quando o interruptor fica aberto?",
            "Um circuito aberto interrompe o caminho da corrente elétrica.",
            2,
            "A corrente aumenta.",
            "A pilha produz mais energia.",
            "A corrente deixa de circular e a lâmpada apaga.",
            "A lâmpada fica mais brilhante."
        );

        addMedium(
            28,
            "Ciências",
            "Ao aquecer água líquida até ferver, que mudança de estado ocorre?",
            "A água passa do estado líquido para o gasoso.",
            0,
            "vaporização",
            "condensação",
            "solidificação",
            "fusão"
        );

        addMedium(
            80,
            "Ciências",
            "Em um dia ensolarado, quando a sombra de um poste tende a ser mais curta?",
            "A posição aparente do Sol no céu muda o comprimento das sombras.",
            1,
            "no começo da manhã",
            "por volta do meio-dia solar",
            "no pôr do sol",
            "à meia-noite"
        );

        addMedium(
            81,
            "Ciências",
            "Qual é uma função importante dos decompositores em um ecossistema?",
            "Fungos e muitas bactérias atuam nesse processo.",
            2,
            "produzir luz solar",
            "impedir a fotossíntese",
            "decompor matéria orgânica e devolver nutrientes ao ambiente",
            "transformar consumidores em produtores"
        );

        addMedium(
            114,
            "Ciências",
            "Qual movimento da Terra causa a alternância entre dia e noite?",
            "A Terra gira em torno de um eixo imaginário.",
            1,
            "translação",
            "rotação",
            "revolução lunar",
            "inclinação orbital"
        );

        addMedium(
            115,
            "Ciências",
            "Qual estrutura celular controla muitas das atividades da célula?",
            "Ela contém a maior parte do material genético das células eucarióticas.",
            2,
            "membrana plasmática",
            "citoplasma",
            "núcleo",
            "parede celular"
        );

        addMedium(
            116,
            "Ciências",
            "Como se chama a relação ecológica em que as duas espécies se beneficiam?",
            "Ambos os organismos envolvidos obtêm benefício.",
            0,
            "mutualismo",
            "parasitismo",
            "predação",
            "competição"
        );

        addMedium(
            117,
            "Ciências",
            "Em qual camada da atmosfera se concentra a camada de ozônio que absorve grande parte da radiação ultravioleta?",
            "Ela fica acima da troposfera.",
            1,
            "troposfera",
            "estratosfera",
            "mesosfera",
            "termosfera"
        );
        // História: perguntas fáceis primeiro e perguntas médias depois.
        add(
            10,
            "História",
            "Em que ano foi proclamada a Independência do Brasil?",
            "Aconteceu em 7 de setembro.",
            1,
            "1500",
            "1822",
            "1889",
            "1964"
        );

        add(
            11,
            "História",
            "Em que ano foi proclamada a República no Brasil?",
            "O evento ocorreu no século XIX.",
            2,
            "1822",
            "1850",
            "1889",
            "1930"
        );

        add(
            12,
            "História",
            "Qual civilização construiu as pirâmides de Gizé?",
            "Floresceu às margens do Nilo.",
            1,
            "Romana",
            "Egípcia",
            "Grega",
            "Inca"
        );

        add(
            58,
            "História",
            "Quem proclamou a Independência do Brasil em 1822?",
            "A proclamação ocorreu às margens do riacho Ipiranga.",
            0,
            "Dom Pedro I",
            "Dom Pedro II",
            "Deodoro da Fonseca",
            "Tiradentes"
        );

        add(
            59,
            "História",
            "A Lei Áurea, assinada em 1888, aboliu o quê?",
            "A lei encerrou legalmente essa prática no Brasil.",
            2,
            "a monarquia",
            "o voto",
            "a escravidão",
            "a imigração"
        );

        add(
            60,
            "História",
            "Qual cidade foi capital do Brasil antes de Brasília?",
            "A capital foi transferida para Brasília em 1960.",
            1,
            "Salvador",
            "Rio de Janeiro",
            "São Paulo",
            "Recife"
        );

        add(
            61,
            "História",
            "Que profissional estuda vestígios materiais de sociedades antigas?",
            "Esse profissional analisa objetos, construções e outros vestígios.",
            3,
            "astrônomo",
            "biólogo",
            "geólogo",
            "arqueólogo"
        );

        add(
            62,
            "História",
            "Qual civilização ficou conhecida pela democracia em Atenas?",
            "Atenas era uma importante cidade-Estado dessa civilização.",
            2,
            "romana",
            "egípcia",
            "grega",
            "inca"
        );

        add(
            63,
            "História",
            "Quem foi o primeiro presidente do Brasil?",
            "Ele assumiu o cargo após a Proclamação da República.",
            1,
            "Getúlio Vargas",
            "Deodoro da Fonseca",
            "Juscelino Kubitschek",
            "Dom Pedro I"
        );

        add(
            64,
            "História",
            "Em que data se comemora a Independência do Brasil?",
            "A data lembra o acontecimento de 1822.",
            2,
            "15 de novembro",
            "21 de abril",
            "7 de setembro",
            "1º de maio"
        );

        add(
            65,
            "História",
            "Em 1500, qual povo europeu chegou às terras que hoje formam o Brasil?",
            "A expedição era comandada por Pedro Álvares Cabral.",
            0,
            "portugueses",
            "espanhóis",
            "franceses",
            "holandeses"
        );

        add(
            66,
            "História",
            "Quem assinou a Lei Áurea em 1888?",
            "A princesa regente assinou a lei em nome do Império.",
            3,
            "Maria Leopoldina",
            "Maria Quitéria",
            "Anita Garibaldi",
            "Princesa Isabel"
        );

        add(
            98,
            "História",
            "Qual era o nome de Tiradentes?",
            "Ele participou da Inconfidência Mineira.",
            1,
            "José Bonifácio",
            "Joaquim José da Silva Xavier",
            "Duque de Caxias",
            "Antônio Conselheiro"
        );

        add(
            99,
            "História",
            "Qual invenção chinesa ajudou a registrar e difundir textos antigos?",
            "Ela permitiu registrar palavras em folhas leves.",
            3,
            "bússola",
            "pólvora",
            "porcelana",
            "papel"
        );

        add(
            100,
            "História",
            "A que período da Pré-História são associadas ferramentas de pedra lascada?",
            "É o período mais antigo da Idade da Pedra.",
            3,
            "Neolítico",
            "Idade dos Metais",
            "Antiguidade",
            "Paleolítico"
        );

        add(
            101,
            "História",
            "Qual grupo social trabalhava a terra nos feudos medievais?",
            "Esses trabalhadores estavam ligados às terras do senhor feudal.",
            2,
            "comerciantes marítimos",
            "industriais",
            "servos",
            "senadores"
        );

        addMedium(
            22,
            "História",
            "Uma carta escrita por alguém que participou de um acontecimento é considerada:",
            "Ela foi produzida por uma pessoa diretamente ligada ao período estudado.",
            1,
            "fonte secundária",
            "fonte primária",
            "relato ficcional",
            "fonte arqueológica"
        );

        addMedium(
            23,
            "História",
            "Qual transformação marcou a Revolução Industrial?",
            "Considere as mudanças nos meios de produção a partir do século XVIII.",
            0,
            "A mecanização da produção em fábricas.",
            "O fim do comércio entre países.",
            "A substituição de máquinas por trabalho artesanal.",
            "O abandono das cidades."
        );

        addMedium(
            29,
            "História",
            "Qual é a ordem cronológica correta desses acontecimentos no Brasil?",
            "Compare os anos de 1822, 1888 e 1889.",
            1,
            "Abolição, República, Independência.",
            "Independência, Abolição, República.",
            "República, Independência, Abolição.",
            "Independência, República, Abolição."
        );

        addMedium(
            82,
            "História",
            "Por que preservar documentos e objetos antigos é importante para estudar História?",
            "Esses registros ajudam a investigar e interpretar sociedades do passado.",
            0,
            "Eles fornecem evidências sobre o passado.",
            "Eles contam todos os acontecimentos sem precisar de interpretação.",
            "Eles substituem qualquer outra fonte histórica.",
            "Eles impedem que novas pesquisas sejam feitas."
        );

        addMedium(
            83,
            "História",
            "Qual foi um efeito da expansão da imprensa de tipos móveis na Europa?",
            "A impressão tornou mais rápida a produção de livros e textos.",
            1,
            "Os livros deixaram de circular.",
            "Mais textos puderam ser reproduzidos e difundidos.",
            "A escrita foi abandonada.",
            "As universidades foram proibidas."
        );

        addMedium(
            118,
            "História",
            "O que foi o Tratado de Tordesilhas, firmado em 1494?",
            "O acordo envolveu as coroas de Portugal e Espanha durante a expansão marítima.",
            0,
            "Um acordo que dividia áreas de conquista entre Portugal e Espanha.",
            "Uma lei que aboliu a escravidão no Brasil.",
            "Um tratado que encerrou a Revolução Francesa.",
            "Uma aliança entre cidades gregas."
        );

        addMedium(
            119,
            "História",
            "Qual mudança populacional esteve ligada à industrialização europeia?",
            "As fábricas concentradas nas cidades atraíram trabalhadores.",
            1,
            "O abandono permanente das cidades.",
            "A migração de muitas pessoas do campo para as cidades.",
            "A redução de todas as atividades comerciais.",
            "O fim do crescimento urbano."
        );

        addMedium(
            120,
            "História",
            "Por que historiadores comparam fontes diferentes sobre o mesmo acontecimento?",
            "Fontes podem mostrar perspectivas e informações distintas.",
            2,
            "Para descartar qualquer interpretação.",
            "Para provar que uma fonte sempre está correta.",
            "Para cruzar evidências e construir uma interpretação mais fundamentada.",
            "Para evitar estudar o contexto."
        );

        addMedium(
            121,
            "História",
            "A Revolução Francesa começou em 1789. Em qual século isso ocorreu?",
            "O século I vai do ano 1 ao 100; faça a contagem por centenas.",
            3,
            "século XVI",
            "século XVII",
            "século XIX",
            "século XVIII"
        );
        // Geografia: perguntas fáceis primeiro e perguntas médias depois.
        add(
            13,
            "Geografia",
            "Qual é a capital do Brasil?",
            "É a sede do governo federal.",
            1,
            "Rio de Janeiro",
            "Brasília",
            "São Paulo",
            "Salvador"
        );

        add(
            14,
            "Geografia",
            "Qual linha divide a Terra em hemisférios Norte e Sul?",
            "Passa pela latitude zero.",
            2,
            "Trópico de Capricórnio",
            "Meridiano de Greenwich",
            "Linha do Equador",
            "Trópico de Câncer"
        );

        add(
            15,
            "Geografia",
            "Qual é o maior oceano da Terra?",
            "Seu nome lembra águas tranquilas.",
            0,
            "Pacífico",
            "Atlântico",
            "Índico",
            "Ártico"
        );

        add(
            67,
            "Geografia",
            "Qual é o maior continente do planeta?",
            "É também o continente mais populoso.",
            0,
            "Ásia",
            "África",
            "Europa",
            "Oceania"
        );

        add(
            68,
            "Geografia",
            "Em qual direção o Sol nasce aproximadamente?",
            "Essa direção fica oposta ao oeste.",
            2,
            "norte",
            "sul",
            "leste",
            "oeste"
        );

        add(
            69,
            "Geografia",
            "Qual oceano banha o litoral brasileiro?",
            "O litoral brasileiro está voltado para esse oceano.",
            1,
            "Pacífico",
            "Atlântico",
            "Índico",
            "Glacial Ártico"
        );

        add(
            70,
            "Geografia",
            "Qual é a capital do estado de São Paulo?",
            "A capital estadual tem o mesmo nome do estado.",
            2,
            "Campinas",
            "Santos",
            "São Paulo",
            "Ribeirão Preto"
        );

        add(
            71,
            "Geografia",
            "Como chamamos uma porção de terra cercada por água?",
            "Há muitas delas em oceanos, rios e lagos.",
            0,
            "ilha",
            "planalto",
            "vale",
            "península"
        );

        add(
            72,
            "Geografia",
            "Que tipo de água encontramos normalmente em rios e lagos?",
            "Ela tem baixa concentração de sais e pode ser tratada para consumo.",
            1,
            "água salgada",
            "água doce",
            "água mineralizada",
            "água oceânica"
        );

        add(
            73,
            "Geografia",
            "Em qual região do Brasil está a maior parte da Floresta Amazônica?",
            "É a região que inclui estados como Amazonas e Pará.",
            2,
            "Sul",
            "Sudeste",
            "Norte",
            "Centro-Oeste"
        );

        add(
            74,
            "Geografia",
            "O que representa a rosa dos ventos em um mapa?",
            "Ela ajuda a orientar quem lê o mapa.",
            0,
            "direções",
            "distâncias",
            "altitudes",
            "temperaturas"
        );

        add(
            75,
            "Geografia",
            "O que é uma nascente de rio?",
            "É o ponto onde o curso de água começa.",
            2,
            "o trecho mais largo do rio",
            "o lugar onde o rio encontra o mar",
            "o local onde o rio se origina",
            "uma ilha no meio do rio"
        );

        add(
            102,
            "Geografia",
            "Qual continente fica ao sul da Europa, separado pelo mar Mediterrâneo?",
            "É o segundo maior continente do planeta.",
            1,
            "Ásia",
            "África",
            "Oceania",
            "América do Sul"
        );

        add(
            103,
            "Geografia",
            "Como se chama o movimento da Terra ao redor do Sol?",
            "Esse movimento, junto com a inclinação do eixo, marca a duração do ano.",
            0,
            "translação",
            "rotação",
            "precessão",
            "oscilação"
        );

        add(
            104,
            "Geografia",
            "Qual tipo de mapa destaca fronteiras entre países e estados?",
            "Ele representa divisões territoriais e políticas.",
            2,
            "mapa climático",
            "mapa físico",
            "mapa político",
            "mapa de relevo"
        );

        add(
            105,
            "Geografia",
            "Qual é a capital da Argentina?",
            "É a maior cidade do país, às margens do Rio da Prata.",
            3,
            "Córdoba",
            "Mendoza",
            "Rosário",
            "Buenos Aires"
        );

        addMedium(
            24,
            "Geografia",
            "Uma cidade está a 30° S e 60° O. O que essas coordenadas indicam?",
            "S e O mostram a posição em relação ao Equador e ao meridiano de Greenwich.",
            3,
            "Hemisférios Norte e Oriental.",
            "Hemisférios Norte e Ocidental.",
            "Hemisférios Sul e Oriental.",
            "Hemisférios Sul e Ocidental."
        );

        addMedium(
            25,
            "Geografia",
            "Quando a vegetação nativa é removida e o solo fica exposto, qual processo pode se intensificar?",
            "Sem raízes protegendo o solo, chuva e vento carregam suas partículas.",
            1,
            "Formação de geleiras.",
            "Erosão do solo.",
            "Redução do escoamento da água.",
            "Aumento da infiltração em todos os casos."
        );

        addMedium(
            30,
            "Geografia",
            "Em um mapa na escala 1:100.000, a que distância real corresponde 1 cm no mapa?",
            "100.000 cm equivalem a 1 km.",
            2,
            "100 m",
            "500 m",
            "1 km",
            "10 km"
        );

        addMedium(
            84,
            "Geografia",
            "Qual é a função da legenda de um mapa?",
            "Ela apresenta a chave para interpretar os símbolos usados.",
            3,
            "indicar apenas a escala",
            "mostrar somente os pontos cardeais",
            "registrar a data de criação do planeta",
            "explicar o significado de cores e símbolos"
        );

        addMedium(
            85,
            "Geografia",
            "Qual característica é comum ao clima semiárido do interior do Nordeste brasileiro?",
            "A região costuma enfrentar períodos prolongados com pouca chuva.",
            2,
            "chuvas abundantes durante todo o ano",
            "temperaturas sempre abaixo de zero",
            "chuvas escassas e irregulares",
            "neve frequente no inverno"
        );

        addMedium(
            122,
            "Geografia",
            "O que as curvas de nível representam em um mapa topográfico?",
            "Linhas próximas costumam indicar mudanças mais rápidas de altitude.",
            2,
            "a divisão entre países",
            "a direção dos ventos",
            "altitudes e formas do relevo",
            "a distribuição de idiomas"
        );

        addMedium(
            123,
            "Geografia",
            "O que caracteriza a migração pendular?",
            "É um deslocamento recorrente ligado a atividades diárias.",
            0,
            "Deslocamentos regulares entre casa e trabalho ou estudo.",
            "A mudança definitiva de um país para outro.",
            "A viagem feita apenas durante as férias.",
            "A migração de animais entre continentes."
        );

        addMedium(
            124,
            "Geografia",
            "Uma localidade está a 20° N. Em qual hemisfério ela fica?",
            "A letra N indica a posição em relação à Linha do Equador.",
            1,
            "Hemisfério Sul",
            "Hemisfério Norte",
            "Hemisfério Oriental",
            "Hemisfério Ocidental"
        );

        addMedium(
            125,
            "Geografia",
            "Por que áreas próximas ao litoral costumam ter menor amplitude térmica diária?",
            "A água do mar aquece e esfria mais lentamente do que o solo.",
            3,
            "Por causa da altitude sempre elevada.",
            "Porque o litoral recebe menos luz solar.",
            "Devido à ausência de ventos.",
            "Pela influência moderadora do oceano."
        );
    }

    /** Retorna a lista de matérias, com os dados usados para montar o lobby. */
    private static void subjects(HttpExchange exchange) throws IOException {
        if (!method(exchange, "GET")) {
            return;
        }

        StringBuilder json = new StringBuilder("[");
        int index = 0;

        for (Subject subject : SUBJECTS.values()) {
            if (index++ > 0) {
                json.append(',');
            }

            json.append("{\"name\":").append(q(subject.name()))
                .append(",\"hero\":").append(q(subject.hero()))
                .append(",\"role\":").append(q(subject.role()))
                .append(",\"color\":").append(q(subject.color()))
                .append(",\"icon\":").append(q(subject.icon()))
                .append('}');
        }

        send(exchange, 200, json.append(']').toString(), "application/json; charset=utf-8");
    }

    /** Escolhe uma pergunta aleatória ainda não usada nesta fase e devolve suas alternativas. */
    private static void question(HttpExchange exchange) throws IOException {
        if (!method(exchange, "GET")) {
            return;
        }

        String rawQuery = exchange.getRequestURI().getRawQuery();
        String subjectName = query(rawQuery, "subject");
        String difficulty = query(rawQuery, "difficulty");
        List<Question> subjectQuestions = BANK.get(subjectName);

        if (subjectQuestions == null) {
            send(exchange, 404, "{\"error\":\"Matéria não encontrada\"}", "application/json; charset=utf-8");
            return;
        }

        List<Question> pool = subjectQuestions.stream()
            .filter(item -> difficulty.isEmpty() || item.difficulty().equalsIgnoreCase(difficulty))
            .toList();

        if (pool.isEmpty()) {
            send(exchange, 404, "{\"error\":\"Dificuldade não encontrada\"}", "application/json; charset=utf-8");
            return;
        }

        Set<Integer> excludedIds = new HashSet<>();
        String excludedParameter = query(rawQuery, "exclude");

        for (String value : excludedParameter.split(",")) {
            try {
                if (!value.isBlank()) {
                    excludedIds.add(Integer.parseInt(value));
                }
            } catch (NumberFormatException ignored) {
                // Valores inválidos são ignorados; IDs válidos continuam sendo excluídos.
            }
        }

        List<Question> freshQuestions = pool.stream()
            .filter(item -> !excludedIds.contains(item.id()))
            .toList();

        if (freshQuestions.isEmpty()) {
            send(
                exchange,
                410,
                "{\"error\":\"Todas as perguntas desta matéria e dificuldade já foram usadas nesta fase. A aventura será encerrada para evitar repetição.\"}",
                "application/json; charset=utf-8"
            );
            return;
        }

        Question selected = freshQuestions.get(ThreadLocalRandom.current().nextInt(freshQuestions.size()));
        StringBuilder optionsJson = new StringBuilder("[");

        for (int index = 0; index < selected.options().size(); index++) {
            if (index > 0) {
                optionsJson.append(',');
            }
            optionsJson.append(q(selected.options().get(index)));
        }

        int experience = selected.difficulty().equals("medium") ? 75 : 50;
        String json = "{\"id\":" + selected.id()
            + ",\"subject\":" + q(selected.subject())
            + ",\"prompt\":" + q(selected.prompt())
            + ",\"hint\":" + q(selected.hint())
            + ",\"difficulty\":" + q(selected.difficulty())
            + ",\"options\":" + optionsJson.append(']')
            + ",\"exp\":" + experience + "}";

        send(exchange, 200, json, "application/json; charset=utf-8");
    }

    /** Confere a alternativa enviada e devolve acerto, experiência, dano e índice correto. */
    private static void answer(HttpExchange exchange) throws IOException {
        if (!method(exchange, "POST")) {
            return;
        }

        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        int questionId = number(body, "questionId");
        int selectedOption = number(body, "selectedOption");

        Question found = BANK.values().stream()
            .flatMap(List::stream)
            .filter(item -> item.id() == questionId)
            .findFirst()
            .orElse(null);

        if (found == null || selectedOption < -1 || selectedOption >= 4) {
            send(exchange, 400, "{\"error\":\"Resposta inválida\"}", "application/json; charset=utf-8");
            return;
        }

        boolean correct = selectedOption == found.answer();
        int experience = correct ? (found.difficulty().equals("medium") ? 75 : 50) : 0;
        int bossDamage = correct ? 35 : 0;
        int playerDamage = correct ? 0 : 20;

        String json = "{\"correct\":" + correct
            + ",\"gainedExp\":" + experience
            + ",\"bossDamage\":" + bossDamage
            + ",\"playerDamage\":" + playerDamage
            + ",\"correctOption\":" + found.answer() + "}";

        send(exchange, 200, json, "application/json; charset=utf-8");
    }

    /** Confere o método HTTP aceito pela rota e informa os métodos permitidos quando necessário. */
    private static boolean method(HttpExchange exchange, String expectedMethod) throws IOException {
        if (expectedMethod.equalsIgnoreCase(exchange.getRequestMethod())) {
            return true;
        }

        exchange.getResponseHeaders().set("Allow", expectedMethod);
        send(exchange, 405, "{\"error\":\"Método não permitido\"}", "application/json; charset=utf-8");
        return false;
    }

    /** Encontra um parâmetro na URL e converte seu conteúdo para texto normal. */
    private static String query(String rawQuery, String key) {
        if (rawQuery == null) {
            return "";
        }

        for (String part : rawQuery.split("&")) {
            String[] pair = part.split("=", 2);
            if (pair.length == 2 && pair[0].equals(key)) {
                return URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
            }
        }

        return "";
    }

    /** Lê um campo inteiro simples do JSON recebido pelo endpoint de respostas. */
    private static int number(String json, String key) {
        String pattern = "\\\"" + Pattern.quote(key) + "\\\"\\s*:\\s*(-?\\d+)";
        Matcher matcher = Pattern.compile(pattern).matcher(json);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : -1;
    }

    /** Escapa caracteres especiais para que o texto possa ser incluído em uma resposta JSON. */
    private static String q(String value) {
        return "\"" + value.replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r") + "\"";
    }

    /** Serve os arquivos HTML, CSS e JavaScript e bloqueia caminhos fora da pasta frontend. */
    private static void staticFile(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            send(exchange, 405, "Método não permitido", "text/plain; charset=utf-8");
            return;
        }

        String requestedPath = URLDecoder.decode(exchange.getRequestURI().getPath(), StandardCharsets.UTF_8);
        if (requestedPath.equals("/")) {
            requestedPath = "/index.html";
        }

        Path root = Path.of("frontend").toAbsolutePath().normalize();
        Path file = root.resolve(requestedPath.substring(1)).normalize();

        if (!file.startsWith(root) || !Files.isRegularFile(file)) {
            send(exchange, 404, "Não encontrado", "text/plain; charset=utf-8");
            return;
        }

        String fileName = file.toString();
        String contentType = fileName.endsWith(".css")
            ? "text/css; charset=utf-8"
            : fileName.endsWith(".js")
                ? "application/javascript; charset=utf-8"
                : "text/html; charset=utf-8";

        byte[] bytes = Files.readAllBytes(file);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(200, bytes.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    /** Envia uma resposta UTF-8 com o tipo de conteúdo e o código HTTP informados. */
    private static void send(HttpExchange exchange, int status, String body, String contentType) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(status, bytes.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }
}
