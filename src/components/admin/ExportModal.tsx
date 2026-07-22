import React, { useState } from 'react';
import { X, Download, FileText, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any[];
    fields: { id: string; label: string }[];
    onExportCSV: (selectedFields: string[]) => void;
}

export default function ExportModal({ isOpen, onClose, title, data, fields, onExportCSV }: ExportModalProps) {
    const [selectedFields, setSelectedFields] = useState<string[]>(fields.map(f => f.id));
    const [format, setFormat] = useState<'csv' | 'pdf'>('csv');

    if (!isOpen) return null;

    const toggleField = (fieldId: string) => {
        setSelectedFields(prev => 
            prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]
        );
    };

    const handleExport = () => {
        if (format === 'csv') {
            onExportCSV(selectedFields);
        } else {
            generatePDF();
        }
        onClose();
    };

    const generatePDF = () => {
        const doc = new jsPDF() as any;
        const tableColumn = fields.filter(f => selectedFields.includes(f.id)).map(f => f.label);
        const tableRows = data.map(item => {
            return fields.filter(f => selectedFields.includes(f.id)).map(f => {
                const value = f.id.split('.').reduce((obj, key) => obj?.[key], item);
                return value === null || value === undefined ? '-' : String(value);
            });
        });

        doc.text(title, 14, 15);
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [255, 51, 102] }, // Ignite pink
        });

        doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Export Data</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Format Selection */}
                    <div>
                        <Label className="text-sm font-medium mb-3 block">Select Format</Label>
                        <RadioGroup value={format} onValueChange={(v: any) => setFormat(v)} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="csv" id="csv" />
                                <Label htmlFor="csv" className="flex items-center gap-1.5 cursor-pointer">
                                    <Table className="w-4 h-4 text-green-400" /> CSV
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pdf" id="pdf" />
                                <Label htmlFor="pdf" className="flex items-center gap-1.5 cursor-pointer">
                                    <FileText className="w-4 h-4 text-red-400" /> PDF
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Field Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium">Select Fields</Label>
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" 
                                onClick={() => setSelectedFields(selectedFields.length === fields.length ? [] : fields.map(f => f.id))}>
                                {selectedFields.length === fields.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {fields.map(field => (
                                <div key={field.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={field.id} 
                                        checked={selectedFields.includes(field.id)}
                                        onCheckedChange={() => toggleField(field.id)}
                                    />
                                    <Label htmlFor={field.id} className="text-sm cursor-pointer truncate">{field.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button className="w-full gap-2" disabled={selectedFields.length === 0} onClick={handleExport}>
                            <Download className="w-4 h-4" />
                            Download {format.toUpperCase()}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
