import os
import sys
from reportlab.lib.pagesizes import letter, A4
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
        self.drawString(40, 24, "MDF Juventudes • Aplicación de Moderación de Comisiones")
        self.drawRightString(555, 24, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()


def create_styles():
    styles = getSampleStyleSheet()

    # Título principal
    styles.add(ParagraphStyle(
        name='MDFTitle',
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=COLOR_PRIMARY,
        spaceAfter=4
    ))

    # Subtítulo institucional
    styles.add(ParagraphStyle(
        name='MDFSubtitle',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=COLOR_DARK,
        spaceAfter=12
    ))

    # Título de Sección H1
    styles.add(ParagraphStyle(
        name='MDFHeading1',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=COLOR_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    ))

    # Título de Sección H2
    styles.add(ParagraphStyle(
        name='MDFHeading2',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=COLOR_DARK,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    ))

    # Cuerpo de texto normal
    styles.add(ParagraphStyle(
        name='MDFBody',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=COLOR_TEXT,
        spaceAfter=6
    ))

    # Lista con viñetas
    styles.add(ParagraphStyle(
        name='MDFBullet',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=COLOR_TEXT,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    ))

    # Cuadro destacado / Callout
    styles.add(ParagraphStyle(
        name='MDFCallout',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=COLOR_DARK,
    ))

    # Paso numerado
    styles.add(ParagraphStyle(
        name='MDFStepNumber',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=COLOR_PRIMARY,
    ))

    return styles


def generate_moderator_manual(output_path):
    """Genera el Manual del Moderador / Administrador"""
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
    story.append(Paragraph("MDF JUVENTUDES • GUÍA OFICIAL", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_PRIMARY, spaceAfter=2)))
    story.append(Paragraph("Manual del Moderador de Comisión", styles['MDFTitle']))
    story.append(Paragraph("Instrucciones paso a paso para la gestión en vivo del debate, oradores y cronómetro", styles['MDFSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_PRIMARY, spaceBefore=2, spaceAfter=12))

    # 1. Introducción y Acceso
    story.append(Paragraph("1. Acceso a tu Comisión y Desbloqueo Admin", styles['MDFHeading1']))
    story.append(Paragraph(
        "La aplicación permite gestionar hasta 15 comisiones en paralelo de manera 100% independiente. "
        "Cada salón tiene su propia lista de oradores y su propio cronómetro sincronizado.",
        styles['MDFBody']
    ))

    access_steps = [
        [
            Paragraph("<b>Paso 1</b>", styles['MDFStepNumber']),
            Paragraph("Ingresa a la aplicación desde tu computadora o tablet: <b>https://moderacion-mdf.vercel.app</b>", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 2</b>", styles['MDFStepNumber']),
            Paragraph("En la pantalla inicial, <b>selecciona el número de tu comisión</b> (ej: <i>Comisión 1</i>, <i>Comisión 2</i>, etc.).", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 3</b>", styles['MDFStepNumber']),
            Paragraph("Haz clic en el enlace <b>'🔒 Acceso Moderador'</b> (en el pie de página o botón <i>Admin</i> en la barra superior).", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 4</b>", styles['MDFStepNumber']),
            Paragraph("Ingresa el <b>PIN de Moderación</b> por defecto: <font color='#0052FF'><b>1234</b></font> y presiona <i>Desbloquear Panel</i>.", styles['MDFBody'])
        ]
    ]
    t_access = Table(access_steps, colWidths=[55, 460])
    t_access.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_LIGHT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(t_access)
    story.append(Spacer(1, 10))

    # 2. Flujo de Trabajo en 4 Pasos
    story.append(Paragraph("2. Flujo de Trabajo Durante el Debate", styles['MDFHeading1']))

    steps_data = [
        [
            Paragraph("<b>Fase 1: Inscripción</b>", styles['MDFHeading2']),
            Paragraph(
                "• Haz clic en el botón <b>'QR Móvil'</b> o proyéctalo para que los participantes lo escaneen.<br/>"
                "• Presiona el botón verde <b>'Abrir Lista'</b> para habilitar las inscripciones desde los teléfonos.<br/>"
                "• Verás en vivo cómo los participantes se anotan con Nombre, Apellido y Organización.",
                styles['MDFBody']
            )
        ],
        [
            Paragraph("<b>Fase 2: Sorteo</b>", styles['MDFHeading2']),
            Paragraph(
                "• Una vez finalizado el tiempo de inscripción, presiona <b>'Cerrar Lista'</b>.<br/>"
                "• Haz clic en el botón <b>'🎲 Sortear Oradores'</b>. El algoritmo Fisher-Yates barajará aleatoriamente el orden de forma transparente, calculando automáticamente el tiempo exacto que le corresponde a cada orador según los minutos totales del bloque.",
                styles['MDFBody']
            )
        ],
        [
            Paragraph("<b>Fase 3: Debate en Vivo</b>", styles['MDFHeading2']),
            Paragraph(
                "• Llama al primer orador y presiona <b>'Iniciar'</b> en el cronómetro circular.<br/>"
                "• El cronómetro correrá sincronizado al milisegundo en la pantalla gigante y en los celulares de todos los asistentes.<br/>"
                "• A los <b>30 segundos restantes</b> la app emitirá un tono de aviso y cambiará a color ámbar.<br/>"
                "• Al cumplirse el tiempo (<b>00:00</b>), sonará la campana de cierre y pasará a color rojo.",
                styles['MDFBody']
            )
        ],
        [
            Paragraph("<b>Fase 4: Siguiente / Fin</b>", styles['MDFHeading2']),
            Paragraph(
                "• Al finalizar la exposición, presiona <b>'Siguiente ➔'</b> para convocar al próximo orador.<br/>"
                "• Si la asamblea concluye, el bloque queda cerrado y registrado.",
                styles['MDFBody']
            )
        ]
    ]
    t_steps = Table(steps_data, colWidths=[130, 385])
    t_steps.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_PRIMARY),
    ]))
    story.append(t_steps)
    story.append(Spacer(1, 10))

    # 3. Herramientas Especiales para el Moderador
    story.append(Paragraph("3. Herramientas de Control y Excepciones", styles['MDFHeading1']))
    story.append(Paragraph("• <b>Extensión de Tiempo (+30s / -30s):</b> Si la asamblea concede una prórroga al orador, presiona <b>+30s</b> para añadir tiempo en caliente.", styles['MDFBullet']))
    story.append(Paragraph("• <b>Inscribir por Excepción (+ Excepción):</b> Si una autoridad o invitado especial debe hablar con prioridad, usa el botón <i>+ Excepción</i> para insertarlo como <i>'Siguiente a hablar'</i> sin alterar el sorteo del resto.", styles['MDFBullet']))
    story.append(Paragraph("• <b>Reordenar / Eliminar:</b> Puedes subir o bajar manualmente a un orador con las flechas (▲/▼) o marcarlo como ausente si se retiró del salón.", styles['MDFBullet']))
    story.append(Paragraph("• <b>Configurar Parámetros (Tuerca ⚙️):</b> Puedes modificar el tiempo total del bloque (ej: 45 min, 60 min), los límites por orador (mín. 60s, máx. 300s) o cambiar el PIN de moderación.", styles['MDFBullet']))
    story.append(Spacer(1, 8))

    # Cuadro de Consejos Clave
    tip_content = [
        [
            Paragraph(
                "<b>💡 Consejos de Oro para una Moderación Exitosa:</b><br/>"
                "1. <b>Proyector:</b> Abre una pestaña con la <i>'Vista Proyector'</i> (presionando F11 para pantalla completa) para que todo el salón vea el orador actual, los próximos 3 en espera y el reloj gigante.<br/>"
                "2. <b>Conexión en Tiempo Real:</b> La app se sincroniza automáticamente por Firebase en la nube. Verifica que el ícono de Wi-Fi esté en verde en la barra superior.<br/>"
                "3. <b>Múltiples inscripciones:</b> Si un compañero no tiene celular, otro participante puede anotarlo desde su propio teléfono tocando <i>'+ Anotar a otro compañero'</i>.",
                styles['MDFCallout']
            )
        ]
    ]
    t_tip = Table(tip_content, colWidths=[515])
    t_tip.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_SECONDARY),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_tip)

    doc.build(story, canvasmaker=NumberedCanvas)


def generate_participant_manual(output_path):
    """Genera el Manual del Participante / Usuario"""
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
    story.append(Paragraph("MDF JUVENTUDES • GUÍA OFICIAL", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_PRIMARY, spaceAfter=2)))
    story.append(Paragraph("Manual del Participante", styles['MDFTitle']))
    story.append(Paragraph("Cómo ingresar a tu comisión, anotarte en la lista de oradores y seguir el debate en vivo desde tu celular", styles['MDFSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_PRIMARY, spaceBefore=2, spaceAfter=14))

    # 1. Cómo Ingresar
    story.append(Paragraph("1. Cómo Ingresar a tu Comisión", styles['MDFHeading1']))
    story.append(Paragraph(
        "No necesitas descargar ninguna aplicación ni crear contraseñas. Puedes acceder directamente desde el navegador de tu celular (Chrome, Safari, etc.).",
        styles['MDFBody']
    ))

    in_steps = [
        [
            Paragraph("<b>Opción A<br/>(Recomendada)</b>", styles['MDFStepNumber']),
            Paragraph(
                "<b>Escanea el Código QR</b> proyectado en la pantalla de tu salón.<br/>"
                "Tu teléfono se conectará automáticamente a tu comisión sin tener que configurar nada.",
                styles['MDFBody']
            )
        ],
        [
            Paragraph("<b>Opción B<br/>(Manual)</b>", styles['MDFStepNumber']),
            Paragraph(
                "Ingresa desde tu navegador a: <b>https://moderacion-mdf.vercel.app</b><br/>"
                "En la pantalla verás <i>'¿En qué comisión estás?'</i>. Toca el número de tu salón (ej: <b>[ 1 ]</b> a <b>[ 15 ]</b>) para ingresar.",
                styles['MDFBody']
            )
        ]
    ]
    t_in = Table(in_steps, colWidths=[90, 425])
    t_in.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_LIGHT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(t_in)
    story.append(Spacer(1, 12))

    # 2. Cómo Anotarte para Hablar
    story.append(Paragraph("2. Cómo Anotarte en la Lista de Oradores", styles['MDFHeading1']))
    
    reg_steps = [
        [
            Paragraph("<b>Paso 1</b>", styles['MDFStepNumber']),
            Paragraph("Verifica en tu pantalla que el estado indique <font color='#10B981'><b>● Inscripción Abierta</b></font>.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 2</b>", styles['MDFStepNumber']),
            Paragraph("Completa tus datos en el formulario:<br/>"
                      "• <b>Nombre</b> (obligatorio)<br/>"
                      "• <b>Apellido</b> (obligatorio)<br/>"
                      "• <b>Organización / Agrupación</b> (opcional, ej: <i>Juventudes Centro</i>, <i>Bloque Universitario</i>)", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 3</b>", styles['MDFStepNumber']),
            Paragraph("Presiona el botón azul: <b>'¡Anotarme en la Lista!'</b>.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>Paso 4</b>", styles['MDFStepNumber']),
            Paragraph("Aparecerá tu tarjeta de <font color='#0052FF'><b>Inscripción Confirmada</b></font> con tu número de orden en espera.", styles['MDFBody'])
        ]
    ]
    t_reg = Table(reg_steps, colWidths=[55, 460])
    t_reg.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(t_reg)
    story.append(Spacer(1, 12))

    # 3. ¿Qué pasa durante el debate?
    story.append(Paragraph("3. Durante el Debate: Sigue tu Turno en Vivo", styles['MDFHeading1']))
    story.append(Paragraph("• <b>Sorteo de Orden:</b> Cuando el moderador cierra la lista y realiza el sorteo, tu celular se actualizará automáticamente mostrando tu posición definitiva.", styles['MDFBullet']))
    story.append(Paragraph("• <b>Contador de Espera:</b> Verás en tiempo real cuántos oradores faltan antes de tu turno (ej: <i>'Faltan 3 oradores'</i> o <i>'Próximo a hablar'</i>).", styles['MDFBullet']))
    story.append(Paragraph("• <b>Alerta '¡Es tu Turno de Hablar!':</b> Cuando el moderador inicie tu turno, tu celular vibrará y mostrará una alerta en pantalla para que te acerques al micrófono.", styles['MDFBullet']))
    story.append(Paragraph("• <b>Cronómetro Sincronizado:</b> Podrás ver los minutos y segundos exactos que te quedan para redondear tu idea.", styles['MDFBullet']))
    story.append(Spacer(1, 10))

    # 4. Preguntas Frecuentes
    story.append(Paragraph("4. Preguntas Frecuentes", styles['MDFHeading1']))
    
    faq_data = [
        [
            Paragraph("<b>¿Puedo anotar a un compañero desde mi celular?</b>", styles['MDFHeading2']),
            Paragraph("<b>Sí.</b> Si un compañero no tiene celular o se quedó sin batería, después de anotarte verás el botón <b>'+ Anotar a otro compañero desde este móvil'</b>. Podrás inscribir a todos los que necesites y alternar entre sus turnos en las pestañas superiores.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>¿Qué hago si me equivoqué de salón?</b>", styles['MDFHeading2']),
            Paragraph("Toca el botón <b>'📍 Cambiar Comisión'</b> en la parte superior y selecciona el número de salón correcto.", styles['MDFBody'])
        ],
        [
            Paragraph("<b>¿Se pierden mis datos si se apaga la pantalla?</b>", styles['MDFHeading2']),
            Paragraph("<b>No.</b> Tu lugar en la lista y tus datos quedan guardados en la memoria de tu teléfono y en la base de datos de la comisión. Al volver a abrir la página continuarás en tu turno.", styles['MDFBody'])
        ]
    ]
    t_faq = Table(faq_data, colWidths=[180, 335])
    t_faq.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
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

    # También guardamos copias directas en la raíz del proyecto para fácil acceso
    root_mod_pdf = os.path.join(base_dir, 'MANUAL_MODERADOR_MDF_JUVENTUDES.pdf')
    root_part_pdf = os.path.join(base_dir, 'MANUAL_PARTICIPANTE_MDF_JUVENTUDES.pdf')

    print("Generando Manual del Moderador...")
    generate_moderator_manual(mod_pdf)
    generate_moderator_manual(root_mod_pdf)
    print(f"[OK] Generado: {mod_pdf}")

    print("Generando Manual del Participante...")
    generate_participant_manual(part_pdf)
    generate_participant_manual(root_part_pdf)
    print(f"[OK] Generado: {part_pdf}")

    print("Manuales PDF generados con exito.")
