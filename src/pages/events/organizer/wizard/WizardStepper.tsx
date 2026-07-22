import { Check, LucideIcon } from 'lucide-react';

export interface WizardStep {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface WizardStepperProps {
    steps: WizardStep[];
    currentIndex: number;
    unlocked: boolean;
    onSelect: (index: number) => void;
}

export default function WizardStepper({ steps, currentIndex, unlocked, onSelect }: WizardStepperProps) {
    return (
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {steps.map((step, i) => {
                const isCurrent = i === currentIndex;
                const isDone = i < currentIndex;
                const isDisabled = i > 0 && !unlocked;
                const Icon = step.icon;
                return (
                    <button
                        key={step.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onSelect(i)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm text-left whitespace-nowrap transition-colors flex-shrink-0 md:flex-shrink ${
                            isCurrent
                                ? 'bg-primary/15 text-primary font-medium'
                                : isDisabled
                                    ? 'text-muted-foreground/40 cursor-not-allowed'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                        }`}
                    >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isDone ? 'bg-primary text-primary-foreground' : isCurrent ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>
                            {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                        </span>
                        {step.label}
                    </button>
                );
            })}
        </nav>
    );
}
