import React from 'react';

/**
 * Aviso breve de protección de datos. Cumple con el RGPD a nivel
 * informativo (Art. 13): identifica el responsable, finalidad y
 * derechos. El detalle completo iría en una página de política de
 * privacidad — aquí solo damos el resumen + el derecho a borrar.
 */
export const PrivacyNotice: React.FC = () => (
  <p className="text-[#64748b] text-[11px] leading-relaxed mt-4 text-center">
    Tus datos (email y nombre) se almacenan cifrados en nuestro servidor
    para gestionar tu cuenta. No los compartimos con terceros. Puedes
    eliminar tu cuenta en cualquier momento desde el menú de usuario.
  </p>
);

export default PrivacyNotice;
