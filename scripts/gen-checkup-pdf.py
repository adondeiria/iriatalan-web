# Genera el PDF (lectura/impresión) del Check-up de Beneficiarios, marca Iria Talan.
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
    Spacer, Table, TableStyle, KeepTogether)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

RED = HexColor("#9E1B1E"); REDHEAD = HexColor("#B5292C"); GOLD = HexColor("#C4A06B")
INK = HexColor("#2B2B2B"); GREY = HexColor("#7A6A55"); ZEBRA = HexColor("#F4F4F4")
WHITE = HexColor("#FFFFFF")

styN = ParagraphStyle("n", fontName="Helvetica", fontSize=9.5, textColor=INK, leading=13)
styItem = ParagraphStyle("i", fontName="Helvetica", fontSize=9.5, textColor=INK, leading=12)
styTitle = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=20, textColor=WHITE, alignment=TA_CENTER, leading=24)
stySub = ParagraphStyle("s", fontName="Helvetica-Oblique", fontSize=10, textColor=INK, alignment=TA_CENTER, leading=13)
styCred = ParagraphStyle("c", fontName="Helvetica", fontSize=8.5, textColor=GREY, alignment=TA_CENTER)
stySec = ParagraphStyle("sec", fontName="Helvetica-Bold", fontSize=12, textColor=WHITE, leading=15)
stySubh = ParagraphStyle("sh", fontName="Helvetica-Bold", fontSize=9.5, textColor=RED, leading=12)
styDocs = ParagraphStyle("d", fontName="Helvetica-Oblique", fontSize=8, textColor=GREY, leading=10)
styCTA = ParagraphStyle("cta", fontName="Helvetica-Bold", fontSize=10, textColor=INK, alignment=TA_CENTER, leading=13)

def band(text, style, bg, pad=6):
    t = Table([[Paragraph(text, style)]], colWidths=[170*mm])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),bg),("LEFTPADDING",(0,0),(-1,-1),8),
        ("RIGHTPADDING",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),pad),("BOTTOMPADDING",(0,0),(-1,-1),pad)]))
    return t

def checklist(items):
    rows = [[Paragraph("☐", styItem), Paragraph(it, styItem)] for it in items]
    t = Table(rows, colWidths=[8*mm, 162*mm])
    sty = [("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),
           ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4)]
    for i in range(len(rows)):
        if i % 2 == 0: sty.append(("BACKGROUND",(0,i),(-1,i),ZEBRA))
    t.setStyle(TableStyle(sty))
    return t

SECS = [
 ("1. Seguros de vida y accidentes", ["Tengo localizadas todas mis pólizas vigentes.","Sé quién aparece hoy como beneficiario principal en cada póliza.","Sé quién aparece como beneficiario sustituto o contingente, si aplica.","Los nombres están completos y correctamente escritos.","Los porcentajes de distribución suman 100%.","No dejé expresiones genéricas como “mis hijos” o “mi familia” si la póliza requiere identificación precisa.","Mis beneficiarios siguen siendo las personas que hoy quiero proteger.","No tengo registrada a una expareja o a una persona fallecida.","Si hay menores de edad, ya revisé cómo debe administrarse el recurso y con qué figura legal."], "Carátula de la póliza · Designación de beneficiarios · Identificaciones · CURP y actas de parentesco"),
 ("2. Planes Personales de Retiro (PPR) y seguros de ahorro", ["Sé si tengo un PPR o seguro de ahorro/retiro con una aseguradora (distinto del AFORE).","Sé quién aparece como beneficiario de cada plan.","Los beneficiarios del plan están actualizados.","Conozco las condiciones de disposición y qué pasa con el plan al fallecer."], "Carátula o contrato del PPR · Designación de beneficiarios"),
 ("3. Cuentas bancarias, inversiones y plataformas digitales", ["Sé en qué bancos tengo cuentas, pagarés o inversiones.","Verifiqué si cada cuenta tiene beneficiarios registrados.","Revisé que los porcentajes estén claros.","Mis beneficiarios conocen la existencia de estas cuentas.","Mis estados de cuenta y contratos están ordenados y localizables.","Ya actualicé beneficiarios después de cambios importantes de vida.","Tengo identificadas mis plataformas digitales / wallets de fondos de inversión (apps, casas de bolsa: GBM, Fintual, brokers).","Sé si cada plataforma permite designar beneficiarios y, si lo permite, ya lo hice.","Una persona de confianza sabe que estas inversiones digitales existen y cómo se accede a ellas.","Sé qué pasa con el saldo de cada wallet o plataforma al fallecer."], "Contratos de cuenta o inversión · Estados de cuenta · Accesos de plataformas digitales"),
 ("4. AFORE, IMSS e ISSSTE", ["Sé en qué AFORE estoy registrado(a).","Ya confirmé quién aparece como beneficiario en mi cuenta individual.","Mi pareja, hijos u otros dependientes están correctamente registrados donde corresponde.","Mi estado civil está actualizado en mis expedientes institucionales.","Ya registré a mis beneficiarios en IMSS / ISSSTE.","Mis beneficiarios sabrían a qué institución acudir en caso de fallecimiento.","Tengo localizada mi CURP, NSS y documentos básicos del expediente."], "Estado de cuenta AFORE · CURP · NSS · Identificación · Actas"),
 ("5. Créditos y seguros de saldo deudor", ["Sé qué créditos tengo vigentes (hipotecario, automotriz, personal, tarjetas).","Sé si cada crédito incluye un seguro de vida o de saldo deudor que liquida la deuda al fallecer.","Mi familia sabe que esos seguros existen para no pagar la deuda de su bolsillo.","Revisé que el seguro cubra el saldo total y siga vigente.","Tengo localizadas las carátulas de esos seguros y sé a quién avisar."], "Contratos de crédito · Carátulas del seguro de saldo deudor · Estados de cuenta"),
 ("6. Fideicomisos", ["Sé si tengo algún fideicomiso constituido (patrimonial, testamentario o de seguro).","Sé quién es el fideicomitente, la fiduciaria y el/los fideicomisario(s) de cada uno.","Los fideicomisarios (beneficiarios) están actualizados.","Las instrucciones del fideicomiso reflejan mi voluntad actual.","El fideicomiso está coordinado con mi testamento y mis pólizas.","Mi familia sabe que existe y a quién acudir."], "Contrato de fideicomiso · Datos de la fiduciaria · Identificación de fideicomisarios"),
 ("7. Empresas y sucesión societaria", ["Sé qué pasa con mi participación (acciones o partes sociales) si fallezco.","Los estatutos o un convenio entre socios prevén la sucesión de mi participación.","Existe un seguro de persona clave o de compra-venta entre socios, si aplica.","Mi familia sabe cómo se valuaría y cobraría mi parte del negocio.","La sucesión de la empresa está coordinada con mi testamento."], "Acta constitutiva y estatutos · Convenio entre socios · Pólizas de persona clave"),
 ("8. Activos y cuentas en el extranjero", ["Tengo identificadas mis cuentas, inversiones o propiedades fuera de México.","Sé si esas cuentas tienen beneficiario designado (figuras como “payable/transfer on death”).","Sé si necesito un testamento en el país donde están esos activos.","Mis beneficiarios sabrían cómo y dónde reclamar los activos en el extranjero.","Consideré el efecto fiscal y cambiario de heredar activos en otra moneda o país.","Mis documentos del extranjero están traducidos / apostillados si se requiere."], "Estados de cuenta del extranjero · Escrituras · Testamento internacional"),
 ("9. Activos digitales y criptomonedas", ["Tengo un registro de mis cuentas y activos digitales (correo, redes, criptomonedas, billeteras).","Una persona de confianza sabría cómo acceder a ellos si yo falto (sin exponer mis contraseñas hoy).","Sé si mis criptoactivos tienen forma de heredarse (llaves, custodios o beneficiarios).","Mis suscripciones y pagos automáticos están documentados."], "Inventario de cuentas digitales · Ubicación segura de accesos y llaves"),
 ("10. Testamento y coordinación patrimonial", ["Tengo testamento vigente.","Mi testamento refleja mi situación familiar actual.","Los nombres y relaciones familiares coinciden con los de otros documentos.","Mi testamento está alineado con mis pólizas, cuentas, fideicomisos y empresa.","Mi familia sabe con qué notaría o abogado revisar este tema."], "Testamento más reciente · Datos de la notaría · Inventario de bienes"),
 ("11. Tutela de hijos menores", ["Si tengo hijos menores, ya pensé quién sería su tutor o guardián si yo falto.","Esa designación está reflejada por escrito donde corresponde (p. ej. testamento).","La persona elegida sabe y aceptó esa responsabilidad.","Separé claramente quién cuidaría al menor de quién administraría su dinero."], "Testamento con designación de tutor · Acuerdos familiares por escrito"),
 ("12. Voluntad anticipada y decisiones en caso de incapacidad", ["Sé qué es una voluntad anticipada (decisiones médicas si no puedo expresarme).","Tengo, o consideré, un documento de voluntad anticipada conforme a mi entidad.","Designé a alguien que pueda tomar decisiones médicas o financieras si quedo incapacitado.","Mi familia sabe dónde está ese documento y a quién corresponde actuar."], "Documento de voluntad anticipada · Poder notarial / mandato"),
 ("13. Señales de alerta (focos rojos)", ["Tengo beneficiarios que ya fallecieron o que ya no forman parte de mi círculo cercano.","No sé quién aparece como beneficiario en una o más pólizas o cuentas.","No sé si mis créditos tienen un seguro que pague la deuda al fallecer.","Tengo activos en el extranjero sin un plan de sucesión claro.","Tengo hijos menores y no he definido quién sería su tutor.","Mi testamento dice una cosa, pero mis contratos o fideicomisos podrían decir otra.","Mi familia no sabría dónde encontrar mis documentos ni a quién llamar."], None),
 ("14. Expediente básico para la familia", ["Lista de seguros vigentes (vida, GMM, saldo deudor).","Lista de bancos, cuentas, inversiones y plataformas digitales.","Estado de cuenta de AFORE y de PPR.","Relación de créditos vigentes y sus seguros.","Contratos de fideicomiso, empresa y datos del extranjero, si aplica.","CURP, NSS, RFC e identificación.","Contacto del asesor, banco, notario o abogado.","Carpeta (física o digital) con ubicación conocida por alguien de confianza."], None),
]

def build(path):
    doc = BaseDocTemplate(path, pagesize=letter, leftMargin=20*mm, rightMargin=20*mm, topMargin=16*mm, bottomMargin=16*mm)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="n")
    def footer(canvas, d):
        canvas.saveState(); canvas.setFont("Helvetica", 7.5); canvas.setFillColor(GREY)
        canvas.drawCentredString(letter[0]/2, 10*mm, "Check-up Patrimonial de Beneficiarios · Iria Talan · iriatalan.com.mx")
        canvas.restoreState()
    doc.addPageTemplates([PageTemplate(id="n", frames=[frame], onPage=footer)])
    E = []
    E.append(band("Check-up Patrimonial de Beneficiarios", styTitle, RED, pad=10))
    E.append(Spacer(1, 2*mm))
    E.append(band("Revisa si los beneficiarios en tus seguros, cuentas, retiro, créditos y registros están actualizados y alineados con tu testamento.", stySub, GOLD, pad=6))
    E.append(Spacer(1, 2*mm))
    E.append(Paragraph("Por Iria Talan · Asesora Patrimonial y de Seguros · Cédula CNSF V388618", styCred))
    E.append(Spacer(1, 5*mm))
    E.append(Paragraph("Cómo usar este documento", stySubh))
    for t in ["Reúne tus pólizas, contratos, estados de cuenta y documentos de identificación.","Marca con ☐ cada rubro y anota al margen: Correcto, Desactualizado, No existe o No aplica.","Si detectas algo, agenda la actualización con tu aseguradora, banco, AFORE o institución correspondiente.","¿Prefieres llenarlo en la computadora? Pídeme la versión en Excel editable."]:
        E.append(Paragraph("•  " + t, styN))
    E.append(Spacer(1, 4*mm))
    E.append(band("Datos generales", stySec, RED))
    E.append(Spacer(1, 1*mm))
    for lab in ["Nombre completo: ______________________________________________","Fecha de revisión: ___________________   Estado civil: ___________________","Hijos o dependientes económicos: _______________________________________","Persona de contacto de confianza: ______________________________________","Asesor / agente / abogado / notario: ____________________________________"]:
        E.append(Paragraph(lab, styN)); E.append(Spacer(1, 1*mm))
    E.append(Spacer(1, 3*mm))
    for title, items, dd in SECS:
        block = [band(title, stySec, RED), Spacer(1, 1.5*mm), checklist(items)]
        if dd: block += [Spacer(1, 1*mm), Paragraph("Documentos a tener a la mano: " + dd, styDocs)]
        block.append(Spacer(1, 4*mm))
        E.append(KeepTogether(block))
    E.append(Spacer(1, 2*mm))
    E.append(band("La protección patrimonial no depende solo de tener productos financieros, sino de tenerlos bien coordinados.", stySub, GOLD, pad=6))
    E.append(Spacer(1, 3*mm))
    E.append(band("¿Detectaste algo que actualizar? Te ayudo a diseñar y alinear tu estrategia patrimonial.  ·  iriatalan.com.mx", styCTA, ZEBRA, pad=8))
    doc.build(E)
    print("OK PDF:", path)

build(r"C:\Users\iriat\Downloads\check-up-patrimonial-beneficiarios.pdf")
