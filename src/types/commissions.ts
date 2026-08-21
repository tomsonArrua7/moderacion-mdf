export interface CommissionInfo {
  id: string;
  name: string;
  description?: string;
}

export const DEFAULT_COMMISSIONS: CommissionInfo[] = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  return {
    id: `COMISION-${num}`,
    name: `Comisión ${num}`,
    description: 'Lanzamiento MDF Juventudes • Documento de Trabajo'
  };
});

export interface DebateSection {
  title: string;
  subtitle?: string;
  context?: string;
  questions: string[];
}

export const OFFICIAL_DEBATE_GUIDE: {
  generalSections: DebateSection[];
  thematicSections: DebateSection[];
} = {
  generalSections: [
    {
      title: 'Sobre el MDF Juventudes',
      questions: [
        '¿Cómo llega el MDF Juventudes a quien hoy desconfía de toda la política? ¿Qué tiene que cambiar en nuestra forma de organizarnos?',
        '¿Qué tiene que hacer el MDF Juventudes diferente a todo lo que ya existe?',
        'Axel dice que estamos en un año de construcción política: ¿qué significa eso para las juventudes? ¿Cómo construimos poder político real desde los territorios, las escuelas, los sindicatos y las organizaciones?'
      ]
    },
    {
      title: 'Sobre el proyecto de país',
      questions: [
        '¿Qué Argentina queremos construir y cuál es el rol concreto de las juventudes en ese proceso?',
        '¿Cómo enfrentamos la precarización laboral, la crisis habitacional y el deterioro de la salud mental desde una agenda colectiva? ¿Cuál es la mejor estrategia para construir esa agenda?',
        '¿Qué le pedimos al Estado y qué nos comprometemos a construir nosotros desde la organización?'
      ]
    }
  ],
  thematicSections: [
    {
      title: '1. Salud mental: consumo problemático y suicidio',
      context: 'La salud mental es una de las principales preocupaciones de las juventudes. El aumento de los consumos problemáticos, la ansiedad, la depresión y las situaciones vinculadas al suicidio plantean la necesidad de generar espacios de escucha, acompañamiento y prevención.',
      questions: [
        '¿Cuáles son las principales problemáticas de salud mental que atraviesan hoy las juventudes?',
        '¿Qué consumos consideran problemáticos? ¿Cuándo y por qué consideran que se vuelven de tal forma?',
        '¿Cómo podemos contribuir a la prevención del suicidio desde nuestras comunidades?',
        'Cuando tienen una problemática de salud mental, ¿a quién recurren? ¿qué lugares conocen de abordaje de salud mental?',
        '¿Cómo plantean este tema en sus comunidades, escuelas, barrios? ¿Buscan referentes adultos?',
        '¿Qué dispositivos comunitarios y redes de cuidado mutuo podemos activar desde la militancia del MDF en las universidades, las unidades básicas y los barrios para acompañar a quien la está pasando mal?'
      ]
    },
    {
      title: '2. Trabajo y precarización laboral',
      subtitle: 'Trabajo adolescente e individualización disfrazada de "soy mi propio jefe"',
      context: 'Las juventudes enfrentan crecientes dificultades para acceder a empleos estables y con derechos. Al mismo tiempo, se expanden formas de trabajo precario asociadas a aplicaciones, plataformas digitales y discursos que promueven el éxito individual por sobre las soluciones colectivas.',
      questions: [
        '¿Qué dificultades encuentran los jóvenes para acceder a su primer empleo?',
        '¿Qué otras formas de trabajo conocen en sus barrios como alternativas dentro del mercado laboral?',
        '¿De qué queremos trabajar los jóvenes en la Argentina que se viene?',
        '¿Qué modelo productivo necesita la Argentina para generar trabajo digno y oportunidades reales para las juventudes?'
      ]
    },
    {
      title: '3. Vivienda y acceso al hábitat',
      context: 'El acceso a una vivienda digna se ha vuelto cada vez más complejo para las juventudes debido al aumento de los alquileres, la dificultad para acceder a terrenos y las desigualdades territoriales.',
      questions: [
        '¿Qué obstáculos encuentran los jóvenes para independizarse?',
        '¿Cómo impacta la situación habitacional en los proyectos de vida?',
        '¿Qué problemas vinculados al hábitat observan en sus comunidades?',
        '¿Qué lugar debe asumir el Estado frente a la crisis habitacional que atraviesa nuestra generación? ¿Qué herramientas puede construir para facilitar el acceso a la vivienda?'
      ]
    },
    {
      title: '4. Educación, ausentismo escolar y universidad',
      context: 'La educación continúa siendo una herramienta central para la inclusión social. Sin embargo, el ausentismo, la deserción escolar y las dificultades para acceder o sostener estudios superiores representan desafíos importantes para muchas juventudes.',
      questions: [
        '¿Cuáles consideran que son las principales causas del ausentismo escolar?',
        '¿Qué dificultades enfrentan los jóvenes para terminar la secundaria?',
        '¿Qué barreras existen para acceder o permanecer en la universidad?',
        '¿Cómo impactan las desigualdades económicas en las trayectorias educativas?',
        '¿Qué propuestas podrían fortalecer el vínculo entre juventudes y educación?',
        '¿Qué modificaciones tenemos que proponer tanto en el nivel secundario como en el superior para fortalecer la permanencia estudiantil?'
      ]
    },
    {
      title: '5. Redes sociales, inteligencia artificial y tecnologías',
      context: 'Las redes sociales y las nuevas tecnologías transforman la forma en que las juventudes se informan, estudian, trabajan y se relacionan. La inteligencia artificial abre nuevas oportunidades, pero también plantea desafíos vinculados a la desinformación, la privacidad y el uso responsable de estas herramientas.',
      questions: [
        '¿Cómo influyen las redes sociales en la construcción de identidades y vínculos?',
        '¿Qué oportunidades y riesgos presenta la inteligencia artificial?',
        '¿Cómo identificar información falsa o engañosa en internet?',
        '¿Las tecnologías reducen o amplían las desigualdades existentes?',
        '¿Qué estrategias podemos darnos como espacio político para aprovechar la inteligencia artificial y las nuevas tecnologías?'
      ]
    }
  ]
};
