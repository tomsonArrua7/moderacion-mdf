import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Colores MDF Juventudes
COLOR_PRIMARY = colors.HexColor('#0052FF')     # Azul Eléctrico
COLOR_SECONDARY = colors.HexColor('#00D2FF')   # Cyan
COLOR_DARK = colors.HexColor('#080E21')        # Dark Surface
COLOR_LIGHT = colors.HexColor('#F4F7FC')       # Light background
COLOR_TEXT = colors.HexColor('#1E293B')        # Dark slate
COLOR_MUTED = colors.HexColor('#64748B')       # Muted gray
COLOR_EMERALD = colors.HexColor('#10B981')     # Success green
COLOR_AMBER = colors.HexColor('#F59E0B')       # Amber alert

class NumberedCanvas(canvas.Canvas):
    """Canvas para numeración de páginas y pie institucional"""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_MUTED)
        # Línea superior de pie
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.5)
        self.line(40, 35, 555, 35)
        # Textos de pie
        self.drawString(40, 24, "MDF Juventudes • Orientaciones para el Trabajo en Comisiones (20 Salas)")
        self.drawRightString(555, 24, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()


def create_styles():
    styles = getSampleStyleSheet()

    # Título principal
    styles.add(ParagraphStyle(
        name='MDFTitle',
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=COLOR_PRIMARY,
        spaceAfter=3
    ))

    # Subtítulo institucional
    styles.add(ParagraphStyle(
        name='MDFSubtitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=COLOR_DARK,
        spaceAfter=10
    ))

    # Título de Sección H1
    styles.add(ParagraphStyle(
        name='MDFHeading1',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=COLOR_PRIMARY,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    ))

    # Título de Sección H2
    styles.add(ParagraphStyle(
        name='MDFHeading2',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=COLOR_DARK,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    ))

    # Cuerpo de texto normal
    styles.add(ParagraphStyle(
        name='MDFBody',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=COLOR_TEXT,
        spaceAfter=5
    ))

    # Lista con viñetas
    styles.add(ParagraphStyle(
        name='MDFBullet',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=COLOR_TEXT,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    ))

    # Cuadro destacado / Callout
    styles.add(ParagraphStyle(
        name='MDFCallout',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=COLOR_DARK,
    ))

    # Paso numerado
    styles.add(ParagraphStyle(
        name='MDFStepNumber',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=COLOR_PRIMARY,
    ))

    return styles


def generate_moderator_manual(output_path):
    """Genera el Manual Oficial del Moderador y Relator (Adaptado a las Orientaciones MDF)"""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=45
    )
    styles = create_styles()
    story = []

    # Encabezado con Badge
    story.append(Paragraph("MDF JUVENTUDES • DOCUMENTO OFICIAL DE TRABAJO", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_PRIMARY, spaceAfter=2)))
    story.append(Paragraph("Manual del Moderador y Relator de Comisión", styles['MDFTitle']))
    story.append(Paragraph("Estructura de trabajo, preguntas disparadoras y uso de la app para las 20 comisiones", styles['MDFSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_PRIMARY, spaceBefore=2, spaceAfter=10))

    # 1. Conformación del Equipo y Dinámica de Salón
    story.append(Paragraph("1. Conformación del Equipo en cada Comisión", styles['MDFHeading1']))
    story.append(Paragraph(
        "Cada una de las <b>20 comisiones</b> funciona con equipos conformados por:<br/>"
        "• <b>2 Moderadores:</b> encargados de llevar el debate, otorgar la palabra, controlar los tiempos y garantizar el intercambio propositivo.<br/>"
        "• <b>1 Relator:</b> encargado de tomar apuntes escritos de los aportes para redactar la síntesis de la comisión que se leerá al final.",
        styles['MDFBody']
    ))

    # Cuadro de Estructura de Trabajo
    team_data = [
        [
            Paragraph("<b>Paso 1: Presentación</b>", styles['MDFHeading2']),
            Paragraph("Los moderadores explican que las 20 comisiones leemos el mismo documento ('Juventudes MDF'), debatimos y sintetizamos. Al terminar, vamos todos juntos al Domo al acto central.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 2: Lectura & Preguntas</b>", styles['MDFHeading2']),
            Paragraph("Se lee el documento y se abren las preguntas para la <b>Discusión General</b> y los <b>5 Ejes Temáticos</b> (disponibles en la app tocando <i>'📖 Preguntas Debate'</i>).", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 3: Regla de los 2 Minutos</b>", styles['MDFHeading2']),
            Paragraph("Los moderadores abren la ronda de intercambio. Para que la mayoría pueda hablar y no sea una sucesión de discursos sueltos, <b>todas las intervenciones se limitan a no más de 2 minutos (120 seg)</b>.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 4: Enfoque Propositivo</b>", styles['MDFHeading2']),
            Paragraph("Los moderadores deben controlar el tiempo de cada eje para llegar a las preguntas de carácter propositivo (ideas e iniciativas concretas a trabajar).", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 5: Síntesis (15 min finales)</b>", styles['MDFHeading2']),
            Paragraph("Cuando falten aprox. 15 minutos para terminar, el relator lee en voz alta la síntesis escrita para verificar con la comisión que no haya quedado nada sin apuntar.", styles['MDFBody'])
        ]
    ]
    t_team = Table(team_data, colWidths=[140, 375])
    t_team.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_PRIMARY),
    ]))
    story.append(t_team)
    story.append(Spacer(1, 8))

    # 2. Uso de la Aplicación en Vivo
    story.append(Paragraph("2. Uso de la Aplicación de Moderación (Paso a Paso)", styles['MDFHeading1']))
    
    app_steps = [
        [
            Paragraph("<b>1. Acceso:</b>", styles['MDFStepNumber']),
            Paragraph("Ingresa a <b>https://moderacion-mdf.vercel.app</b> ➔ Selecciona tu salón (ej: <b>Comisión 1 a 20</b>) ➔ Toca <i>'🔒 Acceso Moderador'</i> ➔ Ingresa el PIN: <b>1234</b>.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>2. Inscripción:</b>", styles['MDFStepNumber']),
            Paragraph("Abre el <b>'QR Móvil'</b> o proyéctalo en pantalla ➔ Presiona el botón verde <b>'Abrir Lista'</b> para que los asistentes se anoten desde su celular.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>3. Sorteo:</b>", styles['MDFStepNumber']),
            Paragraph("Presiona <b>'Cerrar Lista'</b> ➔ Toca <b>'🎲 Sortear Oradores'</b>. La app ordenará transparentemente la lista y fijará el reloj en 2 minutos (120s) por orador.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>4. Debate:</b>", styles['MDFStepNumber']),
            Paragraph("Presiona <b>'Iniciar'</b> al convocar al primer orador. A los 30s sonará el tono de advertencia y a los 00:00 la campana de cierre. Al terminar, presiona <b>'Siguiente ➔'</b>.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>5. Excepciones:</b>", styles['MDFStepNumber']),
            Paragraph("Si un invitado especial debe intervenir, usa el botón <b>'+ Excepción'</b> para insertarlo como siguiente orador sin desordenar el resto.", styles['MDFBody'])
        ]
    ]
    t_app = Table(app_steps, colWidths=[80, 435])
    t_app.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(t_app)
    story.append(Spacer(1, 8))

    # 3. Resumen de los 5 Ejes Temáticos del Debate
    story.append(Paragraph("3. Ejes Temáticos Oficiales para Guiar la Discusión", styles['MDFHeading1']))
    story.append(Paragraph("Los moderadores pueden consultar las preguntas completas en la app tocando el botón <b>'📖 Preguntas Debate'</b>:", styles['MDFBody']))
    story.append(Paragraph("• <b>Eje 1 - Salud Mental:</b> Consumo problemático, ansiedad, depresión, prevención del suicidio y redes de cuidado mutuo en universidades y barrios.", styles['MDFBullet']))
    story.append(Paragraph("• <b>Eje 2 - Trabajo y Precarización:</b> Primer empleo, aplicaciones/plataformas, debate sobre el discurso 'soy mi propio jefe' y modelo productivo con derechos.", styles['MDFBullet']))
    story.append(Paragraph("• <b>Eje 3 - Vivienda y Hábitat:</b> Obstáculos para independizarse, impacto de alquileres, acceso a terrenos y rol del Estado.", styles['MDFBullet']))
    story.append(Paragraph("• <b>Eje 4 - Educación:</b> Causas de deserción y ausentismo escolar, barreras para la universidad y propuestas para la permanencia estudiantil.", styles['MDFBullet']))
    story.append(Paragraph("• <b>Eje 5 - Redes Sociales, IA y Tecnología:</b> Desinformación, oportunidades y riesgos de la IA y estrategias para el espacio político.", styles['MDFBullet']))
    story.append(Spacer(1, 6))

    # Tip para pantalla de proyector
    t_proj = Table([[
        Paragraph("<b>📺 Consejo Proyector:</b> Conecta la computadora al proyector del salón y abre la <i>'Vista Proyector'</i> (F11 en pantalla completa). Mostrará el reloj gigante, el orador al habla y el QR permanente para que nadie se pierda.", styles['MDFCallout'])
    ]], colWidths=[515])
    t_proj.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_SECONDARY),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_proj)

    doc.build(story, canvasmaker=NumberedCanvas)


def generate_participant_manual(output_path):
    """Genera el Manual del Participante (Adaptado a las Orientaciones MDF)"""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=45
    )
    styles = create_styles()
    story = []

    # Encabezado con Badge
    story.append(Paragraph("MDF JUVENTUDES • DOCUMENTO DE TRABAJO", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_PRIMARY, spaceAfter=2)))
    story.append(Paragraph("Manual del Participante de Comisión", styles['MDFTitle']))
    story.append(Paragraph("Cómo participar, anotarte para hablar y seguir el debate en vivo desde tu celular", styles['MDFSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_PRIMARY, spaceBefore=2, spaceAfter=10))

    # 1. Cómo Ingresar a tu Comisión
    story.append(Paragraph("1. Cómo Ingresar a tu Salón (20 Comisiones)", styles['MDFHeading1']))
    story.append(Paragraph(
        "No necesitas descargar nada ni crear usuarios. Puedes ingresar desde cualquier celular conectado a internet (Chrome, Safari, etc.):",
        styles['MDFBody']
    ))

    in_steps = [
        [
            Paragraph("<b>Opción A<br/>(Por QR)</b>", styles['MDFStepNumber']),
            Paragraph("<b>Escanea el Código QR</b> proyectado en la pantalla de tu comisión. Entrarás directamente a tu salón sin tener que elegir nada.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Opción B<br/>(Por Link)</b>", styles['MDFStepNumber']),
            Paragraph("Ingresa en: <b>https://moderacion-mdf.vercel.app</b> ➔ Toca el botón con el número de tu comisión (<b>[ 1 ]</b> a <b>[ 20 ]</b>).", styles['MDFBody'])
        ]
    ]
    t_in = Table(in_steps, colWidths=[80, 435])
    t_in.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_LIGHT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(t_in)
    story.append(Spacer(1, 8))

    # 2. Cómo Anotarte y Reglas de Participación
    story.append(Paragraph("2. Inscripción en la Lista de Oradores & Regla de los 2 Minutos", styles['MDFHeading1']))
    
    part_steps = [
        [
            Paragraph("<b>Paso 1: Inscripción</b>", styles['MDFHeading2']),
            Paragraph("Cuando los moderadores abran la lista, completa tu <b>Nombre</b>, <b>Apellido</b> y tu <b>Organización</b> (opcional) ➔ Presiona <b>'¡Anotarme en la Lista!'</b>.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 2: Sorteo de Orden</b>", styles['MDFHeading2']),
            Paragraph("Al cerrar las inscripciones, la app sortea aleatoriamente el orden para que sea transparente y equitativo. Verás tu puesto definitivo en pantalla.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 3: Tiempo Máximo (2 min)</b>", styles['MDFHeading2']),
            Paragraph("La regla oficial de MDF Juventudes establece <b>intervenciones de hasta 2 minutos</b> para que todos los compañeros puedan expresarse y aportar propuestas concretas.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 4: ¡Tu Turno de Hablar!</b>", styles['MDFHeading2']),
            Paragraph("Tu celular te indicará en vivo cuántos oradores faltan antes de tu turno y vibrará con una alerta en pantalla cuando te toque hablar en el micrófono.", styles['MDFBody'])
        ]
    ]
    t_part = Table(part_steps, colWidths=[130, 385])
    t_part.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(t_part)
    story.append(Spacer(1, 8))

    # 3. Preguntas de Debate en el Celular
    story.append(Paragraph("3. Consulta las Preguntas de Debate desde tu Celular", styles['MDFHeading1']))
    story.append(Paragraph(
        "En la parte superior de tu pantalla verás el botón <b>'📖 Ver Preguntas y Ejes de Debate'</b>. "
        "Al tocarlo, podrás leer en cualquier momento el documento completo, las preguntas disparadoras sobre el MDF Juventudes y los 5 ejes temáticos (Salud Mental, Trabajo, Vivienda, Educación y Tecnología/IA).",
        styles['MDFBody']
    ))
    story.append(Spacer(1, 6))

    # 4. Ayuda y Casos Especiales
    story.append(Paragraph("4. Preguntas Frecuentes", styles['MDFHeading1']))
    faq_data = [
        [
            Paragraph("<b>¿Puedo anotar a un compañero sin celular?</b>", styles['MDFHeading2']),
            Paragraph("<b>Sí.</b> Toca <b>'+ Anotar a otro compañero desde este móvil'</b>. Podrás inscribir a varios compañeros y seguir sus turnos desde la misma pantalla.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>¿Qué pasa al finalizar la comisión?</b>", styles['MDFHeading2']),
            Paragraph("El relator leerá la síntesis de los acuerdos y propuestas de la comisión. Luego, <b>nos dirigimos todos juntos al Domo para el acto central</b>.", styles['MDFBody'])
        ]
    ]
    t_faq = Table(faq_data, colWidths=[180, 335])
    t_faq.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    story.append(t_faq)

    doc.build(story, canvasmaker=NumberedCanvas)


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)

    mod_pdf = os.path.join(public_dir, 'MANUAL_MODERADOR_MDF_JUVENTUDES.pdf')
    part_pdf = os.path.join(public_dir, 'MANUAL_PARTICIPANTE_MDF_JUVENTUDES.pdf')

    root_mod_pdf = os.path.join(base_dir, 'MANUAL_MODERADOR_MDF_JUVENTUDES.pdf')
    root_part_pdf = os.path.join(base_dir, 'MANUAL_PARTICIPANTE_MDF_JUVENTUDES.pdf')

    print("Generando Manual Oficial del Moderador y Relator (20 Comisiones)...")
    generate_moderator_manual(mod_pdf)
    generate_moderator_manual(root_mod_pdf)
    print(f"[OK] Generado: {mod_pdf}")

    print("Generando Manual Oficial del Participante (20 Comisiones)...")
    generate_participant_manual(part_pdf)
    generate_participant_manual(root_part_pdf)
    print(f"[OK] Generado: {part_pdf}")

    print("Manuales PDF 100% actualizados con las Orientaciones Oficiales MDF.")
