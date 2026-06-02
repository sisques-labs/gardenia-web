import type { AuthDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type AuthDictTranslated = WidenStringLiterals<AuthDict>;

const dict = {
  login: {
    title: 'Iniciar sesión',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Mín. 6 caracteres',
    submit: 'Iniciar sesión',
    submitting: 'Iniciando sesión...',
    invalidCredentials: 'Correo o contraseña incorrectos',
    emailInvalid: 'Correo electrónico no válido',
    passwordMin: 'Mínimo 6 caracteres',
  },
  register: {
    title: 'Crear cuenta',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Mín. 6 caracteres',
    confirmPassword: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Repite tu contraseña',
    submit: 'Crear cuenta',
    submitting: 'Creando cuenta...',
    error: 'No se pudo crear la cuenta. Inténtalo de nuevo.',
    emailInvalid: 'Correo electrónico no válido',
    passwordMin: 'Mínimo 6 caracteres',
    passwordsMismatch: 'Las contraseñas no coinciden',
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
} as const satisfies AuthDictTranslated;

export default dict;
