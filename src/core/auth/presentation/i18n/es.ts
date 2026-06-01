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
} as const satisfies AuthDictTranslated;

export default dict;
