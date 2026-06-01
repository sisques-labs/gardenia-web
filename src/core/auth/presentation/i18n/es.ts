import type { AuthDict } from './en';
import type { WidenStringLiterals } from '@/shared/i18n/widen-literals';

type AuthDictTranslated = WidenStringLiterals<AuthDict>;

const dict = {
  login: {
    title: 'Iniciar sesión',
    email: 'Email',
    emailPlaceholder: 'vos@ejemplo.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Mín. 6 caracteres',
    submit: 'Ingresar',
    submitting: 'Ingresando...',
    invalidCredentials: 'Email o contraseña incorrectos',
    emailInvalid: 'Email inválido',
    passwordMin: 'Mínimo 6 caracteres',
  },
  register: {
    title: 'Crear cuenta',
    email: 'Email',
    emailPlaceholder: 'vos@ejemplo.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Mín. 6 caracteres',
    confirmPassword: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Repetí tu contraseña',
    submit: 'Crear cuenta',
    submitting: 'Creando cuenta...',
    error: 'No se pudo crear la cuenta. Intentá de nuevo.',
    emailInvalid: 'Email inválido',
    passwordMin: 'Mínimo 6 caracteres',
    passwordsMismatch: 'Las contraseñas no coinciden',
  },
} as const satisfies AuthDictTranslated;

export default dict;
