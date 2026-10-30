#!/usr/bin/env python3
"""Genera en/index.html (versión en inglés) a partir de index.html.

Uso:  python3 herramientas/generar-en.py

Cada texto en español de index.html se reemplaza por su traducción de la tabla TEXTOS.
Al terminar lista los textos que quedaron en español (por ejemplo, porque cambiaron
en index.html): hay que agregarlos o corregirlos en TEXTOS y volver a correr el script.
Los textos de app.js se traducen en i18n-en.js y los de las fichas en data/en.json.
"""
import html.parser
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent

# (español, inglés). Se aplican en orden; cada texto en español debe aparecer en index.html.
TEXTOS = [
    # Cabecera y metadatos
    ('<html lang="es">', '<html lang="en">'),
    ('<title>Santidad Matrimonial</title>', '<title>Santidad Matrimonial · Holy married couples</title>'),
    ('content="Esposos santos, beatos, venerables y siervos de Dios, con fotos, enlaces y el podcast Caminos de Santidad Matrimonial."',
     'content="Married saints, blesseds, venerables and servants of God, with photos, links and the podcast Caminos de Santidad Matrimonial."'),
    ('<meta property="og:locale" content="es_AR">', '<meta property="og:locale" content="en_US">'),
    ('aria-label="Inicio"', 'aria-label="Home"'),
    ('aria-label="Secciones"', 'aria-label="Sections"'),
    ('data-nav="inicio">Matrimonios</a>', 'data-nav="inicio">Couples</a>'),
    ('data-nav="estadisticas">Números</a>', 'data-nav="estadisticas">Numbers</a>'),
    ('data-nav="libro">Libro</a>', 'data-nav="libro">Book</a>'),
    ('data-nav="acerca">Acerca</a>', 'data-nav="acerca">About</a>'),
    ('<a class="idioma" href="en/" hreflang="en" lang="en" title="English version">EN</a>',
     '<a class="idioma" href="../" hreflang="es" lang="es" title="Versión en español">ES</a>'),

    # Matrimonios
    ('<h1>Esposos que llegaron, o han caminado, hacia los altares.</h1>',
     '<h1>Husbands and wives who strode to the altars.</h1>'),
    ('<p class="lede">Quiénes fueron y cómo conocer más sobre los esposos reconocidos como virtuosos por la Iglesia Católica a lo largo de los siglos.</p>',
     '<p class="lede">Learn about the married men and women the Catholic Church has recognized for their virtue through the centuries.</p>'),
    ('aria-label="Algunos matrimonios"', 'aria-label="Some couples"'),
    ('alt="Luis Martin y Celia Guérin"', 'alt="Louis Martin and Zélie Guérin"'),
    ('alt="Sergio Bernardini y Domenica Bedonni"', 'alt="Sergio Bernardini and Domenica Bedonni"'),
    ('alt="Carlos I de Austria y Zita de Borbón-Parma"', 'alt="Charles I of Austria and Zita of Bourbon-Parma"'),
    ('aria-label="Buscar y filtrar"', 'aria-label="Search and filter"'),
    ('aria-label="Título"', 'aria-label="Title"'),
    ('id="f-pais-lbl">País</span>', 'id="f-pais-lbl">Country</span>'),
    ('id="f-siglo-lbl">Siglo</span>', 'id="f-siglo-lbl">Century</span>'),
    ('id="f-ref-lbl">Referencia</span>', 'id="f-ref-lbl">Reference</span>'),
    ('id="f-mes-lbl">Santoral o memoria</span>', 'id="f-mes-lbl">Feast or memorial</span>'),
    ('data-todos="Todos"', 'data-todos="All"'),
    ('data-todos="Todas"', 'data-todos="All"'),
    ('-txt">Todos</span>', '-txt">All</span>'),
    ('-txt">Todas</span>', '-txt">All</span>'),
    ('data-limpiar>Todos</button>', 'data-limpiar>All</button>'),
    ('data-limpiar>Todas</button>', 'data-limpiar>All</button>'),
    ('<label>Orden <select id="f-orden">', '<label>Sort <select id="f-orden">'),
    ('>Destacados primero</option>', '>Featured first</option>'),
    ('<option value="nombre">Nombre</option>', '<option value="nombre">Name</option>'),
    ('>Siglo (más antiguos primero)</option>', '>Century (oldest first)</option>'),
    ('>Siglo (más recientes primero)</option>', '>Century (most recent first)</option>'),
    ('>Fiesta o Memoria (calendario)</option>', '>Feast or memorial (calendar)</option>'),
    ('id="f-ambos"> Ambos esposos con causa</label>', 'id="f-ambos"> Cause for both spouses</label>'),
    ('id="f-martir"> Mártires</label>', 'id="f-martir"> Martyrs</label>'),
    ('id="f-podcast"> Con episodio de podcast</label>', 'id="f-podcast"> With a podcast episode</label>'),
    ('class="sr">Buscar</label>', 'class="sr">Search</label>'),
    ('placeholder="Buscar por nombre o palabras clave"', 'placeholder="Search by name or keyword"'),
    ('hidden>Mostrar más</button>', 'hidden>Show more</button>'),

    # Podcast
    ('<p class="lede">Cada episodio cuenta la historia de un matrimonio o esposo camino a los altares, desde la voz de los autores en su ciclo de Radio María Argentina. Elija uno para escucharlo.</p>',
     '<p class="lede">Each episode tells the story of a married couple or spouse on the way to the altars, in the authors\' own voices, from their series on Radio María Argentina. The episodes are in Spanish. Choose one to listen.</p>'),
    ('>Escuchar el programa en Spotify</a>', '>Listen to the show on Spotify (Spanish)</a>'),

    # Libro
    ('alt="Tapa del libro Caminos de Santidad Matrimonial, de Leonardo Cozzi y Paola Risuleo: un cortejo de matrimonios caminando hacia una luz entre nubes."',
     'alt="Cover of the book Caminos de Santidad Matrimonial, by Leonardo Cozzi and Paola Risuleo: a procession of couples walking toward a light among the clouds."'),
    ('<p class="eyebrow">El libro</p>', '<p class="eyebrow">The book</p>'),
    ('<p class="libro-sub">20 caminos conyugales en 20 siglos</p>',
     '<p class="libro-sub">20 marital paths in 20 centuries · <span lang="en">Paths of Marital Holiness</span></p>'),
    ('<p class="lede">Las historias de cuarenta matrimonios que vivieron su vocación conyugal como camino hacia Dios, desde los primeros cristianos hasta nuestros días: reyes y labradores, médicos y educadores, mártires y madres heroicas. De esta investigación nacieron el podcast y este sitio.</p>',
     '<p class="lede">The stories of forty couples who lived their marital vocation as a path to God, from the first Christians to our own day: kings and farmers, doctors and teachers, martyrs and heroic mothers. The podcast and this site derived from this research. The book is currently available in Spanish.</p>'),
    ('<dt>Autores</dt>', '<dt>Authors</dt>'),
    ('<dd>Leonardo Cozzi y Paola Risuleo</dd>', '<dd>Leonardo Cozzi and Paola Risuleo</dd>'),
    ('<dt>Prólogo</dt>', '<dt>Foreword</dt>'),
    ('<dd>Sara Shaw de Critto, hija del venerable Enrique Shaw</dd>', '<dd>Sara Shaw de Critto, daughter of Venerable Enrique Shaw</dd>'),
    ('<dt>Con aportes de</dt>', '<dt>With contributions by</dt>'),
    ('<dt>Editorial</dt>', '<dt>Publisher</dt>'),
    ('<dt>Formato</dt>', '<dt>Format</dt>'),
    ('<dd>14 × 20 cm, rústica con solapas</dd>', '<dd>14 × 20 cm, paperback with flaps</dd>'),
    ('>Comprar en Ediciones Logos</a>', '>Buy from Ediciones Logos</a>'),
    ('href="#podcast">Escuchar el podcast</a>', 'href="#podcast">Listen to the podcast</a>'),
    ('«Ahora, ayudémonos mutuamente a llegar al Paraíso»<cite>Beato Carlos I de Austria</cite>',
     '“Now let us help each other to get to Heaven”<cite>Blessed Charles I of Austria</cite>'),
    ('<h2>Los 20 caminos</h2>', '<h2>The 20 paths</h2>'),
    ('<p class="nota">Cada capítulo reúne dos historias. Toque un nombre para ver su ficha.</p>',
     '<p class="nota">Each chapter brings together two stories. Tap a name to see the profile.</p>'),
    ('<h3>Primeros cristianos</h3>', '<h3>Early Christians</h3>'),
    ('<b>Iglesia doméstica</b>', '<b>Domestic church</b>'),
    ('<span>San José y Santa María</span>', '<span>Saint Joseph and Holy Mary</span>'),
    ('>Santos Áquila y Priscila</a>', '>Saints Aquila and Priscilla</a>'),
    ('<b>Esposas orantes</b>', '<b>Praying wives</b>'),
    ('>Santa Mónica y Patricio</a>', '>Saint Monica and Patricius</a>'),
    ('>Elisabeth Arrighi y Félix Leseur</a>', '>Elisabeth Arrighi and Félix Leseur</a>'),
    ('<b>Mártires de la fe</b>', '<b>Martyrs of the faith</b>'),
    ('>Santos Félix y Liliosa, Aurelio y Natalia</a>', '>Saints Felix and Liliosa, Aurelius and Natalia</a>'),
    ('>Cyprien y Daphrose Rugamba</a>', '>Cyprien and Daphrose Rugamba</a>'),
    ('<h3>Monarcas evangelizadores</h3>', '<h3>Evangelizing monarchs</h3>'),
    ('<b>Reyes de la humildad</b>', '<b>Kings of humility</b>'),
    ('>San Esteban y la beata Gisela</a>', '>Saint Stephen and Blessed Gisela</a>'),
    ('>San Luis IX y Margarita</a>', '>Saint Louis IX and Margaret</a>'),
    ('<b>Reinas de la virtud</b>', '<b>Queens of virtue</b>'),
    ('>Santa Margarita y Malcolm</a>', '>Saint Margaret and Malcolm</a>'),
    ('>Santa Adelaida y Otón I</a>', '>Saint Adelaide and Otto I</a>'),
    ('<h3>Aristocracia comprometida</h3>', '<h3>Committed aristocracy</h3>'),
    ('<b>Místicas y religiosos</b>', '<b>Mystics and religious</b>'),
    ('>Santa Brígida y Ulf</a>', '>Saint Bridget and Ulf</a>'),
    ('>Marcello Labor y Elsa Reiss</a>', '>Marcello Labor and Elsa Reiss</a>'),
    ('<b>Servidores públicos</b>', '<b>Public servants</b>'),
    ('>Santo Tomás Moro, Jane y Alice</a>', '>Saint Thomas More, Jane and Alice</a>'),
    ('>Pauline Archer y Georges Vanier</a>', '>Pauline Archer and Georges Vanier</a>'),
    ('<b>Benefactores sin medida</b>', '<b>Boundless benefactors</b>'),
    ('>Carlo y Giulia Falletti di Barolo</a>', '>Carlo and Giulia Falletti di Barolo</a>'),
    ('>Dorotea Chopitea y José María Serra</a>', '>Dorotea Chopitea and José María Serra</a>'),
    ('<h3>Santidad del hogar</h3>', '<h3>Holiness at home</h3>'),
    ('<b>Labradores, artesanos y santos del hogar</b>', '<b>Farmers, craftsmen and saints of the home</b>'),
    ('>Ana María y Domenico Taigi</a>', '>Anna Maria and Domenico Taigi</a>'),
    ('>Sergio y Domenica Bernardini</a>', '>Sergio and Domenica Bernardini</a>'),
    ('<b>Misioneros y pioneros</b>', '<b>Missionaries and pioneers</b>'),
    ('>Pierre Toussaint y Juliette Noel</a>', '>Pierre Toussaint and Juliette Noel</a>'),
    ('>Louis y Valérie Wandété</a>', '>Louis and Valérie Wandété</a>'),
    ('<b>Semilleros espirituales</b>', '<b>Spiritual seedbeds</b>'),
    ('>Luis y Celia Martin</a>', '>Louis and Zélie Martin</a>'),
    ('>Jerônimo y Zélia Castro Abreu</a>', '>Jerônimo and Zélia Castro Abreu</a>'),
    ('<h3>Heroísmo de la era moderna</h3>', '<h3>Heroism in the modern era</h3>'),
    ('<b>Fundadores sobre roca</b>', '<b>Founders on rock</b>'),
    ('>Frédéric Ozanam y Amélie Soulacroix</a>', '>Frédéric Ozanam and Amélie Soulacroix</a>'),
    ('>Gwen y Jerry Coniker</a>', '>Gwen and Jerry Coniker</a>'),
    ('<b>Escritores y periodistas</b>', '<b>Writers and journalists</b>'),
    ('>Conchita Cabrera y Francisco Armida</a>', '>Conchita Cabrera and Francisco Armida</a>'),
    ('>Raoul y Madeleine Follereau</a>', '>Raoul and Madeleine Follereau</a>'),
    ('<b>Educadores de almas</b>', '<b>Educators of souls</b>'),
    ('>José Tovini y Emilia Corbolani</a>', '>Giuseppe Tovini and Emilia Corbolani</a>'),
    ('>Tomás y Paquita Alvira</a>', '>Tomás and Paquita Alvira</a>'),
    ('<b>Profesionales de ideal trascendente</b>', '<b>Professionals with a transcendent ideal</b>'),
    ('>Luigi y María Beltrame Quattrocchi</a>', '>Luigi and Maria Beltrame Quattrocchi</a>'),
    ('>Enrique Shaw y Cecilia Bunge</a>', '>Enrique Shaw and Cecilia Bunge</a>'),
    ('<b>Políticos al servicio</b>', '<b>Politicians at the service of others</b>'),
    ('>Alcide De Gasperi y Francesca Romani</a>', '>Alcide De Gasperi and Francesca Romani</a>'),
    ('>Arístides y Adela Calvani</a>', '>Arístides and Adela Calvani</a>'),
    ('<b>Héroes en la guerra</b>', '<b>Heroes in wartime</b>'),
    ('>Odoardo Focherini y Maria Marchesi</a>', '>Odoardo Focherini and Maria Marchesi</a>'),
    ('>Takashi Nagai y Midori Moriyama</a>', '>Takashi Nagai and Midori Moriyama</a>'),
    ('<b>Trabajadores sociales</b>', '<b>Social workers</b>'),
    ('>Hildegarda y Alexander Burjan</a>', '>Hildegard and Alexander Burjan</a>'),
    ('>Catherine de Hueck y Eddie Doherty</a>', '>Catherine de Hueck and Eddie Doherty</a>'),
    ('<b>Médicos del espíritu</b>', '<b>Physicians of the spirit</b>'),
    ('>Jérôme Lejeune y Birthe Bringsted</a>', '>Jérôme Lejeune and Birthe Bringsted</a>'),
    ('>Vittorio Trancanelli y Lia Sabatini</a>', '>Vittorio Trancanelli and Lia Sabatini</a>'),
    ('<b>Madres heroicas</b>', '<b>Heroic mothers</b>'),
    ('>Santa Gianna Beretta y Pietro Molla</a>', '>Saint Gianna Beretta and Pietro Molla</a>'),
    ('>Chiara Corbella y Enrico Petrillo</a>', '>Chiara Corbella and Enrico Petrillo</a>'),
    ('<h2>En la prensa</h2>', '<h2>In the press <span class="nota">(in Spanish)</span></h2>'),
    (' · enero 2024</span>', ' · January 2024</span>'),
    (' · abril 2024</span>', ' · April 2024</span>'),
    (' · febrero 2025</span>', ' · February 2025</span>'),
    ('<span class="leer">Leer nota</span>', '<span class="leer">Read article</span>'),
    ('aria-label="Ver el video de la presentación del libro en Radio María"', 'aria-label="Watch the video of the book launch on Radio María"'),
    ('<h3>Presentación del libro en Radio María</h3>', '<h3>Book launch on Radio María (Spanish)</h3>'),
    ('data-yt="MayGoZyEEkA" target="_blank" rel="noopener">Ver video</a>', 'data-yt="MayGoZyEEkA" target="_blank" rel="noopener">Watch video</a>'),
    ('<h2>Los autores</h2>', '<h2>The authors</h2>'),
    ('<p>Paola y Leo Cozzi son padres de cuatro hijos y viven en Los Cardales, cerca de Buenos Aires. Son un matrimonio consagrado al Instituto de Familias del Movimiento Apostólico de Schoenstatt. Paola es psicopedagoga y ha trabajado en varias instituciones educativas; Leo es licenciado en Administración de Empresas y se dedica a la consultoría de procesos y calidad. Juntos han trabajado en la formación de jóvenes y matrimonios, en temas de vocación matrimonial y misión cristiana.</p>',
     '<p>Paola and Leo Cozzi are the parents of four children and live in Los Cardales, near Buenos Aires. They are a couple consecrated to the Institute of Families of the Schoenstatt Apostolic Movement. Paola is an educational psychologist and has worked in several schools; Leo holds a degree in Business Administration and works as a process and quality consultant. Together they have worked in the formation of young people and couples, on the married vocation and Christian mission.</p>'),
    ('<h2>Dónde conseguirlo</h2>', '<h2>Where to get it</h2>'),
    ('>Ediciones Logos</a>, por internet.</li>', '>Ediciones Logos</a>, online.</li>'),
    ('<li>Librerías Ágape y Claretiana, en Argentina.</li>', '<li>Ágape and Claretiana bookstores, in Argentina.</li>'),
    ('<li>Santuarios de Schoenstatt de Buenos Aires, F. Varela, Córdoba y Miami.</li>', '<li>Schoenstatt shrines in Buenos Aires, F. Varela, Córdoba and Miami.</li>'),
    ('>Schoenstatt.store</a>, en Estados Unidos.</li>', '>Schoenstatt.store</a>, in the United States.</li>'),

    # Números
    ('<p class="eyebrow">Números</p>', '<p class="eyebrow">Numbers</p>'),
    ('<h1>Los esposos santos, en números</h1>', '<h1>Holy spouses, by the numbers</h1>'),
    ('<p class="lede">Cuántos son, en qué etapa está su causa, de dónde y de qué siglo son, y qué vocación los distinguió. Toque una barra para ver esos casos.</p>',
     '<p class="lede">How many there are, what stage their cause has reached, where and when they lived, and what set them apart. Tap a bar to see those cases.</p>'),
    ('aria-label="Fichas por título"', 'aria-label="Profiles by title"'),
    ('<h2>Mapa de casos por país</h2>', '<h2>Map of cases by country</h2>'),
    ('<p class="nota">Marque un país para ver sus casos.</p>', '<p class="nota">Tap a country to see its cases.</p>'),
    ('aria-label="Cantidad de casos"', 'aria-label="Number of cases"'),
    ('<h2>Estado de la causa</h2>', '<h2>Status of the cause</h2>'),
    ('<p class="nota">Casos según el título alcanzado.</p>', '<p class="nota">Cases by the title reached.</p>'),
    ('<h2>Por continente</h2>', '<h2>By continent</h2>'),
    ('<p class="nota">Según el país actual, de uno o ambos.</p>', '<p class="nota">By present-day country, of one or both spouses.</p>'),
    ('<h2>Por siglo</h2>', '<h2>By century</h2>'),
    ('<p class="nota">Siglo en que transcurrió la mayor parte del matrimonio, por estado de la causa.</p>',
     '<p class="nota">Century in which most of the marriage took place, by status of the cause.</p>'),
    ('<h2>Por país</h2>', '<h2>By country</h2>'),
    ('id="est-pais-todos">Ver todos los países</button>', 'id="est-pais-todos">Show all countries</button>'),
    ('<h2>Por referencia vocacional</h2>', '<h2>By reference</h2>'),
    ('<p class="nota">Lo que caracterizó a los esposos.</p>', '<p class="nota">What characterized the spouses.</p>'),
    ('<h2>Fiestas y memorias por mes</h2>', '<h2>Feasts and memorials by month</h2>'),
    ('<p class="nota">En qué mes del calendario se los recuerda.</p>', '<p class="nota">The month of the calendar in which they are remembered.</p>'),
    ('<p class="est-pie">Nota: los números no incluyen varias decenas más de esposos beatificados en procesos colectivos por martirio.</p>',
     '<p class="est-pie">Note: these numbers do not include several dozen more spouses beatified in group causes of martyrdom.</p>'),

    # Acerca
    ('<p class="eyebrow">Acerca</p>', '<p class="eyebrow">About</p>'),
    ('<h1>Sobre este sitio</h1>', '<h1>About this site</h1>'),
    ('<p>Este repositorio reúne a los esposos o matrimonios beatificados, canonizados o con causa de beatificación iniciada, a partir de la investigación realizada por Leonardo y Paola Cozzi, y reflejada en su libro “Caminos de Santidad Matrimonial”.</p>',
     '<p>This collection gathers married men and women, and married couples, who have been beatified, canonized or whose cause for beatification has been opened, based on the research by Leonardo and Paola Cozzi presented in their book “Caminos de Santidad Matrimonial” (Paths of Marital Holiness, in Spanish).</p>'),
    ('<h2>Títulos de acuerdo al proceso de beatificación</h2>', '<h2>Titles according to the process of beatification</h2>'),
    ('<dt>Santo</dt><dd>Fue canonizado y su culto se extiende a toda la Iglesia.</dd>',
     '<dt>Saint</dt><dd>Was canonized, and is venerated throughout the whole Church.</dd>'),
    ('<dt>Beato</dt><dd>Fue beatificado, habitualmente tras un milagro comprobado, o bien por reconocimiento de su martirio.</dd>',
     '<dt>Blessed</dt><dd>Was beatified, usually after a confirmed miracle, or through recognition of martyrdom.</dd>'),
    ('<dt>Venerable</dt><dd>La Iglesia reconoció que vivió las virtudes en grado heroico.</dd>',
     '<dt>Venerable</dt><dd>The Church recognized that he or she lived the virtues to a heroic degree.</dd>'),
    ('<dt>Siervo de Dios</dt><dd>Se abrió formalmente la causa de beatificación.</dd>',
     '<dt>Servant of God</dt><dd>The cause for beatification has been formally opened.</dd>'),
    ('<p>“Ambos esposos” indica que tanto marido como mujer tienen causa abierta o concluida. De todos modos se los menciona a ambos aunque uno de ellos no tenga causa iniciada, a efectos de reforzar la idea de la complementariedad conyugal.</p>',
     '<p>“Both spouses” means that both husband and wife have an open or concluded cause. Both are named in any case, even when only one of them has a cause, to underline the complementarity of husband and wife.</p>'),
    ('<p>El siglo corresponde a los años en que transcurrió la mayor parte del matrimonio, y el país citado corresponde a la conformación política actual. A efectos de reflejar una fecha de memoria, si la causa en curso corresponde a ambos cónyuges se toma la fecha de su matrimonio, de lo contrario se indica la fecha del fallecimiento.</p>',
     '<p>The century is the one in which most of the marriage took place, and the country is given by today\'s borders. For the memorial date, if the cause is for both spouses we use their wedding date; otherwise, the date of death.</p>'),
    ('<p>En el caso de los Venerables y Siervos de Dios, en nada se pretende prevenir el juicio de la autoridad eclesiástica respecto del proceso aún en curso.</p>',
     '<p>In the case of Venerables and Servants of God, nothing here is meant to anticipate the judgment of Church authority on causes still in progress.</p>'),
    ('<p>La referencia “Religioso/a” se utiliza en sentido amplio para identificar a presbíteros, obispos, monjes, abates, religiosas o abadesas. Puede haber sido contemporáneo al matrimonio (casos antiguos o de católicos ortodoxos) o bien al enviudar.</p>',
     '<p>The reference “Religious” is used broadly for priests, bishops, monks, abbots, nuns or abbesses. This may have happened during the marriage (in early cases, or among Eastern Catholics) or after being widowed.</p>'),
    ('<p>¿Ha encontrado algo para corregir o quiere acercarnos un comentario? Escríbanos aquí y lo leeremos con gusto:</p>',
     '<p>Found something to correct, or want to send us a comment? Write to us here and we will gladly read it (in English or Spanish):</p>'),
    ('<label>Comentario <textarea', '<label>Comment <textarea'),
    ('<label>Su correo electrónico, para responderle <input', '<label>Your email address, so we can reply <input'),
    ('value="Comentario desde Santidad Matrimonial"', 'value="Comment from Santidad Matrimonial (English site)"'),
    ('class="btn">Enviar</button>', 'class="btn">Send</button>'),
]

# Textos que quedan igual en inglés (nombres propios, marcas).
IGUALES = {
    "Santidad Matrimonial", "Caminos de Santidad Matrimonial", "Podcast", "Venerable", "EN", "×",
    "P. Thomas Kevin Kraft, OP", "Ediciones Logos, Áncora", "Ediciones Logos", "Schoenstatt.store",
    "Video · Radio María", "schoenstatt.org · enero 2024", "AICA · abril 2024", "UCALP · abril 2024",
    "schoenstatt.org · febrero 2025",
    # Títulos de las notas de prensa, que están en español.
    "Nuevo libro «Caminos de Santidad Matrimonial»", "Presentarán el libro «Caminos de santidad matrimonial»",
    "Se presentó el libro «Caminos de santidad matrimonial»", "Ciclo «Caminos de Santidad Matrimonial» en Radio María",
}

# Archivos del sitio que en/index.html toma de la carpeta de arriba.
RUTAS = re.compile(r'(href|src)="(?!https?:|#|\.\./|mailto:)((?:img|data)/[^"]*|[\w-]+\.(?:svg|png|css|js)(?:\?[^"]*)?)"')


class Textos(html.parser.HTMLParser):
    """Junta los textos visibles y los atributos que se leen en pantalla."""
    ATTRS = ("alt", "aria-label", "title", "placeholder", "data-todos")

    def __init__(self):
        super().__init__()
        self.lista, self._script = [], False

    def handle_starttag(self, tag, attrs):
        self._script = tag in ("script", "style")
        a = dict(attrs)
        leidos = [a.get(k) for k in self.ATTRS]
        if tag == "meta" and (a.get("name") == "description" or a.get("property") in ("og:title", "og:description")):
            leidos.append(a.get("content"))
        if tag == "input" and a.get("name") == "_subject":
            leidos.append(a.get("value"))
        self.lista += [v.strip() for v in leidos if v and v.strip()]

    def handle_endtag(self, tag):
        self._script = False

    def handle_data(self, d):
        if not self._script and d.strip():
            self.lista.append(" ".join(d.split()))


def textos(h):
    p = Textos(); p.feed(h); return p.lista


def main():
    es = (RAIZ / "index.html").read_text(encoding="utf-8")
    en = es
    faltan = []
    for a, b in TEXTOS:
        if a not in en:
            faltan.append(a)
        en = en.replace(a, b)
    en = RUTAS.sub(lambda m: '%s="../%s"' % (m.group(1), m.group(2)), en)
    # i18n-en.js va antes que app.js.
    en = re.sub(r'(<script src="\.\./app\.js(\?[^"]*)?"></script>)', r'<script src="../i18n-en.js\2"></script>\n\1', en)
    destino = RAIZ / "en" / "index.html"
    destino.parent.mkdir(exist_ok=True)
    destino.write_text(en, encoding="utf-8")
    print("Escrito", destino.relative_to(RAIZ))

    sin_traducir = [t for t in textos(en) if t in set(textos(es)) and t not in IGUALES and not re.fullmatch(r"[\d\s·×.,:()-]+", t)]
    if faltan:
        print("\nTextos de la tabla que ya no están en index.html (revisar si cambiaron):")
        for a in faltan: print("  -", a[:110])
    if sin_traducir:
        print("\nTextos que quedaron en español en en/index.html:")
        for t in dict.fromkeys(sin_traducir): print("  -", t[:110])
    if faltan or sin_traducir:
        sys.exit(1)
    print("Todo traducido.")


if __name__ == "__main__":
    main()
