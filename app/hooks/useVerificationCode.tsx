import { useRef, useState } from 'react';

type UseVerificationCodeOptions = {
  length?: number;
  onSuccess?: (code: string) => void;
};

export function useVerificationCode({ length = 6, onSuccess }: UseVerificationCodeOptions = {}) {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const [error, setError] = useState('');

  const focusAt = (idx: number) => {
    const el = inputsRef.current[idx];
    if (el) el.focus();
  };

  const setRef = (el: HTMLInputElement | null, idx: number) => {
    if (!el) return;
    inputsRef.current[idx] = el;
  };

  const handleChange = (rawVal: string, idx: number) => {
    const raw = rawVal.replace(/[^0-9]/g, '');
    if (!raw && values[idx] === '') return;
    const char = raw.slice(-1) || '';
    const next = [...values];
    next[idx] = char;
    setValues(next);
    setError('');
    if (char && idx < length - 1) focusAt(idx + 1);
  };

  const handleKeyDown = (key: string, idx: number) => {
    if (key === 'Backspace') {
      if (values[idx] === '') {
        if (idx > 0) {
          const prev = [...values];
          prev[idx - 1] = '';
          setValues(prev);
          focusAt(idx - 1);
        }
      } else {
        const next = [...values];
        next[idx] = '';
        setValues(next);
      }
    } else if (key === 'ArrowLeft' && idx > 0) {
      focusAt(idx - 1);
    } else if (key === 'ArrowRight' && idx < length - 1) {
      focusAt(idx + 1);
    }
  };

  const handlePaste = (pasteText: string) => {
    const paste = pasteText.replace(/[^0-9]/g, '').slice(0, length);
    if (!paste) return;
    const next = Array(length).fill('');
    for (let i = 0; i < paste.length; i++) next[i] = paste[i];
    setValues(next);
    const focusIndex = Math.min(paste.length, length - 1);
    focusAt(focusIndex);
  };

  const getCode = () => values.join('');

  const validate = () => new RegExp(`^[0-9]{${length}}$`).test(getCode());

  const submit = () => {
    const code = getCode();
    if (!validate()) {
      setError(`Ingrese un código de ${length} dígitos`);
      return false;
    }
    if (onSuccess) onSuccess(code);
    return true;
  };

  const reset = () => {
    setValues(Array(length).fill(''));
    setError('');
    if (inputsRef.current[0]) inputsRef.current[0].focus();
  };

  return {
    length,
    values,
    error,
    inputsRef,
    setRef,
    handleChange,
    handleKeyDown,
    handlePaste,
    getCode,
    validate,
    submit,
    reset,
  } as const;
}

export default useVerificationCode;
