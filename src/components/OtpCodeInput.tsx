import { useRef } from 'react';

interface OtpCodeInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    error?: boolean;
    autoFocus?: boolean;
}

export default function OtpCodeInput({ value, onChange, length = 6, disabled, error, autoFocus }: OtpCodeInputProps) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = Array.from({ length }, (_, i) => value[i] || '');

    const setDigit = (index: number, raw: string) => {
        const digit = raw.replace(/\D/g, '').slice(-1);
        const next = digits.slice();
        next[index] = digit;
        onChange(next.join(''));
        if (digit && index < length - 1) inputs.current[index + 1]?.focus();
    };

    const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < length - 1) inputs.current[index + 1]?.focus();
    };

    const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (!pasted) return;
        e.preventDefault();
        onChange(pasted);
        const focusIndex = Math.min(pasted.length, length - 1);
        inputs.current[focusIndex]?.focus();
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={el => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    autoFocus={autoFocus && i === 0}
                    onChange={e => setDigit(i, e.target.value)}
                    onKeyDown={e => onKeyDown(i, e)}
                    onPaste={onPaste}
                    className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold rounded-xl bg-secondary border-2 transition-colors focus:outline-none focus:border-primary disabled:opacity-50 ${
                        error ? 'border-destructive text-destructive' : 'border-border text-foreground'
                    }`}
                />
            ))}
        </div>
    );
}
