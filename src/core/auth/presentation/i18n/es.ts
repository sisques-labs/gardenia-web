import type { AuthDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type AuthDictTranslated = WidenStringLiterals<AuthDict>;

const dict = {
  login: {
    title: 'Iniciar sesión',
    eyebrow: '✦ Bienvenida de vuelta',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Mín. 6 caracteres',
    submit: 'Iniciar sesión',
    submitting: 'Iniciando sesión...',
    invalidCredentials: 'Correo o contraseña incorrectos',
    keepSession: 'Mantener sesión iniciada en este equipo',
    emailInvalid: 'Correo electrónico no válido',
    passwordMin: 'Mínimo 6 caracteres',
    forgotPassword: '¿Olvidaste tu contraseña?',
    register: '¿No tienes cuenta? Regístrate',
    oauthFailed: 'No pudimos iniciarte sesión con ese proveedor. Usá tu correo y contraseña, o probá con otro proveedor.',
  },
  callback: {
    finishing: 'Finalizando inicio de sesión…',
  },
  register: {
    title: 'Crear cuenta',
    eyebrow: '✦ Empieza gratis',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Mín. 6 caracteres',
    passwordHint: 'Mínimo 8 caracteres.',
    confirmPassword: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Repite tu contraseña',
    submit: 'Crear cuenta',
    submitting: 'Creando cuenta...',
    error: 'No se pudo crear la cuenta. Inténtalo de nuevo.',
    emailInvalid: 'Correo electrónico no válido',
    passwordMin: 'Mínimo 6 caracteres',
    passwordsMismatch: 'Las contraseñas no coinciden',
    login: '¿Ya tienes cuenta? Inicia sesión',
    terms: 'Al continuar, aceptas nuestros Términos de servicio y Política de privacidad.',
  },
  forgotPassword: {
    eyebrow: 'Recuperar contraseña',
    title: '¿Olvidaste tu contraseña?',
    sub: 'Introduce tu correo y te enviaremos un enlace para restablecerla.',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    submit: 'Enviar enlace',
    submitting: 'Enviando...',
    successTitle: 'Revisa tu bandeja de entrada',
    successBody: 'Si existe una cuenta con ese correo, recibirás un enlace de recuperación en breve.',
    backToLogin: 'Volver a iniciar sesión',
    emailInvalid: 'Correo electrónico no válido',
    socialHint: '¿Te registraste con Google o Apple? Usa el botón de inicio de sesión social.',
  },
  brandPanel: {
    tagline: 'cuaderno de huertas',
    quote: '"Planta algo. Riégalo. Míralo crecer."',
    stats: 'GitHub ★ · MIT · sin anuncios',
  },
} as const satisfies AuthDictTranslated;

export default dict;
