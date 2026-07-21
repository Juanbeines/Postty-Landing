export default function PrivacyContent() {
  return (
    <>
      <p className="text-xs text-[#0D1522]/50 mb-4">Última actualización: 21 de julio de 2026</p>

      <h2>Responsable del tratamiento</h2>
      <p>Postty es una marca registrada, titularidad de Darío Soria, con domicilio en Manuel Basavilbaso 4103, Olivos (CP 1636), Partido de Vicente López, Provincia de Buenos Aires, Argentina. El responsable del tratamiento de tus datos personales es Darío Soria (Postty), con quien podés comunicarte para cualquier consulta al correo indicado a continuación.</p>
      <p>Correo electrónico de contacto: <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a></p>

      <h2>Datos que recopilamos</h2>
      <ul>
        <li><strong>Autenticación:</strong> UID Firebase, email, nombre, foto (vía Google Sign-In)</li>
        <li><strong>Tienda:</strong> URL, productos, precios, imágenes (scraping automático)</li>
        <li><strong>Marca:</strong> Colores, tipografías, tono, logo (análisis de tu sitio)</li>
        <li><strong>Campañas:</strong> Borradores, conversaciones con IA, piezas generadas</li>
        <li><strong>Pagos:</strong> ID de suscripción, plan, estado (MercadoPago)</li>
        <li><strong>Uso:</strong> Contadores, feedback, calificaciones</li>
        <li><strong>Contacto por WhatsApp (opcional):</strong> si nos escribís por WhatsApp, recibimos tu número de teléfono y tu nombre de perfil en nuestra bandeja de WhatsApp Business. No exportamos estos datos a ningún CRM ni los conservamos más allá de la conversación.</li>
        <li><strong>Cuentas publicitarias conectadas (opcional):</strong> cuando conectás tu cuenta de Meta Ads o Google Ads, almacenamos los tokens de acceso (cifrados con AES-256), los IDs de las cuentas publicitarias autorizadas, y metadatos de las campañas que gestionás desde Postty (estructura, presupuesto, métricas de rendimiento). Estos datos se procesan únicamente para operaciones que iniciás vos desde la plataforma.</li>
        <li><strong>Perfiles de Instagram y Meta conectados (opcional):</strong> si conectás tus cuentas de Instagram y Meta para personalizar el contenido y los anuncios, accedemos a la información de tu perfil necesaria para ese fin (datos de la cuenta y publicaciones). Si preferís no conectarlas, Postty genera a partir de la URL de tu sitio web, con un menor grado de personalización.</li>
      </ul>

      <h2>Finalidad del tratamiento</h2>
      <ul>
        <li>Prestar el servicio de generación de campañas</li>
        <li>Gestionar tu cuenta y suscripción</li>
        <li>Aplicar límites según tu plan</li>
        <li>Mejorar el servicio y corregir errores</li>
        <li>Comunicar actualizaciones y soporte</li>
      </ul>

      <h2>Base legal</h2>
      <ul>
        <li><strong>Ejecución de contrato:</strong> para prestarte el servicio</li>
        <li><strong>Consentimiento:</strong> al registrarte y aceptar los TyC</li>
        <li><strong>Interés legítimo:</strong> para mejorar el servicio y prevenir fraude</li>
      </ul>

      <h2>Servicios de terceros</h2>
      <ul>
        <li><strong>Firebase (Google):</strong> Autenticación de usuarios</li>
        <li><strong>Gemini (Google):</strong> IA conversacional, análisis multimodal y generación de scripts</li>
        <li><strong>Nano Banana (Google):</strong> Generación de imágenes publicitarias</li>
        <li><strong>ElevenLabs:</strong> Generación de voz para videos</li>
        <li><strong>MercadoPago:</strong> Procesamiento de pagos y suscripciones</li>
        <li><strong>Meta (Facebook e Instagram):</strong> Publicación de campañas publicitarias (opcional, solo si conectás tu cuenta)</li>
        <li><strong>Google Ads:</strong> Publicación de campañas publicitarias (opcional, solo si conectás tu cuenta)</li>
        <li><strong>Amazon Web Services (AWS):</strong> Alojamiento e infraestructura del servicio</li>
        <li><strong>Google Analytics (Google):</strong> Analítica de uso del sitio web (cookies)</li>
        <li><strong>Meta Pixel (Meta):</strong> Medición de conversiones publicitarias (cookies)</li>
        <li><strong>WhatsApp Business (Meta):</strong> Canal de contacto y atención (opcional, solo si nos escribís)</li>
      </ul>

      <h2>Integración con Google Ads API</h2>
      <p>Cuando conectás tu cuenta de Google Ads a Postty mediante OAuth 2.0, accedemos únicamente a los datos necesarios para operar campañas publicitarias en tu nombre. Los datos que accedemos, escribimos y almacenamos son:</p>
      <ul>
        <li><strong>Datos que accedemos (lectura):</strong> información de las cuentas de Google Ads a las que autorizás acceso (identificadores de cliente, moneda, zona horaria), estructura de campañas existentes (nombres, estado, presupuesto, segmentación a nivel general), métricas de rendimiento (impresiones, clics, conversiones, costo, tasa de clics), y recursos creativos previamente cargados en tu cuenta.</li>
        <li><strong>Datos que escribimos:</strong> creamos campañas publicitarias, subimos como recursos creativos las imágenes y videos generados por inteligencia artificial que vos aprobás explícitamente en la interfaz de Postty, creamos anuncios dentro de esas campañas, y pausamos o reanudamos campañas cuando lo indicás vos.</li>
        <li><strong>Datos que almacenamos:</strong> los tokens OAuth (cifrados con AES-256 antes de escribirse en la base de datos), los IDs de las cuentas autorizadas, y una copia de los metadatos de las campañas que creaste desde Postty para poder mostrarte tu historial y métricas dentro de nuestra interfaz.</li>
      </ul>
      <p><strong>Finalidad exclusiva:</strong> los datos accedidos vía Google Ads API se usan únicamente para ejecutar las acciones que vos autorizás desde la interfaz de Postty. No leemos datos de otras cuentas, no cruzamos datos entre usuarios distintos, ni compartimos ni vendemos esta información a terceros.</p>
      <p><strong>Revocación del acceso:</strong> podés revocar la autorización en cualquier momento desde (a) la configuración de tu cuenta en Postty, o (b) directamente desde tu cuenta de Google en <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>. La revocación es efectiva de forma inmediata: dejamos de poder llamar al API en tu nombre y los tokens almacenados se invalidan.</p>
      <p>El uso que Postty hace de la información recibida de las APIs de Google se adhiere a la <a href="https://developers.google.com/terms/api-services-user-data-policy">Política de Datos de Usuario de los Servicios API de Google</a>, incluyendo los requisitos de Uso Limitado.</p>

      <h2>Cookies y tecnologías de seguimiento</h2>
      <p>Nuestro sitio web utiliza cookies y tecnologías similares para analítica y medición publicitaria:</p>
      <ul>
        <li><strong>Google Analytics:</strong> mide el uso del sitio (páginas visitadas, origen del tráfico, dispositivo) mediante cookies.</li>
        <li><strong>Meta Pixel:</strong> mide las conversiones de nuestras campañas publicitarias. Puede almacenar en tu navegador un identificador de clic (fbclid) por hasta 90 días.</li>
      </ul>
      <p>Podés bloquear o eliminar las cookies desde la configuración de tu navegador; en ese caso, algunas funciones de medición dejarán de estar disponibles. Estas herramientas no afectan el funcionamiento de la aplicación ni la generación de contenido.</p>

      <h2>Almacenamiento y seguridad</h2>
      <ul>
        <li>Base de datos PostgreSQL con cifrado en tránsito</li>
        <li>Acceso restringido por roles</li>
        <li>No almacenamos datos de tarjetas (MercadoPago los gestiona)</li>
      </ul>

      <h2>Retención</h2>
      <ul>
        <li>Mientras tu cuenta esté activa</li>
        <li>30 días después de solicitar eliminación (para backup)</li>
        <li>Datos anonimizados pueden conservarse indefinidamente para análisis agregado</li>
      </ul>

      <h2>Transferencia internacional</h2>
      <p>Tus datos pueden procesarse en servidores de nuestros proveedores ubicados en Estados Unidos, Unión Europea y otras jurisdicciones donde operan Google (Firebase, Gemini, Nano Banana, Google Ads), Meta (Facebook, Instagram), ElevenLabs, MercadoPago y AWS. Todos estos proveedores cumplen con estándares reconocidos de protección de datos y contamos con las bases legales adecuadas para la transferencia internacional según la Ley 25.326 de Argentina.</p>

      <h2>Tus derechos (ARCO)</h2>
      <p>Tenés derecho a acceder, rectificar, suprimir y oponerte al tratamiento de tus datos.</p>

      <h3>Acceso</h3>
      <p>Podés solicitar qué datos personales tenemos sobre vos.</p>

      <h3>Rectificación</h3>
      <p>Podés pedir que corrijamos datos inexactos o incompletos.</p>

      <h3>Supresión (Cancelación)</h3>
      <p>Podés solicitar que eliminemos tus datos personales. Esto implica:</p>
      <ul>
        <li>Eliminación de tu cuenta</li>
        <li>Eliminación de campañas, borradores y piezas generadas</li>
        <li>Cancelación de suscripción activa (sin reembolso del período en curso)</li>
      </ul>
      <p>Excepciones: Podemos retener datos si existe obligación legal o para defensa en reclamos.</p>

      <h3>Oposición</h3>
      <p>Podés oponerte al tratamiento de tus datos para fines específicos (ej: comunicaciones de marketing).</p>

      <h3>Cómo ejercer tus derechos</h3>
      <ol>
        <li>Enviá un email a <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a> con asunto &quot;Solicitud ARCO&quot;</li>
        <li>Indicá: tu nombre, email de la cuenta, y qué derecho querés ejercer</li>
        <li>Te responderemos en un plazo máximo de 10 días hábiles</li>
        <li>Podemos pedirte verificación de identidad</li>
      </ol>

      <h2>Cambios</h2>
      <p>Notificaremos cambios por email o en la plataforma. El uso continuado implica aceptación.</p>

      <h2>Contacto</h2>
      <p>Correo electrónico: <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a></p>
      <p>Sitio web: <a href="https://posttyai.com">https://posttyai.com</a></p>

      <p className="mt-6 text-xs text-[#0D1522]/40">Autoridad de control: Si considerás que tus derechos no fueron respetados, podés reclamar ante la Agencia de Acceso a la Información Pública (AAIP) — <a href="https://www.argentina.gob.ar/aaip">https://www.argentina.gob.ar/aaip</a></p>
    </>
  );
}
