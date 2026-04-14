export default function PrivacyContent() {
  return (
    <>
      <p className="text-xs text-[#0D1522]/50 mb-4">Última actualización: 13 de marzo de 2026</p>

      <h2>Responsable del tratamiento</h2>
      <p>Juan Martin Beines Furcada, con domicilio en Echeverria 1200, CP 1617, Buenos Aires, Argentina.</p>
      <p>Correo electrónico: <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a></p>

      <h2>Datos que recopilamos</h2>
      <ul>
        <li><strong>Autenticación:</strong> UID Firebase, email, nombre, foto (vía Google Sign-In)</li>
        <li><strong>Tienda:</strong> URL, productos, precios, imágenes (scraping automático)</li>
        <li><strong>Marca:</strong> Colores, tipografías, tono, logo (análisis de tu sitio)</li>
        <li><strong>Campañas:</strong> Borradores, conversaciones con IA, piezas generadas</li>
        <li><strong>Pagos:</strong> ID de suscripción, plan, estado (MercadoPago)</li>
        <li><strong>Uso:</strong> Contadores, feedback, calificaciones</li>
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
        <li><strong>Firebase (Google):</strong> Autenticación</li>
        <li><strong>Gemini (Google):</strong> IA conversacional y análisis</li>
        <li><strong>Nano Banana (Google):</strong> Generación de imágenes</li>
        <li><strong>MercadoPago:</strong> Pagos y suscripciones</li>
        <li><strong>Meta:</strong> Publicación de ads (opcional)</li>
      </ul>

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
      <p>Tus datos pueden procesarse en servidores de Google (EE.UU.) y otros países donde operan nuestros proveedores. Estos cumplen con estándares de protección adecuados.</p>

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
